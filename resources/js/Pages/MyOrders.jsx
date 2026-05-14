import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';

export default function MyOrders({ auth, orders }) {
    const formattedPrice = (price) => new Intl.NumberFormat('fr-FR').format(price);

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-gray-100 text-gray-600';
            case 'paid': return 'bg-indigo-100 text-indigo-600';
            case 'processing':
            case 'preparing': return 'bg-orange-100 text-orange-600';
            case 'shipped': return 'bg-blue-100 text-blue-600';
            case 'delivered': return 'bg-green-100 text-green-600';
            case 'cancelled': return 'bg-red-100 text-red-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending': return 'En attente';
            case 'paid': return 'Payé';
            case 'processing': return 'En cours';
            case 'preparing': return 'En préparation';
            case 'shipped': return 'Expédié';
            case 'delivered': return 'Livré';
            case 'cancelled': return 'Annulé';
            default: return status;
        }
    };

    return (
        <div className="min-h-screen bg-[#FDF8F4] dark:bg-[#121212] flex flex-col font-sans transition-colors duration-300">
            <Head title="Mes Commandes" />
            <Navbar />

            <main className="flex-grow max-w-[1000px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-10">
                    <h1 className="text-4xl font-extrabold text-[#222222] dark:text-white mb-2 tracking-tight">Mes Commandes</h1>
                    <p className="text-gray-500 dark:text-gray-400">Suivez l'état de vos achats sur LoméShop.</p>
                </div>

                <div className="space-y-6">
                    {orders.length > 0 ? (
                        orders.map((order) => (
                            <div key={order.id} className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md transition-all">
                                {/* Order Header */}
                                <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex flex-wrap justify-between items-center gap-4 bg-gray-50/50 dark:bg-white/5 transition-colors">
                                    <div className="flex gap-8">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">N° COMMANDE</p>
                                            <p className="font-bold text-[#222222] dark:text-white text-sm">{order.order_number}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">DATE</p>
                                            <p className="font-bold text-[#222222] dark:text-white text-sm">
                                                {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">TOTAL</p>
                                            <p className="font-bold text-[#B03A2E] text-sm">{formattedPrice(order.total_amount)} FCFA</p>
                                        </div>
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.status).replace('bg-', 'dark:bg-').replace('text-', 'dark:text-')} ${getStatusColor(order.status)}`}>
                                        {getStatusLabel(order.status)}
                                    </div>
                                    
                                    {order.delivery_code && order.status !== 'delivered' && order.status !== 'cancelled' && (
                                        <div className="bg-[#8B4513]/10 dark:bg-[#8B4513]/20 border border-[#8B4513]/30 px-4 py-2 rounded-xl flex items-center gap-3">
                                            <div>
                                                <p className="text-[9px] font-black text-[#8B4513] uppercase tracking-tighter">Code de Réception</p>
                                                <p className="text-lg font-black text-[#8B4513] tracking-[0.2em]">{order.delivery_code}</p>
                                            </div>
                                            <div className="w-8 h-8 bg-[#8B4513] text-white rounded-lg flex items-center justify-center">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Order Items */}
                                <div className="p-6">
                                    <div className="flex items-center mb-6">
                                        <div className="w-8 h-8 rounded-full bg-[#E6DCCF] dark:bg-[#8B4513]/20 text-[#8B4513] flex items-center justify-center text-[10px] font-bold mr-3 uppercase">
                                            {order.shop?.name.substring(0, 2)}
                                        </div>
                                        <p className="text-xs font-bold text-gray-600 dark:text-gray-400">Boutique : <span className="text-[#222222] dark:text-white">{order.shop?.name}</span></p>
                                    </div>

                                    <div className="space-y-4">
                                        {order.order_items?.map((item) => (
                                            <div key={item.id} className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-[#252525] overflow-hidden flex-shrink-0">
                                                    <img 
                                                        src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=100&q=80'} 
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-grow">
                                                    <h4 className="text-sm font-bold text-[#222222] dark:text-white mb-1">{item.product?.name}</h4>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Quantité : {item.quantity} × {formattedPrice(item.price)} FCFA</p>
                                                </div>
                                                <Link 
                                                    href={route('product.show', item.product_id)}
                                                    className="text-xs font-bold text-[#8B4513] hover:underline"
                                                >
                                                    Acheter à nouveau
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Order Footer Actions */}
                                <div className="p-6 bg-gray-50/30 dark:bg-white/5 border-t border-gray-50 dark:border-gray-800 flex justify-end gap-3 transition-colors">
                                    <Link 
                                        href={route('tracking', { order_id: order.id })}
                                        className="bg-[#8B4513] text-white px-6 py-2 rounded-lg font-bold text-xs hover:bg-[#70360f] transition-all shadow-sm flex items-center"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Suivre la livraison
                                    </Link>
                                    <button className="border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 px-6 py-2 rounded-lg font-bold text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                                        Détails de la facture
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white dark:bg-[#1e1e1e] rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 transition-colors">
                            <div className="w-20 h-20 bg-gray-50 dark:bg-[#252525] rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300 dark:text-gray-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-[#222222] dark:text-white mb-2">Vous n'avez pas encore de commande</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs mx-auto">Explorez nos catégories et faites votre premier achat sur LoméShop !</p>
                            <Link 
                                href={route('explore')}
                                className="bg-[#B03A2E] text-white px-10 py-3 rounded-xl font-bold text-sm shadow-xl shadow-[#B03A2E]/20"
                            >
                                Commencer mes achats
                            </Link>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
