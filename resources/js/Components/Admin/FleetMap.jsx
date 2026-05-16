import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    APIProvider, 
    Map, 
    AdvancedMarker, 
    useMap,
    MapControl,
    ControlPosition
} from '@vis.gl/react-google-maps';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export default function FleetMap({ onDriverClick }) {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFleet();
        
        // Real-time listening for ALL drivers
        if (typeof window !== 'undefined' && window.Echo) {
            window.Echo.channel('fleet')
                .listen('.driver.location.updated', (e) => {
                    setDrivers(prev => prev.map(d => 
                        d.id === e.driverId 
                        ? { ...d, last_latitude: e.latitude, last_longitude: e.longitude, driver_status: e.status }
                        : d
                    ));
                });
        }

        const interval = setInterval(fetchFleet, 30000); // Background sync every 30s
        return () => {
            clearInterval(interval);
            if (window.Echo) window.Echo.leave('fleet');
        };
    }, []);

    const fetchFleet = () => {
        axios.get(route('admin.drivers.fleet'))
            .then(res => {
                setDrivers(res.data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    };

    return (
        <div className="h-[600px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100 dark:border-white/5 relative">
            {loading ? (
                <div className="absolute inset-0 z-50 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-sm flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-[#8B4513] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Chargement de la flotte...</p>
                    </div>
                </div>
            ) : null}

            <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                <Map
                    defaultCenter={{ lat: 6.1372, lng: 1.2125 }}
                    defaultZoom={13}
                    mapId="bf50a87343b44b8b"
                    disableDefaultUI={true}
                >
                    {drivers.map(driver => (
                        driver.last_latitude && (
                            <AdvancedMarker 
                                key={driver.id} 
                                position={{ lat: parseFloat(driver.last_latitude), lng: parseFloat(driver.last_longitude) }}
                                onClick={() => onDriverClick(driver.id)}
                            >
                                <div className="flex flex-col items-center group cursor-pointer">
                                    <div className="bg-white dark:bg-[#1e1e1e] px-2 py-1 rounded-full shadow-xl border border-gray-100 dark:border-white/10 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-[8px] font-black text-gray-900 dark:text-white uppercase truncate max-w-[80px]">{driver.name}</p>
                                    </div>
                                    <div className={`w-8 h-8 rounded-full border-2 border-white dark:border-[#121212] shadow-xl flex items-center justify-center text-white ${
                                        driver.driver_status === 'available' ? 'bg-green-500' :
                                        driver.driver_status === 'busy' ? 'bg-blue-500' :
                                        'bg-orange-500'
                                    } transition-transform hover:scale-110`}>
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M19.5,12c-1.38,0-2.5,1.12-2.5,2.5s1.12,2.5,2.5,2.5s2.5-1.12,2.5-2.5S20.88,12,19.5,12z M4.5,12c-1.38,0-2.5,1.12-2.5,2.5 s1.12,2.5,2.5,2.5s2.5-1.12,2.5-2.5S5.88,12,4.5,12z M17,8l-1.5-2H11l1.5,2H17z M18,10l-2-3H10l-2,3H3v2h18v-2H18z" />
                                        </svg>
                                    </div>
                                    {driver.driver_status === 'busy' && (
                                        <div className="absolute -bottom-1 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
                                    )}
                                </div>
                            </AdvancedMarker>
                        )
                    ))}

                    <MapControl position={ControlPosition.LEFT_TOP}>
                        <div className="m-4 flex flex-col gap-2">
                            <div className="bg-white/90 dark:bg-[#1e1e1e]/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-gray-100 dark:border-white/5">
                                <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Légende</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-[8px] font-bold text-gray-600 dark:text-gray-400 uppercase">Disponible ({drivers.filter(d => d.driver_status === 'available').length})</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span className="text-[8px] font-bold text-gray-600 dark:text-gray-400 uppercase">En course ({drivers.filter(d => d.driver_status === 'busy').length})</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                        <span className="text-[8px] font-bold text-gray-600 dark:text-gray-400 uppercase">En pause ({drivers.filter(d => d.driver_status === 'pause').length})</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </MapControl>
                </Map>
            </APIProvider>
        </div>
    );
}
