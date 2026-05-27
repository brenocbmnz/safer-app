import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    return (
        <AuthLayout
            title="Bem-vindo de volta!"
            description=""
        >
            <Head title="Entrar" />

            {status && (
                <div className="text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-4"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="flex flex-col gap-3">
                            <div>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="Endereço de e-mail"
                                    className="h-12 w-full rounded-2xl bg-stone-100 px-4 text-sm text-stone-800 placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-[#4a6741]/40"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Senha"
                                    className="h-12 w-full rounded-2xl bg-stone-100 px-4 text-sm text-stone-800 placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-[#4a6741]/40"
                                />
                                <InputError message={errors.password} />
                            </div>
                        </div>

                        <button
                            type="submit"
                            tabIndex={3}
                            disabled={processing}
                            data-test="login-button"
                            className="flex h-12 w-full items-center justify-center rounded-full bg-[#4a6741] text-xs font-bold tracking-widest text-white uppercase shadow transition-opacity hover:opacity-90 disabled:opacity-60"
                        >
                            {processing && <Spinner />}
                            Entrar
                        </button>

                        {canResetPassword && (
                            <div className="text-center">
                                <TextLink
                                    href={request()}
                                    className="text-sm text-stone-400 hover:text-stone-600"
                                    tabIndex={4}
                                >
                                    Esqueceu a senha?
                                </TextLink>
                            </div>
                        )}

                        {canRegister && (
                            <div className="mt-4 text-center">
                                <TextLink
                                    href={register()}
                                    className="text-xs font-semibold tracking-widest text-stone-400 uppercase hover:text-stone-600"
                                    tabIndex={5}
                                >
                                    Não tem uma conta? Cadastre-se
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
