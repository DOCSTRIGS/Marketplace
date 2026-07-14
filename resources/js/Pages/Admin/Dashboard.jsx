import React, { useState } from 'react';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import axios from 'axios';
import DriverDetailsDrawer from '@/Components/Admin/DriverDetailsDrawer';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, PieChart, Pie, Legend, Sector
} from 'recharts';
import ThemeToggle from '@/Components/ThemeToggle';
import FleetMap from '@/Components/Admin/FleetMap';
import AdminNavbar from '@/Components/Admin/AdminNavbar';
import { motion, AnimatePresence } from 'framer-motion';

// Asymmetric Sector Renderer — each slice uses its own outerRadius from data (like reference image)
const ExplodedSector = (props) => {
    const { cx, cy, innerRadius, startAngle, endAngle, fill, radius } = props;
    return (
        <Sector
            cx={cx}
            cy={cy}
            innerRadius={innerRadius || 0}
            outerRadius={radius || 80}
            startAngle={startAngle}
            endAngle={endAngle}
            fill={fill}
            stroke="#fff"
            strokeWidth={3}
        />
    );
};

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
                            <p className="text-xs text-gray-400 dark:text-gray-500">{subcategories.length} sous-catégorie{subcategories.length !== 1 ? 's' : ''}</p>
                        </div>
                    )}

                    {!editingName && (
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <button
                                onClick={() => { setExpanded(!expanded); setEditingName(false); }}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${expanded ? 'bg-blue-700 text-white' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50'}`}
                            >
                                {expanded ? 'Fermer' : 'Sous-catégories'}
                            </button>
                            <button
                                onClick={() => setEditingName(true)}
                                className="px-3 py-1.5 bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                            >
                                Modifier
                            </button>
                            <button
                                onClick={() => setDeleteTarget({ ...cat, isParent: true })}
                                className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                            >
                                Supprimer
                            </button>
                        </div>
                    )}
                </div>

                {expanded && (
                    <div className="border-t border-gray-100 dark:border-gray-800">
                        {subcategories.length > 0 && (
                            <div className="px-5 pt-3 pb-2 space-y-1">
                                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Sous-catégories existantes</p>
                                {subcategories.map(sub => (
                                    <div key={sub.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 group/sub">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0"></span>

                                        {editingSub === sub.id ? (
                                            <form onSubmit={(e) => submitEditSub(e, sub.id)} className="flex-1 flex gap-2">
                                                <input
                                                    type="text"
                                                    value={editSubForm.data.name}
                                                    onChange={e => editSubForm.setData('name', e.target.value)}
                                                    className="flex-1 rounded-lg border border-[#8B4513] bg-white dark:bg-[#252525] text-gray-900 dark:text-white px-3 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#8B4513]"
                                                    autoFocus
                                                    required
                                                />
                                                <button type="submit" disabled={editSubForm.processing} className="px-3 py-1 bg-[#8B4513] text-white text-xs font-bold rounded-lg">OK</button>
                                                <button type="button" onClick={() => setEditingSub(null)} className="px-2 py-1 text-gray-500 dark:text-gray-400 text-xs font-bold rounded-lg border border-gray-200 dark:border-gray-700">✕</button>
                                            </form>
                                        ) : (
                                            <>
                                                <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{sub.name}</span>
                                                <div className="flex gap-2 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                                                    <button onClick={() => openEditSub(sub)} className="text-xs font-bold text-gray-400 dark:text-gray-500 hover:text-[#8B4513] transition-colors">Modifier</button>
                                                    <button onClick={() => setDeleteTarget({ ...sub, isParent: false })} className="text-xs font-bold text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors">Supprimer</button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="px-5 pt-3 pb-4 border-t border-gray-50 dark:border-gray-800">
                            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Ajouter une sous-catégorie</p>
                            <form onSubmit={submitSub} className="flex gap-2">
                                <input
                                    type="text"
                                    value={subForm.data.name}
                                    onChange={e => subForm.setData('name', e.target.value)}
                                    className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252525] text-gray-900 dark:text-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513]"
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
export default function AdminDashboard({ pendingShops, approvedShops, rejectedShops, stats, categories, users, drivers, reviews, withdrawals, chartData, categoryStats }) {
    const { auth } = usePage().props;
    
    // Auto-detect tab from URL
    const queryParams = new URLSearchParams(window.location.search);
    const initialTab = queryParams.get('tab') || 'overview';
    // Calculate neighborhood distribution dynamically for horizontal BarChart and Exploded Pie Chart
    const allShops = [...approvedShops, ...pendingShops, ...rejectedShops];
    const totalShops = allShops.length || 1;
    const neighborhoodCounts = {};
    allShops.forEach(shop => {
        const name = shop.neighborhood?.name || 'Lomé';
        neighborhoodCounts[name] = (neighborhoodCounts[name] || 0) + 1;
    });
    const neighborhoodData = Object.entries(neighborhoodCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    // Asymmetric radii — largest quartier gets biggest radius, creating the fan/star effect
    const colorsList = ['#0f4c81', '#1a7a5e', '#80b918', '#f39c12', '#d90429', '#2b2d42'];
    const radiiList = [100, 88, 76, 66, 56, 48];

    const pieNeighborhoodData = neighborhoodData.map((item, index) => {
        const pct = ((item.value / totalShops) * 100).toFixed(0);
        return {
            name: item.name,
            value: item.value,
            percent: pct,
            color: colorsList[index % colorsList.length],
            radius: radiiList[index % radiiList.length]
        };
    });
    const [activeTab, setActiveTab] = useState(initialTab);
    const { patch: patchAction, processing: actionProcessing } = useForm();
    const newCatForm = useForm({ name: '' });
    const [reviewToDelete, setReviewToDelete] = useState(null);

    // User Management states
    const [userModalOpen, setUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const userForm = useForm({
        name: '',
        email: '',
        password: '',
        role: 'client'
    });

    const openUserModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            userForm.setData({
                name: user.name,
                email: user.email,
                role: user.role,
                password: '' // Keep empty for edit
            });
        } else {
            setEditingUser(null);
            userForm.reset();
        }
        setUserModalOpen(true);
    };

    const submitUser = (e) => {
        e.preventDefault();
        if (editingUser) {
            userForm.patch(route('admin.users.update', editingUser.id), {
                onSuccess: () => setUserModalOpen(false)
            });
        } else {
            userForm.post(route('admin.users.store'), {
                onSuccess: () => setUserModalOpen(false)
            });
        }
    };

    const handleDeleteUser = (id) => {
        if (confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
            router.delete(route('admin.users.delete', id));
        }
    };

    // Driver Management states
    const [driverModalOpen, setDriverModalOpen] = useState(false);
    const [editingDriver, setEditingDriver] = useState(null);
    const driverForm = useForm({
        name: '',
        email: '',
        password: '',
        driver_status: 'available'
    });

    const openDriverModal = (driver = null) => {
        if (driver) {
            setEditingDriver(driver);
            driverForm.setData({
                name: driver.name,
                email: driver.email,
                driver_status: driver.driver_status,
                password: ''
            });
        } else {
            setEditingDriver(null);
            driverForm.reset();
        }
        setDriverModalOpen(true);
    };

    const submitDriver = (e) => {
        e.preventDefault();
        if (editingDriver) {
            driverForm.patch(route('admin.drivers.update', editingDriver.id), {
                onSuccess: () => setDriverModalOpen(false)
            });
        } else {
            driverForm.post(route('admin.drivers.store'), {
                onSuccess: () => setDriverModalOpen(false)
            });
        }
    };

    const handleDeleteDriver = (id) => {
        if (confirm('Voulez-vous vraiment supprimer ce livreur ?')) {
            router.delete(route('admin.drivers.destroy', id));
        }
    };

    // Driver Details Drawer states
    const [selectedDriverId, setSelectedDriverId] = useState(null);
    const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);

    const openDriverDetails = (id) => {
        setSelectedDriverId(id);
        setDetailsDrawerOpen(true);
    };

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
        { id: 'fleet',      label: "Suivi Flotte" },
        { id: 'finance',    label: "Finances", link: route('admin.finance') },
        { id: 'users',      label: "Utilisateurs" },
        { id: 'drivers',    label: "Livreurs" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#121212] font-sans transition-colors duration-300">
            <Head title="Admin Dashboard" />

            <AdminNavbar activeTab={activeTab} />

            <div className="max-w-7xl mx-auto px-8 py-10">
                <header className="mb-10">
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Administration</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 uppercase text-[10px] font-black tracking-widest">Espace de gestion centralisée</p>
                    </motion.div>
                </header>

                {/* Remove the old tabs div as it's now in the navbar */}


                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
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
                                            <defs>
                                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8B4513" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#8B4513" stopOpacity={0}/>
                                                </linearGradient>
                                                <linearGradient id="colorPrev" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.1}/>
                                                    <stop offset="95%" stopColor="#9ca3af" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" strokeOpacity={0.1} />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#9ca3af'}} />
                                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#9ca3af'}} tickFormatter={(val) => `${val/1000}k`} />
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: '#1e1e1e', borderRadius: '16px', border: 'none', color: '#fff', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }} 
                                                itemStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                                            />
                                            <Area type="monotone" name="Semaine Actuelle" dataKey="revenue" stroke="#8B4513" strokeWidth={3} fill="url(#colorRev)" />
                                            <Area type="monotone" name="Semaine Précédente" dataKey="prev_revenue" stroke="#9ca3af" strokeWidth={2} strokeDasharray="5 5" fill="url(#colorPrev)" />
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
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Exploded Pie Chart Card */}
                            <div className="lg:col-span-6 bg-white dark:bg-[#1e1e1e] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors flex flex-col justify-between">
                                <div>
                                    <h3 className="font-black text-gray-900 dark:text-white text-base tracking-tight uppercase mb-1">Distribution par Quartier</h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-6">Visualisation asymétrique des boutiques</p>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-8 my-auto">
                                    {/* Pie Chart */}
                                    <div className="w-60 h-60 relative shrink-0">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie 
                                                    data={pieNeighborhoodData}
                                                    cx="50%" cy="50%" 
                                                    innerRadius={0} 
                                                    paddingAngle={2} 
                                                    dataKey="value"
                                                    shape={ExplodedSector}
                                                >
                                                    {pieNeighborhoodData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    
                                    {/* Exact callout labels from reference picture */}
                                    <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                                        {pieNeighborhoodData.map((entry) => (
                                            <div key={entry.name} className="flex flex-col">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{entry.name}</span>
                                                <span className="text-xl font-black leading-none my-1" style={{ color: entry.color }}>
                                                    {entry.percent}%
                                                </span>
                                                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest bg-gray-50 dark:bg-white/5 px-2 py-0.5 rounded-md w-fit">
                                                    {entry.value} boutique{entry.value > 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Statuses Distribution Card */}
                            <div className="lg:col-span-6 bg-white dark:bg-[#1e1e1e] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors flex flex-col justify-between">
                                <div>
                                    <h3 className="font-black text-gray-900 dark:text-white text-base tracking-tight uppercase mb-1">Modération & Statuts</h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-6">Validation en temps réel des boutiques</p>
                                </div>

                                <div className="h-52 w-full my-auto flex items-center">
                                    <ResponsiveContainer width="100%" height="80%">
                                        <BarChart 
                                            data={[
                                                { name: 'Approuvées', value: approvedShops.length, color: '#0f4c81' },
                                                { name: 'En attente', value: pendingShops.length, color: '#f39c12' },
                                                { name: 'Rejetées', value: rejectedShops.length, color: '#d90429' }
                                            ]} 
                                            layout="vertical"
                                            margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
                                        >
                                            <XAxis type="number" hide />
                                            <YAxis 
                                                dataKey="name" 
                                                type="category" 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fontSize: 11, fontWeight: 900, fill: '#6b7280' }} 
                                                width={90}
                                            />
                                            <Tooltip 
                                                cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={22}>
                                                <Cell fill="#0f4c81" />
                                                <Cell fill="#f39c12" />
                                                <Cell fill="#d90429" />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
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
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                                                        {shop.user?.name} {shop.user?.email && `(${shop.user.email})`} - {shop.neighborhood?.name || 'Lomé'}
                                                    </p>
                                                    
                                                    {/* KYC Section */}
                                                    <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 mb-4 border border-gray-100 dark:border-gray-800">
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Documents KYC</p>
                                                        <div className="flex gap-4">
                                                            {shop.id_card_path ? (
                                                                <a href={`/storage/${shop.id_card_path}`} target="_blank" className="flex-1 text-[10px] font-bold text-[#8B4513] hover:underline flex items-center gap-2 bg-white dark:bg-[#121212] p-2 rounded-lg border border-gray-100 dark:border-gray-800">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                                                    Voir CNI
                                                                </a>
                                                            ) : <span className="flex-1 text-[10px] text-gray-400 italic">CNI manquante</span>}
                                                            
                                                            {shop.license_path ? (
                                                                <a href={`/storage/${shop.license_path}`} target="_blank" className="flex-1 text-[10px] font-bold text-[#8B4513] hover:underline flex items-center gap-2 bg-white dark:bg-[#121212] p-2 rounded-lg border border-gray-100 dark:border-gray-800">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                                                    Voir Permis
                                                                </a>
                                                            ) : <span className="flex-1 text-[10px] text-gray-400 italic">Permis manquant</span>}
                                                        </div>
                                                    </div>

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
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                                                    Vendeur: {shop.user?.name} {shop.user?.email && `(${shop.user.email})`}
                                                </p>
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
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                                                    Vendeur: {shop.user?.name} {shop.user?.email && `(${shop.user.email})`}
                                                </p>
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
                        <div className="overflow-x-auto">
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

                {/* Fleet Map Tab */}
                {activeTab === 'fleet' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Suivi Global de la Flotte</h2>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Localisation en temps réel de tous vos livreurs actifs</p>
                            </div>
                        </div>
                        <FleetMap onDriverClick={(id) => {
                            setSelectedDriverId(id);
                            setShowDriverDrawer(true);
                        }} />
                    </div>
                )}

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
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white">Liste des Utilisateurs</h2>
                            <button 
                                onClick={() => openUserModal()}
                                className="bg-[#8B4513] text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
                            >
                                + Ajouter un utilisateur
                            </button>
                        </div>

                        <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 dark:bg-[#252525] border-b border-gray-100 dark:border-gray-800">
                                    <tr>
                                        <th className="px-6 py-4 dark:text-gray-400">Nom</th>
                                        <th className="px-6 py-4 dark:text-gray-400">Email</th>
                                        <th className="px-6 py-4 dark:text-gray-400">Rôle</th>
                                        <th className="px-6 py-4 text-right dark:text-gray-400">Actions</th>
                                    </tr>
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
                                                <div className="flex justify-end gap-2">
                                                    <button 
                                                        onClick={() => openUserModal(u)}
                                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                                                        title="Modifier"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    {u.id !== auth.user.id && (
                                                        <button 
                                                            onClick={() => handleDeleteUser(u.id)}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                            title="Supprimer"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'drivers' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Gestion de la Flotte</h2>
                            <button 
                                onClick={() => openDriverModal()} 
                                className="bg-[#8B4513] text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
                            >
                                + Nouveau Livreur
                            </button>
                        </div>
                        
                        <div className="bg-white dark:bg-[#1e1e1e] rounded-[2.5rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-xl transition-all">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50/50 dark:bg-[#252525] border-b border-gray-100 dark:border-gray-800">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Livreur</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Livraisons</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Activité</th>
                                        <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                    {drivers.map(d => (
                                        <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-[#8B4513]/10 text-[#8B4513] rounded-xl flex items-center justify-center font-black">
                                                        {d.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 dark:text-white">{d.name}</div>
                                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{d.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className="text-lg font-black text-gray-900 dark:text-white">{d.deliveries_completed}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-1.5">
                                                    <span className={`inline-flex w-fit px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                                        d.driver_status === 'available' ? 'bg-green-100 text-green-700' :
                                                        d.driver_status === 'busy' ? 'bg-blue-100 text-blue-700' :
                                                        d.driver_status === 'pause' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-400'
                                                    }`}>
                                                        {d.driver_status}
                                                    </span>
                                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">
                                                        Dernier signal : {new Date(d.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button 
                                                        onClick={() => openDriverDetails(d.id)} 
                                                        className="p-2 text-gray-400 hover:text-[#8B4513] hover:bg-[#8B4513]/5 rounded-lg transition-all" 
                                                        title="Détails"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                                    </button>
                                                    <button onClick={() => openDriverModal(d)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="Modifier">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                                    </button>
                                                    <button onClick={() => handleDeleteDriver(d.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Supprimer">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* User Modal */}
                {userModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setUserModalOpen(false)} />
                        <div className="relative bg-white dark:bg-[#1e1e1e] rounded-[2.5rem] shadow-2xl w-full max-w-md p-10 border border-gray-100 dark:border-gray-800 transition-colors">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight">
                                {editingUser ? 'Modifier Utilisateur' : 'Nouvel Utilisateur'}
                            </h2>
                            <form onSubmit={submitUser} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nom Complet</label>
                                    <input 
                                        type="text" 
                                        value={userForm.data.name}
                                        onChange={e => userForm.setData('name', e.target.value)}
                                        className="w-full px-5 py-3 bg-gray-50 dark:bg-[#252525] border-none rounded-2xl focus:ring-2 focus:ring-[#8B4513] transition-all font-medium text-gray-900 dark:text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Email</label>
                                    <input 
                                        type="email" 
                                        value={userForm.data.email}
                                        onChange={e => userForm.setData('email', e.target.value)}
                                        className="w-full px-5 py-3 bg-gray-50 dark:bg-[#252525] border-none rounded-2xl focus:ring-2 focus:ring-[#8B4513] transition-all font-medium text-gray-900 dark:text-white"
                                        required
                                    />
                                </div>
                                {!editingUser && (
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Mot de passe</label>
                                        <input 
                                            type="password" 
                                            value={userForm.data.password}
                                            onChange={e => userForm.setData('password', e.target.value)}
                                            className="w-full px-5 py-3 bg-gray-50 dark:bg-[#252525] border-none rounded-2xl focus:ring-2 focus:ring-[#8B4513] transition-all font-medium text-gray-900 dark:text-white"
                                            required
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Rôle</label>
                                    <select 
                                        value={userForm.data.role}
                                        onChange={e => userForm.setData('role', e.target.value)}
                                        className="w-full px-5 py-3 bg-gray-50 dark:bg-[#252525] border-none rounded-2xl focus:ring-2 focus:ring-[#8B4513] transition-all font-medium text-gray-900 dark:text-white"
                                    >
                                        <option value="client">Client</option>
                                        <option value="seller">Vendeur</option>
                                        <option value="admin">Administrateur</option>
                                    </select>
                                </div>
                                <div className="flex gap-4 pt-6">
                                    <button 
                                        type="button"
                                        onClick={() => setUserModalOpen(false)}
                                        className="flex-1 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-gray-100 dark:bg-[#252525] text-gray-500 hover:bg-gray-200 transition-all"
                                    >
                                        Annuler
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={userForm.processing}
                                        className="flex-1 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-[#8B4513] text-white shadow-xl hover:scale-105 transition-all disabled:opacity-50"
                                    >
                                        {editingUser ? 'Mettre à jour' : 'Créer'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                {/* Driver Modal */}
                {driverModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDriverModalOpen(false)} />
                        <div className="relative bg-white dark:bg-[#1e1e1e] rounded-[2.5rem] shadow-2xl w-full max-w-md p-10 border border-gray-100 dark:border-gray-800 transition-colors">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight">
                                {editingDriver ? 'Modifier Livreur' : 'Nouveau Livreur'}
                            </h2>
                            <form onSubmit={submitDriver} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nom du Livreur</label>
                                    <input 
                                        type="text" 
                                        value={driverForm.data.name}
                                        onChange={e => driverForm.setData('name', e.target.value)}
                                        className="w-full px-5 py-3 bg-gray-50 dark:bg-[#252525] border-none rounded-2xl focus:ring-2 focus:ring-[#8B4513] transition-all font-medium text-gray-900 dark:text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Email Professionnel</label>
                                    <input 
                                        type="email" 
                                        value={driverForm.data.email}
                                        onChange={e => driverForm.setData('email', e.target.value)}
                                        className="w-full px-5 py-3 bg-gray-50 dark:bg-[#252525] border-none rounded-2xl focus:ring-2 focus:ring-[#8B4513] transition-all font-medium text-gray-900 dark:text-white"
                                        required
                                    />
                                </div>
                                {!editingDriver && (
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Mot de passe</label>
                                        <input 
                                            type="password" 
                                            value={driverForm.data.password}
                                            onChange={e => driverForm.setData('password', e.target.value)}
                                            className="w-full px-5 py-3 bg-gray-50 dark:bg-[#252525] border-none rounded-2xl focus:ring-2 focus:ring-[#8B4513] transition-all font-medium text-gray-900 dark:text-white"
                                            required
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Statut Initial</label>
                                    <select 
                                        value={driverForm.data.driver_status}
                                        onChange={e => driverForm.setData('driver_status', e.target.value)}
                                        className="w-full px-5 py-3 bg-gray-50 dark:bg-[#252525] border-none rounded-2xl focus:ring-2 focus:ring-[#8B4513] transition-all font-medium text-gray-900 dark:text-white"
                                    >
                                        <option value="available">Disponible</option>
                                        <option value="offline">Hors Ligne</option>
                                        <option value="pause">En Pause</option>
                                    </select>
                                </div>
                                <div className="flex gap-4 pt-6">
                                    <button 
                                        type="button"
                                        onClick={() => setDriverModalOpen(false)}
                                        className="flex-1 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-gray-100 dark:bg-[#252525] text-gray-500 hover:bg-gray-200 transition-all"
                                    >
                                        Annuler
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={driverForm.processing}
                                        className="flex-1 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-[#8B4513] text-white shadow-xl hover:scale-105 transition-all disabled:opacity-50"
                                    >
                                        {editingDriver ? 'Mettre à jour' : 'Enregistrer'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                </motion.div>
                </AnimatePresence>

                {/* Driver Details Slide-over Drawer */}
                <DriverDetailsDrawer 
                    driverId={selectedDriverId}
                    isOpen={detailsDrawerOpen}
                    onClose={() => setDetailsDrawerOpen(false)}
                />
            </div>
        </div>
    );
}
