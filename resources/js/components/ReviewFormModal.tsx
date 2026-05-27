import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AMENITIES_LABELS } from '@/config/options';
import { criarAvaliacao } from '@/services/placeApi';
import type { Amenidade } from '@/types/place';

type Props = {
    open: boolean;
    placeId: string | null;
    onClose: () => void;
    onCreated?: () => void;
};

const AMENIDADES = Object.entries(AMENITIES_LABELS) as [Amenidade, string][];

export function ReviewFormModal({ open, placeId, onClose, onCreated }: Props) {
    const [nota, setNota] = useState(0);
    const [comentario, setComentario] = useState('');
    const [marcadores, setMarcadores] = useState<Amenidade[]>([]);
    const [enviando, setEnviando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    const toggleMarcador = (a: Amenidade) => {
        setMarcadores((prev) =>
            prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a],
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!placeId || nota < 1 || nota > 5) return;

        setErro(null);
        setEnviando(true);

        try {
            await criarAvaliacao(placeId, {
                nota,
                comentario: comentario || undefined,
                marcadores,
            });
            onCreated?.();
            onClose();
            setNota(0);
            setComentario('');
            setMarcadores([]);
        } catch {
            setErro('Erro ao enviar avaliação. Tente novamente.');
        } finally {
            setEnviando(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Avaliar Local</DialogTitle>
                </DialogHeader>

                <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
                    {erro && (
                        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            {erro}
                        </p>
                    )}

                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Nota * <span className="text-muted-foreground">(1–5)</span>
                        </label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((n) => (
                                <button
                                    key={n}
                                    type="button"
                                    onClick={() => setNota(n)}
                                    className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition-colors ${
                                        nota === n
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-border hover:bg-accent'
                                    }`}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Comentário</label>
                        <textarea
                            maxLength={500}
                            value={comentario}
                            onChange={(e) => setComentario(e.target.value)}
                            rows={3}
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Conte sua experiência"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            O que você notou?
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                            {AMENIDADES.map(([key, label]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => toggleMarcador(key)}
                                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                                        marcadores.includes(key)
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
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={enviando || nota < 1}
                        >
                            {enviando ? 'Enviando...' : 'Enviar avaliação'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
