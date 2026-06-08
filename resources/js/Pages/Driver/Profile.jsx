import React, { useState } from 'react';
import axios from 'axios';
import { Head, Link, useForm } from '@inertiajs/react';
import ThemeToggle from '@/Components/ThemeToggle';

export default function DriverProfile({ auth, user }) {
    const [status, setStatus] = useState(auth.user.driver_status || 'available');
    
    const handleStatusChange = (newStatus) => {
        setStatus(newStatus);
        axios.post(route('driver.update-availability'), { status: newStatus })
            .catch(err => console.error(err));
    };

    const [showPassword, setShowPassword] = useState(false);
    
    const { data, setData, post, processing, errors } = useForm({
        name: user.name || '',
        phone: user.phone || '',
        vehicle_type: user.vehicle_type || 'moto',
        vehicle_model: user.vehicle_model || '',
        vehicle_plate: user.vehicle_plate || '',
        vehicle_description: user.vehicle_description || '',
        password: '',
        password_confirmation: '',
        vehicle_image: null,
        license_image: null,
        insurance_image: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('driver.profile.update'), {
            forceFormData: true,
            onSuccess: () => alert('Profil mis à jour avec succès !'),
        });
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#121212] text-[#1a1a1a] dark:text-white antialiased transition-colors duration-300">
            <Head title="Mon Profil Livreur" />


            <header className="h-20 px-12 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-[#1e1e1e] z-50 transition-colors duration-300">
                <div className="flex items-center gap-10">
                    <h1 className="text-2xl font-black text-[#D35400] dark:text-[#E67E22] tracking-tighter">LoméShop</h1>
                    <nav className="flex items-center gap-8">
                        <div className="flex gap-6 text-[11px] font-black uppercase text-spacing">
                            <Link href={route('driver.dashboard')} className="text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white">Missions</Link>
                            <Link href={route('driver.history')} className="text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white">Historique</Link>
                            <Link href={route('driver.profile')} className="text-[#8B4513] border-b-2 border-[#8B4513] pb-1">Profil</Link>
                        </div>
                        <div className="w-[1px] h-6 bg-gray-200 dark:bg-gray-800 mx-2"></div>
                        <div className="bg-[#F2F2F2] dark:bg-gray-800 p-1 rounded-full flex items-center">
                            <button type="button" onClick={() => handleStatusChange('available')} className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase transition-all ${status === 'available' ? 'bg-[#8B4513] text-white' : 'text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white'}`}>En ligne</button>
                            <button type="button" onClick={() => handleStatusChange('offline')} className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase transition-all ${status === 'offline' ? 'bg-[#8B4513] text-white' : 'text-gray-400'}`}>Hors ligne</button>
                        </div>
                    </nav>
                </div>
                <div className="flex items-center gap-6">
                    <ThemeToggle />
                    <Link 
                        href={route('logout')} 
                        method="post" 
                        as="button" 
                        className="text-[10px] font-black uppercase text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 px-4 py-2 rounded-xl transition-all"
                    >
                        Déconnexion
                    </Link>
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-850 overflow-hidden ml-2 border border-gray-100 dark:border-gray-800">
                        <img src={auth.user.profile_photo_url} className="w-full h-full object-cover" alt="" />
                    </div>
                </div>
            </header>

            <main className="p-12 max-w-[1200px] mx-auto">
                <div className="mb-12">
                    <h2 className="text-[34px] font-black uppercase tracking-tight mb-2 text-gray-900 dark:text-white">Réglages du Profil</h2>
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-medium tracking-wide uppercase">Gérez vos informations personnelles et votre véhicule.</p>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-12">
                    {/* SECTION PERSONNELLE */}
                    <div className="col-span-4 space-y-8">
                        <div className="bg-gray-50 dark:bg-[#1e1e1e] rounded-[40px] border border-transparent dark:border-gray-800 p-10 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-black uppercase tracking-widest text-[#8B4513] dark:text-[#E67E22]">Infos Personnelles</h3>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 ml-2 mb-2 block">Nom Complet</label>
                                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full premium-input" />
                                    {errors.name && <p className="text-red-500 text-[10px] mt-1">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 ml-2 mb-2 block">Téléphone</label>
                                    <input type="text" value={data.phone} onChange={e => setData('phone', e.target.value)} className="w-full premium-input" placeholder="+228 XX XX XX XX" />
                                </div>
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-800 mt-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500">Changer le mot de passe</h4>
                                        <button 
                                            type="button" 
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="text-[9px] font-black uppercase text-[#8B4513] dark:text-[#E67E22] hover:underline"
                                        >
                                            {showPassword ? 'Masquer' : 'Afficher'}
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                                <input 
                                                    type={showPassword ? "text" : "password"} 
                                                    placeholder="Nouveau mot de passe" 
                                                    onChange={e => setData('password', e.target.value)} 
                                                    className="w-full premium-input" 
                                                />
                                                <input 
                                                    type={showPassword ? "text" : "password"} 
                                                    placeholder="Confirmer" 
                                                    onChange={e => setData('password_confirmation', e.target.value)} 
                                                    className="w-full premium-input" 
                                                />
                                    </div>
                                    {errors.password && <p className="text-red-500 text-[10px] mt-1">{errors.password}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION VÉHICULE */}
                    <div className="col-span-8 space-y-8">
                        <div className="bg-white dark:bg-[#1e1e1e] rounded-[40px] p-12 border border-gray-100 dark:border-gray-800 shadow-sm space-y-10">
                            <h3 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Mon Véhicule & Documents</h3>
                            
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 ml-2 mb-2 block">Type de véhicule</label>
                                        <select value={data.vehicle_type} onChange={e => setData('vehicle_type', e.target.value)} className="w-full premium-input">
                                            <option value="moto" className="bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white">Moto</option>
                                            <option value="voiture" className="bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white">Voiture</option>
                                            <option value="velo" className="bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white">Vélo / Scooter</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 ml-2 mb-2 block">Modèle / Marque</label>
                                        <input type="text" value={data.vehicle_model} onChange={e => setData('vehicle_model', e.target.value)} className="w-full premium-input" placeholder="Ex: Yamaha Crypton S" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 ml-2 mb-2 block">Immatriculation</label>
                                        <input type="text" value={data.vehicle_plate} onChange={e => setData('vehicle_plate', e.target.value)} className="w-full premium-input" placeholder="TG-XXXX-AB" />
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 ml-2 mb-2 block">Description courte</label>
                                        <textarea rows="5" value={data.vehicle_description} onChange={e => setData('vehicle_description', e.target.value)} className="w-full premium-input resize-none" placeholder="Décrivez votre véhicule (couleur, état, etc.)"></textarea>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-10 border-t border-gray-50 dark:border-gray-800">
                                <h4 className="text-sm font-black uppercase mb-8 tracking-widest text-[#8B4513] dark:text-[#E67E22]">Documents & Images</h4>
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black uppercase text-gray-400 dark:text-gray-500 block text-center">Photo Véhicule</label>
                                        <div className="relative h-40 bg-gray-50 dark:bg-[#121212] rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-850 flex items-center justify-center overflow-hidden">
                                            {user.vehicle_image ? (
                                                <img src={`/storage/${user.vehicle_image}`} className="w-full h-full object-cover opacity-50" />
                                            ) : null}
                                            <input type="file" onChange={e => setData('vehicle_image', e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                                            <span className="text-[8px] font-black uppercase text-gray-300 dark:text-gray-650">Cliquer pour changer</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black uppercase text-gray-400 dark:text-gray-500 block text-center">Permis (Recto)</label>
                                        <div className="relative h-40 bg-gray-50 dark:bg-[#121212] rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-850 flex items-center justify-center overflow-hidden">
                                            {user.license_image ? (
                                                <img src={`/storage/${user.license_image}`} className="w-full h-full object-cover opacity-50" />
                                            ) : null}
                                            <input type="file" onChange={e => setData('license_image', e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                                            <span className="text-[8px] font-black uppercase text-gray-300 dark:text-gray-650">Cliquer pour changer</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black uppercase text-gray-400 dark:text-gray-500 block text-center">Assurance</label>
                                        <div className="relative h-40 bg-gray-50 dark:bg-[#121212] rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-850 flex items-center justify-center overflow-hidden">
                                            {user.insurance_image ? (
                                                <img src={`/storage/${user.insurance_image}`} className="w-full h-full object-cover opacity-50" />
                                            ) : null}
                                            <input type="file" onChange={e => setData('insurance_image', e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                                            <span className="text-[8px] font-black uppercase text-gray-300 dark:text-gray-650">Cliquer pour changer</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button 
                                type="submit" 
                                disabled={processing}
                                className="px-12 py-5 bg-[#8B4513] text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-[#8B4513]/30 disabled:opacity-50"
                            >
                                {processing ? 'Enregistrement...' : 'Sauvegarder les modifications'}
                            </button>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
}
