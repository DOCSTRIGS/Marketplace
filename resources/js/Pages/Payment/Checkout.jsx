import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';

export default function Checkout({ reference, orders, totalAmount }) {
    const [method, setMethod] = useState('tmoney');
    const [phone, setPhone] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    const formattedAmount = new Intl.NumberFormat('fr-FR').format(totalAmount);

    const handlePayment = (e) => {
        e.preventDefault();
        
        if (!phone || phone.length < 8) {
            setError('Veuillez entrer un numéro de téléphone valide.');
            return;
        }

        setIsProcessing(true);
        setError('');

        // Simuler le délai de l'API (FedaPay/PayGate)
        setTimeout(() => {
            router.post(route('checkout.process'), {
                reference: reference,
                payment_method: method === 'tmoney' ? 'T-Money' : 'Flooz',
                phone_number: phone
            }, {
                onError: (errors) => {
                    setIsProcessing(false);
                    setError(errors.message || 'Le paiement a échoué. Veuillez réessayer.');
                }
            });
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
            <Head title="Paiement Sécurisé" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#B03A2E]/10 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#B03A2E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900">
                    Paiement Sécurisé
                </h2>
                <p className="mt-2 text-sm text-gray-600 font-medium">
                    Réf : {reference}
                </p>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-3xl sm:px-10 border border-gray-100 relative overflow-hidden">
                    
                    {/* Decorative Top Bar */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#F1C40F] via-[#2ECC71] to-[#3498DB]"></div>

                    <div className="mb-8 text-center">
                        <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-2">Montant à payer</p>
                        <div className="text-5xl font-black text-[#222222] tracking-tighter">
                            {formattedAmount} <span className="text-2xl text-gray-400">FCFA</span>
                        </div>
                    </div>

                    <form onSubmit={handlePayment} className="space-y-6">
                        {/* Method Selection */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-3">
                                Choisir un moyen de paiement
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${method === 'tmoney' ? 'border-[#F1C40F] bg-[#F1C40F]/5' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <input type="radio" name="method" value="tmoney" className="sr-only" checked={method === 'tmoney'} onChange={() => setMethod('tmoney')} />
                                    <div className="w-10 h-10 bg-[#F1C40F] rounded-full flex items-center justify-center font-black text-black">T</div>
                                    <span className="font-bold text-sm">T-Money</span>
                                </label>

                                <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${method === 'flooz' ? 'border-[#2980B9] bg-[#2980B9]/5' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <input type="radio" name="method" value="flooz" className="sr-only" checked={method === 'flooz'} onChange={() => setMethod('flooz')} />
                                    <div className="w-10 h-10 bg-[#2980B9] rounded-full flex items-center justify-center font-black text-white">F</div>
                                    <span className="font-bold text-sm">Flooz</span>
                                </label>
                            </div>
                        </div>

                        {/* Phone Number Input */}
                        <div>
                            <label htmlFor="phone" className="block text-xs font-bold text-gray-700 uppercase mb-2">
                                Numéro de téléphone
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm font-bold">
                                        +228
                                    </span>
                                </div>
                                <input
                                    type="tel"
                                    id="phone"
                                    className="focus:ring-[#B03A2E] focus:border-[#B03A2E] block w-full pl-14 sm:text-lg border-gray-300 rounded-xl py-4 font-bold"
                                    placeholder="Ex: 90 00 00 00"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                                    disabled={isProcessing}
                                />
                            </div>
                            {error && <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>}
                        </div>

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
