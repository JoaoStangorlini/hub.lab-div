-- Migration: Add co_authors column to submissions table
-- This column will store an array of objects representing co-authors (id, full_name, email)

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'submissions' AND column_name = 'co_authors'
    ) THEN
        ALTER TABLE public.submissions ADD COLUMN co_authors JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Update RLS if necessary (usually standard columns are handled by existing policies)
-- But let's ensure the policies also allow this column in SELECT
-- Approved submissions are viewable by everyone, so they'll see co_authors too.
