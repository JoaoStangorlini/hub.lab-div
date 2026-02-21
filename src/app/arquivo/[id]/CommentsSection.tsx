'use client';

import { useState } from 'react';
import { addComment } from '@/app/actions/comments';

export interface Comment {
    id: string;
    author_name: string;
    content: string;
    created_at: string;
}

export function CommentsSection({ submissionId, initialComments }: { submissionId: string, initialComments: Comment[] }) {
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [name, setName] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await addComment(submissionId, name, content);

            // Optimistic Update
            const newComment: Comment = {
                id: crypto.randomUUID(),
                author_name: name.trim(),
                content: content.trim(),
                created_at: new Date().toISOString()
            };

            setComments([newComment, ...comments]);
            setName('');
            setContent('');
        } catch (err: any) {
            setError(err.message || 'Erro ao publicar comentário.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mt-16 pt-12 border-t border-gray-200 dark:border-gray-800">
            <h3 className="text-2xl font-bold font-display text-gray-900 dark:text-white mb-8 flex items-center gap-2">
                <span className="material-symbols-outlined text-brand-blue">forum</span>
                Comentários Acadêmicos
            </h3>

            <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-card-dark/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 mb-10">
                {error && <div className="mb-4 text-sm text-red-500 font-bold">{error}</div>}
                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Seu Nome</label>
                        <input
                            id="name"
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-white dark:bg-form-dark border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-blue outline-none"
                            placeholder="Nome Completo ou Instituição"
                        />
                    </div>
                    <div>
                        <label htmlFor="content" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Comentário</label>
                        <textarea
                            id="content"
                            required
                            rows={3}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full bg-white dark:bg-form-dark border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-blue outline-none resize-none"
                            placeholder="Deixe uma reflexão, dúvida ou contribuição sobre esta publicação..."
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2.5 bg-brand-blue hover:bg-brand-darkBlue text-white font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Publicando...</>
                        ) : (
                            <><span className="material-symbols-outlined text-[18px]">send</span> Publicar Comentário</>
                        )}
                    </button>
                </div>
            </form>

            <div className="space-y-6">
                {comments.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-6">Seja o primeiro a deixar um comentário nesta publicação.</p>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="bg-white dark:bg-card-dark rounded-xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                    {comment.author_name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">{comment.author_name}</h4>
                                    <span className="text-xs text-gray-400">
                                        {new Date(comment.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 text-sm whitespace-pre-wrap">{comment.content}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
