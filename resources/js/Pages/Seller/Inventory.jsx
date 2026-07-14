import React, { useState, useMemo } from 'react';
import { Head, useForm } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import EmptyState from '@/Components/EmptyState';

const MOVEMENT_LABELS = {
    sale: { label: 'Vente', color: 'text-red-600 dark:text-red-400', sign: '-' },
    cancellation: { label: 'Annulation', color: 'text-blue-600 dark:text-blue-400', sign: '+' },
    restock: { label: 'Réapprovisionnement', color: 'text-green-600 dark:text-green-400', sign: '+' },
    adjustment: { label: 'Ajustement', color: 'text-gray-600 dark:text-gray-400', sign: '±' },
};

function RestockRow({ product, threshold }) {
    const { data, setData, post, processing, reset } = useForm({ quantity: '', note: '' });
    const [open, setOpen] = useState(false);

    const status = product.stock >= threshold
        ? { label: 'En stock', dot: 'bg-green-500', text: 'text-green-700 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' }
        : product.stock > 0
            ? { label: 'Stock faible', dot: 'bg-orange-500', text: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' }
            : { label: 'Rupture', dot: 'bg-red-500', text: 'text-red-700 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' };

    const submit = (e) => {
        e.preventDefault();
        post(route('seller.inventory.restock', product.id), {
            preserveScroll: true,
            onSuccess: () => { reset(); setOpen(false); },
        });
    };

    return (
        <tr className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-[#252525] overflow-hidden flex-shrink-0">
                        <img
                            src={product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=100'}
                            className="h-full w-full object-cover"
                            alt={product.name}
                        />
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white text-sm">{product.name}</span>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${status.bg} ${status.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                    {status.label}
                </span>
            </td>
            <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">{product.stock}</td>
            <td className="px-6 py-4 text-right">
                {open ? (
                    <form onSubmit={submit} className="flex items-center justify-end gap-2">
                        <input
                            type="number"
                            min="1"
                            autoFocus
                            value={data.quantity}
                            onChange={e => setData('quantity', e.target.value)}
                            placeholder="Qté"
                            className="w-20 rounded-lg bg-white dark:bg-[#252525] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm px-2 py-1.5 focus:ring-[#8B4513] focus:border-[#8B4513]"
                        />
                        <button
                            type="submit"
                            disabled={processing || !data.quantity}
                            className="bg-[#8B4513] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#70360f] transition-all disabled:opacity-50"
                        >
                            Ajouter
                        </button>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-white px-2 py-1.5 text-xs font-bold"
                        >
                            Annuler
                        </button>
                    </form>
                ) : (
                    <button
                        onClick={() => setOpen(true)}
                        className="bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#8B4513] hover:text-white transition-all border border-gray-200 dark:border-gray-700"
                    >
                        Réapprovisionner
                    </button>
                )}
            </td>
        </tr>
    );
}

export default function Inventory({ products, movements, lowStockThreshold }) {
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    const counts = useMemo(() => ({
        total: products.length,
        ok: products.filter(p => p.stock >= lowStockThreshold).length,
        low: products.filter(p => p.stock > 0 && p.stock < lowStockThreshold).length,
        out: products.filter(p => p.stock === 0).length,
    }), [products, lowStockThreshold]);

    const filteredProducts = useMemo(() => {
        return products
            .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
            .filter(p => {
                if (filter === 'low') return p.stock > 0 && p.stock < lowStockThreshold;
                if (filter === 'out') return p.stock === 0;
                return true;
            });
    }, [products, filter, search, lowStockThreshold]);

    const tabs = [
        { id: 'all', label: 'Tous', count: counts.total },
        { id: 'low', label: 'Stock faible', count: counts.low },
        { id: 'out', label: 'Rupture', count: counts.out },
    ];

    return (
        <SellerLayout>
            <Head title="Inventaire" />

            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Inventaire</h2>
                <p className="text-gray-600 dark:text-gray-400">Suivez votre stock et réapprovisionnez en un clic.</p>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-800 transition-colors">
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Produits</p>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">{counts.total}</h3>
                </div>
                <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-800 transition-colors">
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">En stock</p>
                    <h3 className="text-2xl font-black text-green-600 dark:text-green-400">{counts.ok}</h3>
                </div>
                <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-800 transition-colors">
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Stock faible</p>
                    <h3 className="text-2xl font-black text-orange-600 dark:text-orange-400">{counts.low}</h3>
                </div>
                <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-800 transition-colors">
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Rupture</p>
                    <h3 className="text-2xl font-black text-red-600 dark:text-red-400">{counts.out}</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Products table */}
                <div className="lg:col-span-2 bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden transition-colors">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                        <div className="flex gap-1 bg-gray-50 dark:bg-white/5 p-1 rounded-xl">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setFilter(tab.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        filter === tab.id
                                        ? 'bg-[#8B4513] text-white'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-[#8B4513]'
                                    }`}
                                >
                                    {tab.label} ({tab.count})
                                </button>
                            ))}
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Rechercher un produit..."
                            className="w-full sm:w-56 rounded-lg bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm px-3 py-2 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-[#8B4513] focus:border-[#8B4513]"
                        />
                    </div>

                    {filteredProducts.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
                                <thead className="bg-gray-50 dark:bg-white/5">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Produit</th>
                                        <th className="px-6 py-3 text-left text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut</th>
                                        <th className="px-6 py-3 text-left text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock</th>
                                        <th className="px-6 py-3 text-right text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {filteredProducts.map(product => (
                                        <RestockRow key={product.id} product={product} threshold={lowStockThreshold} />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-6">
                            <EmptyState
                                title="Aucun produit"
                                description="Aucun produit ne correspond à ce filtre."
                            />
                        </div>
                    )}
                </div>

                {/* Recent movements */}
                <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden transition-colors h-fit">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                        <h3 className="font-black text-gray-900 dark:text-white text-sm uppercase tracking-widest">Derniers mouvements</h3>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[600px] overflow-y-auto">
                        {movements.length > 0 ? movements.map(m => {
                            const meta = MOVEMENT_LABELS[m.type] || MOVEMENT_LABELS.adjustment;
                            return (
                                <div key={m.id} className="p-4 flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{m.product_name}</p>
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">{meta.label} • {m.date}</p>
                                    </div>
                                    <span className={`text-sm font-black flex-shrink-0 ${meta.color}`}>
                                        {meta.sign}{m.quantity}
                                    </span>
                                </div>
                            );
                        }) : (
                            <div className="p-10 text-center">
                                <p className="text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest">Aucun mouvement récent</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </SellerLayout>
    );
}
