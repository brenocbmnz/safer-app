<?php

declare(strict_types=1);

use App\Models\Place;
use App\Models\Review;
use App\Models\User;

it('casts nota as integer', function (): void {
    $review = Review::factory()->create(['nota' => 4]);

    expect($review->nota)->toBeInt()->toBe(4);
});

it('casts marcadores as an array', function (): void {
    $review = Review::factory()->create(['marcadores' => ['seguranca', 'acessibilidade']]);

    expect($review->marcadores)->toBeArray()
        ->toContain('seguranca', 'acessibilidade');
});

it('defaults marcadores to an empty array', function (): void {
    $review = Review::factory()->create(['marcadores' => []]);

    expect($review->marcadores)->toBeArray()->toBeEmpty();
});

it('belongs to a place', function (): void {
    $place = Place::factory()->create();
    $review = Review::factory()->create(['place_id' => $place->id]);

    expect($review->place)->toBeInstanceOf(Place::class)
        ->and($review->place->id)->toBe($place->id);
});

it('belongs to a user', function (): void {
    $user = User::factory()->create();
    $review = Review::factory()->create(['user_id' => $user->id]);

    expect($review->user)->toBeInstanceOf(User::class)
        ->and($review->user->id)->toBe($user->id);
});

it('can have a null comentario', function (): void {
    $review = Review::factory()->create(['comentario' => null]);

    expect($review->comentario)->toBeNull();
});

it('accepts nota values between 1 and 5', function (): void {
    foreach (range(1, 5) as $nota) {
        $review = Review::factory()->create(['nota' => $nota]);
        expect($review->nota)->toBe($nota);
    }
});
