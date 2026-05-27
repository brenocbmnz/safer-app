import type { Amenidade, CategoriaLugar } from '@/types/place';

export const CATEGORY_OPTIONS: Array<{
    value: CategoriaLugar | 'todos';
    label: string;
    description: string;
}> = [
    { value: 'todos', label: 'Todos', description: 'Mostrar todas as categorias' },
    { value: 'cafe', label: 'Cafés', description: 'Locais acolhedores para encontros e trabalho' },
    { value: 'bar', label: 'Bares e baladas', description: 'Espaços noturnos seguros e inclusivos' },
    { value: 'saude', label: 'Saúde', description: 'Clínicas, hospitais e apoio psicossocial' },
    { value: 'educacao', label: 'Educação', description: 'Escolas, cursos e centros culturais' },
    { value: 'cultura', label: 'Cultura', description: 'Museus, teatros e espaços artísticos' },
    { value: 'servico', label: 'Serviços', description: 'Advocacia, assistência social e mais' },
    { value: 'outro', label: 'Outros', description: 'Iniciativas comunitárias diversas' },
];

export const AMENITIES_LABELS: Record<Amenidade, string> = {
    pet_friendly: 'Pet friendly',
    banheiro_genero_neutro: 'Banheiro de gênero neutro',
    wifi_gratuito: 'Wi-fi gratuito',
    aceita_nome_social: 'Aceita nome social',
    acessivel_pcd: 'Acessível para PCD',
    bom_para_ir_sozinho: 'Bom para ir sozinho',
    bom_para_casais: 'Bom para casais',
    ambiente_acolhedor: 'Ambiente acolhedor',
    funcionarios_preparados: 'Funcionários preparados',
};

export const RATING_OPTIONS = [
    { value: 0, label: 'Qualquer nota' },
    { value: 3, label: '3+ estrelas' },
    { value: 4, label: '4+ estrelas' },
    { value: 4.5, label: '4.5+ estrelas' },
];
