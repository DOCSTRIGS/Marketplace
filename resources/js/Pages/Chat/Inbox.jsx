import React from 'react';
import { Head, router } from '@inertiajs/react';

export default function Inbox({ conversations, authUser }) {
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#121212] font-sans transition-colors duration-300">
            <Head title="Mes Conversations" />

            {/* Header */}
            <div className="bg-[#8B4513] dark:bg-[#1e1e1e] text-white px-4 py-4 flex items-center gap-3 shadow-lg transition-colors border-b dark:border-gray-800">
                <button onClick={() => router.get('/home')} className="text-white/80 hover:text-white text-xs font-black uppercase tracking-widest">
                    RETOUR
                </button>
                <h1 className="text-xl font-black">Mes Messages</h1>
            </div>

            {/* List */}
            <div className="max-w-2xl mx-auto">
                {conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center px-4">
                        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">Aucune conversation</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Contactez un vendeur depuis la page d'un produit pour démarrer une discussion.</p>
                        <button
                            onClick={() => router.get('/explore')}
                            className="mt-6 bg-[#8B4513] text-white px-8 py-3 rounded-xl font-bold shadow-lg"
                        >
                            Explorer les boutiques
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-[#1e1e1e] mt-0 shadow-sm transition-colors">
                        {conversations.map((conv) => {
                            const lastMsg = conv.messages?.[0];
                            const shopName = conv.shop?.name ?? 'Boutique';
                            return (
                                <button
                                    key={conv.id}
                                    onClick={() => router.get(`/chat/shop/${conv.shop_id}`)}
                                    className="w-full flex items-center gap-4 px-4 py-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left"
                                >
                                    <div className="w-14 h-14 bg-[#D35400] rounded-full flex items-center justify-center text-white font-black text-xl flex-shrink-0">
                                        {shopName.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center">
                                            <p className="font-bold text-gray-900 dark:text-white truncate">{shopName}</p>
                                            {lastMsg && (
                                                <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2">{formatDate(lastMsg.created_at)}</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                            {lastMsg ? lastMsg.content : 'Démarrez la conversation…'}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
