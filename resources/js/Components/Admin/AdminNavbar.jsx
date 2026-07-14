import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import ThemeToggle from '@/Components/ThemeToggle';
import Dropdown from '@/Components/Dropdown';

export default function AdminNavbar({ activeTab = 'overview' }) {
    const { url, props } = usePage();
    const { auth } = props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        <nav className="bg-white dark:bg-[#1a1a1a] sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
            <div className="h-[80px] flex items-center justify-between px-8 md:px-12">
                {/* Logo */}
                <div className="flex items-center gap-8">
                    <Link href={route('admin.dashboard')} className="flex items-center">
                        <h1 className="text-[24px] font-black tracking-tighter uppercase">
                            <span className="text-[#8B4513]">Lomé</span>
                            <span className="text-gray-900 dark:text-white">Admin</span>
                        </h1>
                    </Link>

                    <div className="hidden lg:flex items-center gap-1 bg-gray-50 dark:bg-white/5 p-1 rounded-xl">
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
                <div className="flex items-center gap-4 md:gap-6">
                    <ThemeToggle />

                    <Dropdown>
                        <Dropdown.Trigger>
                            <button
                                className="w-9 h-9 rounded-full bg-[#8B4513] text-white flex items-center justify-center font-black text-xs uppercase shrink-0 hover:opacity-80 transition-opacity"
                                title={`${auth.user.name} — Super Administrateur`}
                            >
                                {auth.user.name.charAt(0)}
                            </button>
                        </Dropdown.Trigger>

                        <Dropdown.Content contentClasses="py-1 bg-white dark:bg-[#1e1e1e] dark:ring-1 dark:ring-gray-800">
                            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{auth.user.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{auth.user.email}</p>
                                <p className="text-[9px] text-[#8B4513] font-black uppercase tracking-widest mt-1">Super Administrateur</p>
                            </div>
                            <Dropdown.Link
                                href={route('profile.edit')}
                                className="dark:text-gray-300 dark:hover:bg-white/5"
                            >
                                Modifier nom, email, mot de passe
                            </Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>

                    <div className="flex items-center gap-2">
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

                        {/* Menu burger : seule porte d'accès aux onglets en dessous de 1280px (xl) */}
                        <button
                            onClick={() => setMobileMenuOpen(open => !open)}
                            className="lg:hidden p-2 text-gray-500 dark:text-gray-300 hover:text-[#8B4513] transition-colors"
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
                    </div>
                </div>
            </div>

            {/* Panneau mobile : nom complet + mêmes onglets que la barre desktop, empilés */}
            {mobileMenuOpen && (
                <div className="lg:hidden px-4 pb-4 flex flex-col gap-1 border-t border-gray-100 dark:border-gray-800">
                    <div className="px-4 py-3">
                        <p className="text-xs font-bold text-gray-900 dark:text-white">{auth.user.name}</p>
                        <p className="text-[9px] text-[#8B4513] font-black uppercase tracking-widest">Super Administrateur</p>
                    </div>
                    {tabs.map(tab => (
                        <Link
                            key={tab.id}
                            href={tab.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`px-4 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between ${
                                currentActive === tab.id
                                ? 'bg-[#8B4513] text-white'
                                : 'text-gray-500 dark:text-gray-300 hover:text-[#8B4513] hover:bg-[#8B4513]/5'
                            }`}
                        >
                            {tab.label}
                            {tab.id === 'shops' && props.adminCounts?.pendingShops > 0 && (
                                <span className="bg-orange-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                                    {props.adminCounts.pendingShops}
                                </span>
                            )}
                            {tab.id === 'withdrawals' && props.adminCounts?.pendingWithdrawals > 0 && (
                                <span className="bg-orange-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                                    {props.adminCounts.pendingWithdrawals}
                                </span>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </nav>
    );
}
