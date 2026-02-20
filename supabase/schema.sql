-- Create custom types for enum values
CREATE TYPE submission_status AS ENUM ('pendente', 'aprovado', 'rejeitado');
CREATE TYPE submission_type AS ENUM ('image', 'video');

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
  featured boolean DEFAULT false
);

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
