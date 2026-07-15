import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import Navbar from '@/Components/Navbar';
import { 
    APIProvider, 
    Map, 
    AdvancedMarker, 
    useMap, 
    useMapsLibrary,
    ControlPosition,
    MapControl
} from '@vis.gl/react-google-maps';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Ultra-safe currency formatter
const formatCurrency = (num) => {
    if (num === null || num === undefined) return '0';
    try {
        const n = typeof num === 'string' ? parseFloat(num.replace(/[^0-9.]/g, '')) : num;
        if (isNaN(n)) return '0';
        return new Intl.NumberFormat('fr-FR').format(n);
    } catch (e) {
        return '0';
    }
};

const ShopMarker = ({ shop, isActive, onClick }) => {
    if (!shop || !shop.coordinates || typeof shop.coordinates.lat !== 'number' || typeof shop.coordinates.lng !== 'number') return null;
    
    return (
        <AdvancedMarker 
            position={{ lat: shop.coordinates.lat, lng: shop.coordinates.lng }} 
            onClick={onClick}
            zIndex={isActive ? 1000 : 1}
        >
            <div className="relative flex flex-col items-center cursor-pointer group">
                {/* Premium Floating Tooltip displaying the Shop Name on hover / active */}
                <div className={`absolute -top-9 bg-[#1a1a1a]/95 dark:bg-[#0c0c0c]/95 backdrop-blur-md text-white text-[11px] font-black px-3 py-1.5 rounded-xl shadow-2xl border border-white/10 whitespace-nowrap pointer-events-none transition-all duration-200 transform -translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 z-[2000] flex items-center gap-1.5 ${isActive ? '!opacity-100 !translate-y-0 border-[#B03A2E]/50 !bg-[#B03A2E]' : ''}`}>
                    {shop.name}
                    {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                    )}
                </div>

                {/* Sleek Teardrop Location Marker Pin */}
                <div className={`transition-all duration-300 transform ${isActive ? 'scale-125 -translate-y-1' : 'group-hover:scale-110 group-hover:-translate-y-0.5'}`}>
                    <svg width="18" height="22" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
                        <path 
                            d="M12 0C5.37 0 0 5.37 0 12c0 9 12 18 12 18s12-9 12-18c0-6.63-5.37-12-12-12z" 
                            fill={isActive ? '#B03A2E' : '#E74C3C'} 
                            stroke="#FFFFFF"
                            strokeWidth="2"
                            className="transition-colors duration-300"
                        />
                        <circle cx="12" cy="11" r="4.5" fill="#FFFFFF" />
                    </svg>
                </div>

                {/* Micro-Animation Glow underneath active pin */}
                {isActive && (
                    <div className="absolute -bottom-1 w-2.5 h-1 bg-[#B03A2E]/40 rounded-full blur-xs animate-ping"></div>
                )}
            </div>
        </AdvancedMarker>
    );
};

const MapInner = ({ shops, activeShopId, setActiveShopId, userLocation, setUserLocation, followUser, setFollowUser, onShopSelect }) => {
    const map = useMap();
    const hasCenteredRef = useRef(false);
    const lastShopsRef = useRef(shops);
    
    // Auto-pan to user whenever position changes if followUser is active
    useEffect(() => {
        if (map && userLocation?.lat && followUser) {
            map.panTo(userLocation);
            if (!hasCenteredRef.current) {
                map.setZoom(15);
                hasCenteredRef.current = true;
            }
        }
    }, [map, userLocation, followUser]);

    // Auto-pan and zoom in close to the active/selected shop
    useEffect(() => {
        if (!map || !activeShopId || !Array.isArray(shops)) return;
        
        const activeShop = shops.find(s => s.id === activeShopId);
        if (activeShop?.coordinates?.lat && typeof activeShop.coordinates.lat === 'number') {
            const targetCoords = { lat: activeShop.coordinates.lat, lng: activeShop.coordinates.lng };
            
            // Pan to the active shop
            map.panTo(targetCoords);
            
            // Zoom in close to see street level and shop details
            map.setZoom(17); // Zoom level 17 for premium street-level close-up detail
            
            // Turn off user following so the map doesn't snap back to the user
            setFollowUser(false);
        }
    }, [map, activeShopId, shops, setFollowUser]);

    useEffect(() => {
        if (!map || !window.google || !Array.isArray(shops) || shops.length === 0) return;

        const shopsChanged = shops !== lastShopsRef.current;
        if (followUser && !shopsChanged) return;
        if (hasCenteredRef.current && !shopsChanged) return;

        try {
            const bounds = new window.google.maps.LatLngBounds();
            let valid = false;
            shops.forEach(s => {
                if (s?.coordinates?.lat && typeof s.coordinates.lat === 'number') {
                    bounds.extend({ lat: s.coordinates.lat, lng: s.coordinates.lng });
                    valid = true;
                }
            });
            if (userLocation?.lat) {
                bounds.extend(userLocation);
                valid = true;
            }
            if (valid) {
                map.fitBounds(bounds, { padding: 80 });
                lastShopsRef.current = shops;
            }
        } catch (e) {
            console.warn("Map bounds error:", e);
        }
    }, [map, shops, userLocation, followUser]);

    return (
        <>
            <MapControl position={ControlPosition.RIGHT_BOTTOM}>
                <div className="p-6 flex flex-col gap-3">
                    <button 
                        onClick={() => {
                            setFollowUser(!followUser);
                            if (!followUser && userLocation) map?.panTo(userLocation);
                        }}
                        className={`w-12 h-12 rounded-full shadow-2xl flex items-center justify-center transition-all border border-gray-100 dark:border-gray-800 active:scale-90 ${followUser ? 'bg-[#B03A2E] text-white' : 'bg-white dark:bg-[#1e1e1e] text-gray-400'}`}
                        title={followUser ? "Arrêter de suivre" : "Suivre ma position"}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={followUser ? 'animate-pulse' : ''}>
                            <path d="M12 2L12 22M2 12L22 12" strokeLinecap="round"/>
                            <circle cx="12" cy="12" r="5" fill="currentColor" fillOpacity={followUser ? 0.3 : 0}/>
                        </svg>
                    </button>
                    
                    <button 
                        onClick={() => userLocation && map?.panTo(userLocation)}
                        className="w-12 h-12 bg-white dark:bg-[#1e1e1e] text-[#B03A2E] rounded-full shadow-2xl flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-all border border-gray-100 dark:border-gray-800 active:scale-90"
                        title="Ma position"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>
                    </button>
                </div>
            </MapControl>

            {userLocation?.lat && (
                <AdvancedMarker 
                    position={userLocation} 
                    draggable={true} 
                    onDragEnd={(e) => {
                        const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
                        setUserLocation(newPos);
                    }}
                >
                    <div className="relative flex items-center justify-center">
                        <div className="absolute w-12 h-12 bg-blue-500/20 rounded-full animate-ping"></div>
                        <div className="w-5 h-5 bg-blue-600 border-2 border-white rounded-full shadow-lg z-10"></div>
                    </div>
                </AdvancedMarker>
            )}

            {Array.isArray(shops) && shops.map(s => s && (
                <ShopMarker key={s.id} shop={s} isActive={activeShopId === s.id} onClick={() => onShopSelect(s)} />
            ))}
        </>
    );
};

const OrderModal = ({ product, userLocation, onClose }) => {
    if (!product) return null;
    const { data, setData, post, processing, success } = useForm({
        product_id: product.id,
        quantity: 1,
        delivery_address: 'Totsi, Lomé (Ma position actuelle)',
        latitude: null,
        longitude: null,
    });

    useEffect(() => {
        if (userLocation && userLocation.lat && userLocation.lng) {
            setData({
                ...data,
                latitude: userLocation.lat,
                longitude: userLocation.lng,
                delivery_address: `Ma position (Lat: ${userLocation.lat.toFixed(4)}, Lng: ${userLocation.lng.toFixed(4)})`
            });
        }
    }, [userLocation]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('orders.store'), {
            onSuccess: () => onClose(),
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-colors">
            <div className="bg-white dark:bg-[#1e1e1e] w-full max-w-md rounded-3xl overflow-hidden shadow-2xl transform transition-all animate-in zoom-in-95 duration-200">
                <div className="relative h-32 bg-[#B03A2E] flex items-center justify-center">
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <div className="text-center">
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter">Finaliser la commande</h3>
                        <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mt-1">Paiement à la livraison</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="flex gap-4 items-center p-3 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-gray-800 transition-colors">
                        <img src={product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=100&q=80'} className="w-12 h-12 rounded-xl object-cover" />
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">{product.name}</h4>
                            <p className="text-[#D35400] font-black text-xs">{new Intl.NumberFormat('fr-FR').format(product.price)} F</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Quantité</label>
                            <div className="flex items-center gap-4">
                                <button type="button" onClick={() => setData('quantity', Math.max(1, data.quantity - 1))} className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-center font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">-</button>
                                <span className="text-lg font-black text-gray-900 dark:text-white w-8 text-center">{data.quantity}</span>
                                <button type="button" onClick={() => setData('quantity', data.quantity + 1)} className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-center font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">+</button>
                                <div className="ml-auto text-right">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Total</span>
                                    <span className="text-sm font-black text-gray-900 dark:text-white">{new Intl.NumberFormat('fr-FR').format(product.price * data.quantity)} F</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Adresse de livraison</label>
                            <textarea 
                                value={data.delivery_address}
                                onChange={e => setData('delivery_address', e.target.value)}
                                className="w-full bg-gray-50 dark:bg-[#252525] border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-2xl text-sm p-4 focus:ring-[#B03A2E] focus:border-[#B03A2E] transition-colors"
                                rows="2"
                                placeholder="Précisez votre emplacement..."
                            ></textarea>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={processing}
                        className="w-full py-4 bg-[#B03A2E] text-white font-black rounded-2xl uppercase tracking-tighter shadow-xl shadow-red-900/20 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {processing ? 'Traitement...' : 'Confirmer la commande'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const ShopDrawer = ({ shop, onClose, onOrderProduct }) => {
    if (!shop) return null;

    return (
        <div className="absolute inset-y-0 right-0 w-full md:w-[450px] bg-white dark:bg-[#1e1e1e] shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col border-l border-gray-100 dark:border-gray-800 transition-colors">
            {/* Header */}
            <div className="relative h-48 flex-shrink-0">
                <img src={shop.image} alt={shop.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="absolute bottom-6 left-6 right-6 text-white">
                    <h3 className="text-2xl font-black uppercase tracking-tighter mb-1 truncate">{shop.name}</h3>
                    <div className="flex items-center gap-2 text-white/80 text-xs font-bold truncate">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                        <span className="truncate">{shop.address}</span>
                    </div>
                </div>
            </div>

            {/* Catalog */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-[#121212] transition-colors">
                <div className="flex items-center justify-between mb-6">
                    <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Catalogue Produits</h4>
                    <span className="text-[10px] font-bold px-2 py-1 bg-white dark:bg-[#1e1e1e] border border-gray-100 dark:border-gray-800 rounded text-gray-500 dark:text-gray-400 uppercase transition-colors">
                        {shop.matching_products?.length || 0} Articles
                    </span>
                </div>

                <div className="space-y-4">
                    {shop.matching_products && shop.matching_products.length > 0 ? (
                        shop.matching_products.map(product => (
                            <div key={product.id} className="bg-white dark:bg-[#1e1e1e] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex gap-4">
                                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                        <img 
                                            src={product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80'} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                        <div>
                                            <h5 className="text-sm font-bold text-gray-900 dark:text-white truncate">{product.name}</h5>
                                            <p className="text-[#D35400] font-black text-xs mt-1">
                                                {new Intl.NumberFormat('fr-FR').format(product.price)} F
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => onOrderProduct(product)}
                                            className="text-[10px] font-black text-[#B03A2E] uppercase flex items-center gap-1 hover:gap-2 transition-all mt-2"
                                        >
                                            Commander <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-[#252525] rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-gray-800">
                                <svg className="w-8 h-8 text-gray-300 dark:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                            </div>
                            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter">Pas de produits disponibles</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Action */}
            <div className="p-6 bg-white dark:bg-[#1e1e1e] border-t border-gray-100 dark:border-gray-800 transition-colors">
                <button className="w-full py-4 bg-[#B03A2E] text-white font-black rounded-2xl uppercase tracking-tighter shadow-xl shadow-red-900/20 active:scale-[0.98] transition-all">
                    Visiter la boutique
                </button>
            </div>
        </div>
    );
};




export default function MapView({ initialShops }) {
    const [shops, setShops] = useState(Array.isArray(initialShops) ? initialShops : []);
    const [activeShopId, setActiveShopId] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [followUser, setFollowUser] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState(null);
    const [selectedShop, setSelectedShop] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const activeShop = selectedShop || shops.find(s => s.id === activeShopId);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError("La géolocalisation n'est pas supportée.");
            return;
        }

        let isMounted = true;
        console.log("Starting robust geolocation watch...");

        const startWatching = (highAccuracy = true) => {
            return navigator.geolocation.watchPosition(
                (p) => {
                    if (!isMounted) return;
                    const newPos = { lat: p.coords.latitude, lng: p.coords.longitude };
                    console.log(`GPS position update (${highAccuracy ? 'High' : 'Low'} Accuracy):`, newPos);
                    setUserLocation(newPos);
                    setError(null);
                },
                (err) => {
                    if (!isMounted) return;
                    console.warn(`Geolocation error (${highAccuracy ? 'High' : 'Low'}):`, err.message);
                    
                    if (highAccuracy && (err.code === 3 || err.code === 2)) {
                        // If high accuracy timed out or failed, try low accuracy
                        console.log("Switching to low accuracy fallback...");
                        startWatching(false);
                    } else {
                        setUserLocation(prev => prev || { lat: 6.1372, lng: 1.2125 });
                        if (err.code === 1) setError("PERMISSION_DENIED");
                    }
                },
                {
                    enableHighAccuracy: highAccuracy,
                    maximumAge: 0,
                    timeout: highAccuracy ? 8000 : 15000
                }
            );
        };

        const watchId = startWatching(true);

        // Safety fallback: if after 5 seconds we still have nothing, show default map 
        // but keep the watcher running in case it eventually finds the user
        const safetyTimer = setTimeout(() => {
            if (isMounted) {
                setUserLocation(prev => prev || { lat: 6.1372, lng: 1.2125 });
            }
        }, 5000);

        return () => {
            isMounted = false;
            clearTimeout(safetyTimer);
            navigator.geolocation.clearWatch(watchId);
        };
    }, []);


    useEffect(() => {
        if (!navigator.permissions || !navigator.permissions.query) return;

        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
            const updateStatus = () => {
                console.log("Geolocation permission status:", result.state);
                if (result.state === 'denied') {
                    setError('PERMISSION_DENIED');
                } else if (result.state === 'prompt') {
                    setError('PERMISSION_PROMPT');
                }
            };
            updateStatus();
            result.onchange = updateStatus;
        });
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        const timer = setTimeout(() => {
            const q = searchQuery.trim();
            if (q.length > 0) {
                setIsSearching(true);
                axios.get(route('map'), { 
                    params: { search: q }, 
                    headers: { 'X-Requested-With': 'XMLHttpRequest' },
                    signal: controller.signal 
                })
                .then(res => {
                    if (Array.isArray(res.data)) {
                        setShops(res.data);
                        if (res.data.length === 1 && res.data[0]?.id) {
                            setActiveShopId(res.data[0].id);
                        }
                    }
                    setIsSearching(false);
                })
                .catch(err => {
                    if (!axios.isCancel(err)) {
                        console.error("Search API error:", err);
                        setIsSearching(false);
                    }
                });
            } else {
                setShops(Array.isArray(initialShops) ? initialShops : []);
                setIsSearching(false);
            }
        }, 500);
        return () => { clearTimeout(timer); controller.abort(); };
    }, [searchQuery, initialShops]);


    const calculateDistance = useCallback((target) => {
        if (!userLocation?.lat || !target?.lat) return null;
        try {
            const R = 6371;
            const dLat = (target.lat - userLocation.lat) * Math.PI / 180;
            const dLon = (target.lng - userLocation.lng) * Math.PI / 180;
            const a = Math.sin(dLat/2)**2 + Math.cos(userLocation.lat*Math.PI/180) * Math.cos(target.lat*Math.PI/180) * Math.sin(dLon/2)**2;
            return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(1);
        } catch (e) { return null; }
    }, [userLocation]);

    const sortedShops = useMemo(() => {
        if (!Array.isArray(shops)) return [];
        if (!userLocation) return shops;
        return [...shops].filter(s => s?.coordinates?.lat).sort((a, b) => {
            const da = parseFloat(calculateDistance(a.coordinates)) || 999;
            const db = parseFloat(calculateDistance(b.coordinates)) || 999;
            return da - db;
        });
    }, [shops, userLocation, calculateDistance]);


    if (error && error !== 'PERMISSION_DENIED' && error !== 'PERMISSION_PROMPT') {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50 p-10 text-center">
                <div>
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Oups ! Une erreur est survenue</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button onClick={() => window.location.reload()} className="bg-[#B03A2E] text-white px-6 py-2 rounded-xl font-bold">Recharger la page</button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-white dark:bg-[#121212] overflow-hidden transition-colors duration-300">
            <Head title="Carte Marketplace" />
            <Navbar elegant />
            <div className="flex-1 flex overflow-hidden">
                <aside className="w-full md:w-[400px] flex flex-col bg-white dark:bg-[#1e1e1e] border-r border-gray-100 dark:border-gray-800 z-10 shadow-lg transition-colors">
                    <div className="p-6 pb-2">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">LoméShop Map</h2>
                            <span className="bg-gray-100 dark:bg-white/5 text-[10px] font-bold px-3 py-1 rounded-full text-gray-500 dark:text-gray-400 transition-colors">{shops.length} Boutiques</span>
                        </div>

                        {/* Geolocation Status */}
                        <div className="mb-6 space-y-3">
                            {error === 'PERMISSION_DENIED' ? (
                                <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20 space-y-3 transition-colors">
                                    <div className="flex items-center gap-2 text-red-700">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        <span className="text-xs font-bold uppercase tracking-tight">Accès bloqué</span>
                                    </div>
                                    <p className="text-[10px] text-red-600 leading-tight">
                                        Veuillez cliquer sur l'icône de cadenas en haut à gauche de cette page et autoriser la "Localisation".
                                    </p>
                                    <button onClick={() => window.location.reload()} className="w-full py-2 bg-red-600 text-white text-[10px] font-black rounded-lg uppercase">Recharger la page</button>
                                </div>
                            ) : error === 'PERMISSION_PROMPT' ? (
                                <div className="p-4 bg-[#B03A2E]/5 dark:bg-[#B03A2E]/10 rounded-2xl border border-[#B03A2E]/20 dark:border-[#B03A2E]/30 space-y-3 transition-colors">
                                    <div className="flex items-center gap-2 text-[#B03A2E]">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                                        <span className="text-xs font-bold uppercase tracking-tight">Autorisation requise</span>
                                    </div>
                                    <p className="text-[10px] text-gray-600 dark:text-gray-400 leading-tight">
                                        Cliquez sur le bouton ci-dessous pour autoriser LoméShop à utiliser votre position.
                                    </p>
                                    <button 
                                        onClick={() => {
                                            navigator.geolocation.getCurrentPosition(
                                                (p) => setUserLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
                                                (err) => console.warn(err)
                                            );
                                        }} 
                                        className="w-full py-2 bg-[#B03A2E] text-white text-[10px] font-black rounded-lg uppercase"
                                    >
                                        Autoriser la position
                                    </button>
                                </div>
                            ) : userLocation?.lat === 6.1372 && userLocation?.lng === 1.2125 ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20 transition-colors">
                                        <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></div>
                                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-500 uppercase">Position par défaut (Lomé Centre)</span>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            if (navigator.geolocation) {
                                                navigator.geolocation.getCurrentPosition(
                                                    (p) => setUserLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
                                                    () => alert("Impossible de détecter votre position. Vérifiez vos paramètres Windows."),
                                                    { enableHighAccuracy: true }
                                                );
                                            }
                                        }}
                                        className="w-full py-2 bg-[#B03A2E] text-white text-[10px] font-black rounded-lg uppercase flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                                        Réessayer la détection
                                    </button>
                                </div>
                            ) : userLocation ? (
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20 transition-colors">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                    <span className="text-[10px] font-bold text-green-700 dark:text-green-500 uppercase">Position GPS active</span>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-gray-800 transition-colors">
                                        <div className="w-1.5 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
                                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Recherche de position...</span>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            setError(null);
                                            if (navigator.geolocation) {
                                                navigator.geolocation.getCurrentPosition(
                                                    (p) => setUserLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
                                                    (err) => {
                                                        if (err.code === 1) setError('PERMISSION_DENIED');
                                                        else alert("Erreur: " + err.message);
                                                    },
                                                    { enableHighAccuracy: false } // Try low accuracy for faster response
                                                );
                                            }
                                        }}
                                        className="w-full py-2 border-2 border-[#B03A2E] text-[#B03A2E] text-[10px] font-black rounded-lg uppercase"
                                    >
                                        Forcer la détection
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="relative mb-4">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                {isSearching ? <div className="w-4 h-4 border-2 border-[#B03A2E] border-t-transparent rounded-full animate-spin"></div> : <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
                            </div>
                            <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); if(activeShopId) setActiveShopId(null); }} placeholder="Rechercher un produit..." className="w-full bg-gray-50 dark:bg-[#252525] border-transparent dark:border-gray-800 text-gray-900 dark:text-white rounded-2xl py-4 pl-12 pr-4 text-sm focus:bg-white dark:focus:bg-[#252525] focus:ring-2 focus:ring-[#B03A2E]/20 transition-all outline-none" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 space-y-4 pb-6">
                        {activeShop ? (
                            <div className="bg-white dark:bg-[#1e1e1e] rounded-3xl border-2 border-[#B03A2E] p-5 shadow-2xl transition-colors">
                                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                                    <img src={activeShop.image} className="w-14 h-14 rounded-2xl object-cover shadow-sm" alt="" />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-900 dark:text-white truncate">{activeShop.name}</h3>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400">{activeShop.address}</p>
                                    </div>
                                    <button onClick={() => setActiveShopId(null)} className="p-1 hover:bg-gray-100 rounded-full"><svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
                                </div>
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                    {activeShop.matching_products?.map(p => p && (
                                        <Link key={p.id} href={route('product.show', p.id)} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 group transition-colors">
                                            <img src={p.images?.[0] || 'https://via.placeholder.com/150'} className="w-10 h-10 rounded-lg object-cover" alt="" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-[#B03A2E]">{p.name}</p>
                                                <p className="text-[10px] font-black text-[#B03A2E]">{formatCurrency(p.price)} FCFA</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                {sortedShops.map(s => {
                                    const d = calculateDistance(s.coordinates);
                                    return (
                                        <div key={s.id} onClick={() => setActiveShopId(s.id)} className="bg-white dark:bg-[#1e1e1e] rounded-3xl p-4 flex gap-4 cursor-pointer border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group">
                                            <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-800 transition-colors"><img src={s.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" /></div>
                                            <div className="flex-1 flex flex-col justify-between py-1">
                                                <div><h4 className="font-bold text-gray-900 dark:text-white text-sm leading-tight truncate">{s.name}</h4><p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium truncate">{s.address}</p></div>
                                                <div className="flex justify-between items-center"><span className="text-[#B03A2E] font-bold text-sm">{s.price}</span><span className="text-[10px] bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full text-gray-500 dark:text-gray-400 transition-colors">{d ? `${d} km` : '...'}</span></div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {sortedShops.length === 0 && !isSearching && (
                                    <div className="text-center py-10"><h3 className="font-bold text-gray-900 dark:text-white mb-1">Aucun résultat</h3><p className="text-xs text-gray-500 dark:text-gray-400">Essayez une autre recherche.</p></div>
                                )}
                            </>
                        )}
                    </div>
                </aside>

                <main className="flex-1 relative bg-gray-50 dark:bg-[#121212] overflow-hidden transition-colors">
                    <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={['places']}>
                        <Map 
                            defaultCenter={{ lat: 6.1372, lng: 1.2125 }} 
                            defaultZoom={13} 
                            mapId="bf50a87343b44b8b" 
                            disableDefaultUI={true}
                            onClick={(e) => {
                                const newPos = { lat: e.detail.latLng.lat, lng: e.detail.latLng.lng };
                                setUserLocation(newPos);
                                setFollowUser(false);
                            }}
                        >
                            <MapInner 
                                shops={shops} 
                                activeShopId={activeShopId} 
                                setActiveShopId={setActiveShopId} 
                                userLocation={userLocation} 
                                setUserLocation={setUserLocation}
                                followUser={followUser} 
                                setFollowUser={setFollowUser} 
                                onShopSelect={(s) => {
                                    setActiveShopId(s.id);
                                    setSelectedShop(s);
                                }}
                            />
                        </Map>
                    </APIProvider>

                    {/* Shop Catalog Drawer */}
                    {selectedShop && (
                        <div className="absolute inset-0 z-50 pointer-events-none">
                            <div className="absolute inset-0 bg-black/20 pointer-events-auto" onClick={() => setSelectedShop(null)}></div>
                            <div className="pointer-events-auto">
                                <ShopDrawer 
                                    shop={selectedShop} 
                                    onClose={() => setSelectedShop(null)} 
                                    onOrderProduct={(p) => setSelectedProduct(p)}
                                />
                            </div>
                        </div>
                    )}

                    {selectedProduct && (
                        <OrderModal 
                            product={selectedProduct}
                            userLocation={userLocation}
                            onClose={() => setSelectedProduct(null)} 
                        />
                    )}
                </main>
            </div>
        </div>
    );
}
