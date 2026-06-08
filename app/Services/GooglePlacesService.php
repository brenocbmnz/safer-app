<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

final class GooglePlacesService
{
    private string $apiKey;

    public function __construct()
    {
        $key = config('services.google_places.key', '');
        $this->apiKey = is_string($key) ? $key : '';
    }

    /**
     * @return list<array<string, mixed>>
     *
     * @throws RuntimeException
     */
    public function nearbySearch(
        float $latitude,
        float $longitude,
        int $radius = 1500,
        ?string $keyword = null,
        ?string $type = null,
    ): array {
        if ($this->apiKey === '') {
            throw new RuntimeException('Chave da API do Google Places não configurada.', 503);
        }

        $params = [
            'key' => $this->apiKey,
            'location' => "{$latitude},{$longitude}",
            'radius' => $radius,
        ];

        if ($keyword !== null && $keyword !== '') {
            $params['keyword'] = $keyword;
        }

        if ($type !== null && $type !== '') {
            $params['type'] = $type;
        }

        $response = Http::timeout(10)->get(
            'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
            $params,
        );

        if (! $response->successful()) {
            throw new RuntimeException(
                "Falha ao consultar Google Places (status {$response->status()}).",
                $response->status(),
            );
        }

        /** @var array{status: string, error_message?: string, results?: list<array<string, mixed>>} $data */
        $data = $response->json();

        if (! in_array($data['status'], ['OK', 'ZERO_RESULTS'], true)) {
            $message = $data['error_message'] ?? "Resposta inesperada do Google Places: {$data['status']}";
            $code = $data['status'] === 'OVER_QUERY_LIMIT' ? 429 : 502;
            throw new RuntimeException($message, $code);
        }

        return array_map(function (array $result): array {
            /** @var array{place_id: string, name: string, formatted_address?: string, vicinity?: string, geometry: array{location: array{lat: float, lng: float}}, rating?: float, user_ratings_total?: int, types?: list<string>, opening_hours?: array{open_now?: bool}, reference?: string} $result */
            return [
                'placeId' => $result['place_id'],
                'nome' => $result['name'],
                'endereco' => $result['formatted_address'] ?? $result['vicinity'] ?? 'Endereço não informado',
                'latitude' => $result['geometry']['location']['lat'],
                'longitude' => $result['geometry']['location']['lng'],
                'rating' => $result['rating'] ?? null,
                'totalAvaliacoes' => $result['user_ratings_total'] ?? null,
                'tipos' => $result['types'] ?? [],
                'abertoAgora' => $result['opening_hours']['open_now'] ?? null,
                'referencia' => $result['reference'] ?? null,
                'origem' => 'google',
            ];
        }, $data['results'] ?? []);
    }

    /**
     * @return array<string, mixed>
     *
     * @throws RuntimeException
     */
    public function placeDetails(string $placeId): array
    {
        if ($this->apiKey === '') {
            throw new RuntimeException('Chave da API do Google Places não configurada.', 503);
        }

        $response = Http::timeout(10)->get(
            'https://maps.googleapis.com/maps/api/place/details/json',
            [
                'key' => $this->apiKey,
                'place_id' => $placeId,
                'fields' => 'name,formatted_address,geometry,international_phone_number,types',
                'language' => 'pt-BR',
            ],
        );

        if (! $response->successful()) {
            throw new RuntimeException(
                "Falha ao consultar Google Places Details (status {$response->status()}).",
                $response->status(),
            );
        }

        /** @var array{status: string, error_message?: string, result?: array<string, mixed>} $data */
        $data = $response->json();

        if ($data['status'] !== 'OK') {
            $message = $data['error_message'] ?? "Resposta inesperada do Google Places: {$data['status']}";
            $code = $data['status'] === 'OVER_QUERY_LIMIT' ? 429 : 502;
            throw new RuntimeException($message, $code);
        }

        /** @var array{name?: string, formatted_address?: string, geometry?: array{location?: array{lat: float, lng: float}}, international_phone_number?: string, types?: list<string>} $result */
        $result = $data['result'] ?? [];

        /** @var array{lat: float, lng: float} $location */
        $location = $result['geometry']['location'] ?? ['lat' => 0.0, 'lng' => 0.0];

        return [
            'placeId' => $placeId,
            'nome' => (string) ($result['name'] ?? ''),
            'endereco' => (string) ($result['formatted_address'] ?? ''),
            'latitude' => (float) $location['lat'],
            'longitude' => (float) $location['lng'],
            'telefone' => isset($result['international_phone_number']) ? (string) $result['international_phone_number'] : null,
            'tipos' => (array) ($result['types'] ?? []),
            'origem' => 'google',
        ];
    }
}
