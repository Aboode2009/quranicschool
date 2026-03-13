
ALTER TABLE public.session_notes 
  ADD COLUMN IF NOT EXISTS assignments_notes text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS recitation_notes text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS activities_notes text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS financial_notes text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS logistics_notes text NOT NULL DEFAULT '';
