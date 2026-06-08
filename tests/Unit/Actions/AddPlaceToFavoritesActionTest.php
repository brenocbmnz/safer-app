<?php

declare(strict_types=1);

use App\Actions\AddPlaceToFavoritesAction;
use App\Models\Place;
use App\Models\User;

it('adds a place to user favorites', function (): void {
    $user = User::factory()->create();
    $place = Place::factory()->create();

    $action = resolve(AddPlaceToFavoritesAction::class);
    $action->handle($user, $place);

    expect($user->favorites()->count())->toBe(1);
    expect($user->favorites->first()->id)->toBe($place->id);
});

it('adding the same place twice does not create duplicates', function (): void {
    $user = User::factory()->create();
    $place = Place::factory()->create();

    $action = resolve(AddPlaceToFavoritesAction::class);
    $action->handle($user, $place);
    $action->handle($user, $place);

    expect($user->favorites()->count())->toBe(1);
});

it('adds multiple different places to favorites', function (): void {
    $user = User::factory()->create();
    $place1 = Place::factory()->create();
    $place2 = Place::factory()->create();

    $action = resolve(AddPlaceToFavoritesAction::class);
    $action->handle($user, $place1);
    $action->handle($user, $place2);

    expect($user->favorites()->count())->toBe(2);
});
