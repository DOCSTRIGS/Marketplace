import React from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import ThemeToggle from '@/Components/ThemeToggle';

export default function AdminNavbar({ activeTab = 'overview' }) {
    const { url, props } = usePage();
    const { auth } = props;

    const tabs = [
        { id: 'overview',   label: "Vue d'ensemble", href: route('admin.dashboard', { tab: 'overview' }) },
        { id: 'shops',      label: "Boutiques", href: route('admin.dashboard', { tab: 'shops' }) },
        { id: 'withdrawals', label: "Retraits", href: route('admin.dashboard', { tab: 'withdrawals' }) },
        { id: 'reviews',    label: "Modération Avis", href: route('admin.dashboard', { tab: 'reviews' }) },
        { id: 'categories', label: "Catégories", href: route('admin.dashboard', { tab: 'categories' }) },
        { id: 'fleet',      label: "Suivi Flotte", href: route('admin.dashboard', { tab: 'fleet' }) },
        { id: 'finance',    label: "Finances", href: route('admin.finance') },
        { id: 'users',      label: "Utilisateurs", href: route('admin.dashboard', { tab: 'users' }) },
        { id: 'drivers',    label: "Livreurs", href: route('admin.dashboard', { tab: 'drivers' }) },
    ];

    const isFinancePage = url?.includes('/admin/finance');
    const currentActive = isFinancePage ? 'finance' : activeTab;

    return (
        <nav className="h-[80px] bg-white dark:bg-[#1a1a1a] flex items-center justify-between px-8 md:px-12 sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
            {/* Logo */}
            <div className="flex items-center gap-8">
                <Link href={route('admin.dashboard')} className="flex items-center">
                    <h1 className="text-[24px] font-black tracking-tighter uppercase">
                        <span className="text-[#8B4513]">Lomé</span>
                        <span className="text-gray-900 dark:text-white">Admin</span>
                    </h1>
                </Link>

                <div className="hidden xl:flex items-center gap-1 bg-gray-50 dark:bg-white/5 p-1 rounded-xl">
                    {tabs.map(tab => (
                        <Link
                            key={tab.id}
                            href={tab.href}
                            className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                                currentActive === tab.id 
                                ? 'bg-[#8B4513] text-white shadow-md shadow-[#8B4513]/20' 
                                : 'text-gray-500 hover:text-[#8B4513] hover:bg-[#8B4513]/5'
                            }`}
                        >
                            {tab.label}
                            {tab.id === 'shops' && props.adminCounts?.pendingShops > 0 && (
                                <span className="bg-orange-500 text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full animate-pulse">
                                    {props.adminCounts.pendingShops}
                                </span>
                            )}
                            {tab.id === 'withdrawals' && props.adminCounts?.pendingWithdrawals > 0 && (
                                <span className="bg-orange-500 text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full animate-pulse">
                                    {props.adminCounts.pendingWithdrawals}
                                </span>
                            )}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-6">
                <ThemeToggle />
                
                <div className="flex flex-col items-end hidden sm:flex">
                    <p className="text-xs font-bold text-gray-900 dark:text-white">{auth.user.name}</p>
                    <p className="text-[9px] text-[#8B4513] font-black uppercase tracking-widest">Super Administrateur</p>
                </div>

                <div className="flex items-center gap-4">
                    <Link 
                        href={route('logout')} 
                        method="post" 
                        as="button" 
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Déconnexion"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
