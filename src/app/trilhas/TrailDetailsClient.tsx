"use client";

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Atom, Microscope, Binary, Zap, ArrowLeft, Play, FileText, Share2, Info, Eye, EyeOff, AlertTriangle, Lock, Unlock, BookOpen, GraduationCap, CheckCircle2, Circle, Link2, ShieldAlert, Ban, LayoutGrid, Trophy } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const AXIS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
    bach: { label: 'Bacharelado', color: '#00A3FF', icon: Atom },
    med: { label: 'Física Médica', color: '#FF4B4B', icon: Microscope },
    lic: { label: 'Licenciatura', color: '#FFD700', icon: Binary },
    comum: { label: 'Núcleo Comum', color: '#FFFFFF', icon: Zap },
};

const CATEGORY_LABELS: Record<string, string> = {
    obrigatoria: 'Obrigatória',
    eletiva: 'Eletiva',
    livre: 'Livre',
};

interface PrereqInfo {
    course_code: string;
    title: string;
    id: string;
}

interface EquivInfo {
    id: string;
    course_code: string;
    title: string;
    axis: string;
}

interface XorExclusion {
    group_a: string;
    group_b: string;
    reason: string;
}

interface TrailDetailsProps {
    trail: any;
    initialMaterials: any[];
    totalMaterials: number;
    userProgress: any;
    isCompleted?: boolean;
    prerequisiteTrails: PrereqInfo[];
    equivalentTrails?: EquivInfo[];
    xorExclusions?: XorExclusion[];
}

export default function TrailDetailsClient({
    trail,
    initialMaterials,
    totalMaterials,
    userProgress,
    isCompleted,
    prerequisiteTrails,
    equivalentTrails = [],
    xorExclusions = []
}: TrailDetailsProps) {
    const [materials, setMaterials] = useState(initialMaterials);
    const [loadingMore, setLoadingMore] = useState(false);
    const [focusMode, setFocusMode] = useState(false);
    const router = useRouter();
    const [activeTopic, setActiveTopic] = useState<number | null>(null);
    const [completedTopics, setCompletedTopics] = useState<Set<number>>(new Set(userProgress?.completed_topics || []));
    const [status, setStatus] = useState<'cursando' | 'concluida' | null>(userProgress?.status || null);
    const [isFinished, setIsFinished] = useState(!!isCompleted);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    const cfg = AXIS_CONFIG[trail.axis] || AXIS_CONFIG.comum;
    const program: string[] = trail.program || [];
    const hasPrerequisites = prerequisiteTrails && prerequisiteTrails.length > 0;
    const hasEquivalences = equivalentTrails && equivalentTrails.length > 0;
    const hasXorConflict = xorExclusions && xorExclusions.length > 0;
    const hasPccRequirement = trail.requires_pcc_validation === true;
    const [showEquivalences, setShowEquivalences] = useState(false);

    const loadMoreMaterials = async () => {
        if (loadingMore) return;
        setLoadingMore(true);

        try {
            const { data, error } = await supabase
                .from('trail_submissions')
                .select(`
                    id,
                    topic_index,
                    sort_order,
                    submissions (
                        id,
                        title,
                        authors,
                        media_type,
                        media_url,
                        description,
                        course_code,
                        academic_unit
                    )
                `)
                .eq('trail_id', trail.id)
                .order('sort_order', { ascending: true })
                .range(materials.length, materials.length + 5);

            if (data) {
                const newItems = data.map((m: any) => ({
                    ...m.submissions,
                    topic_index: m.topic_index,
                    submission_link_id: m.id
                }));
                setMaterials(prev => [...prev, ...newItems]);
            }
        } catch (err) {
            console.error('Error loading more materials:', err);
        } finally {
            setLoadingMore(false);
        }
    };

    // Group materials by topic
    const groupedMaterials = program.map((topicName: string, index: number) => ({
        name: topicName,
        items: materials.filter((m: any) => m.topic_index === index)
    }));

    const toggleStatus = async (newStatus: 'cursando' | 'concluida') => {
        if (isUpdatingStatus) return;
        setIsUpdatingStatus(true);
        setIsSyncing(true);

        try {
            // Se for conclusão, usamos o novo RPC persistente
            if (newStatus === 'concluida') {
                const { data, error } = await supabase.rpc('toggle_trail_completion', { field_trail_id: trail.id });
                if (error) throw error;

                setIsFinished(data === true);
                if (data === true) {
                    toast.success('Disciplina concluída! Registrado no Síncrotron.', { icon: '🏆' });
                    setStatus('concluida');
                } else {
                    toast('Removido das conclusões', { icon: '♻️' });
                    setStatus(null);
                }
                return;
            }

            // Para 'cursando', usamos o status temporário normal
            const { error } = await supabase.rpc('toggle_trail_status', {
                p_trail_id: trail.id,
                p_status: newStatus
            });

            if (!error) {
                const isActivating = status !== newStatus;
                setStatus(isActivating ? newStatus : null);
                if (isActivating) toast.success('Matéria adicionada ao radar!');
            } else {
                console.error('Error toggling trail status:', error);
                toast.error('Erro ao atualizar status');
            }
        } catch (err) {
            console.error('Catch error toggling status:', err);
            toast.error('Falha na comunicação com o acelerador');
        } finally {
            setIsUpdatingStatus(false);
            setTimeout(() => {
                setIsSyncing(false);
                router.refresh();
            }, 2000);
        }
    };

    // Toggle topic completion (local state for now)
    const toggleTopicComplete = useCallback((index: number) => {
        setCompletedTopics(prev => {
            const next = new Set(prev);
            if (next.has(index)) next.delete(index);
            else next.add(index);
            return next;
        });
    }, []);

    // Progress percentage
    const progressPercent = program.length > 0 ? Math.round((completedTopics.size / program.length) * 100) : 0;

    return (
        <main className={`py-20 min-h-screen bg-[#121212] text-white transition-all duration-500 ${focusMode ? 'px-4 md:px-20' : ''}`}>
            <div className={`mx-auto w-full transition-all duration-500 ${focusMode ? 'max-w-4xl' : 'max-w-7xl px-4 sm:px-6 lg:px-8'}`}>

                {/* Back Button */}
                <AnimatePresence>
                    {!focusMode && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <Link href="/trilhas" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors font-mono text-xs mb-8 group">
                                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                                [VOLTAR_A_MATRIZ]
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className={`grid items-start gap-12 transition-all duration-500 ${focusMode ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-[1fr_350px]'}`}>

                    {/* Main Content Area */}
                    <div className="space-y-10">

                        {/* Header Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 flex-wrap">
                                <div className="p-2 rounded bg-[#1E1E1E] border border-gray-800" style={{ borderColor: `${cfg.color}40` }}>
                                    <cfg.icon size={20} style={{ color: cfg.color }} />
                                </div>
                                <span className="font-mono text-[10px] tracking-[0.2em]" style={{ color: cfg.color }}>
                                    {trail.course_code || 'LABDIV-CORE'} // {cfg.label.toUpperCase()}
                                </span>
                                {trail.category && (
                                    <span className="font-mono text-[9px] px-2 py-0.5 rounded border border-gray-700 text-gray-400 uppercase min-h-[28px] flex items-center">
                                        {CATEGORY_LABELS[trail.category] || trail.category}
                                    </span>
                                )}
                                {trail.is_experimental && (
                                    <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-amber-900/30 border border-amber-700/30 text-amber-400 uppercase min-h-[28px] flex items-center">
                                        🔬 Experimental
                                    </span>
                                )}
                                {hasEquivalences && (
                                    <button
                                        onClick={() => setShowEquivalences(!showEquivalences)}
                                        className="font-mono text-[9px] px-2 py-0.5 rounded bg-cyan-900/20 border border-cyan-700/30 text-cyan-400 uppercase min-h-[28px] flex items-center gap-1 hover:bg-cyan-900/40 transition-all cursor-pointer"
                                        title="Ver disciplinas equivalentes"
                                    >
                                        <Link2 size={10} /> 🔗 {equivalentTrails.length} Equiv.
                                    </button>
                                )}
                            </div>

                            {/* STATUS BUTTONS ROW (NEW) */}
                            <div className="flex items-center gap-3 pt-2">
                                {isFinished ? (
                                    <button
                                        disabled={isUpdatingStatus}
                                        onClick={() => toggleStatus('concluida')}
                                        className="px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-500 rounded-lg font-black font-mono text-[10px] uppercase transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(34,197,94,0.2)]"
                                    >
                                        <Trophy size={14} />
                                        [APROVADO]
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            disabled={isUpdatingStatus}
                                            onClick={() => toggleStatus('concluida')}
                                            className="px-4 py-2 bg-[#1E1E1E] border border-gray-800 text-gray-400 hover:border-green-500/50 hover:text-white rounded-lg font-black font-mono text-[10px] uppercase transition-all flex items-center gap-2"
                                        >
                                            <CheckCircle2 size={14} />
                                            [FEITO]
                                        </button>
                                        <button
                                            disabled={isUpdatingStatus}
                                            onClick={() => toggleStatus('cursando')}
                                            className={`px-4 py-2 border rounded-lg font-black font-mono text-[10px] uppercase transition-all flex items-center gap-2 ${status === 'cursando'
                                                ? 'bg-[#00A3FF]/20 border-[#00A3FF]/50 text-[#00A3FF] shadow-[0_0_20px_rgba(0,163,255,0.2)]'
                                                : 'bg-[#1E1E1E] text-gray-400 border border-gray-800 hover:border-[#00A3FF]/50 hover:text-white'
                                                }`}
                                        >
                                            <Play size={14} fill={status === 'cursando' ? 'currentColor' : 'none'} />
                                            {status === 'cursando' ? '[CURSANDO]' : '[RADAR]'}
                                        </button>
                                    </>
                                )}
                            </div>

                            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-none italic">
                                {trail.title}
                            </h1>
                            {trail.description && (
                                <div className="relative group">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-[#00A3FF]/10 to-transparent rounded-2xl blur opacity-25 group-hover:opacity-50 transition-all"></div>
                                    <div className="relative p-6 bg-[#1E1E1E]/50 border border-gray-800 rounded-2xl backdrop-blur-sm">
                                        <h3 className="font-mono text-[9px] text-[#00A3FF] uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <Info size={12} /> [EMENTA_DA_DISCIPLINA]
                                        </h3>
                                        <p className="text-gray-300 font-mono text-sm leading-relaxed italic">
                                            {trail.description}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* 🔗 Quick Equivalences Chips below description */}
                            {hasEquivalences && (
                                <div className="flex flex-wrap gap-2 pt-2">
                                    <span className="font-mono text-[9px] text-gray-600 uppercase flex items-center gap-1.5 py-1.5">
                                        <Link2 size={10} /> Equivalentes:
                                    </span>
                                    {equivalentTrails.map((eq) => (
                                        <Link
                                            key={eq.id}
                                            href={`/trilhas/${eq.id}`}
                                            className="px-3 py-1.5 bg-[#1E1E1E] border border-gray-800 rounded-full font-mono text-[10px] text-gray-400 hover:text-[#00A3FF] hover:border-[#00A3FF]/40 transition-all flex items-center gap-2 group/chip"
                                        >
                                            <span className="font-bold">{eq.course_code}</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-700 group-hover/chip:bg-[#00A3FF]"></span>
                                            <span className="truncate max-w-[120px]">{eq.title}</span>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* Credits & Semester Compact Bar */}
                            <div className="flex flex-wrap gap-4 items-center pt-2">
                                <div className="flex items-center gap-2 font-mono text-[10px] text-gray-500">
                                    <BookOpen size={12} style={{ color: cfg.color }} />
                                    <span>{trail.credits_aula} Créditos Aula</span>
                                    {trail.credits_trabalho > 0 && (
                                        <span className="text-gray-600">+ {trail.credits_trabalho} Trabalho</span>
                                    )}
                                </div>
                                {trail.excitation_level && (
                                    <div className="flex items-center gap-2 font-mono text-[10px] text-gray-500">
                                        <GraduationCap size={12} style={{ color: cfg.color }} />
                                        <span>{trail.excitation_level}º Semestre sugerido</span>
                                    </div>
                                )}
                            </div>

                            {/* 🔗 Equivalence Panel (Progressive Disclosure) */}
                            <AnimatePresence>
                                {showEquivalences && hasEquivalences && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-4 bg-gradient-to-r from-cyan-500/5 via-cyan-500/3 to-transparent border border-cyan-500/20 rounded-xl space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 shrink-0 rounded-full bg-cyan-500/20 flex items-center justify-center">
                                                    <Link2 size={14} className="text-cyan-400" />
                                                </div>
                                                <div>
                                                    <h4 className="text-cyan-400 font-bold font-mono text-[10px] uppercase tracking-wider">
                                                        [EMARANHAMENTO_CURRICULAR]
                                                    </h4>
                                                    <p className="text-gray-500 text-[10px] font-mono">
                                                        Grupo {trail.equivalence_group} — Disciplinas com conteúdo equivalente em outros cursos.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-11">
                                                {equivalentTrails.map((eq) => {
                                                    const eqCfg = AXIS_CONFIG[eq.axis] || AXIS_CONFIG.comum;
                                                    return (
                                                        <Link
                                                            key={eq.id}
                                                            href={`/trilhas/${eq.id}`}
                                                            className="group flex items-center gap-3 p-3 bg-[#121212]/60 border border-cyan-500/10 rounded-lg hover:border-cyan-500/30 transition-all"
                                                        >
                                                            <eqCfg.icon size={12} style={{ color: eqCfg.color }} className="shrink-0" />
                                                            <div className="min-w-0">
                                                                <span className="block font-mono text-[8px] uppercase" style={{ color: eqCfg.color }}>
                                                                    {eq.course_code} • {eqCfg.label}
                                                                </span>
                                                                <span className="block text-[11px] text-gray-300 truncate group-hover:text-white transition-colors">
                                                                    {eq.title}
                                                                </span>
                                                            </div>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* ⚠️ Alerta de Instabilidade de Partícula (Pré-requisitos) */}
                        <AnimatePresence>
                            {hasPrerequisites && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-5 bg-gradient-to-r from-[#FF4B4B]/10 via-[#FF4B4B]/05 to-transparent border border-[#FF4B4B]/30 rounded-xl space-y-4">
                                        <div className="flex gap-4 items-center">
                                            <div className="w-10 h-10 shrink-0 rounded-full bg-[#FF4B4B] flex items-center justify-center animate-pulse shadow-[0_0_20px_#FF4B4B80]">
                                                <AlertTriangle size={18} className="text-[#121212]" />
                                            </div>
                                            <div>
                                                <h3 className="text-[#FF4B4B] font-bold font-mono text-xs uppercase italic tracking-wider">
                                                    [INSTABILIDADE_DE_PARTÍCULA_DETECTADA]
                                                </h3>
                                                <p className="text-gray-400 text-[11px] font-mono mt-1">
                                                    Esta trilha requer estabilização prévia em {prerequisiteTrails.length} partícula{prerequisiteTrails.length > 1 ? 's' : ''}. Recomenda-se concluir os pré-requisitos para maximizar a absorção quântica.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Prerequisite Cards */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-14">
                                            {prerequisiteTrails.map((prereq) => (
                                                <Link
                                                    key={prereq.course_code}
                                                    href={`/trilhas/${prereq.id}`}
                                                    className="group flex items-center gap-3 p-3 bg-[#121212]/60 border border-[#FF4B4B]/15 rounded-lg hover:border-[#FF4B4B]/40 transition-all"
                                                >
                                                    <Lock size={12} className="text-[#FF4B4B] shrink-0 group-hover:hidden" />
                                                    <Unlock size={12} className="text-[#FF4B4B] shrink-0 hidden group-hover:block" />
                                                    <div className="min-w-0">
                                                        <span className="block font-mono text-[9px] text-[#FF4B4B]/70 uppercase">{prereq.course_code}</span>
                                                        <span className="block text-[11px] text-gray-300 truncate group-hover:text-white transition-colors">{prereq.title}</span>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ⚡ Alerta PCC — Práticas como Componente Curricular */}
                        <AnimatePresence>
                            {hasPccRequirement && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-5 bg-gradient-to-r from-amber-500/10 via-amber-500/05 to-transparent border border-amber-500/30 rounded-xl space-y-3">
                                        <div className="flex gap-4 items-center">
                                            <div className="w-10 h-10 shrink-0 rounded-full bg-amber-500/20 flex items-center justify-center shadow-[0_0_15px_#F59E0B40]">
                                                <ShieldAlert size={18} className="text-amber-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-amber-400 font-bold font-mono text-xs uppercase italic tracking-wider">
                                                    [VALIDAÇÃO_PCC_REQUERIDA]
                                                </h3>
                                                <p className="text-gray-400 text-[11px] font-mono mt-1 max-w-xl leading-relaxed">
                                                    Esta disciplina contém Práticas como Componente Curricular (PCC). Alunos migrando do <strong className="text-amber-300">Bacharelado → Licenciatura</strong> precisam compensar a carga prática via disciplinas do &quot;Bloco de Ensino&quot; (ex: EDM0425/EDM0426, 4300356, 4300390).
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 🚫 Alerta XOR — Exclusão Mútua */}
                        <AnimatePresence>
                            {hasXorConflict && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-5 bg-gradient-to-r from-fuchsia-500/10 via-fuchsia-500/05 to-transparent border border-fuchsia-500/30 rounded-xl space-y-3">
                                        <div className="flex gap-4 items-center">
                                            <div className="w-10 h-10 shrink-0 rounded-full bg-fuchsia-500/20 flex items-center justify-center shadow-[0_0_15px_#D946EF40]">
                                                <Ban size={18} className="text-fuchsia-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-fuchsia-400 font-bold font-mono text-xs uppercase italic tracking-wider">
                                                    [EXCLUSÃO_MÚTUA_DETECTADA]
                                                </h3>
                                                <p className="text-gray-400 text-[11px] font-mono mt-1 max-w-xl leading-relaxed">
                                                    Esta disciplina possui exclusão mútua (XOR). Completar ambas <strong className="text-fuchsia-300">não acumula XP</strong> — apenas a primeira concluída contabiliza energia atômica.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="pl-14 space-y-1">
                                            {xorExclusions.map((xor, i) => (
                                                <div key={i} className="font-mono text-[10px] text-fuchsia-300/70">
                                                    ⊕ {xor.group_a} ↔ {xor.group_b}: <span className="text-gray-500">{xor.reason}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Progress Bar (when topics are being completed) */}
                        {completedTopics.size > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-2"
                            >
                                <div className="flex justify-between items-center font-mono text-[10px] uppercase tracking-wider">
                                    <span className="text-gray-500">Progresso_Local</span>
                                    <span style={{ color: cfg.color }}>{progressPercent}%</span>
                                </div>
                                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: cfg.color }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPercent}%` }}
                                        transition={{ duration: 0.5, ease: 'easeOut' }}
                                    />
                                </div>
                            </motion.div>
                        )}

                        {/* 📦 Repositório de Materiais Inteligente (Feed) */}
                        <div id="material-feed" className="space-y-8 pt-10 border-t border-gray-800">
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black uppercase italic tracking-tight">Materiais e Colisões</h2>
                                    <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest italic">
                                        [SISTEMA_DE_RECURSOS_COMPARTILHADOS] — {totalMaterials} Partículas Detectadas
                                    </p>
                                </div>
                                <Link
                                    href="/enviar"
                                    className="px-6 py-3 bg-[#00A3FF] hover:bg-[#0082CC] text-white font-black font-mono text-[10px] uppercase rounded-xl transition-all shadow-[0_0_20px_rgba(0,163,255,0.3)] hover:scale-105 active:scale-95 text-center"
                                >
                                    Enviar Material
                                </Link>
                            </div>

                            {materials.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {materials.map((item: any) => {
                                        const isOriginalSubject = item.course_code === trail.course_code;
                                        return (
                                            <motion.div
                                                key={item.submission_link_id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="group relative bg-[#1E1E1E] border border-gray-800 rounded-2xl p-5 hover:border-gray-600 transition-all flex flex-col h-full overflow-hidden"
                                            >
                                                {/* Visual Decor */}
                                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                                    {item.media_type === 'video' ? <Play size={40} /> : <FileText size={40} />}
                                                </div>

                                                <div className="flex items-start gap-4 mb-4">
                                                    <div className="w-10 h-10 rounded-xl bg-[#121212] flex items-center justify-center text-gray-500 group-hover:text-[#00A3FF] transition-colors shrink-0">
                                                        {item.media_type === 'video' ? <Play size={20} /> : <FileText size={20} />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-mono text-[9px] text-[#00A3FF] uppercase font-bold tracking-tighter">
                                                                {item.media_type}
                                                            </span>
                                                            {!isOriginalSubject && (
                                                                <span className="font-mono text-[8px] px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded border border-gray-700">
                                                                    Via: {item.course_code}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <h3 className="text-sm font-bold text-gray-100 dark:group-hover:text-white transition-colors line-clamp-2">
                                                            {item.title}
                                                        </h3>
                                                    </div>
                                                </div>

                                                <div className="mt-auto pt-4 border-t border-gray-800/50 flex items-center justify-between">
                                                    <span className="font-mono text-[9px] text-gray-600 italic truncate pr-4">
                                                        {item.authors || 'Colaborador Anônimo'}
                                                    </span>
                                                    <Link
                                                        href={`/arquivo/${item.id}`}
                                                        className="font-mono text-[9px] font-bold text-[#00A3FF] hover:underline flex items-center gap-1 shrink-0"
                                                    >
                                                        ACESSAR_DADOS <Play size={8} />
                                                    </Link>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-800/50 rounded-3xl bg-[#1E1E1E]/30 space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center text-gray-600">
                                        <Zap size={30} className="opacity-20" />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="font-bold text-gray-400 font-mono uppercase tracking-widest">[NENHUMA_PARTICULA_DETECTADA]</h3>
                                        <p className="text-xs text-gray-600 font-mono mt-1">Seja o primeiro a colidir conhecimento nesta trilha.</p>
                                    </div>
                                    <Link
                                        href="/enviar"
                                        className="mt-4 flex items-center gap-2 text-[#00A3FF] font-mono text-[10px] font-bold hover:underline"
                                    >
                                        INICIAR_TRANSMISSÃO_DE_DADOS <Zap size={10} />
                                    </Link>
                                </div>
                            )}

                            {/* Load More Button */}
                            {totalMaterials > materials.length && (
                                <div className="flex justify-center pt-8">
                                    <button
                                        onClick={loadMoreMaterials}
                                        disabled={loadingMore}
                                        className="btn-sci-fi group inline-flex flex-col items-center gap-2 px-10 py-4"
                                    >
                                        <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
                                            Sincronizar_Mais
                                        </span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-bold dark:text-white">
                                                {loadingMore ? 'Processando...' : 'Carregar Mais Conteúdo'}
                                            </span>
                                            {!loadingMore && <Play size={14} className="text-[#00A3FF] group-hover:translate-x-1 transition-transform" />}
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* ⛓️ Árvore de Pré-requisitos (Base Section) */}
                        <div id="prerequisites" className="pt-20 border-t border-gray-800 space-y-8">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-black uppercase italic tracking-tight">Estabilização de Partículas</h2>
                                <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest italic">
                                    [DEPENDENCIAS_CURRICULARES] — Sequência Lógica de Estudo
                                </p>
                            </div>

                            {prerequisiteTrails.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {prerequisiteTrails.map((prereq) => (
                                        <Link
                                            key={prereq.id}
                                            href={`/trilhas/${prereq.id}`}
                                            className="group flex flex-col p-5 bg-[#1E1E1E] border border-gray-800 rounded-2xl hover:border-[#FF4B4B]/30 transition-all relative overflow-hidden h-32"
                                        >
                                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                                                <Lock size={40} className="text-[#FF4B4B]" />
                                            </div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 rounded-lg bg-[#FF4B4B]/10 flex items-center justify-center">
                                                    <Lock size={14} className="text-[#FF4B4B]" />
                                                </div>
                                                <span className="font-mono text-[10px] text-[#FF4B4B] font-bold">
                                                    {prereq.course_code}
                                                </span>
                                            </div>
                                            <h3 className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors line-clamp-2">
                                                {prereq.title}
                                            </h3>
                                            <div className="mt-auto flex items-center gap-1 font-mono text-[8px] text-gray-600 uppercase">
                                                Acessar_Requisito <ArrowLeft size={8} className="rotate-180" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-10 border border-gray-800/30 rounded-3xl bg-[#1E1E1E]/20 text-center space-y-2">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                                        <Unlock size={12} className="text-green-500" />
                                        <span className="font-mono text-[9px] text-green-500 font-bold uppercase tracking-widest">Acesso Livre</span>
                                    </div>
                                    <p className="text-xs text-gray-500 font-mono italic">Esta disciplina não possui dependências curriculares externas.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar - Hidden in Focus Mode */}
                <AnimatePresence>
                    {!focusMode && (
                        <motion.aside
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20, width: 0 }}
                            transition={{ duration: 0.4, ease: 'easeInOut' }}
                            className="space-y-8"
                        >
                            {/* Info Card */}
                            <div className="bg-[#1E1E1E] p-6 rounded-xl border border-gray-800 space-y-6" style={{ borderColor: `${cfg.color}15` }}>
                                <div className="space-y-2 pb-4 border-b border-gray-800">
                                    <h3 className="font-mono text-[10px] font-bold text-gray-500 uppercase tracking-widest">[METADADOS]</h3>
                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div>
                                            <span className="block text-[10px] text-gray-600 font-mono tracking-tighter uppercase">Créditos Aula</span>
                                            <span className="text-xl font-black italic">{trail.credits_aula}</span>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] text-gray-600 font-mono tracking-tighter uppercase">Créditos Trabalho</span>
                                            <span className="text-xl font-black italic">{trail.credits_trabalho}</span>
                                        </div>
                                    </div>
                                    {/* Energy bars */}
                                    <div className="flex gap-1 pt-2">
                                        {Array.from({ length: 10 }).map((_, i) => (
                                            <div
                                                key={i}
                                                className={`h-1.5 flex-1 rounded-sm transition-all ${i < (trail.credits_aula + trail.credits_trabalho) ? '' : 'bg-gray-800 opacity-20'}`}
                                                style={{ backgroundColor: i < (trail.credits_aula + trail.credits_trabalho) ? cfg.color : undefined }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Semester */}
                                {trail.excitation_level && (
                                    <div className="space-y-1">
                                        <span className="block text-[10px] text-gray-600 font-mono uppercase">Semestre Sugerido</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-black italic" style={{ color: cfg.color }}>{trail.excitation_level}º</span>
                                            <span className="text-[10px] text-gray-500 font-mono">Nível de Excitação</span>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <Info size={16} className="text-gray-500 mt-1 shrink-0" />
                                        <div>
                                            <span className="block text-[10px] text-gray-500 font-mono underline uppercase mb-1 underline-offset-4">Objetivo Curricular</span>
                                            <p className="text-[11px] text-gray-400 font-mono leading-relaxed">
                                                Integralização do núcleo {trail.axis === 'comum' ? 'básico' : 'específico'} conforme manual IFUSP 2025.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {isFinished ? (
                                        <button
                                            disabled={isUpdatingStatus}
                                            onClick={() => toggleStatus('concluida')}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 text-black font-black font-mono text-[10px] uppercase rounded-lg transition-all shadow-[0_0_20px_rgba(34,197,94,0.4)]"
                                        >
                                            <Trophy size={12} />
                                            [APROVADO]
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                disabled={isUpdatingStatus}
                                                onClick={() => toggleStatus('concluida')}
                                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-white text-[#121212] hover:bg-gray-200 font-black font-mono text-[10px] uppercase rounded-lg transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                                            >
                                                <CheckCircle2 size={12} />
                                                [FEITO]
                                            </button>
                                            <button
                                                disabled={isUpdatingStatus}
                                                onClick={() => toggleStatus('cursando')}
                                                className={`flex-1 flex items-center justify-center gap-2 py-3 font-black font-mono text-[10px] uppercase rounded-lg transition-all ${status === 'cursando'
                                                    ? 'bg-[#00A3FF] text-white shadow-[0_0_20px_rgba(0,163,255,0.4)]'
                                                    : 'bg-[#1E1E1E] text-gray-400 border border-gray-800 hover:border-[#00A3FF]/50 hover:text-white'
                                                    }`}
                                            >
                                                <Play size={12} fill={status === 'cursando' ? 'currentColor' : 'none'} />
                                                {status === 'cursando' ? '[CURSANDO]' : '[RADAR]'}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Prerequisites Sidebar Card (if any) */}
                            {hasPrerequisites && (
                                <div className="bg-[#1E1E1E] p-6 rounded-xl border border-[#FF4B4B]/15 space-y-4">
                                    <h4 className="font-mono text-[10px] text-[#FF4B4B] uppercase tracking-widest font-bold">[PRÉ-REQUISITOS]</h4>
                                    <div className="space-y-2">
                                        {prerequisiteTrails.map((prereq) => (
                                            <Link
                                                key={prereq.course_code}
                                                href={`/trilhas/${prereq.id}`}
                                                className="flex items-center gap-2 p-2 rounded bg-[#121212] border border-gray-800 hover:border-[#FF4B4B]/30 transition-all group"
                                            >
                                                <Lock size={10} className="text-[#FF4B4B]/50 shrink-0" />
                                                <div className="min-w-0">
                                                    <span className="block font-mono text-[8px] text-gray-600">{prereq.course_code}</span>
                                                    <span className="block text-[10px] text-gray-400 truncate group-hover:text-white transition-colors">{prereq.title}</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Equivalences Sidebar Card */}
                            {hasEquivalences && (
                                <div className="bg-[#1E1E1E] p-6 rounded-xl border border-cyan-500/15 space-y-4">
                                    <h4 className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest font-bold flex items-center gap-2">
                                        <Link2 size={12} /> [EMARANHAMENTO]
                                    </h4>
                                    <p className="text-[10px] text-gray-500 font-mono">
                                        Grupo: {trail.equivalence_group}
                                    </p>
                                    <div className="space-y-2">
                                        {equivalentTrails.map((eq) => {
                                            const eqCfg = AXIS_CONFIG[eq.axis] || AXIS_CONFIG.comum;
                                            return (
                                                <Link
                                                    key={eq.id}
                                                    href={`/trilhas/${eq.id}`}
                                                    className="flex items-center gap-2 p-2 rounded bg-[#121212] border border-gray-800 hover:border-cyan-500/30 transition-all group"
                                                >
                                                    <eqCfg.icon size={10} style={{ color: eqCfg.color }} className="shrink-0" />
                                                    <div className="min-w-0">
                                                        <span className="block font-mono text-[8px]" style={{ color: eqCfg.color }}>{eq.course_code}</span>
                                                        <span className="block text-[10px] text-gray-400 truncate group-hover:text-white transition-colors">{eq.title}</span>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </motion.aside>
                    )}
                </AnimatePresence>
                {/* Global Sync Overlay */}
                <AnimatePresence>
                    {isSyncing && (
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
                                    Protocolo Síncrotron v3 {'>'} Estabelecendo vínculo orbital...
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
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
