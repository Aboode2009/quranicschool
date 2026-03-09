
CREATE TABLE public.finances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'income',
  amount NUMERIC NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.finances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view finances" ON public.finances FOR SELECT USING (true);
CREATE POLICY "Everyone can create finances" ON public.finances FOR INSERT WITH CHECK (true);
CREATE POLICY "Everyone can update finances" ON public.finances FOR UPDATE USING (true);
CREATE POLICY "Everyone can delete finances" ON public.finances FOR DELETE USING (true);
