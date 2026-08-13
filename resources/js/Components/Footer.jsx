import React from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function Footer() {
    const { auth, reviewStats } = usePage().props;
    const isSeller = auth?.user?.role === 'seller';

    return (
        <footer className="bg-[#FAF9F8] dark:bg-[#111111] pt-16 pb-8 mt-auto border-t border-gray-200/50 dark:border-white/5 transition-colors duration-300">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
                    {/* Brand Info */}
                    <div className="col-span-2">
                        <Link href={route('home')} prefetch className="inline-block mb-4">
                            <h2 className="text-[24px] font-black tracking-tight uppercase">
                                <span className="text-[#D35400]">Lomé</span>
                                <span className="text-gray-800 dark:text-white">Shop</span>
                            </h2>
                        </Link>
                        <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed max-w-xs pr-4 font-medium mb-4">
                            La première marketplace de proximité au Togo, connectant les artisans et commerçants locaux aux clients de la capitale.
                        </p>
                        {reviewStats?.count > 0 && (
                            <Link href={route('home') + '#avis'} className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-[#D35400] dark:hover:text-[#D35400] transition-colors">
                                <span className="text-amber-500">★</span>
                                {reviewStats.average}/5
                                <span className="text-gray-400 dark:text-gray-500 font-medium">({reviewStats.count} avis)</span>
                            </Link>
                        )}
                    </div>

                    {/* Links: Acheter */}
                    <div>
                        <h3 className="text-gray-800 dark:text-gray-200 font-black text-xs uppercase tracking-widest mb-5">Acheter</h3>
                        <ul className="space-y-3 font-medium">
                            <li><Link href={route('explore')} prefetch className="text-gray-500 dark:text-gray-400 hover:text-[#D35400] dark:hover:text-[#D35400] text-xs transition-colors">Boutiques</Link></li>
                            <li><Link href={route('explore', { sort: 'Nouveautés' })} prefetch className="text-gray-500 dark:text-gray-400 hover:text-[#D35400] dark:hover:text-[#D35400] text-xs transition-colors">Nouveautés</Link></li>
                        </ul>
                    </div>

                    {/* Links: Vendre */}
                    <div>
                        <h3 className="text-gray-800 dark:text-gray-200 font-black text-xs uppercase tracking-widest mb-5">Vendre</h3>
                        <ul className="space-y-3 font-medium">
                            {isSeller ? (
                                <li><Link href={route('seller.dashboard')} prefetch className="text-gray-500 dark:text-gray-400 hover:text-[#D35400] dark:hover:text-[#D35400] text-xs transition-colors">Portail vendeur</Link></li>
                            ) : (
                                <li><Link href={route('role.selection')} prefetch className="text-gray-500 dark:text-gray-400 hover:text-[#D35400] dark:hover:text-[#D35400] text-xs transition-colors">Vendre sur LoméShop</Link></li>
                            )}
                            <li><Link href={route('help')} prefetch className="text-gray-500 dark:text-gray-400 hover:text-[#D35400] dark:hover:text-[#D35400] text-xs transition-colors">Centre d'aide</Link></li>
                        </ul>
                    </div>

                    {/* Links: Légal */}
                    <div>
                        <h3 className="text-gray-800 dark:text-gray-200 font-black text-xs uppercase tracking-widest mb-5">Légal</h3>
                        <ul className="space-y-3 font-medium">
                            <li><Link href={route('legal.terms')} prefetch className="text-gray-500 dark:text-gray-400 hover:text-[#D35400] dark:hover:text-[#D35400] text-xs transition-colors">Conditions d'utilisation</Link></li>
                            <li><Link href={route('legal.privacy')} prefetch className="text-gray-500 dark:text-gray-400 hover:text-[#D35400] dark:hover:text-[#D35400] text-xs transition-colors">Politique de confidentialité</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-center items-center pt-8 border-t border-gray-200/50 dark:border-white/5">
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 font-bold text-center">
                        &copy; {new Date().getFullYear()} LoméShop. Fabriqué avec soin au Togo.
                    </p>
                </div>
            </div>
        </footer>
    );
}
