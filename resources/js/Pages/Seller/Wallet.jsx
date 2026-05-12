import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import EmptyState from '@/Components/EmptyState';

export default function Wallet({ withdrawals, balance }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        amount: '',
        payment_method: 'Flooz',
        payment_details: '',
    });

    const stats = [
        { name: 'Solde Disponible', value: new Intl.NumberFormat('fr-TG', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(balance), color: 'text-green-600' },
        { name: 'Retraits en attente', value: new Intl.NumberFormat('fr-TG', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(withdrawals.filter(w => w.status === 'pending').reduce((acc, w) => acc + parseFloat(w.amount), 0)), color: 'text-orange-600' },
        { name: 'Total Retiré', value: new Intl.NumberFormat('fr-TG', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(withdrawals.filter(w => w.status === 'approved').reduce((acc, w) => acc + parseFloat(w.amount), 0)), color: 'text-gray-900' },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('seller.wallet.withdraw'), {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
            }
        });
    };

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
                        <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-gray-900">Historique des retraits</h3>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-[#8B4513] text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-[#8B4513]/20 hover:bg-[#7a2d09] transition-all"
                    >
                        Demander un retrait
                    </button>
                </div>

                <div className="overflow-x-auto">
                    {withdrawals.length > 0 ? (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Montant</th>
                                    <th className="px-6 py-4">Méthode</th>
                                    <th className="px-6 py-4">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {withdrawals.map((w) => (
                                    <tr key={w.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-xs font-bold text-gray-500">
                                            {new Date(w.created_at).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-black text-gray-900">
                                            {new Intl.NumberFormat('fr-TG').format(w.amount)} F
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-gray-600">
                                            {w.payment_method}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                w.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                w.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-orange-100 text-orange-700'
                                            }`}>
                                                {w.status === 'approved' ? 'Approuvé' : w.status === 'rejected' ? 'Rejeté' : 'En attente'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <EmptyState 
                            title="Aucun retrait"
                            description="Vous n'avez pas encore effectué de demande de retrait."
                            actionText="Demander un retrait"
                            onAction={() => setIsModalOpen(true)}
                        />
                    )}
                </div>
            </div>

            {/* Withdrawal Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#FDF8F4]">
                            <h3 className="text-xl font-bold text-gray-900">Demande de Retrait</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l18 18" />
                                </svg>
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Montant (FCFA)</label>
                                <input 
                                    type="number" 
                                    value={data.amount}
                                    onChange={e => setData('amount', e.target.value)}
                                    className="w-full rounded-xl border-gray-200 focus:ring-[#8B4513] focus:border-[#8B4513] font-bold"
                                    placeholder="Min. 5000"
                                    required
                                />
                                {errors.amount && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.amount}</p>}
                                <p className="text-[10px] text-gray-400 mt-1 italic">Votre solde : {new Intl.NumberFormat('fr-TG').format(balance)} F</p>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Méthode de paiement</label>
                                <select 
                                    value={data.payment_method}
                                    onChange={e => setData('payment_method', e.target.value)}
                                    className="w-full rounded-xl border-gray-200 focus:ring-[#8B4513] focus:border-[#8B4513] font-bold"
                                >
                                    <option value="Flooz">Moov Money (Flooz)</option>
                                    <option value="T-Money">TogoCom (T-Money)</option>
                                    <option value="Bank">Virement Bancaire</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Numéro ou Détails</label>
                                <input 
                                    type="text" 
                                    value={data.payment_details}
                                    onChange={e => setData('payment_details', e.target.value)}
                                    className="w-full rounded-xl border-gray-200 focus:ring-[#8B4513] focus:border-[#8B4513] font-bold"
                                    placeholder="Ex: 90 00 00 00"
                                    required
                                />
                                {errors.payment_details && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.payment_details}</p>}
                            </div>

                            <button 
                                type="submit" 
                                disabled={processing || balance < parseFloat(data.amount || 0)}
                                className="w-full py-4 bg-[#8B4513] text-white font-black rounded-2xl hover:bg-[#7a2d09] transition-all disabled:opacity-50 shadow-xl shadow-[#8B4513]/20 uppercase tracking-widest text-sm"
                            >
                                {processing ? 'Envoi...' : 'Confirmer le retrait'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </SellerLayout>
    );
}
