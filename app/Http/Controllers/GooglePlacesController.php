<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\GooglePlacesService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class GooglePlacesController
{
    public function __construct(private readonly GooglePlacesService $service) {}

    public function show(string $placeId): JsonResponse
    {
        if ($placeId === '' || strlen($placeId) > 500 || preg_match('/[\x00-\x1F]/', $placeId)) {
            return response()->json(['sucesso' => false, 'erro' => 'ID do local inválido.'], 422);
        }

        try {
            $detalhes = $this->service->placeDetails($placeId);

            return response()->json(['sucesso' => true, 'dados' => $detalhes]);
        } catch (\RuntimeException $e) {
            $status = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;

            return response()->json(['sucesso' => false, 'erro' => $e->getMessage()], $status);
        }
    }

    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'raio' => ['nullable', 'integer', 'between:50,50000'],
            'palavraChave' => ['nullable', 'string', 'max:255'],
            'tipo' => ['nullable', 'string', 'max:100'],
        ]);

        try {
            $resultados = $this->service->nearbySearch(
                latitude: (float) $request->input('latitude'),
                longitude: (float) $request->input('longitude'),
                radius: (int) ($request->input('raio') ?? 1500),
                keyword: $request->input('palavraChave'),
                type: $request->input('tipo'),
            );

            return response()->json(['sucesso' => true, 'dados' => $resultados]);
        } catch (\RuntimeException $e) {
            $status = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;

            return response()->json(['sucesso' => false, 'erro' => $e->getMessage()], $status);
        }
    }
}
