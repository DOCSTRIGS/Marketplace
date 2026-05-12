import React, { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';

export default function Conversation({ conversation, messages: initialMessages, authUser, viewerRole }) {
    const [messages, setMessages] = useState(initialMessages);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const isSeller = viewerRole === 'seller';

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const channel = window.Echo?.private(`conversation.${conversation.id}`)
            ?.listen('.MessageSent', (e) => {
                setMessages(prev => [...prev, e.message]);
            });

        return () => {
            window.Echo?.leave(`conversation.${conversation.id}`);
        };
    }, [conversation.id]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isSending) return;

        setIsSending(true);
        const content = input.trim();
        setInput('');

        const tempMessage = {
            id: `temp-${Date.now()}`,
            sender_id: authUser.id,
            content,
            created_at: new Date().toISOString(),
            sender: authUser,
        };
        setMessages(prev => [...prev, tempMessage]);

        try {
            const response = await axios.post(`/chat/${conversation.id}/message`, { content });
            setMessages(prev => prev.map(m => m.id === tempMessage.id ? response.data.message : m));
        } catch (err) {
            console.error(err);
            setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
        } finally {
            setIsSending(false);
            inputRef.current?.focus();
        }
    };

    const formatTime = (dateStr) => {
        return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    // Grouper les messages consécutifs du même expéditeur
    const groupedMessages = messages.reduce((groups, msg, index) => {
        const prevMsg = messages[index - 1];
        const isFirst = !prevMsg || prevMsg.sender_id !== msg.sender_id;
        const isLast = !messages[index + 1] || messages[index + 1].sender_id !== msg.sender_id;
        groups.push({ ...msg, isFirst, isLast });
        return groups;
    }, []);

    const shopName = conversation.shop?.name ?? 'Boutique';
    const otherName = authUser.id === conversation.user_id
        ? shopName
        : conversation.user?.name ?? 'Client';

    return (
        <div className="flex items-center justify-center h-screen font-sans transition-colors duration-300" style={{ background: '#C9B8A8' }} id="chat-container">
            <Head title={`Chat — ${shopName}`} />

            {/* Fenêtre de chat centrée — max-w comme Telegram/iMessage */}
            <div className="flex flex-col w-full max-w-2xl h-screen sm:h-[90vh] sm:rounded-2xl sm:shadow-2xl overflow-hidden transition-all bg-[#E5DDD5] dark:bg-[#121212]">

                {/* Header WhatsApp-style */}
                <div className="bg-[#8B4513] dark:bg-[#1e1e1e] text-white px-4 py-3 flex items-center gap-3 shadow-lg z-10 transition-colors border-b dark:border-gray-800">
                    <button
                        onClick={() => router.get(isSeller ? '/seller/chat' : '/chat/inbox')}
                        className="text-white/80 hover:text-white transition-colors text-xs font-black uppercase tracking-widest"
                    >
                        RETOUR
                    </button>
                    <div className="w-10 h-10 bg-[#D35400] rounded-full flex items-center justify-center font-black text-lg flex-shrink-0 ring-2 ring-white/30">
                        {shopName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold leading-tight truncate">{shopName}</p>
                        <p className="text-xs text-white/70">En ligne · Répond en quelques minutes</p>
                    </div>
                </div>

                {/* Zone des messages */}
                <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                    {messages.length === 0 && (
                        <div className="flex justify-center">
                            <div className="bg-white/80 dark:bg-[#1e1e1e]/80 rounded-xl px-4 py-3 text-center shadow-sm max-w-xs transition-colors">
                                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Début de la conversation avec <strong>{shopName}</strong></p>
                            </div>
                        </div>
                    )}

                    {groupedMessages.map((msg) => {
                        // STATIQUE : conversation.user_id = le client qui a initié
                        const isClient = msg.sender_id === conversation.user_id;
                        // isOnRight : côté client, ses msg à droite ; côté vendeur, msg client à gauche
                        const isOnRight = isSeller ? !isClient : isClient;
                        const senderName = msg.sender?.name ?? (isClient ? 'Client' : shopName);

                        return (
                            <div
                                key={msg.id}
                                className={`flex items-end gap-2 ${isOnRight ? 'flex-row-reverse' : 'flex-row'} ${msg.isFirst ? 'mt-3' : 'mt-0.5'}`}
                            >
                                {/* Avatar */}
                                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-black text-white
                                    ${isClient ? 'bg-indigo-500' : 'bg-[#8B4513]'}
                                    ${!msg.isLast ? 'opacity-0' : ''}`}>
                                    {senderName.charAt(0).toUpperCase()}
                                </div>

                                <div className={`flex flex-col ${isOnRight ? 'items-end' : 'items-start'} max-w-[72%]`}>
                                    {/* Nom côté gauche uniquement, premier msg du groupe */}
                                    {msg.isFirst && !isOnRight && (
                                        <span className={`text-[11px] font-bold mb-1 ml-2 ${isClient ? 'text-indigo-600' : 'text-[#8B4513]'}`}>
                                            {senderName}
                                        </span>
                                    )}

                                    {/* Bulle : CLIENT → Vert | VENDEUR → Blanc */}
                                    <div className={`px-3 py-2 shadow-sm text-sm leading-relaxed rounded-2xl transition-colors ${
                                        isClient
                                            ? 'bg-[#D9FDD3] dark:bg-[#056162] text-gray-800 dark:text-gray-100 rounded-br-md'
                                            : 'bg-white dark:bg-[#1e1e1e] text-gray-800 dark:text-gray-100 rounded-bl-md'
                                    }`}>
                                        <p>{msg.content}</p>
                                        <div className={`flex items-center gap-1 mt-1 ${isOnRight ? 'justify-end' : 'justify-start'}`}>
                                            <span className="text-[10px] text-gray-400 dark:text-gray-500">{formatTime(msg.created_at)}</span>
                                            {isOnRight && (
                                                <span className="text-[8px] font-black text-[#53BDEB] uppercase ml-1">Lu</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={bottomRef} />
                </div>

                {/* Zone de saisie */}
                <form onSubmit={sendMessage} className="bg-[#F0F2F5] dark:bg-[#1e1e1e] border-t border-gray-200 dark:border-gray-800 p-2 flex items-center gap-2 transition-colors">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Message..."
                        className="flex-1 bg-white dark:bg-[#252525] text-gray-900 dark:text-white rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8B4513]/20 transition-all shadow-sm border-none"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isSending}
                        className={`px-4 h-11 rounded-full flex items-center justify-center text-white transition-all transform active:scale-90 flex-shrink-0 shadow text-[10px] font-black uppercase tracking-widest ${
                            input.trim() && !isSending ? 'bg-[#8B4513] hover:bg-[#70360f]' : 'bg-gray-300 cursor-not-allowed'
                        }`}
                    >
                        Envoyer
                    </button>
                </form>

            </div>{/* fin fenêtre */}
        </div>
    );
}
