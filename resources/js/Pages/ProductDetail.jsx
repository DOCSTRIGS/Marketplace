import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';

export default function ProductDetail({ auth, product }) {
    if (!product) return <div>Produit introuvable</div>;

    const initialImage = product.images && product.images.length > 0 
        ? product.images[0] 
        : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80';
    
    const [mainImage, setMainImage] = useState(initialImage);

    // Use actual product images if available, otherwise fallback
    const thumbnails = product.images && product.images.length > 0 
        ? product.images 
        : [initialImage];

    const formattedPrice = new Intl.NumberFormat('fr-FR').format(product.price);
    const totalPrice = new Intl.NumberFormat('fr-FR').format(parseInt(product.price) + 2000);

    return (
        <div className="min-h-screen bg-[#FDF8F4] flex flex-col font-sans">
            <Head title={product.name} />
            <Navbar />

            <main className="flex-grow max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">

                {/* Top Section - Images and Order Info */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">

                    {/* Left: Images */}
                    <div className="lg:col-span-7 flex flex-col sm:flex-row gap-4">
                        {/* Thumbnails */}
                        {thumbnails.length > 1 && (
                            <div className="flex sm:flex-col gap-3 order-2 sm:order-1 overflow-x-auto sm:overflow-visible">
                                {thumbnails.map((thumb, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setMainImage(thumb)}
                                        className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-colors ${mainImage === thumb ? 'border-[#8B4513]' : 'border-transparent'}`}
                                    >
                                        <img src={thumb} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Main Image */}
                        <div className="relative flex-grow bg-gray-100 rounded-xl overflow-hidden order-1 sm:order-2 aspect-[4/5] sm:aspect-auto sm:h-[600px]">
                            <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
                            <div className="absolute top-4 left-4 bg-[#A04000] text-white text-[10px] font-bold px-3 py-1.5 rounded-sm tracking-wider uppercase shadow-sm">
                                {product.category?.name || 'Général'}
                            </div>
                        </div>
                    </div>

                    {/* Right: Product Info & Actions */}
                    <div className="lg:col-span-5 flex flex-col">
                        <div className="mb-2 text-[#8B4513] text-[10px] font-bold tracking-widest uppercase">
                            {product.category?.parent?.name} / {product.category?.name}
                        </div>
                        <h1 className="text-3xl sm:text-[38px] font-extrabold text-[#222222] leading-tight mb-4 tracking-tight">
                            {product.name}
                        </h1>

                        <div className="flex items-center gap-4 mb-8">
                            <span className="text-3xl font-extrabold text-[#B03A2E]">{formattedPrice} FCFA</span>
                            <span className={`text-[11px] font-bold px-3 py-1.5 rounded-sm tracking-wider uppercase ${product.stock > 5 ? 'bg-[#FADBD8] text-[#B03A2E]' :
                                product.stock > 0 ? 'bg-orange-100 text-orange-600' :
                                    'bg-red-100 text-red-600'
                                }`}>
                                {product.stock > 5 ? 'EN STOCK' :
                                    product.stock > 0 ? 'STOCK FAIBLE' : 'RUPTURE'}
                            </span>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-[11px] font-bold text-gray-500 tracking-wider uppercase mb-3">
                                MODES DE PAIEMENT ACCEPTÉS
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                <span className="inline-flex items-center bg-white border border-gray-200 rounded-md px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm">
                                    <span className="w-4 h-4 bg-[#2980B9] text-white flex items-center justify-center rounded-sm mr-2 text-[10px]">F</span> Flooz
                                </span>
                                <span className="inline-flex items-center bg-white border border-gray-200 rounded-md px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm">
                                    <span className="w-4 h-4 bg-[#F1C40F] text-black flex items-center justify-center rounded-sm mr-2 text-[10px]">T</span> T-Money
                                </span>
                                <span className="inline-flex items-center bg-white border border-gray-200 rounded-md px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                                    Cartes Bancaires
                                </span>
                            </div>
                        </div>

                        {/* Order Summary Box */}
                        <div className="bg-[#F8F5F2] rounded-xl p-6 mb-6">
                            <h3 className="font-bold text-[#222222] mb-5">Récapitulatif de la commande</h3>

                            <div className="flex justify-between text-sm text-gray-600 mb-3">
                                <span>Prix unitaire</span>
                                <span>{formattedPrice} FCFA</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600 mb-5 pb-5 border-b border-gray-200">
                                <span>Livraison (Lomé Centre)</span>
                                <span>2.000 FCFA</span>
                            </div>
                            <div className="flex justify-between items-center mb-6">
                                <span className="font-bold text-[#222222]">Total</span>
                                <span className="text-xl font-bold text-[#B03A2E]">
                                    {totalPrice} FCFA
                                </span>
                            </div>

                            <button className="w-full bg-[#70360f] text-white font-bold py-3.5 rounded-md hover:bg-[#5a2b0c] transition-colors mb-3 flex justify-center items-center shadow-md">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7h-3v7h.05a2.5 2.5 0 004.9 0H17a1 1 0 001-1V9l-2-2h-2z" />
                                </svg>
                                Acheter et se faire livrer
                            </button>
                            <button className="w-full bg-transparent border-2 border-[#70360f] text-[#70360f] font-bold py-3 rounded-md hover:bg-[#70360f]/5 transition-colors flex justify-center items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10.496 2.132a1 1 0 00-.992 0l-7 4A1 1 0 003 8v7a1 1 0 100 2h14a1 1 0 100-2V8a1 1 0 00.504-1.868l-7-4zM6 9a1 1 0 00-1 1v3a1 1 0 102 0v-3a1 1 0 00-1-1zm3 1a1 1 0 012 0v3a1 1 0 11-2 0v-3zm5-1a1 1 0 00-1 1v3a1 1 0 102 0v-3a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Réserver et passer en boutique
                            </button>
                        </div>

                        <div className="flex items-center text-xs text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#2ECC71] mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Paiement sécurisé par LoméShop
                        </div>
                    </div>
                </div>

            </main>

            {/* Bottom Section - Details & Reviews */}
            <div className="bg-[#F8F5F2] py-16 flex-grow border-t border-gray-200/50">
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                        {/* Left: Shop Info & Map */}
                        <div className="lg:col-span-4">
                            <h3 className="text-xl font-bold text-[#222222] mb-6">À propos de la boutique</h3>

                            <div className="flex items-center mb-6">
                                <div className="w-14 h-14 rounded-full bg-[#E6DCCF] text-[#8B4513] flex items-center justify-center text-xl font-bold mr-4 uppercase">
                                    {product.shop?.name.substring(0, 2)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#222222]">{product.shop?.name}</h4>
                                    <p className="text-sm text-gray-500">Vendeur vérifié à {product.shop?.neighborhood?.name}</p>
                                </div>
                            </div>

                            {/* Static Map Image Replacement */}
                            <div className="relative w-full h-48 bg-gray-200 rounded-xl overflow-hidden mb-6 border border-gray-300">
                                <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80" alt="Map" className="w-full h-full object-cover opacity-50 grayscale" />

                                {/* Map Pin */}
                                <div className="absolute top-1/2 left-1/2 -mt-4 -ml-4 w-8 h-8 text-[#8B4513] drop-shadow-md">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                    </svg>
                                </div>

                                {/* Map Label */}
                                <div className="absolute bottom-3 left-3 bg-white px-3 py-1.5 rounded-md text-[10px] font-bold text-gray-800 shadow-sm">
                                    Quartier {product.shop?.neighborhood?.name}, Lomé
                                </div>
                            </div>

                            <Link href="#" className="text-[#8B4513] font-bold text-sm flex items-center hover:underline">
                                Voir toute la boutique
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </Link>
                        </div>

                        {/* Right: Description & Reviews */}
                        <div className="lg:col-span-8 lg:pl-10">

                            {/* Description */}
                            <div className="mb-12">
                                <h3 className="text-xl font-bold text-[#222222] mb-4">Description du produit</h3>
                                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                    {product.description || 'Pas de description disponible pour ce produit.'}
                                </p>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li className="flex items-start">
                                        <span className="mr-2 text-gray-400">•</span>
                                        <span>Livraison rapide disponible</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2 text-gray-400">•</span>
                                        <span>Paiement à la livraison accepté</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2 text-gray-400">•</span>
                                        <span>Garantie LoméShop incluse</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Reviews */}
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-[#222222]">Avis clients (0)</h3>
                                    <div className="flex items-center">
                                        <div className="flex text-[#8B4513]">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <svg key={star} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <span className="ml-2 font-bold text-[#222222]">0/5</span>
                                    </div>
                                </div>

                                <div className="p-8 bg-white rounded-xl border border-dashed border-gray-300 text-center">
                                    <p className="text-gray-500 text-sm">Il n'y a pas encore d'avis pour ce produit.</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

