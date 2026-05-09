import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import { useCart } from '@/Contexts/CartContext';
import { useToast } from '@/Contexts/ToastContext';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import CategoryProductCard from '@/Components/CategoryProductCard';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export default function Explore({ products, categories, filters }) {
    const [activeMainCategory, setActiveMainCategory] = useState(null);
    const [activeSubCategoryId, setActiveSubCategoryId] = useState(filters.category_id || null);

    useEffect(() => {
        if (categories.length > 0 && !activeMainCategory) {
            // Find which main category contains the filtered subcategory
            if (activeSubCategoryId) {
                const parent = categories.find(cat =>
                    cat.children.some(child => child.id == activeSubCategoryId)
                );
                if (parent) setActiveMainCategory(parent);
            } else {
                setActiveMainCategory(categories[0]);
            }
        }
    }, [categories, activeSubCategoryId]);

    const handleMainCategoryClick = (cat) => {
        if (activeMainCategory?.id === cat.id) {
            setActiveMainCategory(null);
        } else {
            setActiveMainCategory(cat);
        }
    };

    const handleSubCategoryClick = (subCatId) => {
        setActiveSubCategoryId(subCatId);
        router.get(route('explore'), { category_id: subCatId }, { preserveState: true });
    };

    const activeSubCategoryName = () => {
        if (!activeSubCategoryId) return "Tous les produits";
        for (const cat of categories) {
            const found = cat.children.find(child => child.id == activeSubCategoryId);
            if (found) return found.name;
        }
        return "Catégorie";
    };

    const [activeSort, setActiveSort] = useState('Tous');
    const [userLocation, setUserLocation] = useState(null);

    // Filter states
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [minPrice, setMinPrice] = useState(filters.min_price || '');
    const [maxPrice, setMaxPrice] = useState(filters.max_price || '');
    const [selectedRating, setSelectedRating] = useState(filters.rating || null);

    const applyFilters = (newFilters = {}) => {
        const currentFilters = {
            category_id: activeSubCategoryId,
            search: searchTerm,
            min_price: minPrice,
            max_price: maxPrice,
            rating: selectedRating,
            ...newFilters
        };
        
        // Remove empty values
        Object.keys(currentFilters).forEach(key => 
            (currentFilters[key] === '' || currentFilters[key] === null) && delete currentFilters[key]
        );

        router.get(route('explore'), currentFilters, { 
            preserveState: true,
            preserveScroll: true,
            replace: true 
        });
    };

    // Debounced search could be better, but for now simple Enter or blur
    const handleSearch = (e) => {
        if (e.key === 'Enter') applyFilters();
    };

    const clearAllFilters = () => {
        setSearchTerm('');
        setMinPrice('');
        setMaxPrice('');
        setSelectedRating(null);
        setActiveSubCategoryId(null);
        router.get(route('explore'));
    };

    // Get real user location
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
                },
                (error) => {
                    console.log("Geolocation error:", error);
                    // Default to Lomé center if blocked
                    setUserLocation({ lat: 6.1372, lng: 1.2125 });
                }
            );
        } else {
            setUserLocation({ lat: 6.1372, lng: 1.2125 });
        }
    }, []);

    // Dynamic sorting logic
    const sortedProducts = [...products].sort((a, b) => {
        if (activeSort === 'Prix') {
            return a.price - b.price;
        }
        if (activeSort === 'Nouveautés') {
            return new Date(b.created_at) - new Date(a.created_at);
        }
        return 0; // 'Tous' or default
    });

    return (
        <div className="min-h-screen bg-[#FDF8F4] flex flex-col font-sans">
            <Head title={`${activeSubCategoryName()} - Explorez`} />
            <Navbar />

            <main className="flex-grow max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

                {/* Header Section */}
                <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-5xl font-extrabold text-[#B03A2E] mb-2 tracking-tight">{activeSubCategoryName()}</h1>
                        <p className="text-[#555555]">Découvrez les meilleurs produits de Lomé sélectionnés pour vous.</p>
                    </div>
                    {/* Search Bar */}
                    <div className="relative w-full md:w-80">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleSearch}
                            onBlur={() => applyFilters()}
                            placeholder="Rechercher un produit..."
                            className="w-full bg-white border border-gray-200 rounded-md py-2.5 pl-10 pr-4 text-sm focus:ring-1 focus:ring-[#B03A2E] focus:outline-none focus:border-[#B03A2E] text-gray-700 shadow-sm"
                        />
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar / Filters */}
                    <aside className="w-full lg:w-72 flex-shrink-0">
                        <div className="bg-white rounded-xl p-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-100 mb-6">
                            <h2 className="text-xl font-bold text-[#222222] mb-6 flex justify-between items-center">
                                Catégories
                                {(activeSubCategoryId || searchTerm || minPrice || maxPrice || selectedRating) && (
                                    <button
                                        onClick={clearAllFilters}
                                        className="text-[10px] text-[#B03A2E] font-bold uppercase hover:underline"
                                    >
                                        Effacer tout
                                    </button>
                                )}
                            </h2>
                            <div className="space-y-2">
                                {categories.map((mainCat) => {
                                    const isActive = activeMainCategory?.id === mainCat.id;
                                    return (
                                        <div key={mainCat.id} className="border-b border-gray-50 last:border-0 pb-2 last:pb-0">
                                            <button
                                                onClick={() => handleMainCategoryClick(mainCat)}
                                                className={`w-full text-left py-2 flex justify-between items-center font-medium transition-colors ${isActive ? 'text-[#B03A2E]' : 'text-gray-600 hover:text-[#B03A2E]'}`}
                                            >
                                                <span className="text-sm">{mainCat.name}</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transform transition-transform ${isActive ? 'rotate-180 text-[#B03A2E]' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>

                                            {isActive && (
                                                <div className="pl-4 py-2 space-y-2 border-l-2 border-[#B03A2E]/20 ml-2 mt-1">
                                                    {mainCat.children.map(subCat => (
                                                        <button
                                                            key={subCat.id}
                                                            onClick={() => handleSubCategoryClick(subCat.id)}
                                                            className={`block w-full text-left text-sm transition-colors ${activeSubCategoryId == subCat.id ? 'text-[#B03A2E] font-bold' : 'text-gray-500 hover:text-gray-800'}`}
                                                        >
                                                            {subCat.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Price Filter */}
                        <div className="bg-white rounded-xl p-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-100 mb-6">
                            <h2 className="text-xl font-bold text-[#222222] mb-4">Prix (FCFA)</h2>
                            <div className="grid grid-cols-2 gap-2">
                                <input 
                                    type="number" 
                                    placeholder="Min" 
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    onBlur={() => applyFilters()}
                                    className="w-full text-xs border-gray-100 rounded-lg focus:ring-[#B03A2E] focus:border-[#B03A2E]"
                                />
                                <input 
                                    type="number" 
                                    placeholder="Max" 
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    onBlur={() => applyFilters()}
                                    className="w-full text-xs border-gray-100 rounded-lg focus:ring-[#B03A2E] focus:border-[#B03A2E]"
                                />
                            </div>
                        </div>

                        {/* Rating Filter */}
                        <div className="bg-white rounded-xl p-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-100 mb-6">
                            <h2 className="text-xl font-bold text-[#222222] mb-4">Note minimale</h2>
                            <div className="space-y-2">
                                {[5, 4, 3, 2].map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => {
                                            const newRating = selectedRating == r ? null : r;
                                            setSelectedRating(newRating);
                                            applyFilters({ rating: newRating });
                                        }}
                                        className={`w-full flex items-center justify-between text-xs p-2 rounded-lg transition-colors ${selectedRating == r ? 'bg-[#B03A2E]/10 text-[#B03A2E] font-bold' : 'text-gray-500 hover:bg-gray-50'}`}
                                    >
                                        <div className="flex items-center">
                                            <div className="flex text-[#B03A2E] mr-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <svg key={star} xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${star <= r ? 'fill-current' : 'text-gray-200'}`} viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                ))}
                                            </div>
                                            <span>{r} étoiles & plus</span>
                                        </div>
                                        {selectedRating == r && (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Mini Map Widget */}
                        <div className="bg-white rounded-2xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-gray-100 mb-6 group transition-all duration-500 hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)]">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-[#111111] font-extrabold text-[12px] uppercase tracking-[0.15em]">À Proximité</h3>
                                <div className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                            </div>
                            
                            <div className="relative w-full h-52 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-inner group/map">
                                {userLocation ? (
                                    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                                        <Map
                                            defaultCenter={userLocation}
                                            defaultZoom={14}
                                            gestureHandling={'none'}
                                            disableDefaultUI={true}
                                            mapId="bf50a87343b44b8b"
                                        >
                                            <AdvancedMarker position={userLocation}>
                                                <div className="relative flex items-center justify-center">
                                                    <div className="absolute w-8 h-8 bg-[#B03A2E]/20 rounded-full animate-ping"></div>
                                                    <div className="w-4 h-4 bg-[#B03A2E] border-2 border-white rounded-full shadow-lg z-10"></div>
                                                </div>
                                            </AdvancedMarker>
                                        </Map>
                                    </APIProvider>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                                        <div className="w-5 h-5 border-2 border-gray-200 border-t-[#B03A2E] rounded-full animate-spin mb-2"></div>
                                        <span className="text-[9px] font-bold uppercase tracking-widest opacity-50">Localisation...</span>
                                    </div>
                                )}

                                {/* Premium Overlay */}
                                <Link
                                    href={route('map')}
                                    className="absolute inset-0 z-[10] bg-gradient-to-t from-[#111111]/80 via-[#111111]/20 to-transparent flex flex-col justify-end p-5 transition-opacity duration-300 group-hover/map:opacity-90"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="block text-[10px] font-bold text-white/70 uppercase tracking-widest mb-0.5">Votre quartier</span>
                                            <span className="block text-sm font-extrabold text-white tracking-tight">Ouvrir la carte</span>
                                        </div>
                                        <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl text-white transform transition-transform duration-300 group-hover/map:translate-x-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </svg>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            <p className="mt-4 text-[11px] text-gray-500 font-medium leading-relaxed">
                                Retrouvez les boutiques et offres exclusives à proximité de vous à Lomé.
                            </p>
                        </div>
                    </aside>

                    {/* Main Content (Products) */}
                    <div className="flex-1 flex flex-col">

                        {/* Top Bar */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-gray-100 pb-6 gap-4">
                            <div className="text-sm text-gray-600 font-medium">
                                <span className="text-[#B03A2E] font-extrabold text-lg">{sortedProducts.length}</span> produits trouvés
                            </div>
                            <div className="flex items-center bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 hidden md:inline-block border-r border-gray-100 mr-2">Trier par :</span>
                                {['Tous', 'Prix', 'Nouveautés'].map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => setActiveSort(opt)}
                                        className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${activeSort === opt
                                            ? 'bg-[#8B4513] text-white shadow-md'
                                            : 'text-gray-500 hover:text-[#8B4513] hover:bg-gray-50'
                                            }`}
                                    >
                                        {opt === 'Prix' ? 'Prix croissant' : opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Product Grid */}
                        {sortedProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                                {sortedProducts.map((product, index) => (
                                    <CategoryProductCard key={product.id} product={product} index={index} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 012-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Aucun produit trouvé</h3>
                                <p className="text-gray-500 text-center max-w-xs">Nous n'avons pas encore de produits dans cette catégorie. Revenez bientôt !</p>
                            </div>
                        )}

                        {/* Load More Button */}
                        {products.length > 0 && (
                            <div className="flex justify-center pb-12">
                                <button className="bg-[#70360f] text-white font-bold text-sm px-10 py-3 rounded-md hover:bg-[#5a2b0c] transition-colors flex items-center shadow-md">
                                    Voir plus de produits
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

