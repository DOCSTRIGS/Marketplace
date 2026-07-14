import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { motion } from 'framer-motion';
import { useToast } from '@/Contexts/ToastContext';

export default function Wallet({ shop, transactions, withdrawals, balance, reports, lastSaleDate }) {
    const { addToast } = useToast();
    const { data, setData, post, processing, reset, errors } = useForm({
        amount: '',
        payment_method: 'Flooz',
        payment_details: '',
    });

    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

    const formatPrice = (price) => new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';

    const submit = (e) => {
        e.preventDefault();
        post(route('seller.wallet.withdraw'), {
            onSuccess: () => {
                addToast('Demande de retrait envoyée !', 'success');
                setIsWithdrawModalOpen(false);
                reset();
            }
        });
    };

    return (
        <SellerLayout>
            <Head title="Portefeuille & Finances" />

            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Finances & Portefeuille</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Gérez vos gains et demandez vos retraits en toute sécurité.</p>
                </div>
                <button 
                    onClick={() => setIsWithdrawModalOpen(true)}
                    className="bg-[#8B4513] text-white px-6 py-3 rounded-2xl font-black uppercase text-xs shadow-xl shadow-[#8B4513]/20 hover:bg-[#70360f] transition-all"
                >
                    Retirer des fonds
                </button>
            </div>

            {/* Monthly Reports Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Revenus (Ce mois)</p>
                    <h4 className="text-xl font-black text-gray-900 dark:text-white mb-2">{formatPrice(reports?.thisMonthEarnings || 0)}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${reports?.growth >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {reports?.growth >= 0 ? '↑' : '↓'} {Math.abs(reports?.growth || 0)}% vs mois dernier
                    </span>
                </div>
                <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Commandes (Ce mois)</p>
                    <h4 className="text-xl font-black text-gray-900 dark:text-white mb-2">{reports?.totalOrders || 0}</h4>
                    <p className="text-[10px] text-gray-500 font-medium">Volume total traité</p>
                </div>
                <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Commissions LoméShop</p>
                    <h4 className="text-xl font-black text-red-500 mb-2">{formatPrice(reports?.commissions || 0)}</h4>
                    <p className="text-[10px] text-gray-500 font-medium">Frais de service déduits</p>
                </div>
                <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Statut KYC</p>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg flex items-center justify-center">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                        </div>
                        <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase">Vérifié</span>
                    </div>
                </div>
            </div>

            {/* Balance Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="md:col-span-2 bg-[#8B4513] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl"
                >
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Solde Actuel Disponible</p>
                        <h3 className="text-5xl font-black mb-8 tracking-tighter">{formatPrice(balance)}</h3>
                        <div className="flex gap-12">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Boutique</p>
                                <p className="text-sm font-bold uppercase">{shop?.name}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Dernière vente</p>
                                <p className="text-sm font-bold capitalize">{lastSaleDate || 'Aucune vente'}</p>
                            </div>
                        </div>
                    </div>
                    {/* Decorative Circles */}
                    <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-[-100px] left-[-20px] w-48 h-48 bg-black/10 rounded-full blur-2xl"></div>
                </motion.div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm h-full flex flex-col justify-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Prochain Retrait</p>
                        <p className="text-lg font-black text-gray-900 dark:text-white mb-2">{balance >= 5000 ? 'Seuil atteint !' : `${formatPrice(5000 - balance)} restant`}</p>
                        <div className="w-full bg-gray-100 dark:bg-white/5 h-2 rounded-full overflow-hidden">
                            <div className="bg-[#8B4513] h-full transition-all duration-1000" style={{ width: `${Math.min(100, (balance / 5000) * 100)}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white dark:bg-[#1e1e1e] rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden mb-12">
                <div className="p-8 border-b border-gray-50 dark:border-white/5 flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Journal des Transactions</h3>
                    <div className="flex gap-2">
                        <span className="px-3 py-1 bg-gray-50 dark:bg-white/5 text-[9px] font-black uppercase rounded-full">Tout</span>
                        <span className="px-3 py-1 text-[9px] font-black uppercase text-gray-400">Ventes</span>
                        <span className="px-3 py-1 text-[9px] font-black uppercase text-gray-400">Retraits</span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                            {transactions.length > 0 ? transactions.map((t, idx) => (
                                <motion.tr 
                                    key={t.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                >
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${t.type === 'credit' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                                {t.type === 'credit' ? (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 17l-4 4m0 0l-4-4m4 4V3"/></svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7l4-4m0 0l4 4m-4-4v18"/></svg>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">{t.description}</p>
                                                <p className="text-[10px] text-gray-400 font-bold">{new Date(t.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">ID</p>
                                        <p className="text-xs font-mono font-bold text-gray-600 dark:text-gray-400">TRX-{t.id.toString().padStart(6, '0')}</p>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <p className={`text-sm font-black ${t.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                            {t.type === 'credit' ? '+' : '-'} {formatPrice(t.amount)}
                                        </p>
                                        <p className="text-[9px] font-black uppercase text-gray-400">{t.status}</p>
                                    </td>
                                </motion.tr>
                            )) : (
                                <tr>
                                    <td colSpan="3" className="px-8 py-20 text-center">
                                        <p className="text-sm font-bold text-gray-400 italic">Aucune transaction enregistrée pour le moment.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Withdraw Modal */}
            {isWithdrawModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsWithdrawModalOpen(false)}
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-white dark:bg-[#1e1e1e] w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden border border-gray-100 dark:border-white/5"
                    >
                        <div className="p-8 border-b border-gray-50 dark:border-white/5 flex justify-between items-center">
                            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">Demande de Retrait</h3>
                            <button onClick={() => setIsWithdrawModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={submit} className="p-8 space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Montant à retirer (Min 5000)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        className="w-full bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white border-none rounded-2xl py-4 px-6 text-lg font-black focus:ring-2 focus:ring-[#8B4513] transition-all"
                                        placeholder="0"
                                        value={data.amount}
                                        onChange={e => setData('amount', e.target.value)}
                                        required
                                    />
                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-gray-400">FCFA</span>
                                </div>
                                {errors.amount && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.amount}</p>}
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Méthode de Paiement</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Flooz', 'T-Money'].map(m => (
                                        <button 
                                            key={m}
                                            type="button"
                                            onClick={() => setData('payment_method', m)}
                                            className={`py-4 rounded-2xl font-black uppercase text-[10px] border-2 transition-all ${data.payment_method === m ? 'border-[#8B4513] bg-[#8B4513]/5 text-[#8B4513]' : 'border-gray-50 dark:border-white/5 text-gray-400'}`}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Numéro de Téléphone (Transfert)</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-[#8B4513] transition-all"
                                    placeholder="+228 90 XX XX XX"
                                    value={data.payment_details}
                                    onChange={e => setData('payment_details', e.target.value)}
                                    required
                                />
                                {errors.payment_details && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.payment_details}</p>}
                            </div>

                            <button 
                                type="submit"
                                disabled={processing}
                                className="w-full bg-[#8B4513] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-[#8B4513]/20 hover:bg-[#70360f] transition-all disabled:opacity-50"
                            >
                                {processing ? 'Envoi en cours...' : 'Confirmer le Retrait'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </SellerLayout>
    );
}
