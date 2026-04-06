
-- جدول الفعاليات الإلكترونية
CREATE TABLE public.electronic_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  workshop_number TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.electronic_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view electronic_activities"
  ON public.electronic_activities FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can insert electronic_activities"
  ON public.electronic_activities FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update electronic_activities"
  ON public.electronic_activities FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated can delete electronic_activities"
  ON public.electronic_activities FOR DELETE TO authenticated USING (true);

-- جدول ردود التفاعل الإلكتروني
CREATE TABLE public.electronic_activity_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID NOT NULL REFERENCES public.electronic_activities(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(activity_id, person_id)
);

ALTER TABLE public.electronic_activity_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view electronic_activity_responses"
  ON public.electronic_activity_responses FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can insert electronic_activity_responses"
  ON public.electronic_activity_responses FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update electronic_activity_responses"
  ON public.electronic_activity_responses FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated can delete electronic_activity_responses"
  ON public.electronic_activity_responses FOR DELETE TO authenticated USING (true);
