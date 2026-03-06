import React, { useState } from 'react';

export function HelpTooltip({ text }: { text: string }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative inline-block ml-2">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
                className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-brand-blue/10 hover:text-brand-blue transition-all"
            >
                <span className="material-symbols-outlined text-xs">help</span>
            </button>
            {isOpen && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-3 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
                    <p className="text-[10px] text-gray-300 font-medium leading-relaxed normal-case tracking-normal">
                        {text}
                    </p>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
                </div>
            )}
        </div>
    );
}
