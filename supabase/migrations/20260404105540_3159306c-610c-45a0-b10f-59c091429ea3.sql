
-- Create supervisors table
CREATE TABLE public.supervisors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.supervisors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view supervisors" ON public.supervisors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert supervisors" ON public.supervisors FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update supervisors" ON public.supervisors FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete supervisors" ON public.supervisors FOR DELETE TO authenticated USING (true);

-- Add missing columns to supervisor_attendance
ALTER TABLE public.supervisor_attendance
  ADD COLUMN IF NOT EXISTS supervisor_id UUID REFERENCES public.supervisors(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS is_present BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS excuse TEXT;

-- Add update policy that was missing
CREATE POLICY "Authenticated can update supervisor_attendance" ON public.supervisor_attendance FOR UPDATE TO authenticated USING (true);
