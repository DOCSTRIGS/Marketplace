import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';

export default function Checkout({ reference, orders, totalAmount, fedapay_public_key }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    const formattedAmount = new Intl.NumberFormat('fr-FR').format(totalAmount);

    const handlePayment = async (e) => {
        e.preventDefault();
        
        if (fedapay_public_key === 'pk_sandbox_placeholder') {
            setError('Configuration FedaPay manquante (Clé API non définie).');
            return;
        }

        setIsProcessing(true);
        setError('');

        try {
            // Appeler notre backend pour initialiser la transaction
            const response = await fetch(route('checkout.fedapay'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify({ reference: reference })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors de l\'initialisation du paiement');
            }

            // Ouvrir le modal FedaPay
            FedaPay.init({
                public_key: fedapay_public_key,
                transaction: {
                    id: data.token,
                    token: data.token
                },
                onComplete: (reason) => {
                    if (reason.status === 'approved') {
                        router.visit(route('checkout.success', { reference: reference }));
                    } else {
                        setIsProcessing(false);
                    }
                }
            });

            FedaPay.open();

        } catch (err) {
            setIsProcessing(false);
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#121212] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans transition-colors">
            <Head title="Paiement Sécurisé" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#B03A2E]/10 mb-4 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#B03A2E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white transition-colors">
                    Paiement Sécurisé
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 font-medium transition-colors">
                    Réf : {reference}
                </p>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-[#1e1e1e] py-8 px-4 shadow-2xl sm:rounded-3xl sm:px-10 border border-gray-100 dark:border-gray-800 relative overflow-hidden transition-colors">
                    
                    {/* Decorative Top Bar */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#F1C40F] via-[#2ECC71] to-[#3498DB]"></div>

                    <div className="mb-8 text-center">
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-widest mb-2 transition-colors">Montant à payer</p>
                        <div className="text-5xl font-black text-[#222222] dark:text-white tracking-tighter transition-colors">
                            {formattedAmount} <span className="text-2xl text-gray-400">FCFA</span>
                        </div>
                    </div>

                    <form onSubmit={handlePayment} className="space-y-6">
                        <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 mb-6 transition-colors">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-2 transition-colors">Instructions</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors">
                                Cliquez sur le bouton ci-dessous pour ouvrir la fenêtre de paiement sécurisée de <strong>FedaPay</strong>. 
                                Vous pourrez choisir votre moyen de paiement préféré (T-Money, Flooz ou Carte).
                            </p>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-xl">
                                <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={isProcessing}
                                className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-black uppercase tracking-wider text-white transition-all transform active:scale-95 ${
                                    isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#222222] hover:bg-black shadow-gray-900/20'
                                }`}
                            >
                                {isProcessing ? (
                                    <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Traitement en cours...
                                    </div>
                                ) : (
                                    `Payer ${formattedAmount} FCFA`
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center border-t border-gray-100 pt-6">
                        <p className="text-xs text-gray-400 font-medium flex items-center justify-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Paiement 100% sécurisé (Simulation LoméShop)
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
