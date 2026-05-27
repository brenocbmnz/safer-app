import { useCallback, useEffect, useRef, useState } from 'react';
import { buscarLugares } from '@/services/placeApi';
import type { Place, PlaceFilters } from '@/types/place';

export function usePlaces(filters: PlaceFilters) {
    const [lugares, setLugares] = useState<Place[]>([]);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const filtersKey = JSON.stringify(filters);

    const carregar = useCallback(async (currentFilters: PlaceFilters) => {
        abortRef.current?.abort();
        abortRef.current = new AbortController();

        setCarregando(true);
        setErro(null);

        try {
            const data = await buscarLugares(currentFilters);
            setLugares(data);
        } catch (e: unknown) {
            if (e instanceof Error && e.name !== 'CanceledError') {
                setErro('Erro ao carregar locais. Tente novamente.');
            }
        } finally {
            setCarregando(false);
        }
    }, []);

    // Use JSON.stringify so that object literals passed inline don't cause infinite re-renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        void carregar(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [carregar, filtersKey]);

    const recarregar = useCallback(() => void carregar(filters), [carregar, filtersKey]);

    return { lugares, carregando, erro, recarregar };
}
