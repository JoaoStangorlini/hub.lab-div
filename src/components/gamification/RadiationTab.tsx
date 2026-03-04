'use client';

import React from 'react';
import { m } from 'framer-motion';
import { getNextTierProgress, RADIATION_TIERS, RADIATION_XP_SOURCES } from '@/lib/radiation';

interface RadiationTabProps {
    profile: {
        id: string;
        xp: number;
        level: number;
    };
}

export function RadiationTab({ profile }: RadiationTabProps) {
    const xp = profile.xp || 0;
    const { current, next, progress, xpNeeded } = getNextTierProgress(xp);
    const isDarkMatter = current.id === 'materia_escura';

    // Find current tier index for visual display
    const currentTierIndex = RADIATION_TIERS.findIndex(t => t.id === current.id);

    return (
        <div className="space-y-8">
            {/* Geiger Counter Visual */}
            <div className="bg-white dark:bg-card-dark rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
                {isDarkMatter && (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-purple-500/5 animate-pulse" />
                )}
                <div className="relative z-10 flex flex-col items-center text-center">
                    {/* Geiger Counter Meter */}
                    <div className="relative w-64 h-52 mb-4">
                        <svg viewBox="0 0 200 170" className="w-full h-full overflow-visible">
                            {(() => {
                                // Gauge geometry: center (100,110), radius 65
                                // Arc spans 240° from 150° to 390° (clockwise over top)
                                const cx = 100, cy = 110, r = 65;
                                const startAngle = 150; // left endpoint (deg)
                                const totalSweep = 240; // degrees clockwise
                                const toRad = (d: number) => (d * Math.PI) / 180;

                                // Compute arc endpoints
                                const x1 = cx + r * Math.cos(toRad(startAngle));
                                const y1 = cy + r * Math.sin(toRad(startAngle));
                                const endAngle = startAngle + totalSweep; // 390° = 30°
                                const x2 = cx + r * Math.cos(toRad(endAngle));
                                const y2 = cy + r * Math.sin(toRad(endAngle));

                                // Needle angle (150 + progress * 240 / 100)
                                const needleAngle = startAngle + (progress * totalSweep / 100);
                                const needleLen = 52;
                                const nx = cx + needleLen * Math.cos(toRad(needleAngle));
                                const ny = cy + needleLen * Math.sin(toRad(needleAngle));

                                // Arc path (large-arc=1, sweep=1 for clockwise 240°)
                                const arcPath = `M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 1 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`;

                                // Progress arc length
                                const fullArcLen = 2 * Math.PI * r * (totalSweep / 360);
                                const progressOffset = fullArcLen - (fullArcLen * progress / 100);

                                return (
                                    <>
                                        {/* Background arc */}
                                        <path
                                            d={arcPath}
                                            fill="none"
                                            stroke="currentColor"
                                            className="text-gray-200 dark:text-gray-700"
                                            strokeWidth="8"
                                            strokeLinecap="round"
                                        />
                                        {/* Progress arc */}
                                        <path
                                            d={arcPath}
                                            fill="none"
                                            stroke="currentColor"
                                            className={current.color}
                                            strokeWidth="8"
                                            strokeLinecap="round"
                                            strokeDasharray={fullArcLen.toFixed(1)}
                                            strokeDashoffset={progressOffset.toFixed(1)}
                                            style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
                                        />
                                        {/* Tick marks */}
                                        {[0, 25, 50, 75, 100].map((pct) => {
                                            const tAngle = startAngle + (pct * totalSweep / 100);
                                            const ir = r - 8, or2 = r;
                                            return (
                                                <line
                                                    key={pct}
                                                    x1={cx + ir * Math.cos(toRad(tAngle))}
                                                    y1={cy + ir * Math.sin(toRad(tAngle))}
                                                    x2={cx + or2 * Math.cos(toRad(tAngle))}
                                                    y2={cy + or2 * Math.sin(toRad(tAngle))}
                                                    stroke="currentColor"
                                                    className="text-gray-400 dark:text-gray-600"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                />
                                            );
                                        })}
                                        {/* Needle */}
                                        <line
                                            x1={cx} y1={cy}
                                            x2={nx} y2={ny}
                                            stroke="currentColor"
                                            className={current.color}
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            style={{ transition: 'x2 1.5s ease-out, y2 1.5s ease-out' }}
                                        />
                                        <circle cx={nx} cy={ny} r="3" fill="currentColor" className={current.color}
                                            style={{ transition: 'cx 1.5s ease-out, cy 1.5s ease-out' }}
                                        />
                                        {/* Pivot dot */}
                                        <circle cx={cx} cy={cy} r="5" className="fill-gray-600 dark:fill-gray-400" stroke="#333" strokeWidth="2" />
                                    </>
                                );
                            })()}

                            {/* Min RAD (left) */}
                            <text x="28" y="158" textAnchor="middle" className="fill-gray-500" fontSize="9" fontWeight="bold">
                                {current.xpMin}
                            </text>
                            {/* Max RAD (right) */}
                            <text x="172" y="158" textAnchor="middle" className="fill-gray-500" fontSize="9" fontWeight="bold">
                                {next ? next.xpMin : '∞'}
                            </text>
                        </svg>

                        {/* Center content overlay */}
                        <div className="absolute inset-0 flex flex-col items-center" style={{ top: '18%' }}>
                            <span className="text-2xl mb-0.5">{current.emoji}</span>
                            <span className={`text-3xl font-black leading-none ${current.color}`}>
                                {profile.level}
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">TIER</span>
                        </div>
                    </div>

                    {/* RAD count below gauge */}
                    <p className={`text-lg font-black ${current.color} -mt-2 mb-1`}>{xp} RAD</p>

                    {/* Tier name */}
                    <h2 className={`text-2xl font-black uppercase tracking-tight ${current.color}`}>
                        {current.name}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {xp} RAD total
                    </p>

                    {/* Progress bar to next tier */}
                    {next && (
                        <div className="w-full max-w-sm mt-6">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                                <span>{current.name}</span>
                                <span>{next.name}</span>
                            </div>
                            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <m.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    className={`h-full rounded-full ${current.bgColor}`}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-2 text-center">
                                Faltam <span className="font-bold text-gray-700 dark:text-gray-300">{xpNeeded} RAD</span> para {next.name}
                            </p>
                        </div>
                    )}
                    {!next && (
                        <p className="text-sm text-purple-400 font-bold mt-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">auto_awesome</span>
                            Nível máximo alcançado — Matéria Escura
                        </p>
                    )}
                </div>
            </div>

            {/* XP Sources */}
            <div className="bg-white dark:bg-card-dark rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">bolt</span>
                    Fontes de Radiação
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {RADIATION_XP_SOURCES.map(source => (
                        <div
                            key={source.key}
                            className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800"
                        >
                            <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-brand-blue text-lg">{source.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-200 block truncate">{source.action}</span>
                                <span className="text-[10px] font-black text-brand-blue">+{source.xp} RAD</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tier Roadmap */}
            <div className="bg-white dark:bg-card-dark rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">trending_up</span>
                    Todas as Patentes
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {RADIATION_TIERS.map((tier, i) => {
                        const isActive = tier.id === current.id;
                        const isUnlocked = i <= currentTierIndex;
                        return (
                            <div
                                key={tier.id}
                                className={`flex items-center gap-2 p-2.5 rounded-xl text-[10px] font-bold border transition-all ${isActive
                                    ? `${tier.bgColor}/10 ${tier.borderColor} ${tier.color} shadow-sm`
                                    : isUnlocked
                                        ? `bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-gray-800 ${tier.color}`
                                        : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-gray-800 text-gray-300 dark:text-gray-600'
                                    }`}
                            >
                                <span className="text-sm">{isUnlocked ? tier.emoji : '🔒'}</span>
                                <div className="flex flex-col">
                                    <span className="truncate">{tier.name}</span>
                                    <span className="text-[8px] opacity-60">{tier.xpMin} RAD</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
