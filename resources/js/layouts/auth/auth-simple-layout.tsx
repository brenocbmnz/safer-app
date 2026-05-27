import { Link } from '@inertiajs/react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col bg-background p-6 md:p-10">
            <div className="w-full max-w-sm mx-auto flex flex-1 flex-col gap-8 justify-center">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col gap-4">
                        <Link
                            href={home()}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm text-stone-500 transition-colors hover:text-stone-800"
                            aria-label="Voltar"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15 18l-6-6 6-6" />
                            </svg>
                        </Link>

                        <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
