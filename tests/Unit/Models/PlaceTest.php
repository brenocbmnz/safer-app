<?php

declare(strict_types=1);

use App\Models\Place;
use App\Models\Review;
use App\Models\User;

it('has the correct visible attributes', function (): void {
    $place = Place::factory()->create()->refresh();

    expect(array_keys($place->toArray()))->toContain(
        'id', 'nome', 'categoria', 'latitude', 'longitude', 'amenidades',
    );
});

it('casts amenidades as an array', function (): void {
    $place = Place::factory()->withAmenidades(['pet_friendly', 'wifi_gratuito'])->create();

    expect($place->amenidades)->toBeArray()
        ->toContain('pet_friendly', 'wifi_gratuito');
});

it('casts latitude and longitude as floats', function (): void {
    $place = Place::factory()->create(['latitude' => -23.5505, 'longitude' => -46.6333]);

    expect($place->latitude)->toBeFloat()
        ->and($place->longitude)->toBeFloat();
});

it('belongs to a user', function (): void {
    $user = User::factory()->create();
    $place = Place::factory()->create(['user_id' => $user->id]);

    expect($place->user)->toBeInstanceOf(User::class)
        ->and($place->user->id)->toBe($user->id);
});

it('has many reviews', function (): void {
    $place = Place::factory()->create();
    $user = User::factory()->create();

    Review::factory()->count(3)->create(['place_id' => $place->id, 'user_id' => $user->id]);

    expect($place->reviews)->toHaveCount(3);
    expect($place->reviews->first())->toBeInstanceOf(Review::class);
});

it('can have zero reviews', function (): void {
    $place = Place::factory()->create();

    expect($place->reviews)->toHaveCount(0);
});

it('can have no owner', function (): void {
    $place = Place::factory()->create(['user_id' => null]);

    expect($place->user_id)->toBeNull();
});
