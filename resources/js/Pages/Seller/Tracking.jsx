import React, { useState, useEffect, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import EmptyState from '@/Components/EmptyState';
import { 
    APIProvider, 
    Map, 
    AdvancedMarker, 
    useMap,
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
    // Auto-refresh every 30 seconds if an order exists
    useEffect(() => {
        if (!order) return;
        const interval = setInterval(() => {
            router.reload({ preserveScroll: true });
        }, 30000);
        return () => clearInterval(interval);
    }, [order]);

    if (!order) {
        return (
            <SellerLayout>
                <Head title="Suivi en direct - LoméShop" />
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                    <EmptyState 
                        title="Aucune commande en cours"
                        description="Il n'y a actuellement aucune commande à suivre en direct. Dès qu'un client passe commande, vous pourrez suivre le trajet du livreur ici."
                    />
                </div>
            </SellerLayout>
        );
    }

    const orderDetails = {
        id: order.order_number,
        product: order.order_items?.[0]?.product?.name || 'Produit',
        customer: order.user?.name || 'Client',
        status: order.status
    };

    const shopLocation = { lat: parseFloat(order.shop?.latitude || 6.1366), lng: parseFloat(order.shop?.longitude || 1.2222) };
    const deliveryLocation = { lat: 6.1550, lng: 1.2150 }; // Simulated delivery position
    const customerLocation = { lat: 6.1666, lng: 1.1833 }; // Target location

    const routeCoords = [shopLocation, deliveryLocation, customerLocation];

    return (
        <SellerLayout>
            <Head title={`Suivi de la commande ${orderDetails.id} - LoméShop`} />
            
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Suivi en direct</h1>
                    <p className="text-gray-500 font-medium">Commande <span className="text-[#8B4513]">{orderDetails.id}</span> • {orderDetails.product}</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-100">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">En direct</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Info Column */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="font-black text-gray-900 mb-6">Détails de livraison</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium">Client</span>
                                <span className="font-bold text-gray-900">{orderDetails.customer}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium">Statut</span>
                                <span className="px-3 py-1 bg-[#8B4513] text-white text-[10px] font-black rounded-lg uppercase">{orderDetails.status}</span>
                            </div>
                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <p className="text-xs font-bold text-gray-900">Komi (Livreur)</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Moto TG-1234-A</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="font-black text-gray-900 mb-8 text-sm uppercase tracking-widest">Progression</h3>
                        <div className="relative border-l-2 border-gray-100 ml-3 space-y-8">
                            <div className="relative pl-8">
                                <div className="absolute -left-[10px] top-0 w-4 h-4 rounded-full bg-green-500 border-4 border-green-100"></div>
                                <p className="text-sm font-bold text-gray-900">Boutique</p>
                                <p className="text-[10px] text-gray-400 font-bold">Colis prêt</p>
                            </div>
                            <div className="relative pl-8">
                                <div className={`absolute -left-[10px] top-0 w-4 h-4 rounded-full border-4 ${orderDetails.status === 'En route' || orderDetails.status === 'Livré' ? 'bg-[#8B4513] border-orange-100' : 'bg-white border-gray-100'}`}></div>
                                <p className={`text-sm font-bold ${orderDetails.status === 'En route' || orderDetails.status === 'Livré' ? 'text-gray-900' : 'text-gray-300'}`}>En route</p>
                                <p className="text-[10px] text-gray-400 font-bold">Livreur sur le trajet</p>
                            </div>
                            <div className="relative pl-8">
                                <div className={`absolute -left-[10px] top-0 w-4 h-4 rounded-full border-4 ${orderDetails.status === 'Livré' ? 'bg-green-500 border-green-100' : 'bg-white border-gray-100'}`}></div>
                                <p className={`text-sm font-bold ${orderDetails.status === 'Livré' ? 'text-gray-900' : 'text-gray-300'}`}>Livré</p>
                                <p className="text-[10px] text-gray-400 font-bold">Destination finale</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Map Column */}
                <div className="lg:col-span-2 h-[600px] bg-white rounded-[40px] overflow-hidden border border-gray-100 shadow-xl relative">
                    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                        <Map
                            defaultCenter={deliveryLocation}
                            defaultZoom={13}
                            mapId="seller-tracking-map"
                            mapTypeControl={false}
                            streetViewControl={false}
                        >
                            <AdvancedMarker position={shopLocation}>
                                <div className="bg-white p-2 rounded-lg shadow-md border border-gray-100">
                                    <span className="text-[10px] font-black text-gray-700 uppercase">Ma Boutique</span>
                                </div>
                            </AdvancedMarker>

                            <AdvancedMarker position={customerLocation}>
                                <div className="bg-white p-2 rounded-lg shadow-md border border-gray-100">
                                    <span className="text-[10px] font-black text-gray-700 uppercase">Client</span>
                                </div>
                            </AdvancedMarker>

                            <AdvancedMarker position={deliveryLocation}>
                                <div className="relative">
                                    <div className="absolute -inset-4 bg-[#8B4513]/20 rounded-full animate-ping"></div>
                                    <div className="relative bg-[#8B4513] w-4 h-4 rounded-full shadow-2xl border-2 border-white z-10">
                                    </div>
                                </div>
                            </AdvancedMarker>

                            <Polyline path={routeCoords} />
                        </Map>
                    </APIProvider>
                </div>
            </div>
        </SellerLayout>
    );
}
