ALTER TABLE public.session_notes
  ADD COLUMN lecture_name TEXT NOT NULL DEFAULT '',
  ADD COLUMN lecture_date DATE,
  ADD COLUMN workshop_name TEXT NOT NULL DEFAULT '',
  ADD COLUMN workshop_date DATE,
  ADD COLUMN workshop_notes TEXT NOT NULL DEFAULT '',
  ADD COLUMN resources TEXT NOT NULL DEFAULT '';