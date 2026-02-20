'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function SubmitPage() {
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [authors, setAuthors] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Laboratórios');
    const [email, setEmail] = useState('');
    const [whatsapp, setWhatsapp] = useState('');

    const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
    const [videoUrl, setVideoUrl] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            if (files.length > 10) {
                setErrorMsg('Limite máximo de 10 fotos por submissão.');
                setSelectedFiles(files.slice(0, 10));
            } else {
                setErrorMsg('');
                setSelectedFiles(files);
            }
        }
    };

    const parseYoutubeUrl = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const uploadToCloudinary = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ifusp_uploads');

        // Applying f_auto and q_auto locally, although usually Cloudinary presets handle this, 
        // we must guarantee the return URL has it if explicitly requested in requirements.
        // For now we trust the unsigned unpload config, or append to the returned URL.

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        if (!cloudName) throw new Error("Cloudinary cloud name missing");

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData
        });

        if (!res.ok) {
            throw new Error('Falha no upload de imagem');
        }

        const data = await res.json();

        // Inject f_auto,q_auto into the generated Cloudinary URL transformation path
        // Format is usually: https://res.cloudinary.com/id/image/upload/v1234/file.jpg
        const urlParts = data.secure_url.split('/upload/');
        if (urlParts.length === 2) {
            return `${urlParts[0]}/upload/f_auto,q_auto/${urlParts[1]}`;
        }
        return data.secure_url;
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setErrorMsg('');

        try {
            if (!title || !authors) {
                throw new Error("Preencha todos os campos obrigatórios (*)");
            }
            if (!email && !whatsapp) {
                throw new Error("Preencha pelo menos um contato (E-mail ou WhatsApp)");
            }

            let finalMediaUrl: string[] = [];

            if (mediaType === 'image') {
                if (selectedFiles.length === 0) throw new Error("Selecione pelo menos uma imagem para upload");

                // Upload all selected files in parallel
                finalMediaUrl = await Promise.all(
                    selectedFiles.map(file => uploadToCloudinary(file))
                );
            } else {
                if (!videoUrl) throw new Error("Insira o link do vídeo");
                const videoId = parseYoutubeUrl(videoUrl);
                if (!videoId) throw new Error("Link do YouTube inválido");
                finalMediaUrl = [`https://www.youtube.com/embed/${videoId}`];
            }

            const { error } = await supabase.from('submissions').insert([{
                title,
                authors,
                description,
                category,
                email,
                whatsapp,
                media_type: mediaType,
                media_url: finalMediaUrl,
                status: 'pendente'
            }]);

            if (error) throw error;

            alert('Submissão enviada com sucesso! Em breve passará por moderação.');
            router.push('/');

        } catch (err: any) {
            console.error(err);
            setErrorMsg(err.message || 'Ocorreu um erro na submissão');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display text-slate-900 dark:text-slate-100">
            <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-4 lg:px-10">
                <div className="flex items-center gap-4 cursor-pointer" onClick={() => router.push('/')}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20 transition-colors">
                        <span className="material-symbols-outlined text-2xl">science</span>
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Arquivo Lab-Div</h2>
                </div>
                <div className="hidden md:flex flex-1 justify-end items-center gap-8">
                    <nav className="flex items-center gap-6">
                        <button onClick={() => router.push('/')} className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-primary transition-colors">Voltar</button>
                    </nav>
                </div>
            </header>

            <main className="flex-grow flex justify-center py-12 px-4 md:px-6">
                <div className="w-full max-w-3xl flex flex-col gap-8">
                    <div className="text-center space-y-3">
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            Envie sua Contribuição Científica
                        </h1>
                        <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                            Preencha o formulário abaixo para submeter seu trabalho para divulgação nos canais oficiais do Instituto de Física da USP.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 md:p-10 transition-colors">
                        {errorMsg && (
                            <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-600 text-sm border border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 font-medium">
                                {errorMsg}
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="title">
                                    <span className="text-red-500 mr-1">*</span>Título do Trabalho
                                </label>
                                <div className="relative">
                                    <input
                                        id="title"
                                        type="text"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        className="block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-primary sm:text-base py-3 px-4 transition-all shadow-sm"
                                        placeholder="Ex: Avanços na Computação Quântica"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="authors">
                                    <span className="text-red-500 mr-1">*</span>Nome dos Autores
                                </label>
                                <textarea
                                    id="authors"
                                    rows={2}
                                    value={authors}
                                    onChange={e => setAuthors(e.target.value)}
                                    className="block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-primary sm:text-base py-3 px-4 transition-all shadow-sm resize-none"
                                    placeholder="Liste os autores separados por vírgula (Ex: Silva, J.; Santos, A.)"
                                ></textarea>
                            </div>

                            <div className="space-y-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 p-4 border border-slate-200 dark:border-slate-700">
                                <div className="flex flex-col gap-1 mb-2">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                        <span className="text-red-500 mr-1">*</span>Contato do Submissor
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Preencha pelo menos um (E-mail ou WhatsApp).</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300" htmlFor="email">
                                            E-mail
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className="block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-primary sm:text-sm py-2 px-3 transition-all"
                                            placeholder="seu@email.usp.br"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300" htmlFor="whatsapp">
                                            WhatsApp
                                        </label>
                                        <input
                                            id="whatsapp"
                                            type="tel"
                                            value={whatsapp}
                                            onChange={e => setWhatsapp(e.target.value)}
                                            className="block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-primary sm:text-sm py-2 px-3 transition-all"
                                            placeholder="(11) 90000-0000"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="category">
                                    <span className="text-red-500 mr-1">*</span>Categoria
                                </label>
                                <select
                                    id="category"
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    className="block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:border-primary focus:ring-primary sm:text-base py-3 px-4 transition-all shadow-sm"
                                >
                                    <option value="Laboratórios">Laboratórios</option>
                                    <option value="Pesquisadores">Pesquisadores</option>
                                    <option value="Eventos">Eventos</option>
                                    <option value="Convivência">Convivência</option>
                                    <option value="Outros">Outros</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="description">
                                    Descrição / Contexto
                                </label>
                                <textarea
                                    id="description"
                                    rows={5}
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-primary sm:text-base py-3 px-4 transition-all shadow-sm resize-none"
                                    placeholder="Insira um resumo ou abstract do trabalho, explicando a relevância científica..."
                                ></textarea>
                            </div>
                        </div>

                        <hr className="my-8 border-slate-100 dark:border-slate-700" />

                        <div className="space-y-6">
                            <div className="flex flex-col gap-1">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    <span className="text-red-500 mr-1">*</span>Mídia Visual
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Adicione uma imagem representativa ou um link para um vídeo explicativo.</p>
                            </div>

                            <div className="flex p-1 space-x-1 bg-slate-100 dark:bg-slate-900/50 rounded-xl" role="tablist">
                                <button
                                    onClick={() => setMediaType('image')}
                                    aria-selected={mediaType === 'image'}
                                    className={`w-full py-2.5 text-sm font-medium leading-5 rounded-lg ring-offset-2 focus:outline-none focus:ring-2 transition-all ${mediaType === 'image' ? 'text-primary bg-white dark:bg-slate-700 dark:text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined text-[20px]">image</span>
                                        Upload de Imagem
                                    </div>
                                </button>
                                <button
                                    onClick={() => setMediaType('video')}
                                    aria-selected={mediaType === 'video'}
                                    className={`w-full py-2.5 text-sm font-medium leading-5 rounded-lg ring-offset-2 focus:outline-none focus:ring-2 transition-all ${mediaType === 'video' ? 'text-primary bg-white dark:bg-slate-700 dark:text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined text-[20px]">movie</span>
                                        Link de Vídeo (YouTube)
                                    </div>
                                </button>
                            </div>

                            <div className="mt-4">
                                {mediaType === 'image' ? (
                                    <div className="flex justify-center rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 px-6 py-10 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                                        <div className="text-center">
                                            <span className="material-symbols-outlined text-5xl text-slate-400 group-hover:text-primary transition-colors mx-auto mb-4">cloud_upload</span>
                                            <div className="mt-2 flex text-sm leading-6 text-slate-600 dark:text-slate-400 justify-center">
                                                <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-transparent font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-blue-600">
                                                    <span>{selectedFiles.length > 0 ? `${selectedFiles.length} arquivo${selectedFiles.length > 1 ? 's' : ''} selecionado${selectedFiles.length > 1 ? 's' : ''}` : 'Clique para enviar'}</span>
                                                    <input
                                                        id="file-upload"
                                                        name="file-upload"
                                                        type="file"
                                                        accept="image/*"
                                                        multiple
                                                        className="sr-only"
                                                        onChange={handleFileChange}
                                                    />
                                                </label>
                                                {selectedFiles.length === 0 && <p className="pl-1">ou arraste e solte</p>}
                                            </div>
                                            <p className="text-xs leading-5 text-slate-500 mt-2">PNG, JPG, GIF até 10MB</p>
                                            <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 mt-1">Limite máximo de 10 fotos por submissão.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="youtube-link">
                                            URL do YouTube
                                        </label>
                                        <input
                                            id="youtube-link"
                                            type="url"
                                            value={videoUrl}
                                            onChange={e => setVideoUrl(e.target.value)}
                                            className="block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-primary sm:text-base py-3 px-4 transition-all shadow-sm"
                                            placeholder="https://www.youtube.com/watch?v=..."
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-10 pt-4 flex items-center justify-end border-t border-slate-100 dark:border-slate-700">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="group relative flex w-full md:w-auto justify-center items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-blue-600/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Enviando...' : 'Submeter para Análise'}
                                {!isLoading && <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">send</span>}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
