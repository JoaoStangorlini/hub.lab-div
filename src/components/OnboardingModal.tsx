'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

// V4.2 Schema — aligned with actual DB columns
const onboardingSchema = z.discriminatedUnion('is_usp_member', [
    // Track A: USP Member
    z.object({
        is_usp_member: z.literal(true),
        institute: z.string().min(1, "O instituto é obrigatório"),
        entrance_year: z.coerce.number().min(1950, "Mínimo 1950").max(2026, "Máximo 2026"),
        usp_status: z.enum(['Graduação', 'Mestrado', 'Doutorado']),
        lattes_url: z.string().url("URL inválida").optional().or(z.literal("")),
        available_to_mentor: z.boolean().default(false),
        has_scholarship: z.boolean().default(false),
        seeking_scholarship: z.boolean().default(false),
        interest_help_comm: z.boolean().default(false),
        interest_learn_prod: z.boolean().default(false),
        bio: z.string().min(10, "A bio deve ter pelo menos 10 caracteres"),
        artistic_interests: z.array(z.string()).default([]),
    }).refine((data) => {
        if (data.available_to_mentor) {
            const years = new Date().getFullYear() - data.entrance_year;
            return years >= 2;
        }
        return true;
    }, {
        message: "O programa 'Adote um Bicho' exige 2+ anos de casa.",
        path: ["available_to_mentor"]
    }),

    // Track B: Sou Curioso (External)
    z.object({
        is_usp_member: z.literal(false),
        education_level: z.string().min(1, "Nível de escolaridade é obrigatório"),
        completion_year: z.coerce.number().min(2025, "Previsão deve ser futura").optional().or(z.literal(0)),
        major: z.string().optional(),
        objective: z.string().min(1, "O objetivo é obrigatório"),
        interests: z.array(z.string()).min(1, "Selecione ao menos um interesse"),
        artistic_interests: z.array(z.string()).default([]),
        bio: z.string().min(10, "A bio deve ter pelo menos 10 caracteres"),
    }).refine((data) => {
        const isIncomplete = data.education_level.includes('Incompleto');
        if (isIncomplete && (!data.completion_year || data.completion_year < 2025)) {
            return false;
        }
        return true;
    }, {
        message: "Para cursos incompletos, informe o ano de previsão (2025+).",
        path: ["completion_year"]
    })
]);

type OnboardingData = z.infer<typeof onboardingSchema>;

interface OnboardingModalProps {
    userId: string;
    email: string;
    onComplete: () => void;
}

// Expanded hobbies list (V4.2)
const allHobbies = [
    'Fotógrafo(a)', 'Músico(a)', 'Pintor(a)', 'Escritor(a)', 'Gamer', 'Designer',
    'Cientista de Dados', 'Viajante', 'Cozinheiro(a)', 'Atleta',
    'Escultor(a)', 'Dançarino(a)', 'Podcaster', 'Programador(a)',
    'Youtuber', 'Cinéfilo(a)', 'Leitor(a)', 'Instrumentista',
    'Ilustrador(a)', 'Artesão/Artesã', 'Maratonista',
    'Ativista', 'Empreendedor(a)',
];
const INITIAL_HOBBIES_VISIBLE = 10;

// Expanded institute list (V4.3 Golden Master)
const institutes = [
    { value: 'IFUSP', label: 'IFUSP - Física' },
    { value: 'IAG', label: 'IAG - Astronomia/Geofísica' },
    { value: 'POLI', label: 'Poli - Engenharia' },
    { value: 'IME', label: 'IME - Matemática/Estatística' },
    { value: 'IQ', label: 'IQ - Química' },
    { value: 'IB', label: 'IB - Biociências' },
    { value: 'FAU', label: 'FAU - Arquitetura/Urbanismo' },
    { value: 'ECA', label: 'ECA - Artes/Comunicações' },
    { value: 'FEA', label: 'FEA - Economia/Administração' },
    { value: 'FFLCH', label: 'FFLCH - Letras/Humanas' },
    { value: 'IP', label: 'IP - Psicologia' },
    { value: 'ICB', label: 'ICB - Biomédicas' },
    { value: 'OUTRO', label: 'Outro' },
];

export default function OnboardingModal({ userId, email, onComplete }: OnboardingModalProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [showAllHobbies, setShowAllHobbies] = useState(false);
    const isUspDomain = email.endsWith('@usp.br') || email.endsWith('@alumni.usp.br');


    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<any>({
        resolver: zodResolver(onboardingSchema),
        defaultValues: {
            is_usp_member: isUspDomain,
            entrance_year: 2024,
            available_to_mentor: false,
            has_scholarship: false,
            seeking_scholarship: false,
            interest_help_comm: false,
            interest_learn_prod: false,
            interests: [],
            artistic_interests: [],
        }
    });

    const isUspMember = watch('is_usp_member');
    const educationLevel = watch('education_level');
    const entranceYear = watch('entrance_year');

    const userYears = entranceYear ? (new Date().getFullYear() - Number(entranceYear)) : 0;
    const canMentor = userYears >= 2;

    const isIncomplete = educationLevel?.includes('Incompleto');
    const isHigherEd = educationLevel && [
        'Superior Incompleto',
        'Superior Completo',
        'Pós-Graduação',
        'Mestrado',
        'Doutorado'
    ].includes(educationLevel);

    const onSubmit = async (data: OnboardingData) => {
        setIsSaving(true);
        try {
            // Build update payload with ONLY columns that exist in 'profiles'
            // [GOLDEN MASTER] 🛡️ EXPLICIT RLS GUARD: 
            // DO NOT set 'role' or 'review_status'. 
            // These would trigger 'new row violates row-level security policy' (403/Forbidden).
            const updateData: Record<string, any> = {
                is_usp_member: data.is_usp_member,
                bio: data.bio,
                is_public: false,
                artistic_interests: data.artistic_interests,
            };

            if (data.is_usp_member) {
                updateData.institute = data.institute;
                updateData.entrance_year = data.entrance_year;
                updateData.usp_status = data.usp_status;
                updateData.lattes_url = data.lattes_url || null;
                updateData.available_to_mentor = data.available_to_mentor;
                updateData.has_scholarship = data.has_scholarship;
                updateData.seeking_scholarship = data.seeking_scholarship;
                updateData.interest_help_comm = data.interest_help_comm;
                updateData.interest_learn_prod = data.interest_learn_prod;
                // DO NOT set role - it has a CHECK constraint ('user', 'admin')
            } else {
                updateData.education_level = data.education_level;
                updateData.completion_year = data.completion_year || null;
                updateData.major = data.major || null;
                updateData.objective = data.objective;
                updateData.interests = data.interests;
                // DO NOT set role - it has a CHECK constraint ('user', 'admin')
            }

            const { error } = await supabase
                .from('profiles')
                .update(updateData)
                .eq('id', userId);

            if (error) throw error;


            toast.success("Perfil enviado para análise!");
            onComplete();
        } catch (error: any) {
            console.error('Error saving onboarding:', error);
            toast.error(`Erro ao salvar perfil: ${error?.message || 'Verifique os campos.'}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSkip = async () => {
        setIsSaving(true);
        try {
            await supabase
                .from('profiles')
                .update({
                    is_usp_member: isUspDomain,
                    is_public: false,
                    // [GOLDEN MASTER] 🛡️ Avoid setting 'role' or 'review_status' here too
                })
                .eq('id', userId);

            toast.success("Perfil básico criado. Complete depois!");
            onComplete();
        } catch (e) {
            toast.error("Erro ao pular.");
        } finally {
            setIsSaving(false);
        }
    };

    const visibleHobbies = showAllHobbies ? allHobbies : allHobbies.slice(0, INITIAL_HOBBIES_VISIBLE);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500" />

            <div className="relative w-full max-w-2xl bg-card-dark/50 border border-white/10 rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-500 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-blue/20 blur-3xl rounded-full" />

                <div className="relative text-center mb-8">
                    <h2 className="text-3xl font-display font-bold text-white mb-2 tracking-tight">
                        Criação de Perfil
                    </h2>
                    <p className="text-gray-400 text-sm">
                        {isUspMember
                            ? "Complete seus dados acadêmicos para integrar a rede do Lab-Div."
                            : "Explore o Hub como um Curioso e personalize sua experiência."}
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative">
                    {isUspMember ? (
                        /* USP TRACK */
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Instituto</label>
                                <select
                                    {...register('institute')}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-brand-blue/50"
                                >
                                    <option value="" className="bg-card-dark text-gray-400">Selecione...</option>
                                    {institutes.map(inst => (
                                        <option key={inst.value} value={inst.value} className="bg-card-dark">{inst.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Ano de Ingresso</label>
                                <input
                                    type="number"
                                    {...register('entrance_year')}
                                    defaultValue={2024}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white"
                                />
                                {errors.entrance_year && <p className="text-red-400 text-[10px] mt-1 ml-1 font-bold">{(errors.entrance_year as any).message}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Status</label>
                                <select
                                    {...register('usp_status')}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white"
                                >
                                    <option value="" className="bg-card-dark">Selecione...</option>
                                    <option value="Graduação" className="bg-card-dark">Graduação</option>
                                    <option value="Mestrado" className="bg-card-dark">Mestrado</option>
                                    <option value="Doutorado" className="bg-card-dark">Doutorado</option>
                                </select>
                            </div>

                            {/* === OPORTUNIDADES (V4.3 — Toggle Buttons with Descriptions) === */}
                            <div className="col-span-2 space-y-3 p-5 bg-white/5 border border-white/10 rounded-3xl">
                                <label className="block text-xs font-black uppercase tracking-widest text-brand-blue mb-1">Oportunidades</label>
                                <p className="text-[10px] text-gray-500 mb-4">Selecione se você possui ou busca alguma dessas modalidades no IFUSP.</p>
                                <div className="grid grid-cols-1 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setValue('has_scholarship', !watch('has_scholarship'))}
                                        className={`flex items-start gap-4 p-4 rounded-2xl text-left transition-all border-2 ${watch('has_scholarship') ? 'bg-brand-blue/10 border-brand-blue text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'}`}
                                    >
                                        <div className={`mt-1 size-5 rounded-full border-2 flex items-center justify-center shrink-0 ${watch('has_scholarship') ? 'border-brand-blue bg-brand-blue text-white' : 'border-gray-600'}`}>
                                            {watch('has_scholarship') && <span className="material-symbols-outlined text-[14px] font-black">check</span>}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-wider">Possuo Oportunidade</p>
                                            <p className="text-[10px] text-gray-400 mt-1">IC (Pesquisa), AEX (Projetos/Eventos) ou Monitoria (Apoio Docente).</p>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setValue('seeking_scholarship', !watch('seeking_scholarship'))}
                                        className={`flex items-start gap-4 p-4 rounded-2xl text-left transition-all border-2 ${watch('seeking_scholarship') ? 'bg-brand-blue/10 border-brand-blue text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'}`}
                                    >
                                        <div className={`mt-1 size-5 rounded-full border-2 flex items-center justify-center shrink-0 ${watch('seeking_scholarship') ? 'border-brand-blue bg-brand-blue text-white' : 'border-gray-600'}`}>
                                            {watch('seeking_scholarship') && <span className="material-symbols-outlined text-[14px] font-black">check</span>}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-wider">Buscando Oportunidade</p>
                                            <p className="text-[10px] text-gray-400 mt-1">Gostaria de participar de Iniciação Científica ou monitorias em breve.</p>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <div className={`col-span-2 p-4 rounded-2xl flex items-center justify-between border transition-all ${canMentor ? 'bg-brand-blue/5 border-brand-blue/20' : 'bg-gray-800/20 border-white/5 opacity-50'}`}>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-blue-300">🐾 Adote um Bicho</p>
                                    <p className="text-[10px] text-gray-400">
                                        {canMentor ? "Disponível para mentorar novatos?" : "Bloqueado: Requer 2+ anos de casa."}
                                    </p>
                                </div>
                                <label className={`relative inline-flex items-center ${canMentor ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                                    <input
                                        type="checkbox"
                                        {...register('available_to_mentor')}
                                        disabled={!canMentor}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue"></div>
                                </label>
                            </div>

                            <div className="col-span-2 space-y-3">
                                <label className="block text-xs font-black uppercase tracking-widest text-brand-blue mb-2 ml-1">Interesses no Lab-Div</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setValue('interest_help_comm', !watch('interest_help_comm'))}
                                        className={`p-4 rounded-2xl border transition-all text-left flex flex-col gap-2 ${watch('interest_help_comm') ? 'bg-brand-blue/10 border-brand-blue' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className={`material-symbols-outlined ${watch('interest_help_comm') ? 'text-brand-blue' : 'text-gray-500'}`}>
                                                campaign
                                            </span>
                                            {watch('interest_help_comm') && <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse"></span>}
                                        </div>
                                        <div>
                                            <p className={`text-xs font-bold ${watch('interest_help_comm') ? 'text-white' : 'text-gray-400'}`}>Quero ajudar</p>
                                            <p className="text-[10px] text-gray-500 mt-1">Ajudar a melhorar a comunicação científica no Hub.</p>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setValue('interest_learn_prod', !watch('interest_learn_prod'))}
                                        className={`p-4 rounded-2xl border transition-all text-left flex flex-col gap-2 ${watch('interest_learn_prod') ? 'bg-brand-blue/10 border-brand-blue' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className={`material-symbols-outlined ${watch('interest_learn_prod') ? 'text-brand-blue' : 'text-gray-500'}`}>
                                                auto_awesome
                                            </span>
                                            {watch('interest_learn_prod') && <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse"></span>}
                                        </div>
                                        <div>
                                            <p className={`text-xs font-bold ${watch('interest_learn_prod') ? 'text-white' : 'text-gray-400'}`}>Quero aprender</p>
                                            <p className="text-[10px] text-gray-500 mt-1">Aprender a produzir novos materiais de divulgação.</p>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* EXTERNAL TRACK */
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Escolaridade</label>
                                <select
                                    {...register('education_level')}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white"
                                >
                                    <option value="" className="bg-card-dark">Selecione...</option>
                                    <option value="Fundamental Incompleto" className="bg-card-dark">Fundamental Incompleto</option>
                                    <option value="Fundamental Completo" className="bg-card-dark">Fundamental Completo</option>
                                    <option value="Médio Incompleto" className="bg-card-dark">Médio Incompleto</option>
                                    <option value="Médio Completo" className="bg-card-dark">Médio Completo</option>
                                    <option value="Superior Incompleto" className="bg-card-dark">Superior Incompleto</option>
                                    <option value="Superior Completo" className="bg-card-dark">Superior Completo</option>
                                    <option value="Pós-Graduação" className="bg-card-dark">Pós-Graduação</option>
                                    <option value="Mestrado" className="bg-card-dark">Mestrado</option>
                                    <option value="Doutorado" className="bg-card-dark">Doutorado</option>
                                </select>
                            </div>

                            {isIncomplete && (
                                <div className="animate-in slide-in-from-top-2 duration-300">
                                    <label className="block text-xs font-black uppercase tracking-widest text-orange-400 mb-2 ml-1">Previsão Término (2025+)</label>
                                    <input
                                        type="number"
                                        {...register('completion_year')}
                                        placeholder="Ex: 2026"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white"
                                    />
                                    {errors.completion_year && <p className="text-red-400 text-[10px] mt-1 ml-1 font-bold">{(errors.completion_year as any).message}</p>}
                                </div>
                            )}

                            {isHigherEd && (
                                <div className="col-span-2 animate-in slide-in-from-top-2 duration-300">
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Área de Formação</label>
                                    <input
                                        type="text"
                                        {...register('major')}
                                        placeholder="Ex: Física, Artes Visuais, Ciência de Dados..."
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white"
                                    />
                                </div>
                            )}

                            <div className="col-span-2">
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Objetivo no Hub</label>
                                <input
                                    type="text"
                                    {...register('objective')}
                                    placeholder="Ex: Aprender sobre física para o ENEM..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Interesses Científicos</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Astronomia', 'Física Quântica', 'Óptica', 'Divulgação', 'IA'].map((tag) => {
                                        const cur = watch('interests') || [];
                                        const active = cur.includes(tag);
                                        return (
                                            <button key={tag} type="button" onClick={() => setValue('interests', active ? cur.filter((t: any) => t !== tag) : [...cur, tag])}
                                                className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${active ? 'bg-brand-blue border-brand-blue text-white' : 'bg-white/5 border-white/10 text-gray-500 hover:border-gray-600'}`}>
                                                {tag}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* === HOBBIES with "Ver mais" (V4.2) === */}
                    <div className="space-y-3">
                        <label className="block text-xs font-black uppercase tracking-widest text-brand-red mb-2 ml-1">Lado Artístico / Hobbies</label>
                        <div className="flex flex-wrap gap-2">
                            {visibleHobbies.map((tag) => {
                                const cur = watch('artistic_interests') || [];
                                const active = cur.includes(tag);
                                return (
                                    <button key={tag} type="button" onClick={() => setValue('artistic_interests', active ? cur.filter((t: any) => t !== tag) : [...cur, tag])}
                                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${active ? 'bg-brand-red border-brand-red text-white' : 'bg-white/5 border-white/10 text-gray-500 hover:border-gray-600'}`}>
                                        {tag}
                                    </button>
                                );
                            })}
                            {!showAllHobbies && (
                                <button
                                    type="button"
                                    onClick={() => setShowAllHobbies(true)}
                                    className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border border-dashed border-white/20 text-gray-400 hover:border-brand-red hover:text-brand-red flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-sm">add</span>
                                    Ver mais ({allHobbies.length - INITIAL_HOBBIES_VISIBLE})
                                </button>
                            )}
                        </div>
                    </div>


                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Bio (Sua história)</label>
                        <textarea
                            {...register('bio')}
                            placeholder="Ex: Sou do curso de Física, pesquiso Óptica. Sou fotógrafo nas horas vagas e me interesso por ficção científica."
                            className="w-full h-24 bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-brand-blue/50 resize-none placeholder:text-gray-600"
                        />
                        {errors.bio && <p className="text-red-400 text-[10px] mt-1 ml-1 font-bold">{(errors.bio as any).message}</p>}
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={handleSkip}
                            disabled={isSaving}
                            className="flex-1 bg-transparent border border-white/10 text-gray-400 hover:text-white py-4 rounded-2xl font-bold transition-all disabled:opacity-50"
                        >
                            Pular esta etapa
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-[2] bg-[#3B82F6] hover:bg-blue-600 text-white py-4 rounded-2xl font-bold transition-all transform hover:-translate-y-1 active:scale-95 shadow-xl shadow-blue-500/20 disabled:opacity-50"
                        >
                            {isSaving ? "Enviando..." : "Salvar e Começar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
