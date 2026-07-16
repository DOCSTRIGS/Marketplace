import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Head, Link, router } from '@inertiajs/react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import ThemeToggle from '@/Components/ThemeToggle';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Composant pour l'affichage de l'itinéraire
function Directions({ driverPos, shopPos, clientPos, orderStatus }) {
    const map = useMap();
    const routesLibrary = useMapsLibrary('routes');
    const [directionsService, setDirectionsService] = useState();
    const [directionsRenderer, setDirectionsRenderer] = useState();
    const [routes, setRoutes] = useState([]);

    useEffect(() => {
        if (!routesLibrary || !map) return;
        setDirectionsService(new routesLibrary.DirectionsService());
        setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map, suppressMarkers: true, polylineOptions: { strokeColor: '#8B4513', strokeWeight: 5 } }));
    }, [routesLibrary, map]);

    useEffect(() => {
        if (!directionsService || !directionsRenderer) return;

        let destination = shopPos;
        
        if (orderStatus === 'shipped') {
            destination = clientPos;
        }

        directionsService.route({
            origin: driverPos,
            destination: destination,
            travelMode: google.maps.TravelMode.DRIVING
        }).then(response => {
            directionsRenderer.setDirections(response);
            setRoutes(response.routes);
        }).catch(err => console.error("Directions request failed", err));
    }, [directionsService, directionsRenderer, driverPos, shopPos, clientPos, orderStatus]);

    return null;
}
export default function DriverDashboard({ auth, activeOrders = [], availableOrders = [], history = [], stats, flash }) {
    const [status, setStatus] = useState(auth.user.driver_status || 'available');
    const [activeTab, setActiveTab] = useState('active'); // active, available, history
    const [isMapExpanded, setIsMapExpanded] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [deliveryCodes, setDeliveryCodes] = useState({}); // {orderId: code}

    const MAP_COLORS = {
        driver: '#27AE60',
        shop: '#C0392B',
        client: '#2980B9'
    };

    const handleAcceptOrder = (orderId) => {
        setProcessing(true);
        axios.post(route('driver.orders.accept', orderId))
            .then(() => window.location.reload())
            .finally(() => setProcessing(false));
    };

    const handleUpdateStatus = (orderId, newStatus) => {
        const code = deliveryCodes[orderId];
        if (newStatus === 'delivered' && (!code || code.length < 4)) {
            alert("Veuillez saisir le code de livraison du client.");
            return;
        }

        setProcessing(true);
        axios.post(route('driver.orders.update-status', orderId), { 
            status: newStatus,
            delivery_code: code
        })
            .then(() => window.location.reload())
            .finally(() => setProcessing(false));
    };

    const [driverPos, setDriverPos] = useState({ lat: 6.1378, lng: 1.2125 });

    // Throttle network sends: the map redraws on every raw GPS reading (can fire
    // multiple times/sec), but we only need to hit the server (DB write +
    // websocket broadcast) every few seconds while idle on the dashboard.
    const lastSentAtRef = useRef(0);
    const GPS_MIN_INTERVAL_MS = 8000;

    // Tracking GPS Real-time avec Résilience Réseau
    useEffect(() => {
        if (!navigator.geolocation) return;

        const sendLocation = (pos, force = false) => {
            const now = Date.now();
            if (!force && now - lastSentAtRef.current < GPS_MIN_INTERVAL_MS) return;
            lastSentAtRef.current = now;

            if (!navigator.onLine) {
                console.log("Offline: Position sauvegardée localement");
                localStorage.setItem('pending_gps_update', JSON.stringify(pos));
                return;
            }

            axios.post(route('driver.update-location'), {
                latitude: pos.lat,
                longitude: pos.lng,
                order_id: activeOrders.length > 0 ? activeOrders[0].id : null
            })
            .then(() => localStorage.removeItem('pending_gps_update'))
            .catch(err => console.error("GPS Update Error:", err));
        };

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const newPos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                setDriverPos(newPos);
                sendLocation(newPos);
            },
            (error) => console.error("Geolocation Error:", error),
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );

        // Synchronisation automatique au retour du réseau
        const handleOnline = () => {
            const pending = localStorage.getItem('pending_gps_update');
            if (pending) {
                console.log("Online: Synchronisation de la position en attente...");
                sendLocation(JSON.parse(pending));
            }
        };

        window.addEventListener('online', handleOnline);

        // Real-time Dashboard Updates
        if (typeof window !== 'undefined' && window.Echo) {
            window.Echo.channel('orders')
                .listen('.order.updated', (e) => {
                    // The 'orders' channel is platform-wide (every shop/driver), but a
                    // full dashboard reload re-runs the whole controller (stats, active
                    // orders, history...). Only reload when the event is actually
                    // relevant to this driver: a new unassigned mission becoming
                    // available, or one of this driver's own orders changing.
                    const isNewAvailableMission = e.order.status === 'preparing' && !e.order.driver_id;
                    const isOwnOrder = e.order.driver_id === auth.user.id;
                    if (!isNewAvailableMission && !isOwnOrder) return;

                    console.log("Relevant order update, refreshing dashboard...", e);
                    router.reload({
                        preserveScroll: true,
                        onSuccess: () => console.log("Dashboard refreshed successfully")
                    });
                });
        }

        return () => {
            navigator.geolocation.clearWatch(watchId);
            window.removeEventListener('online', handleOnline);
            if (window.Echo) window.Echo.leave('orders');
        };
    }, [activeOrders, router]);
    return (
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
            <div className="min-h-screen bg-white dark:bg-[#121212] text-[#1a1a1a] dark:text-white antialiased transition-colors duration-300">
                <Head title="LoméShop — Espace Livreur" />

                <header className="h-20 px-4 md:px-6 xl:px-12 flex flex-col gap-4 md:flex-row md:items-center justify-between border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-[#1e1e1e] z-50 transition-colors duration-300">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                        <h1 className="text-2xl font-black text-[#D35400] dark:text-[#E67E22] tracking-tighter">LoméShop</h1>
                        <nav className="flex flex-col gap-3 md:flex-row md:items-center">
                            <div className="flex gap-6 text-[11px] font-black uppercase text-spacing">
                                <Link href={route('driver.dashboard')} prefetch className="text-[#8B4513] border-b-2 border-[#8B4513] pb-1">Missions</Link>
                                <Link href={route('driver.history')} prefetch className="text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white">Historique</Link>
                                <Link href={route('driver.profile')} prefetch className="text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white">Mon Profil</Link>
                            </div>
                            <div className="w-[1px] h-6 bg-gray-200 dark:bg-gray-800 mx-2" />
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${status === 'available' ? 'bg-green-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-700'}`}></div>
                                <select 
                                    value={status} 
                                    onChange={(e) => {
                                        const newStatus = e.target.value;
                                        setStatus(newStatus);
                                        axios.post(route('driver.update-availability'), { status: newStatus })
                                            .then(() => console.log("Status updated to", newStatus))
                                            .catch(err => console.error("Failed to update status", err));
                                    }}
                                    className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest focus:ring-0 cursor-pointer text-gray-900 dark:text-white"
                                >
                                    <option value="available" className="bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white">En ligne / Prêt</option>
                                    <option value="offline" className="bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white">Hors service</option>
                                </select>
                            </div>
                        </nav>
                    </div>

                    {/* Flash Messages Alert */}
                    {(flash?.error || flash?.success) && (
                        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[60] w-full max-w-md animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className={`p-4 rounded-2xl shadow-2xl border ${flash?.error ? 'bg-red-500 border-red-600' : 'bg-green-600 border-green-700'} text-white flex items-center gap-3`}>
                                <span className="text-xl">{flash?.error ? '⚠️' : '✅'}</span>
                                <p className="text-[10px] font-black uppercase tracking-widest flex-1">{flash?.error || flash?.success}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3 md:gap-6">
                        <ThemeToggle />
                        {stats && (
                            <Link href={route('driver.profile')} prefetch className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-full hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors" title={`${stats.reviews_count || 0} avis`}>
                                <span className="text-amber-500 text-sm">★</span>
                                <span className="text-[11px] font-black text-amber-700 dark:text-amber-400">{stats.rating}</span>
                            </Link>
                        )}
                        <div className="flex flex-col text-right">
                            <span className="text-[10px] font-black uppercase text-gray-400">Employé ID</span>
                            <span className="text-[11px] font-bold text-gray-900 dark:text-white">#DRV-{auth.user.id.toString().padStart(4, '0')}</span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden border border-gray-100 dark:border-gray-800">
                            <img src={auth.user.profile_photo_url} className="w-full h-full object-cover" alt="" />
                        </div>
                    </div>
                </header>

                <main className="p-0 flex flex-col lg:flex-row h-[calc(100vh-80px)] overflow-hidden">
                    {/* Left Sidebar: Order Lists */}
                    <div className="w-full lg:w-[400px] max-h-[45vh] lg:max-h-none border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-800 flex flex-col bg-white dark:bg-[#1e1e1e] z-10 shadow-xl transition-colors duration-300">
                        <div className="p-6 border-b border-gray-50 dark:border-gray-800">
                            <div className="flex bg-gray-50 dark:bg-gray-800 p-1 rounded-xl">
                                {[
                                    { id: 'active', label: 'En cours', count: activeOrders.length },
                                    { id: 'available', label: 'Libres', count: availableOrders.length },
                                    { id: 'history', label: 'Fait', count: history.length }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex-1 py-3 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white dark:bg-[#121212] shadow-sm text-[#8B4513] dark:text-[#E67E22]' : 'text-gray-400 dark:text-gray-500'}`}
                                    >
                                        {tab.label}
                                        {tab.count > 0 && (
                                            <span className="ml-1.5 bg-[#8B4513] text-white px-1.5 py-0.5 rounded-full text-[7px]">
                                                {tab.count}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#FAF9F8] dark:bg-[#151515]">
                            {activeTab === 'active' && (
                                activeOrders.length > 0 ? activeOrders.map(order => (
                                    <div key={order.id} className="bg-white dark:bg-[#1e1e1e] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 space-y-5 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="text-xs font-black uppercase tracking-tight text-gray-900 dark:text-white">{order.order_number}</h4>
                                                <p className="text-[9px] text-[#8B4513] dark:text-[#E67E22] font-black uppercase">{order.shop.name}</p>
                                            </div>
                                            <span className="bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded text-[7px] font-black uppercase">{order.status}</span>
                                        </div>
                                        <div className="space-y-4 border-l-2 border-gray-100 dark:border-gray-800 ml-1 pl-4">
                                            <div>
                                                <p className="text-[7px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5">Collecte</p>
                                                <p className="text-[10px] font-bold leading-tight text-gray-900 dark:text-gray-250">{order.shop.address || 'Lomé, Togo'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[7px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5">Destination</p>
                                                <p className="text-[10px] font-bold leading-tight text-gray-900 dark:text-gray-250">{order.delivery_address}</p>
                                            </div>
                                        </div>
                                        <div className="pt-2 space-y-4">
                                            {order.status === 'accepted' || order.status === 'preparing' ? (
                                                <button 
                                                    disabled={processing}
                                                    onClick={() => handleUpdateStatus(order.id, 'shipped')}
                                                    className="w-full py-3 bg-[#8B4513] text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-[#8B4513]/20"
                                                >
                                                    Confirmer Récupération
                                                </button>
                                            ) : (
                                                <div className="space-y-3">
                                                    <div className="bg-gray-50 dark:bg-[#121212] p-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                                                        <p className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 text-center">Code de livraison (Client)</p>
                                                        <input 
                                                            type="text" 
                                                            maxLength="4"
                                                            placeholder="0 0 0 0"
                                                            value={deliveryCodes[order.id] || ''}
                                                            onChange={(e) => setDeliveryCodes({...deliveryCodes, [order.id]: e.target.value})}
                                                            className="w-full text-center text-xl font-black tracking-[0.5em] bg-transparent border-none focus:ring-0 placeholder-gray-200 dark:placeholder-gray-700 text-gray-900 dark:text-white"
                                                        />
                                                    </div>
                                                    <button 
                                                        disabled={processing || !deliveryCodes[order.id] || deliveryCodes[order.id].length < 4}
                                                        onClick={() => handleUpdateStatus(order.id, 'delivered')}
                                                        className="w-full py-4 bg-green-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-green-500/20 disabled:opacity-50 disabled:shadow-none transition-all"
                                                    >
                                                        Confirmer la Livraison
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <EmptyState message="Aucune mission active" />
                                )
                            )}

                            {activeTab === 'available' && (
                                availableOrders.length > 0 ? availableOrders.map(order => (
                                    <div key={order.id} className="bg-white dark:bg-[#1e1e1e] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-[12px] font-black tracking-tighter text-gray-400 dark:text-gray-500 uppercase">Nouvelle Mission</span>
                                            <span className="text-[7px] font-black bg-[#8B4513]/10 text-[#8B4513] px-2 py-0.5 rounded uppercase">Urgente</span>
                                        </div>
                                        <p className="text-[9px] font-black uppercase text-gray-400 dark:text-gray-500 mb-1">Boutique</p>
                                        <p className="text-[11px] font-bold mb-4 text-gray-900 dark:text-white">{order.shop.name}</p>
                                        <button 
                                            disabled={processing}
                                            onClick={() => handleAcceptOrder(order.id)}
                                            className="w-full py-3 bg-white dark:bg-transparent border-2 border-[#8B4513] text-[#8B4513] dark:text-[#E67E22] rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-[#8B4513] hover:text-white dark:hover:text-white transition-all"
                                        >
                                            Prendre la commande
                                        </button>
                                    </div>
                                )) : (
                                    <EmptyState message="En attente de commandes..." />
                                )
                            )}

                            {activeTab === 'history' && (
                                history.length > 0 ? history.map(order => (
                                    <div key={order.id} className="flex items-center gap-3 p-4 bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-50 dark:border-gray-800">
                                        <div className="w-8 h-8 bg-green-50 dark:bg-green-950/30 rounded-lg flex items-center justify-center text-green-600 dark:text-green-400 font-black text-[10px]">
                                            ✓
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[9px] font-black uppercase tracking-tight text-gray-900 dark:text-white">{order.order_number}</p>
                                            <p className="text-[7px] text-gray-400 dark:text-gray-500 font-bold uppercase">{new Date(order.updated_at).toLocaleTimeString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase">Livré</p>
                                        </div>
                                    </div>
                                )) : (
                                    <EmptyState message="Aucun historique" />
                                )
                            )}
                        </div>
                    </div>

                    {/* Right: Map Section */}
                    <div className="flex-1 relative">
                        <Map
                             defaultCenter={driverPos}
                             defaultZoom={14}
                             mapId="bf51a910020fa257"
                             disableDefaultUI={false}
                             className="w-full h-full"
                        >
                            {activeOrders.length > 0 && (
                                <Directions 
                                    driverPos={driverPos} 
                                    shopPos={{ lat: parseFloat(activeOrders[0].shop.latitude), lng: parseFloat(activeOrders[0].shop.longitude) }} 
                                    clientPos={{ lat: parseFloat(activeOrders[0].user.last_latitude) || 6.1366, lng: parseFloat(activeOrders[0].user.last_longitude) || 1.2222 }}
                                    orderStatus={activeOrders[0].status}
                                />
                            )}

                            <AdvancedMarker position={driverPos}>
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-full animate-ping opacity-20 w-8 h-8 -translate-x-1.5 -translate-y-1.5 bg-green-500"></div>
                                    <div className="w-6 h-6 rounded-full border-4 border-white dark:border-gray-800 shadow-2xl bg-green-600 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                    </div>
                                </div>
                            </AdvancedMarker>
                        </Map>

                        {/* Quick Overlay Info if Active Order */}
                        {activeOrders.length > 0 && (
                            <div className="absolute bottom-8 left-8 right-8 bg-white/90 dark:bg-[#1e1e1e]/90 backdrop-blur-md rounded-[32px] p-6 shadow-2xl border border-white/20 dark:border-gray-800 flex items-center justify-between max-w-2xl mx-auto">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-[#8B4513] rounded-2xl flex items-center justify-center text-white">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/></svg>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-[#8B4513] dark:text-[#E67E22]">Mission en cours</p>
                                        <h3 className="text-sm font-black uppercase tracking-tight text-gray-900 dark:text-white">Direction : {activeOrders[0].delivery_address}</h3>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Temps estimé</p>
                                    <p className="text-lg font-black tracking-tighter text-gray-900 dark:text-white">12 MIN</p>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </APIProvider>
    );
}

function EmptyState({ message }) {
    return (
        <div className="flex flex-col items-center justify-center h-full py-10 text-gray-400 dark:text-gray-500 opacity-60">
            <p className="text-[9px] font-black uppercase tracking-widest">{message}</p>
        </div>
    );
}
