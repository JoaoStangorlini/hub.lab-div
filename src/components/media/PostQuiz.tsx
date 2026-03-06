'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { answerSubmissionQuiz, checkQuizStatus } from '@/app/actions/quiz';

interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correct_option: number;
}

interface PostQuizProps {
    submissionId: string;
    quiz: QuizQuestion[];
    authorId?: string;
    currentUserId?: string | null;
}

export function PostQuiz({ submissionId, quiz, authorId, currentUserId }: PostQuizProps) {
    const [answers, setAnswers] = useState<number[]>(new Array(quiz.length).fill(-1));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [wasAnswered, setWasAnswered] = useState(false);
    const [result, setResult] = useState<{ correctCount: number; totalCount: number; xpAwarded: number } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isAuthor = currentUserId === authorId;

    useEffect(() => {
        async function loadStatus() {
            if (!currentUserId) {
                setIsLoading(false);
                return;
            }
            const { answered, response } = await checkQuizStatus(submissionId);
            if (answered && response) {
                setWasAnswered(true);
                setResult({
                    correctCount: response.score,
                    totalCount: quiz.length,
                    xpAwarded: response.xp_awarded
                });
            }
            setIsLoading(false);
        }
        loadStatus();
    }, [submissionId, currentUserId, quiz.length]);

    const handleAnswer = (qIndex: number, oIndex: number) => {
        if (wasAnswered) return;
        const newAnswers = [...answers];
        newAnswers[qIndex] = oIndex;
        setAnswers(newAnswers);
    };

    const handleSubmit = async () => {
        if (answers.includes(-1)) {
            toast.error('Responda todas as perguntas antes de enviar.');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await answerSubmissionQuiz(submissionId, answers);
            if (res.success) {
                setWasAnswered(true);
                setResult({
                    correctCount: res.correctCount!,
                    totalCount: res.totalCount!,
                    xpAwarded: res.xpAwarded!
                });
                toast.success(isAuthor ? `Modo Autor: Você acertou ${res.correctCount} de ${res.totalCount}. (XP não creditado)` : `Quiz concluído! Você ganhou ${res.xpAwarded} XP!`);
            } else {
                toast.error(res.error || 'Erro ao enviar respostas.');
            }
        } catch (error) {
            toast.error('Erro ao processar sua resposta.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full h-48 bg-gray-50 dark:bg-white/5 animate-pulse rounded-[40px] flex items-center justify-center">
                <span className="material-symbols-outlined animate-spin text-brand-blue">progress_activity</span>
            </div>
        );
    }

    if (!quiz || quiz.length === 0) return null;

    return (
        <section className="bg-white dark:bg-card-dark rounded-[40px] p-6 md:p-10 border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-brand-blue/10 transition-colors" />

            <div className="relative z-10 space-y-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-brand-blue">quiz</span>
                                Teste seu Conhecimento
                            </h2>
                            {isAuthor && (
                                <span className="px-2 py-0.5 bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/20 rounded text-[9px] font-black uppercase tracking-widest">
                                    Modo Autor
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 font-medium italic">
                            {isAuthor
                                ? "Este é o seu quiz! Leitores ganham XP ao responder corretamente."
                                : "Responda corretamente para ganhar até 20 XP de radiação!"}
                        </p>
                    </div>

                    {wasAnswered && result && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-brand-green/10 border border-brand-green/30 px-4 py-2 rounded-2xl flex items-center gap-3"
                        >
                            <div className="size-8 rounded-full bg-brand-green flex items-center justify-center text-white">
                                <span className="material-symbols-outlined text-sm">check_circle</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-black text-brand-green tracking-widest">Resultado</span>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                    {result.correctCount}/{result.totalCount} Acertos • +{result.xpAwarded} XP
                                </span>
                            </div>
                        </motion.div>
                    )}
                </div>

                <div className="space-y-10">
                    {quiz.map((q, qIndex) => (
                        <div key={q.id} className="space-y-4">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white pl-4 border-l-4 border-brand-blue">
                                {qIndex + 1}. {q.question}
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {q.options.map((option, oIndex) => {
                                    const isSelected = answers[qIndex] === oIndex;
                                    const isCorrect = q.correct_option === oIndex;
                                    const showResult = wasAnswered;

                                    let className = "relative p-4 rounded-2xl border-2 transition-all text-left flex items-start gap-3 text-sm font-medium ";

                                    if (showResult) {
                                        if (isCorrect) {
                                            className += "bg-brand-green/10 border-brand-green text-brand-green shadow-lg shadow-brand-green/10";
                                        } else if (isSelected && !isCorrect) {
                                            className += "bg-brand-red/10 border-brand-red text-brand-red";
                                        } else {
                                            className += "bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 opacity-50";
                                        }
                                    } else {
                                        className += isSelected
                                            ? "bg-brand-blue/5 border-brand-blue text-brand-blue shadow-lg shadow-brand-blue/10"
                                            : "bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 hover:border-brand-blue/30 text-gray-700 dark:text-gray-300";
                                    }

                                    return (
                                        <button
                                            key={oIndex}
                                            disabled={showResult}
                                            onClick={() => handleAnswer(qIndex, oIndex)}
                                            className={className}
                                        >
                                            <div className={`mt-0.5 size-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${isSelected || (showResult && isCorrect)
                                                ? "border-current scale-110"
                                                : "border-gray-300 dark:border-gray-600"
                                                }`}>
                                                {(isSelected || (showResult && isCorrect)) && (
                                                    <div className="size-2 rounded-full bg-current" />
                                                )}
                                            </div>
                                            <span>{option}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {!wasAnswered && (
                    <div className="pt-4 flex justify-center">
                        <button
                            disabled={isSubmitting || !currentUserId}
                            onClick={handleSubmit}
                            className={`${isAuthor ? 'bg-brand-yellow text-black' : 'bg-brand-blue text-white'} px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:-translate-y-1 transition-all shadow-xl ${isAuthor ? 'shadow-brand-yellow/20' : 'shadow-brand-blue/20'} disabled:opacity-50 flex items-center gap-3`}
                        >
                            {isSubmitting ? 'Verificando...' : isAuthor ? 'Testar Respostas' : 'Enviar Respostas'}
                            {!isSubmitting && <span className="material-symbols-outlined text-lg">{isAuthor ? 'science' : 'rocket_launch'}</span>}
                        </button>
                    </div>
                )}

                {!currentUserId && !wasAnswered && (
                    <p className="text-center text-xs text-brand-red font-bold">
                        Faça login para responder ao quiz e ganhar XP!
                    </p>
                )}
            </div>
        </section>
    );
}
