import React, { useState, useEffect, useRef, useCallback } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';

const CACHE_TTL_MS = 30_000;
const cache = new Map();

function highlight(text, term) {
    if (!term) return text;
    const idx = text.toLowerCase().indexOf(term.toLowerCase());
    if (idx === -1) return text;
    return (
        <>
            {text.slice(0, idx)}
            <mark className="bg-[#FDEAE2] text-[#B03A2E] dark:bg-[#8B4513]/40 dark:text-white rounded-sm">
                {text.slice(idx, idx + term.length)}
            </mark>
            {text.slice(idx + term.length)}
        </>
    );
}

export default function SearchBar({ initialValue = '', placeholder = 'Rechercher un produit...', onClear }) {
    const [term, setTerm] = useState(initialValue);
    const [results, setResults] = useState({ categories: [], products: [] });
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const containerRef = useRef(null);
    const debounceRef = useRef(null);
    const requestIdRef = useRef(0);

    const flatResults = [
        ...results.categories.map(c => ({ type: 'category', ...c })),
        ...results.products.map(p => ({ type: 'product', ...p })),
    ];

    const fetchResults = useCallback((query) => {
        const cached = cache.get(query);
        if (cached && Date.now() - cached.time < CACHE_TTL_MS) {
            setResults(cached.data);
            setIsOpen(true);
            return;
        }

        const requestId = ++requestIdRef.current;
        setIsLoading(true);

        axios.get('/api/search', { params: { q: query } })
            .then(({ data }) => {
                if (requestId !== requestIdRef.current) return; // stale response, a newer query superseded it
                cache.set(query, { data, time: Date.now() });
                setResults(data);
                setIsOpen(true);
            })
            .catch(() => {
                if (requestId !== requestIdRef.current) return;
                setResults({ categories: [], products: [] });
            })
            .finally(() => {
                if (requestId === requestIdRef.current) setIsLoading(false);
            });
    }, []);

    useEffect(() => {
        clearTimeout(debounceRef.current);

        if (term.trim() === '') {
            setResults({ categories: [], products: [] });
            setIsOpen(false);
            return;
        }

        debounceRef.current = setTimeout(() => fetchResults(term.trim()), 300);
        return () => clearTimeout(debounceRef.current);
    }, [term, fetchResults]);

    useEffect(() => {
        setActiveIndex(-1);
    }, [results]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const goToCategory = (category) => {
        setIsOpen(false);
        router.get(route('explore'), { category_id: category.id });
    };

    const goToProduct = (product) => {
        setIsOpen(false);
        router.get(route('product.show', product.id));
    };

    const goToFullSearch = (query) => {
        setIsOpen(false);
        router.get(route('explore'), { search: query });
    };

    const selectResult = (item) => {
        if (item.type === 'category') goToCategory(item);
        else goToProduct(item);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!isOpen) { setIsOpen(true); return; }
            setActiveIndex(i => Math.min(i + 1, flatResults.length - 1));
            return;
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(i => Math.max(i - 1, -1));
            return;
        }
        if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex >= 0 && flatResults[activeIndex]) {
                selectResult(flatResults[activeIndex]);
            } else if (term.trim()) {
                goToFullSearch(term.trim());
            }
        }
    };

    const handleClear = () => {
        setTerm('');
        setResults({ categories: [], products: [] });
        setIsOpen(false);
        onClear?.();
    };

    const hasResults = results.categories.length > 0 || results.products.length > 0;

    return (
        <div ref={containerRef} className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
            <input
                type="text"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => term.trim() && hasResults && setIsOpen(true)}
                placeholder={placeholder}
                role="combobox"
                aria-expanded={isOpen}
                aria-autocomplete="list"
                className="w-full bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-800 rounded-md py-2.5 pl-10 pr-10 text-sm focus:ring-1 focus:ring-[#B03A2E] focus:outline-none focus:border-[#B03A2E] text-gray-700 dark:text-gray-200 shadow-sm transition-all"
            />
            {isLoading && (
                <div className="absolute inset-y-0 right-8 flex items-center">
                    <div className="h-3.5 w-3.5 border-2 border-gray-300 border-t-[#B03A2E] rounded-full animate-spin" />
                </div>
            )}
            {term && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-white"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}

            {isOpen && (
                <div className="absolute z-50 mt-2 w-full max-w-[calc(100vw-2rem)] bg-white dark:bg-[#1e1e1e] border border-gray-100 dark:border-gray-800 rounded-xl shadow-2xl overflow-hidden max-h-[70vh] overflow-y-auto">
                    {!hasResults && !isLoading && (
                        <div className="p-6 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Aucun résultat
                        </div>
                    )}

                    {results.categories.length > 0 && (
                        <div className="py-2">
                            <p className="px-4 pb-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">Catégories</p>
                            {results.categories.map((cat) => {
                                const flatIdx = flatResults.findIndex(r => r.type === 'category' && r.id === cat.id);
                                return (
                                    <button
                                        key={`cat-${cat.id}`}
                                        onClick={() => goToCategory(cat)}
                                        onMouseEnter={() => setActiveIndex(flatIdx)}
                                        className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors ${activeIndex === flatIdx ? 'bg-[#FDF8F4] dark:bg-white/5' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}
                                    >
                                        <svg className="h-3.5 w-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5m14 14H5" /></svg>
                                        <span className="text-gray-700 dark:text-gray-200">{highlight(cat.name, term)}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {results.products.length > 0 && (
                        <div className="py-2 border-t border-gray-50 dark:border-gray-800">
                            <p className="px-4 pb-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">Produits</p>
                            {results.products.map((prod) => {
                                const flatIdx = flatResults.findIndex(r => r.type === 'product' && r.id === prod.id);
                                return (
                                    <button
                                        key={`prod-${prod.id}`}
                                        onClick={() => goToProduct(prod)}
                                        onMouseEnter={() => setActiveIndex(flatIdx)}
                                        className={`w-full text-left px-4 py-2 flex items-center gap-3 transition-colors ${activeIndex === flatIdx ? 'bg-[#FDF8F4] dark:bg-white/5' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}
                                    >
                                        <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-[#252525] overflow-hidden shrink-0">
                                            {prod.image && <img src={prod.image} alt="" className="w-full h-full object-cover" />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm text-gray-700 dark:text-gray-200 truncate">{highlight(prod.name, term)}</p>
                                            {prod.category_name && (
                                                <p className="text-[10px] text-gray-400">{prod.category_name}</p>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {hasResults && (
                        <button
                            onClick={() => goToFullSearch(term.trim())}
                            className="w-full text-center px-4 py-3 text-[11px] font-black text-[#B03A2E] uppercase tracking-widest border-t border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                        >
                            Voir tous les résultats pour « {term.trim()} »
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
