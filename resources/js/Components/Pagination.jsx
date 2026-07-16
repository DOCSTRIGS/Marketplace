import React from 'react';
import { router } from '@inertiajs/react';

// Prev/next/number controls for a Laravel paginator prop ({ data, links, total, ... }).
export default function Pagination({ paginator, className = '' }) {
    if (!paginator || paginator.last_page <= 1) return null;

    return (
        <div className={`flex items-center justify-center flex-wrap gap-1 mt-6 ${className}`}>
            {paginator.links.map((link, i) => (
                <button
                    key={i}
                    disabled={!link.url}
                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        link.active ? 'bg-[#8B4513] text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    } ${!link.url ? 'opacity-30 cursor-not-allowed' : ''}`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                />
            ))}
        </div>
    );
}
