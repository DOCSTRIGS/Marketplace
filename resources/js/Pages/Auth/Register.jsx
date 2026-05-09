import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register({ role }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: role || 'client',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Inscription" />
            <div className="mb-8 text-center">
                <h2 className="text-2xl font-black text-[#1a1a1a] uppercase tracking-tighter">
                    Rejoindre LoméShop
                </h2>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                    Compte {data.role === 'seller' ? 'Vendeur' : 'Acheteur'}
                </p>
            </div>

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Nom complet</label>
                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full rounded-2xl border-gray-200 focus:ring-[#8B4513] focus:border-[#8B4513]"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Email</label>
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full rounded-2xl border-gray-200 focus:ring-[#8B4513] focus:border-[#8B4513]"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
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
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Confirmer le mot de passe</label>
                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full rounded-2xl border-gray-200 focus:ring-[#8B4513] focus:border-[#8B4513]"
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                    />
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <div className="pt-4 flex flex-col items-center gap-4">
                    <button 
                        type="submit"
                        disabled={processing}
                        className="w-full py-4 bg-[#8B4513] text-white font-black rounded-2xl uppercase tracking-tighter shadow-xl shadow-[#8B4513]/20 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        Créer mon compte
                    </button>

                    <Link
                        href={route('login')}
                        className="text-xs font-bold text-gray-400 hover:text-[#8B4513] transition-colors"
                    >
                        Déjà inscrit ? Se connecter
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
