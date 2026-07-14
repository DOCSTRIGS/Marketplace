import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { useCart } from '@/Contexts/CartContext';
import { useToast } from '@/Contexts/ToastContext';

export default function CategoryProductCard({ product, index = 0 }) {
    const { auth } = usePage().props;
    const { addToCart } = useCart();
    const { addToast } = useToast();
    const [adding, setAdding] = useState(false);

    const avgRating = product.reviews?.length > 0
        ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
        : 0;

    const handleQuickAdd = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!auth.user) {
            addToast('Veuillez vous connecter pour ajouter des produits au panier', 'error');
            router.visit(route('login'));
            return;
        }

        addToCart(product);
        setAdding(true);
        addToast(`"${product.name}" ajouté au panier !`, 'success');
        setTimeout(() => setAdding(false), 1500);
    };

    return (
        <div
            className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group flex flex-col animate-fade-in"
            style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'both', opacity: 0 }}
        >
            {/* Image Container */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 dark:bg-[#252525]">
                <img
                    src={product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />

                {/* Quick Add Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <button
                        onClick={handleQuickAdd}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all transform ${adding ? 'bg-[#2ECC71] text-white scale-95' : 'bg-white text-[#8B4513] hover:bg-[#8B4513] hover:text-white'}`}
                    >
                        {adding ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                                Ajouté !
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 100-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                                </svg>
                                Ajouter au panier
                            </span>
                        )}
                    </button>
                </div>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col items-start space-y-1.5">
                    {product.stock > 0 ? (
                        <span className="bg-[#2ECC71] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shadow-sm">
                            En stock
                        </span>
                    ) : (
                        <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shadow-sm">
                            Rupture
                        </span>
                    )}
                    <span className="bg-white/95 dark:bg-[#1e1e1e]/95 backdrop-blur-sm text-[#8B4513] text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm uppercase">
                        {product.category?.name}
                    </span>
                </div>
            </div>

            {/* Content Container */}
            <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-[#333333] dark:text-white text-sm leading-tight pr-2 line-clamp-1">
                        {product.name}
                    </h3>
                    <div className="flex items-center text-[#999999] dark:text-gray-500 text-[10px] whitespace-nowrap pt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 mr-0.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {product.shop?.neighborhood?.name || 'Lomé'}
                    </div>
                </div>

                {/* Rating */}
                <div className="flex items-center mb-3">
                    <div className="flex text-[#B03A2E]">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <svg key={star} xmlns="http://www.w3.org/2000/svg" className={`h-2.5 w-2.5 ${star <= Math.round(avgRating) ? 'fill-current' : 'text-gray-200 dark:text-gray-700'}`} viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        ))}
                    </div>
                    <span className="ml-1.5 text-[9px] font-bold text-gray-500 dark:text-gray-400">
                        ({product.reviews?.length || 0} avis)
                    </span>
                </div>

                <p className="text-[11px] text-[#888888] dark:text-gray-400 mb-4 line-clamp-2 h-8">
                    {product.description || 'Pas de description disponible.'}
                </p>

                <div className="mt-auto flex items-center justify-between">
                    <p className="text-[18px] font-bold text-[#B03A2E]">
                        {new Intl.NumberFormat('fr-FR').format(product.price)} <span className="text-xs font-semibold">FCFA</span>
                    </p>
                    <Link
                        href={route('product.show', product.id)}
                        className="text-xs font-bold text-[#8B4513] border border-[#8B4513]/30 rounded-lg px-3 py-1.5 hover:bg-[#8B4513] hover:text-white transition-all"
                    >
                        Détails →
                    </Link>
                </div>
            </div>
        </div>
    );
}
