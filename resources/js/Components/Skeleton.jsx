import React from 'react';

export default function Skeleton({ className = '', variant = 'rectangular', animation = 'pulse' }) {
    const baseClass = 'bg-gray-200 dark:bg-gray-800';
    const animationClass = animation === 'pulse' ? 'animate-pulse' : animation === 'wave' ? 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent' : '';
    
    let shapeClass = '';
    switch (variant) {
        case 'circular':
            shapeClass = 'rounded-full';
            break;
        case 'text':
            shapeClass = 'rounded-md h-4';
            break;
        case 'rectangular':
        default:
            shapeClass = 'rounded-2xl';
            break;
    }

    return (
        <div className={`${baseClass} ${animationClass} ${shapeClass} ${className}`}></div>
    );
}
