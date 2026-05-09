import React from 'react';
import { Head } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';

export default function Wallet() {
    const stats = [
        { name: 'Solde Total', value: '450 000 FCFA', change: '+12%', changeType: 'increase' },
        { name: 'En attente', value: '85 000 FCFA', change: '-2%', changeType: 'decrease' },
        { name: 'Retraits ce mois', value: '120 000 FCFA', change: '+5%', changeType: 'increase' },
    ];

    return (
        <SellerLayout>
            <Head title="Portefeuille - LoméShop" />
            
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Portefeuille & Finances</h1>
                <p className="text-gray-500 font-medium">Gérez vos gains et vos demandes de retrait.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.name}</p>
                        <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                        <div className="mt-2 flex items-center">
                            <span className={`text-xs font-bold ${stat.changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
                                {stat.change}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold ml-2 uppercase tracking-tight">vs mois dernier</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900">Historique des transactions</h3>
                    <button className="bg-[#8B4513] text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-[#8B4513]/20 hover:bg-[#7a2d09] transition-all">
                        Demander un retrait
                    </button>
                </div>
                <div className="p-12 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Aucune transaction ce mois-ci</p>
                </div>
            </div>
        </SellerLayout>
    );
}
