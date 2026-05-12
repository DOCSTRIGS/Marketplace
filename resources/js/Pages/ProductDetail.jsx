import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';

export default function ProductDetail({ product }) {
    const { auth } = usePage().props;
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
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: images[0],
                quantity: quantity,
                shop_id: product.shop_id,
                shop_name: product.shop?.name
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cart-updated'));
        alert('Produit ajouté au panier !');
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#121212] font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <Head title={`${product.name} - LoméShop`} />
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Breadcrumbs */}
                <nav className="flex mb-8 text-sm font-medium">
                    <Link href={route('home')} className="text-gray-400 hover:text-[#8B4513]">Accueil</Link>
                    <span className="mx-2 text-gray-300">/</span>
                    <Link href={route('explore')} className="text-gray-400 hover:text-[#8B4513]">Boutique</Link>
                    <span className="mx-2 text-gray-300">/</span>
                    <span className="text-[#8B4513]">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    {/* Left: Images */}
                    <div className="space-y-4">
                        <div className="aspect-square rounded-[40px] overflow-hidden bg-gray-50 dark:bg-[#1e1e1e] border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
                            <img 
                                src={images[selectedImage]} 
                                alt={product.name} 
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {images.map((img, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-[#8B4513] shadow-md scale-95' : 'border-transparent hover:border-gray-200'}`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Product Info */}
                    <div className="flex flex-col">
                        <div className="mb-6">
                            <Link href={`/explore?category_id=${product.category_id}`} className="inline-block px-3 py-1 bg-[#8B4513]/5 dark:bg-[#8B4513]/20 text-[#8B4513] text-[10px] font-black uppercase tracking-widest rounded-full mb-3">
                                {product.category?.name}
                            </Link>
                            <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 leading-tight">{product.name}</h1>
                            
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className={`w-4 h-4 ${i < Math.floor(product.reviews?.reduce((acc, r) => acc + r.rating, 0) / (product.reviews?.length || 1)) ? 'fill-current' : 'text-gray-200 dark:text-gray-700'}`} viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                    <span className="ml-2 text-sm font-bold text-gray-500 dark:text-gray-400">({product.reviews?.length || 0} avis)</span>
                                </div>
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                <span className={`text-sm font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    {product.stock > 0 ? `En stock (${product.stock})` : 'Rupture de stock'}
                                </span>
                            </div>

                            <p className="text-3xl font-black text-[#D35400] mb-8">
                                {new Intl.NumberFormat('fr-FR').format(product.price)} F
                            </p>

                            <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium mb-8">
                                {product.description}
                            </p>
                        </div>

                        {/* Variantes */}
                        {product.variants && product.variants.length > 0 && (
                            <div className="mb-8 space-y-4">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Options disponibles</h4>
                                <div className="flex flex-wrap gap-2">
                                    {product.variants.map((v, i) => (
                                        <div key={i} className="px-4 py-2 bg-gray-50 dark:bg-[#1e1e1e] border border-gray-100 dark:border-gray-800 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 transition-colors">
                                            <span className="text-gray-400 dark:text-gray-500 mr-2">{v.name}:</span>
                                            {v.value}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-auto space-y-6">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center bg-gray-50 dark:bg-[#1e1e1e] rounded-2xl p-1 border border-gray-100 dark:border-gray-800 transition-colors">
                                    <button 
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-bold"
                                    >
                                        -
                                    </button>
                                    <span className="w-12 text-center font-black dark:text-white">{quantity}</span>
                                    <button 
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-10 h-10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-bold"
                                    >
                                        +
                                    </button>
                                </div>
                                <button 
                                    onClick={addToCart}
                                    className="flex-1 bg-[#1a1a1a] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-gray-200 hover:bg-black transition-all"
                                >
                                    Ajouter au panier
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Link 
                                    href={route('chat.show', product.shop_id)}
                                    className="flex items-center justify-center gap-2 py-3 border-2 border-gray-100 dark:border-gray-800 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    Contacter le vendeur
                                </Link>
                                <button className="flex items-center justify-center gap-2 py-3 border-2 border-gray-100 dark:border-gray-800 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                    </svg>
                                    Partager
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs: Description, Shop, Reviews */}
                <div className="border-t border-gray-100 dark:border-gray-800 pt-12 transition-colors">
                    <div className="flex gap-8 mb-12 overflow-x-auto pb-4">
                        {['description', 'vendeur', 'avis'].map((tab) => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`text-sm font-black uppercase tracking-widest pb-2 border-b-2 transition-all ${activeTab === tab ? 'border-[#8B4513] text-[#8B4513]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                            >
                                {tab}
                                {tab === 'avis' && ` (${product.reviews?.length || 0})`}
                            </button>
                        ))}
                    </div>

                    <div className="max-w-3xl">
                        {activeTab === 'description' && (
                            <div className="prose prose-sm font-medium text-gray-600 max-w-none">
                                <p>{product.description}</p>
                            </div>
                        )}

                        {activeTab === 'vendeur' && (
                            <div className="bg-gray-50 dark:bg-[#1e1e1e] rounded-[32px] p-8 flex items-center gap-6 transition-colors">
                                <div className="w-20 h-20 rounded-full bg-white dark:bg-[#252525] flex items-center justify-center border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                                    <img src={product.shop?.logo || `https://ui-avatars.com/api/?name=${product.shop?.name}&background=8B4513&color=fff`} alt="" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-gray-900 dark:text-white mb-1">{product.shop?.name}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-bold mb-4">{product.shop?.neighborhood?.name}, Lomé</p>
                                    <Link href={`/shop/${product.shop_id}`} className="text-xs font-black text-[#8B4513] uppercase tracking-widest hover:underline">Visiter la boutique</Link>
                                </div>
                            </div>
                        )}

                        {activeTab === 'avis' && (
                            <div className="space-y-12">
                                {/* Formulaire Avis */}
                                {auth.user ? (
                                    <div className="bg-white dark:bg-[#1e1e1e] rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm transition-colors">
                                        <h4 className="text-lg font-black text-gray-900 dark:text-white mb-6">Laisser un avis</h4>
                                        <form onSubmit={submitReview} className="space-y-6">
                                            <div className="flex items-center gap-4">
                                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Note</p>
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button 
                                                            key={star}
                                                            type="button"
                                                            onClick={() => setData('rating', star)}
                                                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${data.rating >= star ? 'bg-yellow-400 text-white' : 'bg-gray-100 text-gray-300'}`}
                                                        >
                                                            ★
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <textarea 
                                                    value={data.comment}
                                                    onChange={e => setData('comment', e.target.value)}
                                                    className="w-full rounded-2xl border-gray-100 dark:border-gray-800 bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:ring-[#8B4513] focus:border-[#8B4513] p-4 text-sm font-medium transition-colors"
                                                    placeholder="Partagez votre expérience..."
                                                    rows="4"
                                                    required
                                                ></textarea>
                                            </div>
                                            <button 
                                                type="submit" 
                                                disabled={processing}
                                                className="bg-[#8B4513] text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-[#8B4513]/20 disabled:opacity-50"
                                            >
                                                Envoyer mon avis
                                            </button>
                                        </form>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 dark:bg-[#1e1e1e] rounded-2xl p-6 text-center border border-gray-100 dark:border-gray-800">
                                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                                            Veuillez <Link href="/login" className="text-[#8B4513] underline">vous connecter</Link> pour laisser un avis.
                                        </p>
                                    </div>
                                )}

                                {/* Liste des Avis */}
                                <div className="space-y-8">
                                    {product.reviews?.length > 0 ? (
                                        product.reviews.map((review) => (
                                            <div key={review.id} className="flex gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#252525] flex-shrink-0 flex items-center justify-center text-gray-400 font-black text-xs">
                                                    {review.user?.name.charAt(0)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h5 className="font-black text-gray-900 dark:text-white text-sm">{review.user?.name}</h5>
                                                        <span className="text-[10px] font-bold text-gray-400">{new Date(review.created_at).toLocaleDateString('fr-FR')}</span>
                                                    </div>
                                                    <div className="flex text-yellow-400 mb-2">
                                                        {[...Array(5)].map((_, i) => (
                                                            <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-200'}>★</span>
                                                        ))}
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-600 leading-relaxed">
                                                        {review.comment}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-400 font-bold text-sm text-center py-8">Aucun avis pour le moment.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
