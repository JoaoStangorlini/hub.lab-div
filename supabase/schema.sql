CREATE TYPE submission_status AS ENUM ('pendente', 'aprovado', 'rejeitado');
-- Note: 'pdf' and 'text' are added for Sprint 2
CREATE TYPE submission_type AS ENUM ('image', 'video', 'pdf', 'text');

-- Create submissions table
CREATE TABLE public.submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  authors text NOT NULL,
  description text,
  media_type submission_type NOT NULL,
  media_url jsonb NOT NULL DEFAULT '[]'::jsonb,
  category text, -- e.g., 'Astronomia', 'Materiais', 'Biofísica'
  email text,
  whatsapp text,
  status submission_status DEFAULT 'pendente' NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  featured boolean DEFAULT false,
  external_link text,
  technical_details text
);

-- ==========================================
-- SPRINT 2 MIGRATION SCRIPT 
-- Run this in your Supabase SQL Editor if the table already exists:
-- ALTER TYPE submission_type ADD VALUE IF NOT EXISTS 'pdf';
-- ALTER TYPE submission_type ADD VALUE IF NOT EXISTS 'text';
-- ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS external_link text;
-- ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS technical_details text;
-- ==========================================

-- Performance Indexes for Submissions
CREATE INDEX idx_submissions_status_date ON public.submissions (status, created_at DESC);
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_submissions_title_trgm ON public.submissions USING GIN (title gin_trgm_ops);
CREATE INDEX idx_submissions_desc_trgm ON public.submissions USING GIN (description gin_trgm_ops);
CREATE INDEX idx_submissions_authors_trgm ON public.submissions USING GIN (authors gin_trgm_ops);

-- Set up Row Level Security (RLS)
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Policies for submissions table

-- 1. Public can view only approved submissions
CREATE POLICY "Approved submissions are viewable by everyone"
  ON submissions FOR SELECT
  USING (status = 'aprovado');

-- 2. Anyone can insert new submissions (they default to 'pendente' via DB default or check)
CREATE POLICY "Users can insert new submissions"
  ON submissions FOR INSERT
  WITH CHECK (status = 'pendente');

-- 3. Admins can view all submissions (requires authenticated role to manage)
CREATE POLICY "Admins can view all submissions"
  ON submissions FOR SELECT
  USING (auth.role() = 'authenticated');

-- 4. Admins can update submissions (e.g. approve or mark featured)
CREATE POLICY "Admins can update submissions"
  ON submissions FOR UPDATE
  USING (auth.role() = 'authenticated');

-- 5. Admins can delete submissions (e.g. reject and remove)
CREATE POLICY "Admins can delete submissions"
  ON submissions FOR DELETE
  USING (auth.role() = 'authenticated');

-- Create contatos table
CREATE TABLE public.contatos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  whatsapp text,
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Protect contatos (only authenticated can read)
ALTER TABLE public.contatos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert contatos"
  ON contatos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only admins can view contatos"
  ON contatos FOR SELECT
  USING (auth.role() = 'authenticated');

-- =============================================
-- Curtidas (Likes / Engagement)
-- =============================================
CREATE TABLE public.curtidas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id uuid NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  fingerprint text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(submission_id, fingerprint)
);

ALTER TABLE public.curtidas ENABLE ROW LEVEL SECURITY;

-- Admins can do everything (including read)
CREATE POLICY "Admins can manage curtidas"
  ON curtidas FOR ALL
  USING (auth.role() = 'authenticated');

-- Atomic RPC function to toggle likes safely
-- This bypasses RLS (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION toggle_like(p_submission_id UUID, p_fingerprint TEXT)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    current_count INT;
    was_liked BOOLEAN;
BEGIN
    IF EXISTS (SELECT 1 FROM curtidas WHERE submission_id = p_submission_id AND fingerprint = p_fingerprint) THEN
        DELETE FROM curtidas WHERE submission_id = p_submission_id AND fingerprint = p_fingerprint;
        was_liked := false;
    ELSE
        INSERT INTO curtidas (submission_id, fingerprint) VALUES (p_submission_id, p_fingerprint);
        was_liked := true;
    END IF;
    
    SELECT COUNT(*) INTO current_count FROM curtidas WHERE submission_id = p_submission_id;
    
    RETURN jsonb_build_object(
      'liked', was_liked,
      'count', current_count
    );
END;
$$;

-- =============================================
-- Perguntas (Ask a Scientist)
-- =============================================
CREATE TABLE public.perguntas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  email text NOT NULL,
  pergunta text NOT NULL,
  resposta text,
  status text DEFAULT 'pendente' NOT NULL,
  respondido_por text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.perguntas ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a question (must be pendente)
CREATE POLICY "Anyone can insert perguntas"
  ON perguntas FOR INSERT
  WITH CHECK (status = 'pendente');

-- Public can view only answered questions
CREATE POLICY "Public can view answered perguntas"
  ON perguntas FOR SELECT
  USING (status = 'respondida');

-- Admins can view all questions
CREATE POLICY "Admins can view all perguntas"
  ON perguntas FOR SELECT
  USING (auth.role() = 'authenticated');

-- Admins can update questions (to add answers)
CREATE POLICY "Admins can update perguntas"
  ON perguntas FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Admins can delete questions
CREATE POLICY "Admins can delete perguntas"
  ON perguntas FOR DELETE
  USING (auth.role() = 'authenticated');

-- =============================================
-- Oportunidades (Dynamic Opportunities Board)
-- =============================================
CREATE TABLE public.oportunidades (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo text NOT NULL,
  descricao text NOT NULL,
  data text NOT NULL,
  local text NOT NULL,
  link text,
  tipo text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.oportunidades ENABLE ROW LEVEL SECURITY;

-- Anyone can view opportunities
CREATE POLICY "Anyone can view oportunidades"
  ON oportunidades FOR SELECT
  USING (true);

-- Admins can insert opportunities
CREATE POLICY "Admins can insert oportunidades"
  ON oportunidades FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Admins can update opportunities
CREATE POLICY "Admins can update oportunidades"
  ON oportunidades FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Admins can delete opportunities
CREATE POLICY "Admins can delete oportunidades"
  ON oportunidades FOR DELETE
  USING (auth.role() = 'authenticated');
