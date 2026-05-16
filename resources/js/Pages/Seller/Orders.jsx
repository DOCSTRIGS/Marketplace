import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import EmptyState from '@/Components/EmptyState';
import OrderTrackingDrawer from '@/Components/Seller/OrderTrackingDrawer';
import { useToast } from '@/Contexts/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { StatsSkeleton, TableSkeleton } from '@/Components/Skeletons';

export default function Orders({ orders, auth }) {
    const { addToast } = useToast();
    const [trackingOrderId, setTrackingOrderId] = useState(null);
    const [trackingOpen, setTrackingOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate a brief loading for aesthetic "Prestige" feel
        const timer = setTimeout(() => setIsLoading(false), 800);
        
        if (typeof window !== 'undefined' && window.Echo && auth.user.shop) {
            window.Echo.channel(`shop.${auth.user.shop.id}`)
                .listen('.order.assigned', (e) => {
                    addToast(`✅ Livreur trouvé pour la commande ${e.order.order_number} !`, 'success');
                    router.reload({ only: ['orders'] });
                });

            window.Echo.channel('orders')
                .listen('.order.updated', (e) => {
                    // Only reload if the order belongs to this shop
                    if (e.order.shop_id === auth.user.shop.id) {
                        router.reload({ preserveScroll: true });
                    }
                });
        }
        return () => {
            if (window.Echo && auth.user.shop) {
                window.Echo.leave(`shop.${auth.user.shop.id}`);
                window.Echo.leave('orders');
            }
        };
    }, [auth.user.shop]);

    const openTracking = (id) => {
        setTrackingOrderId(id);
        setTrackingOpen(true);
    };

    const handleStatusUpdate = (id, status) => {
        if (confirm(`Voulez-vous marquer cette commande comme "${status}" ?`)) {
            setProcessing(true);
            router.patch(route('seller.orders.updateStatus', { id }), { status }, {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm("Voulez-vous vraiment supprimer (masquer) cette commande ? Cette action est irréversible pour votre tableau de bord.")) {
            router.delete(route('seller.orders.destroy', { id }), {
                preserveScroll: true,
            });
        }
    };

    const stats = [
        { name: 'À PRÉPARER', value: orders.filter(o => o.status === 'paid' || o.status === 'processing' || o.status === 'preparing' || o.status === 'accepted').length, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-orange-500', bg: 'bg-orange-100' },
        { name: 'MES GAINS (NET)', value: new Intl.NumberFormat('fr-FR').format(orders.reduce((acc, o) => acc + parseFloat(o.seller_amount), 0)) + ' F', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-green-500', bg: 'bg-green-100' },
        { name: 'COMMANDES TOTALES', value: orders.length, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-blue-500', bg: 'bg-blue-100' },
    ];

    const getStatusText = (status) => {
        const map = {
            'pending': 'En attente',
            'paid': 'Payé',
            'processing': 'En cours',
            'accepted': 'Livreur en cours',
            'preparing': 'En préparation',
            'shipped': 'Expédié',
            'delivered': 'Livré',
            'cancelled': 'Annulé'
        };
        return map[status] || status;
    };

    return (
        <SellerLayout>
            <Head title="Commandes" />
            
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Gestion des Commandes</h2>
                    <p className="text-gray-600">Suivez et préparez les commandes de vos clients.</p>
                </div>
                <div className="relative w-full md:w-72">
                    <input
                        type="text"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#8B4513] focus:border-[#8B4513] sm:text-sm"
                        placeholder="Rechercher une commande..."
                    />
                </div>
            </div>

            {/* Stats */}
            {isLoading ? (
                <StatsSkeleton count={3} />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {stats.map((stat, idx) => (
                        <motion.div 
                            key={stat.name} 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
                        >
                            <p className="text-xs font-bold text-gray-500 mb-1">{stat.name}</p>
                            <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Orders Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                {isLoading ? (
                    <TableSkeleton rows={8} cols={5} />
                ) : (
                    <div className="overflow-x-auto flex-grow">
                        <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Client & Commande
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Articles
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Net Vendeur (FCFA)
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Statut
                                </th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            <AnimatePresence>
                                {orders.length > 0 ? orders.map((order, idx) => (
                                    <motion.tr 
                                        key={order.id} 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <div className="text-sm font-bold text-gray-900">{order.user?.name || 'Client anonyme'}</div>
                                            <div className="text-xs text-gray-500">{order.order_number}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex -space-x-2">
                                            {order.order_items?.map((item, idx) => (
                                                <div key={item.id || idx} className="h-8 w-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden" title={item.product?.name}>
                                                    <img src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=40' } className="h-full w-full object-cover" />
                                                </div>
                                            ))}
                                            {order.order_items?.length > 3 && (
                                                <div className="h-8 w-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                                                    +{order.order_items.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                        {new Intl.NumberFormat('fr-FR').format(order.seller_amount)} F
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-[10px] leading-5 font-black uppercase rounded-full ${
                                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                            (order.status === 'preparing' || order.status === 'processing') ? 'bg-orange-100 text-orange-800' :
                                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                            order.status === 'paid' ? 'bg-indigo-100 text-indigo-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {getStatusText(order.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            {order.status !== 'delivered' && (
                                                <button 
                                                    onClick={() => {
                                                        const link = `${window.location.origin}/livreur/commande/${order.id}`;
                                                        navigator.clipboard.writeText(link);
                                                        alert("Lien livreur copié ! Envoyez-le par WhatsApp au livreur.");
                                                    }}
                                                    className="bg-green-50 text-green-600 p-2 rounded-xl hover:bg-green-100 transition-all border border-green-100 flex items-center gap-2"
                                                    title="Copier le lien pour le livreur"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                                    </svg>
                                                    <span className="text-[10px] font-black uppercase tracking-wider pr-1">Lien Livreur</span>
                                                </button>
                                            )}

                                            {(order.status === 'preparing' || order.status === 'shipped') && (
                                                <button 
                                                    onClick={() => openTracking(order.id)}
                                                    className="bg-white dark:bg-[#1e1e1e] text-blue-600 p-2 rounded-xl hover:bg-blue-50 transition-all border border-blue-100 flex items-center gap-2"
                                                    title="Suivre le livreur"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span className="text-[10px] font-black uppercase tracking-wider">Suivre</span>
                                                </button>
                                            )}

                                            {(order.status === 'paid' || order.status === 'processing' || order.status === 'pending') && (
                                                <button 
                                                    disabled={processing}
                                                    onClick={() => handleStatusUpdate(order.id, 'preparing')}
                                                    className="bg-[#8B4513] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-[#70360f] transition-all disabled:opacity-50 flex items-center gap-2"
                                                >
                                                    {processing ? (
                                                        <>
                                                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                            Analyse Zone...
                                                        </>
                                                    ) : 'Préparer'}
                                                </button>
                                            )}
                                            {(order.status === 'preparing' || order.status === 'accepted') && (
                                                <button 
                                                    onClick={() => handleStatusUpdate(order.id, 'shipped')}
                                                    className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-blue-700 transition-all"
                                                >
                                                    Expédier
                                                </button>
                                            )}
                                            {order.status === 'shipped' && (
                                                <button 
                                                    onClick={() => handleStatusUpdate(order.id, 'delivered')}
                                                    className="bg-green-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-green-700 transition-all"
                                                >
                                                    Livré
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleDelete(order.id)}
                                                className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all"
                                                title="Supprimer la commande"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                                )) : (
                                    <tr>
                                    <td colSpan="5" className="px-6 py-4">
                                        <EmptyState 
                                            title="Aucune commande"
                                            description="Dès qu'un client passera une commande, elle apparaîtra ici."
                                        />
                                    </td>
                                </tr>
                            )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
                )}
            </div>

            <OrderTrackingDrawer 
                orderId={trackingOrderId}
                isOpen={trackingOpen}
                onClose={() => setTrackingOpen(false)}
            />
        </SellerLayout>
    );
}
