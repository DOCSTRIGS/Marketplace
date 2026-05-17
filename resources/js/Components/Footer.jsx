import React from 'react';
import { Link } from '@inertiajs/react';

export default function Footer() {
    return (
        <footer className="bg-[#FAF9F8] dark:bg-[#111111] pt-16 pb-8 mt-auto border-t border-gray-200/50 dark:border-white/5 transition-colors duration-300">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-16">
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
                            <li><Link href="#" className="text-gray-500 dark:text-gray-400 hover:text-[#D35400] dark:hover:text-[#D35400] text-xs transition-colors">Boutiques</Link></li>
                            <li><Link href="#" className="text-gray-500 dark:text-gray-400 hover:text-[#D35400] dark:hover:text-[#D35400] text-xs transition-colors">Nouveautés</Link></li>
                            <li><Link href="#" className="text-gray-500 dark:text-gray-400 hover:text-[#D35400] dark:hover:text-[#D35400] text-xs transition-colors">Promotions</Link></li>
                        </ul>
                    </div>

                    {/* Links: Vendre */}
                    <div>
                        <h3 className="text-gray-800 dark:text-gray-200 font-black text-xs uppercase tracking-widest mb-5">Vendre</h3>
                        <ul className="space-y-3 font-medium">
                            <li><Link href={route('role.selection')} className="text-gray-500 dark:text-gray-400 hover:text-[#D35400] dark:hover:text-[#D35400] text-xs transition-colors">Vendre sur LoméShop</Link></li>
                            <li><Link href="#" className="text-gray-500 dark:text-gray-400 hover:text-[#D35400] dark:hover:text-[#D35400] text-xs transition-colors">Centre d'aide</Link></li>
                            <li><Link href={route('seller.dashboard')} className="text-gray-500 dark:text-gray-400 hover:text-[#D35400] dark:hover:text-[#D35400] text-xs transition-colors">Portail vendeur</Link></li>
                        </ul>
                    </div>

                    {/* Links: Légal */}
                    <div>
                        <h3 className="text-gray-800 dark:text-gray-200 font-black text-xs uppercase tracking-widest mb-5">Légal</h3>
                        <ul className="space-y-3 font-medium">
                            <li><Link href="#" className="text-gray-500 dark:text-gray-400 hover:text-[#D35400] dark:hover:text-[#D35400] text-xs transition-colors">Conditions d'utilisation</Link></li>
                            <li><Link href="#" className="text-gray-500 dark:text-gray-400 hover:text-[#D35400] dark:hover:text-[#D35400] text-xs transition-colors">Politique de confidentialité</Link></li>
                        </ul>
                    </div>

                    {/* Socials */}
                    <div>
                        <h3 className="text-gray-800 dark:text-gray-200 font-black text-xs uppercase tracking-widest mb-5">Suivez-nous</h3>
                        <div className="flex space-x-4">
                            <a href="#" className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-[#D35400]/10 hover:text-[#D35400] transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                </svg>
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-[#D35400]/10 hover:text-[#D35400] transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                </svg>
                            </a>
                        </div>
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
