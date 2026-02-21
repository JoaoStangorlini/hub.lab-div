-- SPRINT 5 MIGRATION: Comunidade, Gamificação e Gestão Centralizada

-- 1. Extensão de Tipos
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'submission_status') THEN
        CREATE TYPE submission_status AS ENUM ('pendente', 'aprovado', 'rejeitado');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_type') THEN
        CREATE TYPE media_type AS ENUM ('image', 'video', 'pdf', 'text', 'link');
    END IF;
END $$;

-- 2. Tabela de Perfis (Vinculada ao Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS no profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Perfis visíveis para todos" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Usuários editam o próprio perfil" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Trigger para criar perfil automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- OBS: O trigger deve ser criado manualmente no dashboard do Supabase apontando para auth.users
-- ou via SQL se tiver permissões:
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Atualização da Tabela de Submissões
-- Adicionar campos se não existirem
DO $$ 
BEGIN
    -- Atualizar enum media_type (ALTER TYPE ADD VALUE não pode estar em bloco DO em algumas versões, 
    -- mas podemos tentar ou usar comandos individuais)
    -- Para migrations no Supabase, é melhor rodar comandos individuais se possível.
    -- Mas como estamos dentro de um script, vamos garantir que a tabela aceite os novos valores.
    
    -- Se a tabela já existir e o enum for antigo, precisamos adicionar os valores.
    -- Nota: 'pdf', 'text', 'link' já estavam na tentativa anterior, mas vamos garantir todos.
    EXECUTE 'ALTER TYPE media_type ADD VALUE IF NOT EXISTS ''pdf''';
    EXECUTE 'ALTER TYPE media_type ADD VALUE IF NOT EXISTS ''text''';
    EXECUTE 'ALTER TYPE media_type ADD VALUE IF NOT EXISTS ''link''';
    EXECUTE 'ALTER TYPE media_type ADD VALUE IF NOT EXISTS ''zip''';
    EXECUTE 'ALTER TYPE media_type ADD VALUE IF NOT EXISTS ''sdocx''';
EXCEPTION
    WHEN others THEN NULL; -- Silencia erro se for rodado múltiplas vezes ou se falhar no ADD VALUE
END $$;

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
END $$;

-- 4. Tabela de Comentários (Garantir existência)
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id), -- Opcional, se o usuário estiver logado
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    status submission_status DEFAULT 'pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comentários aprovados são públicos" ON public.comments
    FOR SELECT USING (status = 'aprovado');

CREATE POLICY "Qualquer um pode comentar" ON public.comments
    FOR INSERT WITH CHECK (true);

-- 5. Hub de Comunidade: Reproduções e Testemunhos
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

CREATE POLICY "Reproduções aprovadas são públicas" ON public.reproductions
    FOR SELECT USING (status = 'aprovado');

CREATE POLICY "Usuários logados podem enviar reproduções" ON public.reproductions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    status submission_status DEFAULT 'pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Testemunhos aprovados são públicos" ON public.testimonials
    FOR SELECT USING (status = 'aprovado');

CREATE POLICY "Usuários logados podem enviar testemunhos" ON public.testimonials
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Gamificação: Selos
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    icon TEXT NOT NULL, -- Material Symbol name
    description TEXT
);

CREATE TABLE IF NOT EXISTS public.user_badges (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, badge_id)
);

-- Inserir selo inicial
INSERT INTO public.badges (name, icon, description) 
VALUES ('Pesquisador Sênior', 'elderly', 'Colaborador frequente com 3 ou mais publicações aprovadas.')
ON CONFLICT (name) DO NOTHING;

-- 7. Visão Geral para Admins (Políticas)
-- Garante que admins (perfil.role = 'admin') possam ver tudo
-- Nota: Usamos DROP e CREATE para evitar conflitos se rodar novamente
DROP POLICY IF EXISTS "Admins manage profiles" ON public.profiles;
CREATE POLICY "Admins manage profiles" ON public.profiles USING (auth.jwt() ->> 'role' = 'admin' OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "Admins manage submissions" ON public.submissions;
CREATE POLICY "Admins manage submissions" ON public.submissions USING (auth.jwt() ->> 'role' = 'admin' OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Nova política: Permitir que qualquer usuário logado envie submissões
DROP POLICY IF EXISTS "Usuários autenticados podem inserir submissões" ON public.submissions;
CREATE POLICY "Usuários autenticados podem inserir submissões" 
    ON public.submissions 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins manage comments" ON public.comments;
CREATE POLICY "Admins manage comments" ON public.comments USING (auth.jwt() ->> 'role' = 'admin' OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "Admins manage reproductions" ON public.reproductions;
CREATE POLICY "Admins manage reproductions" ON public.reproductions USING (auth.jwt() ->> 'role' = 'admin' OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "Admins manage testimonials" ON public.testimonials;
CREATE POLICY "Admins manage testimonials" ON public.testimonials USING (auth.jwt() ->> 'role' = 'admin' OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
