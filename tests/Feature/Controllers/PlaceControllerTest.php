<?php

declare(strict_types=1);

use App\Models\Place;
use App\Models\User;

it('returns all places', function (): void {
    Place::factory()->count(3)->create();

    $response = $this->getJson('/api/places');

    $response->assertOk()
        ->assertJsonPath('sucesso', true)
        ->assertJsonCount(3, 'dados');
});

it('filters places by categoria', function (): void {
    Place::factory()->categoria('cafe')->count(2)->create();
    Place::factory()->categoria('bar')->count(1)->create();

    $response = $this->getJson('/api/places?categoria=cafe');

    $response->assertOk()
        ->assertJsonCount(2, 'dados');

    collect($response->json('dados'))->each(
        fn ($p) => expect($p['categoria'])->toBe('cafe'),
    );
});

it('filters places by amenidades', function (): void {
    Place::factory()->withAmenidades(['pet_friendly'])->create();
    Place::factory()->withAmenidades(['wifi_gratuito'])->create();
    Place::factory()->create();

    $response = $this->getJson('/api/places?amenidades=pet_friendly');

    $response->assertOk()
        ->assertJsonCount(1, 'dados');

    expect($response->json('dados.0.amenidades'))->toContain('pet_friendly');
});

it('filters places by multiple amenidades (AND logic)', function (): void {
    Place::factory()->withAmenidades(['pet_friendly', 'wifi_gratuito'])->create();
    Place::factory()->withAmenidades(['pet_friendly'])->create();
    Place::factory()->withAmenidades(['wifi_gratuito'])->create();

    $response = $this->getJson('/api/places?amenidades=pet_friendly,wifi_gratuito');

    $response->assertOk()
        ->assertJsonCount(1, 'dados');
});

it('stores a place with new amenidades', function (): void {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/places', [
        'nome' => 'Café Acolhedor',
        'categoria' => 'cafe',
        'latitude' => -23.5,
        'longitude' => -46.6,
        'amenidades' => ['pet_friendly', 'aceita_nome_social', 'funcionarios_preparados'],
    ]);

    $response->assertCreated()
        ->assertJsonPath('sucesso', true)
        ->assertJsonPath('dados.amenidades', ['pet_friendly', 'aceita_nome_social', 'funcionarios_preparados']);
});

it('rejects obsolete amenidade values', function (): void {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/places', [
        'nome' => 'Bar Inclusivo',
        'categoria' => 'bar',
        'latitude' => -23.5,
        'longitude' => -46.6,
        'amenidades' => ['apoio_trans'],
    ]);

    $response->assertUnprocessable();
});

it('rejects old acessibilidade amenidade value', function (): void {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/places', [
        'nome' => 'Espaço Saúde',
        'categoria' => 'saude',
        'latitude' => -23.5,
        'longitude' => -46.6,
        'amenidades' => ['acessibilidade'],
    ]);

    $response->assertUnprocessable();
});

it('accepts all 9 new amenidade values', function (): void {
    $user = User::factory()->create();

    $amenidades = [
        'pet_friendly',
        'banheiro_genero_neutro',
        'wifi_gratuito',
        'aceita_nome_social',
        'acessivel_pcd',
        'bom_para_ir_sozinho',
        'bom_para_casais',
        'ambiente_acolhedor',
        'funcionarios_preparados',
    ];

    $response = $this->actingAs($user)->postJson('/api/places', [
        'nome' => 'Espaço Completo',
        'categoria' => 'outro',
        'latitude' => -23.5,
        'longitude' => -46.6,
        'amenidades' => $amenidades,
    ]);

    $response->assertCreated()
        ->assertJsonPath('dados.amenidades', $amenidades);
});

it('filters places by busca term', function (): void {
    Place::factory()->create(['nome' => 'Café Especial', 'descricao' => 'Um lugar incrível']);
    Place::factory()->create(['nome' => 'Bar do João', 'endereco' => 'Rua especial, 10']);
    Place::factory()->create(['nome' => 'Livraria']);

    $response = $this->getJson('/api/places?busca=especial');

    $response->assertOk()
        ->assertJsonCount(2, 'dados');
});

it('filters places by latitude and longitude bounds', function (): void {
    Place::factory()->create(['latitude' => -23.5, 'longitude' => -46.6]);
    Place::factory()->create(['latitude' => -10.0, 'longitude' => -50.0]);

    $response = $this->getJson('/api/places?latitudeMin=-24&latitudeMax=-23&longitudeMin=-47&longitudeMax=-46');

    $response->assertOk()
        ->assertJsonCount(1, 'dados');
});

it('filters places by longitude wrap-around (antimeridian)', function (): void {
    Place::factory()->create(['latitude' => -23.5, 'longitude' => 170.0]);
    Place::factory()->create(['latitude' => -23.5, 'longitude' => -170.0]);
    Place::factory()->create(['latitude' => -23.5, 'longitude' => 0.0]);

    // min > max triggers the OR wrap-around branch
    $response = $this->getJson('/api/places?latitudeMin=-90&latitudeMax=90&longitudeMin=160&longitudeMax=-160');

    $response->assertOk()
        ->assertJsonCount(2, 'dados');
});

it('filters places by nota minima', function (): void {
    $goodPlace = Place::factory()->create();
    $badPlace = Place::factory()->create();
    $r1 = App\Models\Review::factory()->create(['place_id' => $goodPlace->id, 'nota' => 5]);
    $r2 = App\Models\Review::factory()->create(['place_id' => $badPlace->id, 'nota' => 2]);

    // Verify data state before HTTP request
    expect(App\Models\Review::count())->toBeGreaterThanOrEqual(2);
    expect($r1->nota)->toBe(5);
    expect($r1->place_id)->toBe($goodPlace->id);

    $response = $this->getJson('/api/places?notaMinima=4');

    dump([
        'responseBody' => $response->json(),
        'reviewCount' => App\Models\Review::count(),
        'placeCount' => Place::count(),
        'reviewsForGood' => App\Models\Review::where('place_id', $goodPlace->id)->count(),
    ]);

    $response->assertOk()
        ->assertJsonCount(1, 'dados');

    expect($response->json('dados.0.id'))->toBe($goodPlace->id);
});

it('sorts places by popular', function (): void {
    $popular = Place::factory()->create();
    $unpopular = Place::factory()->create();
    App\Models\Review::factory()->count(3)->create(['place_id' => $popular->id, 'nota' => 5]);

    $response = $this->getJson('/api/places?ordenar=popular');

    $response->assertOk();
    expect($response->json('dados.0.id'))->toBe($popular->id);
});

it('sorts places by perto when user coordinates provided', function (): void {
    Place::factory()->create(['latitude' => -23.5, 'longitude' => -46.6]);
    Place::factory()->create(['latitude' => -30.0, 'longitude' => -51.0]);

    $response = $this->getJson('/api/places?ordenar=perto&userLat=-23.5&userLng=-46.6');

    $response->assertOk()
        ->assertJsonCount(2, 'dados');
});

it('shows place details', function (): void {
    $place = Place::factory()->create();

    $response = $this->getJson("/api/places/{$place->id}");

    $response->assertOk()
        ->assertJsonPath('sucesso', true)
        ->assertJsonPath('dados.id', $place->id)
        ->assertJsonPath('dados.nome', $place->nome)
        ->assertJsonStructure(['dados' => ['avaliacoes']]);
});

it('shows place details with is_favorited when authenticated', function (): void {
    $user = User::factory()->create();
    $place = Place::factory()->create();
    $user->favorites()->attach($place->id);

    $response = $this->actingAs($user)->getJson("/api/places/{$place->id}");

    $response->assertOk()
        ->assertJsonPath('dados.isFavorited', true);
});

it('shows is_favorited false for unfavorited places when authenticated', function (): void {
    $user = User::factory()->create();
    $place = Place::factory()->create();

    $response = $this->actingAs($user)->getJson("/api/places/{$place->id}");

    $response->assertOk()
        ->assertJsonPath('dados.isFavorited', false);
});

it('includes reviews in place details', function (): void {
    $place = Place::factory()->create();
    App\Models\Review::factory()->create(['place_id' => $place->id, 'nota' => 4]);

    $response = $this->getJson("/api/places/{$place->id}");

    $response->assertOk()
        ->assertJsonCount(1, 'dados.avaliacoes');

    expect($response->json('dados.mediaNota'))->toEqual(4);
});

it('stores a place with an image', function (): void {
    Illuminate\Support\Facades\Storage::fake('public');
    $user = User::factory()->create();
    $file = Illuminate\Http\UploadedFile::fake()->create('local.jpg', 100, 'image/jpeg');

    $response = $this->actingAs($user)->postJson('/api/places', [
        'nome' => 'Café com Foto',
        'categoria' => 'cafe',
        'latitude' => -23.5,
        'longitude' => -46.6,
        'imagem' => $file,
    ]);

    $response->assertCreated()
        ->assertJsonPath('sucesso', true);

    expect($response->json('dados.imagemUrl'))->not->toBeNull();
});

it('updates a place', function (): void {
    $user = User::factory()->create();
    $place = Place::factory()->create(['user_id' => $user->id]);

    $response = $this->actingAs($user)->putJson("/api/places/{$place->id}", [
        'nome' => 'Nome Atualizado',
        'categoria' => 'bar',
    ]);

    $response->assertOk()
        ->assertJsonPath('sucesso', true)
        ->assertJsonPath('dados.nome', 'Nome Atualizado')
        ->assertJsonPath('dados.categoria', 'bar');
});

it('updates a place replacing its image', function (): void {
    Illuminate\Support\Facades\Storage::fake('public');
    $user = User::factory()->create();
    $place = Place::factory()->create(['user_id' => $user->id, 'imagem_path' => 'places/old.jpg']);
    Illuminate\Support\Facades\Storage::disk('public')->put('places/old.jpg', 'fake');

    $newFile = Illuminate\Http\UploadedFile::fake()->create('new.jpg', 100, 'image/jpeg');

    $response = $this->actingAs($user)->putJson("/api/places/{$place->id}", [
        'imagem' => $newFile,
    ]);

    $response->assertOk()
        ->assertJsonPath('sucesso', true);

    Illuminate\Support\Facades\Storage::disk('public')->assertMissing('places/old.jpg');
});

it('deletes a place', function (): void {
    $user = User::factory()->create();
    $place = Place::factory()->create(['user_id' => $user->id]);

    $response = $this->actingAs($user)->deleteJson("/api/places/{$place->id}");

    $response->assertOk()
        ->assertJsonPath('sucesso', true);

    expect(Place::find($place->id))->toBeNull();
});

it('deletes a place with its image', function (): void {
    Illuminate\Support\Facades\Storage::fake('public');
    $user = User::factory()->create();
    $place = Place::factory()->create(['user_id' => $user->id, 'imagem_path' => 'places/delete-me.jpg']);
    Illuminate\Support\Facades\Storage::disk('public')->put('places/delete-me.jpg', 'fake');

    $response = $this->actingAs($user)->deleteJson("/api/places/{$place->id}");

    $response->assertOk();
    Illuminate\Support\Facades\Storage::disk('public')->assertMissing('places/delete-me.jpg');
});

it('returns is_favorited for places list when authenticated', function (): void {
    $user = User::factory()->create();
    $place = Place::factory()->create();
    $user->favorites()->attach($place->id);

    $response = $this->actingAs($user)->getJson('/api/places');

    $response->assertOk();
    $favorited = collect($response->json('dados'))->first(fn ($p) => $p['id'] === $place->id);
    expect($favorited['isFavorited'])->toBeTrue();
});
