CREATE TABLE public.session_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL DEFAULT '',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.session_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view session_notes" ON public.session_notes FOR SELECT USING (true);
CREATE POLICY "Everyone can create session_notes" ON public.session_notes FOR INSERT WITH CHECK (true);
CREATE POLICY "Everyone can update session_notes" ON public.session_notes FOR UPDATE USING (true);
CREATE POLICY "Everyone can delete session_notes" ON public.session_notes FOR DELETE USING (true);