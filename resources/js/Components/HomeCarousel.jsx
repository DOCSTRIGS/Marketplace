import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';

const AUTO_ADVANCE_MS = 5500;
const EASE = [0.22, 1, 0.36, 1];

const textContainer = {
    animate: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};
const textItem = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.25, ease: EASE } },
};

export default function HomeCarousel({ slides = [] }) {
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const startRef = useRef(Date.now());

    const next = useCallback(() => {
        setIndex(i => (i + 1) % slides.length);
        startRef.current = Date.now();
    }, [slides.length]);

    const goTo = (i) => {
        setIndex(i);
        startRef.current = Date.now();
    };

    useEffect(() => {
        if (slides.length < 2 || paused) return;
        const timer = setInterval(next, AUTO_ADVANCE_MS);
        return () => clearInterval(timer);
    }, [next, slides.length, paused]);

    if (slides.length === 0) {
        return (
            <div className="relative min-h-[540px] bg-[#160f08] flex items-center justify-center">
                <p className="text-white/70 font-bold text-sm">Découvrez nos boutiques sur LoméShop</p>
            </div>
        );
    }

    const slide = slides[index];

    return (
            /* Hero band: full-bleed, always dark/gold premium look regardless of the site's light/dark toggle */
            <div
                className="group relative min-h-[540px] md:min-h-[640px] flex items-center overflow-hidden bg-[#160f08]"
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
            >
                {/* Image layer: crossfade + slow continuous Ken Burns zoom, bleeding across the whole hero */}
                <AnimatePresence>
                    <motion.div
                        key={slide.category_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.9, ease: EASE } }}
                        transition={{ duration: 0.9, ease: EASE }}
                        className="absolute inset-0"
                    >
                        <motion.img
                            src={slide.image}
                            alt={slide.category_name}
                            initial={{ scale: 1 }}
                            animate={{ scale: 1.12 }}
                            transition={{ duration: (AUTO_ADVANCE_MS + 900) / 1000, ease: 'linear' }}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        {/* Dark scrim behind the text only, image stays vivid across the rest of the hero */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent"></div>
                    </motion.div>
                </AnimatePresence>

                {/* Text layer */}
                <div className="relative p-8 md:p-12 w-full md:w-1/2 lg:w-[46%] overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={slide.category_id}
                            variants={textContainer}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                        >
                            <motion.span variants={textItem} className="inline-block text-[#F39C12] text-xs font-bold tracking-widest uppercase mb-4 border border-[#F39C12]/40 rounded-full px-4 py-1.5">
                                Sélection du moment
                            </motion.span>
                            <motion.h3 variants={textItem} className="text-3xl md:text-[44px] font-bold mb-4 leading-[1.1] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">
                                {slide.category_name}
                            </motion.h3>
                            <motion.p variants={textItem} className="text-gray-200 mb-8 text-sm md:text-base leading-relaxed max-w-md drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]">
                                Découvrez une sélection de produits authentiques choisis par nos vendeurs de Lomé.
                            </motion.p>

                            <motion.div variants={textItem}>
                                <Link
                                    href={route('explore', { category_id: slide.category_id })}
                                    prefetch
                                    className="inline-block bg-[#D4AF7A] hover:bg-[#c9a15f] text-[#1a0f00] px-8 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg hover:scale-[1.03] active:scale-[0.98]"
                                >
                                    Découvrir la collection
                                </Link>
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Prev / Next controls, revealed on hover */}
                {slides.length > 1 && (
                    <>
                        <button
                            onClick={() => goTo((index - 1 + slides.length) % slides.length)}
                            aria-label="Slide précédent"
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity z-10"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        </button>
                        <button
                            onClick={next}
                            aria-label="Slide suivant"
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity z-10"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                        </button>
                    </>
                )}

                {/* Progress-bar style indicators (à la Stories) */}
                {slides.length > 1 && (
                    <div className="absolute top-4 left-4 right-4 flex gap-1.5 z-10">
                        {slides.map((s, i) => (
                            <button
                                key={s.category_id}
                                onClick={() => goTo(i)}
                                aria-label={`Aller au slide ${i + 1}`}
                                className="h-[3px] flex-1 rounded-full bg-white/25 overflow-hidden"
                            >
                                {i === index && (
                                    <motion.div
                                        key={index}
                                        className="h-full bg-white rounded-full"
                                        initial={{ width: '0%' }}
                                        animate={{ width: '100%' }}
                                        transition={{ duration: AUTO_ADVANCE_MS / 1000, ease: 'linear' }}
                                    />
                                )}
                                {i < index && <div className="h-full w-full bg-white rounded-full" />}
                            </button>
                        ))}
                    </div>
                )}
            </div>
    );
}
