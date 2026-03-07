-- Create enum for trail progress status
DO $$ BEGIN
    CREATE TYPE trail_status AS ENUM ('cursando', 'concluida');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add status column to user_trail_progress
ALTER TABLE public.user_trail_progress 
ADD COLUMN IF NOT EXISTS status trail_status;

-- Update RLS for user_trail_progress if not already set robustly
-- (Assuming standard profile-based RLS is active)

-- Optimization index for the horizontal feed
CREATE INDEX IF NOT EXISTS idx_user_trail_progress_status ON public.user_trail_progress (user_id, status);

-- RPC for toggling progress (To avoid complex client-side logic)
CREATE OR REPLACE FUNCTION toggle_trail_status(p_trail_id UUID, p_status trail_status)
RETURNS VOID AS $$
DECLARE
    v_user_id UUID := auth.uid();
BEGIN
    INSERT INTO public.user_trail_progress (user_id, trail_id, status, updated_at)
    VALUES (v_user_id, p_trail_id, p_status, now())
    ON CONFLICT (user_id, trail_id) 
    DO UPDATE SET 
        status = CASE 
            WHEN user_trail_progress.status = p_status THEN NULL 
            ELSE p_status 
        END,
        updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
