import React from 'react';
import { Head, router } from '@inertiajs/react';

export default function Inbox({ conversations, authUser }) {
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Head title="Mes Conversations" />

            {/* Header */}
            <div className="bg-[#8B4513] text-white px-4 py-4 flex items-center gap-3 shadow-lg">
                <button onClick={() => router.get('/home')} className="text-white/80 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                <h1 className="text-xl font-black">Mes Messages</h1>
            </div>

            {/* List */}
            <div className="max-w-2xl mx-auto">
                {conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center px-4">
                        <div className="text-6xl mb-4">💬</div>
                        <h2 className="text-xl font-bold text-gray-700">Aucune conversation</h2>
                        <p className="text-gray-500 mt-2">Contactez un vendeur depuis la page d'un produit pour démarrer une discussion.</p>
                        <button
                            onClick={() => router.get('/explore')}
                            className="mt-6 bg-[#8B4513] text-white px-8 py-3 rounded-xl font-bold shadow-lg"
                        >
                            Explorer les boutiques
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 bg-white mt-0 shadow-sm">
                        {conversations.map((conv) => {
                            const lastMsg = conv.messages?.[0];
                            const shopName = conv.shop?.name ?? 'Boutique';
                            return (
                                <button
                                    key={conv.id}
                                    onClick={() => router.get(`/chat/shop/${conv.shop_id}`)}
                                    className="w-full flex items-center gap-4 px-4 py-4 hover:bg-gray-50 transition-colors text-left"
                                >
                                    <div className="w-14 h-14 bg-[#D35400] rounded-full flex items-center justify-center text-white font-black text-xl flex-shrink-0">
                                        {shopName.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center">
                                            <p className="font-bold text-gray-900 truncate">{shopName}</p>
                                            {lastMsg && (
                                                <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{formatDate(lastMsg.created_at)}</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 truncate mt-0.5">
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
