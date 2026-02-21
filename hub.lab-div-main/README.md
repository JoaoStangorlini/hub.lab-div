# Hub de Comunicação Científica - Lab-Div (IFUSP)

Bem-vindo ao **Hub de Comunicação Científica**, um ecossistema digital desenvolvido pelo **Lab-Div** (Laboratório de Divulgação Científica) do Instituto de Física da USP. Este projeto centraliza, organiza e potencializa a divulgação científica produzida pela nossa comunidade, servindo como uma vitrine e um arquivo colaborativo de alta qualidade.

## 🚀 Visão Geral

O projeto foi criado para resolver a lacuna histórica entre a produção acadêmica e a comunicação com a sociedade. Ele funciona como um motor contínuo de difusão de conhecimento, integrando criadores de conteúdo, pesquisadores e o público geral.

### Principais Funcionalidades

- **Galeria de Mídia Infinita**: Acervo colaborativo de fotos, vídeos, PDFs e artigos com carregamento sob demanda.
- **Lightbox Interativo**: Visualização em tela cheia com suporte a múltiplos formatos de mídia e navegação fluida.
- **Envio Colaborativo**: Formulário intuitivo para que a comunidade (alunos, professores e pesquisadores) envie suas contribuições.
- **Painel Administrativo**: Gestão completa de submissões, moderação de conteúdo e destaques.
- **Pergunte a um Cientista**: Canal direto para a comunidade tirar dúvidas com especialistas do IFUSP.
- **Ecossistema de Criadores**: Showcase de influenciadores e iniciativas de divulgação científica vinculadas ao instituto.

## 🛠️ Stack Tecnológica

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Linguagem**: TypeScript
- **Banco de Dados & Autenticação**: [Supabase](https://supabase.com/)
- **Estilização**: Tailwind CSS + Material Symbols
- **Upload de Mídia**: [Cloudinary](https://cloudinary.com/)
- **Visualização de Documentos**: React Markdown + Custom PDF Viewer
- **Hospedagem**: Firebase / Google App Hosting

## 📦 Como Executar o Projeto

### Pré-requisitos

- Node.js (v18+)
- Conta no Supabase e Cloudinary

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/JoaoStangorlini/hub.lab-div.git
   cd hub.lab-div
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   Crie um arquivo `.env.local` na raiz com as seguintes chaves:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=seu_url_do_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=seu_cloud_name
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=seu_upload_preset
   ADMIN_PASSWORD=sua_senha_de_admin
   ```

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

O projeto estará disponível em `http://localhost:3000`.

## 📂 Estrutura do Projeto

- `src/app`: Rotas e páginas da aplicação (Next.js App Router).
- `src/components`: Componentes React reutilizáveis e modulares.
- `src/lib`: Configurações de serviços (Supabase) e constantes globais.
- `src/actions`: Server actions para manipulação de dados complexos.
- `public`: Assets estáticos.

## 🤝 Colaboração

O Hub é um projeto colaborativo. Sinta-se à vontade para abrir Issues ou enviar Pull Requests para melhorias técnicas ou correções de bugs.

## 📄 Licença

Este projeto está sob a licença de uso do Instituto de Física da USP - Lab-Div. As mídias contidas no acervo seguem, por padrão, licenciamento Creative Commons (CC-BY).

---
Desenvolvido com ❤️ pelo **Lab-Div - IFUSP**.
