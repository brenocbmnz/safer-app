import { Edit, MapPin, MessageSquare, Phone, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FavoriteButton } from '@/components/FavoriteButton';
import { AMENITIES_LABELS, CATEGORY_OPTIONS } from '@/config/options';
import { usePlaceDetails } from '@/hooks/usePlaceDetails';
import type { Amenidade } from '@/types/place';

type Props = {
    placeId: string | null;
    onClose: () => void;
    onAddReview?: (placeId: string) => void;
    onEdit?: (placeId: string) => void;
};

export function PlaceDetailPanel({ placeId, onClose, onAddReview, onEdit }: Props) {
    const { lugar, carregando, erro } = usePlaceDetails(placeId);

    const catLabel = CATEGORY_OPTIONS.find((o) => o.value === lugar?.categoria)?.label ?? lugar?.categoria ?? '';

    return (
        <Dialog open={placeId !== null} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {carregando ? 'Carregando...' : (lugar?.nome ?? 'Detalhes do Local')}
                    </DialogTitle>
                </DialogHeader>

                {carregando ? (
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-5 animate-pulse rounded bg-muted" />
                        ))}
                    </div>
                ) : !lugar ? (
                    <div className="flex flex-col items-center gap-2 py-4 text-center text-muted-foreground">
                        <p className="text-sm font-medium text-destructive">
                            {erro ?? 'Não foi possível carregar os detalhes.'}
                        </p>
                        <p className="text-xs">Tente fechar e abrir novamente.</p>
                    </div>
                ) : (
                    <div>
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">{catLabel}</span>

                        {lugar.descricao && (
                            <p className="mt-3 text-sm text-muted-foreground">{lugar.descricao}</p>
                        )}

                        <div className="mt-3 flex items-center gap-1.5">
                            <Star size={14} className={lugar.mediaNota ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'} />
                            {lugar.mediaNota !== null ? (
                                <span className="text-sm font-medium">{lugar.mediaNota.toFixed(1)}</span>
                            ) : (
                                <span className="text-sm text-muted-foreground">Sem avaliações</span>
                            )}
                            {lugar.totalAvaliacoes > 0 && (
                                <span className="text-xs text-muted-foreground">({lugar.totalAvaliacoes})</span>
                            )}
                        </div>

                        {lugar.endereco && (
                            <div className="mt-3 flex items-start gap-2 text-sm">
                                <MapPin size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
                                <span>{lugar.endereco}</span>
                            </div>
                        )}

                        {lugar.contato && (
                            <div className="mt-2 flex items-start gap-2 text-sm">
                                <Phone size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
                                <span>{lugar.contato}</span>
                            </div>
                        )}

                        {lugar.amenidades.length > 0 && (
                            <div className="mt-4">
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Características
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {lugar.amenidades.map((a) => (
                                        <span
                                            key={a}
                                            className="rounded-full border bg-secondary px-2.5 py-1 text-xs"
                                        >
                                            {AMENITIES_LABELS[a as Amenidade] ?? a}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-4 flex gap-2">
                            <div className="flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5">
                                <FavoriteButton place={lugar} />
                                <span className="text-sm font-medium">
                                    Favorito
                                </span>
                            </div>
                            {onAddReview && (
                                <Button
                                    className="flex-1 gap-2"
                                    onClick={() => onAddReview(lugar.id)}
                                >
                                    <MessageSquare size={14} />
                                    Avaliar
                                </Button>
                            )}
                        </div>

                        {onEdit && (
                            <Button
                                variant="outline"
                                className="mt-2 w-full gap-2"
                                onClick={() => onEdit(lugar.id)}
                            >
                                <Edit size={14} />
                                Editar Local
                            </Button>
                        )}

                        {lugar.avaliacoes.length > 0 && (
                            <div className="mt-5">
                                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Avaliações
                                </p>
                                <div className="flex flex-col gap-3">
                                    {lugar.avaliacoes.map((r) => (
                                        <div key={r.id} className="rounded-lg border p-3">
                                            <div className="mb-1 flex items-center gap-1">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={12}
                                                        className={i < r.nota ? 'fill-amber-400 text-amber-400' : 'text-muted'}
                                                    />
                                                ))}
                                            </div>
                                            {r.comentario && (
                                                <p className="text-sm">{r.comentario}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

