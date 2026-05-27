import { Link, usePage } from '@inertiajs/react';
import { Home, Map, MapPin, User } from 'lucide-react';

const tabs = [
    { href: '/dashboard', label: 'Início', icon: Home },
    { href: '/locais', label: 'Locais', icon: MapPin },
    { href: '/mapa', label: 'Mapa', icon: Map },
    { href: '/settings/profile', label: 'Perfil', icon: User },
];

export function BottomNav() {
    const { url } = usePage();

    return (
        <nav className="fixed right-0 bottom-0 left-0 z-50 flex border-t bg-background">
            {tabs.map(({ href, label, icon: Icon }) => {
                const active = url.startsWith(href);
                return (
                    <Link
                        key={href}
                        href={href}
                        className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors ${
                            active
                                ? 'text-primary font-medium'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                        <span>{label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
