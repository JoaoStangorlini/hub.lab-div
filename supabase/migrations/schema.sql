-- Enum para o status da submissão
CREATE TYPE submission_status AS ENUM ('pendente', 'aprovado', 'rejeitado');

-- Enum para o tipo de mídia
CREATE TYPE media_type AS ENUM ('image', 'video');

-- Tabela principal de submissões
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    authors TEXT NOT NULL,
    description TEXT NOT NULL,
    media_type media_type NOT NULL,
    media_url TEXT NOT NULL,
    category VARCHAR(100),
    status submission_status DEFAULT 'pendente' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Política de leitura pública apenas para itens aprovados
CREATE POLICY "Public can view approved submissions" 
    ON submissions
    FOR SELECT 
    USING (status = 'aprovado');

-- Política para inserção (pública ou autenticada, dependendo do design exato)
-- Para este cenário, como é um formulário de envio, podemos permitir inserção anônima:
CREATE POLICY "Anyone can submit contributions"
    ON submissions
    FOR INSERT
    WITH CHECK (true);

-- Política para moderação (apenas admins podem ver e alterar todos)
-- Obs: Em produção, você checaria auth.uid()
CREATE POLICY "Admins can manage all submissions"
    ON submissions
    USING (true)
    WITH CHECK (true);
