import React, { useState, useRef } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import EmptyState from '@/Components/EmptyState';

const LOW_STOCK_THRESHOLD = 10;

export default function Products({ products, categories }) {
    const fileInputRef = useRef(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [activeTab, setActiveTab] = useState('Tous les produits');
    
    // Get unique main categories from the products list for tabs
    const mainCategories = [...new Set(products.map(p => p.category?.parent?.name || p.category?.name))];
    const tabs = ['Tous les produits', ...mainCategories];

    const { data, setData, post, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        category_id: '',
        price: '',
        description: '',
        stock: '',
        variants: [], // { name: 'Taille', value: 'XL' }
        image: null,
    });

    const openModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setData({
                name: product.name,
                category_id: product.category_id,
                price: product.price,
                description: product.description || '',
                stock: product.stock,
                variants: product.variants || [],
                image: null,
            });
        } else {
            setEditingProduct(null);
            reset();
        }
        clearErrors();
        setIsModalOpen(true);
    };

    const addVariant = () => {
        setData('variants', [...data.variants, { name: '', value: '' }]);
    };

    const removeVariant = (index) => {
        const newVariants = [...data.variants];
        newVariants.splice(index, 1);
        setData('variants', newVariants);
    };

    const updateVariant = (index, field, value) => {
        const newVariants = [...data.variants];
        newVariants[index][field] = value;
        setData('variants', newVariants);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingProduct) {
            post(route('seller.products.update', editingProduct.id), {
                onSuccess: () => closeModal(),
                forceFormData: true,
            });
        } else {
            post(route('seller.products.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
            router.delete(route('seller.products.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <SellerLayout>
            <Head title="Mes Produits" />
            
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Mes Produits</h2>
                    <p className="text-gray-600 dark:text-gray-400 transition-colors">Gérez votre catalogue et vos stocks.</p>
                </div>
                <button 
                    onClick={() => openModal()}
                    className="bg-[#8B4513] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-[#70360f] transition-colors flex items-center shadow-sm"
                >
                    Ajouter un produit
                </button>
            </div>

            {/* Toolbar */}
            <div className="bg-white dark:bg-[#1e1e1e] p-4 rounded-t-2xl border border-gray-200 dark:border-gray-800 border-b-0 flex flex-col md:flex-row justify-between items-center gap-4 transition-colors">
                <div className="flex space-x-1 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    {tabs.map((tab, idx) => (
                        <button 
                            key={`${tab}-${idx}`}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                                activeTab === tab 
                                ? 'bg-[#8B4513]/10 text-[#8B4513] dark:bg-[#8B4513]/20' 
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                
                <div className="relative w-full md:w-72">
                    <input
                        type="text"
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg leading-5 bg-white dark:bg-[#252525] text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#8B4513] focus:border-[#8B4513] sm:text-sm transition-colors"
                        placeholder="Rechercher un produit..."
                    />
                </div>
            </div>

            {/* Products Grid */}
            <div className="bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-b-2xl p-6 min-h-[500px] transition-colors">
                {products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products
                            .filter(p => activeTab === 'Tous les produits' || (p.category?.parent?.name === activeTab || p.category?.name === activeTab))
                            .map((product) => (
                            <div key={product.id} className="bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                                {/* Image & Badge */}
                                <div className="relative h-48 bg-gray-100 dark:bg-[#252525] transition-colors">
                                    <img
                                        src={product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80'}
                                        alt={product.name}
                                        loading="lazy"
                                        decoding="async"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className={`absolute top-3 left-3 px-2.5 py-1 text-xs font-bold rounded-md shadow-sm border ${
                                        product.stock >= LOW_STOCK_THRESHOLD
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800'
                                        : product.stock > 0
                                            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 border-orange-200 dark:border-orange-800'
                                            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800'
                                    } transition-colors`}>
                                        {product.stock >= LOW_STOCK_THRESHOLD ? 'EN STOCK' : product.stock > 0 ? 'STOCK FAIBLE' : 'RUPTURE'}
                                    </div>
                                    <div className="absolute top-3 right-3 flex space-x-2">
                                        <button 
                                            onClick={() => openModal(product)}
                                            className="bg-white/90 dark:bg-[#1e1e1e]/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-200 hover:text-[#8B4513] cursor-pointer shadow-sm border border-gray-200 dark:border-gray-700 transition-colors"
                                        >
                                            Modifier
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(product.id)}
                                            className="bg-white/90 dark:bg-[#1e1e1e]/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-200 hover:text-red-600 cursor-pointer shadow-sm border border-gray-200 dark:border-gray-700 transition-colors"
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Content */}
                                <div className="p-4 transition-colors">
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 transition-colors">{product.category?.name}</div>
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-1 truncate transition-colors">{product.name}</h3>
                                    <p className="text-lg font-bold text-[#D35400] mb-4 transition-colors">{new Intl.NumberFormat('fr-FR').format(product.price)} F</p>
                                    
                                    {/* Stock info */}
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800 transition-colors">
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Stock: {product.stock}</span>
                                        <div className={`h-2 w-2 rounded-full ${
                                            product.stock >= LOW_STOCK_THRESHOLD ? 'bg-green-500' : product.stock > 0 ? 'bg-orange-500' : 'bg-red-500'
                                        }`}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState 
                        title="Aucun produit trouvé"
                        description="Commencez par ajouter votre premier produit pour qu'il apparaisse sur la marketplace."
                        actionText="Ajouter un produit"
                        onAction={() => openModal()}
                    />
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
                    <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col transition-colors">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-[#FDF8F4] dark:bg-white/5 transition-colors">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white transition-colors">
                                {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Nom du produit</label>
                                    <input 
                                        type="text" 
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className={`w-full rounded-lg bg-white dark:bg-[#252525] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-[#8B4513] focus:border-[#8B4513] transition-colors ${errors.name ? 'border-red-500' : ''}`}
                                        placeholder="Ex: iPhone 15 Pro"
                                    />
                                    {errors.name && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.name}</p>}
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Catégorie</label>
                                    <select 
                                        value={data.category_id}
                                        onChange={e => setData('category_id', e.target.value)}
                                        className={`w-full rounded-lg bg-white dark:bg-[#252525] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-[#8B4513] focus:border-[#8B4513] transition-colors ${errors.category_id ? 'border-red-500' : ''}`}
                                    >
                                        <option value="">Sélectionner une catégorie</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    {errors.category_id && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.category_id}</p>}
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Prix (FCFA)</label>
                                    <input 
                                        type="number" 
                                        value={data.price}
                                        onChange={e => setData('price', e.target.value)}
                                        className={`w-full rounded-lg bg-white dark:bg-[#252525] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-[#8B4513] focus:border-[#8B4513] transition-colors ${errors.price ? 'border-red-500' : ''}`}
                                        placeholder="0"
                                    />
                                    {errors.price && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.price}</p>}
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Stock initial</label>
                                    <input 
                                        type="number" 
                                        value={data.stock}
                                        onChange={e => setData('stock', e.target.value)}
                                        className={`w-full rounded-lg bg-white dark:bg-[#252525] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-[#8B4513] focus:border-[#8B4513] transition-colors ${errors.stock ? 'border-red-500' : ''}`}
                                        placeholder="0"
                                    />
                                    {errors.stock && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.stock}</p>}
                                </div>
                            </div>
                            
                            {/* Variants Section */}
                            <div className="space-y-4 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-gray-800 transition-colors">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Variantes (Tailles, Couleurs, etc.)</label>
                                    <button 
                                        type="button"
                                        onClick={addVariant}
                                        className="text-[10px] font-black uppercase tracking-widest text-[#8B4513] bg-white dark:bg-[#252525] px-2 py-1 rounded border border-[#8B4513] hover:bg-[#8B4513] hover:text-white transition-all"
                                    >
                                        + Ajouter une variante
                                    </button>
                                </div>
                                {data.variants.length > 0 ? (
                                    <div className="space-y-2">
                                        {data.variants.map((variant, index) => (
                                            <div key={`variant-${index}`} className="flex gap-2 items-center">
                                                <input 
                                                    type="text"
                                                    placeholder="Type (ex: Taille)"
                                                    value={variant.name}
                                                    onChange={e => updateVariant(index, 'name', e.target.value)}
                                                    className="flex-1 text-xs rounded-lg bg-white dark:bg-[#252525] border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-[#8B4513] focus:border-[#8B4513] transition-colors"
                                                />
                                                <input 
                                                    type="text"
                                                    placeholder="Valeur (ex: XL)"
                                                    value={variant.value}
                                                    onChange={e => updateVariant(index, 'value', e.target.value)}
                                                    className="flex-1 text-xs rounded-lg bg-white dark:bg-[#252525] border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-[#8B4513] focus:border-[#8B4513] transition-colors"
                                                />
                                                <button 
                                                    type="button"
                                                    onClick={() => removeVariant(index)}
                                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 italic">Aucune variante définie pour ce produit.</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Description</label>
                                <textarea 
                                    rows="3"
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    className={`w-full rounded-lg bg-white dark:bg-[#252525] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-[#8B4513] focus:border-[#8B4513] transition-colors ${errors.description ? 'border-red-500' : ''}`}
                                    placeholder="Décrivez votre produit..."
                                ></textarea>
                                {errors.description && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.description}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Image du produit</label>
                                <div 
                                    onClick={() => fileInputRef.current.click()}
                                    className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-xl hover:border-[#8B4513] transition-colors cursor-pointer group relative"
                                >
                                    <div className="space-y-1 text-center">
                                        <svg className="mx-auto h-12 w-12 text-gray-400 group-hover:text-[#8B4513]" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                            <span className="relative cursor-pointer bg-white dark:bg-[#1e1e1e] rounded-md font-medium text-[#8B4513] hover:text-[#70360f] focus-within:outline-none transition-colors">
                                                Télécharger un fichier
                                                <input 
                                                    ref={fileInputRef}
                                                    type="file" 
                                                    className="sr-only" 
                                                    onChange={e => setData('image', e.target.files[0])}
                                                />
                                            </span>
                                            <p className="pl-1">ou glisser-déposer</p>
                                        </div>
                                        <p className="text-xs text-gray-500">PNG, JPG, GIF jusqu'à 10MB</p>
                                    </div>
                                    {data.image && (
                                        <div className="absolute inset-0 bg-white dark:bg-[#1e1e1e] rounded-xl p-2 flex items-center justify-center transition-colors">
                                            <p className="text-sm font-bold text-[#8B4513] truncate px-4">{data.image.name}</p>
                                            <button 
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setData('image', null);
                                                }}
                                                className="ml-2 text-red-500 hover:text-red-700"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {errors.image && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.image}</p>}
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex space-x-3 transition-colors">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 px-6 py-3 bg-[#8B4513] text-white font-bold rounded-xl hover:bg-[#70360f] transition-colors shadow-lg disabled:opacity-50"
                                >
                                    {processing ? 'Enregistrement...' : editingProduct ? 'Enregistrer les modifications' : 'Créer le produit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </SellerLayout>
    );
}

