import { Heart } from 'lucide-react';
import { useState } from 'react';
import { desmarcarFavorito, marcarFavorito } from '@/services/placeApi';
import type { Place } from '@/types/place';

type Props = {
    place: Place;
    onToggle?: (isFavorited: boolean) => void;
};

export function FavoriteButton({ place, onToggle }: Props) {
    const [isFavorited, setIsFavorited] = useState(place.isFavorited ?? false);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        
        if (isLoading) return;

        const previousState = isFavorited;
        const newState = !isFavorited;

        // Optimistic update
        setIsFavorited(newState);
        setIsLoading(true);

        try {
            if (newState) {
                await marcarFavorito(place.id);
            } else {
                await desmarcarFavorito(place.id);
            }
            onToggle?.(newState);
        } catch (error) {
            // Rollback on error
            setIsFavorited(previousState);
            console.error('Erro ao atualizar favorito:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleToggle}
            disabled={isLoading}
            className="transition-all hover:scale-110 disabled:opacity-50"
            aria-label={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
            <Heart
                size={20}
                className={
                    isFavorited
                        ? 'fill-red-500 text-red-500'
                        : 'text-muted-foreground hover:text-red-500'
                }
                strokeWidth={2}
            />
        </button>
    );
}
