import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useCart } from '@/Contexts/CartContext';
import CartDrawer from './CartDrawer';
import Dropdown from './Dropdown';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';

export default function Navbar({ elegant = false }) {
    const { url, props } = usePage();
    const { auth } = props || {};
    const { cartCount = 0 } = useCart() || {};
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Safer check for roles/flows
    const isSellerFlow = auth?.user?.role === 'seller' || url?.startsWith('/seller') || url?.startsWith('/shops/create');
    const isDriverFlow = auth?.user?.role === 'driver' || url?.startsWith('/driver');

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

    // Liens de navigation principaux, partagés entre la barre desktop et le panneau mobile
    const navLinks = isSellerFlow ? [
        { name: 'seller.dashboard', href: getRoute('seller.dashboard', '/seller/dashboard'), label: 'Dashboard' },
        { name: 'seller.tracking', href: getRoute('seller.tracking', '/seller/tracking'), label: 'Suivre en direct' },
        { name: 'shops.create', href: getRoute('shops.create', '/shops/create'), label: 'Ma Boutique' },
    ] : isDriverFlow ? [
        { name: 'driver.dashboard', href: getRoute('driver.dashboard', '/driver/dashboard'), label: 'Dashboard Livreur' },
    ] : [
        { name: 'home', href: getRoute('home', '/'), label: 'Accueil' },
        { name: 'explore', href: getRoute('explore', '/explore'), label: 'Catégories' },
        { name: 'map', href: getRoute('map', '/map'), label: 'Map View' },
        { name: 'tracking', href: getRoute('tracking', '/tracking'), label: 'Tracking' },
        { name: 'orders.index', href: getRoute('orders.index', '/my-orders'), label: 'Mes Commandes' },
    ];

    const navBg = 'bg-[#FDF8F4]/80 dark:bg-[#0f0b08]/90 border-gray-100/50 dark:border-white/10';
    const iconColor = 'text-gray-700 dark:text-white/90 hover:bg-gray-100 dark:hover:bg-white/10';

    return (
        <>
            <nav className={`${navBg} backdrop-blur-md sticky top-0 z-50 border-b transition-colors duration-300`}>
            <div className="h-[80px] flex items-center justify-between px-6 md:px-12">
            {/* Logo */}
            <div className="flex items-center">
                <Link href={isSellerFlow ? getRoute('seller.dashboard', '/seller/dashboard') : getRoute('home', '/')} prefetch className="flex items-center">
                    {elegant ? (
                        <h1 className="text-[28px] font-serif italic tracking-wide text-gray-900 dark:text-[#F5EDE0]">
                            Lomé<span className="text-[#D35400] dark:text-[#D4AF7A]">Shop</span>
                        </h1>
                    ) : (
                        <h1 className="text-[28px] font-bold tracking-tight">
                            <span className="text-[#D35400]">Lomé</span>
                            <span className="text-[#333333] dark:text-white">Shop</span>
                        </h1>
                    )}
                </Link>
            </div>

            {/* Centered Desktop Links */}
            <div className="hidden lg:flex space-x-6 items-center justify-end">
                {navLinks.map(link => (
                    <Link
                        key={link.name}
                        href={link.href}
                        prefetch
                        className={`font-bold text-sm pb-1 ${
                            isCurrent(link.name)
                                ? (elegant ? 'text-[#D35400] dark:text-[#D4AF7A] border-b-2 border-[#D35400] dark:border-[#D4AF7A]' : 'text-[#B03A2E] border-b-2 border-[#B03A2E]')
                                : (elegant ? 'text-[#666666] dark:text-gray-300 hover:text-[#D35400] dark:hover:text-[#D4AF7A]' : 'text-[#666666] dark:text-gray-400 hover:text-[#B03A2E] dark:hover:text-[#B03A2E]')
                        }`}
                    >
                        {link.label}
                    </Link>
                ))}
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-4 md:space-x-6">
                {/* Menu burger : seule porte d'accès aux liens ci-dessus en dessous de 1024px (lg) */}
                <button
                    onClick={() => setMobileMenuOpen(open => !open)}
                    className={`lg:hidden p-2 rounded-full transition-all ${iconColor}`}
                    aria-label="Ouvrir le menu"
                    aria-expanded={mobileMenuOpen}
                >
                    {mobileMenuOpen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>

                {/* Messages : caché sur mobile (repris dans le panneau du menu burger) faute de place dans la barre */}
                <Link
                    href={getRoute('chat.inbox', '/chat/inbox')}
                    prefetch
                    className={`hidden sm:flex relative p-2 rounded-full transition-all group ${iconColor}`}
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
                        className={`transition-colors relative focus:outline-none ${elegant ? 'text-[#B03A2E] dark:text-[#D4AF7A] hover:text-[#8B4513] dark:hover:text-white' : 'text-[#B03A2E] hover:text-[#8B4513]'}`}
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
                {/* Notifications Bell */}
                {auth?.user && <NotificationBell user={auth.user} />}

                {/* Theme Toggle : caché sur mobile (repris dans le panneau du menu burger) faute de place dans la barre */}
                <div className="hidden sm:block">
                    <ThemeToggle />
                </div>

                {/* Profile Dropdown */}
                {auth?.user ? (
                    <Dropdown>
                        <Dropdown.Trigger>
                            <button className={`flex items-center focus:outline-none hover:opacity-80 transition-opacity ${elegant ? 'text-[#B03A2E] dark:text-[#D4AF7A]' : 'text-[#B03A2E]'}`}>
                                <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs uppercase ${elegant ? 'bg-[#B03A2E] dark:bg-[#D4AF7A] dark:text-[#1a1206]' : 'bg-[#B03A2E]'}`}>
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
                                <Dropdown.Link href={getRoute('seller.dashboard', '/seller/dashboard')} prefetch>Dashboard Vendeur</Dropdown.Link>
                            ) : auth.user.role === 'driver' ? (
                                <Dropdown.Link href={getRoute('driver.dashboard', '/driver/dashboard')} prefetch>Dashboard Livreur</Dropdown.Link>
                            ) : (
                                <Dropdown.Link href={getRoute('profile.edit', '/profile')} prefetch>Mon Profil</Dropdown.Link>
                            )}
                            
                            <Dropdown.Link href={getRoute('logout', '/logout')} method="post" as="button" className="text-red-600">
                                Déconnexion
                            </Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                ) : (
                    <Link href={getRoute('role.selection', '/select-role')} prefetch className={`transition-colors ${elegant ? 'text-[#B03A2E] dark:text-[#D4AF7A] hover:text-[#8B4513] dark:hover:text-white' : 'text-[#B03A2E] hover:text-[#8B4513]'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </Link>
                )}
            </div>
            </div>

            {/* Panneau mobile : mêmes liens que la barre desktop, empilés */}
            {mobileMenuOpen && (
                <div className={`lg:hidden px-4 pb-4 flex flex-col gap-1 border-t ${elegant ? 'border-gray-100/50 dark:border-white/10' : 'border-gray-100/50 dark:border-gray-800'}`}>
                    {navLinks.map(link => (
                        <Link
                            key={link.name}
                            href={link.href}
                            prefetch
                            onClick={() => setMobileMenuOpen(false)}
                            className={`px-4 py-3 rounded-lg font-bold text-sm transition-all ${
                                isCurrent(link.name)
                                ? (elegant ? 'bg-[#B03A2E]/10 text-[#B03A2E] dark:bg-[#D4AF7A]/10 dark:text-[#D4AF7A]' : 'bg-[#B03A2E]/10 text-[#B03A2E]')
                                : (elegant ? 'text-[#666666] dark:text-gray-300 hover:text-[#B03A2E] dark:hover:text-[#D4AF7A] hover:bg-[#B03A2E]/5 dark:hover:bg-white/5' : 'text-[#666666] dark:text-gray-400 hover:text-[#B03A2E] hover:bg-[#B03A2E]/5')
                            }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <Link
                        href={getRoute('chat.inbox', '/chat/inbox')}
                        prefetch
                        onClick={() => setMobileMenuOpen(false)}
                        className={`px-4 py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-between ${elegant ? 'text-[#666666] dark:text-gray-300 hover:text-[#B03A2E] dark:hover:text-[#D4AF7A] hover:bg-[#B03A2E]/5 dark:hover:bg-white/5' : 'text-[#666666] dark:text-gray-400 hover:text-[#B03A2E] hover:bg-[#B03A2E]/5'}`}
                    >
                        Messages
                        {usePage().props.unreadMessagesCount > 0 && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#B03A2E] text-[10px] font-black text-white">
                                {usePage().props.unreadMessagesCount > 9 ? '9+' : usePage().props.unreadMessagesCount}
                            </span>
                        )}
                    </Link>
                    <div className="flex items-center justify-between px-4 py-3">
                        <span className={`font-bold text-sm ${elegant ? 'text-[#666666] dark:text-gray-300' : 'text-[#666666] dark:text-gray-400'}`}>Mode sombre</span>
                        <ThemeToggle />
                    </div>
                </div>
            )}
        </nav>
        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
    );
}
