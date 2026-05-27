<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Place;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Place>
 */
final class PlaceFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nome' => fake()->company(),
            'descricao' => fake()->optional()->sentence(),
            'categoria' => fake()->randomElement(['cafe', 'bar', 'saude', 'educacao', 'cultura', 'servico', 'outro']),
            'latitude' => fake()->latitude(-23.6, -23.4),
            'longitude' => fake()->longitude(-46.7, -46.5),
            'endereco' => fake()->optional()->streetAddress(),
            'contato' => fake()->optional()->phoneNumber(),
            'amenidades' => [],
            'google_place_id' => null,
            'user_id' => null,
        ];
    }

    /** @param list<string> $amenidades */
    public function withAmenidades(array $amenidades): self
    {
        return $this->state(fn (array $attributes): array => [
            'amenidades' => $amenidades,
        ]);
    }

    public function categoria(string $categoria): self
    {
        return $this->state(fn (array $attributes): array => [
            'categoria' => $categoria,
        ]);
    }
}
