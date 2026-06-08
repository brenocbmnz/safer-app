<?php

declare(strict_types=1);

use App\Actions\RemovePlaceFromFavoritesAction;
use App\Models\Place;
use App\Models\User;

it('removes a place from user favorites', function (): void {
    $user = User::factory()->create();
    $place = Place::factory()->create();
    $user->favorites()->attach($place->id);

    expect($user->favorites()->count())->toBe(1);

    $action = resolve(RemovePlaceFromFavoritesAction::class);
    $action->handle($user, $place);

    expect($user->favorites()->count())->toBe(0);
});

it('removing a place not in favorites does nothing', function (): void {
    $user = User::factory()->create();
    $place = Place::factory()->create();

    $action = resolve(RemovePlaceFromFavoritesAction::class);
    $action->handle($user, $place);

    expect($user->favorites()->count())->toBe(0);
});

it('removes only the targeted place from favorites', function (): void {
    $user = User::factory()->create();
    $place1 = Place::factory()->create();
    $place2 = Place::factory()->create();
    $user->favorites()->attach([$place1->id, $place2->id]);

    $action = resolve(RemovePlaceFromFavoritesAction::class);
    $action->handle($user, $place1);

    expect($user->favorites()->count())->toBe(1);
    expect($user->favorites->first()->id)->toBe($place2->id);
});
