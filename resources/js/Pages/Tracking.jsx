import React, { useState, useEffect, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import { 
    APIProvider, 
    Map, 
    AdvancedMarker, 
    useMap,
    useMapsLibrary,
    MapControl
} from '@vis.gl/react-google-maps';
import { useToast } from '@/Contexts/ToastContext';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Component to render real Google Maps directions
const Directions = ({ origin, destination }) => {
    const map = useMap();
    const routesLibrary = useMapsLibrary('routes');
    const [directionsService, setDirectionsService] = useState();
    const [directionsRenderer, setDirectionsRenderer] = useState();
    const [routeInfo, setRouteInfo] = useState(null);

    useEffect(() => {
        if (!routesLibrary || !map) return;
        setDirectionsService(new routesLibrary.DirectionsService());
        setDirectionsRenderer(new routesLibrary.DirectionsRenderer({
            map,
            suppressMarkers: true,
            preserveViewport: true,
            polylineOptions: {
                strokeColor: '#3B82F6',
                strokeOpacity: 0.8,
                strokeWeight: 6,
            }
        }));
    }, [routesLibrary, map]);

    useEffect(() => {
        if (!directionsService || !directionsRenderer || !origin || !destination) return;

        directionsService.route({
            origin: origin,
            destination: destination,
            travelMode: window.google.maps.TravelMode.DRIVING,
        }, (response, status) => {
            if (status === 'OK') {
                directionsRenderer.setDirections(response);
                const leg = response.routes[0].legs[0];
                setRouteInfo({
                    distance: leg.distance.text,
                    duration: leg.duration.text
                });
            }
        });
    }, [directionsService, directionsRenderer, origin, destination]);

    if (!routeInfo) return null;

    return (
        <MapControl position={window.google.maps.ControlPosition.TOP_CENTER}>
            <div className="mt-4 bg-white/95 dark:bg-[#1e1e1e]/95 backdrop-blur-md px-6 py-3 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Distance</span>
                    <span className="text-sm font-black text-gray-900 dark:text-white">{routeInfo.distance}</span>
                </div>
                <div className="w-px h-4 bg-gray-100 dark:bg-gray-800"></div>
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#8B4513]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Arrivée dans</span>
                    <span className="text-sm font-black text-[#8B4513]">{routeInfo.duration}</span>
                </div>
            </div>
        </MapControl>
    );
};

export default function Tracking({ order: initialOrder }) {
    const { addToast } = useToast();
    const [order, setOrder] = useState(initialOrder);
    const [driverLocation, setDriverLocation] = useState(null);
    const [userLocation, setUserLocation] = useState(null);

    const shopLocation = useMemo(() => ({
        lat: parseFloat(order.shop.latitude),
        lng: parseFloat(order.shop.longitude)
    }), [order.shop]);

    useEffect(() => {
        if (!navigator.geolocation) return;
        const watchId = navigator.geolocation.watchPosition(
            (p) => setUserLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
            null,
            { enableHighAccuracy: true }
        );
        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    useEffect(() => {
        if (!order || !window.Echo) return;

        const channel = window.Echo.channel(`order.${order.id}`)
            .listen('.driver.location.updated', (e) => {
                setDriverLocation({ lat: parseFloat(e.latitude), lng: parseFloat(e.longitude) });
            })
            .listen('.order.updated', (e) => {
                setOrder(e.order);
                addToast(`Statut mis à jour : ${e.order.status}`, 'info');
            });

        return () => window.Echo.leave(`order.${order.id}`);
    }, [order.id]);

    const isStepActive = (statusList) => statusList.includes(order?.status);

    return (
        <div className="h-screen flex flex-col bg-white dark:bg-[#121212] overflow-hidden font-sans transition-colors duration-300">
            <Head title="Suivi Live — LoméShop" />
            <Navbar />

            <div className="flex-1 flex overflow-hidden">
                {/* LEFT SIDEBAR: CONTENT (YOUR ORIGINAL DESIGN) */}
                <aside className="w-full md:w-[400px] flex flex-col bg-white dark:bg-[#1e1e1e] border-r border-gray-100 dark:border-gray-800 z-10 shadow-xl overflow-y-auto transition-colors">
                    <div className="p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Suivi Commande</h2>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase bg-green-500 text-white animate-pulse`}>
                                Live
                            </span>
                        </div>

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

                            {/* Delivery Code Display */}
                            {order.delivery_code && order.status !== 'delivered' && (
                                <div className="bg-[#8B4513]/5 border-2 border-[#8B4513]/20 p-6 rounded-[2rem] text-center">
                                    <p className="text-[10px] font-black text-[#8B4513] uppercase tracking-widest mb-2">Votre Code de Réception</p>
                                    <p className="text-3xl font-black text-[#8B4513] tracking-[0.3em]">{order.delivery_code}</p>
                                    <p className="text-[9px] text-gray-400 font-bold mt-4 uppercase">À donner au livreur à l'arrivée</p>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>

                {/* RIGHT SIDE: MAP */}
                <main className="flex-1 relative bg-gray-50 dark:bg-[#121212] overflow-hidden">
                    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                        <Map
                            defaultCenter={shopLocation}
                            defaultZoom={13}
                            mapId="bf50a87343b44b8b"
                        >
                            <AdvancedMarker position={shopLocation}>
                                <div className="w-10 h-10 bg-white rounded-2xl shadow-2xl flex items-center justify-center border-2 border-black overflow-hidden">
                                    <img src={order.shop.logo || order.shop.image} className="w-full h-full object-cover" />
                                </div>
                            </AdvancedMarker>

                            {userLocation && (
                                <AdvancedMarker position={userLocation}>
                                    <div className="relative flex items-center justify-center">
                                        <div className="absolute w-10 h-10 bg-blue-500/30 rounded-full animate-ping"></div>
                                        <div className="relative w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-2xl"></div>
                                    </div>
                                </AdvancedMarker>
                            )}

                            {driverLocation && (
                                <AdvancedMarker position={driverLocation} zIndex={100}>
                                    <div className="flex flex-col items-center">
                                        <div className="bg-black text-white px-3 py-1 rounded-full text-[8px] font-black uppercase mb-1 shadow-2xl">LIVREUR</div>
                                        <div className="w-10 h-10 bg-white rounded-full border-4 border-black shadow-2xl flex items-center justify-center">
                                            <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M19.5,12c-1.38,0-2.5,1.12-2.5,2.5s1.12,2.5,2.5,2.5s2.5-1.12,2.5-2.5S20.88,12,19.5,12z M4.5,12c-1.38,0-2.5,1.12-2.5,2.5 s1.12,2.5,2.5,2.5s2.5-1.12,2.5-2.5S5.88,12,4.5,12z M17,8l-1.5-2H11l1.5,2H17z M18,10l-2-3H10l-2,3H3v2h18v-2H18z" />
                                            </svg>
                                        </div>
                                    </div>
                                </AdvancedMarker>
                            )}

                            <Directions 
                                origin={driverLocation || shopLocation} 
                                destination={userLocation || shopLocation} 
                            />
                        </Map>
                    </APIProvider>

                    {/* LIVE OVERLAY */}
                    <div className="absolute top-8 left-8 bg-white/95 dark:bg-[#1e1e1e]/95 backdrop-blur-md px-6 py-3 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-4 z-10">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="font-black text-gray-900 dark:text-white text-[10px] tracking-widest uppercase">
                            Signal GPS Live
                        </span>
                    </div>
                </main>
            </div>
        </div>
    );
}
