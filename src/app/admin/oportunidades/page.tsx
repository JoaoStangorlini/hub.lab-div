'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Oportunidade {
    id: string;
    titulo: string;
    descricao: string;
    data: string;
    local: string;
    link: string | null;
    tipo: string;
    created_at: string;
}

const tipoOptions = [
    { value: 'palestra', label: 'Palestra', icon: 'campaign' },
    { value: 'vaga', label: 'Vaga', icon: 'work' },
    { value: 'evento', label: 'Evento', icon: 'event' },
];

const emptyForm: Omit<Oportunidade, 'id' | 'created_at'> = {
    titulo: '',
    descricao: '',
    data: '',
    local: '',
    link: '',
    tipo: 'evento',
};

export default function AdminOportunidadesPage() {
    const [oportunidades, setOportunidades] = useState<Oportunidade[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [isSaving, setIsSaving] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('oportunidades')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching oportunidades:', error);
        } else {
            setOportunidades(data || []);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleNew = () => {
        setEditingId(null);
        setForm(emptyForm);
        setShowModal(true);
    };

    const handleEdit = (item: Oportunidade) => {
        setEditingId(item.id);
        setForm({
            titulo: item.titulo,
            descricao: item.descricao,
            data: item.data,
            local: item.local,
            link: item.link || '',
            tipo: item.tipo,
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja realmente excluir esta oportunidade?')) return;
        const { error } = await supabase.from('oportunidades').delete().eq('id', id);
        if (error) {
            alert('Erro ao excluir: ' + error.message);
        } else {
            fetchData();
        }
    };

    const handleSave = async () => {
        if (!form.titulo.trim() || !form.descricao.trim() || !form.data.trim() || !form.local.trim()) {
            alert('Preencha todos os campos obrigatórios.');
            return;
        }
        setIsSaving(true);

        const payload = {
            titulo: form.titulo.trim(),
            descricao: form.descricao.trim(),
            data: form.data.trim(),
            local: form.local.trim(),
            link: form.link?.trim() || null,
            tipo: form.tipo,
        };

        if (editingId) {
            const { error } = await supabase.from('oportunidades').update(payload).eq('id', editingId);
            if (error) alert('Erro ao atualizar: ' + error.message);
        } else {
            const { error } = await supabase.from('oportunidades').insert([payload]);
            if (error) alert('Erro ao criar: ' + error.message);
        }

        setIsSaving(false);
        setShowModal(false);
        fetchData();
    };

    const getTipoColor = (tipo: string) => {
        switch (tipo) {
            case 'palestra': return 'bg-brand-blue/10 text-brand-blue border-brand-blue/20';
            case 'vaga': return 'bg-brand-yellow/10 text-brand-yellow border-brand-yellow/20';
            case 'evento': return 'bg-brand-red/10 text-brand-red border-brand-red/20';
            default: return 'bg-gray-100 text-gray-500 border-gray-200';
        }
    };

    const getTipoIcon = (tipo: string) => {
        return tipoOptions.find(t => t.value === tipo)?.icon || 'event';
    };

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    <span className="material-symbols-outlined text-[18px]">dashboard</span>
                    <span>Dashboard</span>
                    <span className="text-gray-300 dark:text-gray-600">/</span>
                    <span className="text-brand-yellow">Oportunidades</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight">Mural de Oportunidades</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie palestras, vagas e eventos que aparecem na página pública.</p>
                    </div>
                    <button
                        onClick={handleNew}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-blue hover:bg-brand-darkBlue text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Nova Oportunidade
                    </button>
                </div>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400 bg-white dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800">
                    <span className="material-symbols-outlined text-4xl animate-spin text-brand-yellow mb-4">progress_activity</span>
                    <p className="font-medium animate-pulse">Carregando oportunidades...</p>
                </div>
            ) : oportunidades.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400 bg-white dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800">
                    <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-3">event_busy</span>
                    <p className="font-medium mb-4">Nenhuma oportunidade cadastrada.</p>
                    <button
                        onClick={handleNew}
                        className="px-4 py-2 bg-brand-blue text-white rounded-lg font-bold text-sm hover:bg-brand-darkBlue transition-colors"
                    >
                        Adicionar primeira oportunidade
                    </button>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {oportunidades.map(item => (
                        <div key={item.id} className="bg-white dark:bg-card-dark rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-5 space-y-3">
                                <div className="flex items-center justify-between gap-2">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getTipoColor(item.tipo)}`}>
                                        <span className="material-symbols-outlined text-[14px]">{getTipoIcon(item.tipo)}</span>
                                        {item.tipo}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="p-1.5 text-gray-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-1.5 text-gray-400 hover:text-brand-red hover:bg-brand-red/10 rounded-lg transition-colors"
                                            title="Excluir"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">delete</span>
                                        </button>
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{item.titulo}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{item.descricao}</p>
                                <div className="flex flex-col gap-1 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                        {item.data}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                                        {item.local}
                                    </span>
                                    {item.link && (
                                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-brand-blue hover:underline">
                                            <span className="material-symbols-outlined text-[14px]">link</span>
                                            Link externo
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-form-dark rounded-2xl w-full max-w-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-form-dark/50">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-brand-yellow">event</span>
                                {editingId ? 'Editar Oportunidade' : 'Nova Oportunidade'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Título *</label>
                                <input
                                    type="text"
                                    value={form.titulo}
                                    onChange={e => setForm({ ...form, titulo: e.target.value })}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-form-dark text-gray-900 dark:text-white py-2.5 px-3 focus:ring-brand-blue focus:border-brand-blue"
                                    placeholder="Ex: Palestra sobre Física Quântica"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Tipo *</label>
                                <select
                                    value={form.tipo}
                                    onChange={e => setForm({ ...form, tipo: e.target.value })}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-form-dark text-gray-900 dark:text-white py-2.5 px-3 focus:ring-brand-blue focus:border-brand-blue"
                                >
                                    {tipoOptions.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Data *</label>
                                    <input
                                        type="text"
                                        value={form.data}
                                        onChange={e => setForm({ ...form, data: e.target.value })}
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-form-dark text-gray-900 dark:text-white py-2.5 px-3 focus:ring-brand-blue focus:border-brand-blue"
                                        placeholder="Ex: 15/03, 14h"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Local *</label>
                                    <input
                                        type="text"
                                        value={form.local}
                                        onChange={e => setForm({ ...form, local: e.target.value })}
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-form-dark text-gray-900 dark:text-white py-2.5 px-3 focus:ring-brand-blue focus:border-brand-blue"
                                        placeholder="Ex: Auditório do IF"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Descrição *</label>
                                <textarea
                                    rows={3}
                                    value={form.descricao}
                                    onChange={e => setForm({ ...form, descricao: e.target.value })}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-form-dark text-gray-900 dark:text-white py-2.5 px-3 focus:ring-brand-blue focus:border-brand-blue resize-none"
                                    placeholder="Descreva a oportunidade..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Link (opcional)</label>
                                <input
                                    type="url"
                                    value={form.link || ''}
                                    onChange={e => setForm({ ...form, link: e.target.value })}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-form-dark text-gray-900 dark:text-white py-2.5 px-3 focus:ring-brand-blue focus:border-brand-blue"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 dark:bg-form-dark/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 rounded-b-2xl">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-5 py-2 text-sm font-bold text-white bg-brand-blue hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {isSaving ? 'Salvando...' : editingId ? 'Atualizar' : 'Criar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
