
-- Create lessons table to replace localStorage
CREATE TABLE IF NOT EXISTS public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  surah_name text NOT NULL DEFAULT '',
  from_ayah int NOT NULL DEFAULT 0,
  to_ayah int NOT NULL DEFAULT 0,
  notes text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  lesson_date date NOT NULL DEFAULT CURRENT_DATE,
  category text NOT NULL DEFAULT 'muhadera', -- 'muhadera' or 'warasha'
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can view
CREATE POLICY "Everyone can view lessons"
ON public.lessons FOR SELECT
TO authenticated
USING (true);

-- Authenticated users can insert
CREATE POLICY "Authenticated can insert lessons"
ON public.lessons FOR INSERT
TO authenticated
WITH CHECK (true);

-- Authenticated users can update
CREATE POLICY "Authenticated can update lessons"
ON public.lessons FOR UPDATE
TO authenticated
USING (true);

-- Authenticated users can delete
CREATE POLICY "Authenticated can delete lessons"
ON public.lessons FOR DELETE
TO authenticated
USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.lessons;
