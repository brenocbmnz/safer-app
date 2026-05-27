import { Heart, MapPin, Star } from 'lucide-react';
import { CATEGORY_OPTIONS } from '@/config/options';
import type { Place } from '@/types/place';

type Props = {
    lugares: Place[];
    selecionadoId: string | null;
    onSelect: (id: string) => void;
    carregando?: boolean;
};

function StarRating({ nota, total }: { nota: number | null; total: number }) {
    if (nota === null || total === 0) {
        return <span className="text-xs text-muted-foreground">Sem avaliações</span>;
    }
    return (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star size={11} className="fill-amber-400 text-amber-400" />
            {nota.toFixed(1)} ({total})
        </span>
    );
}

export function PlaceList({ lugares, selecionadoId, onSelect, carregando }: Props) {
    if (carregando) {
        return (
            <div className="flex flex-col gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-20 animate-pulse rounded-xl bg-muted"
                    />
                ))}
            </div>
        );
    }

    if (lugares.length === 0) {
        return (
            <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                <MapPin size={28} strokeWidth={1.5} />
                <p className="text-sm">Nenhum local encontrado</p>
            </div>
        );
    }

    const getCategoryLabel = (cat: string) =>
        CATEGORY_OPTIONS.find((o) => o.value === cat)?.label ?? cat;

    return (
        <div className="flex flex-col gap-2">
            {lugares.map((lugar) => (
                <button
                    key={lugar.id}
                    type="button"
                    onClick={() => onSelect(lugar.id)}
                    className={`w-full rounded-xl border p-3 text-left transition-all hover:shadow-md ${
                        selecionadoId === lugar.id
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'border-border bg-card'
                    }`}
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

                    <div className="mt-2 flex items-center justify-between">
                        <StarRating nota={lugar.mediaNota} total={lugar.totalAvaliacoes} />
                        {lugar.amenidades.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                                {lugar.amenidades.length} características
                            </span>
                        )}
                    </div>
                </button>
            ))}
        </div>
    );
}
