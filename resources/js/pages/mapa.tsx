import { Head } from '@inertiajs/react';
import { AlertCircle, Crosshair, Loader2, PlusCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SaferAppLayout } from '@/layouts/safer-app-layout';
import { FilterPanel } from '@/components/FilterPanel';
import { PlaceDetailPanel } from '@/components/PlaceDetailPanel';
import { PlaceFormModal } from '@/components/PlaceFormModal';
import { PlaceList } from '@/components/PlaceList';
import { PlacesMap } from '@/components/PlacesMap';
import { ReviewFormModal } from '@/components/ReviewFormModal';
import { usePlaceDetails } from '@/hooks/usePlaceDetails';
import { usePlaces } from '@/hooks/usePlaces';
import { buscarDetalhesGoogle, buscarLugaresGoogle } from '@/services/placeApi';
import type {
    GooglePlaceSuggestion,
    Place,
    PlaceFilters,
    ViewportBounds,
} from '@/types/place';

const DEFAULT_COORDS = { latitude: -28.6775, longitude: -49.3692 };
const INITIAL_FILTERS: PlaceFilters = {
    categoria: 'todos',
    amenidades: [],
    busca: '',
};

const GOOGLE_TYPE_BY_CATEGORY: Record<string, string> = {
    cafe: 'cafe',
    bar: 'bar',
    saude: 'hospital',
    educacao: 'school',
    cultura: 'museum',
    servico: 'store',
};

type MapViewportCommand = {
    id: number;
    center: [number, number];
    zoom?: number;
    animate?: boolean;
};

type FeedbackState = { tipo: 'sucesso' | 'erro'; texto: string } | null;

function toRadians(v: number) {
    return (v * Math.PI) / 180;
}

function calcRadius(
    bounds: ViewportBounds,
    center: { latitude: number; longitude: number },
): number {
    const R = 6371000;
    const lat1 = toRadians(center.latitude);
    const lat2 = toRadians(bounds.norte);
    const dLat = toRadians(bounds.norte - center.latitude);
    const dLng = toRadians(bounds.leste - center.longitude);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return Math.round(Math.min(Math.max(2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)), 100), 50000));
}

export default function Mapa() {
    const [filtros, setFiltros] = useState<PlaceFilters>(INITIAL_FILTERS);
    const [mapViewport, setMapViewport] = useState<{
        bounds: ViewportBounds;
        center: { latitude: number; longitude: number };
    } | null>(null);
    const [selecionadoId, setSelecionadoId] = useState<string | null>(null);
    const [viewportCommand, setViewportCommand] = useState<MapViewportCommand | null>(null);
    const [sugestoesGoogle, setSugestoesGoogle] = useState<GooglePlaceSuggestion[]>([]);
    const [formOpen, setFormOpen] = useState(false);
    const [formCoords, setFormCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [formGooglePlace, setFormGooglePlace] = useState<GooglePlaceSuggestion | null>(null);
    const [reviewOpen, setReviewOpen] = useState(false);
    const [reviewPlaceId, setReviewPlaceId] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<FeedbackState>(null);
    const [buscandoGoogle, setBuscandoGoogle] = useState(false);
    const cmdCounter = useRef(0);

    const { lugares, carregando, recarregar } = usePlaces(filtros);

    // Google Places search when viewport/filters change
    useEffect(() => {
        if (!mapViewport) return;

        const { categoria } = filtros;
        if (!categoria || categoria === 'todos') {
            setSugestoesGoogle([]);
            return;
        }

        const tipo = GOOGLE_TYPE_BY_CATEGORY[categoria];
        if (!tipo) return;

        const { center, bounds } = mapViewport;
        const raio = calcRadius(bounds, center);

        setBuscandoGoogle(true);
        buscarLugaresGoogle({
            latitude: center.latitude,
            longitude: center.longitude,
            raio,
            tipo,
        })
            .then((results) => setSugestoesGoogle(results))
            .catch(() => setSugestoesGoogle([]))
            .finally(() => setBuscandoGoogle(false));
    }, [mapViewport, filtros]);

    const handleViewportChange = useCallback(
        (payload: {
            type: 'init' | 'move';
            bounds: ViewportBounds;
            center: { latitude: number; longitude: number };
            zoom: number;
        }) => {
            setMapViewport({ bounds: payload.bounds, center: payload.center });
        },
        [],
    );

    const handleSelectPlace = useCallback((id: string) => {
        setSelecionadoId((prev) => (prev === id ? null : id));
    }, []);

    const handleMapClick = useCallback((lat: number, lng: number) => {
        setFormGooglePlace(null);
        setFormCoords({ lat, lng });
        setFormOpen(true);
    }, []);

    const handleLocateMe = () => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                cmdCounter.current += 1;
                setViewportCommand({
                    id: cmdCounter.current,
                    center: [pos.coords.latitude, pos.coords.longitude],
                    zoom: 15,
                    animate: true,
                });
            },
            () => {
                setFeedback({ tipo: 'erro', texto: 'Não foi possível obter sua localização.' });
                setTimeout(() => setFeedback(null), 3000);
            },
        );
    };

    const handleGooglePlaceSelect = useCallback(async (sug: GooglePlaceSuggestion) => {
        setBuscandoGoogle(true);
        let resolved: GooglePlaceSuggestion | null = sug.nome ? sug : null;
        let coords = { lat: sug.latitude, lng: sug.longitude };

        try {
            const detalhes = await buscarDetalhesGoogle(sug.placeId);
            resolved = {
                ...sug,
                nome: sug.nome || detalhes.nome,
                endereco: sug.endereco || detalhes.endereco,
                latitude: detalhes.latitude || sug.latitude,
                longitude: detalhes.longitude || sug.longitude,
                tipos: sug.tipos.length > 0 ? sug.tipos : detalhes.tipos,
                telefone: detalhes.telefone,
            };
            coords = {
                lat: detalhes.latitude || sug.latitude,
                lng: detalhes.longitude || sug.longitude,
            };
        } catch {
            if (!sug.nome) {
                setFeedback({ tipo: 'erro', texto: 'Não foi possível carregar os dados do local do Google.' });
                setTimeout(() => setFeedback(null), 4000);
            }
        } finally {
            setBuscandoGoogle(false);
        }

        setFormGooglePlace(resolved);
        setFormCoords(coords);
        setFormOpen(true);
    }, []);

    return (
        <SaferAppLayout>
            <Head title="Mapa — Safer" />

            <div className="flex h-[calc(100vh-4rem)] flex-col">
                {/* Search bar / filter */}
                <div className="p-3">
                    <div className="flex items-center gap-2">
                        <div className="flex-1">
                            <input
                                type="search"
                                placeholder="Buscar locais..."
                                value={filtros.busca ?? ''}
                                onChange={(e) =>
                                    setFiltros((prev) => ({ ...prev, busca: e.target.value }))
                                }
                                className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleLocateMe}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-background shadow-sm hover:bg-accent"
                            title="Minha localização"
                        >
                            <Crosshair size={16} />
                        </button>
                    </div>

                    <div className="mt-2">
                        <FilterPanel filters={filtros} onChange={setFiltros} />
                    </div>
                </div>

                {/* Feedback toast */}
                {feedback && (
                    <div
                        className={`mx-3 mb-2 flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${
                            feedback.tipo === 'erro'
                                ? 'bg-destructive/10 text-destructive'
                                : 'bg-green-500/10 text-green-700'
                        }`}
                    >
                        <AlertCircle size={14} />
                        {feedback.texto}
                    </div>
                )}

                {/* Map + list split */}
                <div className="flex min-h-0 flex-1 flex-col gap-3 px-3 pb-3 lg:flex-row">
                    {/* Map */}
                    <div className="relative flex-1 overflow-hidden rounded-2xl border shadow-sm" style={{ minHeight: '300px' }}>
                        <PlacesMap
                            lugares={lugares}
                            selecionadoId={selecionadoId}
                            onSelect={handleSelectPlace}
                            onMapClick={handleMapClick}
                            onViewportChange={handleViewportChange}
                            viewportCommand={viewportCommand}
                            sugestoesGoogle={sugestoesGoogle}
                            onGooglePlaceSelect={handleGooglePlaceSelect}
                        />

                        {/* Add place FAB */}
                        <button
                            type="button"
                            onClick={() => setFormOpen(true)}
                            className="absolute right-3 bottom-3 flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-lg hover:opacity-90"
                        >
                            <PlusCircle size={16} />
                            Adicionar local
                        </button>

                        {(carregando || buscandoGoogle) && (
                            <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-xs shadow backdrop-blur-sm">
                                <Loader2 size={12} className="animate-spin" />
                                {buscandoGoogle ? 'Buscando no Google...' : 'Carregando...'}
                            </div>
                        )}
                    </div>

                    {/* Place list (desktop sidebar / mobile below map) */}
                    <div className="max-h-64 overflow-y-auto lg:max-h-none lg:w-80 lg:overflow-y-auto">
                        <PlaceList
                            lugares={lugares}
                            selecionadoId={selecionadoId}
                            onSelect={handleSelectPlace}
                            carregando={carregando}
                        />
                    </div>
                </div>
            </div>

            <PlaceDetailPanel
                placeId={selecionadoId}
                onClose={() => setSelecionadoId(null)}
                onAddReview={(id) => {
                    setReviewPlaceId(id);
                    setReviewOpen(true);
                }}
            />

            <PlaceFormModal
                open={formOpen}
                onClose={() => {
                    setFormOpen(false);
                    setFormCoords(null);
                    setFormGooglePlace(null);
                }}
                latitude={formCoords?.lat ?? mapViewport?.center.latitude ?? DEFAULT_COORDS.latitude}
                longitude={formCoords?.lng ?? mapViewport?.center.longitude ?? DEFAULT_COORDS.longitude}
                googlePlace={formGooglePlace}
                onCreated={() => {
                    recarregar();
                    setFeedback({ tipo: 'sucesso', texto: 'Local adicionado com sucesso!' });
                    setTimeout(() => setFeedback(null), 3000);
                }}
            />

            <ReviewFormModal
                open={reviewOpen}
                placeId={reviewPlaceId}
                onClose={() => {
                    setReviewOpen(false);
                    setReviewPlaceId(null);
                }}
                onCreated={() => {
                    setFeedback({ tipo: 'sucesso', texto: 'Avaliação enviada!' });
                    setTimeout(() => setFeedback(null), 3000);
                }}
            />
        </SaferAppLayout>
    );
}
