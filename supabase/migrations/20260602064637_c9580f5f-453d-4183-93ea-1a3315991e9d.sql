
-- ============================================================
-- 1) Drop overly-permissive public policies and recreate as authenticated-only
-- ============================================================

-- assignments
DROP POLICY IF EXISTS "Everyone can create assignments" ON public.assignments;
DROP POLICY IF EXISTS "Everyone can delete assignments" ON public.assignments;
DROP POLICY IF EXISTS "Everyone can update assignments" ON public.assignments;
DROP POLICY IF EXISTS "Everyone can view assignments" ON public.assignments;
CREATE POLICY "Authenticated can view assignments" ON public.assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert assignments" ON public.assignments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update assignments" ON public.assignments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete assignments" ON public.assignments FOR DELETE TO authenticated USING (true);

-- attendance
DROP POLICY IF EXISTS "Everyone can create attendance" ON public.attendance;
DROP POLICY IF EXISTS "Everyone can delete attendance" ON public.attendance;
DROP POLICY IF EXISTS "Everyone can update attendance" ON public.attendance;
DROP POLICY IF EXISTS "Everyone can view attendance" ON public.attendance;
CREATE POLICY "Authenticated can view attendance" ON public.attendance FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert attendance" ON public.attendance FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update attendance" ON public.attendance FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete attendance" ON public.attendance FOR DELETE TO authenticated USING (true);

-- finances
DROP POLICY IF EXISTS "Everyone can create finances" ON public.finances;
DROP POLICY IF EXISTS "Everyone can delete finances" ON public.finances;
DROP POLICY IF EXISTS "Everyone can update finances" ON public.finances;
DROP POLICY IF EXISTS "Everyone can view finances" ON public.finances;
CREATE POLICY "Authenticated can view finances" ON public.finances FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert finances" ON public.finances FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update finances" ON public.finances FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete finances" ON public.finances FOR DELETE TO authenticated USING (true);

-- people
DROP POLICY IF EXISTS "Everyone can create people" ON public.people;
DROP POLICY IF EXISTS "Everyone can delete people" ON public.people;
DROP POLICY IF EXISTS "Everyone can update people" ON public.people;
DROP POLICY IF EXISTS "Everyone can view people" ON public.people;
CREATE POLICY "Authenticated can view people" ON public.people FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert people" ON public.people FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update people" ON public.people FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete people" ON public.people FOR DELETE TO authenticated USING (true);

-- session_notes
DROP POLICY IF EXISTS "Everyone can create session_notes" ON public.session_notes;
DROP POLICY IF EXISTS "Everyone can delete session_notes" ON public.session_notes;
DROP POLICY IF EXISTS "Everyone can update session_notes" ON public.session_notes;
DROP POLICY IF EXISTS "Everyone can view session_notes" ON public.session_notes;
CREATE POLICY "Authenticated can view session_notes" ON public.session_notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert session_notes" ON public.session_notes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update session_notes" ON public.session_notes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete session_notes" ON public.session_notes FOR DELETE TO authenticated USING (true);

-- workshop_answers (was already authenticated-only via roles, but "Everyone" naming)
-- keep existing policies; no public role on these

-- Remove overriding public ALL policies
DROP POLICY IF EXISTS "allow_all_electronic_activities" ON public.electronic_activities;
DROP POLICY IF EXISTS "allow_all_electronic_responses" ON public.electronic_activity_responses;
DROP POLICY IF EXISTS "allow_all_supervisor_attendance" ON public.supervisor_attendance;
DROP POLICY IF EXISTS "allow_all_supervisors" ON public.supervisors;

-- Revoke broad public schema grants from anon
-- Keep app_settings selectable for maintenance-mode pre-login check (anon needs SELECT)
REVOKE ALL ON public.assignments FROM anon;
REVOKE ALL ON public.attendance FROM anon;
REVOKE ALL ON public.finances FROM anon;
REVOKE ALL ON public.people FROM anon;
REVOKE ALL ON public.session_notes FROM anon;
REVOKE ALL ON public.supervisors FROM anon;
REVOKE ALL ON public.supervisor_attendance FROM anon;
REVOKE ALL ON public.electronic_activities FROM anon;
REVOKE ALL ON public.electronic_activity_responses FROM anon;
REVOKE ALL ON public.lessons FROM anon;
REVOKE ALL ON public.workshop_answers FROM anon;
REVOKE ALL ON public.workshop_questions FROM anon;

-- Ensure authenticated has the privileges policies allow
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assignments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.finances TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.people TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.session_notes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.supervisors TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.supervisor_attendance TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.electronic_activities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.electronic_activity_responses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lessons TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workshop_answers TO authenticated;
GRANT SELECT ON public.workshop_questions TO authenticated;

-- ============================================================
-- 2) Storage: restrict avatars bucket write/update/delete to authenticated
-- ============================================================
DROP POLICY IF EXISTS "Anyone can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete avatars" ON storage.objects;
-- Keep public SELECT for avatar display

CREATE POLICY "Authenticated can upload avatars"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Authenticated can update avatars"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars')
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Authenticated can delete avatars"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars');

-- ============================================================
-- 3) Lock down direct execution of SECURITY DEFINER / trigger functions
--    (they remain usable inside RLS policies and triggers)
-- ============================================================
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM public, anon;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;
