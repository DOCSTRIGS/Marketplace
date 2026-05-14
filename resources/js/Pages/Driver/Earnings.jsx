import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { BarChart, Bar, Cell } from 'recharts';

const data = [
    { name: 'LUN', val: 4000 },
    { name: 'MAR', val: 6500 },
    { name: 'MER', val: 12000 },
    { name: 'JEU', val: 5000 },
    { name: 'VEN', val: 3000 },
    { name: 'SAM', val: 4500 },
    { name: 'DIM', val: 8000 },
];

export default function DriverEarnings({ auth }) {
    const [status, setStatus] = useState('available');
    const [operator, setOperator] = useState('t-money');
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
            
            <Head title="Portefeuille & Revenus" />

            <header className="h-20 px-12 flex items-center justify-between border-b border-gray-100 sticky top-0 bg-white z-50">
                <div className="flex items-center gap-10">
                    <h1 className="text-2xl font-black text-[#D35400] tracking-tighter">LoméShop</h1>
                    <nav className="flex items-center gap-8">
                        <div className="flex gap-6 text-[11px] font-black uppercase text-spacing">
                            <Link href={route('driver.dashboard')} className="text-gray-400 hover:text-black">Tableau de bord</Link>
                            <Link href={route('driver.earnings')} className="text-[#8B4513] border-b-2 border-[#8B4513] pb-1">Portefeuille</Link>
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

            <main className="p-12 max-w-[1600px] mx-auto">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h2 className="text-[34px] font-black uppercase tracking-tight mb-2">Portefeuille & Revenus</h2>
                        <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">Gestion de vos gains et retraits.</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="px-8 py-3.5 bg-[#E9ECEF] rounded-2xl text-[10px] font-black uppercase text-spacing">Exporter PDF</button>
                        <button className="px-8 py-3.5 bg-[#8B4513] text-white rounded-2xl text-[10px] font-black uppercase text-spacing shadow-xl shadow-[#8B4513]/20">Retrait MM</button>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-8">
                    <div className="col-span-8 space-y-8">
                        <div className="grid grid-cols-3 gap-8">
                            <div className="bg-[#8B4513] rounded-card p-10 text-white shadow-xl relative overflow-hidden">
                                <p className="text-[10px] font-black uppercase opacity-60 mb-4 text-spacing">Solde disponible</p>
                                <h3 className="text-[38px] font-black tracking-tighter mb-10 text-spacing">145.250 FCFA</h3>
                                <div className="text-[10px] font-black bg-white/10 px-3 py-2 rounded-xl inline-block uppercase tracking-widest">+12% vs S-1</div>
                            </div>
                            <div className="bg-white rounded-card p-10 border border-gray-100 shadow-sm flex flex-col min-h-[200px]">
                                <p className="text-[10px] font-black text-gray-400 uppercase mb-4 text-spacing">Gains hebdo</p>
                                <h3 className="text-2xl font-black mb-4 tracking-tighter text-spacing">48.900 FCFA</h3>
                                <div className="flex-1 w-full h-[80px] flex items-center justify-center">
                                    {mounted && (
                                        <BarChart width={280} height={80} data={data}>
                                            <Bar dataKey="val">
                                                {data.map((e, i) => <Cell key={i} fill={i === 2 ? '#8B4513' : '#F2F2F2'} />)}
                                            </Bar>
                                        </BarChart>
                                    )}
                                </div>
                                <div className="flex justify-between mt-3 text-[8px] font-black text-gray-300 uppercase tracking-widest">
                                    {data.map(d => <span key={d.name}>{d.name}</span>)}
                                </div>
                            </div>
                            <div className="bg-[#FDA06D] rounded-card p-10 text-white shadow-xl">
                                <h4 className="text-[10px] font-black uppercase mb-4 text-spacing opacity-80">Primes actives</h4>
                                <h3 className="text-xl font-black mb-2 tracking-tight uppercase">Grand Lomé</h3>
                                <p className="text-[9px] font-black uppercase leading-relaxed mb-6 opacity-80 tracking-widest">+500 FCFA / Mission</p>
                                <button className="text-[9px] font-black uppercase border-b-2 border-white pb-0.5 tracking-tighter">Paramètres</button>
                            </div>
                        </div>

                        <div className="bg-white rounded-[40px] p-12 border border-gray-50 shadow-sm">
                            <h3 className="text-2xl font-black uppercase tracking-tight mb-12">Historique</h3>
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[9px] font-black text-gray-300 uppercase text-spacing border-b border-gray-50">
                                        <th className="pb-6">Mission</th>
                                        <th className="pb-6">Date</th>
                                        <th className="pb-6">Course</th>
                                        <th className="pb-6">Prime</th>
                                        <th className="pb-6 text-right">Statut</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {[
                                        { id: '#LM-4920', route: 'Lomé II → Be-Kpota', date: "Aujourd'hui", price: '1.800', tip: '200', status: 'COMPLÉTÉ' },
                                        { id: '#LM-4918', route: 'Agoè → Deckon', date: '12 Oct 2024', price: '2.500', tip: '0', status: 'COMPLÉTÉ' },
                                        { id: '#LM-4915', route: 'Be → Klikame', date: '12 Oct 2024', price: '1.200', tip: '500', status: 'COMPLÉTÉ' }
                                    ].map((m, i) => (
                                        <tr key={i}>
                                            <td className="py-6">
                                                <p className="text-sm font-black mb-0.5 uppercase tracking-tighter">{m.id}</p>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{m.route}</p>
                                            </td>
                                            <td className="py-6 font-black text-xs uppercase text-gray-400">{m.date}</td>
                                            <td className="py-6 font-black text-sm tracking-tighter">{m.price} FCFA</td>
                                            <td className="py-6 font-black text-sm text-[#8B4513] tracking-tighter">{m.tip} FCFA</td>
                                            <td className="py-6 text-right"><span className="bg-green-50 text-green-600 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest">{m.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="col-span-4 space-y-8">
                        <div className="bg-white rounded-card p-10 border border-gray-100 shadow-sm">
                            <h3 className="text-xl font-black uppercase tracking-tight mb-10">Retrait</h3>
                            <div className="space-y-8">
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase mb-4 text-spacing">Opérateur</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button onClick={() => setOperator('t-money')} className={`p-6 rounded-[32px] border-2 transition-all flex flex-col items-center gap-3 ${operator === 't-money' ? 'border-[#8B4513] bg-[#8B4513]/5' : 'border-gray-50'}`}>
                                            <span className="text-[10px] font-black uppercase text-spacing">T-Money</span>
                                        </button>
                                        <button onClick={() => setOperator('flooz')} className={`p-6 rounded-[32px] border-2 transition-all flex flex-col items-center gap-3 ${operator === 'flooz' ? 'border-[#8B4513] bg-[#8B4513]/5' : 'border-gray-50 opacity-40'}`}>
                                            <span className="text-[10px] font-black uppercase text-spacing">Flooz</span>
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase mb-4 text-spacing">Montant</p>
                                    <input type="text" placeholder="500 FCFA MIN" className="w-full py-4 bg-gray-50 border-none rounded-2xl font-black text-lg placeholder:text-gray-200" />
                                </div>
                                <button className="w-full py-5 bg-[#8B4513] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-[#8B4513]/20">Confirmer</button>
                            </div>
                        </div>

                        <div className="bg-[#EEEAE6] rounded-card p-10">
                            <h3 className="text-sm font-black uppercase mb-8 text-spacing">Zones actives</h3>
                            <div className="space-y-4">
                                <div className="bg-white p-6 rounded-3xl flex justify-between items-center border border-[#8B4513]/20">
                                    <div>
                                        <p className="text-[10px] font-black mb-0.5 uppercase tracking-tighter">Administratif</p>
                                        <p className="text-[8px] font-black text-[#8B4513] uppercase tracking-widest">+300 FCFA</p>
                                    </div>
                                    <div className="w-8 h-4 bg-[#8B4513] rounded-full relative"><div className="w-3 h-3 bg-white rounded-full absolute top-0.5 right-1"></div></div>
                                </div>
                            </div>
                            <div className="mt-8 rounded-2xl h-24 bg-gray-100/30 flex items-center justify-center border border-gray-200/50">
                                <p className="text-[8px] font-black uppercase text-gray-300 tracking-[0.2em]">Service GPS</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
