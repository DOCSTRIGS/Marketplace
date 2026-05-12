import React from 'react';

export default function EmptyState({ title, description, icon, actionText, onAction }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center transition-colors">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 transition-colors">{title}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto mb-8 transition-colors">{description}</p>
            {actionText && (
                <button 
                    onClick={onAction}
                    className="bg-[#8B4513] text-white px-8 py-3 rounded-2xl font-bold hover:bg-[#70360f] transition-all shadow-lg shadow-[#8B4513]/20 flex items-center gap-2"
                >
                    {actionText}
                </button>
            )}
        </div>
    );
}
