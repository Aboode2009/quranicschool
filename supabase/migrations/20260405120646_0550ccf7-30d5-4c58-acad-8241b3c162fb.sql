-- Add missing foreign keys only (skip if exists)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'supervisor_attendance_lesson_id_fkey') THEN
    ALTER TABLE public.supervisor_attendance ADD CONSTRAINT supervisor_attendance_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'supervisor_attendance_supervisor_id_fkey') THEN
    ALTER TABLE public.supervisor_attendance ADD CONSTRAINT supervisor_attendance_supervisor_id_fkey FOREIGN KEY (supervisor_id) REFERENCES public.supervisors(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'workshop_answers_person_id_fkey') THEN
    ALTER TABLE public.workshop_answers ADD CONSTRAINT workshop_answers_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.people(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'workshop_answers_question_id_fkey') THEN
    ALTER TABLE public.workshop_answers ADD CONSTRAINT workshop_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.workshop_questions(id) ON DELETE CASCADE;
  END IF;
END $$;