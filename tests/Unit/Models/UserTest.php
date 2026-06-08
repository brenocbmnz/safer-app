<?php

declare(strict_types=1);

use App\Models\User;

test('to array', function (): void {
    $user = User::factory()->create()->refresh();

    expect(array_keys($user->toArray()))
        ->toBe([
            'id',
            'name',
            'email',
            'email_verified_at',
            'two_factor_confirmed_at',
            'created_at',
            'updated_at',
            'pronome',
        ]);
});

test('user has many places', function (): void {
    $user = User::factory()->create();
    App\Models\Place::factory()->count(2)->create(['user_id' => $user->id]);

    expect($user->places()->count())->toBe(2);
});

test('user has many reviews', function (): void {
    $user = User::factory()->create();
    $place = App\Models\Place::factory()->create();
    App\Models\Review::factory()->count(3)->create(['user_id' => $user->id, 'place_id' => $place->id]);

    expect($user->reviews()->count())->toBe(3);
});
