<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /** @var list<string> */
    private array $obsoletos = [
        'treinamento_pronomes',
        'apoio_trans',
        'acessibilidade',
        'seguranca',
        'outros',
    ];

    public function up(): void
    {
        DB::table('places')->lazyById()->each(function (object $place): void {
            /** @var list<string> $amenidades */
            $amenidades = json_decode($place->amenidades, true) ?? [];

            $filtradas = array_values(array_filter(
                $amenidades,
                fn (string $a) => ! in_array($a, $this->obsoletos, strict: true),
            ));

            if (count($filtradas) !== count($amenidades)) {
                DB::table('places')
                    ->where('id', $place->id)
                    ->update(['amenidades' => json_encode($filtradas)]);
            }
        });
    }

    public function down(): void
    {
        // Cannot restore removed values — intentionally irreversible.
    }
};
