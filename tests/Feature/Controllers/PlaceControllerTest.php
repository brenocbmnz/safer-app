<?php

declare(strict_types=1);

use App\Models\Place;
use App\Models\User;

it('returns all places', function (): void {
    Place::factory()->count(3)->create();

    $response = $this->getJson('/api/places');

    $response->assertOk()
        ->assertJsonPath('sucesso', true)
        ->assertJsonCount(3, 'dados');
});

it('filters places by categoria', function (): void {
    Place::factory()->categoria('cafe')->count(2)->create();
    Place::factory()->categoria('bar')->count(1)->create();

    $response = $this->getJson('/api/places?categoria=cafe');

    $response->assertOk()
        ->assertJsonCount(2, 'dados');

    collect($response->json('dados'))->each(
        fn ($p) => expect($p['categoria'])->toBe('cafe'),
    );
});

it('filters places by amenidades', function (): void {
    Place::factory()->withAmenidades(['pet_friendly'])->create();
    Place::factory()->withAmenidades(['wifi_gratuito'])->create();
    Place::factory()->create();

    $response = $this->getJson('/api/places?amenidades=pet_friendly');

    $response->assertOk()
        ->assertJsonCount(1, 'dados');

    expect($response->json('dados.0.amenidades'))->toContain('pet_friendly');
});

it('filters places by multiple amenidades (AND logic)', function (): void {
    Place::factory()->withAmenidades(['pet_friendly', 'wifi_gratuito'])->create();
    Place::factory()->withAmenidades(['pet_friendly'])->create();
    Place::factory()->withAmenidades(['wifi_gratuito'])->create();

    $response = $this->getJson('/api/places?amenidades=pet_friendly,wifi_gratuito');

    $response->assertOk()
        ->assertJsonCount(1, 'dados');
});

it('stores a place with new amenidades', function (): void {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/places', [
        'nome' => 'Café Acolhedor',
        'categoria' => 'cafe',
        'latitude' => -23.5,
        'longitude' => -46.6,
        'amenidades' => ['pet_friendly', 'aceita_nome_social', 'funcionarios_preparados'],
    ]);

    $response->assertCreated()
        ->assertJsonPath('sucesso', true)
        ->assertJsonPath('dados.amenidades', ['pet_friendly', 'aceita_nome_social', 'funcionarios_preparados']);
});

it('rejects obsolete amenidade values', function (): void {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/places', [
        'nome' => 'Bar Inclusivo',
        'categoria' => 'bar',
        'latitude' => -23.5,
        'longitude' => -46.6,
        'amenidades' => ['apoio_trans'],
    ]);

    $response->assertUnprocessable();
});

it('rejects old acessibilidade amenidade value', function (): void {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/places', [
        'nome' => 'Espaço Saúde',
        'categoria' => 'saude',
        'latitude' => -23.5,
        'longitude' => -46.6,
        'amenidades' => ['acessibilidade'],
    ]);

    $response->assertUnprocessable();
});

it('accepts all 9 new amenidade values', function (): void {
    $user = User::factory()->create();

    $amenidades = [
        'pet_friendly',
        'banheiro_genero_neutro',
        'wifi_gratuito',
        'aceita_nome_social',
        'acessivel_pcd',
        'bom_para_ir_sozinho',
        'bom_para_casais',
        'ambiente_acolhedor',
        'funcionarios_preparados',
    ];

    $response = $this->actingAs($user)->postJson('/api/places', [
        'nome' => 'Espaço Completo',
        'categoria' => 'outro',
        'latitude' => -23.5,
        'longitude' => -46.6,
        'amenidades' => $amenidades,
    ]);

    $response->assertCreated()
        ->assertJsonPath('dados.amenidades', $amenidades);
});

