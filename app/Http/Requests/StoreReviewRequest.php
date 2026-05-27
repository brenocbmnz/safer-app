<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class StoreReviewRequest extends FormRequest
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
            'nota' => ['required', 'integer', 'between:1,5'],
            'comentario' => ['nullable', 'string', 'max:500'],
            'marcadores' => ['nullable', 'array', 'max:10'],
            'marcadores.*' => ['string', 'in:banheiro_genero_neutro,treinamento_pronomes,apoio_trans,acessibilidade,seguranca,wifi_gratuito,pet_friendly,outros'],
        ];
    }
}
