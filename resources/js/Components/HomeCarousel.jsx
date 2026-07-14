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
            <div className="md:col-span-2 relative rounded-2xl overflow-hidden min-h-[300px] shadow-sm bg-[#EFE9E1] dark:bg-[#252525] flex items-center justify-center">
                <p className="text-[#8B4513] dark:text-gray-400 font-bold text-sm">Découvrez nos boutiques sur LoméShop</p>
            </div>
        );
    }

    const slide = slides[index];

    return (
        <div
            className="group md:col-span-2 relative rounded-2xl overflow-hidden min-h-[300px] shadow-sm flex items-end"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            {/* Image layer: crossfade + slow continuous Ken Burns zoom */}
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                </motion.div>
            </AnimatePresence>

            {/* Text layer */}
            <div className="relative p-8 md:p-10 w-full md:w-4/5 text-white overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={slide.category_id}
                        variants={textContainer}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                    >
                        <motion.p variants={textItem} className="text-[#F39C12] text-xs font-bold tracking-widest uppercase mb-3">
                            Sélection du moment
                        </motion.p>
                        <motion.h3 variants={textItem} className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                            {slide.category_name}
                        </motion.h3>
                        <motion.p variants={textItem} className="text-gray-200 mb-6 text-sm md:text-base leading-relaxed max-w-md">
                            Découvrez une sélection de produits authentiques choisis par nos vendeurs de Lomé.
                        </motion.p>
                        <motion.div variants={textItem}>
                            <Link
                                href={route('explore', { category_id: slide.category_id })}
                                className="inline-block bg-[#E67E22] hover:bg-[#D35400] text-white px-6 py-3 rounded-lg font-bold text-sm transition-all shadow-lg border border-[#E67E22]/50 hover:scale-[1.03] active:scale-[0.98]"
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
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity z-10"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </button>
                    <button
                        onClick={next}
                        aria-label="Slide suivant"
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity z-10"
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
