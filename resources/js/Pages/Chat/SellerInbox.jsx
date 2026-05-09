import React, { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import axios from 'axios';

export default function SellerInbox({ conversations: initialConvs, shop, authUser }) {
    const [conversations, setConversations] = useState(initialConvs);
    const [activeConv, setActiveConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // WebSocket : écoute les nouveaux messages en temps réel
    useEffect(() => {
        if (!activeConv) return;

        const channel = window.Echo?.private(`conversation.${activeConv.id}`)
            ?.listen('.MessageSent', (e) => {
                setMessages(prev => [...prev, e.message]);
                // Mettre à jour la preview de la conversation dans la liste
                setConversations(prev => prev.map(c =>
                    c.id === activeConv.id
                        ? { ...c, messages: [e.message] }
                        : c
                ));
            });

        return () => window.Echo?.leave(`conversation.${activeConv.id}`);
    }, [activeConv?.id]);

    const openConversation = async (conv) => {
        setActiveConv(conv);
        setMessages([]);
        setLoadingMessages(true);
        try {
            const res = await axios.get(`/chat/api/messages/${conv.id}`);
            setMessages(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingMessages(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isSending || !activeConv) return;

        setIsSending(true);
        const content = input.trim();
        setInput('');

        const tempMsg = {
            id: `temp-${Date.now()}`,
            sender_id: authUser.id,
            content,
            created_at: new Date().toISOString(),
            sender: authUser,
        };
        setMessages(prev => [...prev, tempMsg]);
        setConversations(prev => prev.map(c =>
            c.id === activeConv.id ? { ...c, messages: [tempMsg] } : c
        ));

        try {
            const res = await axios.post(`/chat/${activeConv.id}/message`, { content });
            setMessages(prev => prev.map(m => m.id === tempMsg.id ? res.data.message : m));
        } catch (err) {
            console.error(err);
            setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
        } finally {
            setIsSending(false);
            inputRef.current?.focus();
        }
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const now = new Date();
        if (d.toDateString() === now.toDateString())
            return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    };

    const groupedMessages = messages.reduce((groups, msg, index) => {
        const prevMsg = messages[index - 1];
        const nextMsg = messages[index + 1];
        const isFirst = !prevMsg || prevMsg.sender_id !== msg.sender_id;
        const isLast = !nextMsg || nextMsg.sender_id !== msg.sender_id;
        groups.push({ ...msg, isFirst, isLast });
        return groups;
    }, []);

    const shopName = shop?.name ?? 'Boutique';

    return (
        <SellerLayout>
            <Head title="Messagerie" />

            {/* Conteneur 2 colonnes pleine hauteur */}
            <div className="flex h-[calc(100vh-5rem)] -m-6 lg:-m-8 rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white">

                {/* ──────── COLONNE GAUCHE : Liste des conversations ──────── */}
                <div className="w-full sm:w-80 flex-shrink-0 border-r border-gray-100 flex flex-col bg-white">
                    {/* Header */}
                    <div className="px-4 py-4 border-b border-gray-100 bg-[#8B4513] text-white">
                        <h2 className="text-lg font-black">💬 Messages</h2>
                        <p className="text-xs text-white/70">{conversations.length} conversation(s)</p>
                    </div>

                    {/* Liste */}
                    <div className="flex-1 overflow-y-auto">
                        {conversations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-6">
                                <p className="text-4xl mb-3">📭</p>
                                <p className="text-sm font-bold text-gray-600">Aucun message</p>
                                <p className="text-xs text-gray-400 mt-1">Vos clients vous écriront ici</p>
                            </div>
                        ) : (
                            conversations.map((conv) => {
                                const lastMsg = conv.messages?.[0];
                                const clientName = conv.user?.name ?? 'Client';
                                const isActive = activeConv?.id === conv.id;
                                return (
                                    <button
                                        key={conv.id}
                                        onClick={() => openConversation(conv)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-gray-50 ${
                                            isActive ? 'bg-[#8B4513]/10 border-l-4 border-l-[#8B4513]' : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="w-11 h-11 bg-indigo-500 rounded-full flex items-center justify-center text-white font-black text-base flex-shrink-0">
                                            {clientName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center">
                                                <p className="font-bold text-gray-900 text-sm truncate">{clientName}</p>
                                                {lastMsg && <span className="text-[10px] text-gray-400 flex-shrink-0 ml-1">{formatTime(lastMsg.created_at)}</span>}
                                            </div>
                                            <p className="text-xs text-gray-500 truncate mt-0.5">
                                                {lastMsg ? lastMsg.content : 'Nouvelle conversation…'}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* ──────── COLONNE DROITE : Zone de chat ──────── */}
                <div className="flex-1 flex flex-col" style={{ background: '#E5DDD5' }}>
                    {!activeConv ? (
                        /* État vide */
                        <div className="flex flex-col items-center justify-center h-full text-center p-8 gap-4">
                            <div className="w-24 h-24 bg-[#8B4513]/10 rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#8B4513]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-bold text-gray-600 text-lg">Sélectionnez une conversation</p>
                                <p className="text-sm text-gray-400 mt-1">Cliquez sur un client à gauche pour lire ses messages</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Header conversation */}
                            <div className="bg-[#8B4513] text-white px-4 py-3 flex items-center gap-3 shadow-md flex-shrink-0">
                                <div className="w-9 h-9 bg-indigo-400 rounded-full flex items-center justify-center font-black flex-shrink-0">
                                    {(activeConv.user?.name ?? 'C').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold leading-tight">{activeConv.user?.name ?? 'Client'}</p>
                                    <p className="text-xs text-white/70">Client · Connecté</p>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
                                {loadingMessages ? (
                                    <div className="flex justify-center py-8">
                                        <div className="w-6 h-6 border-2 border-[#8B4513] border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : groupedMessages.map((msg) => {
                                    // CLIENT = celui qui a ouvert la conversation (user_id)
                                    // VENDEUR = tout autre expéditeur
                                    const isClient = msg.sender_id === activeConv.user_id;
                                    const senderName = msg.sender?.name ?? (isClient ? 'Client' : shopName);

                                    return (
                                        <div
                                            key={msg.id}
                                            className={`flex items-end gap-2 ${isClient ? 'flex-row' : 'flex-row-reverse'} ${msg.isFirst ? 'mt-4' : 'mt-0.5'}`}
                                        >
                                            {/* Avatar */}
                                            <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-black text-white ${
                                                isClient ? 'bg-indigo-500' : 'bg-[#8B4513]'
                                            } ${!msg.isLast ? 'opacity-0' : ''}`}>
                                                {senderName.charAt(0).toUpperCase()}
                                            </div>

                                            <div className={`flex flex-col ${isClient ? 'items-start' : 'items-end'} max-w-[70%]`}>
                                                {/* Nom sur le 1er message du groupe */}
                                                {msg.isFirst && (
                                                    <span className={`text-[10px] font-bold mb-0.5 ${isClient ? 'text-indigo-600 ml-2' : 'text-[#8B4513] mr-2'}`}>
                                                        {senderName}
                                                    </span>
                                                )}

                                                {/* Bulle :
                                                    Client  → Gauche + Vert  (#D9FDD3)
                                                    Vendeur → Droite + Blanc
                                                */}
                                                <div className={`px-3 py-2 rounded-2xl shadow-sm text-sm leading-relaxed ${
                                                    isClient
                                                        ? 'bg-[#D9FDD3] text-gray-800 rounded-bl-md'
                                                        : 'bg-white text-gray-800 rounded-br-md'
                                                }`}>
                                                    <p>{msg.content}</p>
                                                    <div className={`flex items-center gap-1 mt-0.5 ${isClient ? 'justify-start' : 'justify-end'}`}>
                                                        <span className="text-[9px] text-gray-400">{formatTime(msg.created_at)}</span>
                                                        {!isClient && (
                                                            <svg className="h-3 w-3 text-[#53BDEB]" viewBox="0 0 16 11" fill="currentColor">
                                                                <path d="M11.071.653a.75.75 0 0 1 .024 1.06l-6 6.5a.75.75 0 0 1-1.083.002L1.263 5.222a.75.75 0 0 1 1.085-1.036l2.25 2.357 5.413-5.866a.75.75 0 0 1 1.06-.024z"/>
                                                                <path d="M14.071.653a.75.75 0 0 1 .024 1.06l-6 6.5a.75.75 0 0 1-1.083.002l-.75-.785a.75.75 0 1 1 1.085-1.036l.208.217 5.456-5.914a.75.75 0 0 1 1.06-.044z" opacity="0.5"/>
                                                            </svg>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={bottomRef} />
                            </div>

                            {/* Saisie */}
                            <form onSubmit={sendMessage} className="bg-[#F0F2F5] border-t border-gray-200 p-2 flex items-center gap-2 flex-shrink-0">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Répondre au client..."
                                    className="flex-1 bg-white rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8B4513]/20 transition-all shadow-sm"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isSending}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all transform active:scale-90 flex-shrink-0 ${
                                        input.trim() && !isSending ? 'bg-[#8B4513] hover:bg-[#70360f]' : 'bg-gray-300 cursor-not-allowed'
                                    }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </SellerLayout>
    );
}
