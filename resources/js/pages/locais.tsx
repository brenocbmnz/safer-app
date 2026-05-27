import { Head, Link } from '@inertiajs/react';
import { Heart, Loader2, MapPin, Star, X } from 'lucide-react';
import { useState } from 'react';
import { SaferAppLayout } from '@/layouts/safer-app-layout';
import { PlaceDetailPanel } from '@/components/PlaceDetailPanel';
import { ReviewFormModal } from '@/components/ReviewFormModal';
import { usePlaces } from '@/hooks/usePlaces';
import { AMENITIES_LABELS, CATEGORY_OPTIONS } from '@/config/options';
import type { Amenidade, CategoriaLugar, PlaceFilters } from '@/types/place';

type Aba = 'todos' | 'favoritos';

const abas: Array<{ id: Aba; label: string }> = [
    { id: 'todos', label: 'Todos' },
    { id: 'favoritos', label: 'Favoritos' },
];

const AMENIDADES_OPCOES = Object.entries(AMENITIES_LABELS) as [Amenidade, string][];

export default function Locais() {
    const [abaAtiva, setAbaAtiva] = useState<Aba>('todos');
    const [selecionadoId, setSelecionadoId] = useState<string | null>(null);
    const [reviewPlaceId, setReviewPlaceId] = useState<string | null>(null);
    const [reviewOpen, setReviewOpen] = useState(false);
    const [filtroCategoria, setFiltroCategoria] = useState<CategoriaLugar | 'todos'>('todos');
    const [filtroAmenidades, setFiltroAmenidades] = useState<Amenidade[]>([]);

    const filters: PlaceFilters = {
        categoria: filtroCategoria,
        amenidades: filtroAmenidades,
    };

    const { lugares, carregando, erro } = usePlaces(filters);

    const getCategoryLabel = (cat: string) =>
        CATEGORY_OPTIONS.find((o) => o.value === cat)?.label ?? cat;

    const toggleAmenidade = (a: Amenidade) => {
        setFiltroAmenidades((prev) =>
            prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a],
        );
    };

    const hasActiveFilters = filtroCategoria !== 'todos' || filtroAmenidades.length > 0;

    const limparFiltros = () => {
        setFiltroCategoria('todos');
        setFiltroAmenidades([]);
    };

    return (
        <SaferAppLayout>
            <Head title="Locais — Safer" />

            <section className="px-4 pt-8 pb-6">
                <header className="mb-4">
                    <h1 className="text-2xl font-bold">Explore Locais</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Veja os locais melhor avaliados e encontre um espaço seguro.
                    </p>

                    <div className="mt-3 flex gap-2">
                        {abas.map((aba) => (
                            <button
                                key={aba.id}
                                type="button"
                                onClick={() => setAbaAtiva(aba.id)}
                                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                                    abaAtiva === aba.id
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-border bg-background hover:bg-accent'
                                }`}
                            >
                                {aba.label}
                            </button>
                        ))}
                    </div>
                </header>

                {/* Feature cards */}
                <div className="mb-5 grid grid-cols-2 gap-3">
                    <div className="relative col-span-2 flex flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 p-5 text-white">
                        <img
                            src="/design/Mapa Pride.png"
                            alt=""
                            className="absolute -right-4 -bottom-4 h-28 w-28 object-contain opacity-30"
                        />
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-wide opacity-80">
                                Destaque
                            </span>
                            <h2 className="mt-1 text-lg font-bold">Respire fundo e encontre equilíbrio</h2>
                        </div>
                        <Link
                            href="/mapa"
                            className="mt-3 self-start rounded-full border border-white/40 px-4 py-1.5 text-sm backdrop-blur-sm"
                        >
                            Ver mapa →
                        </Link>
                    </div>
                    <div className="rounded-xl border bg-card p-4 shadow-sm">
                        <h3 className="font-semibold">Locais Populares</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Espaços queridinhos da comunidade.
                        </p>
                    </div>
                    <div className="rounded-xl border bg-card p-4 shadow-sm">
                        <h3 className="font-semibold">Ao Ar Livre</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Parques e áreas verdes acolhedoras.
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-4 space-y-3">
                    {/* Category filter — tab bar style */}
                    <div className="flex overflow-x-auto border-b scrollbar-none">
                        {CATEGORY_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setFiltroCategoria(opt.value)}
                                className={`shrink-0 whitespace-nowrap px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                                    filtroCategoria === opt.value
                                        ? 'border-b-2 border-foreground text-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {/* Characteristics filter */}
                    <div>
                        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Características
                        </p>
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                            {AMENIDADES_OPCOES.map(([value, label]) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => toggleAmenidade(value)}
                                    className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                                        filtroAmenidades.includes(value)
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-border bg-background hover:bg-accent'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Clear filters */}
                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={limparFiltros}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X size={12} />
                            Limpar filtros
                        </button>
                    )}
                </div>

                {/* List section */}
                <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold">Perto de você</h2>
                    <Link href="/mapa" className="text-xs text-primary font-medium">
                        Ver mapa
                    </Link>
                </div>

                {erro && (
                    <p className="mb-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {erro}
                    </p>
                )}

                {abaAtiva === 'favoritos' ? (
                    <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                        <Heart size={28} strokeWidth={1.5} />
                        <p className="text-sm">Salve lugares favoritos para vê-los aqui.</p>
                    </div>
                ) : carregando ? (
                    <div className="flex justify-center py-10">
                        <Loader2 size={24} className="animate-spin text-muted-foreground" />
                    </div>
                ) : lugares.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                        <MapPin size={28} strokeWidth={1.5} />
                        <p className="text-sm">Nenhum local encontrado.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {lugares.map((lugar) => (
                            <button
                                key={lugar.id}
                                type="button"
                                onClick={() => setSelecionadoId(lugar.id)}
                                className="w-full rounded-xl border bg-card p-3 text-left shadow-sm transition-all hover:shadow-md"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold">{lugar.nome}</p>
                                        {lugar.endereco && (
                                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                                {lugar.endereco}
                                            </p>
                                        )}
                                    </div>
                                    <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs">
                                        {getCategoryLabel(lugar.categoria)}
                                    </span>
                                </div>
                                <div className="mt-2 flex items-center gap-1">
                                    <Star
                                        size={11}
                                        className={lugar.mediaNota ? 'fill-amber-400 text-amber-400' : 'text-muted'}
                                    />
                                    <span className="text-xs text-muted-foreground">
                                        {lugar.mediaNota !== null
                                            ? `${lugar.mediaNota.toFixed(1)} (${lugar.totalAvaliacoes})`
                                            : 'Sem avaliações'}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </section>

            <PlaceDetailPanel
                placeId={selecionadoId}
                onClose={() => setSelecionadoId(null)}
                onAddReview={(id) => {
                    setReviewPlaceId(id);
                    setReviewOpen(true);
                }}
            />

            <ReviewFormModal
                open={reviewOpen}
                placeId={reviewPlaceId}
                onClose={() => {
                    setReviewOpen(false);
                    setReviewPlaceId(null);
                }}
            />
        </SaferAppLayout>
    );
}
