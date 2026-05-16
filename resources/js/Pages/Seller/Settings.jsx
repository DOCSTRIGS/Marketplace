import React from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';

export default function Settings() {
    const { user, shop } = usePage().props;
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

    const kycForm = useForm({
        id_card: null,
        license: null,
    });

    const submitKYC = (e) => {
        e.preventDefault();
        kycForm.post(route('seller.kyc.update'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => kycForm.reset(),
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

                {shop && (
                    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden">
                        {shop.is_verified && (
                            <div className="absolute top-0 right-0 bg-[#8B4513] text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-bl-2xl shadow-sm flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                Boutique Vérifiée
                            </div>
                        )}
                        
                        <h3 className="font-bold text-gray-900 mb-2">Certification Prestige (KYC)</h3>
                        <p className="text-sm text-gray-500 mb-6 max-w-xl">
                            Uploadez vos documents officiels pour obtenir le badge "Vérifié". Cela renforce la confiance des clients et augmente vos ventes.
                        </p>

                        {!shop.is_verified && shop.admin_note && (
                            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-sm">
                                <strong className="font-black uppercase text-[10px] tracking-widest block mb-1">Motif du rejet :</strong>
                                {shop.admin_note}
                            </div>
                        )}

                        <form onSubmit={submitKYC} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex justify-between">
                                        <span>Carte d'identité (CNI)</span>
                                        {shop.id_card_path && <span className="text-green-500 flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Reçu</span>}
                                    </label>
                                    <div className="relative border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:bg-gray-50 transition-colors">
                                        <input 
                                            type="file" 
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={e => kycForm.setData('id_card', e.target.files[0])}
                                            accept="image/*"
                                        />
                                        <div className="text-gray-400">
                                            {kycForm.data.id_card ? (
                                                <span className="text-sm font-bold text-[#8B4513]">{kycForm.data.id_card.name}</span>
                                            ) : (
                                                <>
                                                    <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                    <span className="text-xs">Cliquez ou glissez une image</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {kycForm.errors.id_card && <p className="text-red-500 text-xs">{kycForm.errors.id_card}</p>}
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex justify-between">
                                        <span>Permis de conduire / NIF</span>
                                        {shop.license_path && <span className="text-green-500 flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Reçu</span>}
                                    </label>
                                    <div className="relative border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:bg-gray-50 transition-colors">
                                        <input 
                                            type="file" 
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={e => kycForm.setData('license', e.target.files[0])}
                                            accept="image/*"
                                        />
                                        <div className="text-gray-400">
                                            {kycForm.data.license ? (
                                                <span className="text-sm font-bold text-[#8B4513]">{kycForm.data.license.name}</span>
                                            ) : (
                                                <>
                                                    <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                                    <span className="text-xs">Cliquez ou glissez un document</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {kycForm.errors.license && <p className="text-red-500 text-xs">{kycForm.errors.license}</p>}
                                </div>
                            </div>

                            {!shop.is_verified && (
                                <button 
                                    type="submit" 
                                    disabled={kycForm.processing || (!kycForm.data.id_card && !kycForm.data.license)}
                                    className="bg-gray-900 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-gray-800 transition-all disabled:opacity-50"
                                >
                                    Soumettre pour vérification
                                </button>
                            )}
                        </form>
                    </div>
                )}
            </div>
        </SellerLayout>
    );
}
