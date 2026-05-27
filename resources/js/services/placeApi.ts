import axios from 'axios';
import type {
    Amenidade,
    CategoriaLugar,
    GooglePlaceSuggestion,
    Place,
    PlaceDetalhado,
    PlaceFilters,
} from '@/types/place';

function serializeFilters(filters: PlaceFilters): URLSearchParams {
    const params = new URLSearchParams();

    if (filters.categoria && filters.categoria !== 'todos') {
        params.set('categoria', filters.categoria);
    }

    if (filters.notaMinima && filters.notaMinima > 0) {
        params.set('notaMinima', filters.notaMinima.toString());
    }

    if (filters.amenidades && filters.amenidades.length > 0) {
        params.set('amenidades', filters.amenidades.join(','));
    }

    if (filters.busca && filters.busca.trim().length > 0) {
        params.set('busca', filters.busca.trim());
    }

    if (filters.bounds) {
        params.set('latitudeMin', filters.bounds.sul.toString());
        params.set('latitudeMax', filters.bounds.norte.toString());
        params.set('longitudeMin', filters.bounds.oeste.toString());
        params.set('longitudeMax', filters.bounds.leste.toString());
    }

    return params;
}

export async function buscarLugares(filters: PlaceFilters): Promise<Place[]> {
    const params = serializeFilters(filters);
    const { data } = await axios.get<{ sucesso: boolean; dados: Place[] }>(
        `/api/places?${params.toString()}`,
    );
    return data.dados;
}

export async function buscarLugarPorId(id: string): Promise<PlaceDetalhado> {
    const { data } = await axios.get<{ sucesso: boolean; dados: PlaceDetalhado }>(
        `/api/places/${id}`,
    );
    return data.dados;
}

export async function criarLugar(payload: {
    nome: string;
    descricao?: string;
    categoria: CategoriaLugar;
    latitude: number;
    longitude: number;
    endereco?: string;
    contato?: string;
    amenidades?: Amenidade[];
    google_place_id?: string;
}): Promise<Place> {
    const { data } = await axios.post<{ sucesso: boolean; dados: Place }>('/api/places', payload);
    return data.dados;
}

export async function atualizarLugar(
    id: string,
    payload: Partial<{
        nome: string;
        descricao: string;
        categoria: CategoriaLugar;
        latitude: number;
        longitude: number;
        endereco: string;
        contato: string;
        amenidades: Amenidade[];
    }>,
): Promise<Place> {
    const { data } = await axios.put<{ sucesso: boolean; dados: Place }>(
        `/api/places/${id}`,
        payload,
    );
    return data.dados;
}

export async function removerLugar(id: string): Promise<void> {
    await axios.delete(`/api/places/${id}`);
}

export async function criarAvaliacao(
    placeId: string,
    payload: {
        nota: number;
        comentario?: string;
        marcadores?: Amenidade[];
    },
): Promise<void> {
    await axios.post(`/api/places/${placeId}/reviews`, payload);
}

export async function buscarAvaliacoes(placeId: string) {
    const { data } = await axios.get<{
        sucesso: boolean;
        dados: Array<{
            id: string;
            nota: number;
            comentario?: string;
            marcadores: string[];
            user_id?: string;
            criadoEm: string;
            atualizadoEm: string;
        }>;
    }>(`/api/places/${placeId}/reviews`);
    return data.dados;
}

export async function buscarLugaresGoogle(params: {
    latitude: number;
    longitude: number;
    raio?: number;
    palavraChave?: string;
    tipo?: string;
}): Promise<GooglePlaceSuggestion[]> {
    const qs = new URLSearchParams();
    qs.set('latitude', params.latitude.toString());
    qs.set('longitude', params.longitude.toString());
    if (params.raio) qs.set('raio', params.raio.toString());
    if (params.palavraChave) qs.set('palavraChave', params.palavraChave);
    if (params.tipo) qs.set('tipo', params.tipo);

    const { data } = await axios.get<{ sucesso: boolean; dados: GooglePlaceSuggestion[] }>(
        `/api/places/externo/google?${qs.toString()}`,
    );
    return data.dados;
}

export async function buscarDetalhesGoogle(placeId: string): Promise<GooglePlaceSuggestion> {
    const { data } = await axios.get<{ sucesso: boolean; dados: GooglePlaceSuggestion }>(
        `/api/places/externo/google/${encodeURIComponent(placeId)}`,
    );
    return data.dados;
}
