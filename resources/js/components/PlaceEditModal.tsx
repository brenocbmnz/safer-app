import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AMENITIES_LABELS, CATEGORY_OPTIONS } from '@/config/options';
import { atualizarLugar } from '@/services/placeApi';
import type { Amenidade, CategoriaLugar, PlaceDetalhado } from '@/types/place';

type Props = {
    open: boolean;
    onClose: () => void;
    place: PlaceDetalhado | null;
    onUpdated?: () => void;
};

const AMENIDADES = Object.entries(AMENITIES_LABELS) as [Amenidade, string][];

export function PlaceEditModal({ open, onClose, place, onUpdated }: Props) {
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [categoria, setCategoria] = useState<CategoriaLugar>('outro');
    const [endereco, setEndereco] = useState('');
    const [contato, setContato] = useState('');
    const [amenidades, setAmenidades] = useState<Amenidade[]>([]);
    const [imagem, setImagem] = useState<File | null>(null);
    const [previsualizacao, setPrevisualizacao] = useState<string | null>(null);
    const [enviando, setEnviando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    // Pre-fill form with existing place data
    useEffect(() => {
        if (!open || !place) {
            setImagem(null);
            setPrevisualizacao(null);
            return;
        }
        
        setNome(place.nome);
        setDescricao(place.descricao ?? '');
        setCategoria(place.categoria);
        setEndereco(place.endereco ?? '');
        setContato(place.contato ?? '');
        setAmenidades(place.amenidades);
        setErro(null);
        setImagem(null);
        setPrevisualizacao(place.imagemUrl ?? null);
    }, [open, place]);

    const toggleAmenidade = (a: Amenidade) => {
        setAmenidades((prev) =>
            prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a],
        );
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImagem(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPrevisualizacao(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!place) return;

        setErro(null);
        setEnviando(true);

        try {
            await atualizarLugar(place.id, {
                nome,
                descricao: descricao || undefined,
                categoria,
                endereco: endereco || undefined,
                contato: contato || undefined,
                amenidades,
                imagem: imagem || undefined,
            });
            onClose();
            onUpdated?.();
        } catch (error) {
            console.error('Erro ao atualizar lugar:', error);
            setErro('Erro ao atualizar local. Tente novamente.');
        } finally {
            setEnviando(false);
        }
    };

    if (!place) return null;

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Editar Local</DialogTitle>
                </DialogHeader>

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
                        <label className="mb-1 block text-sm font-medium">Imagem</label>
                        <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={handleImageChange}
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        {previsualizacao && (
                            <div className="mt-2">
                                <img
                                    src={previsualizacao}
                                    alt="Prévia"
                                    className="h-32 w-full rounded-md object-cover"
                                />
                            </div>
                        )}
                        <p className="mt-1 text-xs text-muted-foreground">
                            {imagem ? 'Nova imagem selecionada' : 'Escolha uma nova imagem para substituir a atual'} • Formatos: JPEG, PNG, WebP (máx. 2MB)
                        </p>
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
                            {enviando ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
