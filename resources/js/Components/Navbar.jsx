import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useCart } from '@/Contexts/CartContext';
import CartDrawer from './CartDrawer';

export default function Navbar() {
    const { url, props } = usePage();
    const { auth } = props;
    const { cartCount } = useCart();
    const [isCartOpen, setIsCartOpen] = useState(false);

    const isSellerFlow = auth?.user?.role === 'seller' || url?.startsWith('/seller') || url?.startsWith('/shops/create');

    return (
        <nav className="h-[80px] bg-[#FDF8F4] flex items-center justify-between px-6 md:px-12 sticky top-0 z-50">
            {/* Logo */}
            <div className="flex items-center">
                <Link href={isSellerFlow ? route('seller.dashboard') : route('home')} className="flex items-center">
                    <h1 className="text-[28px] font-bold tracking-tight">
                        <span className="text-[#D35400]">Lomé</span>
                        <span className="text-[#333333]">Shop</span>
                    </h1>
                </Link>
            </div>

            {/* Centered Desktop Links */}
            <div className="hidden lg:flex space-x-6 items-center justify-end">
                {isSellerFlow ? (
                    <>
                        <Link href={route('seller.dashboard')} className={`font-bold text-sm pb-1 ${route().current('seller.dashboard') ? 'text-[#B03A2E] border-b-2 border-[#B03A2E]' : 'text-[#666666] hover:text-[#B03A2E]'}`}>
                            Dashboard
                        </Link>
                        <Link href={route('seller.tracking')} className={`font-bold text-sm pb-1 ${route().current('seller.tracking') ? 'text-[#B03A2E] border-b-2 border-[#B03A2E]' : 'text-[#666666] hover:text-[#B03A2E]'}`}>
                            Suivre en direct
                        </Link>
                        <Link href={route('shops.create')} className={`font-bold text-sm pb-1 ${route().current('shops.create') ? 'text-[#B03A2E] border-b-2 border-[#B03A2E]' : 'text-[#666666] hover:text-[#B03A2E]'}`}>
                            Créer ma Boutique
                        </Link>
                    </>
                ) : (
                    <>
                        <Link href={route('home')} className={`font-bold text-sm pb-1 ${route().current('home') ? 'text-[#B03A2E] border-b-2 border-[#B03A2E]' : 'text-[#666666] hover:text-[#B03A2E]'}`}>
                            Accueil
                        </Link>
                        <Link href={route('explore')} className={`font-bold text-sm pb-1 ${route().current('explore') ? 'text-[#B03A2E] border-b-2 border-[#B03A2E]' : 'text-[#666666] hover:text-[#B03A2E]'}`}>
                            Catégories
                        </Link>
                        <Link href={route('map')} className={`font-bold text-sm pb-1 ${route().current('map') ? 'text-[#B03A2E] border-b-2 border-[#B03A2E]' : 'text-[#666666] hover:text-[#B03A2E]'}`}>
                            Map View
                        </Link>
                        <Link href={route('tracking')} className={`font-bold text-sm pb-1 ${route().current('tracking') ? 'text-[#B03A2E] border-b-2 border-[#B03A2E]' : 'text-[#666666] hover:text-[#B03A2E]'}`}>
                            Tracking
                        </Link>
                        <Link href={route('orders.index')} className={`font-bold text-sm pb-1 ${route().current('orders.index') ? 'text-[#B03A2E] border-b-2 border-[#B03A2E]' : 'text-[#666666] hover:text-[#B03A2E]'}`}>
                            Mes Commandes
                        </Link>
                    </>
                )}
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-6">
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

                {/* Bell Icon */}
                <button className="text-[#B03A2E] hover:text-[#8B4513] transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                </button>

                {/* Profile Image / Auth */}
                {auth?.user ? (
                    <Link href={auth.user.role === 'seller' ? route('seller.dashboard') : route('profile.edit')} className="text-[#B03A2E]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </Link>
                ) : (
                    <Link href={route('role.selection')} className="text-[#B03A2E]">
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
