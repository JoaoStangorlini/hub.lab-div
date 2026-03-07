-- Migration: Add quiz column to submissions and track responses
-- Created: 2026-03-06

-- 1. Add quiz column
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS quiz JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.submissions.quiz IS 'Mini quiz for the post. Array of objects {id, question, options[], correct_option}';

-- 2. Create tracking table for responses
CREATE TABLE IF NOT EXISTS public.submission_quiz_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    score INTEGER NOT NULL DEFAULT 0,
    xp_awarded INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, submission_id)
);

-- 3. Enable RLS
ALTER TABLE public.submission_quiz_responses ENABLE ROW LEVEL SECURITY;

-- 4. Policies
DROP POLICY IF EXISTS "Users can view own quiz responses" ON public.submission_quiz_responses;
CREATE POLICY "Users can view own quiz responses" ON public.submission_quiz_responses
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own quiz responses" ON public.submission_quiz_responses;
CREATE POLICY "Users can insert own quiz responses" ON public.submission_quiz_responses
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 5. Index for performance
CREATE INDEX IF NOT EXISTS idx_quiz_responses_submission ON public.submission_quiz_responses(submission_id);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_user ON public.submission_quiz_responses(user_id);
