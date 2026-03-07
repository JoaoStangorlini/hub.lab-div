-- Protocolo Síncrotron v3: Persistent Tracker
-- Tabela para armazenar quais trilhas (disciplinas) o usuário já concluiu de fato.

CREATE TABLE IF NOT EXISTS public.user_completed_trails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    trail_id UUID NOT NULL REFERENCES public.learning_trails(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, trail_id)
);

-- Ativar RLS
ALTER TABLE public.user_completed_trails ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança
DROP POLICY IF EXISTS "Users can manage their own completed trails" ON public.user_completed_trails;
CREATE POLICY "Users can manage their own completed trails"
ON public.user_completed_trails
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Função RPC para Toggle Atômico
-- Retorna TRUE se agora está concluída, FALSE se foi removida.
CREATE OR REPLACE FUNCTION public.toggle_trail_completion(field_trail_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_exists BOOLEAN;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Não autenticado';
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM public.user_completed_trails 
        WHERE user_id = v_user_id AND trail_id = field_trail_id
    ) INTO v_exists;

    IF v_exists THEN
        DELETE FROM public.user_completed_trails 
        WHERE user_id = v_user_id AND trail_id = field_trail_id;
        RETURN FALSE;
    ELSE
        INSERT INTO public.user_completed_trails (user_id, trail_id)
        VALUES (v_user_id, field_trail_id);
        RETURN TRUE;
    END IF;
END;
$$;
