import React, { useState, useCallback } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import { APIProvider, Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const LocationPicker = ({ onLocationSelect, initialLocation }) => {
    const map = useMap();
    const [markerPos, setMarkerPos] = useState(initialLocation || { lat: 6.1372, lng: 1.2125 });

    const handleMapClick = useCallback((e) => {
        const newPos = { lat: e.detail.latLng.lat, lng: e.detail.latLng.lng };
        setMarkerPos(newPos);
        onLocationSelect(newPos);
    }, [onLocationSelect]);

    const useCurrentLocation = () => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition((position) => {
            const newPos = { lat: position.coords.latitude, lng: position.coords.longitude };
            setMarkerPos(newPos);
            onLocationSelect(newPos);
            if (map) map.panTo(newPos);
        }, (err) => {
            console.error("Geolocation error:", err);
            alert("Impossible de récupérer votre position. Assurez-vous d'avoir activé la géolocalisation.");
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Emplacement exact sur la carte</label>
                <button 
                    type="button"
                    onClick={useCurrentLocation}
                    className="flex items-center gap-1.5 text-[10px] font-black text-[#8B4513] hover:opacity-70 transition-opacity uppercase tracking-widest"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Ma position actuelle
                </button>
            </div>
            <div className="h-[250px] w-full rounded-2xl overflow-hidden border-2 border-[#EEEEEE] dark:border-gray-700 relative">
                <Map
                    defaultCenter={markerPos}
                    defaultZoom={15}
                    onClick={handleMapClick}
                    mapId="shop-setup-map"
                    disableDefaultUI={true}
                    zoomControl={true}
                >
                    <AdvancedMarker position={markerPos} />
                </Map>
                <div className="absolute bottom-2 left-2 right-2 bg-white/80 dark:bg-[#1e1e1e]/80 backdrop-blur-sm p-2 rounded-lg pointer-events-none text-[9px] font-bold text-gray-500 dark:text-gray-400 text-center uppercase">
                    Cliquez sur la carte pour placer votre boutique
                </div>
            </div>
        </div>
    );
};

export default function ShopSetup({ neighborhoods, categories }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        slogan: '',
        description: '',
        neighborhood_id: '',
        phone: '',
        categories: [],
        delivery_available: false,
        delivery_fee: '1500',
        coverage_area: 'Lomé et environs',
        latitude: 6.1372,
        longitude: 1.2125,
    });

    const [logoPreview, setLogoPreview] = useState(null);

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const toggleCategory = (catName) => {
        const newCats = data.categories.includes(catName)
            ? data.categories.filter(c => c !== catName)
            : [...data.categories, catName];
        setData('categories', newCats);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('shops.store'));
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#121212] font-sans text-gray-900 dark:text-white pb-20 transition-colors">
            <Head title="Créer ma boutique - LoméShop" />
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 pt-12">
                <header className="mb-12">
                    <h1 className="text-[42px] font-black tracking-tight text-gray-900 dark:text-white mb-2">Créer ma boutique</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl font-medium">
                        Rejoignez la communauté des meilleurs artisans et vendeurs de Lomé.
                        Configurez votre espace de vente en quelques minutes.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Form Side */}
                    <div className="lg:col-span-7 bg-[#F9F9F9] dark:bg-[#1e1e1e] rounded-[40px] p-10 border border-gray-100 dark:border-gray-800 transition-colors">
                        <form onSubmit={handleSubmit} className="space-y-10">

                            {/* Logo Section */}
                            <div className="flex items-center gap-10">
                                <label className="relative group cursor-pointer">
                                    <div className="w-32 h-32 rounded-full border-2 border-dashed border-[#B03A2E] flex flex-col items-center justify-center bg-white dark:bg-[#252525] transition-all group-hover:bg-red-50 dark:group-hover:bg-red-900/20 overflow-hidden">
                                        {logoPreview ? (
                                            <img src={logoPreview} className="w-full h-full object-cover" alt="Logo preview" />
                                        ) : (
                                            <>
                                                <svg className="w-8 h-8 text-[#B03A2E] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span className="text-[10px] font-black text-[#B03A2E] uppercase tracking-widest">Upload</span>
                                            </>
                                        )}
                                    </div>
                                    <input type="file" className="hidden" onChange={handleLogoChange} accept="image/*" />
                                </label>
                                <div>
                                    <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-1">Logo de la boutique</h4>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed max-w-[220px]">
                                        Format recommandé : Carré (500x500px). PNG ou JPG, max 2MB.
                                    </p>
                                </div>
                            </div>

                            {/* Name & Slogan */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Nom de la boutique</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Maison de l'Artisan"
                                        className="w-full bg-[#EEEEEE] dark:bg-[#252525] text-gray-900 dark:text-white border-none rounded-xl py-4 px-6 text-sm focus:ring-2 focus:ring-[#8B4513] transition-all"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Slogan</label>
                                    <input
                                        type="text"
                                        placeholder="L'élégance à la togolaise"
                                        className="w-full bg-[#EEEEEE] dark:bg-[#252525] text-gray-900 dark:text-white border-none rounded-xl py-4 px-6 text-sm focus:ring-2 focus:ring-[#8B4513] transition-all"
                                        value={data.slogan}
                                        onChange={e => setData('slogan', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Description (Biographie de l'artisan)</label>
                                <textarea
                                    placeholder="Partagez votre histoire et votre savoir-faire..."
                                    className="w-full bg-[#EEEEEE] dark:bg-[#252525] text-gray-900 dark:text-white border-none rounded-xl py-4 px-6 text-sm focus:ring-2 focus:ring-[#8B4513] transition-all h-32 resize-none"
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                />
                            </div>

                            {/* Geolocation Section */}
                            <div className="pt-4">
                                <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                                    <LocationPicker 
                                        onLocationSelect={(pos) => {
                                            setData(data => ({ ...data, latitude: pos.lat, longitude: pos.lng }));
                                        }}
                                        initialLocation={{ lat: data.latitude, lng: data.longitude }}
                                    />
                                </APIProvider>
                            </div>

                            {/* WhatsApp */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Téléphone WhatsApp</label>
                                <div className="flex bg-[#EEEEEE] dark:bg-[#252525] rounded-xl overflow-hidden">
                                    <span className="py-4 px-4 text-sm text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">+228</span>
                                    <input
                                        type="text"
                                        placeholder="90 00 00 00"
                                        className="w-full bg-transparent border-none py-4 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-0 transition-all"
                                        value={data.phone}
                                        onChange={e => setData('phone', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Categories Dynamic */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Catégories d'activités</label>
                                <div className="flex flex-wrap gap-3">
                                    {categories && categories.length > 0 ? categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => toggleCategory(cat.name)}
                                            className={`px-6 py-3 rounded-xl text-xs font-bold border-2 transition-all flex items-center gap-2 ${
                                                data.categories.includes(cat.name)
                                                ? 'bg-[#E5E5E5] dark:bg-white/10 border-[#8B4513] text-gray-900 dark:text-white shadow-sm'
                                                : 'bg-[#EEEEEE] dark:bg-[#252525] border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                                            }`}
                                        >
                                            <div className={`w-3.5 h-3.5 rounded border ${data.categories.includes(cat.name) ? 'bg-[#8B4513] border-[#8B4513]' : 'bg-white dark:bg-[#1e1e1e] border-gray-300 dark:border-gray-600'} flex items-center justify-center`}>
                                                {data.categories.includes(cat.name) && <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>}
                                            </div>
                                            {cat.name}
                                        </button>
                                    )) : (
                                        ['Artisanat', 'Électronique', 'Mode', 'Gastronomie'].map(cat => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => toggleCategory(cat)}
                                                className={`px-6 py-3 rounded-xl text-xs font-bold border-2 transition-all flex items-center gap-2 ${
                                                    data.categories.includes(cat)
                                                    ? 'bg-[#E5E5E5] dark:bg-white/10 border-[#8B4513] text-gray-900 dark:text-white shadow-sm'
                                                    : 'bg-[#EEEEEE] dark:bg-[#252525] border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                                                }`}
                                            >
                                                <div className={`w-3.5 h-3.5 rounded border ${data.categories.includes(cat) ? 'bg-[#8B4513] border-[#8B4513]' : 'bg-white dark:bg-[#1e1e1e] border-gray-300 dark:border-gray-600'} flex items-center justify-center`}>
                                                    {data.categories.includes(cat) && <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>}
                                                </div>
                                                {cat}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Delivery Section */}
                            <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">Livraison disponible</h4>
                                        <p className="text-xs text-gray-400 dark:text-gray-500">Activez cette option si vous proposez la livraison à domicile.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setData('delivery_available', !data.delivery_available)}
                                        className={`w-14 h-8 rounded-full transition-all relative ${data.delivery_available ? 'bg-[#8B4513]' : 'bg-gray-300 dark:bg-gray-700'}`}
                                    >
                                        <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-sm ${data.delivery_available ? 'left-7' : 'left-1'}`}></div>
                                    </button>
                                </div>

                                <div className={`grid grid-cols-2 gap-6 transition-all duration-500 ${data.delivery_available ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Frais de livraison standard (CFA)</label>
                                        <input
                                            type="text"
                                            className="w-full bg-[#EEEEEE] dark:bg-[#252525] text-gray-900 dark:text-white border-none rounded-xl py-4 px-6 text-sm"
                                            value={data.delivery_fee}
                                            onChange={e => setData('delivery_fee', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Zone de couverture</label>
                                        <input
                                            type="text"
                                            className="w-full bg-[#EEEEEE] dark:bg-[#252525] text-gray-900 dark:text-white border-none rounded-xl py-4 px-6 text-sm"
                                            value={data.coverage_area}
                                            onChange={e => setData('coverage_area', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full max-w-[300px] py-5 bg-[#8B4513] text-white font-black rounded-2xl shadow-2xl hover:bg-[#7a2d09] transition-all transform hover:-translate-y-1 active:scale-95"
                            >
                                {processing ? 'Ouverture...' : 'Ouvrir ma boutique'}
                            </button>
                        </form>
                    </div>

                    {/* Preview Side */}
                    <div className="lg:col-span-5 relative">
                        <div className="sticky top-32">
                            <div className="flex items-center gap-3 mb-6">
                                <svg className="w-5 h-5 text-[#8B4513]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <h3 className="font-bold text-gray-900 dark:text-white">Aperçu en direct</h3>
                            </div>

                            <div className="bg-white dark:bg-[#1e1e1e] rounded-[32px] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-gray-800 transition-colors">
                                <div className="h-40 bg-gradient-to-br from-[#E2D1C3] to-[#D6B8A0] relative">
                                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]"></div>
                                </div>

                                <div className="px-8 pb-8 -mt-16 relative">
                                    <div className="w-32 h-32 rounded-full border-8 border-white dark:border-[#1e1e1e] bg-gray-100 dark:bg-[#252525] shadow-lg mb-4 overflow-hidden">
                                        {logoPreview ? (
                                            <img src={logoPreview} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-[#252525]">
                                                <svg className="w-12 h-12 text-gray-200 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                                                {data.name || '[Nom de la Boutique]'}
                                            </h2>
                                            <p className="text-[#8B4513] italic text-sm font-medium">
                                                "{data.slogan || '[Slogan de la boutique]'}"
                                            </p>
                                        </div>
                                        <div className="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-[9px] font-black px-2 py-1 rounded flex items-center gap-1 border border-orange-100 dark:border-orange-900/40 whitespace-nowrap">
                                            VENDEUR VÉRIFIÉ
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-4 text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-4">
                                        <span className="flex items-center gap-1">{neighborhoods.find(n => n.id == data.neighborhood_id)?.name || '[Quartier]'}</span>
                                        <span className="flex items-center gap-1">{data.delivery_available ? 'Livraison dispo.' : 'Retrait boutique'}</span>
                                    </div>

                                    {/* Selected Categories in Preview */}
                                    {data.categories.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {data.categories.map(cat => (
                                                <span key={cat} className="bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">{cat}</span>
                                            ))}
                                        </div>
                                    )}

                                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
                                        {data.description || "La biographie de votre boutique apparaîtra ici. Racontez votre histoire et ce qui rend vos produits uniques pour attirer les clients de Lomé."}
                                    </p>

                                    <div className="mb-8">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-bold text-sm text-gray-900 dark:text-white">Produits populaires</h4>
                                            <span className="text-[10px] font-black text-[#8B4513] uppercase cursor-pointer">Voir tout</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="aspect-square bg-gray-50 dark:bg-[#252525] rounded-2xl flex items-center justify-center">
                                                <svg className="w-8 h-8 text-gray-200 dark:text-gray-600" fill="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            </div>
                                            <div className="aspect-square bg-gray-50 dark:bg-[#252525] rounded-2xl flex items-center justify-center">
                                                <svg className="w-8 h-8 text-gray-200 dark:text-gray-600" fill="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            </div>
                                        </div>
                                    </div>

                                    <button disabled className="w-full py-4 bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-500 font-black rounded-2xl text-xs uppercase tracking-widest border border-gray-100 dark:border-gray-800">
                                        Contacter via WhatsApp
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="mt-20 pt-12 border-t border-gray-100 dark:border-gray-800 px-6 max-w-7xl mx-auto flex justify-between items-center text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                <div>
                    <h3 className="text-gray-900 dark:text-white font-bold mb-1">LoméShop</h3>
                    <p>© 2026 LoméShop. Fabriqué avec soin au Togo.</p>
                </div>
                <div className="flex gap-8">
                    <span>Conditions d'utilisation</span>
                    <span>Aide</span>
                    <span className="text-[#8B4513] font-bold">Vendre sur LoméShop</span>
                </div>
            </footer>
        </div>
    );
}
