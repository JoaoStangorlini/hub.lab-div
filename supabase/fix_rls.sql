-- SCRIPT PARA CORRIGIR O LOOP INFINITO (ERRO 42P17) DE RLS
-- Execute este script no SQL Editor do seu Dashboard Supabase

-- 1. Cria uma função segura (que ignora o RLS temporalmente) para checar se o usuário é admin
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

-- 2. Recria as políticas usando a função segura em vez de uma query direta que causava o loop infinito

DROP POLICY IF EXISTS "Admins manage profiles" ON public.profiles;
CREATE POLICY "Admins manage profiles" ON public.profiles USING (public.is_admin());

DROP POLICY IF EXISTS "Admins manage submissions" ON public.submissions;
CREATE POLICY "Admins manage submissions" ON public.submissions USING (public.is_admin());

DROP POLICY IF EXISTS "Admins manage comments" ON public.comments;
CREATE POLICY "Admins manage comments" ON public.comments USING (public.is_admin());

DROP POLICY IF EXISTS "Admins manage reproductions" ON public.reproductions;
CREATE POLICY "Admins manage reproductions" ON public.reproductions USING (public.is_admin());

DROP POLICY IF EXISTS "Admins manage testimonials" ON public.testimonials;
CREATE POLICY "Admins manage testimonials" ON public.testimonials USING (public.is_admin());

-- 3. Criar o trigger que gera perfis automaticamente quando alguém faz login (se não existir)
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

-- 4. Backfill: criar perfis para todos os usuários que já existem no auth.users mas não têm perfil
INSERT INTO public.profiles (id, email, full_name, avatar_url)
SELECT id, email, raw_user_meta_data->>'full_name', raw_user_meta_data->>'avatar_url'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 5. Adicionar políticas de UPDATE e DELETE para comentários e reproduções
-- (Necessário para que o admin possa aprovar/rejeitar/excluir)

-- Comments: permitir update e delete
DROP POLICY IF EXISTS "Anyone can update comments" ON public.comments;
CREATE POLICY "Anyone can update comments" ON public.comments
    FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can delete comments" ON public.comments;
CREATE POLICY "Anyone can delete comments" ON public.comments
    FOR DELETE USING (true);

-- Reproductions: permitir update e delete
DROP POLICY IF EXISTS "Anyone can update reproductions" ON public.reproductions;
CREATE POLICY "Anyone can update reproductions" ON public.reproductions
    FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can delete reproductions" ON public.reproductions;
CREATE POLICY "Anyone can delete reproductions" ON public.reproductions
    FOR DELETE USING (true);

-- Broadened SELECT: admin needs to see ALL statuses (not just aprovado)
DROP POLICY IF EXISTS "Comentários aprovados são públicos" ON public.comments;
CREATE POLICY "Anyone can read all comments" ON public.comments
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Reproduções aprovadas são públicas" ON public.reproductions;
CREATE POLICY "Anyone can read all reproductions" ON public.reproductions
    FOR SELECT USING (true);
