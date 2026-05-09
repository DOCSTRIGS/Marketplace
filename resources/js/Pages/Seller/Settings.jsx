import React from 'react';
import { Head } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';

export default function Settings() {
    return (
        <SellerLayout>
            <Head title="Paramètres - LoméShop" />
            
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Paramètres de la boutique</h1>
                <p className="text-gray-500 font-medium">Configurez vos préférences et vos informations de profil.</p>
            </div>

            <div className="max-w-3xl space-y-6">
                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-6">Informations Générales</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Nom Complet</label>
                                <input type="text" className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm" defaultValue="Moussa Traoré" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Email</label>
                                <input type="email" className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm" defaultValue="moussa@lome.shop" />
                            </div>
                        </div>
                        <button className="bg-[#8B4513] text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-[#8B4513]/20 hover:bg-[#7a2d09] transition-all">
                            Sauvegarder les modifications
                        </button>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-6 text-red-600">Zone de Danger</h3>
                    <p className="text-xs text-gray-400 mb-4">Ces actions sont irréversibles.</p>
                    <button className="border-2 border-red-100 text-red-600 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-50 transition-all">
                        Fermer temporairement la boutique
                    </button>
                </div>
            </div>
        </SellerLayout>
    );
}
