import React from 'react';
import { Link } from '@inertiajs/react';

export default function Footer() {
    return (
        <footer className="bg-[#FDF8F4] pt-16 pb-8 mt-auto border-t border-gray-200/50">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-16">
                    {/* Brand Info */}
                    <div className="col-span-2">
                        <Link href={route('home')} className="inline-block mb-4">
                            <h2 className="text-[24px] font-bold tracking-tight">
                                <span className="text-[#D35400]">Lomé</span>
                                <span className="text-[#333333]">Shop</span>
                            </h2>
                        </Link>
                        <p className="text-[#888888] text-xs leading-relaxed max-w-xs pr-4">
                            La première marketplace de proximité au Togo, connectant les artisans et commerçants locaux aux clients de la capitale.
                        </p>
                    </div>

                    {/* Links: Acheter */}
                    <div>
                        <h3 className="text-[#333333] font-bold text-xs uppercase tracking-wider mb-5">Acheter</h3>
                        <ul className="space-y-3">
                            <li><Link href="#" className="text-[#888888] hover:text-[#8B4513] text-xs transition-colors">Boutiques</Link></li>
                            <li><Link href="#" className="text-[#888888] hover:text-[#8B4513] text-xs transition-colors">Nouveautés</Link></li>
                            <li><Link href="#" className="text-[#888888] hover:text-[#8B4513] text-xs transition-colors">Promotions</Link></li>
                        </ul>
                    </div>

                    {/* Links: Vendre */}
                    <div>
                        <h3 className="text-[#333333] font-bold text-xs uppercase tracking-wider mb-5">Vendre</h3>
                        <ul className="space-y-3">
                            <li><Link href={route('role.selection')} className="text-[#888888] hover:text-[#8B4513] text-xs transition-colors">Vendre sur LoméShop</Link></li>
                            <li><Link href="#" className="text-[#888888] hover:text-[#8B4513] text-xs transition-colors">Centre d'aide</Link></li>
                            <li><Link href={route('seller.dashboard')} className="text-[#888888] hover:text-[#8B4513] text-xs transition-colors">Portail vendeur</Link></li>
                        </ul>
                    </div>

                    {/* Links: Légal */}
                    <div>
                        <h3 className="text-[#333333] font-bold text-xs uppercase tracking-wider mb-5">Légal</h3>
                        <ul className="space-y-3">
                            <li><Link href="#" className="text-[#888888] hover:text-[#8B4513] text-xs transition-colors">Conditions d'utilisation</Link></li>
                            <li><Link href="#" className="text-[#888888] hover:text-[#8B4513] text-xs transition-colors">Politique de confidentialité</Link></li>
                        </ul>
                    </div>

                    {/* Socials */}
                    <div>
                        <h3 className="text-[#333333] font-bold text-xs uppercase tracking-wider mb-5">Suivez-nous</h3>
                        <div className="flex space-x-4">
                            <a href="#" className="text-[#888888] hover:text-[#8B4513] transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                </svg>
                            </a>
                            <a href="#" className="text-[#888888] hover:text-[#8B4513] transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-200/50">
                    <div className="hidden md:block w-24"></div> {/* Spacer for centering */}
                    <p className="text-[11px] text-[#A0A0A0] text-center flex-1 mb-4 md:mb-0">
                        &copy; 2024 LoméShop. Fabriqué avec soin au Togo.
                    </p>
                    <div className="flex space-x-2 w-24 justify-end">
                        <div className="w-8 h-5 bg-gray-300 rounded flex items-center justify-center text-[8px] font-bold text-white uppercase">V</div>
                        <div className="w-8 h-5 bg-gray-400 rounded flex items-center justify-center text-[8px] font-bold text-white uppercase">T</div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
