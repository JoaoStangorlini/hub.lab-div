import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";

export default function CriadoresPage() {
    const creators = [
        {
            name: 'Cmdr. Orion Branco',
            role: 'Piloto de Teste Estelar',
            bio: 'Sou o primeiro a testar as dobras espaciais da frota. Sobrevivi a 14 buracos de minhoca e conto tudo aqui.',
            imagePlaceholder: 'O',
            color: 'brand-blue'
        },
        {
            name: 'Dione Alpha',
            role: 'Tradutora de Sinais',
            bio: 'Analiso ruídos de rádio do espaço profundo para encontrar receitas de bolo alienígenas.',
            imagePlaceholder: 'D',
            color: 'brand-yellow'
        },
        {
            name: 'Lexa Centauri',
            role: 'Engenheira de Antimatéria',
            bio: 'Consertando reatores com fita adesiva estelar desde 2084.',
            imagePlaceholder: 'L',
            color: 'brand-red'
        },
        {
            name: 'Chronos',
            role: 'Mecânico de Tempo',
            bio: 'Você perdeu suas chaves ontém amanhã? Eu ajudo você a encontrá-las na linha temporal correta.',
            imagePlaceholder: 'C',
            color: 'brand-blue'
        }
    ];

    const influencers = [
        {
            name: 'Lumus Quasar',
            role: 'Viajante Espacial',
            bio: 'Mostrando os bastidores do meu estágio intergaláctico no cinturão de Órion para meus seguidores da Terra.',
            imagePlaceholder: 'L',
            color: 'brand-blue',
            platform: 'hologram'
        },
        {
            name: 'Doutor Paradoxo',
            role: 'Explicador de Multiversos',
            bio: 'Física interdimensional e por que você não deveria acariciar o gato de Schrödinger.',
            imagePlaceholder: 'D',
            color: 'brand-red',
            platform: 'neuro-net'
        },
        {
            name: 'Sintonia Gamma',
            role: 'Caçadora de Radiação',
            bio: 'Buscando fontes de energia cósmica no meu quintal e postando no canal.',
            imagePlaceholder: 'S',
            color: 'brand-yellow',
            platform: 'wave-cast'
        },
        {
            name: 'Mestre da Inércia',
            role: 'Ativista Estático',
            bio: 'Lutando pelo direito de manter objetos em repouso exatamente onde estão.',
            imagePlaceholder: 'M',
            color: 'brand-blue',
            platform: 'gravity-feed'
        },
        {
            name: 'Zeta Bits',
            role: 'Pesquisador Quântico',
            bio: 'Descobrindo o universo em 8bits e simulando buracos negros no meu fliperama antigo.',
            imagePlaceholder: 'Z',
            color: 'brand-red',
            platform: 'hologram'
        },
        {
            name: 'Entropia Positiva',
            role: 'Criadora do Caos',
            bio: 'Dicas práticas de como aumentar a desordem do seu quarto de forma cientificamente provada.',
            imagePlaceholder: 'E',
            color: 'brand-yellow',
            platform: 'neuro-net'
        }
    ];


    const getPlatformIcon = (platform: string) => {
        if (platform === 'hologram') return <span className="material-symbols-outlined text-[18px]">view_in_ar</span>;
        if (platform === 'neuro-net') return <span className="material-symbols-outlined text-[18px]">psychology</span>;
        if (platform === 'wave-cast') return <span className="material-symbols-outlined text-[18px]">cell_tower</span>;
        if (platform === 'gravity-feed') return <span className="material-symbols-outlined text-[18px]">public</span>;
        return <span className="material-symbols-outlined text-[18px]">rocket_launch</span>;
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-sans text-gray-900 dark:text-gray-100 flex flex-col overflow-hidden">
            <Header />

            <main className="flex-1 py-12 w-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tight mb-4 text-gray-900 dark:text-white">
                            Nossos <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-brand-red to-brand-yellow">Criadores</span>
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            Conheça os estudantes, professores e pesquisadores que estão por trás da curadoria e produção do acervo colaborativo.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {creators.map((creator, index) => (
                            <div key={index} className="flex flex-col items-center text-center group">
                                <div className={`relative w-32 h-32 rounded-full mb-5 flex items-center justify-center text-4xl font-bold text-white bg-${creator.color} shadow-lg ring-4 ring-background-light dark:ring-background-dark outline outline-2 outline-gray-200 dark:outline-gray-800 transition-transform group-hover:scale-105 duration-300`}>
                                    {creator.imagePlaceholder}
                                    <div className="absolute inset-0 rounded-full bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{creator.name}</h3>
                                <p className={`text-sm font-semibold text-${creator.color} mb-3`}>{creator.role}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-[250px] mx-auto">
                                    {creator.bio}
                                </p>

                                <div className="flex gap-3 mt-4 opacity-50 group-hover:opacity-100 transition-opacity">
                                    <a href="#" className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-brand-blue hover:text-white transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                                    </a>
                                    <a href="#" className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-brand-blue hover:text-white transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">mail</span>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-28 text-center max-w-2xl mx-auto mb-16">
                        <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-4 text-gray-900 dark:text-white">
                            Influenciadores do <span className="text-brand-yellow">IF-USP</span>
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            Acompanhe nossos estudantes espalhando ciência criativa pelo TikTok, YouTube e outras plataformas.
                        </p>
                    </div>
                </div>

                <div className="w-full">
                    <div className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-6 pb-8 no-scrollbar pl-6 md:pl-12 lg:pl-16 pr-6 md:pr-12 lg:pr-16">
                        {influencers.map((influencer, index) => (
                            <div key={index} className="flex flex-col items-center text-center group snap-center shrink-0 w-[260px] md:w-[300px] p-6 bg-white dark:bg-card-dark rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
                                <div className={`relative w-28 h-28 rounded-full mb-5 flex items-center justify-center text-4xl font-bold text-white bg-${influencer.color} shadow-lg ring-4 ring-background-light dark:ring-background-dark outline outline-2 outline-gray-200 dark:outline-gray-800 transition-transform group-hover:scale-105 duration-300`}>
                                    {influencer.imagePlaceholder}
                                    <div className="absolute inset-0 rounded-full bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>

                                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-1 group-hover:text-brand-yellow transition-colors">{influencer.name}</h3>
                                <p className={`text-xs font-bold uppercase tracking-wider text-${influencer.color} mb-4`}>{influencer.role}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                                    {influencer.bio}
                                </p>

                                <div className="mt-auto">
                                    <a href="#" className={`w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-${influencer.color} hover:shadow-lg hover:shadow-${influencer.color}/30 transition-all duration-300 transform group-hover:scale-110`} title={`Acessar ${influencer.platform}`}>
                                        {getPlatformIcon(influencer.platform)}
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
