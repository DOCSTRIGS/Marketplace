import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    APIProvider, 
    Map, 
    AdvancedMarker, 
    useMap,
    Pin
} from '@vis.gl/react-google-maps';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export default function OrderTrackingDrawer({ orderId, isOpen, onClose }) {
    const [trackingData, setTrackingData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && orderId) {
            fetchTracking();
            const interval = setInterval(fetchTracking, 5000); // Poll every 5s
            return () => clearInterval(interval);
        }
    }, [isOpen, orderId]);

    const fetchTracking = () => {
        axios.get(route('orders.tracking', orderId))
            .then(res => {
                setTrackingData(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    return (
        <>
            {/* Overlay */}
            <div 
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            ></div>

            {/* Drawer */}
            <div className={`fixed right-0 top-0 h-full w-full max-w-xl bg-white dark:bg-[#121212] z-[101] shadow-2xl transform transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-white dark:bg-[#121212] z-10">
                        <div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">Suivi de Livraison</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Commande #{orderId}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    {/* Map & Info */}
                    <div className="flex-grow relative bg-gray-100 dark:bg-[#1e1e1e]">
                        {loading ? (
                            <div className="h-full flex items-center justify-center">
                                <div className="w-10 h-10 border-4 border-[#8B4513] border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : trackingData?.status === 'active' ? (
                            <div className="h-full flex flex-col">
                                <div className="flex-grow relative">
                                    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                                        <Map
                                            defaultCenter={{ 
                                                lat: parseFloat(trackingData.shop.lat) || 6.1372, 
                                                lng: parseFloat(trackingData.shop.lng) || 1.2125 
                                            }}
                                            defaultZoom={14}
                                            mapId="bf50a87343b44b8b"
                                            disableDefaultUI={true}
                                        >
                                            <MapContent trackingData={trackingData} />
                                        </Map>
                                    </APIProvider>
                                </div>

                                {/* Status Card */}
                                <div className="p-6 bg-white dark:bg-[#1e1e1e] border-t border-gray-100 dark:border-white/5">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 bg-[#8B4513] rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg">
                                            {trackingData.driver.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Livreur Assigné</p>
                                            <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase">{trackingData.driver.name}</h4>
                                        </div>
                                        <div className="ml-auto text-right">
                                            <span className="px-3 py-1 bg-green-100 text-green-700 text-[8px] font-black rounded-full uppercase tracking-widest">En route</span>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                                        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 leading-relaxed italic">
                                            Le livreur se dirige vers votre boutique pour récupérer la commande. Assurez-vous que tout est prêt !
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-10 text-center">
                                <div className="w-20 h-20 bg-orange-50 dark:bg-orange-900/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                    <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                                <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">Recherche de Livreur...</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto italic">
                                    Le système intelligent cherche le livreur le plus proche disponible. Cette opération peut prendre quelques instants.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

function MapContent({ trackingData }) {
    const map = useMap();

    useEffect(() => {
        if (!map || !trackingData) return;
        
        const shopLat = parseFloat(trackingData.shop.lat);
        const shopLng = parseFloat(trackingData.shop.lng);
        const driverLat = parseFloat(trackingData.driver?.lat);
        const driverLng = parseFloat(trackingData.driver?.lng);

        const bounds = new window.google.maps.LatLngBounds();
        
        if (isFinite(shopLat) && isFinite(shopLng)) {
            bounds.extend({ lat: shopLat, lng: shopLng });
        }

        if (trackingData.driver && isFinite(driverLat) && isFinite(driverLng)) {
            bounds.extend({ lat: driverLat, lng: driverLng });
        }

        // Only fit bounds if they are not empty
        if (!bounds.isEmpty()) {
            map.fitBounds(bounds, { padding: 80 });
        }
    }, [map, trackingData]);

    const shopPos = { lat: parseFloat(trackingData.shop.lat), lng: parseFloat(trackingData.shop.lng) };
    const driverPos = trackingData.driver ? { lat: parseFloat(trackingData.driver.lat), lng: parseFloat(trackingData.driver.lng) } : null;

    return (
        <>
            {/* Shop Marker */}
            {isFinite(shopPos.lat) && isFinite(shopPos.lng) && (
                <AdvancedMarker position={shopPos}>
                    <div className="relative group">
                        <div className="bg-white dark:bg-[#1e1e1e] px-3 py-1 rounded-full shadow-xl border border-gray-100 dark:border-gray-800 mb-2 whitespace-nowrap">
                            <p className="text-[8px] font-black text-[#8B4513] uppercase tracking-widest">Ma Boutique</p>
                        </div>
                        <div className="w-10 h-10 bg-[#8B4513] rounded-2xl flex items-center justify-center text-white shadow-2xl ring-4 ring-white dark:ring-[#121212]">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                        </div>
                    </div>
                </AdvancedMarker>
            )}

            {/* Driver Marker */}
            {driverPos && isFinite(driverPos.lat) && isFinite(driverPos.lng) && (
                <AdvancedMarker position={driverPos}>
                    <div className="relative group flex flex-col items-center">
                        <div className="absolute -top-10 bg-black text-white px-3 py-1 rounded-full shadow-xl whitespace-nowrap">
                            <p className="text-[8px] font-black uppercase tracking-widest">Livreur en route</p>
                        </div>
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white shadow-2xl ring-4 ring-white dark:ring-[#121212] transition-all duration-1000 ease-linear">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                        </div>
                        <div className="w-16 h-16 bg-green-500/20 rounded-full absolute -z-10 animate-ping"></div>
                    </div>
                </AdvancedMarker>
            )}
        </>
    );
}
