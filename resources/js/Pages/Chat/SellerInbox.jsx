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
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    
    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);

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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

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
        if ((!input.trim() && !imageFile) || isSending || !activeConv) return;

        setIsSending(true);
        const content = input.trim();
        const currentImageFile = imageFile;
        const currentImagePreview = imagePreview;

        setInput('');
        removeImage();

        const tempMsg = {
            id: `temp-${Date.now()}`,
            sender_id: authUser.id,
            content,
            type: currentImageFile ? 'image' : 'text',
            image_path: currentImagePreview, // Use preview for temp
            created_at: new Date().toISOString(),
            sender: authUser,
        };
        
        setMessages(prev => [...prev, tempMsg]);
        setConversations(prev => prev.map(c =>
            c.id === activeConv.id ? { ...c, messages: [tempMsg] } : c
        ));

        try {
            const formData = new FormData();
            formData.append('content', content);
            if (currentImageFile) formData.append('image', currentImageFile);

            const res = await axios.post(`/chat/${activeConv.id}/message`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
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

            <div className="flex h-[calc(100vh-5rem)] -m-6 lg:-m-8 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-[#1e1e1e] transition-colors">
                {/* ──────── COLONNE GAUCHE ──────── */}
                <div className="w-full sm:w-80 flex-shrink-0 border-r border-gray-100 dark:border-gray-800 flex flex-col bg-white dark:bg-[#1e1e1e] transition-colors">
                    <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-800 bg-[#8B4513] dark:bg-[#252525] text-white">
                        <h2 className="text-lg font-black">Messages</h2>
                        <p className="text-xs text-white/70">{conversations.length} conversation(s)</p>
                    </div>

                    {/* Search Bar for Seller */}
                    <div className="p-3 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-black/10">
                        <div className="relative">
                            <input 
                                type="text"
                                placeholder="Rechercher un client..."
                                className="w-full bg-white dark:bg-[#252525] border-none rounded-xl text-xs font-bold py-2.5 pl-9 pr-4 focus:ring-2 focus:ring-[#8B4513]/20 dark:text-white transition-all shadow-sm"
                                onChange={(e) => {
                                    const q = e.target.value.toLowerCase();
                                    if (!q) {
                                        setConversations(initialConvs);
                                        return;
                                    }
                                    setConversations(initialConvs.filter(c => 
                                        (c.user?.name || '').toLowerCase().includes(q)
                                    ));
                                }}
                            />
                            <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {conversations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-6">
                                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 italic">Aucun résultat trouvé</p>
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
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-gray-50 dark:border-gray-800 ${
                                            isActive ? 'bg-[#8B4513]/10 dark:bg-white/5 border-l-4 border-l-[#8B4513]' : 'hover:bg-gray-50 dark:hover:bg-white/5'
                                        }`}
                                    >
                                        <div className="w-11 h-11 bg-indigo-500 rounded-full flex items-center justify-center text-white font-black text-base flex-shrink-0">
                                            {clientName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center">
                                                <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{clientName}</p>
                                                {lastMsg && <span className="text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0 ml-1">{formatTime(lastMsg.created_at)}</span>}
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                                {lastMsg ? (lastMsg.type === 'image' ? 'Image' : lastMsg.content) : 'Nouvelle conversation…'}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* ──────── COLONNE DROITE ──────── */}
                <div className="flex-1 flex flex-col transition-all bg-[#E5DDD5] dark:bg-[#121212]">
                    {!activeConv ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8 gap-4">
                            <p className="font-bold text-gray-600 dark:text-gray-400 text-lg">Sélectionnez une conversation</p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-[#8B4513] dark:bg-[#1e1e1e] text-white px-4 py-3 flex items-center gap-3 shadow-md z-10 transition-colors border-b dark:border-gray-800">
                                <div className="w-9 h-9 bg-indigo-400 rounded-full flex items-center justify-center font-black flex-shrink-0">
                                    {(activeConv.user?.name ?? 'C').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold leading-tight">{activeConv.user?.name ?? 'Client'}</p>
                                    <p className="text-xs text-white/70">En ligne</p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
                                {loadingMessages ? (
                                    <div className="flex justify-center py-8">
                                        <div className="w-6 h-6 border-2 border-[#8B4513] border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : groupedMessages.map((msg) => {
                                    const isClient = msg.sender_id === activeConv.user_id;
                                    const senderName = msg.sender?.name ?? (isClient ? 'Client' : shopName);

                                    return (
                                        <div
                                            key={msg.id}
                                            className={`flex items-end gap-2 ${isClient ? 'flex-row' : 'flex-row-reverse'} ${msg.isFirst ? 'mt-4' : 'mt-0.5'}`}
                                        >
                                            <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-black text-white ${
                                                isClient ? 'bg-indigo-500' : 'bg-[#8B4513]'
                                            } ${!msg.isLast ? 'opacity-0' : ''}`}>
                                                {senderName.charAt(0).toUpperCase()}
                                            </div>

                                            <div className={`flex flex-col ${isClient ? 'items-start' : 'items-end'} max-w-[70%]`}>
                                                {msg.isFirst && (
                                                    <span className={`text-[10px] font-bold mb-0.5 ${isClient ? 'text-indigo-600 ml-2' : 'text-[#8B4513] mr-2'}`}>
                                                        {senderName}
                                                    </span>
                                                )}

                                                <div className={`px-2 py-1.5 rounded-2xl shadow-sm text-sm leading-relaxed transition-colors ${
                                                    isClient ? 'bg-[#D9FDD3] dark:bg-[#056162] text-gray-800 dark:text-gray-100 rounded-bl-md' : 'bg-white dark:bg-[#1e1e1e] text-gray-800 dark:text-gray-100 rounded-br-md'
                                                }`}>
                                                    {msg.type === 'image' && msg.image_path && (
                                                        <div className="mb-1 rounded-lg overflow-hidden border border-black/5">
                                                            <img 
                                                                src={msg.image_path.startsWith('blob:') ? msg.image_path : `/storage/${msg.image_path}`} 
                                                                alt="Attachment" 
                                                                className="max-w-full max-h-72 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                                                                onClick={() => window.open(msg.image_path.startsWith('blob:') ? msg.image_path : `/storage/${msg.image_path}`, '_blank')}
                                                            />
                                                        </div>
                                                    )}
                                                    {msg.content && <p className="px-1">{msg.content}</p>}
                                                    <div className={`flex items-center gap-1 mt-0.5 px-1 ${isClient ? 'justify-start' : 'justify-end'}`}>
                                                        <span className="text-[9px] text-gray-400 dark:text-gray-500">{formatTime(msg.created_at)}</span>
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

                            {/* Zone de saisie */}
                            <div className="bg-[#F0F2F5] dark:bg-[#1e1e1e] border-t border-gray-200 dark:border-gray-800 p-2 flex flex-col gap-2 transition-colors">
                                {imagePreview && (
                                    <div className="flex items-center gap-2 px-2 py-1">
                                        <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-[#8B4513] shadow-md">
                                            <img src={imagePreview} className="w-full h-full object-cover" />
                                            <button onClick={removeImage} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black shadow-md hover:bg-red-600 transition-colors">
                                                X
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <form onSubmit={sendMessage} className="flex items-center gap-2">
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="px-3 py-2 text-gray-500 dark:text-gray-400 hover:text-[#8B4513] dark:hover:text-white transition-colors rounded-lg hover:bg-white/50 dark:hover:bg-white/5 text-[10px] font-black uppercase tracking-widest">
                                        Joindre
                                    </button>
                                    <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                                    
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Tapez un message..."
                                        className="flex-1 bg-white dark:bg-[#252525] text-gray-900 dark:text-white border-none rounded-full px-5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8B4513]/20 transition-all shadow-sm"
                                    />
                                    
                                    <button
                                        type="submit"
                                        disabled={(!input.trim() && !imageFile) || isSending}
                                        className={`px-4 h-11 rounded-full flex items-center justify-center text-white transition-all transform active:scale-95 shadow-md text-[10px] font-black uppercase tracking-widest ${
                                            (input.trim() || imageFile) && !isSending ? 'bg-[#8B4513] hover:bg-[#70360f]' : 'bg-gray-300 cursor-not-allowed'
                                        }`}
                                    >
                                        Envoyer
                                    </button>
                                </form>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </SellerLayout>
    );
}
