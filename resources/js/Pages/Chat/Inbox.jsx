import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';

export default function Inbox({ conversations, authUser }) {
    const [searchQuery, setSearchQuery] = useState('');

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    };

    const filteredConversations = conversations.filter(conv => 
        (conv.shop?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#121212] font-sans transition-colors duration-300">
            <Head title="Mes Conversations" />

            {/* Header */}
            <div className="bg-[#8B4513] dark:bg-[#1e1e1e] text-white px-4 py-4 flex items-center justify-between shadow-lg transition-colors border-b dark:border-gray-800 sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.get('/home')} className="text-white/80 hover:text-white text-xs font-black uppercase tracking-widest">
                        RETOUR
                    </button>
                    <h1 className="text-xl font-black">Mes Messages</h1>
                </div>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto px-4 mt-6">
                <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400 group-focus-within:text-[#8B4513] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </span>
                    <input 
                        type="text" 
                        placeholder="Rechercher une boutique..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-12 pr-4 py-4 bg-white dark:bg-[#1e1e1e] border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-[#8B4513]/20 dark:text-white font-bold transition-all text-sm"
                    />
                </div>
            </div>

            {/* List */}
            <div className="max-w-2xl mx-auto mt-6">
                {conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center px-4">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-[#1e1e1e] rounded-full flex items-center justify-center mb-6">
                             <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </div>
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
                    <div className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-[#1e1e1e] shadow-sm rounded-3xl overflow-hidden transition-colors mx-4 sm:mx-0">
                        {filteredConversations.length > 0 ? (
                            filteredConversations.map((conv) => {
                                const lastMsg = conv.messages?.[0];
                                const shopName = conv.shop?.name ?? 'Boutique';
                                return (
                                    <button
                                        key={conv.id}
                                        onClick={() => router.get(`/chat/shop/${conv.shop_id}`)}
                                        className="w-full flex items-center gap-4 px-5 py-5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left group"
                                    >
                                        <div className="w-14 h-14 bg-[#D35400] rounded-2xl flex items-center justify-center text-white font-black text-xl flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                                            {shopName.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center">
                                                <p className="font-bold text-gray-900 dark:text-white truncate">{shopName}</p>
                                                {lastMsg && (
                                                    <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2 uppercase tracking-tighter">
                                                        {formatDate(lastMsg.created_at)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between mt-1">
                                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate pr-4">
                                                    {lastMsg ? lastMsg.content : 'Démarrez la conversation…'}
                                                </p>
                                                {/* On pourrait mettre un indicateur de non lu ici */}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="py-12 text-center">
                                <p className="text-gray-500 font-bold italic">Aucune boutique ne correspond à votre recherche.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
