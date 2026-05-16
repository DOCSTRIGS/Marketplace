import React from 'react';
import { useCart } from '@/Contexts/CartContext';
import { useToast } from '@/Contexts/ToastContext';
import { Link, router } from '@inertiajs/react';

export default function CartDrawer({ isOpen, onClose }) {
    const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const { addToast } = useToast();

    const formattedPrice = (price) => new Intl.NumberFormat('fr-FR').format(price);

    const handleCheckout = () => {
        onClose(); // Ferme le tiroir
        router.get('/checkout/delivery'); // Redirige vers la page de livraison
    };

    return (
        <>
            {/* Overlay */}
            <div 
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            ></div>

            {/* Drawer */}
            <div className={`fixed inset-y-0 right-0 h-screen w-full max-w-md bg-white z-[101] shadow-2xl transform transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b flex justify-between items-center bg-[#FDF8F4]">
                        <div>
                            <h2 className="text-2xl font-bold text-[#222222]">Mon Panier</h2>
                            <p className="text-sm text-gray-500">{cart.length} article(s) sélectionné(s)</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-grow overflow-y-auto p-6 space-y-6">
                        {cart.length > 0 ? (
                            cart.map((item) => (
                                <div key={item.id} className="flex gap-4 group">
                                    <div className="w-24 h-24 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                                        <img 
                                            src={item.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80'} 
                                            alt={item.name} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="flex-grow flex flex-col">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-[#222222] text-sm line-clamp-1">{item.name}</h4>
                                            <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                        <p className="text-[#8B4513] text-xs font-bold mb-3">{formattedPrice(item.price)} FCFA</p>
                                        
                                        <div className="mt-auto flex items-center justify-between">
                                            <div className="flex items-center border rounded-lg bg-gray-50">
                                                <button 
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="px-2 py-1 hover:text-[#B03A2E] transition-colors"
                                                >
                                                    -
                                                </button>
                                                <span className="px-3 text-xs font-bold">{item.quantity}</span>
                                                <button 
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="px-2 py-1 hover:text-[#B03A2E] transition-colors"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <span className="font-bold text-sm text-[#222222]">
                                                {formattedPrice(item.price * item.quantity)} FCFA
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                <div className="w-20 h-20 bg-[#FDF8F4] rounded-full flex items-center justify-center text-[#D35400]/20">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#222222]">Votre panier est vide</h3>
                                    <p className="text-sm text-gray-500">Parcourez nos catégories pour trouver votre bonheur.</p>
                                </div>
                                <Link 
                                    href={route('explore')} 
                                    onClick={onClose}
                                    className="bg-[#8B4513] text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#8B4513]/20"
                                >
                                    Commencer mes achats
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {cart.length > 0 && (
                        <div className="p-6 bg-white border-t space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.04)]">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Sous-total</span>
                                    <span>{formattedPrice(cartTotal)} FCFA</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Livraison (est.)</span>
                                    <span className="text-[#2ECC71] font-bold">Gratuit</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-lg font-bold text-[#222222]">Total</span>
                                    <span className="text-2xl font-black text-[#B03A2E]">{formattedPrice(cartTotal)} FCFA</span>
                                </div>
                            </div>
                            <button 
                                onClick={handleCheckout}
                                className="w-full flex justify-center bg-[#B03A2E] text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-[#B03A2E]/20 hover:bg-[#8e2e25] transition-all transform active:scale-95"
                            >
                                Finaliser la commande
                            </button>
                            <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest font-bold">
                                Paiement sécurisé par T-Money, Flooz & Cartes
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
