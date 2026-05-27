<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\Place;
use App\Models\User;

final readonly class AddPlaceToFavoritesAction
{
    public function handle(User $user, Place $place): void
    {
        $user->favorites()->syncWithoutDetaching([$place->id]);
    }
}
