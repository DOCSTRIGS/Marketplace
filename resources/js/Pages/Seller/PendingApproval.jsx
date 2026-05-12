import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';

export default function PendingApproval({ shop }) {
    const { auth } = usePage().props;

    return (
        <SellerLayout>
            <Head title="Boutique en attente - LoméShop" />
            
            <div className="max-w-4xl mx-auto py-12">
                <div className="bg-white rounded-[40px] shadow-2xl shadow-[#8B4513]/5 p-12 text-center border border-gray-100 relative overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-[#8B4513]"></div>
                    <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#8B4513]/5 rounded-full"></div>
                    
                    <div className="mb-8 relative">
                        <div className="w-24 h-24 bg-[#8B4513]/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                            <svg className="w-12 h-12 text-[#8B4513]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>

                    <h1 className="text-4xl font-black text-gray-900 mb-4 leading-tight">
                        Presque prêt, <span className="text-[#8B4513]">{shop?.name || 'Cher Vendeur'}</span> !
                    </h1>
                    
                    <p className="text-xl text-gray-500 font-medium leading-relaxed mb-10 max-w-2xl mx-auto">
                        Votre boutique a été créée avec succès. Notre équipe examine actuellement vos informations pour garantir la qualité de la plateforme. 
                    </p>

                    <div className="inline-block mb-10">
                        <span className="text-sm font-black uppercase tracking-widest text-orange-500 bg-orange-50 px-6 py-3 rounded-full border border-orange-100">
                            Statut actuel : En attente de validation
                        </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 text-left mb-10">
                        <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Pourquoi cette attente ?</p>
                            <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                Nous vérifions chaque vendeur pour assurer une expérience premium. Cela prend généralement moins de 24h.
                            </p>
                        </div>
                        <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Prochaines étapes</p>
                            <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                Une fois approuvé, vous pourrez ajouter vos produits, configurer votre wallet et commencer à vendre !
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link 
                            href={route('home')}
                            className="w-full sm:w-auto px-8 py-4 bg-[#1a1a1a] text-white font-black rounded-2xl hover:bg-black transition-all shadow-lg shadow-gray-200 uppercase tracking-widest text-xs"
                        >
                            Retour à l'accueil
                        </Link>
                        <button className="w-full sm:w-auto px-8 py-4 bg-white text-gray-600 font-black rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all uppercase tracking-widest text-xs">
                            Contacter le support
                        </button>
                    </div>
                </div>

                <div className="mt-12 flex items-center justify-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Serveur Opérationnel</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#8B4513]"></div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sécurisé par LoméPay</span>
                    </div>
                </div>
            </div>
        </SellerLayout>
    );
}
