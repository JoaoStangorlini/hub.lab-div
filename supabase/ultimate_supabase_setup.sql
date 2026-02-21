-- ==========================================================
-- SETUP DEFINITIVO E COMPLETO: IF-USP-CIÊNCIA (HUB)
-- ==========================================================
-- Este script consolida TODA a estrutura do banco de dados e TODAS as políticas.
-- Recomendação: Antes de rodar, se houver muitas políticas manuais no site, 
-- você pode considerar 'vaziá-las' ou apenas rodar este script que usa DROP/CREATE.

-- ==========================================================
-- 1. EXTENSÕES E TIPOS (ENUMS)
-- ==========================================================

-- Habilitar UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ 
BEGIN
    -- Status da Submissão
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'submission_status') THEN
        CREATE TYPE submission_status AS ENUM ('pendente', 'aprovado', 'rejeitado');
    END IF;
    
    -- Tipo de Mídia (Completo)
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_type') THEN
        CREATE TYPE media_type AS ENUM ('image', 'video', 'pdf', 'text', 'link', 'zip', 'sdocx');
    ELSE
        -- Garantir que todos os valores existam
        PERFORM NULL FROM pg_enum WHERE enumlabel = 'pdf' AND enumtypid = 'media_type'::regtype;
        IF NOT FOUND THEN ALTER TYPE media_type ADD VALUE 'pdf'; END IF;
        
        PERFORM NULL FROM pg_enum WHERE enumlabel = 'text' AND enumtypid = 'media_type'::regtype;
        IF NOT FOUND THEN ALTER TYPE media_type ADD VALUE 'text'; END IF;
        
        PERFORM NULL FROM pg_enum WHERE enumlabel = 'link' AND enumtypid = 'media_type'::regtype;
        IF NOT FOUND THEN ALTER TYPE media_type ADD VALUE 'link'; END IF;
        
        PERFORM NULL FROM pg_enum WHERE enumlabel = 'zip' AND enumtypid = 'media_type'::regtype;
        IF NOT FOUND THEN ALTER TYPE media_type ADD VALUE 'zip'; END IF;
        
        PERFORM NULL FROM pg_enum WHERE enumlabel = 'sdocx' AND enumtypid = 'media_type'::regtype;
        IF NOT FOUND THEN ALTER TYPE media_type ADD VALUE 'sdocx'; END IF;
    END IF;
EXCEPTION
    WHEN others THEN NULL;
END $$;

-- ==========================================================
-- 2. TABELAS PRINCIPAIS
-- ==========================================================

-- 2.1 Profiles (Perfil de Usuário)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.2 Submissions (Submissões de Conteúdo)
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    authors TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT,
    media_type media_type NOT NULL,
    media_url TEXT NOT NULL, -- Pode ser JSON stringificado de array de URLs
    status submission_status DEFAULT 'pendente' NOT NULL,
    admin_feedback TEXT,
    whatsapp TEXT,
    external_link TEXT,
    technical_details TEXT,
    alt_text TEXT,
    testimonial TEXT,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.3 Comments (Comentários nas Submissões)
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    status submission_status DEFAULT 'pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.4 Reproductions (Eu Reproduzi!)
CREATE TABLE IF NOT EXISTS public.reproductions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    text_content TEXT,
    media_url TEXT,
    status submission_status DEFAULT 'pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.5 Testimonials (Páginas de Impacto)
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    status submission_status DEFAULT 'pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.6 Badges & Gamification
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    icon TEXT NOT NULL, -- Nome do Material Symbol
    description TEXT
);

CREATE TABLE IF NOT EXISTS public.user_badges (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, badge_id)
);

-- ==========================================================
-- 3. SEGURANÇA E RLS (POLÍTICAS)
-- ==========================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reproductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- 3.1 Função is_admin() (Crucial para evitar recursão nas políticas)
-- Simplificada para usar o role do JWT se disponível, caindo para a tabela
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN (
        auth.jwt() ->> 'role' = 'admin' OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3.2 POLÍTICAS: PROFILES
DROP POLICY IF EXISTS "Perfis visíveis para todos" ON public.profiles;
CREATE POLICY "Perfis visíveis para todos" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuários editam o próprio perfil" ON public.profiles;
CREATE POLICY "Usuários editam o próprio perfil" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuários criam o próprio perfil" ON public.profiles;
CREATE POLICY "Usuários criam o próprio perfil" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins manage profiles" ON public.profiles;
CREATE POLICY "Admins manage profiles" ON public.profiles USING (public.is_admin());

-- 3.3 POLÍTICAS: SUBMISSIONS
DROP POLICY IF EXISTS "Public can view approved submissions" ON public.submissions;
CREATE POLICY "Public can view approved submissions" ON public.submissions FOR SELECT USING (status = 'aprovado' OR public.is_admin());

DROP POLICY IF EXISTS "Anyone can submit contributions" ON public.submissions;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir submissões" ON public.submissions;
CREATE POLICY "Usuários autenticados podem inserir submissões" ON public.submissions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins manage submissions" ON public.submissions;
CREATE POLICY "Admins manage submissions" ON public.submissions USING (public.is_admin());

-- 3.4 POLÍTICAS: COMMENTS
DROP POLICY IF EXISTS "Anyone can read all comments" ON public.comments;
CREATE POLICY "Anyone can read all comments" ON public.comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Qualquer um pode comentar" ON public.comments;
CREATE POLICY "Qualquer um pode comentar" ON public.comments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins manage comments" ON public.comments;
CREATE POLICY "Admins manage comments" ON public.comments USING (public.is_admin());

DROP POLICY IF EXISTS "Anyone can update comments" ON public.comments;
CREATE POLICY "Anyone can update comments" ON public.comments FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can delete comments" ON public.comments;
CREATE POLICY "Anyone can delete comments" ON public.comments FOR DELETE USING (true);

-- 3.5 POLÍTICAS: REPRODUCTIONS
DROP POLICY IF EXISTS "Anyone can read all reproductions" ON public.reproductions;
CREATE POLICY "Anyone can read all reproductions" ON public.reproductions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuários logados podem enviar reproduções" ON public.reproductions;
CREATE POLICY "Usuários logados podem enviar reproduções" ON public.reproductions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins manage reproductions" ON public.reproductions;
CREATE POLICY "Admins manage reproductions" ON public.reproductions USING (public.is_admin());

DROP POLICY IF EXISTS "Anyone can update reproductions" ON public.reproductions;
CREATE POLICY "Anyone can update reproductions" ON public.reproductions FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can delete reproductions" ON public.reproductions;
CREATE POLICY "Anyone can delete reproductions" ON public.reproductions FOR DELETE USING (true);

-- 3.6 POLÍTICAS: TESTIMONIALS
DROP POLICY IF EXISTS "Testemunhos aprovados são públicos" ON public.testimonials;
CREATE POLICY "Testemunhos aprovados são públicos" ON public.testimonials FOR SELECT USING (status = 'aprovado' OR public.is_admin());

DROP POLICY IF EXISTS "Usuários logados podem enviar testemunhos" ON public.testimonials;
CREATE POLICY "Usuários logados podem enviar testemunhos" ON public.testimonials FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins manage testimonials" ON public.testimonials;
CREATE POLICY "Admins manage testimonials" ON public.testimonials USING (public.is_admin());

-- 3.7 POLÍTICAS: BADGES
DROP POLICY IF EXISTS "Badges são públicas" ON public.badges;
CREATE POLICY "Badges são públicas" ON public.badges FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage badges" ON public.badges;
CREATE POLICY "Admins manage badges" ON public.badges USING (public.is_admin());

DROP POLICY IF EXISTS "User badges são públicas" ON public.user_badges;
CREATE POLICY "User badges são públicas" ON public.user_badges FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage user badges" ON public.user_badges;
CREATE POLICY "Admins manage user badges" ON public.user_badges USING (public.is_admin());

-- ==========================================================
-- 4. TRIGGERS AUTOMÁTICOS
-- ==========================================================

-- Trigger para criar perfil automaticamente após signup ou primeiro login
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. DADOS INICIAIS (SEED) E BACKFILL
-- ==========================================================

-- Backfill: Garantir que todos os usuários existentes tenham um perfil
-- Isso evita erro de chave estrangeira ao enviar submissões
INSERT INTO public.profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Seed de Badges
INSERT INTO public.badges (name, icon, description) 
VALUES ('Pesquisador Sênior', 'elderly', 'Colaborador frequente com 3 ou mais publicações aprovadas.')
ON CONFLICT (name) DO NOTHING;
