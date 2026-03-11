# Hub Lab-Div - Documentação de Arquitetura e Engenharia

Este documento tem como objetivo servir de mapa para qualquer pessoa que vá assumir o desenvolvimento, manutenção ou evolução do **Hub de Comunicação Científica Lab-Div**.

A estrutura foi desenhada aplicando boas práticas de software *enterprise*, focando em Performance, Escalabilidade Modular e Segurança.

---

## 🛠️ Stack Tecnológica (A Trindade + 1)

O Hub é sustentado por 4 grandes pilares tecnológicos:

### 1. Next.js 14+ (O Motor Principal)
- **App Router:** Utilizado em `/src/app/`, com renderização via servidor por padrão (**Server Components**), o que maximiza o SEO e o carregamento inicial (CLS Zero).
- **Server Actions:** É a camada de conexão com o banco de dados. Usados para mutações (enviar post, curtir, salvar). A regra de ouro é: **Não usar `useEffect` para fetch de dados iniciais**, e sim Actions tipadas pelo backend no servidor (em `/src/app/actions`).
- **Hidratação (Client Components):** Quando o componente precisa de vida (estado como cliques de curtir, abas do perfil, `useState`, ou carrosséis em javascript), deve conter `"use client"` na primeira linha (geralmente localizados em `src/components`).

### 2. Supabase (Backend como Serviço)
- **Banco de Dados (Postgres):** Todas as tabelas, Storage nativo de avatares, curtidas e comentários ficam aqui.
- **Autenticação:** O IAM (Identity e Gestão) gira em torno do `supabase.auth`. No Next, usa-se o `@supabase/ssr` (em `/src/lib/supabase/server.ts`).
- **RLS (Row Level Security):** O pilar de segurança! Cada tabela só permite gravação do usuário dono. É mandatário em tudo o que for construído.
- **Migrations:** Os scripts de criação/atualização de banco devem sempre estar estruturados na pasta restrita `./supabase/migrations/newsqls/`. Novas funções, queries ou RPCs começam por ali.

### 3. Firebase App Hosting (DevOps e Distribuição)
Usado para subir a aplicação final (deploy de Next.js otimizado, não apenas estático).
- Todas as definições de como as rotas são construídas nele e de como injetar variáveis seguras moram no arquivo raiz: `apphosting.yaml`.
- Lembrete da Lei do Full-Stack: **Sempre que alterar uma chave `.env.local`, colocar um placeholder correlato em `.env.example`** para não quebrar deploys.

### 4. Cloudinary (Media CDN)
O serviço especializado de mídias pesadas.
- Responsável por armazenar arquivos brutos criados pelos usuários (fotos das submissões, vídeos). Supabase não deve segurar os gigabytes de acervo visual.
- Utiliza um esquema engenhoso gerando uma **assinatura criptografada (Signature)** no Next.js (Server Action), mandando o arquivo do navegador da pessoa diretamente pro Cloudinary para economizar banda do seu próprio servidor de hospedagem.

---

## 📁 Arquitetura de Pastas Explicada (`/src`)

Todo o coração da regra de negócio está na pasta `/src`. Se fosse montar um manual de uso, seria assim:

### `/src/app` (Rotas e Actions)
- Define a URL exata do navegador.
- Arquivo `page.tsx` cria a UI renderizada no backend, o `layout.tsx` cria o molde (Header/Footer), ou o `loading.tsx` cria o esqueleto da tela (Skeleton).
- **`/actions`**: A ponte de dados de R/W (Read/Write) estritos. Exemplos: `media.ts`, `submissions.ts`. Eles expõem funções seguras rodando em um terminal oculto.

### `/src/components` (A Interface UI em si)
- Onde a mágica de design (Tailwind v4) ganha vida. A aplicação das Cores Dark (#121212) e glassmorphism ficam ali.
- **`/ui`**: Peças brutas e pequenas sem regras complexas: botões de base, formulários, modais genéricos, loading Skeleton.
- **`/layout`**: Menus fixos: Header superior (navegação) e Footer.
- **`/engagement`**: Lógicas de botões que mexem em banco num componente isolado (`MediaReaction.tsx` que pisca coração na tela, ou `CollectionManager.tsx` que insere salvamentos em Pastas).

### `/src/hooks` (Lógica Reutilizável de Tela)
- Se tem "ação repetida", ela fica lá (ex: `useMediaInteraction.ts`).
- O `useMediaInteraction` junta a hidratação de "Likes/Salvos" e a **Optimistic UI** (fazer o botão piscar preenchido pro usuário antes mesmo do servidor aprovar a chamada — o que faz a interface parecer nativa e sem delay).

### `/src/lib` (Configurações e Auxílios)
Um canivete suíço de utilitários isolados.
- `constants.ts`: Definição de categorias, estilos, paleta de cor global de filtro. Onde os estilos das "tag colors" são mudados.
- `media-utils.ts`: Regex que extrai de uma string cheia de imagens as Thumbnails ou Links seguros do Cloudinary/Youtube.
- `utils.ts`: Utilitários gerais tipo formatar o nome dos usuários (removendo markdown e latex em views rápidas).

### `/src/types` (A Garantia de Qualidade Zod)
- **`/*.ts`**: Todas as interfaces TypeScript (`UserProps`, etc.), tipando os arquivos para você nunca errar e achar que algo é 'Number' quando é 'String'.
- **Zod Schemas**: Arquivos que validam a integridade de qualquer entrada do lado do cliente e evitam inserções maliciosas. Todo Server Action valida primeiro por um esquema do Zod!

### `/src/dtos` (Data Transfer Objects)
Modelagem rigorosa dos dados.
- Diferencia a tabela suja do Supabase do objeto limpo que os seus Componentes de Tela precisam enxergar (ex: converter o `created_at` num objeto local de `new Date()`).
- O Front-End não pede pro banco "Me dá \`curtidas.count\`, ele mapeia do DTO para a `view` do perfil de forma abstraída.

---

## ⚖️ As 4 Leis Inquebráveis do Hub Lab Div

1. **A Lei do Full-Stack:** Não entregue o BackEnd de formulário XYZ se você não for mapear na sua própria tela a lista pro usuário enxergar os envios. Um software vivo é o ciclo entre Database e a Interface Visual.
2. **Arquitetura de Erros e Progresso:** Nenhuma tela que espere processar (ex: ao clicar "Enviar") pode existir sem **Toasts** avisando o que rola e sem **Skeletons** (animações de carregamento).
3. **Responsive Mobile-First:** Comece testando em telas finas (`375px`); o mundo não utiliza monitores Ultra-Wide pra ver fóruns ou submeter dúvidas.
4. **Tráfego é vida:** Para páginas pesadas, use sempre renderizações `SSR` com `unstable_cache`. Não engesse a view cliente na montagem, use a desidratação em cache para TTFB debaixo de 300ms.

Tudo isso sustenta um software pronto para centenas e milhares de acessos, com arquitetura segura, coesa e moderna!

---

## 🏗️ 5. O Paradigma do React: Onde foram parar as pastas HTML, CSS e JS?

Se você vem do HTML/CSS clássico, a primeira surpresa no Hub será encontrar tudo unificado em arquivos `.tsx`. No ecossistema moderno do Next.js e Tailwind, nós invertemos a lógica de arquivos separados para focar na **separação por responsabilidades de componente**.

### 1. O HTML + CSS Unificados (O Poder do Tailwind)
Quase **90% do CSS do Hub é escrito diretamente nas tags HTML (JSX)** usando as *Utility Classes* do Tailwind. 
```tsx
// Exemplo real de um botão no Hub (Tudo em um arquivo!)
<button className="bg-brand-blue text-white font-bold rounded-xl px-4 py-2 hover:scale-105 transition-all">
  Enviar
</button>
```
Isso **não é CSS Inline ruim**. O compilador do Tailwind varre essas classes (ex: `bg-brand-blue`) antes do *deploy* e cria uma folha de estilo global minúscula. 
Os únicos **10% de CSS Tradicional** que mantemos ficam isolados no arquivo central `/src/app/globals.css`. Lá, guardamos animações complexas ou abstrações, como a classe `.glass-card` que carrega dezenas de filtros visuais de uma vez.

### 2. O JS Visual (Client Components)
Toda lógica que interage com o mouse do usuário na tela (cliques, alertas, mudança de cor) mora dentro daquele mesmo arquivo `.tsx`. 
Sempre que uma tela precisar dessa interatividade, ela **deve começar com a linha `'use client'`**. Lá dentro, nós usamos o React State (`useState`):
```tsx
'use client'; 
import { useState } from 'react';

export default function BotaoLike() {
  const [curtidas, setCurtidas] = useState(0); // Lógica JS local
  return <button onClick={() => setCurtidas(c => c + 1)}>❤️ {curtidas}</button>;
}
```

### 3. O JS de Dados (Server Actions)
Onde fica o Javascript pesado que fala com o banco de dados e esconde as senhas? Ele roda **apenas no servidor** e fica isolado dentro da pasta `/src/app/actions/`. 
Esses arquivos começam com `'use server'` e são Funções Javascript Puras.
```typescript
'use server';
export async function salvarNoBanco(dados) {
   // Javascript de backend invisível pro usuário final!
   const resultado = await supabase.from('minha_tabela').insert(dados);
   return resultado;
}
```
**Conclusão:** No Hub Lab-Div, você não caça um *CSS numa pasta* e o *JS noutra*. Você abre a tela `SobreClient.tsx` e resolve **TUDO** ali: o molde visual, o formato do texto e as regras matemáticas interativas, mantendo o software fácil de expandir!

---

## 🎨 6. O Design System "Reator Dark" (Padrões Visuais)

O Hub possui um Design System rigoroso chamado **Reator Dark**, otimizado para longas sessões de leitura e conforto visual da comunidade acadêmica.

**Cores Oficiais (Hexadecimais):**
- **Azul Bacharelado:** `#3B82F6` (`brand-blue`)
- **Amarelo Licenciatura:** `#FFB300` (`brand-yellow`)
- **Vermelho Física Médica:** `#E63946` (`brand-red`)
- **Fundos (Dark Mode):**
  - Fundo principal da tela: `#0a0a0a` (`background-dark`)
  - Superfícies Elevadas (Cards, Formulários): `#1E1E1E` (`card-dark` / `form-dark`)

**Tipografia:**
- Títulos e Destaques Visuais: **Space Grotesk** (`font-display`).
- Corpo de Texto Padrão e UI: **Inter** (`font-sans`).

**Efeitos Visuais e Glassmorphism:**
A folha de estilos do Tailwind CSS (`globals.css`) expõe abstrações poderosas. Para criar um card translúcido (Glassmorphism) com neon ativo, usa-se a combinação:
```html
<div className="glass-card hover:animate-premium-glow rounded-2xl p-6">
  {/* Conteúdo */}
</div>
```
- `glass-card`: Garante o fundo semitransparente, desfoque (backdrop-blur) e bordas finíssimas de contraste.
- `animate-premium-glow`: Exclusivo do Hub, embute um glow pulsante neon quando o mouse passa por cima!

---

## 📝 7. Receita de Bolo: Como criar uma NOVA ABA no Hub

Para manter o ecossistema previsível, caso amanhã a coordenação solicite criar uma página `/eventos`, o ritual exato é este:

**Passo 1: Criar a Estrutura de Rotas e Loading**
Dentro de `src/app/`, crie uma pasta chamada `eventos`.
Insira três arquivos vitais: `page.tsx` (O contêiner servidor com Metadados), `loading.tsx` (O Esqueleto) e o `EventosClient.tsx` (A UI Interativa com use client).

**Passo 2: Template padrão de um `page.tsx` (Server Component)**
Uma página **OBRIGATORIAMENTE** deve ter Metadados SEO e o uso correto do `<Suspense>` importado do React para injetar *Loading Skeletons* enquanto a action busca os dados no Supabase. Isso atinge o CLS Zero!

```tsx
import { Metadata } from 'next';
import { Suspense } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import EventosClient from './EventosClient';

export const metadata: Metadata = {
    title: 'Eventos - Hub Lab-Div',
    description: 'Acompanhe as datas e submissões das semanas de estudos da Física USP.',
};

export default function EventosPage() {
    return (
        <div className="bg-transparent text-text-main dark:text-gray-100 min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 max-w-[1200px] w-full px-4 sm:px-6 py-8 mx-auto mt-20">
                <h1 className="font-display font-black text-4xl mb-8">Eventos</h1>
                
                {/* 🚨 REQUISITO DE UX DO HAPPINESS INDEX 🚨 */}
                <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-3 gap-6"><SkeletonCard/><SkeletonCard/></div>}>
                    <EventosClient />
                </Suspense>

            </main>
            <Footer />
        </div>
    );
}
```

**Passo 3: Mudar a Navegação Global**
Nós possuímos a barra de navegação principal configurada duas vezes: `SidebarLeft.tsx` (Telas XL) e `BottomNavBar.tsx` (Mobile e Menores). Exporte o ícone do `lucide-react` para ambas e injete a âncora `href="/eventos"`.

---

## 🛠️ 8. Convenções de Código (Clean Code local)

Para que a equipe multiplique sem sofrer, não tente quebrar estas regras:

**1. Nomenclatura Estrita:**
- **Componentes React:** Obrigatoriamente Iniciais Maiúsculas `PascalCase` (Ex: `FeatureCards.tsx`, `ProfileTab.tsx`). Se lida com interação de banco em tela, o nome do arquivo termina em `Client` (ex: `SobreClient.tsx`).
- **Hooks e Constantes:** `camelCase` e prefxado com "use" (Ex: `useMediaInteraction.ts`, `useAuth.ts`).
- **Server Actions & Helpers:** Ações são `camelCase` indicando comportamento (ex: `toggleLike`, `fetchSubmissions`).
- **Tipos TypeScript:** Letra maiúscula sempre (ex: `PostDTO`, `UserProfileProps`).

**2. CSS Inline vs Tailwind CSS:**
- **Regra Rígida:** É terminantemente **PROIBIDO** o uso de Styles inline (`style={{ backgroundColor: 'red', marginTop: '10px' }}`) para regras normais do sistema UI. Tudo, absolutamente tudo se faz empilhando as classes nativas do Tailwind diretamente no `className`.
- **Exceção à Regra:** O CSS inline só tem permissão de existir onde o valor é originado por um cálculo matemático do Javascript e muda o tempo todo dinamicamente. (Exemplo aceito: A linha fina da leitura no topo da tela cuja largura cresce `%` perante o cálculo do scroll em pixel, ou um `animationDelay: \`\${index * 0.1}s\`` dinâmico para carregar uma grade de cards em escadinha).
