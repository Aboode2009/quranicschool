
-- Add read_material_status column (replaces boolean read_material logic)
-- Values: 'yes', 'no', 'incomplete'
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS read_material_status text DEFAULT NULL;

-- Add extracted_verse column
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS extracted_verse boolean DEFAULT false;

-- Create workshop_questions table for admin-defined custom questions
CREATE TABLE IF NOT EXISTS public.workshop_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.workshop_questions ENABLE ROW LEVEL SECURITY;

-- Everyone can read questions
CREATE POLICY "Everyone can view workshop_questions"
ON public.workshop_questions FOR SELECT
TO authenticated
USING (true);

-- Only admins can manage questions
CREATE POLICY "Admins can insert workshop_questions"
ON public.workshop_questions FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update workshop_questions"
ON public.workshop_questions FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete workshop_questions"
ON public.workshop_questions FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create workshop_answers table for storing answers to custom questions
CREATE TABLE IF NOT EXISTS public.workshop_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id uuid NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  lesson_name text NOT NULL,
  question_id uuid NOT NULL REFERENCES public.workshop_questions(id) ON DELETE CASCADE,
  answer text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.workshop_answers ENABLE ROW LEVEL SECURITY;

-- Same RLS as attendance
CREATE POLICY "Everyone can view workshop_answers"
ON public.workshop_answers FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Everyone can insert workshop_answers"
ON public.workshop_answers FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Everyone can update workshop_answers"
ON public.workshop_answers FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Everyone can delete workshop_answers"
ON public.workshop_answers FOR DELETE
TO authenticated
USING (true);
