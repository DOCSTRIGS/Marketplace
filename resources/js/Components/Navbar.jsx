import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useCart } from '@/Contexts/CartContext';
import CartDrawer from './CartDrawer';
import Dropdown from './Dropdown';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
    const { url, props } = usePage();
    const { auth } = props || {};
    const { cartCount = 0 } = useCart() || {};
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Safer check for seller flow
    const isSellerFlow = auth?.user?.role === 'seller' || url?.startsWith('/seller') || url?.startsWith('/shops/create');

    // Helper for safe route checking
    const isCurrent = (name) => {
        try {
            return typeof route !== 'undefined' && route().current(name);
        } catch (e) {
            return false;
        }
    };

    // Helper for safe route generation
    const getRoute = (name, fallback = '#') => {
        try {
            return typeof route !== 'undefined' ? route(name) : fallback;
        } catch (e) {
            return fallback;
        }
    };

    return (
        <nav className="h-[80px] bg-[#FDF8F4] dark:bg-[#1a1a1a] flex items-center justify-between px-6 md:px-12 sticky top-0 z-50 border-b border-transparent dark:border-gray-800 transition-colors duration-300">
            {/* Logo */}
            <div className="flex items-center">
                <Link href={isSellerFlow ? getRoute('seller.dashboard', '/seller/dashboard') : getRoute('home', '/')} className="flex items-center">
                    <h1 className="text-[28px] font-bold tracking-tight">
                        <span className="text-[#D35400]">Lomé</span>
                        <span className="text-[#333333] dark:text-white">Shop</span>
                    </h1>
                </Link>
            </div>

            {/* Centered Desktop Links */}
            <div className="hidden lg:flex space-x-6 items-center justify-end">
                {isSellerFlow ? (
                    <>
                        <Link href={getRoute('seller.dashboard', '/seller/dashboard')} className={`font-bold text-sm pb-1 ${isCurrent('seller.dashboard') ? 'text-[#B03A2E] border-b-2 border-[#B03A2E]' : 'text-[#666666] hover:text-[#B03A2E]'}`}>
                            Dashboard
                        </Link>
                        <Link href={getRoute('seller.tracking', '/seller/tracking')} className={`font-bold text-sm pb-1 ${isCurrent('seller.tracking') ? 'text-[#B03A2E] border-b-2 border-[#B03A2E]' : 'text-[#666666] hover:text-[#B03A2E]'}`}>
                            Suivre en direct
                        </Link>
                        <Link href={getRoute('shops.create', '/shops/create')} className={`font-bold text-sm pb-1 ${isCurrent('shops.create') ? 'text-[#B03A2E] border-b-2 border-[#B03A2E]' : 'text-[#666666] hover:text-[#B03A2E]'}`}>
                            Ma Boutique
                        </Link>
                    </>
                ) : (
                    <>
                        <Link href={getRoute('home', '/')} className={`font-bold text-sm pb-1 ${isCurrent('home') ? 'text-[#B03A2E] border-b-2 border-[#B03A2E]' : 'text-[#666666] hover:text-[#B03A2E]'}`}>
                            Accueil
                        </Link>
                        <Link href={getRoute('explore', '/explore')} className={`font-bold text-sm pb-1 ${isCurrent('explore') ? 'text-[#B03A2E] border-b-2 border-[#B03A2E]' : 'text-[#666666] hover:text-[#B03A2E]'}`}>
                            Catégories
                        </Link>
                        <Link href={getRoute('map', '/map')} className={`font-bold text-sm pb-1 ${isCurrent('map') ? 'text-[#B03A2E] border-b-2 border-[#B03A2E]' : 'text-[#666666] hover:text-[#B03A2E]'}`}>
                            Map View
                        </Link>
                        <Link href={getRoute('tracking', '/tracking')} className={`font-bold text-sm pb-1 ${isCurrent('tracking') ? 'text-[#B03A2E] border-b-2 border-[#B03A2E]' : 'text-[#666666] hover:text-[#B03A2E]'}`}>
                            Tracking
                        </Link>
                        <Link href={getRoute('orders.index', '/my-orders')} className={`font-bold text-sm pb-1 ${isCurrent('orders.index') ? 'text-[#B03A2E] border-b-2 border-[#B03A2E]' : 'text-[#666666] dark:text-gray-400 hover:text-[#B03A2E] dark:hover:text-[#B03A2E]'}`}>
                            Mes Commandes
                        </Link>
                    </>
                )}
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-6">
                {/* Messages */}
                <Link
                    href={getRoute('chat.inbox', '/chat/inbox')}
                    className="relative p-2 text-gray-700 dark:text-white/90 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-all group"
                    title="Messages"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    {/* Badge de messages non lus */}
                    {usePage().props.unreadMessagesCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#B03A2E] text-[10px] font-black text-white ring-2 ring-white dark:ring-[#121212] animate-pulse">
                            {usePage().props.unreadMessagesCount > 9 ? '9+' : usePage().props.unreadMessagesCount}
                        </span>
                    )}
                </Link>

                {/* Cart Icon - Only for non-sellers */}
                {auth?.user?.role !== 'seller' && (
                    <button 
                        onClick={() => setIsCartOpen(true)}
                        className="text-[#B03A2E] hover:text-[#8B4513] transition-colors relative focus:outline-none"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-[#D35400] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                                {cartCount}
                            </span>
                        )}
                    </button>
                )}
                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Profile Dropdown */}
                {auth?.user ? (
                    <Dropdown>
                        <Dropdown.Trigger>
                            <button className="flex items-center text-[#B03A2E] focus:outline-none hover:opacity-80 transition-opacity">
                                <div className="w-8 h-8 rounded-full bg-[#B03A2E] text-white flex items-center justify-center font-bold text-xs uppercase">
                                    {auth.user.name.charAt(0)}
                                </div>
                                <svg className="ml-2 h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </Dropdown.Trigger>

                        <Dropdown.Content width="48">
                            <div className="px-4 py-2 border-b border-gray-100">
                                <p className="text-xs text-gray-500">Connecté en tant que</p>
                                <p className="text-sm font-semibold text-gray-800 truncate">{auth.user.name}</p>
                            </div>
                            
                            {auth.user.role === 'seller' ? (
                                <Dropdown.Link href={getRoute('seller.dashboard', '/seller/dashboard')}>Dashboard Vendeur</Dropdown.Link>
                            ) : (
                                <Dropdown.Link href={getRoute('profile.edit', '/profile')}>Mon Profil</Dropdown.Link>
                            )}
                            
                            <Dropdown.Link href={getRoute('logout', '/logout')} method="post" as="button" className="text-red-600">
                                Déconnexion
                            </Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                ) : (
                    <Link href={getRoute('role.selection', '/select-role')} className="text-[#B03A2E] hover:text-[#8B4513] transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </Link>
                )}
            </div>

            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </nav>
    );
}
