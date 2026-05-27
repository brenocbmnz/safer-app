<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StorePlaceRequest;
use App\Http\Requests\UpdatePlaceRequest;
use App\Models\Place;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class PlaceController
{
    public function index(Request $request): JsonResponse
    {
        $query = Place::query()->withAvg('reviews', 'nota')->withCount('reviews');

        if (auth()->check()) {
            $query->withExists(['favoritedBy as is_favorited' => fn ($q) => $q->where('user_id', auth()->id())]);
        }

        if ($request->filled('categoria')) {
            $query->where('categoria', $request->string('categoria')->toString());
        }

        if ($request->filled('busca')) {
            $termo = $request->string('busca')->trim()->toString();
            $query->where(function ($q) use ($termo): void {
                $q->where('nome', 'like', "%{$termo}%")
                    ->orWhere('descricao', 'like', "%{$termo}%")
                    ->orWhere('endereco', 'like', "%{$termo}%");
            });
        }

        if ($request->filled('amenidades')) {
            $amenidades = array_filter(
                explode(',', $request->string('amenidades')->toString())
            );
            foreach ($amenidades as $amenidade) {
                $query->whereJsonContains('amenidades', mb_trim($amenidade));
            }
        }

        if ($request->filled('latitudeMin') && $request->filled('latitudeMax')) {
            $query->whereBetween('latitude', [
                (float) $request->input('latitudeMin'),
                (float) $request->input('latitudeMax'),
            ]);
        }

        if ($request->filled('longitudeMin') && $request->filled('longitudeMax')) {
            $min = (float) $request->input('longitudeMin');
            $max = (float) $request->input('longitudeMax');

            if ($min <= $max) {
                $query->whereBetween('longitude', [$min, $max]);
            } else {
                $query->where(function ($q) use ($min, $max): void {
                    $q->where('longitude', '>=', $min)->orWhere('longitude', '<=', $max);
                });
            }
        }

        if ($request->filled('notaMinima')) {
            $query->having('reviews_avg_nota', '>=', (float) $request->input('notaMinima'));
        }

        $ordenar = $request->string('ordenar')->toString();

        if ($ordenar === 'popular') {
            $query->orderByRaw('reviews_avg_nota IS NULL ASC')->orderByDesc('reviews_avg_nota')->orderByDesc('reviews_count');
        } elseif ($ordenar === 'perto' && $request->filled('userLat') && $request->filled('userLng')) {
            $lat = (float) $request->input('userLat');
            $lng = (float) $request->input('userLng');
            $query->orderByRaw(
                '(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude))))',
                [$lat, $lng, $lat],
            );
        } else {
            $query->latest();
        }

        $places = $query->get()->map(fn (Place $place) => [
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
            'isFavorited' => auth()->check() ? (bool) ($place->is_favorited ?? false) : false,
            'criadoEm' => $place->created_at->toIso8601String(),
            'atualizadoEm' => $place->updated_at->toIso8601String(),
        ]);

        return response()->json(['sucesso' => true, 'dados' => $places]);
    }

    public function show(Place $place): JsonResponse
    {
        $place->loadAvg('reviews', 'nota');
        $place->loadCount('reviews');
        $place->load('reviews');

        if (auth()->check()) {
            $place->loadExists(['favoritedBy as is_favorited' => fn ($q) => $q->where('user_id', auth()->id())]);
        }

        return response()->json([
            'sucesso' => true,
            'dados' => [
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
                'isFavorited' => auth()->check() ? (bool) ($place->is_favorited ?? false) : false,
                'criadoEm' => $place->created_at->toIso8601String(),
                'atualizadoEm' => $place->updated_at->toIso8601String(),
                'avaliacoes' => $place->reviews->map(fn ($r) => [
                    'id' => $r->id,
                    'nota' => $r->nota,
                    'comentario' => $r->comentario,
                    'marcadores' => $r->marcadores ?? [],
                    'user_id' => $r->user_id,
                    'criadoEm' => $r->created_at->toIso8601String(),
                    'atualizadoEm' => $r->updated_at->toIso8601String(),
                ]),
            ],
        ]);
    }

    public function store(StorePlaceRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id();
        $data['amenidades'] = $data['amenidades'] ?? [];

        $place = Place::create($data);
        $place->loadAvg('reviews', 'nota');
        $place->loadCount('reviews');

        return response()->json([
            'sucesso' => true,
            'dados' => [
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
                'mediaNota' => null,
                'totalAvaliacoes' => 0,
                'isFavorited' => false,
                'criadoEm' => $place->created_at->toIso8601String(),
                'atualizadoEm' => $place->updated_at->toIso8601String(),
            ],
        ], 201);
    }

    public function update(UpdatePlaceRequest $request, Place $place): JsonResponse
    {
        $place->update($request->validated());
        $place->loadAvg('reviews', 'nota');
        $place->loadCount('reviews');

        if (auth()->check()) {
            $place->loadExists(['favoritedBy as is_favorited' => fn ($q) => $q->where('user_id', auth()->id())]);
        }

        return response()->json([
            'sucesso' => true,
            'dados' => [
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
                'isFavorited' => auth()->check() ? (bool) ($place->is_favorited ?? false) : false,
                'criadoEm' => $place->created_at->toIso8601String(),
                'atualizadoEm' => $place->updated_at->toIso8601String(),
            ],
        ]);
    }

    public function destroy(Place $place): JsonResponse
    {
        $place->delete();

        return response()->json(['sucesso' => true]);
    }
}
