import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import ThemeToggle from '@/Components/ThemeToggle';
import { motion } from 'framer-motion';

export default function SellerLayout({ children }) {
    const { auth, url, unreadMessagesCount, pendingOrdersCount, lowStockCount } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigation = [
        { name: "Vue d'ensemble", href: route('seller.dashboard'), route: 'seller.dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
        { name: 'Suivre en direct', href: route('seller.tracking'), route: 'seller.tracking', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
        { name: 'Mes Produits', href: route('seller.products'), route: 'seller.products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
        {
            name: 'Inventaire',
            href: route('seller.inventory'),
            route: 'seller.inventory',
            icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z',
            count: lowStockCount
        },
        {
            name: 'Commandes', 
            href: route('seller.orders'), 
            route: 'seller.orders', 
            icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
            count: pendingOrdersCount 
        },
        { 
            name: 'Messages', 
            href: '/seller/chat', 
            route: 'seller.chat', 
            icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', 
            count: unreadMessagesCount 
        },
        { name: 'Portefeuille', href: route('seller.wallet'), route: 'seller.wallet', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
        { name: 'Paramètres', href: route('seller.settings'), route: 'seller.settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
    ];

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-[#121212] font-sans overflow-hidden transition-colors duration-300">
            {/* Sidebar Overlay Mobile */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-[#1e1e1e] border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-center h-20 border-b border-gray-200 dark:border-gray-800">
                    <Link href="/">
                        <h1 className="text-3xl font-bold text-[#8B4513]">LoméShop</h1>
                    </Link>
                </div>
                <div className="p-4 overflow-y-auto h-[calc(100%-10rem)]">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 mt-4 px-4">Menu Vendeur</div>
                    <nav className="space-y-1">
                        {navigation.map((item) => {
                            const isActive = route().current(item.route) || window.location.pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`relative flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                                        isActive 
                                        ? 'bg-[#8B4513]/10 text-[#8B4513] font-black' 
                                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 w-1 h-6 bg-[#8B4513] rounded-r-full"></div>
                                    )}
                                    {item.name}
                                    {item.count > 0 && (
                                        <span className="ml-auto flex min-w-[20px] h-5 px-1.5 items-center justify-center rounded-full bg-[#B03A2E] text-[10px] font-black text-white ring-2 ring-white dark:ring-[#1e1e1e] animate-pulse">
                                            {item.count}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1e1e1e]">
                    <Link href={route('logout')} method="post" as="button" className="flex items-center px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full">
                        Déconnexion
                    </Link>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="flex items-center justify-between h-20 px-6 bg-white dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-gray-800 flex-shrink-0 transition-colors">
                    <button 
                        className="p-2 -ml-2 text-gray-400 lg:hidden text-[10px] font-black uppercase tracking-widest"
                        onClick={() => setSidebarOpen(true)}
                    >
                        MENU
                    </button>

                    <div className="hidden lg:flex items-center bg-gray-50 rounded-full px-4 py-2 w-96 border border-gray-100 focus-within:ring-2 focus-within:ring-[#8B4513]/20 transition-all">
                        <input type="text" placeholder="Rechercher..." className="bg-transparent border-none focus:ring-0 text-sm w-full" />
                    </div>

                    <div className="flex items-center gap-6">
                        <ThemeToggle />
                        <div className="flex flex-col items-end hidden sm:flex">
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{auth.user?.name}</p>
                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Vendeur Certifié</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-[#8B4513] flex items-center justify-center text-white font-black shadow-lg shadow-[#8B4513]/20">
                            {auth.user?.name.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Main Content Scrollable */}
                <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#121212] p-6 lg:p-8 transition-colors">
                    <motion.div
                        key={url}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.3 }}
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    );
}
