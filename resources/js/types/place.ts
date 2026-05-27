export type CategoriaLugar =
    | 'cafe'
    | 'bar'
    | 'saude'
    | 'educacao'
    | 'cultura'
    | 'servico'
    | 'outro';

export type Amenidade =
    | 'pet_friendly'
    | 'banheiro_genero_neutro'
    | 'wifi_gratuito'
    | 'aceita_nome_social'
    | 'acessivel_pcd'
    | 'bom_para_ir_sozinho'
    | 'bom_para_casais'
    | 'ambiente_acolhedor'
    | 'funcionarios_preparados';

export interface BasePlace {
    id: string;
    nome: string;
    descricao?: string;
    categoria: CategoriaLugar;
    latitude: number;
    longitude: number;
    endereco?: string;
    contato?: string;
    amenidades: Amenidade[];
    criadoEm: string;
    atualizadoEm: string;
    google_place_id?: string;
    user_id?: string;
}

export interface Place extends BasePlace {
    mediaNota: number | null;
    totalAvaliacoes: number;
}

export interface ViewportBounds {
    norte: number;
    sul: number;
    leste: number;
    oeste: number;
}

export interface Review {
    id: string;
    nota: number;
    comentario?: string;
    marcadores: string[];
    user_id?: string;
    criadoEm: string;
    atualizadoEm: string;
}

export interface PlaceDetalhado extends Place {
    avaliacoes: Review[];
}

export interface PlaceFilters {
    categoria?: CategoriaLugar | 'todos';
    amenidades?: Amenidade[];
    notaMinima?: number;
    busca?: string;
    bounds?: ViewportBounds;
}

export interface GooglePlaceSuggestion {
    placeId: string;
    nome: string;
    endereco: string;
    latitude: number;
    longitude: number;
    rating?: number;
    totalAvaliacoes?: number;
    tipos: string[];
    abertoAgora?: boolean;
    referencia?: string;
    telefone?: string;
    origem: 'google';
}
