<?php

declare(strict_types=1);

use App\Models\Place;
use App\Models\Review;
use App\Models\User;

it('returns reviews for a place', function (): void {
    $place = Place::factory()->create();
    $user = User::factory()->create();

    Review::factory()->create([
        'place_id' => $place->id,
        'user_id' => $user->id,
        'nota' => 5,
        'comentario' => 'Ótimo lugar!',
        'marcadores' => ['seguranca'],
    ]);
    Review::factory()->create([
        'place_id' => $place->id,
        'user_id' => $user->id,
        'nota' => 3,
        'comentario' => null,
        'marcadores' => [],
    ]);

    $response = $this->getJson("/api/places/{$place->id}/reviews");

    $response->assertOk()
        ->assertJsonPath('sucesso', true)
        ->assertJsonCount(2, 'dados');
});

it('returns empty list for place with no reviews', function (): void {
    $place = Place::factory()->create();

    $response = $this->getJson("/api/places/{$place->id}/reviews");

    $response->assertOk()
        ->assertJsonPath('sucesso', true)
        ->assertJsonCount(0, 'dados');
});

it('returns reviews in descending order', function (): void {
    $place = Place::factory()->create();
    $user = User::factory()->create();

    $first = Review::factory()->create([
        'place_id' => $place->id,
        'user_id' => $user->id,
        'nota' => 4,
        'comentario' => 'Primeiro',
        'marcadores' => [],
    ]);
    $this->travel(1)->minutes();
    $second = Review::factory()->create([
        'place_id' => $place->id,
        'user_id' => $user->id,
        'nota' => 2,
        'comentario' => 'Segundo',
        'marcadores' => [],
    ]);

    $response = $this->getJson("/api/places/{$place->id}/reviews");

    $response->assertOk();
    $ids = collect($response->json('dados'))->pluck('id')->all();
    expect($ids[0])->toBe($second->id);
    expect($ids[1])->toBe($first->id);
});

it('requires authentication to create a review', function (): void {
    $place = Place::factory()->create();

    $response = $this->postJson("/api/places/{$place->id}/reviews", [
        'nota' => 5,
        'comentario' => 'Ótimo!',
    ]);

    $response->assertUnauthorized();
});

it('stores a review for authenticated user', function (): void {
    $user = User::factory()->create();
    $place = Place::factory()->create();

    $response = $this->actingAs($user)->postJson("/api/places/{$place->id}/reviews", [
        'nota' => 4,
        'comentario' => 'Muito acolhedor',
        'marcadores' => ['seguranca', 'acessibilidade'],
    ]);

    $response->assertCreated()
        ->assertJsonPath('sucesso', true)
        ->assertJsonPath('dados.nota', 4)
        ->assertJsonPath('dados.comentario', 'Muito acolhedor')
        ->assertJsonPath('dados.marcadores', ['seguranca', 'acessibilidade'])
        ->assertJsonPath('dados.user_id', $user->id);

    expect(Review::where('place_id', $place->id)->count())->toBe(1);
});

it('stores a review without optional fields', function (): void {
    $user = User::factory()->create();
    $place = Place::factory()->create();

    $response = $this->actingAs($user)->postJson("/api/places/{$place->id}/reviews", [
        'nota' => 5,
    ]);

    $response->assertCreated()
        ->assertJsonPath('sucesso', true)
        ->assertJsonPath('dados.nota', 5)
        ->assertJsonPath('dados.comentario', null)
        ->assertJsonPath('dados.marcadores', []);
});

it('validates nota is required', function (): void {
    $user = User::factory()->create();
    $place = Place::factory()->create();

    $response = $this->actingAs($user)->postJson("/api/places/{$place->id}/reviews", [
        'comentario' => 'Sem nota',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['nota']);
});

it('validates nota is between 1 and 5', function (): void {
    $user = User::factory()->create();
    $place = Place::factory()->create();

    $this->actingAs($user)->postJson("/api/places/{$place->id}/reviews", ['nota' => 0])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['nota']);

    $this->actingAs($user)->postJson("/api/places/{$place->id}/reviews", ['nota' => 6])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['nota']);
});

it('validates comentario max length', function (): void {
    $user = User::factory()->create();
    $place = Place::factory()->create();

    $response = $this->actingAs($user)->postJson("/api/places/{$place->id}/reviews", [
        'nota' => 3,
        'comentario' => str_repeat('a', 501),
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['comentario']);
});

it('rejects invalid marcadores', function (): void {
    $user = User::factory()->create();
    $place = Place::factory()->create();

    $response = $this->actingAs($user)->postJson("/api/places/{$place->id}/reviews", [
        'nota' => 3,
        'marcadores' => ['marcador_invalido'],
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['marcadores.0']);
});

it('returns 404 for non-existent place when listing reviews', function (): void {
    $response = $this->getJson('/api/places/non-existent-id/reviews');

    $response->assertNotFound();
});

it('returns 404 for non-existent place when creating review', function (): void {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/places/non-existent-id/reviews', [
        'nota' => 4,
    ]);

    $response->assertNotFound();
});
