import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AMENITIES_LABELS, CATEGORY_OPTIONS } from '@/config/options';
import { criarLugar } from '@/services/placeApi';
import type { Amenidade, CategoriaLugar, GooglePlaceSuggestion } from '@/types/place';
import { loadGoogleMapsApi } from '@/utils/googleMapsLoader';

type Props = {
    open: boolean;
    onClose: () => void;
    /** Coordinates where the user clicked on the map */
    latitude: number;
    longitude: number;
    /** When clicking a Google Places suggestion, pre-fill the form */
    googlePlace?: GooglePlaceSuggestion | null;
    onCreated?: () => void;
};

const AMENIDADES = Object.entries(AMENITIES_LABELS) as [Amenidade, string][];

function categoryFromGoogleTypes(tipos: string[]): CategoriaLugar {
    if (tipos.some((t) => ['cafe', 'coffee_shop'].includes(t))) return 'cafe';
    if (tipos.some((t) => ['bar', 'night_club', 'liquor_store'].includes(t))) return 'bar';
    if (tipos.some((t) => ['hospital', 'doctor', 'health', 'pharmacy', 'dentist'].includes(t))) return 'saude';
    if (tipos.some((t) => ['school', 'university', 'library', 'book_store'].includes(t))) return 'educacao';
    if (tipos.some((t) => ['museum', 'art_gallery', 'movie_theater', 'theater'].includes(t))) return 'cultura';
    return 'outro';
}

export function PlaceFormModal({
    open,
    onClose,
    latitude,
    longitude,
    googlePlace,
    onCreated,
}: Props) {
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [categoria, setCategoria] = useState<CategoriaLugar>('outro');
    const [endereco, setEndereco] = useState('');
    const [contato, setContato] = useState('');
    const [amenidades, setAmenidades] = useState<Amenidade[]>([]);
    const [enviando, setEnviando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [enderecoPin, setEnderecoPin] = useState<string | null>(null);

    // Reset and pre-fill whenever the modal opens
    useEffect(() => {
        if (!open) {
            setEnderecoPin(null);
            return;
        }
        setErro(null);
        setAmenidades([]);
        setContato('');
        if (googlePlace) {
            setNome(googlePlace.nome);
            setDescricao('');
            setEndereco(googlePlace.endereco ?? '');
            setContato(googlePlace.telefone ?? '');
            setCategoria(categoryFromGoogleTypes(googlePlace.tipos));
            setEnderecoPin(googlePlace.endereco ?? '');
        } else {
            setNome('');
            setDescricao('');
            setEndereco('');
            setCategoria('outro');
            setEnderecoPin(null);
            loadGoogleMapsApi()
                .then(async (g) => {
                    const geocoder = new g.maps.Geocoder();
                    const { results } = await geocoder.geocode({
                        location: { lat: latitude, lng: longitude },
                    });
                    setEnderecoPin(results[0]?.formatted_address ?? '');
                })
                .catch(() => setEnderecoPin(''));
        }
    }, [open, googlePlace, latitude, longitude]);

    const toggleAmenidade = (a: Amenidade) => {
        setAmenidades((prev) =>
            prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a],
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErro(null);
        setEnviando(true);

        try {
            await criarLugar({
                nome,
                descricao: descricao || undefined,
                categoria,
                latitude,
                longitude,
                endereco: endereco || undefined,
                contato: contato || undefined,
                amenidades,
                google_place_id: googlePlace?.placeId,
            });
            onCreated?.();
            onClose();
        } catch {
            setErro('Erro ao salvar local. Tente novamente.');
        } finally {
            setEnviando(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {googlePlace ? `Adicionar "${googlePlace.nome}"` : 'Adicionar Local'}
                    </DialogTitle>
                </DialogHeader>

                {/* Pin location indicator */}
                <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                    <MapPin size={13} className="shrink-0 text-primary" />
                    <span>
                        {enderecoPin === null
                            ? 'Buscando localização...'
                            : enderecoPin !== ''
                              ? enderecoPin
                              : `Pin colocado em ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`}
                    </span>
                </div>

                {/* Google match badge */}
                {googlePlace && (
                    <div className="flex items-center gap-1.5 rounded-lg bg-blue-500/10 px-3 py-2 text-xs text-blue-600 dark:text-blue-400">
                        <a
                            href={`https://www.google.com/maps/place/?q=place_id:${googlePlace.placeId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold underline-offset-2 hover:underline"
                        >
                            Link para o Google Maps
                        </a>
                        {googlePlace.rating && (
                            <span className="ml-auto opacity-80">★ {googlePlace.rating.toFixed(1)}</span>
                        )}
                    </div>
                )}

                <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
                    {erro && (
                        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            {erro}
                        </p>
                    )}

                    <div>
                        <label className="mb-1 block text-sm font-medium">Nome *</label>
                        <input
                            required
                            minLength={3}
                            maxLength={255}
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Nome do local"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Descrição</label>
                        <textarea
                            maxLength={500}
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            rows={2}
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Breve descrição"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Categoria *</label>
                        <select
                            required
                            value={categoria}
                            onChange={(e) => setCategoria(e.target.value as CategoriaLugar)}
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            {CATEGORY_OPTIONS.filter((o) => o.value !== 'todos').map((o) => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Endereço</label>
                        <input
                            maxLength={255}
                            value={endereco}
                            onChange={(e) => setEndereco(e.target.value)}
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Rua, número, bairro"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Contato</label>
                        <input
                            maxLength={255}
                            value={contato}
                            onChange={(e) => setContato(e.target.value)}
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Telefone, site, redes sociais"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium">Características</label>
                        <div className="flex flex-wrap gap-1.5">
                            {AMENIDADES.map(([key, label]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => toggleAmenidade(key)}
                                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                                        amenidades.includes(key)
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-border bg-background hover:bg-accent'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" className="flex-1" disabled={enviando}>
                            {enviando ? 'Salvando...' : 'Salvar local'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
