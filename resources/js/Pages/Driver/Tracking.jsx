import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import { 
    APIProvider, 
    Map, 
    AdvancedMarker, 
    useMap,
    useMapsLibrary,
    MapControl,
    ControlPosition
} from '@vis.gl/react-google-maps';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Navigation Directions Component
const Directions = ({ origin, destination, waypoints }) => {
    const map = useMap();
    const routesLibrary = useMapsLibrary('routes');
    const [directionsService, setDirectionsService] = useState();
    const [directionsRenderer, setDirectionsRenderer] = useState();

    useEffect(() => {
        if (!routesLibrary || !map) return;
        setDirectionsService(new routesLibrary.DirectionsService());
        setDirectionsRenderer(new routesLibrary.DirectionsRenderer({
            map,
            suppressMarkers: true,
            polylineOptions: {
                strokeColor: '#2563EB',
                strokeWeight: 8,
                strokeOpacity: 0.8
            }
        }));
    }, [routesLibrary, map]);

    useEffect(() => {
        if (!directionsService || !directionsRenderer || !origin || !destination) return;

        directionsService.route({
            origin,
            destination,
            waypoints: waypoints?.map(w => ({ location: w, stopover: false })) || [],
            travelMode: window.google.maps.TravelMode.DRIVING,
        }, (result, status) => {
            if (status === 'OK') {
                directionsRenderer.setDirections(result);
            }
        });
    }, [directionsService, directionsRenderer, origin, destination, waypoints]);

    return null;
};

export default function DriverTracking({ order }) {
    const [isTracking, setIsTracking] = useState(false);
    const [lastPos, setLastPos] = useState(null);
    const [deliveryCode, setDeliveryCode] = useState('');
    const [statusText, setStatusText] = useState('Prêt à livrer');

    const shopLocation = useMemo(() => ({
        lat: parseFloat(order.shop.latitude),
        lng: parseFloat(order.shop.longitude)
    }), [order.shop]);

    // Smart Destination Logic: 
    // - If status is 'accepted' or 'preparing' -> Destination is the SHOP
    // - If status is 'shipped' -> Destination is the CLIENT
    const clientLocation = useMemo(() => ({
        lat: parseFloat(order.user.last_latitude) || 6.1366,
        lng: parseFloat(order.user.last_longitude) || 1.2222
    }), [order.user]);

    const targetDestination = useMemo(() => {
        if (order.status === 'shipped') return clientLocation;
        return shopLocation;
    }, [order.status, clientLocation, shopLocation]);

    const targetWaypoints = useMemo(() => {
        // If we are already shipped, we don't need the shop waypoint anymore
        if (order.status === 'shipped') return [];
        return []; // Keep it simple for now
    }, [order.status]);

    // Throttle network sends: watchPosition can fire multiple times/sec, but the
    // server only needs a fresh position every few seconds to keep the live map
    // (DB write + Reverb broadcast) reasonably up to date.
    const lastSentAtRef = useRef(0);
    const GPS_MIN_INTERVAL_MS = 5000;

    useEffect(() => {
        let watchId = null;
        let wakeLock = null;

        const requestWakeLock = async () => {
            try {
                if ('wakeLock' in navigator) {
                    wakeLock = await navigator.wakeLock.request('screen');
                }
            } catch (err) {
                console.error(`${err.name}, ${err.message}`);
            }
        };

        if (isTracking) {
            setStatusText(order.status === 'shipped' ? 'Livraison vers le client...' : 'Route vers la boutique...');
            requestWakeLock();
            
            // If the driver starts tracking and status was accepted, move to preparing (or keep shipped if already)
            if (order.status === 'accepted') {
                axios.post(route('driver.update-status', { order: order.id }), {
                    status: 'shipped'
                });
            }

            // Offline Resiliency: Sync pending positions
            const syncPendingPositions = async () => {
                const pending = JSON.parse(localStorage.getItem('pending_positions') || '[]');
                if (pending.length === 0) return;

                try {
                    await axios.post(route('driver.sync-positions'), { positions: pending });
                    localStorage.removeItem('pending_positions');
                    console.log(`Synced ${pending.length} offline positions.`);
                } catch (err) {
                    console.warn("Sync failed, will retry later.");
                }
            };

            syncPendingPositions();

            watchId = navigator.geolocation.watchPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    const newPos = { lat: latitude, lng: longitude };
                    setLastPos(newPos);

                    const now = Date.now();
                    if (now - lastSentAtRef.current < GPS_MIN_INTERVAL_MS) return;
                    lastSentAtRef.current = now;

                    const posData = {
                        order_id: order.id,
                        latitude,
                        longitude,
                        timestamp: new Date().toISOString()
                    };

                    try {
                        // Update server & broadcast via Reverb
                        await axios.post(route('driver.update-location'), posData);
                        // If success, check if we have other pending to sync
                        syncPendingPositions();
                    } catch (err) {
                        // Cache it if failed
                        const pending = JSON.parse(localStorage.getItem('pending_positions') || '[]');
                        pending.push(posData);
                        // Keep only last 50 to avoid bloat
                        if (pending.length > 50) pending.shift();
                        localStorage.setItem('pending_positions', JSON.stringify(pending));
                        console.warn("Position cached offline.");
                    }
                },
                (err) => console.error(err),
                { enableHighAccuracy: true }
            );
        }

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
            if (wakeLock) wakeLock.release();
        };
    }, [isTracking, order.id]);

    const handleFinish = () => {
        if (!deliveryCode) return alert("Code requis !");
        
        axios.post(route('driver.update-status', { order: order.id }), {
            status: 'delivered',
            delivery_code: deliveryCode
        }).then(() => {
            alert("Livraison terminée !");
            router.visit(route('driver.dashboard'));
        }).catch(err => alert(err.response?.data?.message || "Erreur"));
    };

    return (
        <div className="h-screen bg-gray-900 flex flex-col font-sans overflow-hidden">
            <Head title={`Navigation — #${order.order_number}`} />

            <div className="flex-1 relative">
                <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                    <Map
                        defaultCenter={shopLocation}
                        defaultZoom={15}
                        mapId="bf50a87343b44b8b"
                        disableDefaultUI={true}
                    >
                        {/* Current Driver Position */}
                        {lastPos && (
                            <AdvancedMarker position={lastPos} zIndex={100}>
                                <div className="w-10 h-10 bg-blue-600 rounded-full border-4 border-white shadow-2xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                    </svg>
                                </div>
                            </AdvancedMarker>
                        )}

                        {/* Shop Marker */}
                        <AdvancedMarker position={shopLocation}>
                            <div className="bg-white px-3 py-1.5 rounded-full shadow-xl border-2 border-black flex items-center gap-2">
                                <span className="text-lg">🏪</span>
                                <span className="text-[10px] font-black uppercase">Récupération</span>
                            </div>
                        </AdvancedMarker>

                        {/* Destination Marker */}
                        <AdvancedMarker position={clientLocation}>
                            <div className="bg-black text-white px-3 py-1.5 rounded-full shadow-xl flex items-center gap-2">
                                <span className="text-lg">📍</span>
                                <span className="text-[10px] font-black uppercase">Client</span>
                            </div>
                        </AdvancedMarker>

                        <Directions 
                            origin={lastPos || shopLocation} 
                            destination={targetDestination} 
                            waypoints={targetWaypoints}
                        />
                    </Map>
                </APIProvider>

                {/* Top Info Bar */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-10">
                    <div className="bg-black text-white p-6 rounded-[2rem] shadow-2xl flex items-center justify-between border border-white/10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                <span className="text-2xl">⚡</span>
                            </div>
                            <div>
                                <h2 className="text-sm font-black uppercase tracking-tighter">{statusText}</h2>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{order.order_number}</p>
                            </div>
                        </div>
                        <Link href={route('driver.dashboard')} prefetch className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
                            <span className="text-lg">✕</span>
                        </Link>
                    </div>
                </div>

                {/* Bottom Control Card */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-10">
                    <div className="bg-white dark:bg-[#1e1e1e] rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-8 border border-gray-100 dark:border-gray-800 flex flex-col gap-6 transition-colors duration-300">
                        {!isTracking ? (
                            <button 
                                onClick={() => setIsTracking(true)}
                                className="w-full py-6 bg-green-600 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-green-700 transition-all active:scale-95"
                            >
                                Commencer la navigation
                            </button>
                        ) : (
                            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                                <div className="flex flex-col items-center">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Code Client Obligatoire</label>
                                    <input 
                                        type="text" 
                                        value={deliveryCode}
                                        onChange={(e) => setDeliveryCode(e.target.value)}
                                        placeholder="----"
                                        className="w-full text-center text-4xl font-black tracking-[0.5em] py-4 bg-gray-50 dark:bg-[#121212] border-2 border-dashed border-gray-200 dark:border-gray-800 focus:border-blue-600 focus:ring-0 text-gray-900 dark:text-white transition-all placeholder-gray-300 dark:placeholder-gray-700"
                                        maxLength={4}
                                    />
                                </div>
                                <button 
                                    onClick={handleFinish}
                                    className="w-full py-6 bg-blue-600 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-blue-700 transition-all active:scale-95 border-4 border-blue-50 dark:border-blue-950"
                                >
                                    Valider la livraison
                                </button>
                            </div>
                        )}

                        <div className="flex items-center gap-4 pt-2 border-t border-gray-50 dark:border-gray-800">
                            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                                <span className="text-xl">👤</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-black text-gray-900 dark:text-white uppercase">{order.user.name}</p>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase">{order.delivery_address}</p>
                            </div>
                            <a href={`tel:${order.user.phone || '#'}`} className="w-10 h-10 bg-green-500 text-white rounded-xl flex items-center justify-center shadow-md">
                                📞
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
