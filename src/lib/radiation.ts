/**
 * RADIATION LEVEL SYSTEM — Constants & Helpers
 * Tiers de patente do Contador Geiger
 */

export interface RadiationTier {
    id: string;
    name: string;
    level: number;
    xpMin: number;
    color: string;       // Tailwind color class
    bgColor: string;     // Background color class
    borderColor: string; // Border glow
    hex: string;         // Hex color for gradients
    emoji: string;
}

export const RADIATION_TIERS: RadiationTier[] = [
    { id: 'plastico', name: 'Plástico', level: 1, xpMin: 0, color: 'text-gray-500', bgColor: 'bg-gray-500', borderColor: 'border-gray-500', hex: '#6B7280', emoji: '🔘' },
    { id: 'plastico_i', name: 'Plástico I', level: 2, xpMin: 50, color: 'text-gray-400', bgColor: 'bg-gray-400', borderColor: 'border-gray-400', hex: '#9CA3AF', emoji: '🔘' },
    { id: 'cobre', name: 'Cobre', level: 3, xpMin: 120, color: 'text-amber-700', bgColor: 'bg-amber-700', borderColor: 'border-amber-700', hex: '#A16207', emoji: '🟤' },
    { id: 'cobre_i', name: 'Cobre I', level: 4, xpMin: 200, color: 'text-amber-600', bgColor: 'bg-amber-600', borderColor: 'border-amber-600', hex: '#D97706', emoji: '🟤' },
    { id: 'cobre_ii', name: 'Cobre II', level: 5, xpMin: 300, color: 'text-amber-500', bgColor: 'bg-amber-500', borderColor: 'border-amber-500', hex: '#F59E0B', emoji: '🟤' },
    { id: 'aluminio', name: 'Alumínio', level: 6, xpMin: 420, color: 'text-zinc-400', bgColor: 'bg-zinc-400', borderColor: 'border-zinc-400', hex: '#A1A1AA', emoji: '⚪' },
    { id: 'aluminio_i', name: 'Alumínio I', level: 7, xpMin: 560, color: 'text-zinc-300', bgColor: 'bg-zinc-300', borderColor: 'border-zinc-300', hex: '#D4D4D8', emoji: '⚪' },
    { id: 'aluminio_ii', name: 'Alumínio II', level: 8, xpMin: 720, color: 'text-zinc-200', bgColor: 'bg-zinc-200', borderColor: 'border-zinc-200', hex: '#E4E4E7', emoji: '⚪' },
    { id: 'aluminio_iii', name: 'Alumínio III', level: 9, xpMin: 900, color: 'text-slate-300', bgColor: 'bg-slate-300', borderColor: 'border-slate-300', hex: '#CBD5E1', emoji: '⚪' },
    { id: 'ferro', name: 'Ferro', level: 10, xpMin: 1100, color: 'text-stone-500', bgColor: 'bg-stone-500', borderColor: 'border-stone-500', hex: '#78716C', emoji: '⚙️' },
    { id: 'ferro_i', name: 'Ferro I', level: 11, xpMin: 1320, color: 'text-stone-400', bgColor: 'bg-stone-400', borderColor: 'border-stone-400', hex: '#A8A29E', emoji: '⚙️' },
    { id: 'ferro_ii', name: 'Ferro II', level: 12, xpMin: 1560, color: 'text-stone-300', bgColor: 'bg-stone-300', borderColor: 'border-stone-300', hex: '#D6D3D1', emoji: '⚙️' },
    { id: 'ferro_iii', name: 'Ferro III', level: 13, xpMin: 1820, color: 'text-neutral-400', bgColor: 'bg-neutral-400', borderColor: 'border-neutral-400', hex: '#A3A3A3', emoji: '⚙️' },
    { id: 'ferro_iv', name: 'Ferro IV', level: 14, xpMin: 2100, color: 'text-neutral-300', bgColor: 'bg-neutral-300', borderColor: 'border-neutral-300', hex: '#D4D4D4', emoji: '⚙️' },
    { id: 'aco', name: 'Aço', level: 15, xpMin: 2400, color: 'text-blue-500', bgColor: 'bg-blue-500', borderColor: 'border-blue-500', hex: '#3B82F6', emoji: '🔷' },
    { id: 'aco_i', name: 'Aço I', level: 16, xpMin: 2720, color: 'text-blue-400', bgColor: 'bg-blue-400', borderColor: 'border-blue-400', hex: '#60A5FA', emoji: '🔷' },
    { id: 'aco_ii', name: 'Aço II', level: 17, xpMin: 3060, color: 'text-blue-300', bgColor: 'bg-blue-300', borderColor: 'border-blue-300', hex: '#93C5FD', emoji: '🔷' },
    { id: 'aco_iii', name: 'Aço III', level: 18, xpMin: 3420, color: 'text-sky-400', bgColor: 'bg-sky-400', borderColor: 'border-sky-400', hex: '#38BDF8', emoji: '🔷' },
    { id: 'diamante', name: 'Diamante', level: 19, xpMin: 3800, color: 'text-cyan-400', bgColor: 'bg-cyan-400', borderColor: 'border-cyan-400', hex: '#22D3EE', emoji: '💎' },
    { id: 'diamante_i', name: 'Diamante I', level: 20, xpMin: 4200, color: 'text-cyan-300', bgColor: 'bg-cyan-300', borderColor: 'border-cyan-300', hex: '#67E8F9', emoji: '💎' },
    { id: 'diamante_ii', name: 'Diamante II', level: 21, xpMin: 4620, color: 'text-teal-300', bgColor: 'bg-teal-300', borderColor: 'border-teal-300', hex: '#5EEAD4', emoji: '💎' },
    { id: 'diamante_iii', name: 'Diamante III', level: 22, xpMin: 5060, color: 'text-teal-200', bgColor: 'bg-teal-200', borderColor: 'border-teal-200', hex: '#99FADC', emoji: '💎' },
    { id: 'diamante_iv', name: 'Diamante IV', level: 23, xpMin: 5520, color: 'text-emerald-300', bgColor: 'bg-emerald-300', borderColor: 'border-emerald-300', hex: '#6EE7B7', emoji: '💎' },
    { id: 'diamante_v', name: 'Diamante V', level: 24, xpMin: 6000, color: 'text-emerald-200', bgColor: 'bg-emerald-200', borderColor: 'border-emerald-200', hex: '#A7F3D0', emoji: '💎' },
    { id: 'diamante_vi', name: 'Diamante VI', level: 25, xpMin: 6500, color: 'text-violet-300', bgColor: 'bg-violet-300', borderColor: 'border-violet-300', hex: '#C4B5FD', emoji: '💎' },
    { id: 'materia_escura', name: 'Matéria Escura', level: 26, xpMin: 7500, color: 'text-purple-400', bgColor: 'bg-purple-500', borderColor: 'border-purple-500', hex: '#A855F7', emoji: '🌌' },
];

/** Get the current tier for a given XP value */
export function getRadiationTier(xp: number): RadiationTier {
    for (let i = RADIATION_TIERS.length - 1; i >= 0; i--) {
        if (xp >= RADIATION_TIERS[i].xpMin) {
            return RADIATION_TIERS[i];
        }
    }
    return RADIATION_TIERS[0];
}

/** Get progress percentage toward the next tier */
export function getNextTierProgress(xp: number): { current: RadiationTier; next: RadiationTier | null; progress: number; xpNeeded: number } {
    const current = getRadiationTier(xp);
    const currentIndex = RADIATION_TIERS.findIndex(t => t.id === current.id);
    const next = currentIndex < RADIATION_TIERS.length - 1 ? RADIATION_TIERS[currentIndex + 1] : null;

    if (!next) {
        return { current, next: null, progress: 100, xpNeeded: 0 };
    }

    const xpInTier = xp - current.xpMin;
    const xpRange = next.xpMin - current.xpMin;
    const progress = Math.min(Math.round((xpInTier / xpRange) * 100), 100);
    const xpNeeded = next.xpMin - xp;

    return { current, next, progress, xpNeeded };
}

/** XP source definitions for the objectives UI */
export const RADIATION_XP_SOURCES = [
    { action: 'Post aprovado', xp: 50, icon: 'rocket_launch', key: 'post_approved' },
    { action: 'Responder no próprio post', xp: 10, icon: 'reply', key: 'reply_own_post' },
    { action: 'Comentar em post', xp: 5, icon: 'comment', key: 'comment' },
    { action: 'Seu post salvo (constelação)', xp: 8, icon: 'star', key: 'post_saved' },
    { action: 'Seu post curtido (atomizado)', xp: 3, icon: 'favorite', key: 'post_liked' },
    { action: 'Seguir alguém', xp: 2, icon: 'person_add', key: 'follow' },
    { action: 'Quiz da Wiki', xp: 10, icon: 'quiz', key: 'quiz' },
] as const;
