import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Composant pour l'affichage de l'itinéraire
function Directions({ driverPos, shopPos, clientPos }) {
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

        directionsService.route({
            origin: driverPos,
            destination: clientPos,
            waypoints: [{ location: shopPos, stopover: true }],
            travelMode: google.maps.TravelMode.DRIVING
        }).then(response => {
            directionsRenderer.setDirections(response);
            setRoutes(response.routes);
        });
    }, [directionsService, directionsRenderer, driverPos, shopPos, clientPos]);

    return null;
}

export default function DriverDashboard({ auth, activeOrders = [], stats }) {
    const [status, setStatus] = useState('available');
    const [isMapExpanded, setIsMapExpanded] = useState(false);

    const MAP_COLORS = {
        driver: '#27AE60',
        shop: '#C0392B',
        client: '#2980B9'
    };

    const driverPos = { lat: 6.1378, lng: 1.2125 };
    const shopPos = { lat: 6.1450, lng: 1.2200 };
    const clientPos = { lat: 6.1550, lng: 1.2350 };

    return (
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
            <div className="min-h-screen bg-white font-['Outfit',sans-serif] text-[#1a1a1a] antialiased">
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
                    .rounded-custom { border-radius: 24px; }
                    .text-spacing { letter-spacing: 0.1em; }
                    .map-expanded { position: fixed; inset: 20px; z-index: 100; border-radius: 40px; box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.5); }
                `}</style>
                
                <Head title="LoméShop — Dashboard" />

                <header className="h-20 px-12 flex items-center justify-between border-b border-gray-100 sticky top-0 bg-white z-50">
                    <div className="flex items-center gap-10">
                        <h1 className="text-2xl font-black text-[#D35400] tracking-tighter">LoméShop</h1>
                        <nav className="flex items-center gap-8">
                            <div className="flex gap-6 text-[11px] font-black uppercase text-spacing">
                                <Link href={route('driver.dashboard')} className="text-[#8B4513] border-b-2 border-[#8B4513] pb-1">Tableau de bord</Link>
                                <Link href={route('driver.earnings')} className="text-gray-400 hover:text-black">Portefeuille</Link>
                                <Link href={route('driver.performance')} className="text-gray-400 hover:text-black">Performance</Link>
                            <Link href={route('driver.profile')} className="text-gray-400 hover:text-black">Profil</Link>
                            </div>
                            <div className="w-[1px] h-6 bg-gray-200 mx-2"></div>
                            <div className="bg-[#F2F2F2] p-1 rounded-full flex items-center">
                                <button onClick={() => setStatus('available')} className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase transition-all ${status === 'available' ? 'bg-[#8B4513] text-white' : 'text-gray-400'}`}>En ligne</button>
                                <button onClick={() => setStatus('offline')} className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase transition-all ${status === 'offline' ? 'bg-[#8B4513] text-white' : 'text-gray-400'}`}>Hors ligne</button>
                                <button onClick={() => setStatus('pause')} className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase transition-all ${status === 'pause' ? 'bg-[#8B4513] text-white' : 'text-gray-400'}`}>Pause</button>
                            </div>
                        </nav>
                    </div>
                    <div className="flex items-center gap-6">
                        <button className="bg-[#C52828] text-white px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest">SOS</button>
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden ml-2 border border-gray-100">
                            <img src={auth.user.profile_photo_url} className="w-full h-full object-cover" alt="" />
                        </div>
                    </div>
                </header>

                <main className="p-8 grid grid-cols-12 gap-8 max-w-[1600px] mx-auto relative">
                    <div className="col-span-3 space-y-6">
                        <div className="bg-[#FAF9F8] rounded-custom p-8 border border-gray-100 relative overflow-hidden">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase text-spacing mb-6">Portefeuille</h3>
                            <p className="text-[11px] font-bold text-gray-400 mb-1">Solde du jour</p>
                            <h2 className="text-[34px] font-black tracking-tight mb-6">24.500 FCFA</h2>
                            <button className="w-full py-4 bg-[#8B4513] text-white rounded-2xl font-black text-sm uppercase shadow-lg shadow-[#8B4513]/20">Retrait Rapide</button>
                        </div>

                        <div className="space-y-4">
                            {[
                                { label: 'Note', val: '4.9 / 5.0', color: MAP_COLORS.driver },
                                { label: 'Acceptation', val: '98%', color: MAP_COLORS.client },
                                { label: 'Ponctualité', val: '100%', color: '#2ECC71' }
                            ].map((s, i) => (
                                <div key={i} className="bg-white rounded-3xl p-5 flex items-center gap-5 border border-gray-50 shadow-sm">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }}></div>
                                    <div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase text-spacing mb-0.5">{s.label}</p>
                                        <p className="text-base font-black uppercase tracking-tighter">{s.val}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`col-span-5 h-[700px] transition-all duration-700 ease-in-out ${isMapExpanded ? 'map-expanded' : 'bg-[#FDFDFD] rounded-custom shadow-xl border border-gray-100 overflow-hidden relative'}`}>
                        <Map
                            defaultCenter={driverPos}
                            defaultZoom={13}
                            mapId="bf51a910020fa257"
                            disableDefaultUI={true}
                            className="w-full h-full"
                        >
                            <Directions driverPos={driverPos} shopPos={shopPos} clientPos={clientPos} />

                            <AdvancedMarker position={driverPos}>
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-full animate-ping opacity-20 w-8 h-8 -translate-x-1.5 -translate-y-1.5" style={{ backgroundColor: MAP_COLORS.driver }}></div>
                                    <div className="w-5 h-5 rounded-full border-2 border-white shadow-lg flex items-center justify-center" style={{ backgroundColor: MAP_COLORS.driver }}>
                                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                    </div>
                                </div>
                            </AdvancedMarker>

                            <AdvancedMarker position={shopPos}>
                                <Pin background={MAP_COLORS.shop} glyphColor={MAP_COLORS.driver} borderColor={MAP_COLORS.driver} />
                            </AdvancedMarker>

                            <AdvancedMarker position={clientPos}>
                                <Pin background={MAP_COLORS.client} glyphColor={'#FFF'} borderColor={MAP_COLORS.client} />
                            </AdvancedMarker>
                        </Map>

                        <div className="absolute top-8 right-8 flex flex-col gap-4">
                            <button 
                                onClick={() => setIsMapExpanded(!isMapExpanded)}
                                className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-gray-100 font-black text-[10px] uppercase tracking-widest hover:bg-[#8B4513] hover:text-white transition-all"
                            >
                                {isMapExpanded ? 'Réduire' : 'Agrandir'}
                            </button>
                        </div>
                    </div>

                    <div className="col-span-4 bg-white rounded-custom border border-gray-100 shadow-xl p-8 flex flex-col">
                        <div className="bg-[#8B4513] rounded-3xl p-6 text-white mb-8 flex justify-between items-center shadow-lg shadow-[#8B4513]/20">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-xl font-black uppercase tracking-tight">Mission</h3>
                                    <span className="text-[8px] font-black bg-white/20 px-2 py-0.5 rounded">LIV-4029</span>
                                </div>
                                <span className="text-2xl font-black tracking-tighter">02:45</span>
                            </div>
                        </div>

                        <div className="space-y-10 flex-1 overflow-y-auto">
                            <div className="bg-beige p-6 rounded-3xl border border-[#8B4513]/10">
                                <p className="text-[10px] font-bold italic text-[#8B4513]/70 leading-relaxed uppercase tracking-wide">
                                    Appeler à l'arrivée.
                                </p>
                            </div>

                            <div className="space-y-8">
                                <div className="flex gap-4">
                                    <div className="w-1.5 h-1.5 mt-1.5 bg-gray-200 rounded-full shrink-0"></div>
                                    <div><p className="text-[8px] font-black text-gray-400 uppercase mb-0.5 tracking-widest">Récupérer</p><p className="text-xs font-black uppercase tracking-tight">Saveurs du Togo</p></div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-1.5 h-1.5 mt-1.5 bg-[#2980B9] rounded-full shrink-0"></div>
                                    <div><p className="text-[8px] font-black text-gray-400 uppercase mb-0.5 tracking-widest">Livrer</p><p className="text-xs font-black uppercase tracking-tight">Immeuble GTA</p></div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 space-y-4">
                            <button className="w-full py-4 bg-white border-2 border-gray-100 rounded-2xl font-black text-[10px] uppercase tracking-widest">Arrivé Boutique</button>
                            <div className="grid grid-cols-2 gap-4">
                                <button className="py-4 bg-[#8B4513] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">Récupéré</button>
                                <button className="py-4 bg-gray-100 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-not-allowed">Livré</button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </APIProvider>
    );
}
