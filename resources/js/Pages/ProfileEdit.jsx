import React from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { Transition } from '@headlessui/react';

export default function ProfileEdit({ mustVerifyEmail, status }) {
    const { auth } = usePage().props;
    const user = auth?.user;

    if (!user) {
        return <div className="p-10 text-center">Chargement ou non autorisé...</div>;
    }

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name || '',
        email: user.email || '',
    });

    const { data: passwordData, setData: setPasswordData, put: updatePassword, errors: passwordErrors, processing: passwordProcessing, recentlySuccessful: passwordRecentlySuccessful, reset: resetPassword } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const safeRoute = (name, params = {}) => {
        try {
            return typeof route !== 'undefined' ? route(name, params) : '#';
        } catch (e) {
            console.error('Route error:', e);
            return '#';
        }
    };

    const submitProfile = (e) => {
        e.preventDefault();
        patch(safeRoute('profile.update'));
    };

    const submitPassword = (e) => {
        e.preventDefault();
        updatePassword(safeRoute('password.update'), {
            preserveScroll: true,
            onSuccess: () => resetPassword(),
        });
    };

    return (
        <div className="min-h-screen bg-[#FDF8F4] dark:bg-[#121212] transition-colors duration-300">
            <Head title="Mon Profil" />
            <Navbar />

            <main className="max-w-4xl mx-auto py-12 px-6">
                <h2 className="text-3xl font-bold text-[#333333] dark:text-white mb-8">Paramètres du compte</h2>

                <div className="grid gap-8">
                    {/* Profile Information */}
                    <section className="bg-white dark:bg-[#1e1e1e] p-8 rounded-2xl shadow-sm border border-[#F2E8DF] dark:border-gray-800 transition-colors">
                        <header className="mb-6">
                            <h3 className="text-xl font-bold text-[#D35400]">Informations du profil</h3>
                            <p className="text-gray-500 text-sm">Mettez à jour les informations de profil et l'adresse e-mail de votre compte.</p>
                        </header>

                        <form onSubmit={submitProfile} className="space-y-6 max-w-xl">
                            <div>
                                <InputLabel htmlFor="name" value="Nom complet" />
                                <TextInput
                                    id="name"
                                    className="mt-1 block w-full"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    isFocused
                                    autoComplete="name"
                                />
                                <InputError className="mt-2" message={errors.name} />
                            </div>

                            <div>
                                <InputLabel htmlFor="email" value="Adresse Email" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    autoComplete="username"
                                />
                                <InputError className="mt-2" message={errors.email} />
                            </div>

                            <div className="flex items-center gap-4 pt-2">
                                <PrimaryButton disabled={processing}>Enregistrer les modifications</PrimaryButton>
                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition ease-in-out"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-sm text-green-600 font-medium">Enregistré.</p>
                                </Transition>
                            </div>
                        </form>
                    </section>

                    {/* Update Password */}
                    <section className="bg-white dark:bg-[#1e1e1e] p-8 rounded-2xl shadow-sm border border-[#F2E8DF] dark:border-gray-800 transition-colors">
                        <header className="mb-6">
                            <h3 className="text-xl font-bold text-[#D35400]">Changer le mot de passe</h3>
                            <p className="text-gray-500 text-sm">Assurez-vous que votre compte utilise un mot de passe long et aléatoire pour rester en sécurité.</p>
                        </header>

                        <form onSubmit={submitPassword} className="space-y-6 max-w-xl">
                            <div>
                                <InputLabel htmlFor="current_password" value="Mot de passe actuel" />
                                <TextInput
                                    id="current_password"
                                    type="password"
                                    className="mt-1 block w-full"
                                    value={passwordData.current_password}
                                    onChange={(e) => setPasswordData('current_password', e.target.value)}
                                    autoComplete="current-password"
                                />
                                <InputError message={passwordErrors.current_password} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="password" value="Nouveau mot de passe" />
                                <TextInput
                                    id="password"
                                    type="password"
                                    className="mt-1 block w-full"
                                    value={passwordData.password}
                                    onChange={(e) => setPasswordData('password', e.target.value)}
                                    autoComplete="new-password"
                                />
                                <InputError message={passwordErrors.password} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="password_confirmation" value="Confirmer le mot de passe" />
                                <TextInput
                                    id="password_confirmation"
                                    type="password"
                                    className="mt-1 block w-full"
                                    value={passwordData.password_confirmation}
                                    onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
                                    autoComplete="new-password"
                                />
                                <InputError message={passwordErrors.password_confirmation} className="mt-2" />
                            </div>

                            <div className="flex items-center gap-4 pt-2">
                                <PrimaryButton disabled={passwordProcessing}>Mettre à jour le mot de passe</PrimaryButton>
                                <Transition
                                    show={passwordRecentlySuccessful}
                                    enter="transition ease-in-out"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-sm text-green-600 font-medium">Mis à jour.</p>
                                </Transition>
                            </div>
                        </form>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
