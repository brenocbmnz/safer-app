import { Head, Link, usePage } from '@inertiajs/react';
import { Play } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { usePlaces } from '@/hooks/usePlaces';
import { CATEGORY_OPTIONS } from '@/config/options';
import { SaferAppLayout } from '@/layouts/safer-app-layout';
import type { Auth } from '@/types/auth';
import type { PlaceFilters } from '@/types/place';

const TODOS_FILTERS: PlaceFilters = { categoria: 'todos', amenidades: [], busca: '' };

export default function Dashboard() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const firstName = auth.user.name.split(' ')[0];
    const { lugares, carregando } = usePlaces(TODOS_FILTERS);

    const getCategoryLabel = (cat: string) =>
        CATEGORY_OPTIONS.find((o) => o.value === cat)?.label ?? cat;

    return (
        <SaferAppLayout>
            <Head title="Início — Safer" />

            <div className="px-4 pt-6 pb-4">
                {/* Logo header */}
                <div className="mb-6 flex flex-col items-center">
                    <p className="text-[11px] text-muted-foreground">Safer</p>
                    <AppLogoIcon className="my-1 h-8 w-8 text-foreground" />
                    <p className="text-[11px] text-muted-foreground">Maps</p>
                </div>

                {/* Greeting */}
                <div className="mb-5">
                    <h1 className="text-2xl font-bold">Olá, {firstName}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Esperamos que esteja tendo um bom dia
                    </p>
                </div>

                {/* Green hero card → mapa */}
                <Link href="/mapa" className="block overflow-hidden rounded-2xl bg-lime-300 p-5 shadow-sm">
                    <h2 className="text-base font-bold text-gray-900">Explore o Mapa Safer</h2>
                    <p className="mt-1 text-xs text-gray-700">
                        Encontre Espaços Seguros perto de Você
                    </p>
                    <div className="my-3 flex justify-center">
                        <img
                            src="/design/IPRIDE MAP.png"
                            alt="Mapa"
                            className="h-28 w-auto object-contain"
                        />
                    </div>
                    <div className="flex justify-center">
                        <span className="rounded-full bg-gray-900 px-8 py-1.5 text-sm font-medium text-white">
                            Ir
                        </span>
                    </div>
                </Link>

                {/* Mood card → settings/profile (placeholder for future /humor) */}
                <Link
                    href="/settings/profile"
                    className="mt-3 flex items-center justify-between rounded-2xl bg-gray-900 p-5 shadow-sm"
                >
                    <div className="flex-1 pr-4">
                        <h2 className="text-base font-bold text-white">
                            Procurando algo mais calmo?
                        </h2>
                        <p className="mt-1 text-xs leading-relaxed text-gray-400">
                            Mude suas preferências para filtrar apenas por locais que condizem com seu humor hoje
                        </p>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
                        <Play size={16} className="ml-0.5 text-gray-900" fill="currentColor" />
                    </div>
                </Link>

                {/* Recommended places */}
                <div className="mt-6">
                    <h2 className="mb-3 text-base font-bold">Locais Recomendados para Você</h2>

                    {carregando ? (
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-36 shrink-0">
                                    <div className="h-28 w-full animate-pulse rounded-xl bg-muted" />
                                    <div className="mt-2 h-3 w-24 animate-pulse rounded bg-muted" />
                                    <div className="mt-1 h-3 w-20 animate-pulse rounded bg-muted" />
                                </div>
                            ))}
                        </div>
                    ) : lugares.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhum local encontrado.</p>
                    ) : (
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {lugares.slice(0, 8).map((lugar) => (
                                <Link
                                    key={lugar.id}
                                    href="/locais"
                                    className="w-36 shrink-0"
                                >
                                    <img
                                        src="/design/thumbnailplaceholder.png"
                                        alt={lugar.nome}
                                        className="h-28 w-full rounded-xl object-cover"
                                    />
                                    <p className="mt-2 truncate text-xs font-semibold">{lugar.nome}</p>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {getCategoryLabel(lugar.categoria)} · Próximo
                                    </p>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </SaferAppLayout>
    );
}
