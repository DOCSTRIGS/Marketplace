import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { useCart } from '@/Contexts/CartContext';
import { useToast } from '@/Contexts/ToastContext';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export default function ProductDetail({ auth, product }) {
    if (!product) return <div>Produit introuvable</div>;

    const initialImage = product.images && product.images.length > 0 
        ? product.images[0] 
        : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80';
    
    const [mainImage, setMainImage] = useState(initialImage);
    
    const { data, setData, post, processing, reset, errors } = useForm({
        rating: 5,
        comment: '',
    });

    const submitReview = (e) => {
        e.preventDefault();
        post(route('reviews.store', product.id), {
            onSuccess: () => reset(),
            preserveScroll: true,
        });
    };

    const { addToCart } = useCart();
    const { addToast } = useToast();
    const [added, setAdded] = useState(false);

    const handleAddToCart = () => {
        addToCart(product);
        setAdded(true);
        addToast(`"${product.name}" ajouté au panier !`, 'success');
        setTimeout(() => setAdded(false), 2000);
    };

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

                            <button 
                                onClick={handleAddToCart}
                                className={`w-full ${added ? 'bg-[#2ECC71]' : 'bg-[#70360f]'} text-white font-bold py-3.5 rounded-md hover:opacity-90 transition-all mb-3 flex justify-center items-center shadow-md transform active:scale-95`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 100-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                                </svg>
                                {added ? 'Ajouté !' : 'Ajouter au panier'}
                            </button>
                            <button
                                onClick={() => window.location.href = `/chat/shop/${product.shop?.id}`}
                                className="w-full bg-transparent border-2 border-[#70360f] text-[#70360f] font-bold py-3 rounded-md hover:bg-[#70360f]/5 transition-colors flex justify-center items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                Contacter le vendeur
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

                            {/* Real Google Map */}
                            <div className="relative w-full h-64 bg-gray-100 rounded-2xl overflow-hidden mb-5 border border-gray-200 shadow-inner">
                                {(() => {
                                    const lat = product.shop?.latitude
                                        ? parseFloat(product.shop.latitude)
                                        : 6.1375;
                                    const lng = product.shop?.longitude
                                        ? parseFloat(product.shop.longitude)
                                        : 1.2123;
                                    const shopPos = { lat, lng };

                                    return (
                                        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                                            <Map
                                                defaultCenter={shopPos}
                                                defaultZoom={15}
                                                disableDefaultUI={false}
                                                gestureHandling={'cooperative'}
                                                mapId="bf50a87343b44b8b"
                                                style={{ width: '100%', height: '100%' }}
                                            >
                                                <AdvancedMarker position={shopPos}>
                                                    <div className="relative flex flex-col items-center">
                                                        <div className="absolute -top-1 w-10 h-10 bg-[#B03A2E]/20 rounded-full animate-ping" />
                                                        <div className="w-5 h-5 bg-[#B03A2E] border-2 border-white rounded-full shadow-xl z-10" />
                                                        <div className="mt-1 bg-white text-[#B03A2E] text-[9px] font-black px-2 py-0.5 rounded-full shadow-md whitespace-nowrap">
                                                            {product.shop?.name}
                                                        </div>
                                                    </div>
                                                </AdvancedMarker>
                                            </Map>
                                        </APIProvider>
                                    );
                                })()}

                                {/* Gradient footer overlay */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/80 to-transparent p-3 pointer-events-none">
                                    <div className="flex items-center gap-1.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-[#B03A2E]" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-[10px] font-bold text-gray-700">
                                            {product.shop?.neighborhood?.name || 'Lomé'}, Togo
                                        </span>
                                    </div>
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
                            <div id="reviews">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-xl font-bold text-[#222222]">
                                        Avis clients ({product.reviews?.length || 0})
                                    </h3>
                                    <div className="flex items-center bg-[#8B4513]/5 px-4 py-2 rounded-lg">
                                        <div className="flex text-[#B03A2E]">
                                            {[1, 2, 3, 4, 5].map((star) => {
                                                const avg = product.reviews?.length > 0 
                                                    ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length 
                                                    : 0;
                                                return (
                                                    <svg key={star} xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${star <= Math.round(avg) ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                );
                                            })}
                                        </div>
                                        <span className="ml-2 font-bold text-[#222222]">
                                            {product.reviews?.length > 0 
                                                ? (product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length).toFixed(1) 
                                                : '0'}/5
                                        </span>
                                    </div>
                                </div>

                                {/* Review Form */}
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-10">
                                    <h4 className="font-bold text-[#222222] mb-4">Laisser un avis</h4>
                                    <form onSubmit={submitReview} className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Votre note</label>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setData('rating', star)}
                                                        className={`p-1 transition-transform active:scale-90 ${data.rating >= star ? 'text-[#B03A2E]' : 'text-gray-300 hover:text-[#B03A2E]/50'}`}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 fill-current" viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                    </button>
                                                ))}
                                            </div>
                                            {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Votre commentaire</label>
                                            <textarea
                                                value={data.comment}
                                                onChange={e => setData('comment', e.target.value)}
                                                className="w-full rounded-lg border-gray-200 focus:border-[#8B4513] focus:ring focus:ring-[#8B4513]/20 text-sm p-4 h-24"
                                                placeholder="Partagez votre expérience avec ce produit..."
                                            ></textarea>
                                            {errors.comment && <p className="text-red-500 text-xs mt-1">{errors.comment}</p>}
                                        </div>

                                        <button 
                                            type="submit" 
                                            disabled={processing}
                                            className="bg-[#8B4513] text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-[#70360f] transition-all disabled:opacity-50"
                                        >
                                            {processing ? 'Envoi...' : 'Publier mon avis'}
                                        </button>
                                    </form>
                                </div>

                                {/* Review List */}
                                <div className="space-y-6">
                                    {product.reviews?.length > 0 ? (
                                        product.reviews.map((review) => (
                                            <div key={review.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 rounded-full bg-[#FADBD8] text-[#B03A2E] flex items-center justify-center font-bold mr-3">
                                                            {review.user?.name.substring(0, 1) || 'U'}
                                                        </div>
                                                        <div>
                                                            <h5 className="font-bold text-[#222222] text-sm">{review.user?.name || 'Client Anonyme'}</h5>
                                                            <div className="flex text-[#B03A2E] mt-0.5">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <svg key={star} xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${star <= review.rating ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
                                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                    </svg>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 font-medium">
                                                        {new Date(review.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                <p className="text-gray-600 text-sm leading-relaxed">
                                                    {review.comment}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-12 bg-white rounded-xl border border-dashed border-gray-200 text-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.827-1.233L3 20l1.341-4.634C3.298 14.167 3 12.43 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                            </div>
                                            <p className="text-gray-400 text-sm font-medium">Soyez le premier à donner votre avis sur ce produit !</p>
                                        </div>
                                    )}
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

