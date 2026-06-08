<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property-read string $id
 * @property-read string $nome
 * @property-read string|null $descricao
 * @property-read string $categoria
 * @property-read float $latitude
 * @property-read float $longitude
 * @property-read string|null $endereco
 * @property-read string|null $contato
 * @property-read list<string> $amenidades
 * @property-read string|null $imagem_path
 * @property-read string|null $google_place_id
 * @property-read string|null $user_id
 * @property-read CarbonInterface $created_at
 * @property-read CarbonInterface $updated_at
 * @property-read float|null $reviews_avg_nota
 * @property-read int $reviews_count
 * @property-read bool $is_favorited
 */
final class Place extends Model
{
    /** @use HasFactory<\Database\Factories\PlaceFactory> */
    use HasFactory;

    use HasUuids;

    protected $table = 'places';

    protected $fillable = [
        'nome',
        'descricao',
        'categoria',
        'latitude',
        'longitude',
        'endereco',
        'contato',
        'amenidades',
        'imagem_path',
        'google_place_id',
        'user_id',
    ];

    /**
     * @return array<string, string>
     */
    public function casts(): array
    {
        return [
            'id' => 'string',
            'latitude' => 'float',
            'longitude' => 'float',
            'amenidades' => 'array',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasMany<Review, $this> */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    /** @return BelongsToMany<User, $this> */
    public function favoritedBy(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'place_user_favorites')
            ->withTimestamps();
    }
}
