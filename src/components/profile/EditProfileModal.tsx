'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { Loader2, X, User, FileText, Globe, Link, Building2, ShieldCheck, Star, Mail, Phone, FileUp } from 'lucide-react';
import { updateProfile, getProfileWithPseudonyms, uploadEnrollmentProof } from '@/app/actions/profiles';
import { getUserPseudonyms, createPseudonym } from '@/app/actions/submissions';
import { Profile } from '@/types';

const profileSchema = z.object({
    email: z.string().optional(),
    full_name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(100),
    bio: z.string().max(160, "Bio muito longa (máx 160)").default(''),
    username: z.string().max(30, "Apelido muito longo").default(''),
    use_nickname: z.boolean().default(false),
    institute: z.string().default(''),
    course: z.string().default(''),
    whatsapp: z.string().optional(),
    entrance_year: z.string().optional(),
    artistic_interests_str: z.string().default(''),
    lattes_url: z.string().url("Link do Lattes inválido").or(z.literal("")).default(''),
    new_nickname: z.string().max(30).default(''),
    available_to_mentor: z.boolean().default(false),
    seeking_mentor: z.boolean().default(false),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function EditProfileModal({ isOpen, onClose, onSuccess }: EditProfileModalProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [pseudonyms, setPseudonyms] = useState<any[]>([]);
    const [isCreatingNickname, setIsCreatingNickname] = useState(false);
    const [currentStatus, setCurrentStatus] = useState<'pending' | 'approved' | 'rejected'>('approved');

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema) as any,
        defaultValues: {
            email: '',
            full_name: '',
            bio: '',
            username: '',
            use_nickname: false,
            institute: '',
            course: '',
            whatsapp: '',
            entrance_year: '',
            artistic_interests_str: '',
            lattes_url: '',
            new_nickname: '',
            available_to_mentor: false,
            seeking_mentor: false,
        }
    });

    const [profileData, setProfileData] = useState<Profile | null>(null);
    const [proofFile, setProofFile] = useState<File | null>(null);

    const useNickname = watch('use_nickname');
    const seekingMentor = watch('seeking_mentor');
    const availableToMentor = watch('available_to_mentor');

    useEffect(() => {
        if (isOpen) {
            loadInitialData();
        }
    }, [isOpen]);

    useEffect(() => {
        if (seekingMentor) {
            setValue('available_to_mentor', false);
        }
    }, [seekingMentor, setValue]);

    useEffect(() => {
        if (availableToMentor) {
            setValue('seeking_mentor', false);
        }
    }, [availableToMentor, setValue]);

    const loadInitialData = async () => {
        setIsLoading(true);
        const res = await getProfileWithPseudonyms();
        if ('error' in res) {
            toast.error(res.error || 'Erro ao carregar dados');
            onClose();
        } else {
            const { profile, pseudonyms } = res;
            setCurrentStatus(profile.review_status);
            setValue('email', profile.email || '');
            setValue('full_name', profile.full_name || '');
            setValue('bio', profile.bio || '');
            setValue('username', profile.username || '');
            setValue('use_nickname', profile.use_nickname || false);
            setValue('institute', profile.institute || '');
            setValue('course', profile.course || '');
            setValue('whatsapp', profile.whatsapp || '');
            setValue('entrance_year', profile.entrance_year?.toString() || new Date().getFullYear().toString());
            setValue('artistic_interests_str', profile.artistic_interests?.join(', ') || '');
            setValue('lattes_url', profile.lattes_url || '');
            setValue('available_to_mentor', profile.available_to_mentor || false);
            setValue('seeking_mentor', profile.seeking_mentor || false);
            setProfileData(profile);
            setPseudonyms(pseudonyms);
        }
        setIsLoading(false);
    };

    const handleCreateNickname = async () => {
        const name = watch('new_nickname')?.trim();
        if (!name || name.length < 3) {
            toast.error("Apelido muito curto");
            return;
        }

        if (pseudonyms.length >= 2) {
            toast.error("Limite de 2 apelidos atingido");
            return;
        }

        setIsCreatingNickname(true);
        const res = await createPseudonym(name);
        if (res.success && res.data) {
            toast.success("Apelido criado!");
            setPseudonyms(prev => [...prev, res.data]);
            setValue('username', res.data.name);
            setValue('new_nickname', '');
        } else {
            toast.error(res.error || "Erro ao criar apelido");
        }
        setIsCreatingNickname(false);
    };

    const onSubmit = async (data: ProfileFormValues) => {
        setIsSaving(true);

        let proofUrl = profileData?.usp_proof_url || null;

        if (proofFile) {
            const formData = new FormData();
            formData.append('proof', proofFile);
            const uploadRes = await uploadEnrollmentProof(formData);
            if (uploadRes.success && uploadRes.path) {
                proofUrl = uploadRes.path;
            } else {
                toast.error(uploadRes.error || 'Erro ao fazer upload do arquivo');
                setIsSaving(false);
                return;
            }
        }

        // Remove new_nickname and email (read-only) and map fields to profileData
        const { new_nickname, email, artistic_interests_str, entrance_year, ...restData } = data;

        const updatedProfileData = {
            ...restData,
            usp_proof_url: proofUrl,
            entrance_year: entrance_year ? parseInt(entrance_year, 10) : null,
            artistic_interests: artistic_interests_str
                ? artistic_interests_str.split(',').map((s: string) => s.trim()).filter(Boolean)
                : []
        };
        const res = await updateProfile(updatedProfileData as any);
        if (res.success) {
            toast.success('Alterações enviadas para aprovação!');
            onSuccess();
            onClose();
        } else {
            toast.error(res.error || 'Erro ao salvar alterações');
        }
        setIsSaving(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl border border-gray-100 dark:border-white/5 animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-50 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.02]">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest">Editar Perfil</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-0.5">Personalize seu Laboratório Pessoal</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {isLoading ? (
                    <div className="p-20 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto hidden-scrollbar">
                        {currentStatus === 'pending' && (
                            <div className="p-4 bg-brand-yellow/10 border border-brand-yellow/20 rounded-2xl flex items-center gap-3 animate-pulse">
                                <ShieldCheck className="w-5 h-5 text-brand-yellow" />
                                <p className="text-[10px] font-bold text-brand-yellow uppercase tracking-tight">
                                    Seu perfil tem alterações pendentes de aprovação pelo administrador.
                                </p>
                            </div>
                        )}

                        {/* Email */}
                        <div className="space-y-2 opacity-70">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                                <Mail className="w-3 h-3" /> E-mail (Bloqueado)
                            </label>
                            <div className="relative">
                                <input
                                    {...register('email')}
                                    readOnly
                                    className="w-full bg-gray-100 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3 text-sm outline-none cursor-not-allowed text-gray-400"
                                    placeholder="seu.email@usp.br"
                                />
                                <X className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            </div>
                        </div>

                        {/* Full Name */}
                        <div className="space-y-2 opacity-70">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                                <User className="w-3 h-3" /> Nome Completo (Bloqueado)
                            </label>
                            <div className="relative">
                                <input
                                    {...register('full_name')}
                                    readOnly
                                    className="w-full bg-gray-100 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3 text-sm outline-none cursor-not-allowed text-gray-400"
                                    placeholder="Seu nome"
                                />
                                <X className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            </div>
                        </div>

                        {/* Bio */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                                <FileText className="w-3 h-3" /> Bio
                            </label>
                            <textarea
                                {...register('bio')}
                                rows={3}
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3 text-sm focus:border-brand-blue/50 outline-none transition-all placeholder:text-gray-400 resize-none"
                                placeholder="Conte um pouco sobre você..."
                            />
                            {errors.bio && <p className="text-[10px] text-brand-red font-bold uppercase ml-1">{errors.bio.message}</p>}
                        </div>

                        {/* Nickname Support */}
                        <div className="p-4 bg-brand-blue/5 border border-brand-blue/10 rounded-2xl space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-brand-blue/10 rounded-lg flex items-center justify-center">
                                        <ShieldCheck className="w-4 h-4 text-brand-blue" />
                                    </div>
                                    <div>
                                        <span className="block text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">Usar apelido publicamente</span>
                                        <span className="text-[9px] text-gray-500 font-medium">Oculta seu nome real no seu perfil e posts</span>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" {...register('use_nickname')} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue"></div>
                                </label>
                            </div>

                            {useNickname && (
                                <div className="space-y-4 pt-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Seus Apelidos (Máx 2)</label>

                                    {pseudonyms.length > 0 && (
                                        <div className="grid grid-cols-2 gap-2">
                                            {pseudonyms.map(pseudo => (
                                                <button
                                                    key={pseudo.id}
                                                    type="button"
                                                    onClick={() => setValue('username', pseudo.name)}
                                                    className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${watch('username') === pseudo.name
                                                        ? 'bg-brand-blue text-white border-brand-blue shadow-lg shadow-brand-blue/20'
                                                        : 'bg-white dark:bg-white/5 text-gray-500 border-gray-100 dark:border-white/5 hover:border-brand-blue/30'}`}
                                                >
                                                    {pseudo.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {pseudonyms.length < 2 && (
                                        <div className="flex gap-2">
                                            <input
                                                {...register('new_nickname')}
                                                placeholder="Novo apelido..."
                                                className="flex-1 bg-white dark:bg-black/40 border border-gray-100 dark:border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-brand-blue/50 transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleCreateNickname}
                                                disabled={isCreatingNickname || !watch('new_nickname')}
                                                className="px-4 py-2 bg-brand-blue text-white rounded-xl text-[10px] font-black uppercase hover:bg-brand-blue/80 disabled:opacity-50 transition-all flex items-center gap-2"
                                            >
                                                {isCreatingNickname ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Criar'}
                                            </button>
                                        </div>
                                    )}

                                    {pseudonyms.length >= 2 && (
                                        <p className="text-[9px] text-brand-yellow font-bold uppercase text-center mt-2 italic">
                                            Limite de apelidos atingido
                                        </p>
                                    )}

                                    <input type="hidden" {...register('username')} />
                                </div>
                            )}
                        </div>

                        {/* Bixo Adoption Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-brand-blue flex items-center gap-2">
                                    <User className="w-3 h-3" /> Adoção e Mentoria
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {/* Seeking Mentor (Bixo) */}
                                <div className={`p-4 bg-gray-50 dark:bg-white/[0.02] border rounded-2xl flex items-center justify-between group transition-all ${seekingMentor ? 'border-brand-blue' : 'border-gray-100 dark:border-white/5 hover:border-brand-blue/30'}`}>
                                    <div className="flex flex-col gap-0.5">
                                        <span className={`text-xs font-black uppercase tracking-tight ${seekingMentor ? 'text-brand-blue' : 'text-gray-900 dark:text-white'}`}>Sou Bixo e quero ser adotado</span>
                                        <span className="text-[9px] text-gray-500 font-medium">Sinaliza para veteranos que você busca um mentor</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            {...register('seeking_mentor')}
                                            checked={seekingMentor}
                                            onChange={(e) => {
                                                const isChecked = e.target.checked;
                                                setValue('seeking_mentor', isChecked, { shouldValidate: true, shouldDirty: true });
                                                if (isChecked) {
                                                    setValue('available_to_mentor', false, { shouldValidate: true, shouldDirty: true });
                                                }
                                            }}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue"></div>
                                    </label>
                                </div>

                                {/* Available to Mentor (Veterano) */}
                                {(() => {
                                    const currentYear = new Date().getFullYear();
                                    const formEntranceYear = watch('entrance_year');
                                    const parsedYear = formEntranceYear ? parseInt(formEntranceYear, 10) : null;
                                    const isEligible = parsedYear !== null && (currentYear - parsedYear >= 2);

                                    return (
                                        <div className={`p-4 bg-gray-50 dark:bg-white/[0.02] border rounded-2xl flex items-center justify-between group transition-all ${!isEligible ? 'opacity-50 grayscale cursor-not-allowed border-gray-100 dark:border-white/5' : availableToMentor ? 'border-brand-blue' : 'border-gray-100 dark:border-white/5 hover:border-brand-blue/30'}`}>
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs font-black uppercase tracking-tight ${availableToMentor ? 'text-brand-blue' : 'text-gray-900 dark:text-white'}`}>Quero adotar um bixo</span>
                                                    {!isEligible && (
                                                        <span className="text-[8px] font-black bg-brand-yellow/10 text-brand-yellow px-2 py-0.5 rounded uppercase">2+ Anos USP</span>
                                                    )}
                                                </div>
                                                <span className="text-[9px] text-gray-500 font-medium">Habilita seu perfil como mentor/veterano</span>
                                            </div>
                                            <label className={`relative inline-flex items-center ${isEligible ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                                                <input
                                                    type="checkbox"
                                                    disabled={!isEligible}
                                                    className="sr-only peer"
                                                    {...register('available_to_mentor')}
                                                    checked={availableToMentor}
                                                    onChange={(e) => {
                                                        const isChecked = e.target.checked;
                                                        setValue('available_to_mentor', isChecked, { shouldValidate: true, shouldDirty: true });
                                                        if (isChecked) {
                                                            setValue('seeking_mentor', false, { shouldValidate: true, shouldDirty: true });
                                                        }
                                                    }}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue"></div>
                                            </label>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Other Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                                    <Building2 className="w-3 h-3" /> Instituto
                                </label>
                                <input
                                    {...register('institute')}
                                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3 text-sm focus:border-brand-blue/50 outline-none transition-all"
                                    placeholder="Ex: IFUSP"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                                    <Globe className="w-3 h-3" /> Curso
                                </label>
                                <input
                                    {...register('course')}
                                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3 text-sm focus:border-brand-blue/50 outline-none transition-all"
                                    placeholder="Ex: Bacharelado em Física"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                                    <Phone className="w-3 h-3" /> WhatsApp
                                </label>
                                <input
                                    {...register('whatsapp')}
                                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3 text-sm focus:border-brand-blue/50 outline-none transition-all"
                                    placeholder="(11) 98765-4321"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                                    <Star className="w-3 h-3" /> Hobbies e Artes
                                </label>
                                <input
                                    {...register('artistic_interests_str')}
                                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3 text-sm focus:border-brand-blue/50 outline-none transition-all"
                                    placeholder="Ex: Desenho, Música, RPG"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                                    <Globe className="w-3 h-3" /> Ano de Ingresso
                                </label>
                                <input
                                    type="number"
                                    {...register('entrance_year')}
                                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3 text-sm focus:border-brand-blue/50 outline-none transition-all"
                                    placeholder="Ex: 2022"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                                    <Link className="w-3 h-3" /> Currículo Lattes
                                </label>
                                <input
                                    {...register('lattes_url')}
                                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3 text-sm focus:border-brand-blue/50 outline-none transition-all"
                                    placeholder="https://lattes.cnpq.br/..."
                                />
                                {errors.lattes_url && <p className="text-[10px] text-brand-red font-bold ml-1 uppercase">{errors.lattes_url.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-3 p-4 bg-brand-blue/5 border border-brand-blue/10 rounded-2xl">
                            <div className="flex items-center gap-2">
                                <FileUp className="w-4 h-4 text-brand-blue" />
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-gray-100">
                                    Comprovante USP (Carteirinha ou Atestado)
                                </label>
                            </div>
                            <p className="text-[10px] text-gray-500 font-medium">
                                Você pode baixar atestado de matrícula ou de aluno na aba "Emissão de Documentos" do Jupiter Web para provar a veracidade dos dados informados acima.
                            </p>
                            <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                                className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:bg-brand-blue file:text-white hover:file:bg-brand-blue/90"
                            />
                            {profileData?.usp_proof_url && !proofFile && (
                                <p className="text-[10px] text-brand-green font-bold uppercase mt-1">✓ Comprovante já enviado anteriormente</p>
                            )}
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-white/[0.02] rounded-2xl border border-gray-100 dark:border-white/5">
                            <p className="text-[9px] text-gray-400 font-bold uppercase text-center italic">
                                Perfil Público por padrão para todos os membros
                            </p>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4 flex gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-4 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-gray-300 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="flex-[2] px-6 py-4 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-blue/20 flex items-center justify-center gap-2"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
