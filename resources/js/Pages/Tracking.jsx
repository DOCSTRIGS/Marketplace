import React, { useState, useEffect, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import { 
    APIProvider, 
    Map, 
    AdvancedMarker, 
    InfoWindow,
    useMap,
    useMapsLibrary,
    MapControl
} from '@vis.gl/react-google-maps';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Control to recenter map on user
const LocateMeControl = ({ location }) => {
    const map = useMap();
    if (!map || !location) return null;

    return (
        <MapControl position={window.google.maps.ControlPosition.RIGHT_BOTTOM}>
            <button
                onClick={() => {
                    map.panTo(location);
                    map.setZoom(15);
                }}
                className="w-10 h-10 bg-white dark:bg-[#1e1e1e] rounded-full shadow-lg flex items-center justify-center mr-[10px] mb-[100px] border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#252525] transition-all hover:scale-105 active:scale-95"
                title="Voir ma position"
            >
                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
                </svg>
            </button>
        </MapControl>
    );
};

// Component to render real Google Maps directions (following roads)
const Directions = ({ origin, destination, waypoints }) => {
    const map = useMap();
    const routesLibrary = useMapsLibrary('routes');
    const [directionsService, setDirectionsService] = useState();
    const [directionsRenderer, setDirectionsRenderer] = useState();

    useEffect(() => {
        if (!routesLibrary || !map) return;
        setDirectionsService(new routesLibrary.DirectionsService());
        
        // We use the default Google Maps rendering for the line (which includes the nice outline automatically)
        setDirectionsRenderer(new routesLibrary.DirectionsRenderer({
            map,
            suppressMarkers: true, // We keep our custom beautiful markers
            preserveViewport: true, // Don't auto-zoom, let the map handle its default center/zoom
        }));
    }, [routesLibrary, map]);

    useEffect(() => {
        if (!directionsService || !directionsRenderer || !origin || !destination) return;

        const request = {
            origin: origin,
            destination: destination,
            waypoints: waypoints?.map(w => ({ location: w, stopover: false })) || [],
            travelMode: window.google.maps.TravelMode.DRIVING,
        };

        directionsService.route(request, (response, status) => {
            if (status === 'OK') {
                directionsRenderer.setDirections(response);
            } else {
                console.error("Directions request failed due to " + status);
            }
        });
    }, [directionsService, directionsRenderer, origin, destination, waypoints]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (directionsRenderer) {
                directionsRenderer.setMap(null);
            }
        }
    }, [directionsRenderer]);

    return null;
};

export default function Tracking({ order }) {

    const shopLocation = order?.shop?.latitude ? { lat: parseFloat(order.shop.latitude), lng: parseFloat(order.shop.longitude) } : { lat: 6.1366, lng: 1.2222 };
    const deliveryLocation = { lat: 6.1550, lng: 1.2150 };
    const [customerLocation, setCustomerLocation] = useState({ lat: 6.1666, lng: 1.1833 });

    useEffect(() => {
        if (!navigator.geolocation) return;
        const watchId = navigator.geolocation.watchPosition(
            (p) => setCustomerLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
            null,
            { enableHighAccuracy: true }
        );
        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    // Auto-rafraîchissement toutes les 10 secondes pour voir le changement de statut en direct
    useEffect(() => {
        if (!order) return;
        const interval = setInterval(() => {
            router.reload({ only: ['order'], preserveScroll: true });
        }, 10000);
        return () => clearInterval(interval);
    }, [order]);

    const routeCoords = useMemo(() => [
        shopLocation,
        { lat: 6.1450, lng: 1.2200 },
        deliveryLocation,
        { lat: 6.1600, lng: 1.1900 },
        customerLocation
    ], [customerLocation, shopLocation]);

    // Déterminer l'étape actuelle
    const isStepActive = (statusList) => statusList.includes(order?.status);

    return (
        <div className="h-screen flex flex-col bg-white dark:bg-[#121212] overflow-hidden font-sans transition-colors duration-300">
            <Head title="Suivi Live — LoméShop" />
            <Navbar />

            <div className="flex-1 flex overflow-hidden">
                {/* LEFT SIDEBAR: CONTENT */}
                <aside className="w-full md:w-[400px] flex flex-col bg-white dark:bg-[#1e1e1e] border-r border-gray-100 dark:border-gray-800 z-10 shadow-xl overflow-y-auto transition-colors">
                    <div className="p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Suivi Commande</h2>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${order ? 'bg-green-500 text-white animate-pulse' : 'bg-gray-100 text-gray-400'}`}>
                                {order ? 'Live' : 'Inactif'}
                            </span>
                        </div>

                        {!order ? (
                            <div className="py-20 text-center">
                                <div className="w-20 h-20 bg-gray-50 dark:bg-[#252525] rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100 dark:border-gray-800">
                                    <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                                </div>
                                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tighter">Aucune commande</h3>
                                <p className="text-xs text-gray-400 font-medium leading-relaxed px-10">
                                    Vous n'avez pas de livraison en cours de suivi pour le moment.
                                </p>
                                <Link href={route('home')} className="mt-8 inline-block px-8 py-4 bg-[#8B4513] text-white text-[10px] font-black rounded-xl uppercase tracking-widest">
                                    Faire un achat
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-10">
                                {/* Product Summary */}
                                <div className="bg-gray-50 dark:bg-white/5 rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
                                    <div className="flex gap-4 mb-6">
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm border-2 border-white dark:border-gray-800">
                                            <img src={order.order_items?.[0]?.product?.images?.[0] || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Article</p>
                                            <h4 className="text-sm font-black text-gray-900 dark:text-white leading-tight">{order.order_items?.[0]?.product?.name || 'Produit'}</h4>
                                            <p className="text-xs font-bold text-[#8B4513] mt-1">{order.order_number}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Boutique</span>
                                        <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tighter">{order.shop?.name || 'Boutique'}</span>
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div className="space-y-8 pl-2">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Étapes de livraison</h3>
                                    <div className="relative border-l-2 border-gray-100 dark:border-gray-800 ml-3 space-y-12 pb-2">
                                        <div className="relative pl-8">
                                            <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full border-4 bg-[#8B4513] border-[#8B4513]/20"></div>
                                            <div className="flex flex-col -mt-1">
                                                <span className="font-black text-xs text-gray-900 dark:text-white">Commande validée</span>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Paiement reçu</span>
                                            </div>
                                        </div>
                                        <div className="relative pl-8">
                                            <div className={`absolute -left-[11px] top-0 w-5 h-5 rounded-full border-4 transition-all duration-500 ${isStepActive(['preparing', 'shipped', 'delivered']) ? 'bg-[#8B4513] border-[#8B4513]/20' : 'bg-white dark:bg-[#1e1e1e] border-gray-100 dark:border-gray-800'}`}></div>
                                            <div className="flex flex-col -mt-1">
                                                <span className={`font-black text-xs ${isStepActive(['preparing', 'shipped', 'delivered']) ? 'text-gray-900 dark:text-white' : 'text-gray-300 dark:text-gray-700'}`}>En préparation</span>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Le vendeur prépare votre colis</span>
                                            </div>
                                        </div>
                                        <div className="relative pl-8">
                                            <div className={`absolute -left-[11px] top-0 w-5 h-5 rounded-full border-4 transition-all duration-500 ${isStepActive(['shipped', 'delivered']) ? 'bg-[#8B4513] border-[#8B4513]/20' : 'bg-white dark:bg-[#1e1e1e] border-gray-100 dark:border-gray-800'}`}></div>
                                            <div className="flex flex-col -mt-1">
                                                <span className={`font-black text-xs ${isStepActive(['shipped', 'delivered']) ? 'text-gray-900 dark:text-white' : 'text-gray-300 dark:text-gray-700'}`}>Expédiée</span>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Le livreur a récupéré le colis</span>
                                            </div>
                                        </div>
                                        <div className="relative pl-8">
                                            <div className={`absolute -left-[11px] top-0 w-5 h-5 rounded-full border-4 transition-all duration-500 ${isStepActive(['delivered']) ? 'bg-green-500 border-green-500/20' : 'bg-white dark:bg-[#1e1e1e] border-gray-100 dark:border-gray-800'}`}></div>
                                            <div className="flex flex-col -mt-1">
                                                <span className={`font-black text-xs ${isStepActive(['delivered']) ? 'text-green-600' : 'text-gray-300 dark:text-gray-700'}`}>Livrée</span>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Profitez de votre achat !</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="pt-10 space-y-4">
                                    <Link 
                                        href={route('chat.show', { shop: order.shop_id })}
                                        className="block w-full py-5 bg-gray-900 dark:bg-[#8B4513] text-white text-center font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all"
                                    >
                                        Contacter la boutique
                                    </Link>
                                    <Link 
                                        href={route('chat.show', { shop: order.shop_id })}
                                        className="block w-full py-5 bg-white dark:bg-transparent text-gray-400 dark:text-gray-500 text-center font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] border-2 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                                    >
                                        Signaler un problème
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </aside>

                {/* RIGHT SIDE: MAP */}
                <main className="flex-1 relative bg-gray-50 dark:bg-[#121212] overflow-hidden">
                    <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={['places']}>
                        <Map
                            defaultCenter={deliveryLocation}
                            defaultZoom={13}
                            mapId="bf50a87343b44b8b"
                        >
                            {order && (
                                <>
                                    {/* Shop Marker */}
                                    <AdvancedMarker position={shopLocation}>
                                        <div className="flex flex-col items-center">
                                            <div className="mb-1 px-2 py-0.5 bg-[#EA4335] rounded-full text-[8px] font-black shadow-lg text-white uppercase tracking-tighter">BOUTIQUE</div>
                                            <div className="w-5 h-5 rounded-full border-[3px] border-white dark:border-gray-800 shadow-xl flex items-center justify-center bg-[#EA4335]"></div>
                                        </div>
                                    </AdvancedMarker>

                                    {/* User Marker */}
                                    <AdvancedMarker position={customerLocation}>
                                        <div className="flex flex-col items-center">
                                            <div className="mb-1 px-2 py-0.5 bg-[#4285F4] rounded-full text-[8px] font-black shadow-lg text-white uppercase tracking-tighter">MA POSITION</div>
                                            <div className="w-5 h-5 rounded-full border-[3px] border-white dark:border-gray-800 shadow-xl flex items-center justify-center bg-[#4285F4]"></div>
                                        </div>
                                    </AdvancedMarker>

                                    <Directions 
                                        origin={shopLocation} 
                                        destination={customerLocation} 
                                    />
                                    <LocateMeControl location={customerLocation} />
                                </>
                            )}
                        </Map>
                    </APIProvider>

                    {/* LIVE OVERLAY */}
                    {order && (
                        <div className="absolute top-8 left-8 bg-white/95 dark:bg-[#1e1e1e]/95 backdrop-blur-md px-6 py-3 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-4 z-10">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="font-black text-gray-900 dark:text-white text-[10px] tracking-widest uppercase">
                                Signal GPS optimisé
                            </span>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
