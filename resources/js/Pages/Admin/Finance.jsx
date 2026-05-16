import { Head, Link } from '@inertiajs/react';
import ThemeToggle from '@/Components/ThemeToggle';
import AdminNavbar from '@/Components/Admin/AdminNavbar';
import { motion } from 'framer-motion';

export default function AdminFinance({ auth, orders, stats }) {
    const formattedPrice = (price) => new Intl.NumberFormat('fr-TG', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(price);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#121212] font-sans transition-colors duration-300">
            <Head title="Rapport Financier - Admin" />
            
            <AdminNavbar />

            <div className="max-w-7xl mx-auto px-8 py-10">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-8"
                >
                    <Link 
                        href={route('admin.dashboard')} 
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1e1e1e] text-[#8B4513] rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span className="text-xs font-black uppercase tracking-widest">Retour au Dashboard</span>
                    </Link>
                </motion.div>

                <header className="mb-10 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">Rapport Financier</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Analyse des revenus et des commissions.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {[
                        { label: 'Volume d\'affaires Total', value: formattedPrice(stats.total_revenue), color: 'text-gray-900', bg: 'bg-white' },
                        { label: 'Commissions LoméShop', value: formattedPrice(stats.total_commissions), color: 'text-[#8B4513]', bg: 'bg-[#8B4513]/5' },
                        { label: 'Retraits en attente', value: formattedPrice(stats.pending_withdrawals), color: 'text-orange-600', bg: 'bg-orange-50' },
                    ].map(kpi => (
                        <div key={kpi.label} className={`${kpi.bg} dark:bg-[#1e1e1e] p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm transition-colors`}>
                            <h3 className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest mb-4">{kpi.label}</h3>
                            <p className={`text-3xl font-black ${kpi.color} dark:text-white`}>{kpi.value}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-white dark:bg-[#1e1e1e] rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
                    <div className="p-8 border-b border-gray-50 dark:border-white/5 flex justify-between items-center bg-gray-50/30 dark:bg-white/5">
                        <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-sm">Détail des Transactions</h3>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-[#252525] border-b border-gray-100 dark:border-gray-800">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Commande</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Boutique</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Volume</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right text-[#8B4513]">Commission</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                {orders.data.map(order => (
                                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-8 py-6 text-[10px] font-bold text-gray-400">
                                            {new Date(order.created_at).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="font-black text-gray-900 dark:text-white uppercase tracking-tight">#{order.order_number}</div>
                                            <div className="text-[9px] font-bold text-gray-400 uppercase">{order.status}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="font-bold text-gray-800 dark:text-gray-200">{order.shop?.name}</div>
                                            <div className="text-[10px] text-gray-400">{order.shop?.user?.name}</div>
                                        </td>
                                        <td className="px-8 py-6 text-right font-black text-gray-900 dark:text-white">
                                            {formattedPrice(order.total_amount)}
                                        </td>
                                        <td className="px-8 py-6 text-right font-black text-[#8B4513]">
                                            {formattedPrice(order.commission_amount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination (Simplified) */}
                {orders.links && (
                    <div className="mt-8 flex justify-center gap-2">
                        {orders.links.map((link, i) => {
                            const Component = link.url ? Link : 'span';
                            return (
                                <Component 
                                    key={i}
                                    href={link.url || undefined}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                        link.active ? 'bg-[#8B4513] text-white' : 
                                        !link.url ? 'bg-gray-100 text-gray-400 dark:bg-[#1e1e1e] cursor-not-allowed' : 
                                        'bg-white dark:bg-[#1e1e1e] text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
