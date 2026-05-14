import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { BarChart, Bar, Cell } from 'recharts';

const data = [
    { name: 'S1', val: 95 },
    { name: 'S2', val: 98 },
    { name: 'S3', val: 92 },
    { name: 'S4', val: 97 },
    { name: 'S5', val: 100 },
];

export default function DriverPerformance({ auth }) {
    const [status, setStatus] = useState('available');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="min-h-screen bg-white font-['Outfit',sans-serif] text-[#1a1a1a] antialiased">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
                .rounded-card { border-radius: 32px; }
                .text-spacing { letter-spacing: 0.1em; }
            `}</style>
            
            <Head title="Profil Livreur" />

            <header className="h-20 px-12 flex items-center justify-between border-b border-gray-100 sticky top-0 bg-white z-50">
                <div className="flex items-center gap-10">
                    <h1 className="text-2xl font-black text-[#D35400] tracking-tighter">LoméShop</h1>
                    <nav className="flex items-center gap-8">
                        <div className="flex gap-6 text-[11px] font-black uppercase text-spacing">
                            <Link href={route('driver.dashboard')} className="text-gray-400 hover:text-black">Tableau de bord</Link>
                            <Link href={route('driver.earnings')} className="text-gray-400 hover:text-black">Portefeuille</Link>
                            <Link href={route('driver.performance')} className="text-[#8B4513] border-b-2 border-[#8B4513] pb-1">Performance</Link>
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

            <main className="p-12 max-w-[1600px] mx-auto">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h2 className="text-[34px] font-black uppercase tracking-tight mb-2">Profil Livreur</h2>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic">Statistiques et Performance</p>
                    </div>
                    <div className="flex items-center gap-6 bg-white p-6 rounded-3xl border border-gray-50 shadow-sm">
                        <div className="text-right">
                            <p className="text-[9px] font-black uppercase text-gray-400 text-spacing">Niveau 4</p>
                            <p className="text-xs font-black uppercase tracking-tighter">Livreur Expert Gold</p>
                        </div>
                        <div className="w-12 h-12 bg-[#8B4513] rounded-2xl"></div>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-8 mb-12">
                    <div className="col-span-8 bg-white rounded-card p-12 border border-gray-50 shadow-sm relative overflow-hidden">
                        <p className="text-[10px] font-black text-gray-400 uppercase text-spacing mb-4">Ponctualité mensuelle</p>
                        <h3 className="text-[64px] font-black tracking-tighter leading-none mb-10">98.4%</h3>
                        <div className="w-full h-[140px] flex items-center justify-center overflow-hidden">
                            {mounted && (
                                <BarChart width={600} height={140} data={data}>
                                    <Bar dataKey="val">
                                        {data.map((e, i) => <Cell key={i} fill={i === 4 ? '#8B4513' : '#F3F4F6'} />)}
                                    </Bar>
                                </BarChart>
                            )}
                        </div>
                    </div>

                    <div className="col-span-4 bg-[#6B3410] rounded-card p-12 text-white shadow-xl text-center flex flex-col justify-center items-center">
                        <h4 className="text-[10px] font-black uppercase opacity-60 text-spacing mb-8 tracking-[0.2em]">Note Globale</h4>
                        <h2 className="text-[84px] font-black tracking-tighter leading-none mb-4">4.92</h2>
                        <div className="px-4 py-1.5 bg-white/10 rounded-full text-[8px] font-black uppercase tracking-widest">Excellent</div>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-8 mb-12">
                    <div className="col-span-7">
                        <h3 className="text-2xl font-black uppercase mb-8 px-4 tracking-tight">Véhicule</h3>
                        <div className="bg-white rounded-[40px] p-4 shadow-sm border border-gray-100 flex gap-8">
                            <div className="w-[45%] h-[300px] rounded-[32px] overflow-hidden relative shadow-lg grayscale hover:grayscale-0 transition-all duration-500">
                                <img src={auth.user.vehicle_image ? `/storage/${auth.user.vehicle_image}` : "https://images.unsplash.com/photo-1558981403-c5f91cbba527?auto=format&fit=crop&q=80&w=800"} className="w-full h-full object-cover" alt="" />
                                <div className="absolute top-6 left-6 bg-[#8B4513] text-white px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest">ACTIF</div>
                            </div>
                            <div className="flex-1 py-10 pr-10 flex flex-col justify-center">
                                <h4 className="text-[28px] font-black tracking-tight mb-2 uppercase tracking-tighter">{auth.user.vehicle_model || 'Non renseigné'}</h4>
                                <div className="grid grid-cols-2 gap-6 mb-10 mt-6">
                                    <div className="bg-gray-50 p-6 rounded-3xl">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Immat.</p>
                                        <p className="text-xs font-black uppercase tracking-tighter">{auth.user.vehicle_plate || '--'}</p>
                                    </div>
                                    <div className="bg-gray-50 p-6 rounded-3xl">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Couleur / Type</p>
                                        <p className="text-xs font-black uppercase tracking-tighter">{auth.user.vehicle_type || 'Moto'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-5">
                        <h3 className="text-2xl font-black uppercase mb-8 px-4 tracking-tight">Documents</h3>
                        <div className="space-y-4">
                            {[
                                { title: 'Permis', desc: '12/2026', status: 'VALIDE', color: 'bg-green-50 text-green-600', img: auth.user.license_image },
                                { title: 'Assurance', desc: '14 JOURS', status: 'EXPIRATION', color: 'bg-orange-50 text-orange-600', img: auth.user.insurance_image },
                                { title: 'Carte Grise', desc: 'Vérifié', status: 'OK', color: 'bg-gray-50 text-gray-400', img: null }
                            ].map((d, i) => (
                                <div key={i} className="bg-white p-6 rounded-[32px] flex items-center justify-between border border-gray-50 shadow-sm transition-transform hover:translate-x-2">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-100">
                                            {d.img ? (
                                                <img src={`/storage/${d.img}`} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
                                            )}
                                        </div>
                                        <div><p className="text-xs font-black mb-1 tracking-tighter uppercase">{d.title}</p><p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{d.desc}</p></div>
                                    </div>
                                    <div className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest ${d.color}`}>{d.status}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
