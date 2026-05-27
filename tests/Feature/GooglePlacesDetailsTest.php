<?php

use App\Services\GooglePlacesService;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    config(['services.google_places.key' => 'fake-test-key']);
});

test('returns place details for a valid place id', function () {
    Http::fake([
        'maps.googleapis.com/maps/api/place/details/*' => Http::response([
            'status' => 'OK',
            'result' => [
                'name' => 'Café Central',
                'formatted_address' => 'Rua XV de Novembro, 123, Criciúma - SC',
                'geometry' => ['location' => ['lat' => -28.677, 'lng' => -49.369]],
                'international_phone_number' => '+55 48 99999-0000',
                'types' => ['cafe', 'food'],
            ],
        ], 200),
    ]);

    $service = new GooglePlacesService();
    $details = $service->placeDetails('ChIJfake123');

    expect($details)->toMatchArray([
        'placeId' => 'ChIJfake123',
        'nome' => 'Café Central',
        'endereco' => 'Rua XV de Novembro, 123, Criciúma - SC',
        'latitude' => -28.677,
        'longitude' => -49.369,
        'telefone' => '+55 48 99999-0000',
        'tipos' => ['cafe', 'food'],
        'origem' => 'google',
    ]);
});

test('place details endpoint returns 200 with correct structure', function () {
    Http::fake([
        'maps.googleapis.com/maps/api/place/details/*' => Http::response([
            'status' => 'OK',
            'result' => [
                'name' => 'Bar do Zé',
                'formatted_address' => 'Av. Principal, 456',
                'geometry' => ['location' => ['lat' => -28.0, 'lng' => -49.0]],
                'international_phone_number' => '+55 48 3333-4444',
                'types' => ['bar'],
            ],
        ], 200),
    ]);

    $user = \App\Models\User::factory()->create();

    $response = $this->actingAs($user)->getJson('/api/places/externo/google/ChIJvalid456');

    $response->assertOk()
        ->assertJsonPath('sucesso', true)
        ->assertJsonPath('dados.placeId', 'ChIJvalid456')
        ->assertJsonPath('dados.nome', 'Bar do Zé')
        ->assertJsonPath('dados.telefone', '+55 48 3333-4444')
        ->assertJsonPath('dados.origem', 'google');
});

test('place details endpoint rejects invalid place id characters', function () {
    $user = \App\Models\User::factory()->create();

    $tooLong = str_repeat('A', 501);
    $response = $this->actingAs($user)->getJson("/api/places/externo/google/{$tooLong}");

    $response->assertStatus(422)
        ->assertJsonPath('sucesso', false);
});

test('place details endpoint handles missing phone number', function () {
    Http::fake([
        'maps.googleapis.com/maps/api/place/details/*' => Http::response([
            'status' => 'OK',
            'result' => [
                'name' => 'Museu',
                'formatted_address' => 'Praça da Matriz',
                'geometry' => ['location' => ['lat' => -28.5, 'lng' => -49.2]],
                'types' => ['museum'],
            ],
        ], 200),
    ]);

    $user = \App\Models\User::factory()->create();

    $response = $this->actingAs($user)->getJson('/api/places/externo/google/ChIJmuseum');

    $response->assertOk()
        ->assertJsonPath('dados.telefone', null);
});
