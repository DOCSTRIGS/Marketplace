import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import ProductCard from '@/Components/ProductCard';

export default function Welcome({ auth }) {
    const categories = [
        'Tous', 'Chaussures', 'Téléphones', 'Ordinateurs', 'Tablettes', 
        'Réfrigérateurs', 'Climatiseurs', 'Électroménager', 'Habits'
    ];

    const mockProducts = [
        { 
            id: 1, 
            name: 'Nike Air Max Red Edition', 
            price: '45,000', 
            shopName: 'Lomé Sport Plaza', 
            distance: '2.4km', 
            payment: 'Flooz / T-Money',
            inStock: true,
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80' 
        },
        { 
            id: 2, 
            name: 'Smartphone X-Pro Max', 
            price: '125,000', 
            shopName: 'Digital Store Togo', 
            distance: '0.8km', 
            payment: 'T-Money',
            inStock: true,
            image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80' 
        },
        { 
            id: 3, 
            name: 'Montre Classique Silver', 
            price: '18,500', 
            shopName: 'Bijouterie de l\'Union', 
            distance: '4.1km', 
            payment: 'Flooz / T-Money',
            inStock: true,
            image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=600&q=80' 
        },
        { 
            id: 4, 
            name: 'Tissu Wax Authentique', 
            price: '12,000', 
            shopName: 'Maman Wax Lomé', 
            distance: '1.5km', 
            payment: 'Flooz',
            inStock: true,
            image: 'https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?auto=format&fit=crop&w=600&q=80' 
        },
    ];

    return (
        <div className="min-h-screen bg-[#FDF8F4] flex flex-col font-sans">
            <Head title="Accueil" />
            <Navbar />

            <main className="flex-grow max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16">
                
                {/* Hero Section */}
                <section className="pt-16 pb-12 text-center flex flex-col items-center">
                    <h2 className="text-[42px] md:text-[56px] font-bold text-[#222222] leading-[1.1] mb-10 tracking-tight">
                        Découvrez l'artisanat <br />
                        <span className="text-[#8B4513]">de Lomé à votre porte.</span>
                    </h2>

                    {/* Search Bar */}
                    <div className="w-full max-w-3xl flex bg-white rounded-xl shadow-sm border border-gray-100 p-2 items-center mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 ml-4 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Rechercher un produit à Lomé..."
                            className="w-full bg-transparent border-none focus:ring-0 text-base text-gray-700 placeholder-gray-400 py-3"
                        />
                        <button className="bg-[#7B3F00] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#5a2e00] transition-colors flex-shrink-0 ml-2">
                            Rechercher
                        </button>
                    </div>

                    {/* Trends */}
                    <div className="text-sm text-gray-500 flex items-center space-x-2">
                        <span>Tendances :</span>
                        <Link href="#" className="underline hover:text-[#8B4513]">Pagne Wax</Link>
                        <span>,</span>
                        <Link href="#" className="underline hover:text-[#8B4513]">iPhone 15</Link>
                        <span>,</span>
                        <Link href="#" className="underline hover:text-[#8B4513]">Sandales en cuir</Link>
                    </div>
                </section>

                {/* Categories Pills */}
                <section className="mb-12">
                    <div className="flex overflow-x-auto space-x-3 pb-4 no-scrollbar hide-scroll">
                        {categories.map((cat, idx) => (
                            <button 
                                key={cat}
                                className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors flex-shrink-0 border ${
                                    idx === 0 
                                    ? 'bg-[#7B3F00] text-white border-[#7B3F00]' 
                                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#7B3F00] hover:text-[#7B3F00]'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Featured Banners */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {/* Left Banner (Wax) */}
                    <div className="md:col-span-2 relative rounded-2xl overflow-hidden min-h-[300px] shadow-sm group cursor-pointer flex items-end">
                        <img 
                            src="https://images.unsplash.com/photo-1544413164-96690ce11b11?auto=format&fit=crop&w=1200&q=80" 
                            alt="Wax Togolais" 
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                        <div className="relative p-8 md:p-10 w-full md:w-4/5 text-white">
                            <p className="text-[#F39C12] text-xs font-bold tracking-widest uppercase mb-3">SÉLECTION SPÉCIALE</p>
                            <h3 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">Le Meilleur du Wax Togolais</h3>
                            <p className="text-gray-200 mb-6 text-sm md:text-base leading-relaxed max-w-md">
                                Explorez notre collection exclusive de tissus authentiques sourcés directement auprès des créateurs de Lomé.
                            </p>
                            <button className="bg-[#E67E22] hover:bg-[#D35400] text-white px-6 py-3 rounded-lg font-bold text-sm transition-colors shadow-lg border border-[#E67E22]/50">
                                Découvrir la collection
                            </button>
                        </div>
                    </div>

                    {/* Right Banner (Verified Sellers) */}
                    <div className="bg-[#EFE9E1] rounded-2xl p-8 md:p-10 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#E6DCCF] rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#E6DCCF] rounded-full blur-2xl -ml-12 -mb-12 opacity-50"></div>
                        
                        <div className="w-16 h-16 bg-[#E6DCCF] rounded-full flex items-center justify-center mb-6 relative z-10 text-[#8B4513]">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                                <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-[#5C3A21] mb-4 relative z-10">Vendeurs Vérifiés</h3>
                        <p className="text-[#7A6A5E] text-sm mb-8 leading-relaxed relative z-10 px-4">
                            Achetez en toute confiance. Tous nos vendeurs passent par un processus de vérification strict.
                        </p>
                        <Link href="#" className="text-[#8B4513] font-bold text-sm border-b-2 border-[#8B4513] pb-0.5 hover:text-[#5a2e00] hover:border-[#5a2e00] transition-colors relative z-10">
                            En savoir plus
                        </Link>
                    </div>
                </section>

                {/* Popular Products */}
                <section className="mb-16">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h3 className="text-2xl font-bold text-[#222222] mb-1">Produits populaires</h3>
                            <p className="text-[#777777] text-sm">Les articles les plus recherchés en ce moment à Lomé.</p>
                        </div>
                        <Link href={route('explore')} className="text-[#8B4513] font-bold text-sm hover:underline hidden sm:flex items-center">
                            Voir tout 
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </Link>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {mockProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </section>

                {/* Newsletter */}
                <section className="bg-[#7B3F00] rounded-2xl p-10 md:p-16 text-center shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#8B4513] rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#8B4513] rounded-full blur-3xl opacity-50 -ml-16 -mb-16"></div>
                    
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h3 className="text-3xl font-bold text-white mb-4">Ne ratez aucune bonne affaire</h3>
                        <p className="text-[#E6DCCF] mb-10 text-lg leading-relaxed">
                            Inscrivez-vous pour recevoir les meilleures offres de vos boutiques préférées à Lomé directement dans votre boite mail.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <input 
                                type="email" 
                                placeholder="votre@email.com" 
                                className="w-full sm:w-80 px-6 py-4 rounded-lg border-none focus:ring-2 focus:ring-[#E67E22] text-gray-900 placeholder-gray-400 shadow-sm"
                            />
                            <button className="bg-[#F08A5D] hover:bg-[#E67E22] text-white px-8 py-4 rounded-lg font-bold transition-colors shadow-sm whitespace-nowrap">
                                S'abonner
                            </button>
                        </div>
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
}
