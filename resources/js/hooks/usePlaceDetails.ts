import { useCallback, useEffect, useState } from 'react';
import { buscarLugarPorId } from '@/services/placeApi';
import type { PlaceDetalhado } from '@/types/place';

export function usePlaceDetails(id: string | null) {
    const [lugar, setLugar] = useState<PlaceDetalhado | null>(null);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    const carregar = useCallback(async (placeId: string) => {
        setCarregando(true);
        setErro(null);
        try {
            const data = await buscarLugarPorId(placeId);
            setLugar(data);
        } catch {
            setErro('Erro ao carregar detalhes do local.');
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        if (id) {
            void carregar(id);
        } else {
            setLugar(null);
        }
    }, [id, carregar]);

    const recarregar = useCallback(() => {
        if (id) void carregar(id);
    }, [id, carregar]);

    return { lugar, carregando, erro, recarregar };
}
