import React from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function Footer() {
    const { auth } = usePage().props;
    const isSeller = auth?.user?.role === 'seller';

    return (
        <footer className="bg-[#FAF9F8] dark:bg-[#111111] pt-16 pb-8 mt-auto border-t border-gray-200/50 dark:border-white/5 transition-colors duration-300">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
                    {/* Brand Info */}
                    <div className="col-span-2">
                        <Link href={route('home')} className="inline-block mb-4">
                            <h2 className="text-[24px] font-black tracking-tight uppercase">
                                <span className="text-[#D35400]">Lomé</span>
                                <span className="text-gray-800 dark:text-white">Shop</span>
                            </h2>
                        </Link>
                        <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed max-w-xs pr-4 font-medium">
                            La première marketplace de proximité au Togo, connectant les artisans et commerçants locaux aux clients de la capitale.
                        </p>
                    </div>

                    {/* Links: Acheter */}
                    <div>
                        <h3 className="text-gray-800 dark:text-gray-200 font-black text-xs uppercase tracking-widest mb-5">Acheter</h3>
                        <ul className="space-y-3 font-medium">
                            <li><Link href={route('explore')} className="text-gray-500 dark:text-gray-400 hover:text-[#D35400] dark:hover:text-[#D35400] text-xs transition-colors">Boutiques</Link></li>
                            <li><Link href={route('explore', { sort: 'Nouveautés' })} className="text-gray-500 dark:text-gray-400 hover:text-[#D35400] dark:hover:text-[#D35400] text-xs transition-colors">Nouveautés</Link></li>
                        </ul>
                    </div>

                    {/* Links: Vendre */}
                    <div>
                        <h3 className="text-gray-800 dark:text-gray-200 font-black text-xs uppercase tracking-widest mb-5">Vendre</h3>
                        <ul className="space-y-3 font-medium">
                            {isSeller ? (
                                <li><Link href={route('seller.dashboard')} className="text-gray-500 dark:text-gray-400 hover:text-[#D35400] dark:hover:text-[#D35400] text-xs transition-colors">Portail vendeur</Link></li>
                            ) : (
                                <li><Link href={route('role.selection')} className="text-gray-500 dark:text-gray-400 hover:text-[#D35400] dark:hover:text-[#D35400] text-xs transition-colors">Vendre sur LoméShop</Link></li>
                            )}
                            <li><Link href={route('help')} className="text-gray-500 dark:text-gray-400 hover:text-[#D35400] dark:hover:text-[#D35400] text-xs transition-colors">Centre d'aide</Link></li>
                        </ul>
                    </div>

                    {/* Links: Légal */}
                    <div>
                        <h3 className="text-gray-800 dark:text-gray-200 font-black text-xs uppercase tracking-widest mb-5">Légal</h3>
                        <ul className="space-y-3 font-medium">
                            <li><Link href={route('legal.terms')} className="text-gray-500 dark:text-gray-400 hover:text-[#D35400] dark:hover:text-[#D35400] text-xs transition-colors">Conditions d'utilisation</Link></li>
                            <li><Link href={route('legal.privacy')} className="text-gray-500 dark:text-gray-400 hover:text-[#D35400] dark:hover:text-[#D35400] text-xs transition-colors">Politique de confidentialité</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-200/50 dark:border-white/5">
                    <div className="hidden md:block w-32"></div> {/* Spacer for centering */}
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 font-bold text-center flex-1 mb-4 md:mb-0">
                        &copy; {new Date().getFullYear()} LoméShop. Fabriqué avec soin au Togo.
                    </p>
                    <div className="flex space-x-2 w-32 justify-end">
                        <div className="w-9 h-6 bg-gradient-to-br from-[#8B4513] to-[#D35400] rounded-lg flex items-center justify-center text-[9px] font-black text-white shadow-sm shadow-[#D35400]/10 tracking-widest">VISA</div>
                        <div className="w-9 h-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center text-[9px] font-black text-white shadow-sm shadow-indigo-600/10 tracking-widest">T-MONEY</div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
