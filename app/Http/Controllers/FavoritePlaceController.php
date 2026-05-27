<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\AddPlaceToFavoritesAction;
use App\Actions\RemovePlaceFromFavoritesAction;
use App\Models\Place;
use Illuminate\Http\JsonResponse;

final class FavoritePlaceController
{
    public function index(): JsonResponse
    {
        $user = auth()->user();

        $favorites = $user->favorites()
            ->withAvg('reviews', 'nota')
            ->withCount('reviews')
            ->latest('place_user_favorites.created_at')
            ->get()
            ->map(fn (Place $place) => [
                'id' => $place->id,
                'nome' => $place->nome,
                'descricao' => $place->descricao,
                'categoria' => $place->categoria,
                'latitude' => $place->latitude,
                'longitude' => $place->longitude,
                'endereco' => $place->endereco,
                'contato' => $place->contato,
                'amenidades' => $place->amenidades ?? [],
                'google_place_id' => $place->google_place_id,
                'user_id' => $place->user_id,
                'mediaNota' => $place->reviews_avg_nota !== null ? round((float) $place->reviews_avg_nota, 2) : null,
                'totalAvaliacoes' => (int) $place->reviews_count,
                'isFavorited' => true,
                'criadoEm' => $place->created_at->toIso8601String(),
                'atualizadoEm' => $place->updated_at->toIso8601String(),
            ]);

        return response()->json(['sucesso' => true, 'dados' => $favorites]);
    }

    public function store(Place $place, AddPlaceToFavoritesAction $action): JsonResponse
    {
        $action->handle(auth()->user(), $place);

        return response()->json(['sucesso' => true, 'mensagem' => 'Local adicionado aos favoritos'], 201);
    }

    public function destroy(Place $place, RemovePlaceFromFavoritesAction $action): JsonResponse
    {
        $action->handle(auth()->user(), $place);

        return response()->json(['sucesso' => true, 'mensagem' => 'Local removido dos favoritos']);
    }
}
