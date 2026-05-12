import React from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';

export default function Settings() {
    const { user } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('seller.settings.update'), {
            onSuccess: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <SellerLayout>
            <Head title="Paramètres - LoméShop" />
            
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Paramètres du profil</h1>
                <p className="text-gray-500 font-medium">Consultez ou modifiez vos informations personnelles.</p>
            </div>

            <div className="max-w-3xl space-y-6">
                <form onSubmit={submit} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-6">Informations Générales</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Nom Complet</label>
                                <input 
                                    type="text" 
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm" 
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Email</label>
                                <input 
                                    type="email" 
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm" 
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Nouveau Mot de Passe</label>
                                <input 
                                    type="password" 
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    placeholder="Laisser vide pour ne pas changer"
                                    className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm" 
                                />
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Confirmer le Mot de Passe</label>
                                <input 
                                    type="password" 
                                    value={data.password_confirmation}
                                    onChange={e => setData('password_confirmation', e.target.value)}
                                    className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm" 
                                />
                                {errors.password_confirmation && <p className="text-red-500 text-xs mt-1">{errors.password_confirmation}</p>}
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={processing}
                            className="bg-[#8B4513] text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-[#8B4513]/20 hover:bg-[#7a2d09] transition-all disabled:opacity-50 mt-4"
                        >
                            Sauvegarder les modifications
                        </button>
                    </div>
                </form>
            </div>
        </SellerLayout>
    );
}
