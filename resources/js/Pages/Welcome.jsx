import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import { motion } from 'framer-motion';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import CategoryProductCard from '@/Components/CategoryProductCard';
import HomeCarousel from '@/Components/HomeCarousel';

const revealSection = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function Welcome({ auth, products = [], carouselSlides = [], productsByCategory = [], featuredShops = [] }) {
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [newsletterState, setNewsletterState] = useState('idle'); // idle | loading | success | error
    const [newsletterMessage, setNewsletterMessage] = useState('');

    const submitNewsletter = async (e) => {
        e.preventDefault();
        setNewsletterState('loading');
        try {
            const res = await axios.post(route('newsletter.subscribe'), { email: newsletterEmail });
            setNewsletterState('success');
            setNewsletterMessage(res.data.message);
            setNewsletterEmail('');
        } catch (error) {
            setNewsletterState('error');
            setNewsletterMessage(error.response?.data?.errors?.email?.[0] || 'Une erreur est survenue, réessayez.');
        }
    };

    return (
        <div className="min-h-screen bg-[#FDF8F4] dark:bg-[#121212] flex flex-col font-sans transition-colors duration-300">
            <Head title="Accueil" />
            <Navbar elegant />

            <main className="flex-grow w-full pb-16">

                {/* Hero: rotating carousel across all categories — full-bleed, always dark/gold premium look */}
                <HomeCarousel slides={carouselSlides} />

                {/* Rest of the homepage content: back to the site's normal white/light background */}
                <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-16">

                    {/* Éditorial: bandeau de marque premium, entre le hero et les produits */}
                    {carouselSlides.length > 0 && (
                        <motion.section
                            className="relative rounded-2xl overflow-hidden mb-16 min-h-[340px] flex items-center justify-center text-center p-10 md:p-16"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.2 }}
                            variants={revealSection}
                        >
                            <img
                                src={(carouselSlides[1] || carouselSlides[0]).image}
                                alt=""
                                loading="lazy"
                                decoding="async"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60"></div>
                            <div className="relative z-10 max-w-xl mx-auto">
                                <p className="text-[#F39C12] text-xs font-bold tracking-[0.2em] uppercase mb-4">L'excellence artisanale</p>
                                <h3 className="font-serif italic text-3xl md:text-[40px] text-white leading-tight mb-5">
                                    Des produits authentiques,<br />une qualité irréprochable.
                                </h3>
                                <p className="text-gray-200 text-sm md:text-base leading-relaxed mb-8">
                                    Chaque article est sélectionné avec soin pour sa qualité, son authenticité et son savoir-faire.
                                </p>
                                <Link
                                    href={route('explore')}
                                    className="inline-block bg-[#D4AF7A] hover:bg-[#c9a15f] text-[#1a0f00] px-8 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg hover:scale-[1.03] active:scale-[0.98]"
                                >
                                    Découvrir la collection
                                </Link>
                            </div>
                        </motion.section>
                    )}

                    {/* Products by category */}
                    {productsByCategory.length > 0 ? (
                        productsByCategory.map((group) => (
                            <motion.section key={group.category_id} className="mb-16" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={revealSection}>
                                <div className="flex justify-between items-end mb-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-[#222222] dark:text-white mb-1">{group.category_name}</h3>
                                        <p className="text-[#777777] dark:text-gray-400 text-sm">Les articles les plus recherchés en ce moment à Lomé.</p>
                                    </div>
                                    <Link href={route('explore', { category_id: group.category_id })} className="text-[#8B4513] dark:text-[#D4AF7A] font-bold text-sm hover:underline hidden sm:flex items-center">
                                        Voir tout
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </Link>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {group.products.map((product, index) => (
                                        <CategoryProductCard key={product.id} product={product} index={index} />
                                    ))}
                                </div>
                            </motion.section>
                        ))
                    ) : (
                        <motion.section className="mb-16" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={revealSection}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {products && products.length > 0 ? (
                                    products.map((product, index) => (
                                        <CategoryProductCard key={product.id} product={product} index={index} />
                                    ))
                                ) : (
                                    <p className="text-gray-500 col-span-full">Aucun produit disponible pour le moment.</p>
                                )}
                            </div>
                        </motion.section>
                    )}

                    {/* Boutiques à la une */}
                    {featuredShops.length > 0 && (
                        <motion.section className="mb-16" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={revealSection}>
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-[#222222] dark:text-white mb-1">Boutiques à la une</h3>
                                <p className="text-[#777777] dark:text-gray-400 text-sm">Des vendeurs vérifiés, prêts à vous livrer à Lomé.</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {featuredShops.map((shop) => (
                                    <Link
                                        key={shop.id}
                                        href={route('explore', { shop_id: shop.id })}
                                        className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow text-center"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-[#EFE9E1] dark:bg-[#252525] mx-auto mb-4 overflow-hidden flex items-center justify-center text-[#8B4513] dark:text-[#D4AF7A] font-black text-xl">
                                            {shop.logo_url ? (
                                                <img src={shop.logo_url} alt={shop.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                                            ) : (
                                                shop.name.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div className="flex items-center justify-center gap-1.5 mb-1">
                                            <h4 className="font-bold text-gray-900 dark:text-white truncate">{shop.name}</h4>
                                            {shop.is_verified && (
                                                <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20" title="Boutique vérifiée">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 truncate">{shop.slogan || 'Vendeur LoméShop'}</p>
                                        {shop.reviews_count > 0 ? (
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                                                <span className="text-amber-500">★</span>
                                                {parseFloat(shop.reviews_avg_rating).toFixed(1)}/5
                                                <span className="text-gray-400 dark:text-gray-500">({shop.reviews_count} avis)</span>
                                            </p>
                                        ) : (
                                            <p className="text-[11px] text-gray-400 dark:text-gray-500">{shop.products_count} produit{shop.products_count > 1 ? 's' : ''}</p>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </motion.section>
                    )}

                    {/* Newsletter */}
                    <motion.section
                        className="bg-[#7B3F00] rounded-2xl p-10 md:p-16 text-center shadow-lg relative overflow-hidden"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={revealSection}
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#8B4513] rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#8B4513] rounded-full blur-3xl opacity-50 -ml-16 -mb-16"></div>

                        <div className="relative z-10 max-w-2xl mx-auto">
                            <h3 className="text-3xl font-bold text-white mb-4">Ne ratez aucune bonne affaire</h3>
                            <p className="text-[#E6DCCF] mb-10 text-lg leading-relaxed">
                                Inscrivez-vous pour recevoir les meilleures offres de vos boutiques préférées à Lomé directement dans votre boite mail.
                            </p>

                            {newsletterState === 'success' ? (
                                <p className="text-white font-bold bg-white/10 rounded-lg px-6 py-4 inline-block">{newsletterMessage}</p>
                            ) : (
                                <form onSubmit={submitNewsletter} className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <div className="w-full sm:w-80">
                                        <input
                                            type="email"
                                            required
                                            value={newsletterEmail}
                                            onChange={(e) => setNewsletterEmail(e.target.value)}
                                            placeholder="votre@email.com"
                                            className="w-full px-6 py-4 rounded-lg border-none focus:ring-2 focus:ring-[#E67E22] text-gray-900 bg-white dark:bg-gray-100 placeholder-gray-400 shadow-sm"
                                        />
                                        {newsletterState === 'error' && (
                                            <p className="text-[#FFD9C2] text-xs font-bold mt-2 text-left">{newsletterMessage}</p>
                                        )}
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={newsletterState === 'loading'}
                                        className="bg-[#F08A5D] hover:bg-[#E67E22] text-white px-8 py-4 rounded-lg font-bold transition-colors shadow-sm whitespace-nowrap disabled:opacity-60"
                                    >
                                        {newsletterState === 'loading' ? 'Envoi...' : "S'abonner"}
                                    </button>
                                </form>
                            )}
                        </div>
                    </motion.section>

                </div>
            </main>

            <Footer />
        </div>
    );
}
