import React, { useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import confetti from 'canvas-confetti';

export default function Success({ reference, totalAmount, firstOrderId }) {
    useEffect(() => {
        // Lancer les confettis au chargement de la page
        const duration = 3 * 1000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#2ECC71', '#F1C40F', '#B03A2E']
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#2ECC71', '#F1C40F', '#B03A2E']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };
        frame();
    }, []);

    return (
        <div className="min-h-screen bg-[#FDF8F4] dark:bg-[#121212] flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8 font-sans text-center relative overflow-hidden transition-colors">
            <Head title="Paiement Réussi" />

            {/* Decorative background blob */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-200/20 dark:bg-green-500/5 rounded-full blur-3xl -z-10"></div>

            <div className="bg-white dark:bg-[#1e1e1e] p-10 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 max-w-md w-full relative z-10 animate-fade-in-up transition-colors">
                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-500 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                
                <h1 className="text-3xl font-black text-[#222222] dark:text-white mb-2 tracking-tight transition-colors">Paiement Réussi !</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed transition-colors">
                    Merci pour votre achat. Votre commande <strong className="text-gray-900 dark:text-white">{reference}</strong> a été validée et transmise au(x) vendeur(s).
                </p>

                <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-6 mb-8 border border-gray-100 dark:border-gray-800 transition-colors">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Montant Payé</p>
                    <p className="text-2xl font-black text-[#B03A2E] dark:text-red-500">
                        {new Intl.NumberFormat('fr-FR').format(totalAmount)} FCFA
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <Link 
                        href={route('tracking', { order_id: firstOrderId })}
                        className="w-full bg-[#8B4513] text-white py-4 rounded-xl font-bold text-sm hover:bg-[#70360f] transition-all shadow-lg shadow-[#8B4513]/20 uppercase tracking-wider"
                    >
                        Suivre en direct (Carte)
                    </Link>

                    <Link 
                        href={route('explore')}
                        className="w-full bg-white dark:bg-transparent text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 py-4 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-all uppercase tracking-wider"
                    >
                        Continuer mes achats
                    </Link>
                </div>
            </div>
        </div>
    );
}
