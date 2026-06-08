<?php

declare(strict_types=1);

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

    $user = App\Models\User::factory()->create();

    $response = $this->actingAs($user)->getJson('/api/places/externo/google/ChIJvalid456');

    $response->assertOk()
        ->assertJsonPath('sucesso', true)
        ->assertJsonPath('dados.placeId', 'ChIJvalid456')
        ->assertJsonPath('dados.nome', 'Bar do Zé')
        ->assertJsonPath('dados.telefone', '+55 48 3333-4444')
        ->assertJsonPath('dados.origem', 'google');
});

test('place details endpoint rejects invalid place id characters', function () {
    $user = App\Models\User::factory()->create();

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

    $user = App\Models\User::factory()->create();

    $response = $this->actingAs($user)->getJson('/api/places/externo/google/ChIJmuseum');

    $response->assertOk()
        ->assertJsonPath('dados.telefone', null);
});

test('nearby search returns results for valid coordinates', function () {
    Http::fake([
        'maps.googleapis.com/maps/api/place/nearbysearch/*' => Http::response([
            'status' => 'OK',
            'results' => [
                [
                    'place_id' => 'ChIJnearby1',
                    'name' => 'Café do Bairro',
                    'vicinity' => 'Rua das Flores, 10',
                    'geometry' => ['location' => ['lat' => -28.6, 'lng' => -49.3]],
                    'rating' => 4.5,
                    'user_ratings_total' => 100,
                    'types' => ['cafe'],
                    'opening_hours' => ['open_now' => true],
                    'reference' => 'ref123',
                ],
            ],
        ], 200),
    ]);

    $user = App\Models\User::factory()->create();

    $response = $this->actingAs($user)->getJson('/api/places/externo/google?latitude=-28.6&longitude=-49.3');

    $response->assertOk()
        ->assertJsonPath('sucesso', true)
        ->assertJsonCount(1, 'dados')
        ->assertJsonPath('dados.0.placeId', 'ChIJnearby1')
        ->assertJsonPath('dados.0.origem', 'google')
        ->assertJsonPath('dados.0.abertoAgora', true);
});

test('nearby search accepts optional keyword and tipo params', function () {
    Http::fake([
        'maps.googleapis.com/maps/api/place/nearbysearch/*' => Http::response([
            'status' => 'OK',
            'results' => [],
        ], 200),
    ]);

    $user = App\Models\User::factory()->create();

    $response = $this->actingAs($user)->getJson('/api/places/externo/google?latitude=-28.6&longitude=-49.3&palavraChave=bar&tipo=bar&raio=2000');

    $response->assertOk()
        ->assertJsonPath('sucesso', true)
        ->assertJsonCount(0, 'dados');
});

test('nearby search returns validation error when latitude is missing', function () {
    $user = App\Models\User::factory()->create();

    $response = $this->actingAs($user)->getJson('/api/places/externo/google?longitude=-49.3');

    $response->assertStatus(422);
});

test('nearby search returns 503 when google api key is not configured', function () {
    config(['services.google_places.key' => '']);

    $user = App\Models\User::factory()->create();

    $response = $this->actingAs($user)->getJson('/api/places/externo/google?latitude=-28.6&longitude=-49.3');

    $response->assertStatus(503)
        ->assertJsonPath('sucesso', false);
});

test('nearby search returns error when google api returns non-ok status', function () {
    Http::fake([
        'maps.googleapis.com/maps/api/place/nearbysearch/*' => Http::response([
            'status' => 'OVER_QUERY_LIMIT',
            'error_message' => 'You have exceeded your rate limit.',
        ], 200),
    ]);

    $user = App\Models\User::factory()->create();

    $response = $this->actingAs($user)->getJson('/api/places/externo/google?latitude=-28.6&longitude=-49.3');

    $response->assertStatus(429)
        ->assertJsonPath('sucesso', false);
});

test('nearby search returns 502 for unexpected google status', function () {
    Http::fake([
        'maps.googleapis.com/maps/api/place/nearbysearch/*' => Http::response([
            'status' => 'REQUEST_DENIED',
        ], 200),
    ]);

    $user = App\Models\User::factory()->create();

    $response = $this->actingAs($user)->getJson('/api/places/externo/google?latitude=-28.6&longitude=-49.3');

    $response->assertStatus(502)
        ->assertJsonPath('sucesso', false);
});

test('nearby search returns 500 when http request fails', function () {
    Http::fake([
        'maps.googleapis.com/maps/api/place/nearbysearch/*' => Http::response([], 500),
    ]);

    $user = App\Models\User::factory()->create();

    $response = $this->actingAs($user)->getJson('/api/places/externo/google?latitude=-28.6&longitude=-49.3');

    $response->assertStatus(500)
        ->assertJsonPath('sucesso', false);
});

test('place details returns 503 when google api key is not configured', function () {
    config(['services.google_places.key' => '']);

    $user = App\Models\User::factory()->create();

    $response = $this->actingAs($user)->getJson('/api/places/externo/google/ChIJtest');

    $response->assertStatus(503)
        ->assertJsonPath('sucesso', false);
});

test('place details returns 500 when http request fails', function () {
    Http::fake([
        'maps.googleapis.com/maps/api/place/details/*' => Http::response([], 503),
    ]);

    $user = App\Models\User::factory()->create();

    $response = $this->actingAs($user)->getJson('/api/places/externo/google/ChIJfailure');

    $response->assertStatus(503)
        ->assertJsonPath('sucesso', false);
});

test('place details returns 429 when google returns OVER_QUERY_LIMIT', function () {
    Http::fake([
        'maps.googleapis.com/maps/api/place/details/*' => Http::response([
            'status' => 'OVER_QUERY_LIMIT',
            'error_message' => 'Rate limit exceeded.',
        ], 200),
    ]);

    $user = App\Models\User::factory()->create();

    $response = $this->actingAs($user)->getJson('/api/places/externo/google/ChIJrate');

    $response->assertStatus(429)
        ->assertJsonPath('sucesso', false);
});

test('place details returns 502 for unexpected google status', function () {
    Http::fake([
        'maps.googleapis.com/maps/api/place/details/*' => Http::response([
            'status' => 'NOT_FOUND',
        ], 200),
    ]);

    $user = App\Models\User::factory()->create();

    $response = $this->actingAs($user)->getJson('/api/places/externo/google/ChIJnotfound');

    $response->assertStatus(502)
        ->assertJsonPath('sucesso', false);
});

test('nearby search returns zero results when google returns ZERO_RESULTS', function () {
    Http::fake([
        'maps.googleapis.com/maps/api/place/nearbysearch/*' => Http::response([
            'status' => 'ZERO_RESULTS',
            'results' => [],
        ], 200),
    ]);

    $user = App\Models\User::factory()->create();

    $response = $this->actingAs($user)->getJson('/api/places/externo/google?latitude=-28.6&longitude=-49.3');

    $response->assertOk()
        ->assertJsonCount(0, 'dados');
});
