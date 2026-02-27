'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
    LayoutDashboard, AlertTriangle, Clock, CheckCircle,
    XCircle, ExternalLink, User, Calendar, Trash2,
    MessageSquare, Eye, Loader2, Filter, ChevronDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface FeedbackReport {
    id: string;
    created_at: string;
    user_id: string | null;
    type: 'bug' | 'visual' | 'suggestion';
    description: string;
    metadata: any;
    screenshot_url: string | null;
    status: 'open' | 'resolved' | 'closed';
}

export default function AdminReportsPage() {
    const [reports, setReports] = useState<FeedbackReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'bug' | 'visual' | 'suggestion'>('all');
    const [selectedReport, setSelectedReport] = useState<FeedbackReport | null>(null);

    const fetchReports = useCallback(async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('feedback_reports')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            toast.error('Erro ao carregar relatórios');
            console.error(error);
        } else {
            setReports(data || []);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handleUpdateStatus = async (id: string, newStatus: 'open' | 'resolved' | 'closed') => {
        const { error } = await supabase
            .from('feedback_reports')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) {
            toast.error('Erro ao atualizar status');
        } else {
            setReports(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
            if (selectedReport?.id === id) setSelectedReport({ ...selectedReport, status: newStatus });
            toast.success('Status atualizado');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja excluir este relatório permanentemente?')) return;

        const { error } = await supabase
            .from('feedback_reports')
            .delete()
            .eq('id', id);

        if (error) {
            toast.error('Erro ao excluir');
        } else {
            setReports(prev => prev.filter(r => r.id !== id));
            setSelectedReport(null);
            toast.success('Relatório excluído');
        }
    };

    const filteredReports = reports.filter(r => filter === 'all' || r.type === filter);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'resolved':
                return <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><CheckCircle size={10} /> Resolvido</span>;
            case 'closed':
                return <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><XCircle size={10} /> Fechado</span>;
            default:
                return <span className="px-2 py-1 bg-brand-yellow/10 text-brand-yellow rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><Clock size={10} /> Aberto</span>;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'bug': return <div className="p-2 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-xl"><AlertTriangle size={18} /></div>;
            case 'visual': return <div className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-xl"><Eye size={18} /></div>;
            case 'suggestion': return <div className="p-2 bg-purple-100 dark:bg-purple-900/20 text-purple-600 rounded-xl"><MessageSquare size={18} /></div>;
            default: return <div className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-600 rounded-xl"><AlertTriangle size={18} /></div>;
        }
    };

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        <LayoutDashboard className="w-5 h-5" />
                        <span>Dashboard</span>
                        <span className="text-gray-300 dark:text-gray-600">/</span>
                        <span className="text-brand-red">Relatórios de Feedback</span>
                    </div>
                    <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight">Centro de Relatórios</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie bugs, sugestões e problemas técnicos reportados pelos usuários.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as any)}
                            className="bg-white dark:bg-card-dark border border-gray-100 dark:border-gray-800 rounded-xl pl-9 pr-8 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 outline-none focus:ring-2 focus:ring-brand-blue/20 appearance-none cursor-pointer"
                        >
                            <option value="all">Filtro: Todos</option>
                            <option value="bug">Erros Técnicos</option>
                            <option value="visual">Layout/Visual</option>
                            <option value="suggestion">Sugestões</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    </div>
                    <button onClick={fetchReports} className="p-2 bg-white dark:bg-card-dark border border-gray-100 dark:border-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-600 dark:text-gray-300 shadow-sm">
                        <Clock className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Content Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* List Section */}
                <div className="lg:col-span-2 space-y-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-card-dark rounded-[32px] border border-gray-100 dark:border-gray-800">
                            <Loader2 className="w-10 h-10 animate-spin text-brand-red mb-4" />
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Carregando Relatórios...</p>
                        </div>
                    ) : filteredReports.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-card-dark rounded-[32px] border border-gray-100 dark:border-gray-800">
                            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="text-gray-300 w-8 h-8" />
                            </div>
                            <h3 className="text-gray-900 dark:text-white font-bold">Tudo limpo!</h3>
                            <p className="text-gray-500 text-sm">Nenhum relatório {filter !== 'all' ? `de ${filter}` : ''} encontrado.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredReports.map((report) => (
                                <div
                                    key={report.id}
                                    onClick={() => setSelectedReport(report)}
                                    className={`group bg-white dark:bg-card-dark p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-lg ${selectedReport?.id === report.id ? 'border-brand-red ring-4 ring-brand-red/5' : 'border-gray-100 dark:border-gray-800'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        {getTypeIcon(report.type)}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <h3 className="font-bold text-gray-900 dark:text-white truncate text-sm">
                                                    {report.description.substring(0, 60)}...
                                                </h3>
                                                {getStatusBadge(report.status)}
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(report.created_at).toLocaleDateString()}</span>
                                                <span className="flex items-center gap-1"><User size={12} /> {report.user_id ? 'Autenticado' : 'Visitante'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Detail Panel */}
                <div className="sticky top-24">
                    <AnimatePresence mode="wait">
                        {selectedReport ? (
                            <div className="bg-white dark:bg-card-dark rounded-[32px] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-2xl">
                                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                    <h3 className="font-bold text-gray-900 dark:text-white capitalize">Detalhes do Relatório</h3>
                                    <button onClick={() => setSelectedReport(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                        <XCircle size={18} />
                                    </button>
                                </div>

                                <div className="p-6 space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-brand-red">Descrição</label>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 italic">
                                            "{selectedReport.description}"
                                        </p>
                                    </div>

                                    {selectedReport.screenshot_url && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-brand-red">Evidência Visual</label>
                                            <a
                                                href={selectedReport.screenshot_url}
                                                target="_blank"
                                                className="block relative aspect-video rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 group hover:ring-4 hover:ring-brand-blue/20 transition-all"
                                            >
                                                <img src={selectedReport.screenshot_url} alt="Screenshot" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <span className="px-3 py-1.5 bg-white text-gray-900 text-[10px] font-bold rounded-lg flex items-center gap-1">
                                                        <ExternalLink size={12} /> Abrir em nova aba
                                                    </span>
                                                </div>
                                            </a>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-brand-red">Log Técnico</label>
                                        <div className="bg-gray-900 rounded-xl p-4 font-mono text-[10px] text-green-400 overflow-x-auto">
                                            <pre>{JSON.stringify(selectedReport.metadata, null, 2)}</pre>
                                        </div>
                                    </div>

                                    {/* Action Status */}
                                    <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => handleUpdateStatus(selectedReport.id, 'resolved')}
                                                disabled={selectedReport.status === 'resolved'}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[10px] font-bold transition-all ${selectedReport.status === 'resolved' ? 'bg-green-100 text-green-600 opacity-50' : 'bg-green-500 text-white hover:bg-green-600'}`}
                                            >
                                                <CheckCircle size={14} /> Marcar Resolvido
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(selectedReport.id, 'closed')}
                                                disabled={selectedReport.status === 'closed'}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[10px] font-bold transition-all ${selectedReport.status === 'closed' ? 'bg-gray-100 text-gray-600 opacity-50' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-800 dark:text-white'}`}
                                            >
                                                <XCircle size={14} /> Fechar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(selectedReport.id)}
                                                className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-12 text-center bg-gray-50/50 dark:bg-gray-800/30 rounded-[40px] border-2 border-dashed border-gray-200 dark:border-gray-700">
                                <span className="material-symbols-outlined text-4xl text-gray-300 mb-4 block">fact_check</span>
                                <p className="text-sm text-gray-400 font-medium">Selecione um relatório para visualizar os detalhes técnicos.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
