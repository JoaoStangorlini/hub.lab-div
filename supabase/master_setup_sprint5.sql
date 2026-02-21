-- MASTER SQL SETUP: Sprint 5 (Schema + Policies)
-- Este arquivo consolida todas as mudanças necessárias para o Sprint 5.
-- Antes de rodar, você pode apagar as políticas antigas se estiverem dando conflito.

-- ==========================================================
-- 1. EXTENSÕES E TIPOS (ENUMS)
-- ==========================================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'submission_status') THEN
        CREATE TYPE submission_status AS ENUM ('pendente', 'aprovado', 'rejeitado');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_type') THEN
        CREATE TYPE media_type AS ENUM ('image', 'video', 'pdf', 'text', 'link', 'zip', 'sdocx');
    ELSE
        -- Garantir que todos os formatos novos existam no enum media_type
        EXECUTE 'ALTER TYPE media_type ADD VALUE IF NOT EXISTS ''pdf''';
        EXECUTE 'ALTER TYPE media_type ADD VALUE IF NOT EXISTS ''text''';
        EXECUTE 'ALTER TYPE media_type ADD VALUE IF NOT EXISTS ''link''';
        EXECUTE 'ALTER TYPE media_type ADD VALUE IF NOT EXISTS ''zip''';
        EXECUTE 'ALTER TYPE media_type ADD VALUE IF NOT EXISTS ''sdocx''';
    END IF;
EXCEPTION
    WHEN others THEN NULL;
END $$;

-- ==========================================================
-- 2. TABELAS E COLUNAS
-- ==========================================================

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Submissions (Garantir colunas extras)
CREATE TABLE IF NOT EXISTS submissions (
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

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='user_id') THEN
        ALTER TABLE submissions ADD COLUMN user_id UUID REFERENCES public.profiles(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='admin_feedback') THEN
        ALTER TABLE submissions ADD COLUMN admin_feedback TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='whatsapp') THEN
        ALTER TABLE submissions ADD COLUMN whatsapp TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='external_link') THEN
        ALTER TABLE submissions ADD COLUMN external_link TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='technical_details') THEN
        ALTER TABLE submissions ADD COLUMN technical_details TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='alt_text') THEN
        ALTER TABLE submissions ADD COLUMN alt_text TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='testimonial') THEN
        ALTER TABLE submissions ADD COLUMN testimonial TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='featured') THEN
        ALTER TABLE submissions ADD COLUMN featured BOOLEAN DEFAULT false;
    END IF;
END $$;

-- ==========================================================
-- 3. FUNÇÕES DE SUPORTE (SECURITY DEFINER)
-- ==========================================================

-- Função para checar se o usuário é admin sem causar recursão RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN (
        SELECT role = 'admin'
        FROM public.profiles
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================================
-- 4. POLÍTICAS DE ACESSO (RLS) - LIMPEZA E CRIAÇÃO
-- ==========================================================

-- Habilitar RLS em tudo
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- --- PROFILES ---
DROP POLICY IF EXISTS "Perfis visíveis para todos" ON public.profiles;
CREATE POLICY "Perfis visíveis para todos" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuários editam o próprio perfil" ON public.profiles;
CREATE POLICY "Usuários editam o próprio perfil" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins manage profiles" ON public.profiles;
CREATE POLICY "Admins manage profiles" ON public.profiles USING (public.is_admin());

-- --- SUBMISSIONS ---
DROP POLICY IF EXISTS "Public can view approved submissions" ON public.submissions;
CREATE POLICY "Public can view approved submissions" ON public.submissions FOR SELECT USING (status = 'aprovado' OR public.is_admin());

DROP POLICY IF EXISTS "Usuários autenticados podem inserir submissões" ON public.submissions;
CREATE POLICY "Usuários autenticados podem inserir submissões" 
    ON public.submissions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins manage submissions" ON public.submissions;
CREATE POLICY "Admins manage submissions" ON public.submissions USING (public.is_admin());

-- --- COMMENTS ---
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id),
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    status submission_status DEFAULT 'pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read all comments" ON public.comments;
CREATE POLICY "Anyone can read all comments" ON public.comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Qualquer um pode comentar" ON public.comments;
CREATE POLICY "Qualquer um pode comentar" ON public.comments FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins manage comments" ON public.comments;
CREATE POLICY "Admins manage comments" ON public.comments USING (public.is_admin());

-- --- REPRODUCTIONS ---
CREATE TABLE IF NOT EXISTS public.reproductions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    text_content TEXT,
    media_url TEXT,
    status submission_status DEFAULT 'pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.reproductions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read all reproductions" ON public.reproductions;
CREATE POLICY "Anyone can read all reproductions" ON public.reproductions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Usuários logados podem enviar reproduções" ON public.reproductions;
CREATE POLICY "Usuários logados podem enviar reproduções" ON public.reproductions FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins manage reproductions" ON public.reproductions;
CREATE POLICY "Admins manage reproductions" ON public.reproductions USING (public.is_admin());

-- --- TESTIMONIALS ---
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    status submission_status DEFAULT 'pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Testemunhos aprovados são públicos" ON public.testimonials;
CREATE POLICY "Testemunhos aprovados são públicos" ON public.testimonials FOR SELECT USING (status = 'aprovado' OR public.is_admin());
DROP POLICY IF EXISTS "Usuários logados podem enviar testemunhos" ON public.testimonials;
CREATE POLICY "Usuários logados podem enviar testemunhos" ON public.testimonials FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins manage testimonials" ON public.testimonials;
CREATE POLICY "Admins manage testimonials" ON public.testimonials USING (public.is_admin());

-- ==========================================================
-- 5. TRIGGER AUTOMÁTICO PARA PERFIS
-- ==========================================================
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
