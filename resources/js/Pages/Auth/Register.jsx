import React, { useState } from 'react';
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
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    
    const isSeller = data.role === 'seller';
    const brandColor = isSeller ? '#D35400' : '#8B4513';
    const brandBg = isSeller ? 'bg-[#D35400] hover:bg-[#b84600]' : 'bg-[#8B4513] hover:bg-[#70360f]';
    const brandRing = isSeller ? 'focus:ring-[#D35400] focus:border-[#D35400]' : 'focus:ring-[#8B4513] focus:border-[#8B4513]';
    const brandText = isSeller ? 'text-[#D35400]' : 'text-[#8B4513]';
    const brandHoverText = isSeller ? 'hover:text-[#D35400]' : 'hover:text-[#8B4513]';
    const brandShadow = isSeller ? 'shadow-[#D35400]/20' : 'shadow-[#8B4513]/20';
    const bgBadge = isSeller ? 'bg-[#FEF3EB] text-[#D35400]' : 'bg-[#FDEAE2] text-[#E67E22]';

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const renderFormContent = () => (
        <form onSubmit={submit} className="space-y-5">
            <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Nom complet</label>
                <TextInput
                    id="name"
                    name="name"
                    value={data.name}
                    className={`mt-1 block w-full rounded-2xl border-gray-200 ${brandRing}`}
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
                    className={`mt-1 block w-full rounded-2xl border-gray-200 ${brandRing}`}
                    autoComplete="username"
                    onChange={(e) => setData('email', e.target.value)}
                    required
                />
                <InputError message={errors.email} className="mt-2" />
            </div>

            <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Mot de passe</label>
                <div className="relative">
                    <TextInput
                        id="password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={data.password}
                        className={`mt-1 block w-full rounded-2xl border-gray-200 pr-10 ${brandRing}`}
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 ${brandText}/60 hover:${brandText} focus:outline-none transition-colors`}
                    >
                        <span className="text-[10px] font-black uppercase tracking-tighter">
                            {showPassword ? "Masquer" : "Afficher"}
                        </span>
                        {showPassword ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        )}
                    </button>
                </div>
                <InputError message={errors.password} className="mt-2" />
            </div>

            <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Confirmer le mot de passe</label>
                <div className="relative">
                    <TextInput
                        id="password_confirmation"
                        type={showPasswordConfirmation ? "text" : "password"}
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className={`mt-1 block w-full rounded-2xl border-gray-200 pr-10 ${brandRing}`}
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 ${brandText}/60 hover:${brandText} focus:outline-none transition-colors`}
                    >
                        <span className="text-[10px] font-black uppercase tracking-tighter">
                            {showPasswordConfirmation ? "Masquer" : "Afficher"}
                        </span>
                        {showPasswordConfirmation ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        )}
                    </button>
                </div>
                <InputError message={errors.password_confirmation} className="mt-2" />
            </div>

            <div className="pt-4 flex flex-col items-center gap-4">
                <button 
                    type="submit"
                    disabled={processing}
                    className={`w-full py-4 text-white font-black rounded-2xl uppercase tracking-widest text-xs shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 ${brandBg} ${brandShadow}`}
                >
                    Créer mon compte
                </button>

                <Link
                    href={route('login')}
                    className={`text-xs font-bold text-gray-400 ${brandHoverText} transition-colors`}
                >
                    Déjà inscrit ? Se connecter
                </Link>
            </div>
        </form>
    );

    return (
        <GuestLayout maxWidth={isSeller ? 'sm:max-w-5xl' : 'sm:max-w-md'}>
            <Head title={isSeller ? "Créer ma Boutique - LoméShop" : "Inscription - LoméShop"} />
            
            {isSeller ? (
                <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-start py-2">
                    {/* Left Column: Seller Guide */}
                    <div className="md:col-span-7 space-y-6 md:pr-8 md:border-r border-gray-100">
                        <div>
                            <span className={`inline-block px-3 py-1 ${bgBadge} text-[10px] font-black rounded-full uppercase tracking-widest mb-3`}>Portail Vendeur</span>
                            <h2 className="text-3xl font-black text-[#1a1a1a] tracking-tight leading-none mb-3">
                                Lancez votre boutique <br />sur <span className="text-[#D35400]">LoméShop</span>
                            </h2>
                            <p className="text-gray-500 text-sm font-medium leading-relaxed">
                                Rejoignez les commerçants de la capitale. Digitalisez vos ventes et gérez vos stocks en toute simplicité.
                            </p>
                        </div>

                        {/* Guide Steps */}
                        <div className="space-y-4">
                            <div className="flex gap-4 items-start p-3 rounded-2xl hover:bg-orange-50/20 transition-all">
                                <div className="w-10 h-10 bg-[#FEF3EB] text-[#D35400] rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                                    <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="text-xs font-black text-[#1a1a1a] uppercase tracking-wider">1. Ajout de produits simple</h4>
                                    <p className="text-gray-400 text-[11px] font-medium leading-relaxed">
                                        Ajoutez vos articles avec descriptions et photos. Fixez vos prix librement et gérez vos stocks à tout moment depuis votre tableau de bord.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start p-3 rounded-2xl hover:bg-orange-50/20 transition-all">
                                <div className="w-10 h-10 bg-[#FEF3EB] text-[#D35400] rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                                    <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="text-xs font-black text-[#1a1a1a] uppercase tracking-wider">2. Commission fixe de 10%</h4>
                                    <p className="text-gray-400 text-[11px] font-medium leading-relaxed">
                                        Pas de frais fixes ni d'abonnements. Nous ne prélevons une commission fixe de 10% que sur les ventes effectivement réalisées.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start p-3 rounded-2xl hover:bg-orange-50/20 transition-all">
                                <div className="w-10 h-10 bg-[#FEF3EB] text-[#D35400] rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                                    <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="text-xs font-black text-[#1a1a1a] uppercase tracking-wider">3. Retraits de gains en 24h</h4>
                                    <p className="text-gray-400 text-[11px] font-medium leading-relaxed">
                                        Retirez vos gains accumulés de manière sécurisée sous 24 heures vers vos comptes TMoney, Flooz ou directement par virement bancaire.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Extra info badge */}
                        <div className="bg-[#FEF3EB]/60 rounded-2xl p-4 border border-orange-100/30 flex items-center gap-3">
                            <span className="text-xs font-black bg-[#D35400] text-white px-2 py-1 rounded-md shrink-0">TG</span>
                            <p className="text-[11px] font-bold text-gray-500 leading-normal">
                                LoméShop valorise le savoir-faire local. Notre support vendeur est là pour vous accompagner dans la numérisation et la mise en valeur de votre catalogue.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Register Form */}
                    <div className="md:col-span-5 space-y-4 pt-4 md:pt-0">
                        <div className="text-center md:text-left mb-4">
                            <h3 className="text-xl font-black text-[#1a1a1a] uppercase tracking-tighter">Créer mon compte</h3>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Inscription rapide en 2 minutes</p>
                        </div>
                        {renderFormContent()}
                    </div>
                </div>
            ) : (
                /* Client/Buyer simple layout */
                <>
                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-black text-[#1a1a1a] uppercase tracking-tighter">
                            Rejoindre LoméShop
                        </h2>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                            Compte Acheteur
                        </p>
                    </div>
                    {renderFormContent()}
                </>
            )}
        </GuestLayout>
    );
}
