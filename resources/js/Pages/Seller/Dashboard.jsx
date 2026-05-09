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

export default function Dashboard({ auth }) {
    const stats = [
        { name: 'Revenus du mois', value: '425 000 FCFA', change: '+12%', trend: 'up' },
        { name: 'Commandes du jour', value: '18', change: '+4', trend: 'up' },
        { name: 'Produits actifs', value: '45', change: '0', trend: 'neutral' },
        { name: 'Produits en rupture', value: '3', change: '-2', trend: 'down' },
    ];

    const recentOrders = [
        { id: '#CMD-1023', customer: 'Ayao Koffi', product: 'iPhone 13 Pro', amount: '450000 FCFA', status: 'En cours de livraison', date: 'Aujourd\'hui, 14:30' },
        { id: '#CMD-1022', customer: 'Dédé Mensah', product: 'Ventilateur Binatone', amount: '25000 FCFA', status: 'Livré', date: 'Aujourd\'hui, 10:15' },
        { id: '#CMD-1021', customer: 'Komi Afantchao', product: 'MacBook Air M1', amount: '650000 FCFA', status: 'En attente', date: 'Hier, 16:45' },
        { id: '#CMD-1020', customer: 'Afiavi Lawson', product: 'Sac en cuir', amount: '35000 FCFA', status: 'Livré', date: 'Hier, 09:20' },
    ];

    return (
        <SellerLayout>
            <Head title="Tableau de bord Vendeur" />
            
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Bonjour, {auth?.user?.name || 'Visiteur Vendeur'} 👋</h2>
                <p className="text-gray-600">Voici ce qui se passe dans votre boutique aujourd'hui.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <p className="text-sm font-medium text-gray-500 mb-1">{stat.name}</p>
                        <div className="flex items-end justify-between">
                            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                            <span className={`text-sm font-bold flex items-center ${
                                stat.trend === 'up' ? 'text-green-500' : stat.trend === 'down' ? 'text-red-500' : 'text-gray-400'
                            }`}>
                                {stat.trend === 'up' && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                )}
                                {stat.trend === 'down' && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                                    </svg>
                                )}
                                {stat.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Area */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Aperçu des revenus</h3>
                            <select className="text-sm border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary py-1.5 pl-3 pr-8">
                                <option>Ces 7 derniers jours</option>
                                <option>Ce mois-ci</option>
                                <option>Cette année</option>
                            </select>
                        </div>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={data}
                                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="colorRevenus" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8B4513" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#8B4513" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dx={-10} tickFormatter={(value) => `${value/1000}k`} />
                                    <CartesianGrid vertical={false} stroke="#F3F4F6" />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                                        formatter={(value) => [`${value} FCFA`, 'Revenus']}
                                    />
                                    <Area type="monotone" dataKey="revenus" stroke="#8B4513" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenus)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* NEW: Real-time Tracking Section */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-bold text-gray-900">Suivi des Livraisons en Temps Réel</h3>
                                <span className="flex items-center text-[10px] font-black text-green-500 bg-green-50 px-2 py-1 rounded-full animate-pulse uppercase">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                                    Live
                                </span>
                            </div>
                            <Link href={route('seller.tracking')} className="text-xs font-black text-[#8B4513] hover:underline uppercase tracking-widest">
                                Voir la carte complète
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {[
                                { id: '#TRK-4592', dest: 'Adidogomé, Lomé', status: 'En route', progress: 65, courier: 'Moussa T.' },
                                { id: '#TRK-4590', dest: 'Hédranawoé, Lomé', status: 'Préparation', progress: 20, courier: 'Koffi A.' }
                            ].map((track) => (
                                <div key={track.id} className="p-4 border border-gray-50 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-center mb-3">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{track.id}</p>
                                            <p className="text-xs text-gray-500">{track.dest}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black text-[#8B4513] uppercase">{track.status}</p>
                                            <p className="text-[10px] text-gray-400">Livreur: {track.courier}</p>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-[#8B4513] h-full transition-all duration-1000" 
                                            style={{ width: `${track.progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Messages Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#8B4513]/10 rounded-xl flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#8B4513]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Messages Clients</h3>
                            </div>
                            <Link href="/seller/chat" className="text-xs font-black text-[#8B4513] hover:underline uppercase tracking-widest">
                                Voir tout →
                            </Link>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">Répondez à vos clients en temps réel directement depuis votre boutique.</p>
                        <Link
                            href="/seller/chat"
                            className="w-full flex items-center justify-center py-3 rounded-xl bg-[#8B4513] text-white font-bold text-sm hover:bg-[#70360f] transition-colors shadow-md shadow-[#8B4513]/20"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            Ouvrir la messagerie
                        </Link>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 self-start">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Dernières commandes</h3>
                        <button className="text-sm text-primary font-medium hover:underline">Tout voir</button>
                    </div>
                    <div className="space-y-6">
                        {recentOrders.map((order) => (
                            <div key={order.id} className="flex flex-col border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-gray-900">{order.customer}</span>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                        order.status === 'Livré' ? 'bg-green-100 text-green-800' :
                                        order.status === 'En attente' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-blue-100 text-blue-800'
                                    }`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">{order.product}</span>
                                    <span className="font-bold text-gray-700">{order.amount}</span>
                                </div>
                                <div className="text-xs text-gray-400 mt-2">
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
