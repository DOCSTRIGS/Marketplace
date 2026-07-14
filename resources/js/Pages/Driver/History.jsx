import React from 'react';
import { Head, Link } from '@inertiajs/react';
import ThemeToggle from '@/Components/ThemeToggle';

export default function DriverHistory({ auth, orders }) {
    return (
        <div className="min-h-screen bg-white dark:bg-[#121212] text-[#1a1a1a] dark:text-white antialiased transition-colors duration-300">
            <Head title="Historique des Missions" />

            <header className="h-20 px-12 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-[#1e1e1e] z-50 transition-colors duration-300">
                <div className="flex items-center gap-10">
                    <h1 className="text-2xl font-black text-[#D35400] dark:text-[#E67E22] tracking-tighter">LoméShop</h1>
                    <nav className="flex items-center gap-8">
                        <div className="flex gap-6 text-[11px] font-black uppercase text-spacing">
                            <Link href={route('driver.dashboard')} className="text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white">Missions</Link>
                            <Link href={route('driver.history')} className="text-[#8B4513] border-b-2 border-[#8B4513] pb-1">Historique</Link>
                            <Link href={route('driver.profile')} className="text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white">Mon Profil</Link>
                        </div>
                    </nav>
                </div>
                <div className="flex items-center gap-6">
                    <ThemeToggle />
                    <div className="flex flex-col text-right">
                        <span className="text-[10px] font-black uppercase text-gray-400">Total Livraisons</span>
                        <span className="text-[11px] font-bold text-gray-900 dark:text-white">{orders.total} Accomplies</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden border border-gray-100 dark:border-gray-800">
                        <img src={auth.user.profile_photo_url} className="w-full h-full object-cover" alt="" />
                    </div>
                </div>
            </header>

            <main className="p-12 max-w-[1200px] mx-auto">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h2 className="text-[34px] font-black uppercase tracking-tight mb-2">Historique des Missions</h2>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Toutes vos livraisons terminées avec succès</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1e1e1e] rounded-[40px] border border-gray-50 dark:border-gray-800 shadow-sm overflow-hidden transition-colors duration-300">
                    <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-50 dark:border-gray-800">
                                <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest">Date / Heure</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest">Commande</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest">Boutique</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest">Destination</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {orders.data.length > 0 ? orders.data.map(order => (
                                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                    <td className="px-8 py-6">
                                        <p className="text-[11px] font-bold text-gray-900 dark:text-white">{new Date(order.delivered_at || order.updated_at).toLocaleDateString()}</p>
                                        <p className="text-[9px] text-gray-400 dark:text-gray-500">{new Date(order.delivered_at || order.updated_at).toLocaleTimeString()}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-[11px] font-black uppercase text-gray-900 dark:text-white">{order.order_number}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-[11px] font-bold text-gray-900 dark:text-white">{order.shop.name}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-[11px] font-medium text-gray-600 dark:text-gray-300 truncate max-w-[200px]">{order.delivery_address}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest">LIVRÉ</span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center text-gray-400 dark:text-gray-500 opacity-60">
                                        <p className="text-[10px] font-black uppercase tracking-widest">Aucune mission dans l'historique</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    </div>
                </div>

                {/* Simple Pagination */}
                {orders.links && orders.links.length > 3 && (
                    <div className="mt-8 flex justify-center gap-2">
                        {orders.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${link.active ? 'bg-[#8B4513] text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
