<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('places', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('nome', 255);
            $table->string('descricao', 500)->nullable();
            $table->enum('categoria', ['cafe', 'bar', 'saude', 'educacao', 'cultura', 'servico', 'outro']);
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 11, 7);
            $table->string('endereco', 255)->nullable();
            $table->string('contato', 255)->nullable();
            $table->json('amenidades')->default('[]');
            $table->string('google_place_id', 255)->nullable()->index();
            $table->foreignUuid('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('places');
    }
};
