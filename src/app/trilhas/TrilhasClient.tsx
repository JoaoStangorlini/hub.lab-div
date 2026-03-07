"use client";

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MainLayoutWrapper } from '@/components/layout/MainLayoutWrapper';
import { Zap, Atom, Microscope, Binary, LayoutGrid, Timer, Layers, ShieldCheck, Milestone, Sparkles, Link2, AlertTriangle, Play, CheckCircle2, Circle, Trophy, GraduationCap, ArrowRight, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

const AXIS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
    bach: { label: 'Bacharelado', color: '#00A3FF', icon: Atom },
    med: { label: 'Física Médica', color: '#FF4B4B', icon: Microscope },
    lic: { label: 'Licenciatura', color: '#FFD700', icon: Binary },
    comum: { label: 'Ciclo Básico', color: '#FFFFFF', icon: Zap },
};

const CATEGORY_CONFIG: Record<string, { label: string; icon: any }> = {
    obrigatoria: { label: 'Obrigatória', icon: ShieldCheck },
    eletiva: { label: 'Eletiva', icon: Milestone },
    livre: { label: 'Livre', icon: Sparkles },
};

interface Trail {
    id: string;
    title: string;
    description: string | null;
    axis: string;
    category: 'obrigatoria' | 'eletiva' | 'livre';
    course_code: string | null;
    excitation_level: number | null;
    status: 'em_orbita' | 'estavel';
    credits_aula: number;
    credits_trabalho: number;
    submissionCount: number;
    created_at: string;
    equivalence_group: string | null;
    prerequisites: string[] | null;
}

export default function TrilhasClient({
    initialTrails,
    cursandoTrails = [],
    completedTrailIds: initialCompletedIds = [],
    userProfile
}: {
    initialTrails: Trail[],
    cursandoTrails?: Trail[],
    completedTrailIds?: string[],
    userProfile?: any
}) {
    const [axisFilter, setAxisFilter] = useState<string | null>(null);
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
    const [semesterFilter, setSemesterFilter] = useState<number | null>(null);
    const [visibleCount, setVisibleCount] = useState(9); // Pagination: 3x3 block
    const [visibleCountDash, setVisibleCountDash] = useState(6);
    const [completedIds, setCompletedIds] = useState<string[]>(initialCompletedIds);
    const [cursandoIds, setCursandoIds] = useState<string[]>(cursandoTrails.map(t => t.id));
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [dashboardTab, setDashboardTab] = useState<'faltam' | 'concluidas'>('faltam');
    const [isDashboardCollapsed, setIsDashboardCollapsed] = useState(false);
    const router = useRouter();

    // Semester Options
    const availableSemesters = useMemo(() => {
        const semesters = new Set<number>();
        initialTrails.forEach(t => {
            if (t.excitation_level) semesters.add(t.excitation_level);
        });
        return Array.from(semesters).sort((a, b) => a - b);
    }, [initialTrails]);

    // Reset visible count when filters change
    useEffect(() => {
        setVisibleCount(9);
    }, [axisFilter, categoryFilter, semesterFilter]);

    // Filter Logic
    const filteredTrails = useMemo(() => {
        return initialTrails.filter(t => {
            const axisMatch = !axisFilter || t.axis === axisFilter;
            const categoryMatch = !categoryFilter || t.category === categoryFilter;
            const semesterMatch = !semesterFilter || t.excitation_level === semesterFilter;
            return axisMatch && categoryMatch && semesterMatch;
        });
    }, [initialTrails, axisFilter, categoryFilter, semesterFilter]);

    // Dashboard Stats Logic
    const stats = useMemo(() => {
        if (!userProfile) return null;

        const userAxis = userProfile.course === 'Licenciatura' ? 'lic' :
            userProfile.course === 'Física Médica' ? 'med' :
                userProfile.course === 'Bacharelado' ? 'bach' : null;

        const mandatoryTrails = initialTrails.filter(t =>
            t.category === 'obrigatoria' && (t.axis === 'comum' || (userAxis && t.axis === userAxis))
        );

        const completedMandatory = mandatoryTrails.filter(t => completedIds.includes(t.id));
        const missingMandatory = mandatoryTrails.filter(t => !completedIds.includes(t.id))
            .sort((a, b) => (a.excitation_level || 99) - (b.excitation_level || 99));

        const completedTotal = initialTrails.filter(t => completedIds.includes(t.id));

        const percentage = mandatoryTrails.length > 0
            ? Math.round((completedMandatory.length / mandatoryTrails.length) * 100)
            : 0;

        return {
            percentage,
            totalMandatory: mandatoryTrails.length,
            completedMandatoryCount: completedMandatory.length,
            missingMandatory,
            completedTotal
        };
    }, [initialTrails, completedIds, userProfile]);

    const toggleCompletion = async (e: React.MouseEvent, trailId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (isUpdating) return;
        setIsUpdating(trailId);
        setIsSyncing(true);

        try {
            const { data, error } = await supabase.rpc('toggle_trail_completion', { field_trail_id: trailId });
            if (error) throw error;

            if (data === true) {
                setCompletedIds(prev => [...prev, trailId]);
                // Se concluir, remove do cursando se estiver lá
                setCursandoIds(prev => prev.filter(id => id !== trailId));
                toast.success('Disciplina concluída! +10 XP', {
                    icon: '🚀',
                    style: { background: '#121212', color: '#fff', border: '1px solid #00A3FF' }
                });
            } else {
                setCompletedIds(prev => prev.filter(id => id !== trailId));
                toast('Disciplina removida da matriz pessoal', { icon: '♻️' });
            }
        } catch (err) {
            console.error(err);
            toast.error('Erro ao atualizar progresso');
        } finally {
            setIsUpdating(null);
            setTimeout(() => {
                setIsSyncing(false);
                router.refresh(); // Soft reload para garantir sincronia do Server Component
            }, 2000);
        }
    };

    const toggleCursando = async (e: React.MouseEvent, trailId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (isUpdating) return;
        setIsUpdating(trailId);
        setIsSyncing(true);

        try {
            // Chama o RPC toggle_trail_status (que já lida com 'cursando')
            const { error } = await supabase.rpc('toggle_trail_status', {
                p_trail_id: trailId,
                p_status: 'cursando'
            });

            if (error) throw error;

            const isAlreadyCursando = cursandoIds.includes(trailId);
            if (isAlreadyCursando) {
                setCursandoIds(prev => prev.filter(id => id !== trailId));
                toast('Removida do radar atual', { icon: '📡' });
            } else {
                setCursandoIds(prev => [...prev, trailId]);
                // Se marcar como cursando, remove do concluído se estiver lá
                setCompletedIds(prev => prev.filter(id => id !== trailId));
                toast.success('Adicionada ao Radar Ativo!', { icon: '⚡' });
            }
        } catch (err) {
            console.error(err);
            toast.error('Erro ao atualizar radar');
        } finally {
            setIsUpdating(null);
            setTimeout(() => {
                setIsSyncing(false);
                router.refresh();
            }, 2000);
        }
    };

    const slicedTrails = useMemo(() => {
        return filteredTrails.slice(0, visibleCount);
    }, [filteredTrails, visibleCount]);

    return (
        <MainLayoutWrapper>
            <main className="py-20 min-h-screen dark:text-white text-gray-900 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">

                    {/* Header */}
                    <div className="mb-16 space-y-10">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="space-y-2">
                                <h1 className="text-5xl font-black tracking-tighter uppercase font-mono italic text-[#00A3FF]">
                                    Síncrotron<span className="dark:text-white text-gray-900">_Matrix</span>
                                </h1>
                                <p className="dark:text-gray-400 text-gray-600 font-mono text-sm max-w-xl border-l-2 border-[#00A3FF] pl-4">
                                    [SISTEMA_DE_FILTRAGEM_TRIPLA] {'>'} Ajuste frequência (Curso), amplitude (Tipo) e fase (Semestre) para isolar as partículas curriculares.
                                </p>
                            </div>

                            {userProfile && (
                                <div className="dark:bg-[#1E1E1E] bg-white border border-gray-800 rounded-2xl p-4 flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-700">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00A3FF] to-[#0070FF]/20 flex items-center justify-center border border-white/10 shadow-[0_0_15px_rgba(0,163,255,0.3)]">
                                        <User className="text-white w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-mono font-black uppercase text-[#00A3FF] tracking-widest">Estudante_Identificado</div>
                                        <div className="text-xs font-bold dark:text-gray-200">
                                            {userProfile.course?.toUpperCase() || 'CIENTISTA'} @ {userProfile.institute?.toUpperCase() || 'USP'}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Dashboard "Acompanhar Andamento" */}
                        {stats && (
                            <div className={`dark:bg-[#121212]/50 bg-white/50 backdrop-blur-xl border dark:border-white/5 border-gray-200 rounded-[2.5rem] overflow-hidden transition-all duration-500 ${isDashboardCollapsed ? 'max-h-24' : 'max-h-[800px]'}`}>
                                <div className="p-8 pb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="relative w-20 h-20 flex items-center justify-center">
                                            <svg className="w-full h-full -rotate-90">
                                                <circle cx="40" cy="40" r="36" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-gray-800" />
                                                <motion.circle
                                                    cx="40" cy="40" r="36" fill="transparent" stroke="#00A3FF" strokeWidth="4"
                                                    strokeDasharray={226}
                                                    initial={{ strokeDashoffset: 226 }}
                                                    animate={{ strokeDashoffset: 226 - (226 * stats.percentage / 100) }}
                                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                                    strokeLinecap="round"
                                                    className="drop-shadow-[0_0_8px_rgba(0,163,255,0.5)]"
                                                />
                                            </svg>
                                            <span className="absolute text-lg font-black font-mono text-white tracking-widest">{stats.percentage}%</span>
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                                Acompanhar Andamento <Trophy className="text-brand-yellow w-5 h-5" />
                                            </h2>
                                            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1">
                                                {stats.completedMandatoryCount} de {stats.totalMandatory} disciplinas obrigatórias concluídas
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsDashboardCollapsed(!isDashboardCollapsed)}
                                        className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-500"
                                    >
                                        <Layers size={20} className={isDashboardCollapsed ? 'rotate-180' : ''} />
                                    </button>
                                </div>

                                {!isDashboardCollapsed && (
                                    <div className="px-8 pb-8 space-y-6">
                                        {/* Progress Detail Bar */}
                                        <div className="h-2 bg-gray-900 rounded-full overflow-hidden flex">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-[#00A3FF] to-[#0070FF]"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${stats.percentage}%` }}
                                                transition={{ duration: 1.2 }}
                                            />
                                        </div>

                                        {/* Tabs for Lists */}
                                        <div className="flex gap-4 border-b border-white/5">
                                            <button
                                                onClick={() => setDashboardTab('faltam')}
                                                className={`pb-4 text-[10px] font-mono font-black uppercase tracking-widest transition-all relative ${dashboardTab === 'faltam' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                            >
                                                O que falta fazer ({stats.missingMandatory.length})
                                                {dashboardTab === 'faltam' && <motion.div layoutId="dashTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00A3FF]" />}
                                            </button>
                                            <button
                                                onClick={() => setDashboardTab('concluidas')}
                                                className={`pb-4 text-[10px] font-mono font-black uppercase tracking-widest transition-all relative ${dashboardTab === 'concluidas' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                            >
                                                Concluídas ({stats.completedTotal.length})
                                                {dashboardTab === 'concluidas' && <motion.div layoutId="dashTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00A3FF]" />}
                                            </button>
                                        </div>

                                        {/* Scrollable List Container */}
                                        <div className="max-h-[350px] overflow-y-auto pr-4 custom-scrollbar">
                                            <AnimatePresence mode="wait">
                                                {dashboardTab === 'faltam' ? (
                                                    <motion.div
                                                        key="faltam"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="grid grid-cols-1 md:grid-cols-2 gap-3"
                                                    >
                                                        {stats.missingMandatory.length > 0 ? stats.missingMandatory.slice(0, visibleCountDash).map(trail => (
                                                            <div key={trail.id} className="flex items-center gap-4 dark:bg-white/5 bg-gray-100 p-4 rounded-2xl border dark:border-white/5 border-gray-200 group">
                                                                <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center font-mono font-black text-xs text-gray-500 border border-gray-800">
                                                                    {trail.excitation_level}º
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="text-[9px] font-mono text-gray-500 uppercase">{trail.course_code}</div>
                                                                    <div className="text-xs font-bold text-gray-200 truncate">{trail.title}</div>
                                                                </div>
                                                                <button
                                                                    onClick={(e) => toggleCompletion(e, trail.id)}
                                                                    disabled={isUpdating === trail.id}
                                                                    className="p-2 rounded-lg bg-[#00A3FF]/10 text-[#00A3FF] hover:bg-[#00A3FF] hover:text-white transition-all disabled:opacity-50"
                                                                >
                                                                    <ArrowRight size={14} />
                                                                </button>
                                                            </div>
                                                        )) : (
                                                            <div className="col-span-2 py-8 text-center text-gray-500 font-mono text-xs uppercase tracking-widest">
                                                                ✨ Toda a matéria obrigatória foi capturada!
                                                            </div>
                                                        )}
                                                        {stats.missingMandatory.length > visibleCountDash && (
                                                            <div className="col-span-full py-4 flex justify-center">
                                                                <button
                                                                    onClick={() => setVisibleCountDash(prev => prev + 6)}
                                                                    className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-mono text-[10px] text-gray-400 uppercase tracking-widest transition-all"
                                                                >
                                                                    Carregar Mais Disciplinas
                                                                </button>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        key="concluidas"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
                                                    >
                                                        {stats.completedTotal.length > 0 ? stats.completedTotal.map(trail => (
                                                            <div key={trail.id} className="flex items-center gap-3 dark:bg-green-500/5 bg-green-50 p-3 rounded-xl border border-green-500/10">
                                                                <CheckCircle2 className="text-green-500 shrink-0" size={14} />
                                                                <div className="min-w-0">
                                                                    <div className="text-[10px] font-bold text-gray-200 truncate">{trail.title}</div>
                                                                </div>
                                                            </div>
                                                        )) : (
                                                            <div className="col-span-full py-8 text-center text-gray-500 font-mono text-xs uppercase tracking-widest">
                                                                Nenhuma partícula registrada ainda.
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Cursando Agora - Horizontal Feed */}
                        {(cursandoIds.length > 0) && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <h3 className="font-mono text-[10px] font-bold dark:text-[#00A3FF] text-[#0070FF] uppercase tracking-[0.3em] flex items-center gap-2">
                                        <Play size={10} fill="currentColor" /> [RADAR_ATIVO: CURSANDO_AGORA]
                                    </h3>
                                    <span className="font-mono text-[8px] text-gray-500 uppercase">{cursandoIds.length} partículas em movimento</span>
                                </div>

                                <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide px-1">
                                    <AnimatePresence mode="popLayout">
                                        {initialTrails.filter(t => cursandoIds.includes(t.id)).map((trail) => {
                                            const tCfg = AXIS_CONFIG[trail.axis] || AXIS_CONFIG.comum;
                                            return (
                                                <motion.div
                                                    key={trail.id}
                                                    initial={{ opacity: 0, scale: 0.9, x: 20 }}
                                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                                    exit={{ opacity: 0, scale: 0.9, x: -20 }}
                                                    className="flex-shrink-0"
                                                >
                                                    <Link href={`/trilhas/${trail.id}`}>
                                                        <div className="w-64 h-24 dark:bg-[#1E1E1E] bg-white rounded-xl border border-gray-800 p-4 relative group transition-all hover:border-[#00A3FF]/50 hover:shadow-[0_0_20px_rgba(0,163,255,0.1)] overflow-hidden">
                                                            {/* Background pulse */}
                                                            <div className="absolute inset-0 bg-[#00A3FF]/5 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />

                                                            <div className="relative z-10 flex flex-col justify-between h-full">
                                                                <div className="flex justify-between items-start">
                                                                    <div className="flex flex-col">
                                                                        <span className="font-mono text-[8px] text-gray-500 uppercase tracking-tighter">{trail.course_code}</span>
                                                                        <h4 className="text-[12px] font-bold text-gray-200 group-hover:text-white transition-colors truncate w-40">{trail.title}</h4>
                                                                    </div>
                                                                    <div className="p-1.5 rounded-lg bg-[#121212] border border-gray-800 group-hover:border-[#00A3FF]/30">
                                                                        <tCfg.icon size={12} style={{ color: tCfg.color }} />
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                                                                        <motion.div
                                                                            initial={{ width: 0 }}
                                                                            animate={{ width: completedIds.includes(trail.id) ? '100%' : '40%' }}
                                                                            className={`h-full ${completedIds.includes(trail.id) ? 'bg-green-500' : 'bg-[#00A3FF]'}`}
                                                                        />
                                                                    </div>
                                                                    <span className={`font-mono text-[8px] ${completedIds.includes(trail.id) ? 'text-green-500' : 'text-[#00A3FF]'}`}>
                                                                        {completedIds.includes(trail.id) ? 'CONCLUÍDA' : 'ATIVA'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}

                        {/* Control Panel */}
                        <div className="space-y-6 dark:bg-[#1A1A1A]/70 bg-white/70 backdrop-blur-xl p-6 rounded-2xl dark:border-gray-800/60 border-gray-200/60 border shadow-2xl dark:shadow-none relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Layers size={120} />
                            </div>

                            {/* Row 1: Axis (Curso) — BOTÕES COLORIDOS */}
                            <div className="space-y-3 relative z-10">
                                <label className="font-mono text-[10px] dark:text-gray-500 text-gray-400 uppercase tracking-[0.3em] block ml-1">Frequência_Curso</label>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setAxisFilter(null)}
                                        className={`px-4 py-2 rounded-lg font-mono text-[10px] font-bold transition-all border ${!axisFilter
                                            ? 'bg-[#00A3FF] text-white border-transparent shadow-lg shadow-[#00A3FF]/20'
                                            : 'dark:bg-[#121212] bg-gray-100 dark:text-gray-500 text-gray-500 dark:border-gray-800 border-gray-300 hover:border-gray-400'
                                            }`}
                                    >
                                        TODOS_OS_CURSOS
                                    </button>
                                    {Object.entries(AXIS_CONFIG).map(([key, cfg]) => (
                                        <button
                                            key={key}
                                            onClick={() => setAxisFilter(key)}
                                            className="px-4 py-2 rounded-lg font-mono text-[10px] font-bold transition-all border flex items-center gap-2"
                                            style={axisFilter === key
                                                ? { backgroundColor: cfg.color, color: key === 'comum' || key === 'lic' ? '#121212' : '#FFFFFF', borderColor: cfg.color, boxShadow: `0 0 20px ${cfg.color}60` }
                                                : { backgroundColor: `${cfg.color}15`, color: cfg.color, borderColor: `${cfg.color}40` }
                                            }
                                        >
                                            <cfg.icon size={12} />
                                            {cfg.label.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Row 2: Category — cores seguem eixo */}
                            <div className="space-y-3 relative z-10">
                                <label className="font-mono text-[10px] dark:text-gray-500 text-gray-400 uppercase tracking-[0.3em] block ml-1">Amplitude_Tipo</label>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setCategoryFilter(null)}
                                        className={`px-4 py-2 rounded-lg font-mono text-[10px] font-bold transition-all border ${!categoryFilter
                                            ? 'bg-[#00A3FF] text-white border-transparent shadow-lg shadow-[#00A3FF]/20'
                                            : 'dark:bg-[#121212] bg-gray-100 dark:text-gray-500 text-gray-500 dark:border-gray-800 border-gray-300 hover:border-gray-400'
                                            }`}
                                    >
                                        TODAS_AS_CATEGORIAS
                                    </button>
                                    {Object.entries(CATEGORY_CONFIG).map(([key, catCfg]) => {
                                        const catColor = axisFilter ? AXIS_CONFIG[axisFilter]?.color || '#00A3FF' : '#00A3FF';
                                        return (
                                            <button
                                                key={key}
                                                onClick={() => setCategoryFilter(key)}
                                                className="px-4 py-2 rounded-lg font-mono text-[10px] font-bold transition-all border flex items-center gap-2"
                                                style={categoryFilter === key
                                                    ? { backgroundColor: `${catColor}40`, color: catColor, borderColor: catColor, boxShadow: `0 0 15px ${catColor}30` }
                                                    : { backgroundColor: `${catColor}08`, color: `${catColor}90`, borderColor: `${catColor}20` }
                                                }
                                            >
                                                <catCfg.icon size={12} />
                                                {catCfg.label.toUpperCase()}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Row 3: Semester */}
                            <div className="space-y-3 relative z-10">
                                <label className="font-mono text-[10px] dark:text-gray-500 text-gray-400 uppercase tracking-[0.3em] block ml-1">Fase_Semestre</label>
                                <div className="flex flex-wrap gap-1.5">
                                    <button
                                        onClick={() => setSemesterFilter(null)}
                                        className={`px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold transition-all border ${!semesterFilter
                                            ? 'bg-[#00A3FF] text-white border-transparent shadow-lg shadow-[#00A3FF]/20'
                                            : 'dark:bg-[#121212] bg-gray-100 dark:text-gray-500 text-gray-500 dark:border-gray-800 border-gray-300 hover:border-gray-400'
                                            }`}
                                    >
                                        TODOS
                                    </button>
                                    {availableSemesters.map((sem) => {
                                        const semColor = axisFilter ? AXIS_CONFIG[axisFilter]?.color || '#00A3FF' : '#00A3FF';
                                        return (
                                            <button
                                                key={sem}
                                                onClick={() => setSemesterFilter(sem)}
                                                className="w-10 h-8 rounded-lg font-mono text-[10px] font-bold transition-all border flex items-center justify-center"
                                                style={semesterFilter === sem
                                                    ? { backgroundColor: `${semColor}50`, borderColor: semColor, color: semColor, boxShadow: `0 0 10px ${semColor}30` }
                                                    : { backgroundColor: `${semColor}08`, color: `${semColor}70`, borderColor: `${semColor}20` }
                                                }
                                            >
                                                {sem}º
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Grid de Trilhas */}
                    <motion.div
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        <AnimatePresence mode='popLayout'>
                            {slicedTrails.map((trail) => {
                                const axisCfg = AXIS_CONFIG[trail.axis] || { label: 'Outro', color: '#888888', icon: LayoutGrid };
                                const catCfg = CATEGORY_CONFIG[trail.category];
                                const Icon = axisCfg.icon;
                                const hasEquiv = !!trail.equivalence_group;
                                const hasPrereqs = trail.prerequisites && trail.prerequisites.length > 0;

                                return (
                                    <motion.div
                                        layout
                                        key={trail.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Link href={`/trilhas/${trail.id}`} className="group block h-full">
                                            <div
                                                className="relative rounded-xl p-6 border transition-all h-full flex flex-col dark:bg-[#1E1E1E] bg-white dark:border-gray-800 border-gray-200 dark:group-hover:bg-[#252525] group-hover:bg-gray-50 group-hover:shadow-lg"
                                                style={{
                                                    borderColor: axisFilter === trail.axis || !axisFilter ? `${axisCfg.color}30` : undefined,
                                                }}
                                            >
                                                {/* Glow Border Effect on Hover */}
                                                <div
                                                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                                                    style={{
                                                        boxShadow: `inset 0 0 25px ${axisCfg.color}15`,
                                                        border: `1px solid ${axisCfg.color}40`
                                                    }}
                                                ></div>

                                                {/* Category Badge Row */}
                                                <div className="flex justify-between items-start mb-4" style={{ minHeight: '24px' }}>
                                                    <div
                                                        className="px-2 py-0.5 rounded text-[9px] font-mono font-bold flex items-center gap-1.5 uppercase border"
                                                        style={{
                                                            backgroundColor: `${axisCfg.color}10`,
                                                            borderColor: `${axisCfg.color}30`,
                                                            color: axisCfg.color
                                                        }}
                                                    >
                                                        <catCfg.icon size={10} />
                                                        {catCfg.label}
                                                    </div>

                                                    {/* Quick Info Icons (Prereq/Equiv) with tooltips */}
                                                    <div className="flex items-center gap-2">
                                                        {hasPrereqs && (
                                                            <div className="group/prereq relative flex items-center">
                                                                <AlertTriangle size={13} style={{ color: `${axisCfg.color}90` }} />
                                                                <span className="absolute bottom-full right-0 mb-2 w-48 p-2 dark:bg-[#1A1A1A] bg-white dark:border-gray-700 border-gray-200 border rounded-lg text-[9px] font-mono dark:text-gray-300 text-gray-600 opacity-0 group-hover/prereq:opacity-100 transition-opacity pointer-events-none z-[70] shadow-xl">
                                                                    ⚠ Esta disciplina possui <strong className="dark:text-white text-gray-900">pré-requisitos</strong>.
                                                                </span>
                                                            </div>
                                                        )}
                                                        {hasEquiv && (
                                                            <div className="group/equiv relative flex items-center">
                                                                <Link2 size={13} style={{ color: `${axisCfg.color}90` }} />
                                                                <span className="absolute bottom-full right-0 mb-2 w-48 p-2 dark:bg-[#1A1A1A] bg-white dark:border-gray-700 border-gray-200 border rounded-lg text-[9px] font-mono dark:text-gray-300 text-gray-600 opacity-0 group-hover/equiv:opacity-100 transition-opacity pointer-events-none z-[70] shadow-xl">
                                                                    🔗 Esta disciplina possui <strong className="dark:text-white text-gray-900">equivalentes</strong>.
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* STATUS BUTTONS ROW (NEW) */}
                                                <div className="flex items-center gap-2 mb-6">
                                                    {completedIds.includes(trail.id) ? (
                                                        <button
                                                            onClick={(e) => toggleCompletion(e, trail.id)}
                                                            className="px-2 py-1.5 rounded-lg border bg-green-500/20 border-green-500/50 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.2)] transition-all flex items-center gap-1.5 group/check"
                                                            disabled={isUpdating === trail.id}
                                                        >
                                                            {isUpdating === trail.id ? (
                                                                <Loader2 size={10} className="animate-spin" />
                                                            ) : (
                                                                <Trophy size={10} />
                                                            )}
                                                            <span className="font-mono text-[8px] font-black uppercase tracking-widest">
                                                                APROVADO
                                                            </span>
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={(e) => toggleCompletion(e, trail.id)}
                                                                className="px-2 py-1.5 rounded-lg border dark:bg-white/5 bg-gray-100 border-gray-800 text-gray-500 hover:border-green-500/50 hover:text-green-500 transition-all flex items-center gap-1.5 group/check"
                                                                disabled={isUpdating === trail.id}
                                                            >
                                                                {isUpdating === trail.id ? (
                                                                    <Loader2 size={10} className="animate-spin" />
                                                                ) : (
                                                                    <CheckCircle2 size={10} />
                                                                )}
                                                                <span className="font-mono text-[8px] font-black uppercase tracking-widest">
                                                                    FEITO
                                                                </span>
                                                            </button>

                                                            <button
                                                                onClick={(e) => toggleCursando(e, trail.id)}
                                                                disabled={isUpdating === trail.id}
                                                                className={`px-2 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 group/radar ${cursandoIds.includes(trail.id)
                                                                    ? 'bg-[#00A3FF]/20 border-[#00A3FF]/50 text-[#00A3FF] shadow-[0_0_10px_rgba(0,163,255,0.2)]'
                                                                    : 'dark:bg-white/5 bg-gray-100 border-gray-800 text-gray-500 hover:border-[#00A3FF]/50 hover:text-[#00A3FF]'
                                                                    }`}
                                                            >
                                                                <Play
                                                                    size={10}
                                                                    fill={cursandoIds.includes(trail.id) ? "currentColor" : "none"}
                                                                    className={cursandoIds.includes(trail.id) ? "animate-pulse" : ""}
                                                                />
                                                                <span className="font-mono text-[8px] font-black uppercase tracking-widest">
                                                                    {cursandoIds.includes(trail.id) ? 'CURSANDO' : 'RADAR'}
                                                                </span>
                                                            </button>
                                                        </>
                                                    )}
                                                </div>

                                                {/* Course Info Row */}
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="p-2.5 rounded-lg dark:bg-[#121212] bg-gray-100 dark:border-gray-800 border-gray-200 border" style={{ borderColor: `${axisCfg.color}40` }}>
                                                        <Icon size={20} style={{ color: axisCfg.color }} />
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <div className="font-mono text-[10px] tracking-widest uppercase dark:text-white/40 text-gray-400">
                                                            {trail.course_code || 'LABDIV-CORE'}
                                                        </div>
                                                        <div className="font-mono text-[9px] uppercase font-bold" style={{ color: axisCfg.color }}>
                                                            {axisCfg.label}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Title — hover usa cor do eixo */}
                                                <div className="space-y-2 flex-1" style={{ minHeight: '48px' }}>
                                                    <h2
                                                        className="text-xl font-bold font-display uppercase tracking-tight dark:text-white text-gray-900 leading-6 transition-colors"
                                                        style={{ '--hover-color': axisCfg.color } as React.CSSProperties}
                                                    >
                                                        <span className="group-hover:text-[var(--hover-color)] transition-colors">
                                                            {trail.title}
                                                        </span>
                                                    </h2>
                                                    {trail.description && (
                                                        <p className="text-[11px] dark:text-gray-500 text-gray-400 font-mono leading-relaxed line-clamp-2">
                                                            {trail.description}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Energy Bars */}
                                                <div className="mt-8 space-y-2 pt-4 dark:border-gray-800/50 border-gray-200 border-t" style={{ minHeight: '60px' }}>
                                                    <div className="flex items-center justify-between text-[9px] font-mono dark:text-gray-500 text-gray-400 uppercase" style={{ height: '16px' }}>
                                                        <span>Energia_Créditos</span>
                                                        <span>{trail.credits_aula + trail.credits_trabalho}U</span>
                                                    </div>
                                                    <div className="flex gap-1" style={{ height: '4px' }}>
                                                        {Array.from({ length: 8 }).map((_, i) => (
                                                            <div
                                                                key={i}
                                                                className={`h-1 flex-1 rounded-sm ${i < (trail.credits_aula + trail.credits_trabalho) ? '' : 'dark:bg-gray-800 bg-gray-200 opacity-30'}`}
                                                                style={{ backgroundColor: i < (trail.credits_aula + trail.credits_trabalho) ? axisCfg.color : undefined }}
                                                            ></div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-[10px] font-mono dark:text-gray-400 text-gray-500">
                                                        <Timer size={12} />
                                                        SEM_{trail.excitation_level || '?'}
                                                    </div>
                                                    <div className="text-[10px] font-mono dark:text-gray-600 text-gray-400">
                                                        {trail.submissionCount} MATERIAIS
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {filteredTrails.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="col-span-full py-20 text-center border border-dashed dark:border-gray-800 border-gray-300 rounded-2xl"
                            >
                                <p className="font-mono dark:text-gray-500 text-gray-400 italic uppercase text-xs tracking-widest">[ERRO_NA_BUSCA] Nenhuma partícula detectada nesta combinação de filtros.</p>
                                <button
                                    onClick={() => { setAxisFilter(null); setCategoryFilter(null); setSemesterFilter(null); }}
                                    className="mt-4 font-mono text-[10px] text-[#00A3FF] underline underline-offset-4"
                                >
                                    RECALIBRAR_SENSORES
                                </button>
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Pagination - Load More */}
                    {filteredTrails.length > visibleCount && (
                        <div className="mt-16 flex justify-center">
                            <button
                                onClick={() => setVisibleCount(prev => prev + 9)}
                                className="group relative px-8 py-4 bg-white/5 hover:bg-white/10 dark:bg-white/5 dark:hover:bg-white/10 border border-white/10 rounded-2xl transition-all hover:scale-105 active:scale-95 flex flex-col items-center gap-2 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/10 via-brand-red/10 to-brand-yellow/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] dark:text-gray-400 text-gray-500 relative z-10">Expandir_Matriz</span>
                                <div className="flex items-center gap-3 relative z-10">
                                    <span className="text-sm font-bold dark:text-white text-gray-900">CARREGAR MAIS PARTICULAS</span>
                                    <LayoutGrid size={16} className="text-[#00A3FF] group-hover:rotate-90 transition-transform duration-500" />
                                </div>
                                <div className="flex gap-1 mt-1 relative z-10">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-blue/40 animate-pulse"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-red/40 animate-pulse [animation-delay:200ms]"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-yellow/40 animate-pulse [animation-delay:400ms]"></div>
                                </div>
                            </button>
                        </div>
                    )}
                </div>
            </main >

            {/* Global Sync Overlay */}
            <AnimatePresence>
                {
                    isSyncing && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/60 backdrop-blur-md"
                        >
                            <div className="relative w-32 h-32 flex items-center justify-center">
                                {/* Animated Rings */}
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 border-2 border-dashed border-[#00A3FF]/40 rounded-full"
                                />
                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-4 border border-brand-yellow/30 rounded-full"
                                />

                                {/* Central Particle */}
                                <div className="relative">
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                        className="w-4 h-4 bg-[#00A3FF] rounded-full shadow-[0_0_20px_#00A3FF]"
                                    />
                                    <Atom className="absolute -top-6 -left-6 w-16 h-16 text-white/20 animate-pulse" />
                                </div>
                            </div>

                            <div className="mt-8 text-center space-y-2">
                                <h2 className="text-lg font-black font-mono text-white uppercase tracking-[0.3em] animate-pulse">
                                    Sincronizando_Partículas
                                </h2>
                                <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                                    Protocolo Síncrotron v3 {'>'} Salvando na grade curricular...
                                </p>
                            </div>

                            {/* Progress Bar simulada */}
                            <div className="mt-6 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 2.0, ease: "linear" }}
                                    className="h-full bg-[#00A3FF] shadow-[0_0_10px_#00A3FF]"
                                />
                            </div>
                        </motion.div>
                    )
                }
            </AnimatePresence >
        </MainLayoutWrapper >
    );
}
