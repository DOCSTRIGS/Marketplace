import React, { useState } from 'react';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import ThemeToggle from '@/Components/ThemeToggle';

// ─── Confirm Modal (minimale, sans icones) ───────────────────────────────────
function ConfirmModal({ isOpen, onClose, onConfirm, message }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 border border-gray-100 dark:border-gray-800 transition-colors">
                <h3 className="font-black text-base text-gray-900 dark:text-white mb-3">Confirmer l'action</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{message}</p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800">Annuler</button>
                    <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-500 text-white font-bold rounded-xl text-sm hover:bg-red-600">Confirmer</button>
                </div>
            </div>
        </div>
    );
}

// ─── Category Row ─────────────────────────────────────────────────────────────
function CategoryRow({ cat, subcategories, onDeleteCategory, onDeleteSubCategory }) {
    const [expanded, setExpanded] = useState(false);
    const [editingName, setEditingName] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    // Edit category name
    const editForm = useForm({ name: cat.name });
    const submitEdit = (e) => {
        e.preventDefault();
        editForm.patch(route('admin.categories.update', cat.id), {
            onSuccess: () => setEditingName(false)
        });
    };

    // Add subcategory
    const subForm = useForm({ name: '' });
    const submitSub = (e) => {
        e.preventDefault();
        subForm.post(route('admin.categories.storeSubCategory', cat.id), {
            onSuccess: () => subForm.reset('name')
        });
    };

    // Edit subcategory
    const [editingSub, setEditingSub] = useState(null);
    const editSubForm = useForm({ name: '' });
    const openEditSub = (sub) => {
        setEditingSub(sub.id);
        editSubForm.setData('name', sub.name);
    };
    const submitEditSub = (e, subId) => {
        e.preventDefault();
        editSubForm.patch(route('admin.categories.update', subId), {
            onSuccess: () => setEditingSub(null)
        });
    };

    return (
        <>
            <ConfirmModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={() => {
                    router.delete(route('admin.categories.delete', deleteTarget.id), {
                        onSuccess: () => setDeleteTarget(null)
                    });
                }}
                message={`Supprimer "${deleteTarget?.name}"${deleteTarget?.isParent ? ' et toutes ses sous-catégories' : ''} ? Cette action est irréversible.`}
            />

            <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-colors">
                <div className="flex items-center px-5 py-4 gap-3 group">
                    {editingName ? (
                        <form onSubmit={submitEdit} className="flex-1 flex gap-2">
                            <input
                                type="text"
                                value={editForm.data.name}
                                onChange={e => editForm.setData('name', e.target.value)}
                                className="flex-1 rounded-lg border border-[#8B4513] bg-white dark:bg-[#252525] text-gray-900 dark:text-white px-3 py-1.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#8B4513]"
                                autoFocus
                                required
                            />
                            <button type="submit" disabled={editForm.processing} className="px-4 py-1.5 bg-[#8B4513] text-white text-xs font-bold rounded-lg disabled:opacity-50">Sauvegarder</button>
                            <button type="button" onClick={() => setEditingName(false)} className="px-3 py-1.5 text-gray-500 dark:text-gray-400 text-xs font-bold rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">Annuler</button>
                        </form>
                    ) : (
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 dark:text-white text-sm">{cat.name}</p>
                            <p className="text-xs text-gray-400">{subcategories.length} sous-catégorie{subcategories.length !== 1 ? 's' : ''}</p>
                        </div>
                    )}

                    {!editingName && (
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <button
                                onClick={() => { setExpanded(!expanded); setEditingName(false); }}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${expanded ? 'bg-blue-700 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
                            >
                                {expanded ? 'Fermer' : 'Sous-catégories'}
                            </button>
                            <button
                                onClick={() => setEditingName(true)}
                                className="px-3 py-1.5 bg-gray-50 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                Modifier
                            </button>
                            <button
                                onClick={() => setDeleteTarget({ ...cat, isParent: true })}
                                className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors"
                            >
                                Supprimer
                            </button>
                        </div>
                    )}
                </div>

                {expanded && (
                    <div className="border-t border-gray-100">
                        {subcategories.length > 0 && (
                            <div className="px-5 pt-3 pb-2 space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Sous-catégories existantes</p>
                                {subcategories.map(sub => (
                                    <div key={sub.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 group/sub">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0"></span>

                                        {editingSub === sub.id ? (
                                            <form onSubmit={(e) => submitEditSub(e, sub.id)} className="flex-1 flex gap-2">
                                                <input
                                                    type="text"
                                                    value={editSubForm.data.name}
                                                    onChange={e => editSubForm.setData('name', e.target.value)}
                                                    className="flex-1 rounded-lg border border-[#8B4513] px-3 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#8B4513]"
                                                    autoFocus
                                                    required
                                                />
                                                <button type="submit" disabled={editSubForm.processing} className="px-3 py-1 bg-[#8B4513] text-white text-xs font-bold rounded-lg">OK</button>
                                                <button type="button" onClick={() => setEditingSub(null)} className="px-2 py-1 text-gray-500 text-xs font-bold rounded-lg border border-gray-200">✕</button>
                                            </form>
                                        ) : (
                                            <>
                                                <span className="flex-1 text-sm text-gray-700">{sub.name}</span>
                                                <div className="flex gap-2 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                                                    <button onClick={() => openEditSub(sub)} className="text-xs font-bold text-gray-400 hover:text-[#8B4513] transition-colors">Modifier</button>
                                                    <button onClick={() => setDeleteTarget({ ...sub, isParent: false })} className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors">Supprimer</button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="px-5 pt-3 pb-4 border-t border-gray-50">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Ajouter une sous-catégorie</p>
                            <form onSubmit={submitSub} className="flex gap-2">
                                <input
                                    type="text"
                                    value={subForm.data.name}
                                    onChange={e => subForm.setData('name', e.target.value)}
                                    className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513]"
                                    placeholder="Ex : Smartphones"
                                    required
                                />
                                <button type="submit" disabled={subForm.processing} className="px-5 py-2 bg-[#8B4513] text-white font-bold text-sm rounded-xl hover:bg-[#70360f] transition-all disabled:opacity-50">
                                    Ajouter
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard({ pendingShops, approvedShops, rejectedShops, stats, categories, users, reviews, withdrawals, chartData, categoryStats }) {
    const { auth } = usePage().props;
    const { patch: patchAction, processing: actionProcessing } = useForm();
    const newCatForm = useForm({ name: '' });

    const [activeTab, setActiveTab] = useState('overview');
    const [reviewToDelete, setReviewToDelete] = useState(null);

    const handleStatusUpdate = (shopId, status) => {
        if (confirm(`Êtes-vous sûr de vouloir passer cette boutique en statut : ${status} ?`)) {
            router.patch(route('admin.shops.updateStatus', shopId), { status });
        }
    };

    const handleWithdrawalStatus = (id, status) => {
        if (confirm(`Confirmer le statut : ${status} ?`)) {
            router.patch(route('admin.withdrawals.updateStatus', id), { status });
        }
    };

    const handleToggleAdmin = (user) => {
        const action = user.role === 'admin' ? 'retirer' : 'donner';
        if (confirm(`Voulez-vous vraiment ${action} les droits Admin à ${user.name} ?`)) {
            router.patch(route('admin.users.toggleAdmin', user.id));
        }
    };

    const handleDeleteShop = (shop) => {
        if (confirm(`Voulez-vous vraiment SUPPRIMER la boutique "${shop.name}" ? Cette action est irréversible et supprimera tous ses produits.`)) {
            router.delete(route('admin.shops.delete', shop.id));
        }
    };

    const handleAddCategory = (e) => {
        e.preventDefault();
        newCatForm.post(route('admin.categories.store'), { onSuccess: () => newCatForm.reset('name') });
    };

    const tabs = [
        { id: 'overview',   label: "Vue d'ensemble" },
        { id: 'shops',      label: `Boutiques${pendingShops.length > 0 ? ` (${pendingShops.length})` : ''}` },
        { id: 'withdrawals', label: `Retraits${withdrawals.filter(w=>w.status==='pending').length > 0 ? ` (${withdrawals.filter(w=>w.status==='pending').length})` : ''}` },
        { id: 'reviews',    label: "Modération Avis" },
        { id: 'categories', label: "Catégories" },
        { id: 'users',      label: "Utilisateurs" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#121212] p-8 font-sans transition-colors duration-300">
            <Head title="Admin Dashboard" />

            <div className="max-w-7xl mx-auto">
                <header className="mb-10 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white">Administration LoméShop</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Plateforme de gestion centralisée.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <span className="bg-[#8B4513] text-white px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-widest">Admin: {auth.user.name}</span>
                        <Link href={route('logout')} method="post" as="button" className="text-gray-500 hover:text-red-500 font-bold text-sm">Déconnexion</Link>
                    </div>
                </header>

                <div className="flex space-x-2 mb-8 bg-white dark:bg-[#1e1e1e] p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-x-auto transition-colors">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-[#8B4513] text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                            {[
                                { label: 'Commissions (Gains)', value: new Intl.NumberFormat('fr-TG', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(stats.total_commissions || 0), color: 'text-[#8B4513]', bg: 'bg-[#8B4513]/5' },
                                { label: 'Volume d\'affaires', value: new Intl.NumberFormat('fr-TG', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(stats.total_revenue || 0), color: 'text-gray-900', bg: 'bg-gray-100' },
                                { label: 'Commandes', value: stats.total_orders, color: 'text-gray-900', bg: 'bg-gray-100' },
                                { label: 'Boutiques', value: stats.total_shops, color: 'text-green-600', bg: 'bg-green-50' },
                                { label: 'Utilisateurs', value: stats.total_users, color: 'text-blue-600', bg: 'bg-blue-50' },
                            ].map(kpi => (
                                <div key={kpi.label} className={`${kpi.bg} dark:bg-[#1e1e1e] p-6 rounded-3xl border border-white/50 dark:border-gray-800 shadow-sm transition-colors`}>
                                    <h3 className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest mb-4">{kpi.label}</h3>
                                    <p className={`text-2xl font-black ${kpi.color} dark:text-white`}>{kpi.value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white dark:bg-[#1e1e1e] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                                <h3 className="font-black text-gray-900 dark:text-white mb-8">Évolution des Commissions (Gains Admin)</h3>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#9ca3af'}} />
                                            <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', borderRadius: '16px', border: 'none', color: '#fff', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }} />
                                            <Area type="monotone" dataKey="commission" stroke="#8B4513" strokeWidth={3} fill="#8B4513" fillOpacity={0.1} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-[#1e1e1e] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                                <h3 className="font-black text-gray-900 dark:text-white mb-8">Volume de Ventes Total</h3>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#9ca3af'}} />
                                            <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#1e1e1e', borderRadius: '16px', border: 'none', color: '#fff' }} />
                                            <Bar dataKey="revenue" fill="#8B4513" radius={[6, 6, 0, 0]} barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'shops' && (
                    <div className="space-y-8">
                        {/* Summary Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
                                <h3 className="font-black text-gray-900 mb-6">Répartition des Boutiques</h3>
                                <div className="flex flex-col sm:flex-row items-center gap-8">
                                    <div className="w-48 h-48">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie 
                                                    data={[
                                                        { name: 'Approuvées', value: approvedShops.length, color: '#10B981' },
                                                        { name: 'En attente', value: pendingShops.length, color: '#F59E0B' },
                                                        { name: 'Rejetées', value: rejectedShops.length, color: '#EF4444' }
                                                    ].filter(d => d.value > 0)}
                                                    cx="50%" cy="50%" 
                                                    innerRadius={60} outerRadius={80} 
                                                    paddingAngle={5} 
                                                    dataKey="value"
                                                >
                                                    {[
                                                        { name: 'Approuvées', value: approvedShops.length, color: '#10B981' },
                                                        { name: 'En attente', value: pendingShops.length, color: '#F59E0B' },
                                                        { name: 'Rejetées', value: rejectedShops.length, color: '#EF4444' }
                                                    ].filter(d => d.value > 0).map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex-1 space-y-4 w-full">
                                        <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/10 rounded-xl">
                                            <span className="font-bold text-green-700 dark:text-green-400">Approuvées</span>
                                            <span className="font-black text-lg text-green-700 dark:text-green-400">{approvedShops.length}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/10 rounded-xl">
                                            <span className="font-bold text-orange-700 dark:text-orange-400">En attente</span>
                                            <span className="font-black text-lg text-orange-700 dark:text-orange-400">{pendingShops.length}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/10 rounded-xl">
                                            <span className="font-bold text-red-700 dark:text-red-400">Rejetées</span>
                                            <span className="font-black text-lg text-red-700 dark:text-red-400">{rejectedShops.length}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pending Shops */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <h2 className="text-xl font-black text-gray-900 dark:text-white">Demandes en attente</h2>
                                <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full text-xs font-bold">{pendingShops.length}</span>
                            </div>
                            
                            {pendingShops.length === 0 ? (
                                <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
                                    <div className="w-16 h-16 bg-gray-50 dark:bg-[#252525] rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="font-black text-gray-900 dark:text-white mb-1">Tout est à jour !</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Aucune boutique n'est en attente de validation.</p>
                                </div>
                            ) : (
                                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                                    {pendingShops.map(shop => (
                                        <div key={shop.id} className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border border-orange-100 dark:border-orange-900/30 p-6 flex flex-col">
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-black text-lg text-gray-900 dark:text-white">{shop.name}</h3>
                                                    <span className="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg">Nouveau</span>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{shop.user?.name} - {shop.neighborhood?.name || 'Lomé'}</p>
                                                {shop.description && <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">"{shop.description}"</p>}
                                            </div>
                                            <div className="flex gap-3 mt-auto">
                                                <button onClick={() => handleStatusUpdate(shop.id, 'approved')} className="flex-1 bg-green-500 hover:bg-green-600 transition-colors text-white font-bold py-2.5 rounded-xl text-sm shadow-md shadow-green-500/20">Approuver</button>
                                                <button onClick={() => handleStatusUpdate(shop.id, 'rejected')} className="flex-1 bg-red-50 hover:bg-red-100 transition-colors text-red-600 font-bold py-2.5 rounded-xl text-sm border border-red-100">Rejeter</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Approved Shops */}
                        <div>
                            <div className="flex items-center gap-3 mb-6 mt-12">
                                <h2 className="text-xl font-black text-gray-900 dark:text-white">Boutiques Approuvées</h2>
                                <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold">{approvedShops.length}</span>
                            </div>
                            
                            {approvedShops.length === 0 ? (
                                <p className="text-gray-400 italic text-sm">Aucune boutique approuvée pour le moment.</p>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                                    {approvedShops.map(shop => (
                                        <div key={shop.id} className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 flex items-center justify-between group hover:border-green-200 dark:hover:border-green-800 transition-all shadow-sm">
                                            <div className="flex-1">
                                                <h3 className="font-black text-lg text-gray-900 dark:text-white">{shop.name}</h3>
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Vendeur: {shop.user?.name}</p>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleStatusUpdate(shop.id, 'rejected')} className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg hover:bg-orange-100">Suspendre</button>
                                                <button onClick={() => handleDeleteShop(shop)} className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100">Supprimer</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Rejected Shops */}
                        {rejectedShops.length > 0 && (
                            <div>
                                <div className="flex items-center gap-3 mb-6 mt-12">
                                    <h2 className="text-xl font-black text-gray-900 dark:text-white">Boutiques Rejetées / Suspendues</h2>
                                    <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-xs font-bold">{rejectedShops.length}</span>
                                </div>
                                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                                    {rejectedShops.map(shop => (
                                        <div key={shop.id} className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 flex items-center justify-between group hover:border-red-200 dark:hover:border-red-800 transition-all opacity-75 hover:opacity-100 shadow-sm">
                                            <div className="flex-1">
                                                <h3 className="font-black text-lg text-gray-900 dark:text-white line-through decoration-red-300">{shop.name}</h3>
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Vendeur: {shop.user?.name}</p>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleStatusUpdate(shop.id, 'approved')} className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100">Réactiver</button>
                                                <button onClick={() => handleDeleteShop(shop)} className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100">Supprimer</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'withdrawals' && (
                    <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-[#252525] border-b border-gray-100 dark:border-gray-800">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase">Boutique</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase">Montant</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase">Méthode</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase">Statut</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {withdrawals.map(w => (
                                    <tr key={w.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 dark:text-white text-sm">{w.shop?.name}</div>
                                            <div className="text-[10px] text-gray-400">{w.shop?.user?.name}</div>
                                        </td>
                                        <td className="px-6 py-4 font-black text-gray-900 dark:text-white">{new Intl.NumberFormat('fr-TG').format(w.amount)} F</td>
                                        <td className="px-6 py-4 text-xs text-gray-600 dark:text-gray-300">{w.payment_method}<br/><span className="text-[10px] text-gray-400">{w.payment_details}</span></td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                w.status === 'approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                                w.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                                            }`}>{w.status}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {w.status === 'pending' && (
                                                <div className="flex gap-2 justify-end">
                                                    <button onClick={() => handleWithdrawalStatus(w.id, 'approved')} className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold">Payer</button>
                                                    <button onClick={() => handleWithdrawalStatus(w.id, 'rejected')} className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold">Rejeter</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div className="grid gap-6 md:grid-cols-2">
                        {reviews.map(review => (
                            <div key={review.id} className="bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-black text-gray-900 dark:text-white text-sm">{review.user?.name}</span>
                                            <span className="text-yellow-400 text-xs font-bold">★ {review.rating}/5</span>
                                        </div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Sur: {review.product?.name} ({review.product?.shop?.name})</p>
                                    </div>
                                    <button 
                                        onClick={() => setReviewToDelete(review)}
                                        className="text-red-400 hover:text-red-600"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 italic">"{review.comment}"</p>
                                <p className="text-[10px] text-gray-400 mt-4 text-right">{new Date(review.created_at).toLocaleDateString('fr-FR')}</p>
                            </div>
                        ))}
                        {reviews.length === 0 && <p className="text-gray-400 italic">Aucun avis à modérer.</p>}
                    </div>
                )}

                {/* Confirm Delete Review Modal */}
                <ConfirmModal 
                    isOpen={!!reviewToDelete}
                    onClose={() => setReviewToDelete(null)}
                    onConfirm={() => {
                        router.delete(route('admin.reviews.delete', reviewToDelete.id), {
                            onSuccess: () => setReviewToDelete(null)
                        });
                    }}
                    message="Voulez-vous vraiment supprimer cet avis ?"
                />

                {/* Rest of Tabs (Categories, Users) - Simplified for brevity but kept functional */}
                {activeTab === 'categories' && (
                    <div className="space-y-8">
                        <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 mb-8 transition-colors">
                            <h3 className="font-black text-gray-900 dark:text-white mb-4">Nouvelle Catégorie</h3>
                            <form onSubmit={handleAddCategory} className="flex gap-4">
                                <input type="text" value={newCatForm.data.name} onChange={e=>newCatForm.setData('name', e.target.value)} className="flex-1 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252525] text-gray-900 dark:text-white" placeholder="Nom de catégorie..." />
                                <button type="submit" className="bg-[#8B4513] text-white px-8 py-2 rounded-xl font-bold">Ajouter</button>
                            </form>
                        </div>
                        {categories.filter(c=>!c.parent_id).map(cat => (
                            <CategoryRow key={cat.id} cat={cat} subcategories={categories.filter(c=>c.parent_id===cat.id)} />
                        ))}
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-[#252525] border-b border-gray-100 dark:border-gray-800">
                                <tr><th className="px-6 py-4 dark:text-gray-400">Nom</th><th className="px-6 py-4 dark:text-gray-400">Email</th><th className="px-6 py-4 dark:text-gray-400">Rôle</th><th className="px-6 py-4 text-right dark:text-gray-400">Actions</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                {users.map(u => (
                                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{u.name}</td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{u.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`uppercase text-[10px] font-black px-2 py-1 rounded-full ${u.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {u.id !== auth.user.id && (
                                                <button 
                                                    onClick={() => handleToggleAdmin(u)}
                                                    className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${
                                                        u.role === 'admin' 
                                                        ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                                                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                                    }`}
                                                >
                                                    {u.role === 'admin' ? 'Retirer Admin' : 'Nommer Admin'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
