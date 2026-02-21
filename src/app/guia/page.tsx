import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function GuiaPage() {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-sans text-gray-900 dark:text-gray-100 flex flex-col">
            <Header />

            <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full prose prose-lg dark:prose-invert prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight prose-a:text-brand-blue prose-img:rounded-xl">
                <div className="mb-12 border-b border-gray-200 dark:border-gray-800 pb-8">
                    <h1 className="text-4xl md:text-5xl text-gray-900 dark:text-white mb-4">
                        Guia de <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-yellow pr-2">Boas Práticas</span>
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 lead">
                        Como capturar e compartilhar a ciência que acontece no seu laboratório da melhor forma possível.
                    </p>
                </div>

                <div className="space-y-12">
                    {/* Seção de Fotografia */}
                    <section className="bg-white dark:bg-card-dark rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 dark:hidden rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none transition-transform group-hover:scale-150"></div>

                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <span className="material-symbols-outlined text-4xl text-brand-blue">photo_camera</span>
                            <h2 className="text-3xl m-0">Fotografia no Laboratório</h2>
                        </div>

                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-brand-green mt-1">check_circle</span>
                                <div>
                                    <strong>Iluminação é tudo:</strong> Se possível, fotografe equipamentos perto da janela com luz natural. Se usar luz artificial, evite o flash direto do celular para não criar reflexos em superfícies metálicas ou de vidro.
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-brand-green mt-1">check_circle</span>
                                <div>
                                    <strong>Foque no detalhe:</strong> Aproxime o celular (use a lente macro, se houver) para mostrar as texturas das placas de Petri, circuitos ou lasers.
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-brand-yellow mt-1">warning</span>
                                <div>
                                    <strong>Cuidado com o fundo:</strong> Tente remover copos de café, cadernos bagunçados ou informações sensíveis (senhas em post-its) do enquadramento antes de fotografar.
                                </div>
                            </li>
                        </ul>
                    </section>

                    {/* Seção de Vídeo */}
                    <section className="bg-white dark:bg-card-dark rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/5 dark:hidden rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none transition-transform group-hover:scale-150"></div>

                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <span className="material-symbols-outlined text-4xl text-brand-red">videocam</span>
                            <h2 className="text-3xl m-0">Gravação de VídeosCurtos</h2>
                        </div>

                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-brand-yellow mt-1">warning</span>
                                <div>
                                    <strong>Estabilize a imagem:</strong> Use um tripé de celular ou apoie os braços na mesa. Vídeos trêmulos atrapalham a visualização de experimentos delicados.
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-brand-green mt-1">check_circle</span>
                                <div>
                                    <strong>Formato vertical (9:16):</strong> Se a ideia for divulgar no Instagram Reels ou TikTok, grave sempre com o celular em pé. Para o YouTube clássico, use o formato horizontal.
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-brand-green mt-1">check_circle</span>
                                <div>
                                    <strong>Narração clara:</strong> Se for explicar algo em voz alta, encontre um momento em que as bombas de vácuo e exaustores do laboratório estejam desligados, ou aproxime bem o microfone.
                                </div>
                            </li>
                        </ul>
                    </section>

                    {/* Seção de Texto */}
                    <section className="bg-white dark:bg-card-dark rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 dark:hidden rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none transition-transform group-hover:scale-150"></div>

                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <span className="material-symbols-outlined text-4xl text-brand-blue">article</span>
                            <h2 className="text-3xl m-0">Textos e Divulgação Escrita</h2>
                        </div>

                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-brand-green mt-1">check_circle</span>
                                <div>
                                    <strong>Linguagem Acessível:</strong> Transforme termos técnicos complexos em analogias do cotidiano. Imagine que você está explicando sua pesquisa para um colega de outro curso.
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-brand-green mt-1">check_circle</span>
                                <div>
                                    <strong>Estrutura Narrativa:</strong> Comece pelo "porquê" (o impacto da pesquisa) antes de entrar no "como" (os métodos técnicos). O leitor se engaja mais com o propósito.
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-brand-yellow mt-1">edit_note</span>
                                <div>
                                    <strong>Use Formatação:</strong> Quebre textos longos em parágrafos curtos. Use **negrito** para destacar conceitos chave e # títulos para organizar as seções.
                                </div>
                            </li>
                        </ul>
                    </section>

                    {/* Novo: Seção de Comunidade */}
                    <section className="bg-gradient-to-br from-brand-blue/5 to-brand-yellow/5 dark:from-brand-blue/10 dark:to-brand-yellow/10 rounded-2xl p-8 shadow-sm border border-brand-blue/10 dark:border-brand-blue/20 relative overflow-hidden group">
                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <span className="material-symbols-outlined text-4xl text-brand-blue">groups</span>
                            <h2 className="text-3xl m-0">Comunidade e Engajamento</h2>
                        </div>

                        <div className="space-y-4 max-w-2xl">
                            <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white uppercase text-xs tracking-widest">
                                <span className="material-symbols-outlined text-brand-yellow text-sm">edit_note</span>
                                Central de Anotações
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Deseja compartilhar um Drive com materiais de estudo ou notas de aula? Use o formulário principal e selecione a categoria <strong>"Central de Anotações"</strong>. Certifique-se de que o link do Drive esteja configurado como "Qualquer pessoa com o link pode ler". Você também pode subir arquivos <strong>.zip</strong> ou <strong>.sdocx</strong> diretamente.
                            </p>
                        </div>
                    </section>

                    {/* Novo: Seção de Agrupamento */}
                    <section className="bg-white dark:bg-card-dark rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group">
                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <span className="material-symbols-outlined text-4xl text-brand-blue">inventory_2</span>
                            <h2 className="text-3xl m-0">Agrupamento e Notas Acadêmicas</h2>
                        </div>

                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-brand-blue mt-1">folder_zip</span>
                                <div>
                                    <strong>Arquivos ZIP:</strong> Ideais para agrupar várias listas de exercícios, datasets pequenos ou uma coleção de documentos relacionados em um único envio.
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-brand-red mt-1">edit_note</span>
                                <div>
                                    <strong>Samsung Notes (.SDOCX):</strong> Suporte nativo para estudantes que fazem anotações em tablets. Você pode subir o arquivo original diretamente para facilitar o download por outros colegas com dispositivos compatíveis.
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-brand-yellow mt-1">cloud_upload</span>
                                <div>
                                    <strong>Limite de 10MB:</strong> Para arquivos diretos, mantemos um limite estrito de 10MB. Se o seu arquivo ZIP ou Notas for maior que isso, utilize o campo <strong>"Link Externo"</strong> apontando para o seu Google Drive ou Nuvem.
                                </div>
                            </li>
                        </ul>
                    </section>

                    {/* Seção de Upload */}
                    <section className="bg-white dark:bg-card-dark rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/5 dark:hidden rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none transition-transform group-hover:scale-150"></div>

                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <span className="material-symbols-outlined text-4xl text-brand-yellow">cloud_upload</span>
                            <h2 className="text-3xl m-0">Como Fazer o Upload para o Acervo</h2>
                        </div>

                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-brand-blue mt-1">photo_library</span>
                                <div>
                                    <strong>Fotos:</strong> Máximo de 10 fotos por envio e tamanho máximo de 10MB por arquivo.<br />
                                    <span className="text-sm text-gray-500">Explicação: Garante que o site continue rápido e não estoure os limites do servidor.</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-brand-red mt-1">smart_display</span>
                                <div>
                                    <strong>Vídeos:</strong> Não fazer upload de vídeos diretos. Eles devem ser upados no YouTube e o link deve ser compartilhado no formulário.<br />
                                    <span className="text-sm text-gray-500">Explicação: Melhora o carregamento do site e aproveita o player do YouTube.</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-brand-yellow mt-1">picture_as_pdf</span>
                                <div>
                                    <strong>PDFs e Artigos:</strong> Faça o upload apenas da <strong>capa (primeira página)</strong> do seu artigo como PDF (máximo <strong>10MB</strong>). Essa capa será a imagem de pré-visualização no site.<br />
                                    <span className="text-sm text-gray-500">Dica: Use sites como <a href="https://www.ilovepdf.com/pt/dividir_pdf" target="_blank" rel="noopener noreferrer" className="underline">iLovePDF</a> ou <a href="https://smallpdf.com/pt/dividir-pdf" target="_blank" rel="noopener noreferrer" className="underline">SmallPDF</a> para extrair apenas a primeira página do seu PDF.</span><br />
                                    <span className="text-sm text-gray-500"><strong>Link Externo:</strong> Use o campo dedicado <strong>"Link Externo"</strong> para colar o link do documento completo (Google Drive, Dropbox ou repositório institucional) se o arquivo for pesado.</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-brand-blue mt-1">article</span>
                                <div>
                                    <strong>Texto:</strong> Mínimo de 50 caracteres. O conteúdo deve ser escrito diretamente no campo de descrição do formulário.<br />
                                    <span className="text-sm text-gray-500">Dica: Nossa plataforma suporta **Markdown** (negrito, listas, títulos). Use a barra de ferramentas para formatar.</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-brand-green mt-1">person</span>
                                <div>
                                    <strong>Autoria e Contato:</strong> O usuário deve preencher nome e contato de **WhatsApp** para que possamos dar o retorno da curadoria ou solicitar ajustes se necessário.
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-brand-yellow mt-1">assignment_turned_in</span>
                                <div>
                                    <strong>Termo:</strong> Lembrar de assinar/marcar o termo de licenciamento no final do formulário para garantir que o material possa ser usado legalmente por professores.
                                </div>
                            </li>
                        </ul>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
