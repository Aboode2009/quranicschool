
CREATE TABLE public.supervisor_attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  lesson_category TEXT NOT NULL DEFAULT 'muhadera',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.supervisor_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view supervisor_attendance"
  ON public.supervisor_attendance FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated can insert supervisor_attendance"
  ON public.supervisor_attendance FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can delete supervisor_attendance"
  ON public.supervisor_attendance FOR DELETE
  TO authenticated USING (true);
