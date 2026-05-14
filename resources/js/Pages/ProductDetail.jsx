import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import { useCart } from '@/Contexts/CartContext';
import { useToast } from '@/Contexts/ToastContext';
import { router } from '@inertiajs/react';

export default function ProductDetail({ product }) {
    const { auth } = usePage().props;
    const { addToCart: addItemToCart } = useCart();
    const { addToast } = useToast();
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');

    const images = product.images && product.images.length > 0 
        ? product.images 
        : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'];

    const { data, setData, post, processing, errors, reset } = useForm({
        rating: 5,
        comment: '',
    });

    const submitReview = (e) => {
        e.preventDefault();
        post(route('reviews.store', product.id), {
            onSuccess: () => reset(),
        });
    };

    const addToCart = () => {
        if (!auth.user) {
            addToast('Veuillez vous connecter pour ajouter des produits au panier', 'error');
            router.visit(route('login'));
            return;
        }

        addItemToCart(product, quantity);
        addToast('Produit ajouté au panier !', 'success');
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#121212] font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <Head title={`${product.name} - LoméShop`} />
            <Navbar />

            <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-12">
                {/* Breadcrumbs */}
                <nav className="flex mb-10 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                    <Link href={route('home')} className="hover:text-[#8B4513] transition-colors">Accueil</Link>
                    <span className="mx-3">/</span>
                    <Link href={route('explore')} className="hover:text-[#8B4513] transition-colors">Boutique</Link>
                    <span className="mx-3">/</span>
                    <span className="text-gray-900 dark:text-white">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 mb-24">
                    {/* Images - Left Column (7/12) */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="w-full aspect-[4/5] sm:aspect-square lg:aspect-[4/5] rounded-lg bg-gray-100 dark:bg-[#1e1e1e] overflow-hidden">
                            <img 
                                src={images[selectedImage]} 
                                alt={product.name} 
                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                            />
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {images.map((img, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-[#8B4513]' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Info - Right Column (5/12) */}
                    <div className="lg:col-span-5 flex flex-col py-4">
                        <div className="mb-10">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">
                                EDITION LIMITEE • {product.category?.name || 'LOMÉ'}
                            </h4>
                            
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-6 leading-[1.1] tracking-tight">{product.name}</h1>
                            
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium text-base mb-8">
                                {product.description}
                            </p>

                            <div className="flex items-end gap-4 mb-10">
                                <p className="text-3xl font-black text-[#8B4513] tracking-tight">
                                    {new Intl.NumberFormat('fr-FR').format(product.price)} FCFA
                                </p>
                                <p className="text-sm font-bold text-gray-400 line-through mb-1">
                                    {new Intl.NumberFormat('fr-FR').format(product.price * 1.2)} FCFA
                                </p>
                            </div>
                        </div>

                        {/* Variantes */}
                        {product.variants && product.variants.length > 0 ? (
                            <div className="mb-10 space-y-6">
                                <div>
                                    <h4 className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-[0.1em] mb-3">Format</h4>
                                    <div className="flex flex-wrap gap-3">
                                        {product.variants.map((v, i) => (
                                            <button key={i} className="px-6 py-3 border border-gray-200 dark:border-gray-700 rounded-md text-xs font-bold text-gray-900 dark:text-white hover:border-[#8B4513] transition-colors">
                                                {v.value}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="mb-10">
                                <h4 className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-[0.1em] mb-3">Quantité</h4>
                                <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-md w-[140px] h-12">
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-full flex items-center justify-center text-gray-500 hover:text-black">-</button>
                                    <span className="flex-1 text-center font-bold text-sm">{quantity}</span>
                                    <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-full flex items-center justify-center text-gray-500 hover:text-black">+</button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <button 
                                onClick={addToCart}
                                className="w-full bg-[#6B4423] text-white py-4 rounded-md font-bold text-xs uppercase tracking-[0.1em] hover:bg-[#5A381C] transition-colors flex items-center justify-center gap-3"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                                Ajouter au panier
                            </button>
                            
                            <Link 
                                href={route('chat.show', product.shop_id)}
                                className="w-full flex items-center justify-center gap-2 py-4 bg-transparent border border-gray-200 dark:border-gray-700 rounded-md text-xs font-bold uppercase tracking-[0.1em] text-gray-900 dark:text-white hover:border-gray-400 transition-colors"
                            >
                                Contacter le vendeur
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mt-10 pt-8 border-t border-gray-100 dark:border-gray-800">
                            <div>
                                <div className="flex items-center gap-2 mb-2 text-gray-900 dark:text-white">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                                    <span className="text-[10px] font-black uppercase tracking-widest">En stock</span>
                                </div>
                                <p className="text-[10px] text-gray-500">Expédié sous 24h</p>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-2 text-gray-900 dark:text-white">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Paiement sécurisé</span>
                                </div>
                                <p className="text-[10px] text-gray-500">Protection acheteur</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Artisan Section (Replaces Tabs) */}
                <div className="bg-[#FAF9F6] dark:bg-[#1A1A1A] rounded-2xl p-8 lg:p-16 mb-24 relative overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="order-2 lg:order-1 relative z-10">
                            <h4 className="text-[10px] font-black text-[#8B4513] uppercase tracking-[0.2em] mb-4">L'histoire de la boutique</h4>
                            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
                                {product.shop?.name || 'Artisan Local'}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed mb-6">
                                Installé dans son atelier depuis plusieurs années, cet artisan ne se contente pas de fabriquer, il dialogue avec la matière. Chaque pièce est le fruit d'un travail méticuleux et d'une passion transmise de génération en génération.
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed italic mb-8 border-l-4 border-[#8B4513] pl-4">
                                "Notre terre possède une âme. Mon rôle est simplement de la laisser s'exprimer à travers des lignes qui parlent à notre époque."
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                                    <img src={product.shop?.logo || `https://ui-avatars.com/api/?name=${product.shop?.name}&background=8B4513&color=fff`} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{product.shop?.name}</p>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">{product.shop?.neighborhood?.name || 'Lomé'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2 relative">
                            <div className="aspect-[4/5] rounded-xl overflow-hidden shadow-2xl">
                                <img src={product.shop?.logo || images[0]} alt="Artisan" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute -bottom-6 -left-6 bg-[#6B4423] text-white p-6 rounded-lg shadow-xl max-w-[200px]">
                                <p className="text-2xl font-black mb-1">100%</p>
                                <p className="text-[9px] uppercase tracking-[0.1em] font-bold leading-tight">Authentique &<br/>Local</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details & Recommandations */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 mb-24 border-t border-gray-100 dark:border-gray-800 pt-16">
                    <div className="lg:col-span-4">
                        <h3 className="text-sm font-black uppercase tracking-[0.1em] text-gray-900 dark:text-white mb-8">Détails Techniques</h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                                <span className="text-gray-500">Catégorie</span>
                                <span className="font-bold text-gray-900 dark:text-white">{product.category?.name || '-'}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                                <span className="text-gray-500">Stock disponible</span>
                                <span className="font-bold text-gray-900 dark:text-white">{product.stock} unités</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                                <span className="text-gray-500">Localisation</span>
                                <span className="font-bold text-gray-900 dark:text-white">{product.shop?.neighborhood?.name || 'Lomé'}</span>
                            </div>
                            <div className="flex justify-between pb-2">
                                <span className="text-gray-500">Entretien</span>
                                <span className="font-bold text-gray-900 dark:text-white">Nettoyage à sec uniquement</span>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-8">
                        <h3 className="text-sm font-black uppercase tracking-[0.1em] text-gray-900 dark:text-white mb-8">Avis Clients ({product.reviews?.length || 0})</h3>
                        <div className="space-y-8">
                            {/* Formulaire Avis */}
                            {auth.user ? (
                                <form onSubmit={submitReview} className="bg-gray-50 dark:bg-[#1e1e1e] p-6 rounded-lg mb-8">
                                    <div className="flex items-center gap-4 mb-4">
                                        <p className="text-xs font-bold text-gray-500">Votre note:</p>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button key={star} type="button" onClick={() => setData('rating', star)} className={`text-xl ${data.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
                                            ))}
                                        </div>
                                    </div>
                                    <textarea 
                                        value={data.comment} onChange={e => setData('comment', e.target.value)}
                                        className="w-full rounded-md border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252525] focus:border-[#8B4513] focus:ring-0 text-sm mb-4"
                                        placeholder="Partagez votre expérience..." rows="3" required
                                    ></textarea>
                                    <button type="submit" disabled={processing} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2 rounded text-xs font-bold uppercase tracking-wider disabled:opacity-50 hover:bg-gray-800 transition-colors">Envoyer</button>
                                </form>
                            ) : (
                                <p className="text-sm text-gray-500 mb-8">Veuillez <Link href="/login" className="text-[#8B4513] underline">vous connecter</Link> pour laisser un avis.</p>
                            )}

                            {/* Liste */}
                            <div className="space-y-6">
                                {product.reviews?.length > 0 ? (
                                    product.reviews.map((review) => (
                                        <div key={review.id} className="pb-6 border-b border-gray-100 dark:border-gray-800 last:border-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="flex text-yellow-400 text-xs">
                                                    {[...Array(5)].map((_, i) => <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-200'}>★</span>)}
                                                </div>
                                                <span className="font-bold text-sm text-gray-900 dark:text-white ml-2">{review.user?.name}</span>
                                                <span className="text-xs text-gray-400 ml-auto">{new Date(review.created_at).toLocaleDateString('fr-FR')}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{review.comment}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-400 text-sm">Aucun avis pour le moment.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
