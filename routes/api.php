<?php

declare(strict_types=1);

use App\Http\Controllers\FavoritePlaceController;
use Illuminate\Support\Facades\Route;

// Favorite routes (not in web.php)
Route::middleware(['web', 'auth'])->group(function (): void {
    Route::get('favorites', [FavoritePlaceController::class, 'index'])->name('favorites.index');
    Route::post('places/{place}/favorite', [FavoritePlaceController::class, 'store'])->name('favorites.store');
    Route::delete('places/{place}/favorite', [FavoritePlaceController::class, 'destroy'])->name('favorites.destroy');
});
