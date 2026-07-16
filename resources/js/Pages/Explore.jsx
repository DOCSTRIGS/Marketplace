import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import { useCart } from '@/Contexts/CartContext';
import { useToast } from '@/Contexts/ToastContext';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import CategoryProductCard from '@/Components/CategoryProductCard';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export default function Explore({ products, categories, filters, activeShop }) {
    // Filter categories that actually have products in this shop for a bespoke storefront feel
    const visibleCategories = React.useMemo(() => {
        if (!activeShop) return categories;
        return categories.map(cat => {
            const filteredChildren = cat.children.filter(sub => 
                products.some(p => p.category_id === sub.id)
            );
            const hasMainProducts = products.some(p => p.category_id === cat.id);
            if (filteredChildren.length > 0 || hasMainProducts) {
                return {
                    ...cat,
                    children: filteredChildren
                };
            }
            return null;
        }).filter(Boolean);
    }, [categories, products, activeShop]);

    const [activeMainCategory, setActiveMainCategory] = useState(null);
    const [activeSubCategoryId, setActiveSubCategoryId] = useState(filters.category_id || null);

    useEffect(() => {
        if (visibleCategories.length > 0 && !activeMainCategory) {
            // Find which main category contains the filtered subcategory
            if (activeSubCategoryId) {
                const parent = visibleCategories.find(cat =>
                    cat.children.some(child => child.id == activeSubCategoryId)
                );
                if (parent) setActiveMainCategory(parent);
            } else {
                setActiveMainCategory(visibleCategories[0]);
            }
        }
    }, [visibleCategories, activeSubCategoryId, activeMainCategory]);

    const handleMainCategoryClick = (cat) => {
        if (activeMainCategory?.id === cat.id) {
            setActiveMainCategory(null);
        } else {
            setActiveMainCategory(cat);
        }
    };

    const handleSubCategoryClick = (subCatId) => {
        setActiveSubCategoryId(subCatId);
        const params = { category_id: subCatId };
        if (filters.shop_id) {
            params.shop_id = filters.shop_id;
        }
        router.get(route('explore'), params, { preserveState: true });
    };

    const activeSubCategoryName = () => {
        if (activeShop) return `Boutique : ${activeShop.name}`;
        if (searchTerm) return `Recherche : "${searchTerm}"`;
        if (!activeSubCategoryId) return "Tous les produits";
        for (const cat of categories) {
            const found = cat.children.find(child => child.id == activeSubCategoryId);
            if (found) return found.name;
        }
        return "Catégorie";
    };

    const [activeSort, setActiveSort] = useState(typeof filters.sort === 'string' ? filters.sort : 'Tous');
    const [userLocation, setUserLocation] = useState(null);

    // Filter states
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [minPrice, setMinPrice] = useState(filters.min_price || '');
    const [maxPrice, setMaxPrice] = useState(filters.max_price || '');
    const [selectedRating, setSelectedRating] = useState(filters.rating || null);

    // Progressive Rendering (Pagination) for Instant Load Speed
    const [visibleCount, setVisibleCount] = useState(12);

    // Reset pagination when filters, categories, or sorting options change
    useEffect(() => {
        setVisibleCount(12);
    }, [activeSubCategoryId, searchTerm, minPrice, maxPrice, selectedRating, activeSort]);

    const applyFilters = (newFilters = {}) => {
        const isSearching = newFilters.hasOwnProperty('search') ? newFilters.search : searchTerm;
        
        // If searching globally, clear category filter automatically for best UX
        if (isSearching) {
            activeSubCategoryId && setActiveSubCategoryId(null);
            activeMainCategory && setActiveMainCategory(null);
        }

        const currentFilters = {
            category_id: isSearching ? null : activeSubCategoryId,
            search: searchTerm,
            min_price: minPrice,
            max_price: maxPrice,
            rating: selectedRating,
            shop_id: filters.shop_id || null,
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

    // Live Search Debounce: Triggers search automatically 350ms after the user stops typing
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchTerm !== (filters.search || '')) {
                applyFilters({ search: searchTerm });
            }
        }, 350);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm]);

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

    // Calculate average rating of shop's products in real time for premium feel.
    // Products only carry aggregate reviews_count/reviews_avg_rating (not full review
    // rows), so this weights each product's average by its own review count to get
    // the true average across all of the shop's individual reviews.
    const averageRating = React.useMemo(() => {
        if (!activeShop) return null;
        const totalCount = products.reduce((sum, p) => sum + (p.reviews_count || 0), 0);
        if (totalCount === 0) return null;
        const totalRatingSum = products.reduce((sum, p) => sum + (p.reviews_avg_rating || 0) * (p.reviews_count || 0), 0);
        return (totalRatingSum / totalCount).toFixed(1);
    }, [products, activeShop]);

    return (
        <div className="min-h-screen bg-[#FDF8F4] dark:bg-[#121212] flex flex-col font-sans transition-colors duration-300">
            <Head title={activeShop ? `${activeShop.name} - Boutique Officielle LoméShop` : `${activeSubCategoryName()} - Explorez`} />
            <Navbar elegant />

            <main className="flex-grow max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

                {/* Boutique Partner Banner if filtered */}
                {activeShop && (
                    <div className="mb-10 border border-[#b85817]/20 dark:border-gray-800 rounded-3xl p-8 bg-gradient-to-br from-amber-50/60 via-white to-amber-50/20 dark:from-[#1e150f] dark:via-[#121212] dark:to-[#1a120c] shadow-lg relative overflow-hidden transition-all duration-350 transform hover:scale-[1.01]">
                        {/* Interactive Premium Backdrops */}
                        <div className="absolute top-0 right-0 w-80 h-80 bg-[#b85817]/5 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-amber-500/3 rounded-full blur-3xl pointer-events-none"></div>
                        
                        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
                            <div className="flex flex-col sm:flex-row gap-6 items-center text-center sm:text-left">
                                <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-white dark:bg-gray-850 shadow-md border-2 border-white dark:border-gray-800 shrink-0 flex items-center justify-center">
                                    <img 
                                        src={activeShop.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeShop.name)}&background=b85817&color=fff`} 
                                        alt={activeShop.name} 
                                        className="w-full h-full object-cover" 
                                    />
                                </div>
                                <div>
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                                        <span className="text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded bg-[#b85817]/10 text-[#b85817] dark:text-amber-400">
                                            Boutique Officielle
                                        </span>
                                        <span className="text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded bg-emerald-100/70 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300">
                                            Vérifiée LoméShop
                                        </span>
                                        {activeShop.delivery_available && (
                                            <span className="text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded bg-amber-500/10 text-amber-650 dark:text-amber-400">
                                                Livraison {parseFloat(activeShop.delivery_fee) === 0 ? 'Gratuite' : `${parseFloat(activeShop.delivery_fee)} F`}
                                            </span>
                                        )}
                                    </div>
                                    
                                    <h1 className="text-3.5xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                                        {activeShop.name}
                                    </h1>

                                    {activeShop.slogan && (
                                        <p className="text-xs italic text-gray-500 dark:text-gray-400 mb-2 font-medium">
                                            "{activeShop.slogan}"
                                        </p>
                                    )}

                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-3 text-xs">
                                        <p className="text-[#b85817] dark:text-[#d36b24] font-extrabold uppercase tracking-wider flex items-center gap-1">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Quartier {activeShop.neighborhood?.name || 'Lomé'}
                                        </p>

                                        {averageRating && (
                                            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded text-amber-700 dark:text-amber-400 font-bold text-[11px]">
                                                <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                                {averageRating} ({shopReviews.length} avis)
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-xs text-gray-600 dark:text-gray-400 max-w-xl leading-relaxed">
                                        {activeShop.description || 'Découvrez tous les produits exclusifs de cette boutique certifiée partenaire.'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto shrink-0">
                                <Link
                                    href={route('chat.show', activeShop.id)}
                                    prefetch
                                    className="flex-grow md:flex-grow-0 px-6 py-3 bg-transparent border-2 border-gray-250 dark:border-gray-800 hover:border-[#b85817] hover:text-[#b85817] rounded-xl text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white text-center transition-all duration-300"
                                >
                                    Discuter en ligne
                                </Link>
                                <button 
                                    onClick={clearAllFilters}
                                    className="flex-grow md:flex-grow-0 px-6 py-3 bg-[#b85817] hover:bg-[#9a4710] text-white rounded-xl text-xs font-bold uppercase tracking-wider text-center transition-all duration-300 shadow-md hover:shadow-[#b85817]/25 animate-fade-in"
                                >
                                    Catalogue Général
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header Section */}
                <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-5xl font-extrabold text-[#B03A2E] mb-2 tracking-tight transition-colors">
                            {activeShop ? 'Nos Articles Exclusifs' : activeSubCategoryName()}
                        </h1>
                        <p className="text-[#555555] dark:text-gray-400 transition-colors">
                            {activeShop ? `Parcourez la vitrine exclusive de ${activeShop.name}.` : 'Découvrez les meilleurs produits de Lomé sélectionnés pour vous.'}
                        </p>
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
                            placeholder={activeShop ? `Rechercher chez ${activeShop.name}...` : "Rechercher un produit..."}
                            className="w-full bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-800 rounded-md py-2.5 pl-10 pr-10 text-sm focus:ring-1 focus:ring-[#B03A2E] focus:outline-none focus:border-[#B03A2E] text-gray-700 dark:text-gray-200 shadow-sm transition-all"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    applyFilters({ search: '' });
                                }}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-white"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar / Filters */}
                    <aside className="w-full lg:w-72 flex-shrink-0">
                        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-gray-800 mb-6 transition-colors">
                            <h2 className="text-xl font-bold text-[#222222] dark:text-white mb-6 flex justify-between items-center">
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
                                {visibleCategories.map((mainCat) => {
                                    const isActive = activeMainCategory?.id === mainCat.id;
                                    return (
                                        <div key={mainCat.id} className="border-b border-gray-50 last:border-0 pb-2 last:pb-0">
                                            <button
                                                onClick={() => handleMainCategoryClick(mainCat)}
                                                className={`w-full text-left py-2 flex justify-between items-center font-medium transition-colors ${isActive ? 'text-[#B03A2E]' : 'text-gray-600 dark:text-gray-400 hover:text-[#B03A2E]'}`}
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
                                                            className={`block w-full text-left text-sm transition-colors ${activeSubCategoryId == subCat.id ? 'text-[#B03A2E] font-bold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'}`}
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
                        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-gray-800 mb-6 transition-colors">
                            <h2 className="text-xl font-bold text-[#222222] dark:text-white mb-4">Prix (FCFA)</h2>
                            <div className="grid grid-cols-2 gap-2">
                                <input 
                                    type="number" 
                                    placeholder="Min" 
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    onBlur={() => applyFilters()}
                                    className="w-full text-xs bg-white dark:bg-[#252525] border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-[#B03A2E] focus:border-[#B03A2E] transition-colors"
                                />
                                <input 
                                    type="number" 
                                    placeholder="Max" 
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    onBlur={() => applyFilters()}
                                    className="w-full text-xs bg-white dark:bg-[#252525] border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-[#B03A2E] focus:border-[#B03A2E] transition-colors"
                                />
                            </div>
                        </div>

                        {/* Rating Filter */}
                        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-gray-800 mb-6 transition-colors">
                            <h2 className="text-xl font-bold text-[#222222] dark:text-white mb-4">Note minimale</h2>
                            <div className="space-y-2">
                                {[5, 4, 3, 2].map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => {
                                            const newRating = selectedRating == r ? null : r;
                                            setSelectedRating(newRating);
                                            applyFilters({ rating: newRating });
                                        }}
                                        className={`w-full flex items-center justify-between text-xs p-2 rounded-lg transition-colors ${selectedRating == r ? 'bg-[#B03A2E]/10 text-[#B03A2E] font-bold' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                                    >
                                        <div className="flex items-center">
                                            <div className="flex text-[#B03A2E] mr-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <svg key={star} xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${star <= r ? 'fill-current' : 'text-gray-200 dark:text-gray-800'}`} viewBox="0 0 20 20" fill="currentColor">
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
                        <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-800 mb-6 group transition-all duration-500 hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)]">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-[#111111] dark:text-white font-extrabold text-[12px] uppercase tracking-[0.15em]">À Proximité</h3>
                                <div className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                            </div>
                            
                            <div className="relative w-full h-52 bg-gray-50 dark:bg-[#252525] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-inner group/map transition-colors">
                                {(() => {
                                    const mapCenter = activeShop && activeShop.latitude && activeShop.longitude
                                        ? { lat: parseFloat(activeShop.latitude), lng: parseFloat(activeShop.longitude) }
                                        : userLocation;

                                    if (!mapCenter) {
                                        return (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-[#252525] text-gray-400 transition-colors">
                                                <div className="w-5 h-5 border-2 border-gray-200 dark:border-gray-700 border-t-[#B03A2E] rounded-full animate-spin mb-2"></div>
                                                <span className="text-[9px] font-bold uppercase tracking-widest opacity-50">Localisation...</span>
                                            </div>
                                        );
                                    }

                                    return (
                                        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                                            <Map
                                                defaultCenter={mapCenter}
                                                center={mapCenter}
                                                defaultZoom={14}
                                                gestureHandling={'none'}
                                                disableDefaultUI={true}
                                                mapId="bf50a87343b44b8b"
                                            >
                                                <AdvancedMarker position={mapCenter}>
                                                    <div className="relative flex items-center justify-center">
                                                        <div className="absolute w-8 h-8 bg-[#B03A2E]/20 rounded-full animate-ping"></div>
                                                        <div className="w-4 h-4 bg-[#B03A2E] border-2 border-white rounded-full shadow-lg z-10"></div>
                                                    </div>
                                                </AdvancedMarker>
                                            </Map>
                                        </APIProvider>
                                    );
                                })()}

                                {/* Premium Overlay */}
                                <Link
                                    href={route('map')}
                                    prefetch
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
                            <p className="mt-4 text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed transition-colors">
                                Retrouvez les boutiques et offres exclusives à proximité de vous à Lomé.
                            </p>
                        </div>
                    </aside>

                    {/* Main Content (Products) */}
                    <div className="flex-1 flex flex-col">

                        {/* Top Bar */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-gray-100 dark:border-gray-800 pb-6 gap-4">
                            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                <span className="text-[#B03A2E] font-extrabold text-lg">{sortedProducts.length}</span> produits trouvés
                            </div>
                            <div className="flex items-center bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-800 p-1 rounded-xl shadow-sm">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 hidden md:inline-block border-r border-gray-100 dark:border-gray-800 mr-2">Trier par :</span>
                                {['Tous', 'Prix', 'Nouveautés'].map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => setActiveSort(opt)}
                                        className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${activeSort === opt
                                            ? 'bg-[#8B4513] text-white shadow-md'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-[#8B4513] hover:bg-gray-50 dark:hover:bg-white/5'
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
                                {sortedProducts.slice(0, visibleCount).map((product, index) => (
                                    <CategoryProductCard key={product.id} product={product} index={index} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#1e1e1e] rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4 text-gray-400 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 012-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white transition-colors">Aucun produit trouvé</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-center max-w-xs transition-colors">Nous n'avons pas encore de produits dans cette catégorie. Revenez bientôt !</p>
                            </div>
                        )}

                        {/* Load More Button */}
                        {visibleCount < sortedProducts.length && (
                            <div className="flex justify-center pb-12">
                                <button 
                                    onClick={() => setVisibleCount(prev => prev + 12)}
                                    className="bg-[#70360f] text-white font-bold text-sm px-10 py-3 rounded-md hover:bg-[#5a2b0c] transition-colors flex items-center shadow-md"
                                >
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

