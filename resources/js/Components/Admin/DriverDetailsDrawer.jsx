import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function DriverDetailsDrawer({ driverId, isOpen, onClose }) {
    const [driver, setDriver] = useState(null);
    const [orders, setOrders] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    const formattedPrice = (price) => new Intl.NumberFormat('fr-FR').format(price);

    useEffect(() => {
        if (isOpen && driverId) {
            setLoading(true);
            axios.get(route('admin.drivers.show', driverId), {
                headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' }
            })
            .then(res => {
                setDriver(res.data.driver);
                setOrders(res.data.orders);
                setLogs(res.data.logs);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
        }
    }, [isOpen, driverId]);

    return (
        <>
            {/* Overlay Immersif */}
            <div 
                className={`fixed inset-0 bg-black/60 backdrop-blur-md z-[100] transition-all duration-700 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            ></div>

            {/* Immersive Control Center Drawer */}
            <div className={`fixed right-0 top-0 h-full w-full max-w-2xl bg-white/90 dark:bg-[#121212]/95 backdrop-blur-2xl z-[101] shadow-[0_0_100px_rgba(0,0,0,0.5)] transform transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full relative overflow-hidden">
                    
                    {/* Décoration de fond (Effet de lumière) */}
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#8B4513]/10 rounded-full blur-[100px] pointer-events-none opacity-50"></div>
                    <div className="absolute top-1/2 -left-24 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none opacity-30"></div>

                    {/* Header Premium */}
                    <div className="relative p-10 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className="w-20 h-20 bg-[#8B4513] text-white rounded-[2rem] flex items-center justify-center text-3xl font-black shadow-2xl ring-4 ring-[#8B4513]/20">
                                    {driver?.name.charAt(0)}
                                </div>
                                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white dark:border-[#121212] ${
                                    driver?.driver_status === 'available' ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]' : 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.6)]'
                                } animate-pulse`}></div>
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">{driver?.name}</h2>
                                <div className="flex items-center gap-3 mt-2">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">{driver?.email}</p>
                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                    <p className="text-[10px] text-[#8B4513] font-black uppercase tracking-widest">ID #{driver?.id.toString().padStart(4, '0')}</p>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="group p-4 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-3xl transition-all duration-300">
                            <svg className="h-6 w-6 text-gray-400 group-hover:rotate-90 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Dashboard Content */}
                    <div className="relative flex-grow overflow-y-auto custom-scrollbar">
                        {loading ? (
                            <div className="h-full flex flex-col items-center justify-center gap-4">
                                <div className="w-12 h-12 border-4 border-[#8B4513] border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Initialisation du cockpit...</p>
                            </div>
                        ) : driver ? (
                            <div className="p-10 space-y-12">
                                
                                {/* Performance Indicators (GARDÉS CAR VOUS LES AIMEZ) */}
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="p-6 bg-gray-50 dark:bg-white/5 rounded-[2.5rem] border border-gray-100 dark:border-white/5 flex flex-col items-center group">
                                        <div className="w-16 h-16 rounded-full border-[6px] border-gray-100 dark:border-white/5 border-t-[#8B4513] flex items-center justify-center mb-3">
                                            <p className="text-xl font-black text-gray-900 dark:text-white">{driver.deliveries_completed}</p>
                                        </div>
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Missions</p>
                                    </div>
                                    <div className="p-6 bg-gray-50 dark:bg-white/5 rounded-[2.5rem] border border-gray-100 dark:border-white/5 flex flex-col items-center group">
                                        <div className="w-16 h-16 rounded-full border-[6px] border-gray-100 dark:border-white/5 border-t-[#2ECC71] flex items-center justify-center mb-3">
                                            <p className="text-xl font-black text-gray-900 dark:text-white">4.9</p>
                                        </div>
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Score</p>
                                    </div>
                                    <div className="p-6 bg-gray-50 dark:bg-white/5 rounded-[2.5rem] border border-gray-100 dark:border-white/5 flex flex-col items-center group">
                                        <div className="w-16 h-16 rounded-full border-[6px] border-gray-100 dark:border-white/5 border-t-blue-500 flex items-center justify-center mb-3">
                                            <p className="text-xl font-black text-gray-900 dark:text-white">96<span className="text-[10px]">%</span></p>
                                        </div>
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Ponctuel</p>
                                    </div>
                                </div>

                                {/* Timeline Ultra-Simplifiée */}
                                <div className="space-y-8">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-2">Historique d'activité</h4>
                                    
                                    <div className="space-y-0 relative">
                                        {/* Ligne de timeline fine */}
                                        <div className="absolute left-[15px] top-4 bottom-4 w-[1px] bg-gray-100 dark:bg-white/10"></div>

                                        {(orders.length > 0 || logs.length > 0) ? (
                                            <div className="space-y-8">
                                                {orders.map(order => (
                                                    <div key={order.id} className="relative pl-12 group">
                                                        <div className="absolute left-0 top-1 w-8 h-8 bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-full flex items-center justify-center z-10 shadow-sm">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                        </div>
                                                        
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <p className="text-[10px] font-black text-[#8B4513] uppercase mb-1">Mission #{order.order_number}</p>
                                                                <h5 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight">{order.shop?.name}</h5>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{order.delivery_address}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xs font-black text-gray-900 dark:text-white">{formattedPrice(order.total_amount)} FCFA</p>
                                                                <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">
                                                                    {new Date(order.delivered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                                {logs.filter(l => l.event_type.includes('pause')).map(log => (
                                                    <div key={log.id} className="relative pl-12 group opacity-60">
                                                        <div className="absolute left-1 top-2 w-6 h-6 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-full flex items-center justify-center z-10">
                                                            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                                                        </div>
                                                        <div className="flex justify-between items-center py-1">
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                                {log.event_type === 'pause_start' ? 'Début de Pause' : 'Reprise activité'}
                                                            </p>
                                                            <p className="text-[9px] text-gray-300 font-bold italic">
                                                                {new Date(log.created_at || log.occurred_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-center py-20 text-[10px] font-black text-gray-300 uppercase tracking-widest">Aucune donnée</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {/* Footer Simple */}
                    <div className="p-10 border-t border-gray-100 dark:border-white/5 flex flex-col gap-4">
                        <button 
                            onClick={onClose}
                            className="w-full py-5 bg-[#8B4513] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#8B4513]/20 hover:scale-[1.01] active:scale-95 transition-all"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
