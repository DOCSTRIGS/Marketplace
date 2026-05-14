import React, { useState, useEffect, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import EmptyState from '@/Components/EmptyState';
import { 
    APIProvider, 
    Map, 
    AdvancedMarker, 
    useMap,
    useMapsLibrary,
    MapControl
} from '@vis.gl/react-google-maps';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Control to recenter map on user (Shop)
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
                title="Ma Boutique"
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

    const shopLocation = { lat: parseFloat(order.shop?.latitude || 6.1256), lng: parseFloat(order.shop?.longitude || 1.2254) };
    const deliveryLocation = { lat: 6.1550, lng: 1.2150 }; // Simulated delivery position
    const customerLocation = { lat: 6.1636, lng: 1.2152 }; // Target location (user's real testing location)

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
                            {/* Shop Marker */}
                            <AdvancedMarker position={shopLocation}>
                                <div className="flex flex-col items-center">
                                    <div className="mb-1 px-2 py-0.5 bg-[#EA4335] rounded-full text-[8px] font-black shadow-lg text-white uppercase tracking-tighter">BOUTIQUE</div>
                                    <div className="w-5 h-5 rounded-full border-[3px] border-white shadow-xl flex items-center justify-center bg-[#EA4335]"></div>
                                </div>
                            </AdvancedMarker>

                            {/* User Marker */}
                            <AdvancedMarker position={customerLocation}>
                                <div className="flex flex-col items-center">
                                    <div className="mb-1 px-2 py-0.5 bg-[#4285F4] rounded-full text-[8px] font-black shadow-lg text-white uppercase tracking-tighter">CLIENT</div>
                                    <div className="w-5 h-5 rounded-full border-[3px] border-white shadow-xl flex items-center justify-center bg-[#4285F4]"></div>
                                </div>
                            </AdvancedMarker>

                            <Directions 
                                origin={shopLocation} 
                                destination={customerLocation} 
                            />
                            <LocateMeControl location={shopLocation} />
                        </Map>
                    </APIProvider>
                </div>
            </div>
        </SellerLayout>
    );
}
