<?php

declare(strict_types=1);

use App\Http\Controllers\FavoritePlaceController;
use App\Http\Controllers\GooglePlacesController;
use App\Http\Controllers\PlaceController;
use App\Http\Controllers\ReviewController;
use Illuminate\Support\Facades\Route;

Route::middleware('web')->group(function (): void {
    Route::apiResource('places', PlaceController::class);
    Route::apiResource('places.reviews', ReviewController::class)->only(['index', 'store']);
    Route::get('places/externo/google', [GooglePlacesController::class, 'index'])->name('google-places.index');
});

Route::middleware(['web', 'auth'])->group(function (): void {
    Route::get('favorites', [FavoritePlaceController::class, 'index'])->name('favorites.index');
    Route::post('places/{place}/favorite', [FavoritePlaceController::class, 'store'])->name('favorites.store');
    Route::delete('places/{place}/favorite', [FavoritePlaceController::class, 'destroy'])->name('favorites.destroy');
});
