import React, { useState, useRef } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';

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
                image: null,
            });
        } else {
            setEditingProduct(null);
            reset();
        }
        clearErrors();
        setIsModalOpen(true);
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
            
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Mes Produits</h2>
                    <p className="text-gray-600">Gérez votre catalogue et vos stocks.</p>
                </div>
                <button 
                    onClick={() => openModal()}
                    className="bg-[#8B4513] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-[#70360f] transition-colors flex items-center shadow-sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Ajouter un produit
                </button>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-t-2xl border border-gray-200 border-b-0 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex space-x-1 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    {tabs.map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                                activeTab === tab 
                                ? 'bg-[#8B4513]/10 text-[#8B4513]' 
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                
                <div className="relative w-full md:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#8B4513] focus:border-[#8B4513] sm:text-sm"
                        placeholder="Rechercher un produit..."
                    />
                </div>
            </div>

            {/* Products Grid */}
            <div className="bg-gray-50 border border-gray-200 rounded-b-2xl p-6 min-h-[500px]">
                {products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products
                            .filter(p => activeTab === 'Tous les produits' || (p.category?.parent?.name === activeTab || p.category?.name === activeTab))
                            .map((product) => (
                            <div key={product.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                                {/* Image & Badge */}
                                <div className="relative h-48 bg-gray-100">
                                    <img 
                                        src={product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80'} 
                                        alt={product.name} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                    />
                                    <div className={`absolute top-3 left-3 px-2.5 py-1 text-xs font-bold rounded-md shadow-sm border ${
                                        product.stock > 5 
                                        ? 'bg-green-100 text-green-800 border-green-200' 
                                        : product.stock > 0 
                                            ? 'bg-orange-100 text-orange-800 border-orange-200'
                                            : 'bg-red-100 text-red-800 border-red-200'
                                    }`}>
                                        {product.stock > 5 ? 'EN STOCK' : product.stock > 0 ? 'STOCK FAIBLE' : 'RUPTURE'}
                                    </div>
                                    <div className="absolute top-3 right-3 flex space-x-2">
                                        <button 
                                            onClick={() => openModal(product)}
                                            className="bg-white/90 backdrop-blur-sm p-1.5 rounded-lg text-gray-500 hover:text-[#8B4513] cursor-pointer shadow-sm border border-gray-200"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(product.id)}
                                            className="bg-white/90 backdrop-blur-sm p-1.5 rounded-lg text-gray-500 hover:text-red-600 cursor-pointer shadow-sm border border-gray-200"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Content */}
                                <div className="p-4">
                                    <div className="text-xs text-gray-500 mb-1">{product.category?.name}</div>
                                    <h3 className="font-bold text-gray-900 mb-1 truncate">{product.name}</h3>
                                    <p className="text-lg font-bold text-[#D35400] mb-4">{new Intl.NumberFormat('fr-FR').format(product.price)} F</p>
                                    
                                    {/* Stock info */}
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                        <span className="text-sm font-medium text-gray-600">Stock: {product.stock}</span>
                                        <div className={`h-2 w-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20">
                        <p className="text-gray-500">Vous n'avez pas encore de produits.</p>
                        <button 
                            onClick={() => openModal()}
                            className="mt-4 text-[#8B4513] font-bold hover:underline"
                        >
                            Ajouter votre premier produit
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#FDF8F4]">
                            <h3 className="text-xl font-bold text-gray-900">
                                {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l18 18" />
                                </svg>
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Nom du produit</label>
                                    <input 
                                        type="text" 
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className={`w-full rounded-lg border-gray-300 focus:ring-[#8B4513] focus:border-[#8B4513] ${errors.name ? 'border-red-500' : ''}`}
                                        placeholder="Ex: iPhone 15 Pro"
                                    />
                                    {errors.name && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.name}</p>}
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Catégorie</label>
                                    <select 
                                        value={data.category_id}
                                        onChange={e => setData('category_id', e.target.value)}
                                        className={`w-full rounded-lg border-gray-300 focus:ring-[#8B4513] focus:border-[#8B4513] ${errors.category_id ? 'border-red-500' : ''}`}
                                    >
                                        <option value="">Sélectionner une catégorie</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    {errors.category_id && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.category_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Prix (FCFA)</label>
                                    <input 
                                        type="number" 
                                        value={data.price}
                                        onChange={e => setData('price', e.target.value)}
                                        className={`w-full rounded-lg border-gray-300 focus:ring-[#8B4513] focus:border-[#8B4513] ${errors.price ? 'border-red-500' : ''}`}
                                        placeholder="0"
                                    />
                                    {errors.price && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.price}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Stock initial</label>
                                    <input 
                                        type="number" 
                                        value={data.stock}
                                        onChange={e => setData('stock', e.target.value)}
                                        className={`w-full rounded-lg border-gray-300 focus:ring-[#8B4513] focus:border-[#8B4513] ${errors.stock ? 'border-red-500' : ''}`}
                                        placeholder="0"
                                    />
                                    {errors.stock && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.stock}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Description</label>
                                <textarea 
                                    rows="3"
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    className={`w-full rounded-lg border-gray-300 focus:ring-[#8B4513] focus:border-[#8B4513] ${errors.description ? 'border-red-500' : ''}`}
                                    placeholder="Décrivez votre produit..."
                                ></textarea>
                                {errors.description && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.description}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Image du produit</label>
                                <div 
                                    onClick={() => fileInputRef.current.click()}
                                    className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-[#8B4513] transition-colors cursor-pointer group relative"
                                >
                                    <div className="space-y-1 text-center">
                                        <svg className="mx-auto h-12 w-12 text-gray-400 group-hover:text-[#8B4513]" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <div className="flex text-sm text-gray-600">
                                            <span className="relative cursor-pointer bg-white rounded-md font-medium text-[#8B4513] hover:text-[#70360f] focus-within:outline-none">
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
                                        <div className="absolute inset-0 bg-white rounded-xl p-2 flex items-center justify-center">
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

                            <div className="pt-4 border-t border-gray-100 flex space-x-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
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

