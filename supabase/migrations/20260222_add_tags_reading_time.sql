-- Migration: Add tags and reading_time columns to submissions table
-- tags: TEXT ARRAY (Postgres native array)
-- reading_time: INTEGER

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'submissions' AND column_name = 'tags'
    ) THEN
        ALTER TABLE public.submissions ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'submissions' AND column_name = 'reading_time'
    ) THEN
        ALTER TABLE public.submissions ADD COLUMN reading_time INTEGER DEFAULT 0;
    END IF;
END $$;
