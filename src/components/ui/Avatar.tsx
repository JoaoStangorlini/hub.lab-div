'use client';

import React, { useState } from 'react';
import { User } from 'lucide-react';
import { getAvatarUrl } from '@/lib/utils';
import { getRadiationTier } from '@/lib/radiation';

interface AvatarProps {
    src?: string | null;
    name?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
    className?: string;
    customSize?: string;
    xp?: number;
    level?: number;
    isLabDiv?: boolean;
}

const sizeClasses = {
    xs: 'size-6',
    sm: 'size-8',
    md: 'size-10',
    lg: 'size-12',
    xl: 'size-20',
    custom: '',
};

const badgeSizeClasses = {
    xs: 'size-2 text-[6px]',
    sm: 'size-3 text-[8px]',
    md: 'size-4 text-[10px]',
    lg: 'size-5 text-[12px]',
    xl: 'size-6 text-[14px]',
    custom: 'size-4 text-[10px]',
};

export const Avatar = ({ src, name = 'Usuário', size = 'md', className = '', customSize, xp, level, isLabDiv }: AvatarProps) => {
    const [error, setError] = useState(false);

    // Tier calculations
    const tier = xp !== undefined ? getRadiationTier(xp) : null;
    const isDarkMatter = tier?.id === 'materia_escura';

    const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

    const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 3;
    const placeholderColors = [
        'bg-brand-blue/10 text-brand-blue',
        'bg-brand-yellow/10 text-brand-yellow',
        'bg-brand-red/10 text-brand-red',
    ];

    const sizeClass = size === 'custom' ? customSize : sizeClasses[size];
    const badgeSize = badgeSizeClasses[size];

    const renderContent = () => {
        if (src && !error) {
            return (
                <img
                    src={getAvatarUrl(src)}
                    alt={name}
                    className="w-full h-full object-cover rounded-full"
                    onError={() => setError(true)}
                />
            );
        }

        return (
            <div className={`w-full h-full rounded-full flex items-center justify-center font-black uppercase tracking-tighter ${placeholderColors[colorIndex]}`}>
                {initials || <User className="w-1/2 h-1/2 opacity-50" />}
            </div>
        );
    };

    // Construct the split ring style
    const ringStyle = isLabDiv ? {
        background: `conic-gradient(
            from 270deg,
            #3B82F6 0deg,
            #FFB300 90deg,
            #E63946 180deg,
            ${tier?.hex || '#6B7280'} 180deg 360deg
        )`
    } : tier ? {
        backgroundColor: tier.hex
    } : {
        backgroundColor: '#D1D5DB' // gray-300
    };

    return (
        <div className={`relative shrink-0 ${sizeClass} ${className}`}>
            {/* The Ring Container */}
            <div
                className={`w-full h-full rounded-full p-[3px] transition-all
                    ${isDarkMatter ? 'shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'shadow-md'}
                `}
                style={ringStyle}
            >
                {/* The Inner Content */}
                <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-white dark:bg-[#121212]">
                    {renderContent()}
                </div>
            </div>

            {/* Tier Badge / Seal */}
            {tier && (
                <div
                    className={`absolute bottom-0 right-0 ${badgeSize} rounded-full z-10 flex items-center justify-center shadow-xl border-2 border-white dark:border-gray-950 ${tier.bgColor} translate-x-[20%] translate-y-[20%]`}
                    title={`${tier.name} (Lvl ${level || tier.level})`}
                >
                    <span className="leading-none transform scale-95">{tier.emoji}</span>
                </div>
            )}
        </div>
    );
};
