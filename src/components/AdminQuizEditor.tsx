'use client';

import React, { useState } from 'react';
import { X, Plus, Trash2, Save, CheckCircle, AlertCircle, GripVertical } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { saveSubmissionQuiz, deleteSubmissionQuiz } from '@/app/actions/quiz';

interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correct_option: number;
}

interface AdminQuizEditorProps {
    submissionId: string;
    submissionTitle: string;
    initialQuiz?: QuizQuestion[] | null;
    onClose: () => void;
    onSaved: (quiz: QuizQuestion[] | null) => void;
}

function generateId() {
    return `q_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function createEmptyQuestion(): QuizQuestion {
    return {
        id: generateId(),
        question: '',
        options: ['', '', '', ''],
        correct_option: 0,
    };
}

export function AdminQuizEditor({ submissionId, submissionTitle, initialQuiz, onClose, onSaved }: AdminQuizEditorProps) {
    const [questions, setQuestions] = useState<QuizQuestion[]>(
        initialQuiz && initialQuiz.length > 0
            ? initialQuiz.map(q => ({ ...q, id: q.id || generateId() }))
            : [createEmptyQuestion()]
    );
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
        setQuestions(prev => prev.map((q, i) => i === index ? { ...q, [field]: value } : q));
    };

    const updateOption = (qIndex: number, oIndex: number, value: string) => {
        setQuestions(prev => prev.map((q, i) => {
            if (i !== qIndex) return q;
            const newOptions = [...q.options];
            newOptions[oIndex] = value;
            return { ...q, options: newOptions };
        }));
    };

    const addQuestion = () => {
        setQuestions(prev => [...prev, createEmptyQuestion()]);
    };

    const removeQuestion = (index: number) => {
        if (questions.length <= 1) {
            toast.error('O quiz precisa de pelo menos 1 pergunta.');
            return;
        }
        setQuestions(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        // Client-side validation
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.question.trim()) {
                toast.error(`Pergunta ${i + 1} está vazia.`);
                return;
            }
            const emptyOpts = q.options.filter(o => !o.trim());
            if (emptyOpts.length > 0) {
                toast.error(`Pergunta ${i + 1}: todas as 4 opções devem ser preenchidas.`);
                return;
            }
        }

        setIsSaving(true);
        try {
            const result = await saveSubmissionQuiz(submissionId, questions);
            if (result.success) {
                toast.success('Quiz salvo com sucesso!');
                onSaved(questions);
                onClose();
            } else {
                toast.error(result.error || 'Erro ao salvar quiz.');
            }
        } catch (err) {
            console.error('Save quiz error:', err);
            toast.error('Erro de conexão ao salvar quiz.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Tem certeza que deseja remover o quiz? Esta ação não pode ser desfeita.')) return;

        setIsDeleting(true);
        try {
            const result = await deleteSubmissionQuiz(submissionId);
            if (result.success) {
                toast.success('Quiz removido.');
                onSaved(null);
                onClose();
            } else {
                toast.error(result.error || 'Erro ao remover quiz.');
            }
        } catch (err) {
            toast.error('Erro de conexão ao remover quiz.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white dark:bg-[#1A1A2E] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-800">

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 shrink-0">
                    <div>
                        <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-brand-blue">quiz</span>
                            Gerenciar Quiz
                        </h2>
                        <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mt-0.5 truncate max-w-[360px]">
                            {submissionTitle}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                        <X size={18} className="text-gray-400" />
                    </button>
                </div>

                {/* Questions List — Scrollable */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    {questions.map((q, qIdx) => (
                        <div key={q.id} className="p-4 bg-gray-50 dark:bg-[#121212] rounded-2xl border border-gray-100 dark:border-gray-800 space-y-3 relative group">
                            {/* Question Header */}
                            <div className="flex items-start gap-2">
                                <div className="flex items-center gap-1.5 shrink-0 pt-2">
                                    <GripVertical size={14} className="text-gray-300 dark:text-gray-700" />
                                    <span className="text-xs font-black text-brand-blue font-mono">Q{qIdx + 1}</span>
                                </div>
                                <input
                                    type="text"
                                    value={q.question}
                                    onChange={(e) => updateQuestion(qIdx, 'question', e.target.value)}
                                    placeholder="Digite a pergunta..."
                                    className="flex-1 bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all placeholder:text-gray-400"
                                />
                                <button
                                    onClick={() => removeQuestion(qIdx)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all shrink-0 opacity-0 group-hover:opacity-100"
                                    title="Remover pergunta"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            {/* Options */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8">
                                {q.options.map((opt, oIdx) => (
                                    <div
                                        key={oIdx}
                                        className={`flex items-center gap-2 p-0.5 rounded-xl border transition-all cursor-pointer ${q.correct_option === oIdx
                                            ? 'border-green-500/50 bg-green-500/5 shadow-[0_0_10px_rgba(34,197,94,0.1)]'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                            }`}
                                        onClick={() => updateQuestion(qIdx, 'correct_option', oIdx)}
                                    >
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-black transition-all ${q.correct_option === oIdx
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                                            }`}>
                                            {q.correct_option === oIdx ? <CheckCircle size={14} /> : String.fromCharCode(65 + oIdx)}
                                        </div>
                                        <input
                                            type="text"
                                            value={opt}
                                            onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            placeholder={`Opção ${String.fromCharCode(65 + oIdx)}`}
                                            className="flex-1 bg-transparent text-xs text-gray-700 dark:text-gray-300 outline-none py-1.5 placeholder:text-gray-400"
                                        />
                                    </div>
                                ))}
                            </div>
                            <p className="text-[9px] text-gray-400 font-mono pl-8 italic flex items-center gap-1">
                                <CheckCircle size={10} className="text-green-500" />
                                Clique na opção para marcá-la como correta
                            </p>
                        </div>
                    ))}

                    {/* Add Question Button */}
                    <button
                        onClick={addQuestion}
                        className="w-full py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-gray-400 hover:text-brand-blue hover:border-brand-blue/40 transition-all flex items-center justify-center gap-2 text-xs font-bold"
                    >
                        <Plus size={16} />
                        Adicionar Pergunta
                    </button>
                </div>

                {/* Footer Actions */}
                <div className="p-5 border-t border-gray-100 dark:border-gray-800 shrink-0 flex items-center gap-3">
                    {initialQuiz && initialQuiz.length > 0 && (
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting || isSaving}
                            className="px-4 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
                        >
                            <Trash2 size={14} />
                            {isDeleting ? 'Removendo...' : 'Remover Quiz'}
                        </button>
                    )}
                    <div className="flex-1" />
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-xs font-bold transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || isDeleting}
                        className="px-6 py-2.5 bg-brand-blue hover:bg-brand-blue/80 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2 shadow-[0_0_15px_rgba(0,163,255,0.3)]"
                    >
                        <Save size={14} />
                        {isSaving ? 'Salvando...' : 'Salvar Quiz'}
                    </button>
                </div>
            </div>
        </div>
    );
}
