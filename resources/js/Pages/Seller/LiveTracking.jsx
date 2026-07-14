import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { 
    APIProvider, 
    Map, 
    AdvancedMarker, 
    useMap 
} from '@vis.gl/react-google-maps';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export default function LiveTracking() {
    const [activeCourier, setActiveCourier] = useState(null);

    const couriers = [
        { id: 1, name: 'Moussa T.', status: 'En route', location: { lat: 6.1666, lng: 1.1833 }, orders: 3, vehicle: 'Moto' },
        { id: 2, name: 'Koffi A.', status: 'Collecte', location: { lat: 6.1366, lng: 1.2222 }, orders: 1, vehicle: 'Moto' },
        { id: 3, name: 'Dédé L.', status: 'Pause', location: { lat: 6.1550, lng: 1.2150 }, orders: 0, vehicle: 'Vélo' },
    ];

    return (
        <SellerLayout>
            <Head title="Suivi Live Livreurs" />
            
            <div className="flex flex-col h-[calc(100vh-140px)]">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Centre de Commandement Live</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Surveillez vos livreurs en temps réel sur Lomé.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white dark:bg-[#1e1e1e] px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-2 transition-colors">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{couriers.length} Livreurs en ligne</span>
                        </div>
                    </div>
                </div>

                <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
                    {/* Left: Courier List */}
                    <div className="lg:col-span-1 bg-white dark:bg-[#1e1e1e] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col transition-colors">
                        <div className="p-6 border-b border-gray-50 dark:border-gray-800">
                            <h3 className="font-bold text-gray-900 dark:text-white">Liste des Livreurs</h3>
                        </div>
                        <div className="flex-grow overflow-y-auto p-4 space-y-3">
                            {couriers.map((courier) => (
                                <button
                                    key={courier.id}
                                    onClick={() => setActiveCourier(courier)}
                                    className={`w-full p-4 rounded-2xl border text-left transition-all ${
                                        activeCourier?.id === courier.id
                                        ? 'border-[#8B4513] bg-[#8B4513]/5 ring-1 ring-[#8B4513]'
                                        : 'border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5'
                                    }`}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-black text-gray-900 dark:text-white">{courier.name}</span>
                                        <span className={`text-[10px] font-black px-2 py-1 rounded-full ${
                                            courier.status === 'En route' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                                        }`}>
                                            {courier.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                        <span>{courier.vehicle}</span>
                                        <span className="font-bold">{courier.orders} commandes</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Center/Right: Map View */}
                    <div className="lg:col-span-3 bg-white dark:bg-[#1e1e1e] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden relative transition-colors">
                        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                            <Map
                                defaultCenter={{ lat: 6.15, lng: 1.2 }}
                                defaultZoom={13}
                                mapId="seller-tracking-map"
                                mapTypeControl={false}
                                streetViewControl={false}
                            >
                                {couriers.map((courier) => (
                                    <AdvancedMarker 
                                        key={courier.id} 
                                        position={courier.location}
                                        onClick={() => setActiveCourier(courier)}
                                    >
                                        <div className={`p-2.5 rounded-full shadow-xl border-2 transition-transform duration-300 ${
                                            activeCourier?.id === courier.id ? 'bg-[#8B4513] border-white scale-125 z-20' : 'bg-white border-[#8B4513] z-10'
                                        }`}>
                                            <img 
                                                src="https://cdn-icons-png.flaticon.com/512/2972/2972185.png" 
                                                alt="Courier" 
                                                className={`w-6 h-6 ${activeCourier?.id === courier.id ? 'invert' : ''}`} 
                                            />
                                        </div>
                                    </AdvancedMarker>
                                ))}
                            </Map>
                        </APIProvider>

                        {/* Floating Info Card */}
                        {activeCourier && (
                            <div className="absolute bottom-6 left-6 right-6 lg:left-auto lg:right-6 lg:w-80 bg-white/95 dark:bg-[#1e1e1e]/95 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-white dark:border-gray-800 z-10 animate-in slide-in-from-bottom-4 duration-300">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-[#252525] overflow-hidden border-2 border-[#8B4513]/20">
                                        <img src="https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&w=150&q=80" alt="Livreur" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-gray-900 dark:text-white">{activeCourier.name}</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-widest">{activeCourier.vehicle} • ID #{activeCourier.id}28</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase mb-1">Status</p>
                                        <p className="text-sm font-black text-[#8B4513]">{activeCourier.status}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase mb-1">Charge</p>
                                        <p className="text-sm font-black text-gray-900 dark:text-white">{activeCourier.orders} Livraisons</p>
                                    </div>
                                </div>
                                <button className="w-full py-4 bg-[#8B4513] text-white font-black rounded-2xl shadow-lg shadow-[#8B4513]/20 hover:bg-[#7a2d09] transition-all">
                                    Appeler le Livreur
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </SellerLayout>
    );
}
