<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class UpdatePlaceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'nome' => ['sometimes', 'string', 'min:3', 'max:255'],
            'descricao' => ['nullable', 'string', 'max:500'],
            'categoria' => ['sometimes', 'string', 'in:cafe,bar,saude,educacao,cultura,servico,outro'],
            'latitude' => ['sometimes', 'numeric', 'between:-90,90'],
            'longitude' => ['sometimes', 'numeric', 'between:-180,180'],
            'endereco' => ['nullable', 'string', 'max:255'],
            'contato' => ['nullable', 'string', 'max:255'],
            'amenidades' => ['nullable', 'array', 'max:9'],
            'amenidades.*' => ['string', 'in:pet_friendly,banheiro_genero_neutro,wifi_gratuito,aceita_nome_social,acessivel_pcd,bom_para_ir_sozinho,bom_para_casais,ambiente_acolhedor,funcionarios_preparados'],
        ];
    }
}
