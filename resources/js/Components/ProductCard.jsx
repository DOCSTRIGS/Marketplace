import React from 'react';
import { Link } from '@inertiajs/react';

export default function ProductCard({ product }) {
    // Fallback for missing data
    const safeProduct = {
        id: 1,
        name: 'Produit de test',
        price: '15,000',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80',
        shopName: 'Boutique Test',
        distance: '2.4km',
        payment: 'Flooz / T-Money',
        inStock: true,
        ...product
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full">
            {/* Image Container */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                <img 
                    src={safeProduct.image} 
                    alt={safeProduct.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col items-start space-y-2">
                    {safeProduct.inStock && (
                        <span className="bg-[#2ECC71] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm">
                            En stock
                        </span>
                    )}
                    <span className="bg-white/95 backdrop-blur-sm text-[#8B4513] text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                        {safeProduct.payment}
                    </span>
                </div>
            </div>

            {/* Content Container */}
            <div className="p-5 flex flex-col flex-grow">
                {/* Title & Distance */}
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-[#333333] text-base leading-tight pr-2">
                        {safeProduct.name}
                    </h3>
                    <div className="flex items-center text-[#999999] text-xs whitespace-nowrap pt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {safeProduct.distance}
                    </div>
                </div>
                
                {/* Shop Name */}
                <p className="text-[11px] text-[#888888] mb-4">
                    Vendu par {safeProduct.shopName}
                </p>

                {/* Price */}
                <div className="mt-auto">
                    <p className="text-[18px] font-bold text-[#B03A2E] mb-4">
                        {safeProduct.price} FCFA
                    </p>

                    {/* Button */}
                    <Link 
                        href={route('product.show', safeProduct.id)}
                        className="block w-full py-2.5 px-4 bg-white border border-[#8B4513] text-[#8B4513] text-sm font-bold rounded-lg text-center hover:bg-[#8B4513] hover:text-white transition-colors"
                    >
                        Voir le produit
                    </Link>
                </div>
            </div>
        </div>
    );
}
