import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
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

    const avgRating = product.reviews?.length > 0
        ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
        : 0;

    const addToCart = () => {
        if (!auth.user) {
            addToast('Veuillez vous connecter pour ajouter des produits au panier', 'error');
            router.visit(route('login'));
            return;
        }

        addItemToCart(product, quantity);
        addToast('Produit ajouté au panier !', 'success');
    };    return (
        <div className="min-h-screen bg-[#FDFDFB] dark:bg-[#121212] font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <Head title={`${product.name} - LoméShop`} />
            <Navbar elegant />

            <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-12">
                {/* Breadcrumbs */}
                <nav className="flex mb-10 text-[10px] font-extrabold uppercase tracking-[0.2em] text-gray-400">
                    <Link href={route('home')} className="hover:text-[#b85817] transition-colors">Accueil</Link>
                    <span className="mx-3">/</span>
                    <Link href={route('explore')} className="hover:text-[#b85817] transition-colors">Boutique</Link>
                    <span className="mx-3">/</span>
                    <span className="text-gray-900 dark:text-white font-black">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-20">
                    {/* Images - Left Column (7/12) */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="relative w-full aspect-[4/5] sm:aspect-square lg:aspect-[4/5] rounded-3xl bg-[#FAF9F5] dark:bg-[#1a1a1a] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-center group">
                            {/* Premium tag */}
                            <div className="absolute top-4 left-4 z-10 px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-[#181818]/95 backdrop-blur-md border border-gray-100 dark:border-gray-800 text-[9px] font-black uppercase tracking-[0.25em] text-[#b85817] dark:text-[#d36b24] shadow-sm">
                                LOMÉSHOP PRESTIGE
                            </div>

                            {/* Navigation Arrows */}
                            <button 
                                onClick={() => setSelectedImage(prev => prev > 0 ? prev - 1 : images.length - 1)}
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-[#202020]/90 backdrop-blur-sm border border-gray-200 dark:border-gray-850 flex items-center justify-center text-gray-800 dark:text-white hover:bg-white dark:hover:bg-black transition-all shadow-sm z-10 opacity-0 group-hover:opacity-100 duration-300"
                            >
                                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
                            </button>

                            <img 
                                src={images[selectedImage]} 
                                alt={product.name} 
                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                            />

                            <button 
                                onClick={() => setSelectedImage(prev => (prev + 1) % images.length)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-[#202020]/90 backdrop-blur-sm border border-gray-200 dark:border-gray-850 flex items-center justify-center text-gray-800 dark:text-white hover:bg-white dark:hover:bg-black transition-all shadow-sm z-10 opacity-0 group-hover:opacity-100 duration-300"
                            >
                                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                            </button>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {images.map((img, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-300 ${selectedImage === idx ? 'border-[#b85817] shadow-md' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-700'}`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Info - Right Column (5/12) */}
                    <div className="lg:col-span-5 flex flex-col py-2 justify-between">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2">
                                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#b85817] dark:text-[#d36b24] bg-amber-50/50 dark:bg-[#241a10] px-3.5 py-1.5 rounded-full border border-amber-100/50 dark:border-amber-900/30">
                                    {product.category?.name || 'Prestige'}
                                </span>
                                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-3.5 py-1.5 rounded-full border border-emerald-100/50 dark:border-emerald-900/30">
                                    Disponible
                                </span>
                            </div>
                            
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white leading-[1.15] tracking-tight">{product.name}</h1>
                            
                            {/* Stars rating below the title */}
                            <div className="flex items-center gap-2">
                                <div className="flex text-amber-550 text-xs">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <span key={star} className={star <= Math.round(avgRating) ? 'text-amber-550' : 'text-gray-250 dark:text-gray-800'}>★</span>
                                    ))}
                                </div>
                                {avgRating > 0 && (
                                    <span className="text-xs font-black text-gray-900 dark:text-white">{avgRating.toFixed(1)}</span>
                                )}
                                <span className="text-xs text-gray-400 font-extrabold uppercase tracking-wider">({product.reviews?.length || 0} avis)</span>
                            </div>

                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium text-sm">
                                {product.description}
                            </p>

                            {/* Specifications bullet points list */}
                            <ul className="space-y-2.5 text-xs text-gray-600 dark:text-gray-400 py-4 border-t border-gray-150 dark:border-gray-800/80">
                                <li className="flex items-center gap-2.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#b85817] shrink-0"></span>
                                    <span>Article authentique et certifié de la boutique officielle</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#b85817] shrink-0"></span>
                                    <span>Localisation et expédition rapide depuis Lomé</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#b85817] shrink-0"></span>
                                    <span>Paiement sécurisé par T-Money, Flooz et Cartes bancaires</span>
                                </li>
                            </ul>

                            {/* Price display */}
                            <div className="py-6 border-t border-gray-150 dark:border-gray-800/80 space-y-1">
                                <p className="text-4xl font-extrabold text-[#b85817] dark:text-[#d36b24] tracking-tight">
                                    {new Intl.NumberFormat('fr-FR').format(product.price)} FCFA
                                </p>
                                <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest">
                                    Frais de livraison calculés à la validation
                                </p>
                            </div>
                        </div>

                        {/* Direct Purchase Option Card */}
                        <div className="space-y-3 py-4 border-t border-gray-150 dark:border-gray-800/80">
                            <label className="flex items-center gap-3.5 p-4 border border-amber-800/20 dark:border-amber-500/20 rounded-2xl bg-amber-50/20 dark:bg-amber-950/10 cursor-pointer">
                                <input type="radio" defaultChecked className="text-[#b85817] focus:ring-[#b85817]" />
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-gray-900 dark:text-white">Achat Direct Standard</p>
                                    <p className="text-[10px] text-gray-400 font-medium">Garantie authentique et local</p>
                                </div>
                                <span className="text-xs font-black text-[#b85817] dark:text-[#d36b24]">{new Intl.NumberFormat('fr-FR').format(product.price)} FCFA</span>
                            </label>
                        </div>

                        {/* Quantité & Ajouter au panier */}
                        <div className="space-y-6 pt-4">
                            {product.variants && product.variants.length > 0 ? (
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Sélectionner un Format</h4>
                                    <div className="flex flex-wrap gap-2.5">
                                        {product.variants.map((v, i) => (
                                            <button key={i} className="px-5 py-2.5 border-2 border-gray-100 dark:border-gray-800 rounded-xl text-xs font-bold text-gray-900 dark:text-white hover:border-[#b85817] transition-all duration-300">
                                                {v.value}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Quantité</span>
                                    <div className="flex items-center border border-gray-250 dark:border-gray-700 rounded-xl w-[120px] h-10 bg-white dark:bg-[#1a1a1a]">
                                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-full flex items-center justify-center text-gray-450 hover:text-black font-bold transition-colors">-</button>
                                        <span className="flex-1 text-center font-extrabold text-xs">{quantity}</span>
                                        <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-full flex items-center justify-center text-gray-450 hover:text-black font-bold transition-colors">+</button>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button 
                                    onClick={addToCart}
                                    className="w-full bg-[#b85817] hover:bg-[#a24d14] text-white py-4 rounded-xl font-bold text-xs uppercase tracking-[0.15em] transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-[#b85817]/10"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                                    Ajouter au panier
                                </button>
                                
                                <Link 
                                    href={route('chat.show', product.shop_id)}
                                    className="w-full flex items-center justify-center gap-2 py-4 bg-transparent border-2 border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 rounded-xl text-xs font-bold uppercase tracking-[0.15em] text-gray-900 dark:text-white transition-all duration-300"
                                >
                                    Contacter le vendeur
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid Boutique Officielle, Fiche Technique & Avis */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 border-t border-gray-150 dark:border-gray-800/80 pt-16">
                    {/* Boutique & Avis Column (8/12) */}
                    <div className="lg:col-span-8 space-y-16">
                        {/* Boutique Officielle Spotlight */}
                        <div className="border border-gray-100 dark:border-gray-800/80 rounded-3xl p-8 bg-gradient-to-br from-gray-50/50 to-white dark:from-[#161616] dark:to-[#121212] shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/3 rounded-full blur-3xl pointer-events-none"></div>
                            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
                                <div className="flex flex-col sm:flex-row gap-6 items-center text-center sm:text-left">
                                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-md border-2 border-white dark:border-gray-800 shrink-0">
                                        <img 
                                            src={product.shop?.logo || `https://ui-avatars.com/api/?name=${product.shop?.name}&background=8B4513&color=fff`} 
                                            alt={product.shop?.name} 
                                            className="w-full h-full object-cover" 
                                        />
                                    </div>
                                    <div>
                                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                                            <span className="text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded bg-amber-100/70 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
                                                Boutique Officielle
                                            </span>
                                            <span className="text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded bg-emerald-100/70 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300">
                                                Vérifiée LoméShop
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1.5 tracking-tight">
                                            {product.shop?.name}
                                        </h3>
                                        <p className="text-[#b85817] dark:text-amber-500 font-bold text-xs uppercase tracking-widest mb-3 flex items-center justify-center sm:justify-start gap-1">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Quartier {product.shop?.neighborhood?.name || 'Lomé'}
                                        </p>
                                        <p className="text-sm text-gray-650 dark:text-gray-400 max-w-xl leading-relaxed">
                                            {product.shop?.description || 'Boutique certifiée partenaire de la plateforme LoméShop, garantissant la qualité de ses articles et son sérieux.'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto shrink-0">
                                    <Link 
                                        href={route('chat.show', product.shop_id)}
                                        className="flex-1 md:flex-none px-6 py-3 bg-transparent border-2 border-gray-250 dark:border-gray-800 hover:border-amber-700 dark:hover:border-amber-500 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white text-center transition-all duration-300"
                                    >
                                        Discuter en ligne
                                    </Link>
                                    <Link 
                                        href={route('explore', { shop_id: product.shop_id })}
                                        className="flex-1 md:flex-none px-6 py-3 bg-[#b85817] hover:bg-[#a24d14] text-white rounded-xl text-xs font-bold uppercase tracking-wider text-center shadow-lg shadow-[#b85817]/10 transition-all duration-300"
                                    >
                                        Visiter la Boutique
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Avis Section */}
                        <div className="space-y-8">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="w-1.5 h-3.5 bg-[#b85817] rounded-full"></span>
                                Avis Clients ({product.reviews?.length || 0})
                            </h3>
                            <div className="space-y-8">
                                {/* Avis : uniquement possible depuis une commande livrée, pour éviter les faux avis */}
                                {auth.user ? (
                                    <div className="p-5 border border-gray-150 dark:border-gray-800 rounded-2xl bg-gray-50/20 dark:bg-[#161616]/30 text-center">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Vous avez acheté ce produit ? Laissez votre avis depuis{' '}
                                            <Link href={route('orders.index')} className="text-[#b85817] dark:text-[#d36b24] underline font-semibold">Mes Commandes</Link>{' '}
                                            une fois la livraison confirmée.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="p-5 border border-gray-150 dark:border-gray-800 rounded-2xl bg-gray-50/20 dark:bg-[#161616]/30 text-center">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Veuillez <Link href="/login" className="text-[#b85817] dark:text-[#d36b24] underline font-semibold">vous connecter</Link> pour laisser un avis.</p>
                                    </div>
                                )}

                                {/* Liste des avis */}
                                <div className="space-y-6">
                                    {product.reviews?.length > 0 ? (
                                        product.reviews.map((review) => (
                                            <div key={review.id} className="pb-6 border-b border-gray-150 dark:border-gray-800/80 last:border-0 flex gap-4">
                                                <div className="w-10 h-10 rounded-full bg-amber-800/10 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400 font-black text-sm flex items-center justify-center shrink-0 shadow-inner">
                                                    {review.user?.name ? review.user.name.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="font-extrabold text-sm text-gray-900 dark:text-white">{review.user?.name}</span>
                                                        <span className="text-[10px] text-gray-400 font-medium ml-auto">{new Date(review.created_at).toLocaleDateString('fr-FR')}</span>
                                                    </div>
                                                    <div className="flex text-amber-550 text-[10px] mb-2">
                                                        {[...Array(5)].map((_, i) => <span key={i} className={i < review.rating ? 'text-amber-550' : 'text-gray-250 dark:text-gray-800'}>★</span>)}
                                                    </div>
                                                    <p className="text-sm text-gray-650 dark:text-gray-450 leading-relaxed font-medium">{review.comment}</p>
                                                    {review.seller_reply && (
                                                        <div className="mt-3 ml-2 pl-4 border-l-2 border-[#b85817]/30">
                                                            <p className="text-[10px] font-black uppercase text-[#b85817] dark:text-[#d36b24] mb-1">Réponse du vendeur</p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">{review.seller_reply}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-gray-400 dark:text-gray-500 italic">Aucun avis rédigé pour le moment.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fiche Technique Column (4/12) */}
                    <div className="lg:col-span-4">
                        <div className="bg-gray-50/50 dark:bg-[#161616] p-8 rounded-3xl border border-gray-150 dark:border-gray-800/50 shadow-sm h-fit space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="w-1.5 h-3.5 bg-[#b85817] rounded-full"></span>
                                Fiche Technique
                            </h3>
                            <div className="space-y-4 text-xs">
                                <div className="flex justify-between border-b border-gray-150 dark:border-gray-800 pb-3">
                                    <span className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Catégorie</span>
                                    <span className="font-extrabold text-gray-950 dark:text-white">{product.category?.name || '-'}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-150 dark:border-gray-800 pb-3">
                                    <span className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Stock disponible</span>
                                    <span className="font-extrabold text-gray-950 dark:text-white">{product.stock} unités</span>
                                </div>
                                <div className="flex justify-between pb-1">
                                    <span className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Localisation</span>
                                    <span className="font-extrabold text-gray-950 dark:text-white">{product.shop?.neighborhood?.name || 'Lomé'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
