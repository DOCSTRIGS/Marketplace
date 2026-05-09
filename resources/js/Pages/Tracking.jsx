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

export default function Tracking({ order }) {
    // Auto-refresh every 10 seconds to simulate real-time tracking
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ preserveScroll: true });
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const orderDetails = order ? {
        id: order.order_number,
        product: order.order_items?.[0]?.product?.name || 'Produit',
        shop: order.shop?.name || 'Boutique',
        date: new Date(order.created_at).toLocaleDateString('fr-FR'),
        estimatedDelivery: order.status === 'Livré' ? 'Livré le ' + new Date(order.updated_at).toLocaleDateString('fr-FR') : 'Aujourd\'hui, 15:00 - 15:30',
        status: order.status
    } : {
        id: '#CMD-1023',
        product: 'iPhone 13 Pro Max - 256Go',
        shop: 'Tech Store Lomé',
        date: '06 Mai 2026',
        estimatedDelivery: 'Aujourd\'hui, 14:45 - 15:15',
        status: 'En route'
    };

    const deliveryPerson = {
        name: 'Komi (Livreur)',
        phone: '+228 90 12 34 56',
        vehicle: 'Moto (TG-1234-A)',
        rating: 4.8
    };

    const shopLocation = order?.shop?.latitude ? { lat: parseFloat(order.shop.latitude), lng: parseFloat(order.shop.longitude) } : { lat: 6.1366, lng: 1.2222 };
    const deliveryLocation = { lat: 6.1550, lng: 1.2150 };
    const [customerLocation, setCustomerLocation] = useState({ lat: 6.1666, lng: 1.1833 });

    useEffect(() => {
        if (!navigator.geolocation) return;
        const watchId = navigator.geolocation.watchPosition(
            (p) => setCustomerLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
            (err) => console.warn("Tracking geolocation error:", err),
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

    const timeline = [
        { title: 'Commande confirmée', time: '10:30', completed: true },
        { title: 'Commande préparée par la boutique', time: '11:45', completed: orderDetails.status !== 'En préparation' },
        { title: 'Colis récupéré par le livreur', time: '13:15', completed: orderDetails.status === 'Expédié' || orderDetails.status === 'En route' || orderDetails.status === 'Livré' },
        { title: 'En cours de livraison', time: '14:20', completed: orderDetails.status === 'Expédié' || orderDetails.status === 'En route', active: orderDetails.status === 'Expédié' || orderDetails.status === 'En route' },
        { title: 'Livré', time: 'Terminé', completed: orderDetails.status === 'Livré', active: orderDetails.status === 'Livré' }
    ];

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
            <Head title="Suivi de commande" />
            <Navbar />

            <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Link href="/" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                        </Link>
                        <h1 className="text-3xl font-extrabold text-gray-900">Suivi de commande <span className="text-[#96370B]">{orderDetails.id}</span></h1>
                    </div>
                    <p className="text-gray-600 font-medium">
                        {orderDetails.status === 'En préparation' && 'La boutique prépare votre colis avec soin.'}
                        {(orderDetails.status === 'Expédié' || orderDetails.status === 'En route') && 'Komi a récupéré votre colis et arrive vers vous !'}
                        {orderDetails.status === 'Livré' && 'Votre commande a été livrée. Bonne dégustation/utilisation !'}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Status Card */}
                        <div className={`p-6 rounded-3xl border-2 transition-all duration-500 ${
                            order.status === 'Livré' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'
                        }`}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-lg text-gray-900">Statut Actuel</h3>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                    orderDetails.status === 'Livré' ? 'bg-green-500 text-white' : 'bg-[#96370B] text-white'
                                }`}>
                                    {orderDetails.status}
                                </span>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 font-medium">Produit</span>
                                    <span className="font-bold text-gray-900">{orderDetails.product}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 font-medium">Boutique</span>
                                    <span className="font-bold text-gray-900">{orderDetails.shop}</span>
                                </div>
                                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-gray-900 font-bold">Arrivée prévue</span>
                                    <span className="font-black text-[#96370B]">{orderDetails.estimatedDelivery}</span>
                                </div>
                            </div>
                        </div>

                        {/* Livreur Info */}
                        {orderDetails.status !== 'En préparation' && (
                            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center">
                                <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden mr-4 border-2 border-[#96370B]/20">
                                    <img src="https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&w=150&q=80" alt="Livreur" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 text-sm">{deliveryPerson.name}</h4>
                                    <div className="flex items-center gap-1 text-xs text-yellow-500 font-bold">
                                        <span>⭐ {deliveryPerson.rating}</span>
                                        <span className="text-gray-300">•</span>
                                        <span className="text-gray-500 uppercase">{deliveryPerson.vehicle}</span>
                                    </div>
                                </div>
                                <a href={`tel:${deliveryPerson.phone}`} className="w-12 h-12 bg-[#96370B] text-white rounded-2xl flex items-center justify-center hover:bg-[#7a2d09] transition-all shadow-lg shadow-[#96370B]/20 active:scale-95">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                </a>
                            </div>
                        )}

                        {/* Timeline */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-lg text-gray-900 mb-8">Étapes de la commande</h3>
                            <div className="relative border-l-2 border-gray-100 ml-4 space-y-10">
                                {timeline.map((step, idx) => (
                                    <div key={idx} className="relative pl-8">
                                        <div className={`absolute -left-[11px] top-0 w-5 h-5 rounded-full border-4 transition-all duration-500 ${
                                            step.active ? 'bg-[#96370B] border-[#96370B]/20 scale-125' :
                                            step.completed ? 'bg-[#96370B] border-[#96370B]/20' : 'bg-white border-gray-100'
                                        }`}></div>
                                        <div className="flex flex-col -mt-1">
                                            <span className={`font-bold text-sm transition-colors ${step.completed ? 'text-gray-900' : 'text-gray-300'}`}>{step.title}</span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{step.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Map */}
                    <div className="lg:col-span-2 h-[600px] lg:h-auto min-h-[600px] rounded-3xl overflow-hidden shadow-xl border border-white relative bg-white">
                        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                            <Map
                                defaultCenter={deliveryLocation}
                                defaultZoom={13}
                                mapId="tracking-map"
                                mapTypeControl={false}
                                streetViewControl={false}
                                fullscreenControl={false}
                            >
                                <AdvancedMarker position={shopLocation}>
                                    <div className="bg-white p-2 rounded-lg shadow-md border border-gray-100 flex items-center gap-2">
                                        <span className="text-lg">🏪</span>
                                        <span className="text-[10px] font-bold text-gray-700">BOUTIQUE</span>
                                    </div>
                                </AdvancedMarker>

                                <AdvancedMarker position={customerLocation}>
                                    <div className="bg-[#96370B] p-2 rounded-lg shadow-md border border-white flex items-center gap-2">
                                        <span className="text-lg">🏠</span>
                                        <span className="text-[10px] font-bold text-white">MOI</span>
                                    </div>
                                </AdvancedMarker>

                                <AdvancedMarker position={deliveryLocation}>
                                    <div className="relative flex items-center justify-center">
                                        <div className="absolute w-12 h-12 bg-[#96370B]/20 rounded-full animate-ping"></div>
                                        <div className="bg-white p-2.5 rounded-full shadow-xl border-2 border-[#96370B] z-10">
                                            <img src="https://cdn-icons-png.flaticon.com/512/2972/2972185.png" alt="Livreur" className="w-8 h-8" />
                                        </div>
                                    </div>
                                </AdvancedMarker>

                                <Polyline path={routeCoords} />
                            </Map>
                        </APIProvider>

                        <div className="absolute top-6 left-6 z-[10] bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-white flex items-center gap-3">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                            <span className="font-extrabold text-gray-900 text-sm tracking-tight uppercase">
                                {orderDetails.status === 'Expédié' || orderDetails.status === 'En route' ? 'KOMI EST EN ROUTE' : orderDetails.status === 'Livré' ? 'COMMANDE LIVRÉE' : 'EN ATTENTE DU LIVREUR'}
                            </span>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
