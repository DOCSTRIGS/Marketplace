import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';

export default function RoleSelection() {
    const { auth } = usePage().props;
    const [view, setView] = useState('splash'); // splash, onboarding, selection
    const [onboardingStep, setOnboardingStep] = useState(0);

    // Splash Screen timeout
    useEffect(() => {
        if (view === 'splash') {
            const timer = setTimeout(() => {
                setView('onboarding');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [view]);

    const nextOnboarding = () => {
        if (onboardingStep < 2) {
            setOnboardingStep(onboardingStep + 1);
        } else {
            setView('selection');
        }
    };

    // 1. SPLASH PAGE (IMAGE 1)
    if (view === 'splash') {
        return (
            <div className="min-h-screen bg-[#FDF8F6] flex flex-col items-center justify-center font-sans px-6">
                <Head title="LoméShop" />
                
                <div className="flex flex-col items-center max-w-4xl w-full">
                    {/* Logo Icon */}
                    <div className="w-12 h-12 bg-[#F3E6DE] rounded-xl flex items-center justify-center mb-10">
                        <svg className="w-6 h-6 text-[#7B3F00]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    </div>

                    <h1 className="text-[72px] font-black text-[#7B3F00] tracking-tighter leading-none mb-6">LoméShop</h1>
                    <p className="text-[#8B4513] text-lg font-medium mb-20 italic">L'artisanat de Lomé à votre portée</p>
                    
                    <div className="w-24 h-[1px] bg-[#D2B48C] mb-20"></div>

                    {/* Pillars */}
                    <div className="grid grid-cols-3 gap-12 text-center">
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8B4513] mb-4">Collection</h3>
                            <p className="text-[11px] text-gray-500 leading-relaxed font-medium">Curated by local artisans <br /> from the heart of Togo.</p>
                        </div>
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8B4513] mb-4">Authenticité</h3>
                            <p className="text-[11px] text-gray-500 leading-relaxed font-medium">Direct connection to West <br /> African craftsmanship.</p>
                        </div>
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8B4513] mb-4">Livraison</h3>
                            <p className="text-[11px] text-gray-500 leading-relaxed font-medium">Seamless experience from <br /> market to your doorstep.</p>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-8 left-8 text-[10px] font-bold text-[#D2B48C] uppercase tracking-widest">Est. 2024</div>
                <div className="absolute bottom-8 right-8 text-[10px] font-bold text-[#D2B48C] uppercase tracking-widest">Lomé, Togo</div>
            </div>
        );
    }

    // 2. ONBOARDING PAGES (IMAGES 2, 3, 4)
    if (view === 'onboarding') {
        return (
            <div className="min-h-screen bg-white flex flex-col font-sans">
                <Head title={`Bienvenue - Étape ${onboardingStep + 1}`} />

                {onboardingStep === 0 && (
                    /* STEP 1: DECOUVREZ LES TRESORS (IMAGE 2) */
                    <div className="flex-grow flex flex-col md:flex-row items-center justify-center px-10 md:px-20 gap-16 py-20">
                        <div className="flex-1 max-w-xl">
                            <span className="inline-block px-3 py-1 bg-[#FDEAE2] text-[#E67E22] text-[10px] font-black rounded-full uppercase tracking-widest mb-6">Bienvenue</span>
                            <h2 className="text-[64px] font-black text-[#1a1a1a] leading-[1.1] mb-8 tracking-tighter">
                                Vos boutiques <br /> préférées à <br /> <span className="text-[#8B4513]">Lomé</span>
                            </h2>
                            <p className="text-gray-500 text-lg leading-relaxed mb-12 max-w-md font-medium">
                                Explorez un large choix d'articles : mode, téléphones, ordinateurs, électroménager et produits locaux. Tout le commerce de Lomé à votre portée avec livraison rapide.
                            </p>
                            <div className="flex items-center gap-8">
                                <button onClick={nextOnboarding} className="px-10 py-5 bg-[#8B4513] text-white font-black rounded-2xl text-lg shadow-xl shadow-[#8B4513]/20 hover:bg-[#70360f] transition-all flex items-center gap-2 group">
                                    Suivant 
                                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                                </button>
                                <button onClick={() => setView('selection')} className="text-gray-400 font-bold hover:text-[#8B4513] transition-colors">Ignorer</button>
                            </div>
                            {/* Pagination Dots */}
                            <div className="flex gap-2 mt-16">
                                <div className="h-1.5 w-8 bg-[#8B4513] rounded-full"></div>
                                <div className="h-1.5 w-1.5 bg-gray-200 rounded-full"></div>
                                <div className="h-1.5 w-1.5 bg-gray-200 rounded-full"></div>
                            </div>
                        </div>
                        <div className="flex-1 relative">
                            <div className="relative w-full aspect-square rounded-[40px] overflow-hidden shadow-2xl">
                                <img src="https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&auto=format&fit=crop" alt="Boutique" className="w-full h-full object-cover" />
                                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur p-6 rounded-2xl shadow-lg border border-gray-100">
                                    <h4 className="text-[10px] font-black text-[#8B4513] uppercase tracking-[0.2em] mb-2">Shopping Local</h4>
                                    <p className="text-[10px] text-gray-500 font-medium">Vos boutiques favorites réunies sur une seule plateforme.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {onboardingStep === 1 && (
                    /* STEP 2: SOUTENEZ LE COMMERCE LOCAL (IMAGE 3) */
                    <div className="flex-grow flex flex-col md:flex-row items-center justify-center px-10 md:px-20 gap-16 py-20">
                        <div className="flex-1 max-w-xl">
                            <span className="inline-block px-3 py-1 bg-[#FDEAE2] text-[#E67E22] text-[10px] font-black rounded-full uppercase tracking-widest mb-6">Étape 02 / 03</span>
                            <h2 className="text-[64px] font-black text-[#1a1a1a] leading-[1.1] mb-8 tracking-tighter">
                                Soutenez <br /> le commerce <br /> <span className="text-[#8B4513]">local</span>
                            </h2>
                            <p className="text-gray-500 text-lg leading-relaxed mb-12 max-w-md font-medium">
                                Chaque commande sur LoméShop valorise le savoir-faire local et soutient directement les commerçants et créateurs de Lomé. Ensemble, dynamisons l'économie locale.
                            </p>
                            <div className="flex items-center gap-8">
                                <button onClick={nextOnboarding} className="px-10 py-5 bg-[#8B4513] text-white font-black rounded-2xl text-lg shadow-xl shadow-[#8B4513]/20 hover:bg-[#70360f] transition-all flex items-center gap-2 group">
                                    Suivant 
                                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                                </button>
                                <button onClick={() => setView('selection')} className="text-gray-400 font-bold hover:text-[#8B4513] transition-colors">Passer</button>
                            </div>
                            {/* Pagination Dots */}
                            <div className="flex gap-2 mt-16">
                                <div className="h-1.5 w-1.5 bg-gray-200 rounded-full"></div>
                                <div className="h-1.5 w-8 bg-[#8B4513] rounded-full"></div>
                                <div className="h-1.5 w-1.5 bg-gray-200 rounded-full"></div>
                            </div>
                        </div>
                        <div className="flex-1 relative">
                            <div className="relative w-full aspect-square rounded-[40px] overflow-hidden shadow-2xl">
                                <img src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200&auto=format&fit=crop" alt="Produits Locaux" className="w-full h-full object-cover" />
                                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur p-6 rounded-2xl shadow-lg border border-gray-100">
                                    <h4 className="text-[10px] font-black text-[#8B4513] uppercase tracking-[0.2em] mb-2">Boutiques 228</h4>
                                    <p className="text-[10px] text-gray-500 font-medium">Soutenir les créateurs et commerçants de votre quartier.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {onboardingStep === 2 && (
                    /* STEP 3: SECURITE & CONFIDENTIALITE */
                    <div className="flex-grow flex flex-col md:flex-row items-center justify-center px-10 md:px-20 gap-16 py-20">
                        <div className="flex-1 max-w-xl">
                            <span className="inline-block px-3 py-1 bg-[#FDEAE2] text-[#E67E22] text-[10px] font-black rounded-full uppercase tracking-widest mb-6">Étape 03 / 03</span>
                            <h2 className="text-[64px] font-black text-[#8B4513] leading-[1.1] mb-8 tracking-tighter">
                                Confidentialité <br /> & Sécurité
                            </h2>
                            <p className="text-gray-500 text-lg leading-relaxed mb-6 max-w-md font-medium">
                                Vos données personnelles et vos transactions sont entièrement protégées. Nous appliquons des protocoles stricts de sécurité pour garantir la confiance et la transparence de notre plateforme.
                            </p>
                            <p className="text-gray-400 text-xs leading-relaxed mb-12 max-w-md font-medium">
                                En continuant, vous confirmez avoir pris connaissance et accepter notre politique de confidentialité ainsi que nos conditions d'utilisation.
                            </p>
                            <div className="flex items-center gap-8">
                                <button onClick={() => setView('selection')} className="px-10 py-5 bg-[#8B4513] text-white font-black rounded-2xl text-lg shadow-xl shadow-[#8B4513]/20 hover:bg-[#70360f] transition-all flex items-center gap-2 group">
                                    Commencer 
                                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                                </button>
                                <button onClick={() => setView('selection')} className="text-gray-400 font-bold hover:text-[#8B4513] transition-colors">Passer</button>
                            </div>
                            {/* Pagination Dots */}
                            <div className="flex gap-2 mt-16">
                                <div className="h-1.5 w-1.5 bg-gray-200 rounded-full"></div>
                                <div className="h-1.5 w-1.5 bg-gray-200 rounded-full"></div>
                                <div className="h-1.5 w-8 bg-[#8B4513] rounded-full"></div>
                            </div>
                        </div>
                        <div className="flex-1 relative flex justify-center w-full">
                            {/* Security Dashboard Mockup */}
                            <div className="relative w-full max-w-[380px] aspect-square md:aspect-auto md:h-[500px] bg-[#FDF8F6] rounded-[40px] border-[8px] border-[#8B4513]/10 shadow-2xl p-6 flex flex-col justify-between overflow-hidden">
                                {/* Shield illustration header */}
                                <div className="flex flex-col items-center mt-2 text-center">
                                    <div className="w-16 h-16 bg-green-50 rounded-[20px] flex items-center justify-center mb-4 shadow-inner">
                                        <svg className="w-8 h-8 text-green-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <h4 className="text-base font-black text-[#1a1a1a]">Sécurité Activée</h4>
                                    <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Protection de bout en bout</p>
                                </div>

                                {/* Privacy settings simulator */}
                                <div className="space-y-3 my-4">
                                    <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-800">Chiffrement SSL</p>
                                                <p className="text-[8px] text-gray-400">Transactions sécurisées</p>
                                            </div>
                                        </div>
                                        <div className="w-8 h-4.5 bg-green-500 rounded-full p-0.5 flex items-center justify-end">
                                            <div className="w-3.5 h-3.5 bg-white rounded-full shadow-md"></div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944" /></svg>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-800">Respect vie privée</p>
                                                <p className="text-[8px] text-gray-400">Pas de partage de données</p>
                                            </div>
                                        </div>
                                        <div className="w-8 h-4.5 bg-green-500 rounded-full p-0.5 flex items-center justify-end">
                                            <div className="w-3.5 h-3.5 bg-white rounded-full shadow-md"></div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-7 h-7 bg-[#F3E6DE] rounded-lg flex items-center justify-center text-[#8B4513]">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-800">Confidentialité</p>
                                                <p className="text-[8px] text-gray-400">Norme CNDP Togo</p>
                                            </div>
                                        </div>
                                        <div className="w-8 h-4.5 bg-green-500 rounded-full p-0.5 flex items-center justify-end">
                                            <div className="w-3.5 h-3.5 bg-white rounded-full shadow-md"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Security badge at bottom */}
                                <div className="bg-[#8B4513] text-white p-3 rounded-xl text-center shadow-lg">
                                    <p className="text-[9px] font-black uppercase tracking-wider">LoméShop Trust & Safety</p>
                                </div>
                            </div>

                            {/* Floating Protection Badge */}
                            <div className="absolute bottom-6 -right-4 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-gray-50">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" /></svg>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-gray-800">Données Chiffrées</p>
                                    <p className="text-[7px] text-gray-400 font-bold uppercase tracking-wider">SSL Actif</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // 3. FINAL ROLE SELECTION
    return (
        <div className="min-h-screen bg-[#FDF8F6] flex flex-col items-center relative overflow-hidden font-sans">
            <Head title="Bienvenue sur LoméShop" />
            
            <div className="relative z-10 w-full max-w-7xl px-8 py-20 flex flex-col items-center">
                <div className="text-center mb-16">
                    <h1 className="text-[72px] font-black text-[#1a1a1a] mb-4 tracking-tighter">
                        Lomé<span className="text-[#8B4513]">Shop</span>
                    </h1>
                    <p className="text-gray-500 text-lg font-medium">La marketplace de Lomé — Tout à portée de main</p>
                </div>

                <div className="grid md:grid-cols-2 gap-10 w-full max-w-5xl">
                    {/* Card Acheteur */}
                    <div className="group relative bg-white border border-gray-100 rounded-[40px] overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500">
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                            <img src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800" alt="Shopping" className="w-full h-full object-cover" />
                        </div>
                        <div className="relative p-12 flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-[#F5E6DA] rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                <svg className="w-10 h-10 text-[#8B4513]" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C9.24 2 7 4.24 7 7V8H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2h-1V7c0-2.76-2.24-5-5-5zm0 2c1.66 0 3 1.34 3 3v1H9V7c0-1.66 1.34-3 3-3zm0 10c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                                </svg>
                            </div>
                            <h2 className="text-3xl font-black text-[#1a1a1a] mb-4 uppercase tracking-tighter">Je suis Acheteur</h2>
                            <p className="text-gray-400 mb-10 text-sm leading-relaxed font-medium">Parcourez les boutiques de Lomé <br /> et profitez d'une livraison express.</p>
                            
                            <Link
                                href={route('home')}
                                prefetch
                                className="w-full py-5 bg-[#8B4513] text-white font-black rounded-2xl text-lg hover:bg-[#70360f] transition-all shadow-xl shadow-[#8B4513]/20 uppercase tracking-widest text-[13px]"
                            >
                                Accéder à la boutique
                            </Link>

                            <div className="mt-10 pt-8 border-t border-gray-50 w-full flex justify-center gap-6 text-[11px] font-black uppercase tracking-widest">
                                <Link href={route('login', { role: 'client' })} prefetch className="text-[#8B4513] hover:underline">Se connecter</Link>
                                <span className="text-gray-200">|</span>
                                <Link href={route('register', { role: 'client' })} prefetch className="text-gray-400 hover:text-[#8B4513]">Créer un compte</Link>
                            </div>
                        </div>
                    </div>

                    {/* Card Vendeur */}
                    <div className="group relative bg-white border border-gray-100 rounded-[40px] overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500">
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                            <img src="https://images.unsplash.com/photo-1511317558616-384d721a3788?w=800" alt="Vendre" className="w-full h-full object-cover" />
                        </div>
                        <div className="relative p-12 flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-[#FEF3EB] rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                <svg className="w-10 h-10 text-[#D35400]" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2c0 .55.45 1 1 1v5h10v-5h4v5h2v-5c.55 0 1-.45 1-1zM9 18H5v-4h4v4zm8 0h-4v-4h4v4z"/>
                                </svg>
                            </div>
                            <h2 className="text-3xl font-black text-[#1a1a1a] mb-4 uppercase tracking-tighter">Je suis Vendeur</h2>
                            <p className="text-gray-400 mb-10 text-sm leading-relaxed font-medium">Digitalisez votre commerce <br /> et multipliez vos ventes aujourd'hui.</p>
                            
                            <Link
                                href={route('login', { role: 'seller' })}
                                prefetch
                                className="w-full py-5 bg-[#D35400] text-white font-black rounded-2xl text-lg hover:bg-[#b84600] transition-all uppercase tracking-widest text-[13px] shadow-xl shadow-[#D35400]/20 flex items-center justify-center"
                            >
                                Gérer ma boutique
                            </Link>

                            <div className="mt-10 pt-8 border-t border-gray-50 w-full flex justify-center gap-6 text-[11px] font-black uppercase tracking-widest">
                                <span className="text-gray-400">Nouveau vendeur ?</span>
                                <Link href={route('register', { role: 'seller' })} prefetch className="text-[#D35400] hover:underline">Créer ma boutique</Link>
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="mt-auto pt-24 text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">
                    © 2024 LoméShop • L'excellence à votre portée
                </footer>
            </div>
        </div>
    );
}
