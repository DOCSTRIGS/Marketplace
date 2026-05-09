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
                                Découvrez les <br /> trésors de <br /> <span className="text-[#8B4513]">Lomé</span>
                            </h2>
                            <p className="text-gray-500 text-lg leading-relaxed mb-12 max-w-md font-medium">
                                Accédez aux meilleures boutiques de la capitale depuis votre écran. Une sélection unique de produits locaux livrés chez vous.
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
                                <img src="https://images.unsplash.com/photo-1590736962386-896894b8e235?w=1200&auto=format&fit=crop" alt="Artisanat" className="w-full h-full object-cover" />
                                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur p-6 rounded-2xl shadow-lg border border-gray-100">
                                    <h4 className="text-[10px] font-black text-[#8B4513] uppercase tracking-[0.2em] mb-2">Artisanat Local</h4>
                                    <p className="text-[10px] text-gray-500 font-medium">Soutenir les créateurs de notre communauté.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {onboardingStep === 1 && (
                    /* STEP 2: SOUTENEZ L'ARTISANAT (IMAGE 3) */
                    <div className="flex-grow flex flex-col items-center justify-center py-20 px-10">
                        <h1 className="text-2xl font-black text-[#8B4513] mb-20 italic">LoméShop</h1>
                        <div className="flex flex-col md:flex-row items-center gap-16 max-w-6xl w-full">
                            <div className="flex-1">
                                <div className="relative w-full aspect-square rounded-[40px] overflow-hidden bg-gray-50 p-6 shadow-xl">
                                    <img src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200&auto=format&fit=crop" alt="Produits Locaux" className="w-full h-full object-cover rounded-[32px]" />
                                    <div className="absolute bottom-10 left-10">
                                        <span className="bg-[#8B4513] text-white text-[10px] font-bold px-4 py-2 rounded-lg flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M7 2a2 2 0 00-2 2v1h14V4a2 2 0 00-2-2H7zM5 19a2 2 0 002 2h10a2 2 0 002-2v-5H5v5z"/></svg>
                                            ARTISANAT 228
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 max-w-md">
                                <span className="text-[#8B4513] text-[10px] font-black tracking-widest uppercase mb-6 block">Étape 02 / 03</span>
                                <h2 className="text-[56px] font-black text-[#1a1a1a] leading-tight mb-8 tracking-tighter">
                                    Soutenez <br /> l'artisanat <br /> local
                                </h2>
                                <p className="text-gray-500 text-lg leading-relaxed mb-12 font-medium">
                                    Chaque achat contribue directement au développement des créateurs et commerçants de votre quartier. Ensemble, valorisons le savoir-faire Togolais.
                                </p>
                                <div className="flex gap-2 mb-12">
                                    <div className="h-1.5 w-1.5 bg-gray-200 rounded-full"></div>
                                    <div className="h-1.5 w-8 bg-[#8B4513] rounded-full"></div>
                                    <div className="h-1.5 w-1.5 bg-gray-200 rounded-full"></div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <button onClick={nextOnboarding} className="px-10 py-5 bg-[#7B3F00] text-white font-black rounded-2xl text-lg shadow-xl hover:bg-[#5a2e00] transition-all flex items-center gap-2 group">
                                        Suivant 
                                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                                    </button>
                                    <button onClick={() => setView('selection')} className="text-gray-400 font-bold hover:text-[#8B4513] transition-colors">Passer</button>
                                </div>
                            </div>
                        </div>
                        <p className="mt-20 text-[10px] text-gray-400 font-bold uppercase tracking-widest">© 2024 LoméShop. Fabriqué avec soin au Togo.</p>
                    </div>
                )}

                {onboardingStep === 2 && (
                    /* STEP 3: PAYEZ EN TOUTE SIMPLICITE (IMAGE 4) */
                    <div className="flex-grow relative flex flex-col items-center justify-center overflow-hidden py-20 px-10">
                        <button onClick={() => setView('selection')} className="absolute top-12 right-12 text-[#8B4513] font-black text-xs uppercase tracking-widest">Passer</button>
                        
                        <div className="flex flex-col md:flex-row items-center gap-20 max-w-7xl w-full">
                            <div className="flex-1 max-w-xl">
                                <span className="text-gray-400 text-[10px] font-black tracking-widest uppercase mb-6 block bg-gray-100 w-fit px-3 py-1 rounded-full">Étape 03</span>
                                <h2 className="text-[64px] font-black text-[#8B4513] leading-[1.1] mb-8 tracking-tighter">
                                    Payez en toute <br /> simplicité
                                </h2>
                                <p className="text-gray-500 text-xl leading-relaxed mb-12 font-medium">
                                    Réglez vos commandes via Flooz ou T-Money et faites-vous livrer en moins d'une heure.
                                </p>
                                <div className="flex gap-2 mb-12">
                                    <div className="h-1.5 w-1.5 bg-gray-200 rounded-full"></div>
                                    <div className="h-1.5 w-1.5 bg-gray-200 rounded-full"></div>
                                    <div className="h-1.5 w-8 bg-[#8B4513] rounded-full"></div>
                                </div>
                            </div>
                            
                            <div className="flex-1 relative flex justify-center">
                                {/* Phone Mockup */}
                                <div className="relative w-[340px] h-[680px] bg-[#f0f0f0] rounded-[50px] border-[12px] border-[#e5e5e5] shadow-2xl overflow-hidden p-6 flex flex-col">
                                    <div className="w-12 h-12 bg-[#F3E6DE] rounded-2xl flex items-center justify-center mb-8 mx-auto mt-10">
                                        <svg className="w-6 h-6 text-[#7B3F00]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/></svg>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="bg-white rounded-2xl p-5 flex items-center justify-between border-2 border-orange-100 shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600 font-bold text-xs">MOOV</div>
                                                <div>
                                                    <p className="text-[11px] font-bold text-gray-800">Flooz</p>
                                                    <p className="text-[9px] text-gray-400">Paiement Mobile</p>
                                                </div>
                                            </div>
                                            <div className="w-4 h-4 rounded-full border-2 border-orange-500 flex items-center justify-center">
                                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-white rounded-2xl p-5 flex items-center justify-between border border-gray-100">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xs">TOGO</div>
                                                <div>
                                                    <p className="text-[11px] font-bold text-gray-800">T-Money</p>
                                                    <p className="text-[9px] text-gray-400">Paiement Mobile</p>
                                                </div>
                                            </div>
                                            <div className="w-4 h-4 rounded-full border border-gray-200"></div>
                                        </div>
                                    </div>

                                    <div className="mt-auto mb-10">
                                        <div className="bg-[#8B4513] text-white p-5 rounded-2xl text-center shadow-lg">
                                            <p className="text-[9px] font-medium opacity-80 mb-1">Confirmation de livraison</p>
                                            <p className="text-[11px] font-black">Moins de 60 mins</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Delivery Badge */}
                                <div className="absolute bottom-20 -right-10 bg-white p-6 rounded-3xl shadow-2xl flex items-center gap-4 border border-gray-50">
                                    <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black text-gray-800">Livraison Express</p>
                                        <p className="text-[9px] text-gray-400 font-medium">Suivi en temps réel activé</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Final Button */}
                        <div className="w-full max-w-7xl mt-20 flex justify-between items-center border-t border-gray-100 pt-12">
                            <div className="flex items-center gap-3">
                                <span className="text-xl">🇹🇬</span>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">LoméShop — Le cœur du commerce Togolais</p>
                            </div>
                            <button onClick={() => setView('selection')} className="px-16 py-6 bg-[#8B4513] text-white font-black rounded-2xl text-2xl shadow-2xl shadow-[#8B4513]/30 hover:scale-105 transition-all">
                                Commencer
                            </button>
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
                    <div className="group relative bg-white border-2 border-gray-100 rounded-[40px] overflow-hidden shadow-xl hover:border-[#8B4513]/30 transition-all duration-500">
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                            <img src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800" alt="Retail Products" className="w-full h-full object-cover" />
                        </div>
                        <div className="relative p-12 flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-[#F5E6DA] rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                <svg className="w-10 h-10 text-[#8B4513]" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C9.24 2 7 4.24 7 7V8H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2h-1V7c0-2.76-2.24-5-5-5zm0 2c1.66 0 3 1.34 3 3v1H9V7c0-1.66 1.34-3 3-3zm0 10c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                                </svg>
                            </div>
                            <h2 className="text-3xl font-black text-[#1a1a1a] mb-4">Je suis Acheteur</h2>
                            <p className="text-gray-500 mb-10 text-sm leading-relaxed font-medium">Trouvez les meilleurs produits <br /> et faites-vous livrer rapidement.</p>
                            <Link 
                                href={route('home')}
                                className="w-full py-5 bg-[#8B4513] text-white font-black rounded-2xl text-lg hover:bg-[#70360f] transition-all shadow-xl shadow-[#8B4513]/20"
                            >
                                Accéder au Shopping
                            </Link>
                            <div className="mt-8 flex gap-4 text-[10px] font-black text-[#8B4513] uppercase tracking-widest">
                                <Link href={route('login', { role: 'client' })} className="hover:underline">Connexion</Link>
                                <span className="text-gray-200">|</span>
                                <Link href={route('register', { role: 'client' })} className="hover:underline">S'inscrire</Link>
                            </div>
                        </div>
                    </div>

                    {/* Card Vendeur */}
                    <div className="group relative bg-white border-2 border-gray-100 rounded-[40px] overflow-hidden shadow-xl hover:border-[#D35400]/30 transition-all duration-500">
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                            <img src="https://images.unsplash.com/photo-1511317558616-384d721a3788?w=800" alt="Artisan Workspace" className="w-full h-full object-cover" />
                        </div>
                        <div className="relative p-12 flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-[#FEF3EB] rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                <svg className="w-10 h-10 text-[#D35400]" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2c0 .55.45 1 1 1v5h10v-5h4v5h2v-5c.55 0 1-.45 1-1zM9 18H5v-4h4v4zm8 0h-4v-4h4v4z"/>
                                </svg>
                            </div>
                            <h2 className="text-3xl font-black text-[#1a1a1a] mb-4">Je suis Vendeur</h2>
                            <p className="text-gray-500 mb-10 text-sm leading-relaxed font-medium">Ouvrez votre boutique <br /> et commencez à vendre dès aujourd'hui.</p>
                            <Link 
                                href={route('shops.create')}
                                className="w-full py-5 border-2 border-[#D35400] text-[#D35400] font-black rounded-2xl text-lg hover:bg-[#D35400] hover:text-white transition-all shadow-xl shadow-[#D35400]/10"
                            >
                                Ouvrir ma boutique
                            </Link>
                            <div className="mt-8 flex gap-4 text-[10px] font-black text-[#D35400] uppercase tracking-widest">
                                <Link href={route('seller.dashboard')} className="hover:underline">Dashboard (Démo)</Link>
                                <span className="text-gray-200">|</span>
                                <p className="text-gray-300">Vendeur vérifié</p>
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
