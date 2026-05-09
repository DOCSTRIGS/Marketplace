import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Connexion" />
            <div className="mb-8 text-center">
                <h2 className="text-2xl font-black text-[#1a1a1a] uppercase tracking-tighter">
                    Bon retour parmi nous
                </h2>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                    Accédez à votre espace sécurisé
                </p>
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Email</label>
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full rounded-2xl border-gray-200 focus:ring-[#8B4513] focus:border-[#8B4513]"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Mot de passe</label>
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full rounded-2xl border-gray-200 focus:ring-[#8B4513] focus:border-[#8B4513]"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center cursor-pointer group">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <span className="ms-2 text-xs font-bold text-gray-400 group-hover:text-gray-600 transition-colors">
                            Rester connecté
                        </span>
                    </label>
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-xs font-bold text-[#8B4513] hover:underline"
                        >
                            Oublié ?
                        </Link>
                    )}
                </div>

                <div className="pt-4 flex flex-col items-center gap-6">
                    <button 
                        type="submit"
                        disabled={processing}
                        className="w-full py-4 bg-[#8B4513] text-white font-black rounded-2xl uppercase tracking-tighter shadow-xl shadow-[#8B4513]/20 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        Se connecter
                    </button>
                    
                    <p className="text-xs font-bold text-gray-400">
                        Nouveau ici ?{' '}
                        <Link href={route('role.selection')} className="text-[#8B4513] hover:underline">
                            Créer un compte
                        </Link>
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}
