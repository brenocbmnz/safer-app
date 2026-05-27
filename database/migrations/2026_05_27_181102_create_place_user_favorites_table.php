<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('place_user_favorites', function (Blueprint $table): void {
            $table->id();
            $table->foreignUuid('place_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['place_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('place_user_favorites');
    }
};
