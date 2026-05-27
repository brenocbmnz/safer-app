<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreReviewRequest;
use App\Models\Place;
use Illuminate\Http\JsonResponse;

final class ReviewController
{
    public function index(Place $place): JsonResponse
    {
        $reviews = $place->reviews()->latest()->get()->map(fn ($r) => [
            'id' => $r->id,
            'nota' => $r->nota,
            'comentario' => $r->comentario,
            'marcadores' => $r->marcadores ?? [],
            'user_id' => $r->user_id,
            'criadoEm' => $r->created_at->toIso8601String(),
            'atualizadoEm' => $r->updated_at->toIso8601String(),
        ]);

        return response()->json(['sucesso' => true, 'dados' => $reviews]);
    }

    public function store(StoreReviewRequest $request, Place $place): JsonResponse
    {
        $data = $request->validated();
        $data['place_id'] = $place->id;
        $data['user_id'] = auth()->id();
        $data['marcadores'] = $data['marcadores'] ?? [];

        $review = $place->reviews()->create($data);

        return response()->json([
            'sucesso' => true,
            'dados' => [
                'id' => $review->id,
                'nota' => $review->nota,
                'comentario' => $review->comentario,
                'marcadores' => $review->marcadores ?? [],
                'user_id' => $review->user_id,
                'criadoEm' => $review->created_at->toIso8601String(),
                'atualizadoEm' => $review->updated_at->toIso8601String(),
            ],
        ], 201);
    }
}
