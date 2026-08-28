import React, { useState, useEffect, useRef } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { useCart } from '@/Contexts/CartContext';
import { useToast } from '@/Contexts/ToastContext';
import axios from 'axios';

export default function Delivery({ auth }) {
    const { cart, cartTotal, clearCart } = useCart();
    const { addToast } = useToast();
    
    const [address, setAddress] = useState('');
    const [clientLat, setClientLat] = useState(null);
    const [clientLng, setClientLng] = useState(null);
    const [isLocating, setIsLocating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Verrou synchrone : l'attribut `disabled` du bouton dépend d'un state React
    // qui n'est pas encore à jour entre deux clics rapprochés. Ce ref bloque toute
    // ré-entrée dans handleSubmit avant que la commande ne soit créée.
    const submitLockRef = useRef(false);
    // Identifie cette tentative de checkout. Stable pour toute la durée de vie de
    // la page : si le client relance le paiement (widget fermé, échec réseau), le
    // serveur renvoie la MÊME commande au lieu d'en créer une seconde.
    const idempotencyKeyRef = useRef(null);
    const referenceRef = useRef(null);
    const kkiapayBoundRef = useRef(false);

    const genIdempotencyKey = () => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
        return `idem-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    };

    // Écouteurs KkiaPay enregistrés une seule fois (ils sont globaux : les ré-attacher
    // à chaque soumission déclencherait plusieurs confirmPayment pour un seul paiement).
    const bindKkiapayListeners = () => {
        if (kkiapayBoundRef.current) return;
        kkiapayBoundRef.current = true;

        addKkiapayListener('success', async (response) => {
            const reference = referenceRef.current;
            if (!reference) return;
            try {
                await axios.post(route('checkout.confirmPayment', { reference }), {
                    transaction_id: response.transactionId,
                });
                clearCart();
                router.visit(route('checkout.success', { reference }));
            } catch (error) {
                submitLockRef.current = false;
                setIsSubmitting(false);
                addToast(error.response?.data?.message || 'Impossible de confirmer le paiement.', 'error');
            }
        });

        addKkiapayListener('failed', () => {
            submitLockRef.current = false;
            setIsSubmitting(false);
            addToast('Le paiement a échoué.', 'error');
        });
    };

    // Redirige si le panier est vide
    useEffect(() => {
        if (cart.length === 0) {
            router.get(route('explore'));
        }
    }, [cart]);

    const handleGetLocation = () => {
        setIsLocating(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setClientLat(latitude);
                    setClientLng(longitude);
                    setAddress(`Ma position actuelle (Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)})`);
                    setIsLocating(false);
                    addToast('Position récupérée avec succès !', 'success');
                },
                (error) => {
                    console.error(error);
                    setIsLocating(false);
                    addToast('Impossible de récupérer la position. Veuillez saisir l\'adresse manuellement.', 'error');
                }
            );
        } else {
            setIsLocating(false);
            addToast('La géolocalisation n\'est pas supportée par votre navigateur.', 'error');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Garde synchrone contre le double-clic / la double soumission.
        if (submitLockRef.current) return;

        if (!address.trim()) {
            addToast('Veuillez saisir ou récupérer une adresse de livraison.', 'error');
            return;
        }

        submitLockRef.current = true;
        setIsSubmitting(true);

        if (!idempotencyKeyRef.current) {
            idempotencyKeyRef.current = genIdempotencyKey();
        }

        try {
            // 1. Créer la commande (idempotent côté serveur grâce à idempotency_key)
            const orderResponse = await axios.post(route('orders.store'), {
                items: cart.map(item => ({ id: item.id, quantity: item.quantity })),
                delivery_address: address,
                latitude: clientLat,
                longitude: clientLng,
                idempotency_key: idempotencyKeyRef.current,
            });

            const { reference, kkiapay_public_key, kkiapay_sandbox, total_amount } = orderResponse.data;
            referenceRef.current = reference;

            // 2. Configurer les écouteurs KkiaPay (une seule fois)
            bindKkiapayListeners();

            // 3. Ouvrir KkiaPay
            openKkiapayWidget({
                amount: total_amount,
                key: kkiapay_public_key,
                sandbox: kkiapay_sandbox,
                data: reference,
                position: 'center',
                name: auth.user.name,
                email: auth.user.email,
            });

            // La commande existe et le widget de paiement est ouvert : on relâche
            // le verrou et on réactive le bouton. Si le client ferme le widget
            // sans payer puis relance, le serveur renverra CETTE commande (même
            // idempotency_key) — aucune duplication possible.
            submitLockRef.current = false;
            setIsSubmitting(false);
        } catch (error) {
            console.error(error);
            submitLockRef.current = false;
            setIsSubmitting(false);
            addToast(error.response?.data?.message || 'Une erreur est survenue lors de la commande.', 'error');
        }
    };

    if (cart.length === 0) return null;

    const formattedAmount = new Intl.NumberFormat('fr-FR').format(cartTotal);

    return (
        <div className="min-h-screen bg-[#FDF8F4] dark:bg-[#121212] py-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
            <Head title="Informations de Livraison" />

            <div className="max-w-2xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <Link href={route('explore')} prefetch className="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-bold text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Retour aux achats
                    </Link>
                    <div className="flex gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#B03A2E]"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1e1e1e] rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800 transition-colors">
                    <div className="p-8 sm:p-10">
                        <h1 className="text-3xl font-black text-[#222222] dark:text-white mb-2 tracking-tight transition-colors">Où devons-nous livrer ?</h1>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 transition-colors">Fournissez les détails pour recevoir votre commande rapidement.</p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            {/* Geolocation Button */}
                            <button
                                type="button"
                                onClick={handleGetLocation}
                                disabled={isLocating}
                                className="w-full flex items-center justify-center py-4 px-4 border-2 border-[#2ECC71] border-dashed rounded-xl text-[#2ECC71] hover:bg-[#2ECC71]/5 transition-colors font-bold group"
                            >
                                {isLocating ? (
                                    <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#2ECC71]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Localisation en cours...
                                    </div>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Utiliser ma position GPS actuelle
                                    </>
                                )}
                            </button>

                            <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                                <span className="flex-shrink-0 mx-4 text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-widest">Ou</span>
                                <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                            </div>

                            {/* Manual Input */}
                            <div>
                                <label htmlFor="address" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-2 transition-colors">
                                    Saisir une adresse manuellement
                                </label>
                                <textarea
                                    id="address"
                                    rows="3"
                                    className="block w-full bg-white dark:bg-[#252525] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl shadow-sm focus:ring-[#8B4513] focus:border-[#8B4513] sm:text-sm resize-none p-4 font-medium transition-colors"
                                    placeholder="Ex: Quartier Adidogomé, Maison blanche à côté de l'école..."
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                ></textarea>
                                <p className="mt-2 text-xs text-gray-500">
                                    Plus vous êtes précis, plus la livraison sera rapide.
                                </p>
                            </div>

                            <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-2xl flex justify-between items-center border border-gray-100 dark:border-gray-800 transition-colors">
                                <div>
                                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Total à payer</p>
                                    <p className="text-2xl font-black text-[#B03A2E]">{formattedAmount} FCFA</p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !address.trim()}
                                    className={`px-8 py-4 rounded-xl font-bold shadow-xl shadow-[#8B4513]/20 transition-all transform active:scale-95 ${
                                        isSubmitting || !address.trim() 
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                        : 'bg-[#8B4513] hover:bg-[#70360f] text-white'
                                    }`}
                                >
                                    {isSubmitting ? 'Validation...' : 'Confirmer & Payer'}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
