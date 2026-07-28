import React, { useState } from 'react';
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
        kyc_document_type: shop?.kyc_document_type || 'rccm',
        id_card: null,
        license: null,
    });

    const [kycFileName, setKycFileName] = useState(null);

    const handleKycFileChange = (e) => {
        const file = e.target.files[0] || null;
        setKycFileName(file ? file.name : null);
        if (kycForm.data.kyc_document_type === 'rccm') {
            kycForm.setData({ ...kycForm.data, license: file, id_card: null });
        } else {
            kycForm.setData({ ...kycForm.data, id_card: file, license: null });
        }
    };

    const submitKYC = (e) => {
        e.preventDefault();
        kycForm.post(route('seller.kyc.update'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                kycForm.setData({ ...kycForm.data, id_card: null, license: null });
                setKycFileName(null);
            },
        });
    };

    const currentDocumentUrl = shop?.kyc_document_type === 'cni' ? shop?.id_card_url : shop?.license_url;

    return (
        <SellerLayout>
            <Head title="Paramètres - LoméShop" />
            
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Paramètres du profil</h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Consultez ou modifiez vos informations personnelles.</p>
            </div>

            <div className="max-w-3xl space-y-6">
                <form onSubmit={submit} className="bg-white dark:bg-[#1e1e1e] p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-6">Informations Générales</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Nom Complet</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-[#252525] text-gray-900 dark:text-white border-none rounded-xl py-3 px-4 text-sm"
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Email</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-[#252525] text-gray-900 dark:text-white border-none rounded-xl py-3 px-4 text-sm"
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-50 dark:border-gray-800">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Nouveau Mot de Passe</label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    placeholder="Laisser vide pour ne pas changer"
                                    className="w-full bg-gray-50 dark:bg-[#252525] text-gray-900 dark:text-white border-none rounded-xl py-3 px-4 text-sm placeholder-gray-400 dark:placeholder-gray-500"
                                />
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Confirmer le Mot de Passe</label>
                                <input
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={e => setData('password_confirmation', e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-[#252525] text-gray-900 dark:text-white border-none rounded-xl py-3 px-4 text-sm"
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
                    <div className="bg-white dark:bg-[#1e1e1e] p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden transition-colors">
                        {shop.is_verified && (
                            <div className="absolute top-0 right-0 bg-[#8B4513] text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-bl-2xl shadow-sm flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                Boutique Vérifiée
                            </div>
                        )}

                        <h3 className="font-bold text-gray-900 dark:text-white mb-2">Certification Prestige (KYC)</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xl">
                            Uploadez votre document officiel (RCCM ou carte d'identité nationale) pour obtenir le badge "Vérifié". Cela renforce la confiance des clients et augmente vos ventes.
                        </p>

                        {!shop.is_verified && shop.admin_note && (
                            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-900/40 text-sm">
                                <strong className="font-black uppercase text-[10px] tracking-widest block mb-1">Motif du rejet :</strong>
                                {shop.admin_note}
                            </div>
                        )}

                        {shop.kyc_document_type ? (
                            <div className="mb-6 flex items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-gray-800">
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Document actuellement fourni</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                        {shop.kyc_document_type === 'rccm' ? 'Certificat RCCM' : 'Carte d\'identité nationale'}
                                    </p>
                                </div>
                                {currentDocumentUrl && (
                                    <a href={currentDocumentUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#8B4513] hover:underline flex items-center gap-2 bg-white dark:bg-[#121212] px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-800 shrink-0">
                                        Voir le document
                                    </a>
                                )}
                            </div>
                        ) : (
                            <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-2xl border border-orange-100 dark:border-orange-900/40 text-sm font-bold">
                                Pas encore fourni — uploadez votre RCCM ou votre CNI ci-dessous.
                            </div>
                        )}

                        <form onSubmit={submitKYC} className="space-y-6">
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => kycForm.setData('kyc_document_type', 'rccm')}
                                    className={`flex-1 px-6 py-3 rounded-xl text-xs font-bold border-2 transition-all ${
                                        kycForm.data.kyc_document_type === 'rccm'
                                        ? 'bg-[#E5E5E5] dark:bg-white/10 border-[#8B4513] text-gray-900 dark:text-white shadow-sm'
                                        : 'bg-gray-50 dark:bg-[#252525] border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'
                                    }`}
                                >
                                    Certificat RCCM
                                </button>
                                <button
                                    type="button"
                                    onClick={() => kycForm.setData('kyc_document_type', 'cni')}
                                    className={`flex-1 px-6 py-3 rounded-xl text-xs font-bold border-2 transition-all ${
                                        kycForm.data.kyc_document_type === 'cni'
                                        ? 'bg-[#E5E5E5] dark:bg-white/10 border-[#8B4513] text-gray-900 dark:text-white shadow-sm'
                                        : 'bg-gray-50 dark:bg-[#252525] border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'
                                    }`}
                                >
                                    Carte d'identité nationale
                                </button>
                            </div>

                            <div className="relative border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                <input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={handleKycFileChange}
                                    accept="image/*,.pdf"
                                />
                                <div className="text-gray-400 dark:text-gray-500">
                                    {kycFileName ? (
                                        <span className="text-sm font-bold text-[#8B4513]">{kycFileName}</span>
                                    ) : (
                                        <>
                                            <svg className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                            <span className="text-xs">Cliquez ou glissez un fichier (PDF, JPG, PNG)</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            {kycForm.errors.id_card && <p className="text-red-500 text-xs">{kycForm.errors.id_card}</p>}
                            {kycForm.errors.license && <p className="text-red-500 text-xs">{kycForm.errors.license}</p>}

                            <button
                                type="submit"
                                disabled={kycForm.processing || (!kycForm.data.id_card && !kycForm.data.license)}
                                className="bg-gray-900 dark:bg-white/10 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-gray-800 dark:hover:bg-white/20 transition-all disabled:opacity-50"
                            >
                                {shop.kyc_document_type ? 'Mettre à jour le document' : 'Soumettre pour vérification'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </SellerLayout>
    );
}
