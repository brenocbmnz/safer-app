<?php

declare(strict_types=1);

arch()->preset()->php();
arch()->preset()->strict();
arch()->preset()->laravel();
arch()->preset()->security()->ignoring([
    'assert',
]);

arch('controllers are not used by other classes')
    ->expect('App\Http\Controllers')
    ->not->toBeUsed();

arch('actions are in the Actions namespace')
    ->expect('App\Actions')
    ->toBeClasses()
    ->toBeFinal()
    ->toBeReadonly();

arch('actions have a handle method')
    ->expect('App\Actions')
    ->toHaveMethod('handle');

arch('actions do not depend on controllers')
    ->expect('App\Actions')
    ->not->toUse('App\Http\Controllers');

arch('models are in the Models namespace')
    ->expect('App\Models')
    ->toBeClasses()
    ->toBeFinal();

arch('models do not depend on controllers')
    ->expect('App\Models')
    ->not->toUse('App\Http\Controllers');

arch('models do not depend on actions')
    ->expect('App\Models')
    ->not->toUse('App\Actions');

arch('controllers do not directly instantiate models')
    ->expect('App\Http\Controllers')
    ->not->toUse([
        'Illuminate\Database\Eloquent\Model',
    ]);

arch('services are in the Services namespace')
    ->expect('App\Services')
    ->toBeClasses()
    ->toBeFinal();
