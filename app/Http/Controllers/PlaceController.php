<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StorePlaceRequest;
use App\Http\Requests\UpdatePlaceRequest;
use App\Models\Place;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

final class PlaceController
{
    public function index(Request $request): JsonResponse
    {
        $query = Place::query()->withAvg('reviews', 'nota')->withCount('reviews');

        if (auth()->check()) {
            $query->withExists(['favoritedBy as is_favorited' => fn (\Illuminate\Database\Eloquent\Builder $q) => $q->where('user_id', auth()->id())]);
        }

        if ($request->filled('categoria')) {
            $query->where('categoria', $request->string('categoria')->toString());
        }

        if ($request->filled('busca')) {
            $termo = $request->string('busca')->trim()->toString();
            $query->where(function (\Illuminate\Database\Eloquent\Builder $q) use ($termo): void {
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
                $request->float('latitudeMin'),
                $request->float('latitudeMax'),
            ]);
        }

        if ($request->filled('longitudeMin') && $request->filled('longitudeMax')) {
            $min = $request->float('longitudeMin');
            $max = $request->float('longitudeMax');

            if ($min <= $max) {
                $query->whereBetween('longitude', [$min, $max]);
            } else {
                $query->where(function (\Illuminate\Database\Eloquent\Builder $q) use ($min, $max): void {
                    $q->where('longitude', '>=', $min)->orWhere('longitude', '<=', $max);
                });
            }
        }

        if ($request->filled('notaMinima')) {
            $query->having('reviews_avg_nota', '>=', $request->float('notaMinima'));
        }

        $ordenar = $request->string('ordenar')->toString();

        if ($ordenar === 'popular') {
            $query->orderByRaw('reviews_avg_nota IS NULL ASC')->orderByDesc('reviews_avg_nota')->orderByDesc('reviews_count');
        } elseif ($ordenar === 'perto' && $request->filled('userLat') && $request->filled('userLng')) {
            $lat = $request->float('userLat');
            $lng = $request->float('userLng');
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
            'imagemUrl' => $place->imagem_path ? Storage::disk('public')->url($place->imagem_path) : null,
            'google_place_id' => $place->google_place_id,
            'user_id' => $place->user_id,
            'mediaNota' => $place->reviews_avg_nota !== null ? round($place->reviews_avg_nota, 2) : null,
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
            $place->loadExists(['favoritedBy as is_favorited' => fn (\Illuminate\Database\Eloquent\Builder $q) => $q->where('user_id', auth()->id())]);
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
                'imagemUrl' => $place->imagem_path ? Storage::disk('public')->url($place->imagem_path) : null,
                'google_place_id' => $place->google_place_id,
                'user_id' => $place->user_id,
                'mediaNota' => $place->reviews_avg_nota !== null ? round($place->reviews_avg_nota, 2) : null,
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

        if ($request->hasFile('imagem')) {
            $data['imagem_path'] = $this->uploadImage($request->file('imagem'));
        }

        unset($data['imagem']);

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
                'imagemUrl' => $place->imagem_path ? Storage::disk('public')->url($place->imagem_path) : null,
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
        $data = $request->validated();

        if ($request->hasFile('imagem')) {
            // Delete old image if exists
            if ($place->imagem_path) {
                Storage::disk('public')->delete($place->imagem_path);
            }
            $data['imagem_path'] = $this->uploadImage($request->file('imagem'));
        }

        unset($data['imagem']);

        $place->update($data);
        $place->loadAvg('reviews', 'nota');
        $place->loadCount('reviews');

        if (auth()->check()) {
            $place->loadExists(['favoritedBy as is_favorited' => fn (\Illuminate\Database\Eloquent\Builder $q) => $q->where('user_id', auth()->id())]);
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
                'imagemUrl' => $place->imagem_path ? Storage::disk('public')->url($place->imagem_path) : null,
                'google_place_id' => $place->google_place_id,
                'user_id' => $place->user_id,
                'mediaNota' => $place->reviews_avg_nota !== null ? round($place->reviews_avg_nota, 2) : null,
                'totalAvaliacoes' => (int) $place->reviews_count,
                'isFavorited' => auth()->check() ? (bool) ($place->is_favorited ?? false) : false,
                'criadoEm' => $place->created_at->toIso8601String(),
                'atualizadoEm' => $place->updated_at->toIso8601String(),
            ],
        ]);
    }

    public function destroy(Place $place): JsonResponse
    {
        // Delete image if exists
        if ($place->imagem_path) {
            Storage::disk('public')->delete($place->imagem_path);
        }

        $place->delete();

        return response()->json(['sucesso' => true]);
    }

    private function uploadImage(UploadedFile $file): string
    {
        $path = $file->store('places', 'public');

        return $path !== false ? $path : throw new RuntimeException('Falha ao salvar imagem.');
    }
}
