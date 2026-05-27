import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import UserProfileController from '@/actions/App/Http/Controllers/UserProfileController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SaferAppLayout } from '@/layouts/safer-app-layout';
import { edit } from '@/routes/user-profile';
import { send } from '@/routes/verification';

export default function Edit({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage().props;

    return (
        <SaferAppLayout>
            <Head title="Perfil — Safer" />

            <section className="px-4 pt-8 pb-6">
                <header className="mb-6">
                    <h1 className="text-2xl font-bold">Meu Perfil</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Atualize suas informações pessoais.
                    </p>
                </header>

                <Form
                    {...UserProfileController.update.form()}
                    options={{ preserveScroll: true }}
                    className="space-y-5"
                >
                    {({ processing, recentlySuccessful, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nome</Label>
                                <Input
                                    id="name"
                                    className="w-full"
                                    defaultValue={auth.user.name}
                                    name="name"
                                    required
                                    autoComplete="name"
                                    placeholder="Nome completo"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="pronome">Pronome</Label>
                                <Input
                                    id="pronome"
                                    className="w-full"
                                    defaultValue={(auth.user as { pronome?: string }).pronome ?? ''}
                                    name="pronome"
                                    autoComplete="off"
                                    placeholder="ex: ela/dela, ele/dele, elu/delu"
                                    maxLength={60}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Opcional. Como você gostaria de ser chamado(a).
                                </p>
                                <InputError message={errors.pronome} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">E-mail</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    className="w-full"
                                    defaultValue={auth.user.email}
                                    name="email"
                                    required
                                    autoComplete="username"
                                    placeholder="seu@email.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            {mustVerifyEmail && auth.user.email_verified_at === null && (
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Seu e-mail não foi verificado.{' '}
                                        <Link
                                            href={send()}
                                            as="button"
                                            className="text-primary underline underline-offset-4"
                                        >
                                            Reenviar e-mail de verificação.
                                        </Link>
                                    </p>
                                    {status === 'verification-link-sent' && (
                                        <p className="mt-2 text-sm font-medium text-green-600">
                                            Link de verificação enviado.
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center gap-4 pt-2">
                                <Button disabled={processing}>Salvar</Button>
                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition ease-in-out"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-sm text-green-600">Salvo!</p>
                                </Transition>
                            </div>
                        </>
                    )}
                </Form>
            </section>
        </SaferAppLayout>
    );
}
