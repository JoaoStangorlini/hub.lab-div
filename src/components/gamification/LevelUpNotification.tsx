'use client';

import React, { useEffect, useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { getRadiationTier } from '@/lib/radiation';
import confetti from 'canvas-confetti';

export function LevelUpNotification() {
    const [levelUpData, setLevelUpData] = useState<{ oldLevel: number; newLevel: number; oldXp: number; newXp: number } | null>(null);
    const [phase, setPhase] = useState<'charging' | 'exploding' | 'result'>('charging');

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const channel = supabase
                    .channel(`profile_changes_${session.user.id}`)
                    .on(
                        'postgres_changes',
                        {
                            event: 'UPDATE',
                            schema: 'public',
                            table: 'profiles',
                            filter: `id=eq.${session.user.id}`,
                        },
                        (payload) => {
                            const oldLevel = payload.old.level;
                            const newLevel = payload.new.level;

                            if (newLevel > oldLevel) {
                                setPhase('charging');
                                setLevelUpData({
                                    oldLevel,
                                    newLevel,
                                    oldXp: payload.old.xp || 0,
                                    newXp: payload.new.xp || 0,
                                });

                                // Phase sequence
                                setTimeout(() => setPhase('exploding'), 1500);
                                setTimeout(() => {
                                    setPhase('result');

                                    // Confetti burst
                                    confetti({
                                        particleCount: 200,
                                        spread: 100,
                                        origin: { y: 0.5 },
                                        colors: ['#0055ff', '#ff0000', '#ffcc00', '#00ff00', '#ff00ff']
                                    });

                                    // Second wave
                                    setTimeout(() => {
                                        confetti({
                                            particleCount: 100,
                                            angle: 60,
                                            spread: 55,
                                            origin: { x: 0 },
                                            colors: ['#0055ff', '#ffcc00']
                                        });
                                        confetti({
                                            particleCount: 100,
                                            angle: 120,
                                            spread: 55,
                                            origin: { x: 1 },
                                            colors: ['#ff0000', '#0055ff']
                                        });
                                    }, 400);
                                }, 2500);
                            }
                        }
                    )
                    .subscribe();

                return () => {
                    supabase.removeChannel(channel);
                };
            }
        };

        fetchUser();
    }, []);

    if (!levelUpData) return null;

    const oldTier = getRadiationTier(levelUpData.oldXp);
    const newTier = getRadiationTier(levelUpData.newXp);

    return (
        <AnimatePresence>
            <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                onClick={() => phase === 'result' && setLevelUpData(null)}
            >
                <m.div
                    initial={{ scale: 0.5, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="relative w-full max-w-sm"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Geiger Counter Device */}
                    <div className="bg-[#1a1a2e] rounded-[32px] p-8 border-2 border-gray-700 shadow-2xl relative overflow-hidden">
                        {/* Radiation rings background */}
                        {phase === 'exploding' && (
                            <>
                                {[...Array(5)].map((_, i) => (
                                    <m.div
                                        key={i}
                                        initial={{ scale: 0, opacity: 0.8 }}
                                        animate={{ scale: 4, opacity: 0 }}
                                        transition={{ duration: 1.5, delay: i * 0.15, ease: 'easeOut' }}
                                        className={`absolute inset-1/2 w-20 h-20 -ml-10 -mt-10 rounded-full border-2 ${newTier.borderColor}`}
                                    />
                                ))}
                            </>
                        )}

                        {/* Crack/shatter overlay on explosion */}
                        {phase === 'exploding' && (
                            <m.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 1, 0.6] }}
                                transition={{ duration: 0.3 }}
                                className="absolute inset-0 z-30"
                            >
                                <svg viewBox="0 0 300 400" className="w-full h-full" fill="none" stroke="white" strokeWidth="2" opacity="0.3">
                                    <path d="M150 0 L140 80 L100 120 L120 200 L80 280 L150 400" />
                                    <path d="M150 0 L170 60 L200 100 L180 180 L220 260 L150 400" />
                                    <path d="M0 200 L80 190 L150 200 L220 210 L300 200" />
                                </svg>
                            </m.div>
                        )}

                        <div className="relative z-10 text-center">
                            {/* Geiger Counter Icon */}
                            <m.div
                                animate={
                                    phase === 'charging'
                                        ? { rotate: [0, -5, 5, -3, 3, -1, 1, 0], scale: [1, 1.02, 1, 1.03, 1, 1.05, 1] }
                                        : phase === 'exploding'
                                            ? { scale: [1, 1.8, 0], rotate: [0, 15, -30], y: [0, -20, 50] }
                                            : { scale: 0 }
                                }
                                transition={
                                    phase === 'charging'
                                        ? { duration: 1.5, repeat: Infinity, repeatType: 'reverse' }
                                        : { duration: 0.8, ease: 'easeIn' }
                                }
                                className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-700 to-gray-900 rounded-3xl mb-6 border border-gray-600 shadow-inner"
                            >
                                <span className="text-5xl">☢️</span>
                            </m.div>

                            {/* Charging phase: needle oscillating */}
                            {phase === 'charging' && (
                                <m.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="space-y-3"
                                >
                                    <h2 className="text-xl font-black text-yellow-400 uppercase tracking-tight">
                                        Radiação Crítica Detectada!
                                    </h2>
                                    <div className="flex justify-center gap-1">
                                        {[...Array(6)].map((_, i) => (
                                            <m.div
                                                key={i}
                                                animate={{ height: [8, 20 + Math.random() * 20, 8] }}
                                                transition={{ duration: 0.3, repeat: Infinity, delay: i * 0.05 }}
                                                className="w-2 bg-yellow-400 rounded-full"
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-400 animate-pulse uppercase tracking-widest font-bold">
                                        Contador sobrecarregando...
                                    </p>
                                </m.div>
                            )}

                            {/* Exploding phase: counter breaks apart */}
                            {phase === 'exploding' && (
                                <m.div
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: [0.5, 1.5, 1] }}
                                    transition={{ duration: 0.5 }}
                                    className="space-y-2"
                                >
                                    <m.h2
                                        animate={{ scale: [1, 1.3, 1], color: ['#fff', '#ff0000', '#ffcc00'] }}
                                        transition={{ duration: 0.5 }}
                                        className="text-3xl font-black uppercase"
                                    >
                                        💥 BOOM! 💥
                                    </m.h2>
                                    <p className="text-sm text-orange-400 font-bold">Contador Geiger EXPLODIU!</p>
                                </m.div>
                            )}

                            {/* Result phase: new tier reveal */}
                            {phase === 'result' && (
                                <m.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="space-y-5"
                                >
                                    <m.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 200, damping: 10, delay: 0.2 }}
                                        className="text-5xl"
                                    >
                                        {newTier.emoji}
                                    </m.div>

                                    <div>
                                        <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-1">
                                            Novo Nível de Radiação!
                                        </h2>
                                        <div className="flex items-center justify-center gap-3 mt-3">
                                            <div className={`text-lg font-bold ${oldTier.color} line-through opacity-50`}>
                                                {oldTier.name}
                                            </div>
                                            <span className="material-symbols-outlined text-brand-yellow text-xl">arrow_forward</span>
                                            <m.div
                                                animate={{ scale: [1, 1.1, 1] }}
                                                transition={{ duration: 1, repeat: Infinity }}
                                                className={`text-2xl font-black ${newTier.color}`}
                                            >
                                                {newTier.name}
                                            </m.div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center gap-4 text-sm">
                                        <div className="text-center">
                                            <span className="block text-2xl font-black text-gray-400 line-through">TIER {levelUpData.oldLevel}</span>
                                        </div>
                                        <div className="text-center">
                                            <m.span
                                                animate={{ scale: [1, 1.15, 1] }}
                                                transition={{ duration: 0.8, repeat: Infinity }}
                                                className={`block text-4xl font-black ${newTier.color}`}
                                            >
                                                TIER {levelUpData.newLevel}
                                            </m.span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setLevelUpData(null)}
                                        className="w-full py-4 bg-gradient-to-r from-brand-blue to-brand-red text-white rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 mt-2 text-sm uppercase tracking-wider"
                                    >
                                        <span className="text-lg">☢️</span>
                                        Continuar Irradiando
                                    </button>
                                </m.div>
                            )}
                        </div>
                    </div>
                </m.div>
            </m.div>
        </AnimatePresence>
    );
}
