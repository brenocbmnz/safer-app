<?php

declare(strict_types=1);

use App\Models\Place;
use App\Models\User;

test('user can add a place to favorites', function () {
    $user = User::factory()->create();
    $place = Place::factory()->create();

    $response = $this->actingAs($user)->postJson("/api/places/{$place->id}/favorite");

    $response->assertCreated()
        ->assertJsonPath('sucesso', true)
        ->assertJsonPath('mensagem', 'Local adicionado aos favoritos');

    expect($user->favorites()->count())->toBe(1);
    expect($user->favorites->first()->id)->toBe($place->id);
});

test('user can remove a place from favorites', function () {
    $user = User::factory()->create();
    $place = Place::factory()->create();
    $user->favorites()->attach($place->id);

    expect($user->favorites()->count())->toBe(1);

    $response = $this->actingAs($user)->deleteJson("/api/places/{$place->id}/favorite");

    $response->assertOk()
        ->assertJsonPath('sucesso', true)
        ->assertJsonPath('mensagem', 'Local removido dos favoritos');

    expect($user->favorites()->count())->toBe(0);
});

test('user can list their favorite places', function () {
    $user = User::factory()->create();
    $place1 = Place::factory()->create(['nome' => 'Café Favorito']);
    $place2 = Place::factory()->create(['nome' => 'Bar Favorito']);
    $place3 = Place::factory()->create(['nome' => 'Outro Local']);

    $user->favorites()->attach([$place1->id, $place2->id]);

    $response = $this->actingAs($user)->getJson('/api/favorites');

    $response->assertOk()
        ->assertJsonPath('sucesso', true)
        ->assertJsonCount(2, 'dados');

    $names = collect($response->json('dados'))->pluck('nome')->all();
    expect($names)->toContain('Café Favorito', 'Bar Favorito');
    expect($names)->not->toContain('Outro Local');
});

test('adding same place twice does not create duplicates', function () {
    $user = User::factory()->create();
    $place = Place::factory()->create();

    $this->actingAs($user)->postJson("/api/places/{$place->id}/favorite");
    $this->actingAs($user)->postJson("/api/places/{$place->id}/favorite");

    expect($user->favorites()->count())->toBe(1);
});

test('favorite places include rating information', function () {
    $user = User::factory()->create();
    $place = Place::factory()->create(['nome' => 'Local Avaliado']);
    $user->favorites()->attach($place->id);

    $response = $this->actingAs($user)->getJson('/api/favorites');

    $response->assertOk()
        ->assertJsonPath('dados.0.mediaNota', null)
        ->assertJsonPath('dados.0.totalAvaliacoes', 0)
        ->assertJsonPath('dados.0.isFavorited', true);
});

test('place index shows is_favorited field for authenticated user', function () {
    $user = User::factory()->create();
    $favoritedPlace = Place::factory()->create(['nome' => 'Favorito']);
    $normalPlace = Place::factory()->create(['nome' => 'Normal']);

    $user->favorites()->attach($favoritedPlace->id);

    $response = $this->actingAs($user)->getJson('/api/places');

    $response->assertOk();

    $places = collect($response->json('dados'));
    $favorited = $places->firstWhere('id', $favoritedPlace->id);
    $normal = $places->firstWhere('id', $normalPlace->id);

    expect($favorited['isFavorited'])->toBeTrue();
    expect($normal['isFavorited'])->toBeFalse();
});

test('deleting a place cascades to favorites', function () {
    $user = User::factory()->create();
    $place = Place::factory()->create();
    $user->favorites()->attach($place->id);

    expect($user->favorites()->count())->toBe(1);

    $place->delete();

    expect($user->favorites()->count())->toBe(0);
});

test('deleting a user cascades to favorites', function () {
    $user = User::factory()->create();
    $place = Place::factory()->create();
    $user->favorites()->attach($place->id);

    expect($place->favoritedBy()->count())->toBe(1);

    $user->delete();

    expect($place->favoritedBy()->count())->toBe(0);
});

test('unauthenticated user cannot add favorites', function () {
    $place = Place::factory()->create();

    $response = $this->postJson("/api/places/{$place->id}/favorite");

    $response->assertUnauthorized();
});

test('unauthenticated user cannot list favorites', function () {
    $response = $this->getJson('/api/favorites');

    $response->assertUnauthorized();
});
