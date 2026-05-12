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
    useMapsLibrary
} from '@vis.gl/react-google-maps';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Custom Polyline component for Google Maps
const Polyline = (props) => {
    const map = useMap();
    const [polyline, setPolyline] = useState(null);

    useEffect(() => {
        if (!map || !window.google) return;
        
        try {
            const line = new google.maps.Polyline({
                path: props.path,
                geodesic: true,
                strokeColor: '#96370B',
                strokeOpacity: 0.8,
                strokeWeight: 4,
                icons: [{
                    icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 4 },
                    offset: '0',
                    repeat: '20px'
                }],
            });

            line.setMap(map);
            setPolyline(line);

            return () => {
                line.setMap(null);
            };
        } catch (e) {
            console.error("Polyline error:", e);
        }
    }, [map, props.path]);

    return null;
};

export default function Tracking({ order: initialOrder }) {
    const [order, setOrder] = useState(initialOrder);

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

    const routeCoords = useMemo(() => [
        shopLocation,
        { lat: 6.1450, lng: 1.2200 },
        deliveryLocation,
        { lat: 6.1600, lng: 1.1900 },
        customerLocation
    ], [customerLocation, shopLocation]);

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
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Enregistré</span>
                                            </div>
                                        </div>
                                        <div className="relative pl-8">
                                            <div className={`absolute -left-[11px] top-0 w-5 h-5 rounded-full border-4 transition-all duration-500 ${['Préparé', 'Expédié', 'En route', 'Livré'].includes(order.status) ? 'bg-[#8B4513] border-[#8B4513]/20' : 'bg-white dark:bg-[#1e1e1e] border-gray-100 dark:border-gray-800'}`}></div>
                                            <div className="flex flex-col -mt-1">
                                                <span className={`font-black text-xs ${['Préparé', 'Expédié', 'En route', 'Livré'].includes(order.status) ? 'text-gray-900 dark:text-white' : 'text-gray-300 dark:text-gray-700'}`}>Préparation terminée</span>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Logistique boutique</span>
                                            </div>
                                        </div>
                                        <div className="relative pl-8">
                                            <div className={`absolute -left-[11px] top-0 w-5 h-5 rounded-full border-4 transition-all duration-500 ${['En route', 'Livré'].includes(order.status) ? 'bg-[#8B4513] border-[#8B4513]/20 scale-125' : 'bg-white dark:bg-[#1e1e1e] border-gray-100 dark:border-gray-800'}`}></div>
                                            <div className="flex flex-col -mt-1">
                                                <span className={`font-black text-xs ${['En route', 'Livré'].includes(order.status) ? 'text-gray-900 dark:text-white' : 'text-gray-300 dark:text-gray-700'}`}>Livreur en route</span>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Suivi temps réel</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="pt-10 space-y-4">
                                    <button className="w-full py-5 bg-gray-900 dark:bg-[#8B4513] text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all">
                                        Contacter le livreur
                                    </button>
                                    <button className="w-full py-5 bg-white dark:bg-transparent text-gray-400 dark:text-gray-500 font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] border-2 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                                        Signaler un problème
                                    </button>
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
                            disableDefaultUI={true}
                        >
                            {order && (
                                <>
                                    {/* Shop Marker */}
                                    <AdvancedMarker position={shopLocation}>
                                        <div className="flex flex-col items-center">
                                            <div className="mb-1 px-2 py-1 bg-white dark:bg-[#1e1e1e] rounded-full text-[8px] font-black shadow-lg text-[#8B4513] border border-[#8B4513]/10 uppercase">BOUTIQUE</div>
                                            <div className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 shadow-xl flex items-center justify-center bg-white dark:bg-[#1e1e1e] overflow-hidden transition-transform hover:scale-110">
                                                <img src={order.shop?.image || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" />
                                            </div>
                                        </div>
                                    </AdvancedMarker>

                                    {/* User Marker */}
                                    <AdvancedMarker position={customerLocation}>
                                        <div className="flex flex-col items-center">
                                            <div className="mb-1 px-2 py-1 bg-[#8B4513] rounded-full text-[8px] font-black shadow-lg text-white uppercase tracking-tighter">MA POSITION</div>
                                            <div className="w-8 h-8 rounded-full border-4 border-white dark:border-gray-800 shadow-xl flex items-center justify-center bg-[#8B4513]"></div>
                                        </div>
                                    </AdvancedMarker>

                                    {/* Courier Marker */}
                                    <AdvancedMarker position={deliveryLocation}>
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-[#8B4513] rounded-full animate-ping opacity-25 scale-150"></div>
                                            <div className="w-7 h-7 bg-[#8B4513] rounded-full border-4 border-white dark:border-gray-800 shadow-2xl relative z-10 flex items-center justify-center">
                                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                            </div>
                                        </div>
                                    </AdvancedMarker>

                                    <Polyline path={routeCoords} />
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
