-- Módulo 2: Atualização do Banco de Dados

-- 1. Adicionar novas colunas na tabela submissions
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS reading_time INTEGER DEFAULT 0;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- 2. Criar Função RPC para Incrementar Views com Segurança
-- Essa rotina pode ser chamada anonimamente (ou dependendo da política),
-- mas é executada com os privilégios do dono (SECURITY DEFINER)
-- ou do chamador. Em Supabase, functions rodam com bypass RLS 
-- se definidas corretamente. Em RLS restrito, o update precisa ser definido.
CREATE OR REPLACE FUNCTION increment_view_count(submission_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE submissions
  SET views = views + 1
  WHERE id = submission_id;
END;
$$;

-- 3. Criar a tabela de Playlists (Trilhas)
CREATE TABLE IF NOT EXISTS playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela playlists
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;

-- Política de leitura pública para playlists
DROP POLICY IF EXISTS "Public can view playlists" ON playlists;
CREATE POLICY "Public can view playlists"
    ON playlists
    FOR SELECT
    USING (true);

-- 4. Criar a tabela de itens da playlist
CREATE TABLE IF NOT EXISTS playlist_items (
    playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (playlist_id, submission_id)
);

-- Habilitar RLS na tabela playlist_items
ALTER TABLE playlist_items ENABLE ROW LEVEL SECURITY;

-- Política de leitura pública para itens da playlist
DROP POLICY IF EXISTS "Public can view playlist items" ON playlist_items;
CREATE POLICY "Public can view playlist items"
    ON playlist_items
    FOR SELECT
    USING (true);

-- 5. Criar Função RPC para obter as submissões mais curtidas
CREATE OR REPLACE FUNCTION get_most_liked_submissions(limit_count integer DEFAULT 3)
RETURNS SETOF submissions
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT s.*
  FROM submissions s
  LEFT JOIN curtidas c ON s.id = c.submission_id
  WHERE s.status = 'aprovado'
  GROUP BY s.id
  ORDER BY COUNT(c.id) DESC, s.created_at DESC
  LIMIT limit_count;
END;
$$;
