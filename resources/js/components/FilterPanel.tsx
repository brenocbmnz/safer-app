import { ChevronDown, ChevronUp, Filter, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AMENITIES_LABELS, CATEGORY_OPTIONS, RATING_OPTIONS } from '@/config/options';
import type { Amenidade, CategoriaLugar, PlaceFilters } from '@/types/place';

type Props = {
    filters: PlaceFilters;
    onChange: (filters: PlaceFilters) => void;
};

export function FilterPanel({ filters, onChange }: Props) {
    const [expanded, setExpanded] = useState(false);

    const activeCount =
        (filters.categoria && filters.categoria !== 'todos' ? 1 : 0) +
        (filters.amenidades?.length ?? 0) +
        (filters.notaMinima ? 1 : 0);

    const handleCategoria = (value: CategoriaLugar | 'todos') => {
        onChange({ ...filters, categoria: value });
    };

    const handleAmenidade = (amenidade: Amenidade) => {
        const current = filters.amenidades ?? [];
        const updated = current.includes(amenidade)
            ? current.filter((a) => a !== amenidade)
            : [...current, amenidade];
        onChange({ ...filters, amenidades: updated });
    };

    const handleNota = (value: number) => {
        onChange({ ...filters, notaMinima: value || undefined });
    };

    const handleClear = () => {
        onChange({ ...filters, categoria: 'todos', amenidades: [], notaMinima: undefined });
    };

    return (
        <div className="rounded-xl border bg-card shadow-sm">
            <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="flex w-full items-center justify-between gap-2 px-4 py-3"
            >
                <div className="flex items-center gap-2">
                    <SlidersHorizontal size={16} />
                    <span className="text-sm font-medium">Filtros</span>
                    {activeCount > 0 && (
                        <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                            {activeCount}
                        </Badge>
                    )}
                </div>
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {expanded && (
                <div className="space-y-4 border-t px-4 py-4">
                    {/* Categoria */}
                    <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Categoria
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {CATEGORY_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => handleCategoria(opt.value)}
                                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                                        filters.categoria === opt.value ||
                                        (!filters.categoria && opt.value === 'todos')
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-border bg-background hover:bg-accent'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Nota mínima */}
                    <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Nota mínima
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {RATING_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => handleNota(opt.value)}
                                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                                        (filters.notaMinima ?? 0) === opt.value
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-border bg-background hover:bg-accent'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Amenidades */}
                    <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Características
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {(
                                Object.entries(AMENITIES_LABELS) as [Amenidade, string][]
                            ).map(([key, label]) => {
                                const active = filters.amenidades?.includes(key);
                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => handleAmenidade(key)}
                                        className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                                            active
                                                ? 'border-primary bg-primary text-primary-foreground'
                                                : 'border-border bg-background hover:bg-accent'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {activeCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClear}
                            className="gap-1.5 text-xs"
                        >
                            <X size={12} />
                            Limpar filtros
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
