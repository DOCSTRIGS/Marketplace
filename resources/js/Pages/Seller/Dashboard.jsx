import React from 'react';
import { Head, Link } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Lun', revenus: 40000 },
  { name: 'Mar', revenus: 30000 },
  { name: 'Mer', revenus: 20000 },
  { name: 'Jeu', revenus: 27800 },
  { name: 'Ven', revenus: 18900 },
  { name: 'Sam', revenus: 65000 },
  { name: 'Dim', revenus: 55000 },
];

export default function Dashboard({ auth, stats: initialStats, recentOrders: initialOrders, chartData: initialChartData, activeTrackings: initialTrackings }) {
    // Default data if props are missing
    const stats = initialStats || [
        { name: 'Solde Disponible', value: '0 FCFA', change: 'Retirable', trend: 'up' },
        { name: 'Gains Totaux (Net)', value: '0 FCFA', change: 'Cumulé', trend: 'up' },
        { name: 'Gains du Mois', value: '0 FCFA', change: 'Ce mois', trend: 'neutral' },
        { name: 'Commandes du jour', value: '0', change: 'Aujourd\'hui', trend: 'neutral' },
        { name: 'Produits en boutique', value: '0 actifs', change: 'Stock OK', trend: 'neutral' },
    ];

    const recentOrders = initialOrders || [];
    const chartData = initialChartData || [];
    const activeTrackings = initialTrackings || [];

    const [isMounted, setIsMounted] = React.useState(false);
    
    React.useEffect(() => {
        const timer = setTimeout(() => setIsMounted(true), 200);
        return () => clearTimeout(timer);
    }, []);


    return (
        <SellerLayout>
            <Head title="Tableau de bord Vendeur" />
            
            <div className="mb-8 transition-colors">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Bonjour, {auth?.user?.name || 'Vendeur'}</h2>
                <p className="text-gray-600 dark:text-gray-400 transition-colors">Voici ce qui se passe dans votre boutique aujourd'hui.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{stat.name}</p>
                        <div className="flex items-end justify-between">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{stat.value}</h3>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full transition-colors ${
                                stat.trend === 'up' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 
                                stat.trend === 'down' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 
                                'bg-gray-50 dark:bg-gray-850 text-gray-500 dark:text-gray-400'
                            }`}>
                                {stat.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Area */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white transition-colors">Aperçu des revenus</h3>
                            <div className="text-xs font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full uppercase transition-colors">30 derniers jours</div>
                        </div>
                        <div className="relative w-full">
                            {isMounted && chartData.length > 0 && (
                                <ResponsiveContainer width="100%" height={320} minWidth={0}>
                                    <AreaChart
                                        data={chartData}
                                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient id="colorRevenus" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8B4513" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#8B4513" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dx={-10} tickFormatter={(value) => `${value}`} />
                                        <CartesianGrid vertical={false} stroke="#374151" strokeDasharray="3 3" opacity={0.1} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#1e1e1e', borderRadius: '8px', border: '1px solid #374151', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                            itemStyle={{ color: '#fff' }}
                                            labelStyle={{ color: '#9CA3AF' }}
                                            formatter={(value) => [`${value} FCFA`, 'Revenus']}
                                        />
                                        <Area type="monotone" dataKey="revenus" stroke="#8B4513" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenus)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>


                    {/* NEW: Real-time Tracking Section */}
                    <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white transition-colors">Suivi des Livraisons en Temps Réel</h3>
                                <span className="flex items-center text-[10px] font-black text-green-500 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full animate-pulse uppercase transition-colors">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                                    Live
                                </span>
                            </div>
                            <Link href={route('seller.tracking')} className="text-xs font-black text-[#8B4513] hover:underline uppercase tracking-widest transition-colors">
                                Voir la carte complète
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {activeTrackings.length > 0 ? (
                                activeTrackings.map((track) => (
                                    <div key={track.id} className="p-4 border border-gray-50 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <div className="flex justify-between items-center mb-3">
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white transition-colors">{track.id}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors">{track.dest}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-black text-[#8B4513] uppercase transition-colors">{track.status}</p>
                                                <p className="text-[10px] text-gray-400 dark:text-gray-500 transition-colors">Livreur: {track.courier}</p>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                            <div 
                                                className="bg-[#8B4513] h-full transition-all duration-1000" 
                                                style={{ width: `${track.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-gray-400 font-medium">Aucune livraison en cours</p>
                                </div>
                            )}
                        </div>

                    </div>
                    {/* Messages Card */}
                    <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                        <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white transition-colors">Messages Clients</h3>
                            <Link href={route('seller.chat')} className="text-xs font-black text-[#8B4513] hover:underline uppercase tracking-widest transition-colors">
                                Voir tout →
                            </Link>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 transition-colors">Répondez à vos clients en temps réel directement depuis votre boutique.</p>
                        <Link
                            href={route('seller.chat')}
                            className="w-full flex items-center justify-center py-3 rounded-xl bg-[#8B4513] text-white font-bold text-sm hover:bg-[#70360f] transition-colors shadow-md shadow-[#8B4513]/20"
                        >
                            Ouvrir la messagerie
                        </Link>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 self-start transition-colors">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white transition-colors">Dernières commandes</h3>
                        <button className="text-sm text-[#8B4513] font-medium hover:underline transition-colors">Tout voir</button>
                    </div>
                    <div className="space-y-6">
                        {recentOrders.map((order) => (
                            <div key={order.id} className="flex flex-col border-b border-gray-50 dark:border-gray-800 pb-4 last:border-0 last:pb-0 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-gray-900 dark:text-white transition-colors">{order.customer}</span>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full transition-colors ${
                                        order.status === 'Livré' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                                        order.status === 'En attente' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' :
                                        'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
                                    }`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm transition-colors">
                                    <span className="text-gray-500 dark:text-gray-400">{order.product}</span>
                                    <span className="font-bold text-gray-700 dark:text-gray-300">{order.amount}</span>
                                </div>
                                <div className="text-xs text-gray-400 dark:text-gray-500 mt-2 transition-colors">
                                    {order.id} • {order.date}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </SellerLayout>
    );
}
