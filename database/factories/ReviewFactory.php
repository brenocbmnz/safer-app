<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Place;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Review>
 */
final class ReviewFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'place_id' => Place::factory(),
            'user_id' => User::factory(),
            'nota' => fake()->numberBetween(1, 5),
            'comentario' => fake()->optional()->sentence(),
            'marcadores' => [],
        ];
    }
}
