import { Head, Link } from '@inertiajs/react';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    return (
        <>
            <Head title="Safer — Ache o seu espaço" />

            <main className="flex min-h-screen flex-col items-center justify-center bg-background px-8 py-12">
                <div className="flex w-full max-w-sm flex-col items-center gap-8">
                    {/* Logo */}
                    <div className="flex flex-col items-center gap-1">
                        <img
                            src="/design/pride-location.png"
                            alt="Safer Maps logo"
                            className="h-12 w-12 object-contain"
                        />
                        <span className="text-lg font-bold tracking-tight text-foreground">Safer</span>
                        <span className="text-sm text-muted-foreground">Maps</span>
                    </div>

                    {/* Illustration */}
                    <img
                        src="/design/Green-Cute-Pride-Month-Poster.png"
                        alt="Ilustração de um sapo segurando um coração com as cores do orgulho."
                        className="max-h-64 w-full object-contain"
                    />

                    {/* Text */}
                    <div className="flex flex-col items-center gap-2 text-center">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Ache o seu espaço
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Junte-se a várias pessoas para tornar o mundo mais inclusivo e seguro.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex w-full flex-col items-center gap-4">
                        {canRegister && (
                            <Link
                                href="/register"
                                className="flex h-12 w-full items-center justify-center rounded-full bg-[#4a6741] text-xs font-bold tracking-widest text-white uppercase shadow transition-opacity hover:opacity-90"
                            >
                                Inscrever-se
                            </Link>
                        )}
                        <Link
                            href="/login"
                            className="text-xs font-semibold tracking-widest text-muted-foreground uppercase transition-colors hover:text-foreground"
                        >
                            Já tem uma conta? Entre aqui
                        </Link>
                    </div>
                </div>
            </main>
        </>
    );
}
