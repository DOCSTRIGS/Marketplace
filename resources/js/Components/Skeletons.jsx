import React from 'react';

// Skeleton pour une carte produit
export const ProductCardSkeleton = () => (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
        <div className="w-full aspect-square bg-gray-200" />
        <div className="p-4 space-y-3">
            <div className="h-3 bg-gray-200 rounded-full w-3/4" />
            <div className="h-3 bg-gray-200 rounded-full w-1/2" />
            <div className="flex justify-between items-center pt-2">
                <div className="h-5 bg-gray-200 rounded-full w-1/3" />
                <div className="h-8 w-8 bg-gray-200 rounded-full" />
            </div>
        </div>
    </div>
);

// Skeleton pour la page produit détail
export const ProductDetailSkeleton = () => (
    <div className="flex flex-col lg:flex-row gap-12 animate-pulse">
        <div className="w-full lg:w-1/2">
            <div className="aspect-square bg-gray-200 rounded-3xl mb-4" />
            <div className="flex gap-3">
                {[1,2,3,4].map(i => (
                    <div key={i} className="w-20 h-20 bg-gray-200 rounded-xl" />
                ))}
            </div>
        </div>
        <div className="flex-1 space-y-6">
            <div className="h-4 bg-gray-200 rounded-full w-1/4" />
            <div className="h-8 bg-gray-200 rounded-full w-3/4" />
            <div className="h-8 bg-gray-200 rounded-full w-1/4" />
            <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded-full" />
                <div className="h-3 bg-gray-200 rounded-full" />
                <div className="h-3 bg-gray-200 rounded-full w-2/3" />
            </div>
            <div className="h-14 bg-gray-200 rounded-xl" />
            <div className="h-14 bg-gray-200 rounded-xl" />
        </div>
    </div>
);

// Skeleton pour une commande
export const OrderSkeleton = () => (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
        <div className="p-6 bg-gray-50/50 flex justify-between">
            <div className="flex gap-8">
                {[1,2,3].map(i => (
                    <div key={i} className="space-y-2">
                        <div className="h-2 bg-gray-200 rounded-full w-16" />
                        <div className="h-4 bg-gray-200 rounded-full w-24" />
                    </div>
                ))}
            </div>
            <div className="h-6 bg-gray-200 rounded-full w-24" />
        </div>
        <div className="p-6 flex gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-lg" />
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded-full w-2/3" />
                <div className="h-3 bg-gray-200 rounded-full w-1/3" />
            </div>
        </div>
    </div>
);

// Skeleton pour une table
export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
        <div className="bg-gray-50 h-12 w-full" />
        <div className="p-0 divide-y divide-gray-50">
            {[...Array(rows)].map((_, i) => (
                <div key={i} className="p-6 flex gap-4">
                    {[...Array(cols)].map((_, j) => (
                        <div key={j} className="h-4 bg-gray-200 rounded-full flex-grow" />
                    ))}
                </div>
            ))}
        </div>
    </div>
);

// Skeleton pour des stats
export const StatsSkeleton = ({ count = 3 }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-pulse">
        {[...Array(count)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="h-2 bg-gray-200 rounded-full w-16 mb-3" />
                <div className="h-8 bg-gray-200 rounded-full w-24" />
            </div>
        ))}
    </div>
);

export default ProductCardSkeleton;
