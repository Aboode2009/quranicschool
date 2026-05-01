-- 1) Clean duplicate attendance rows for same person/lesson/date,
--    preferring "present" over "absent" so we don't lose accurate attendance.
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY person_id, lesson_name, lesson_date
           ORDER BY is_present DESC, updated_at DESC, created_at DESC
         ) AS rn
  FROM public.attendance
)
DELETE FROM public.attendance a
USING ranked r
WHERE a.id = r.id AND r.rn > 1;

-- 2) Ensure unique constraint exists on attendance (defensive).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'attendance_person_id_lesson_name_lesson_date_key'
  ) THEN
    ALTER TABLE public.attendance
      ADD CONSTRAINT attendance_person_id_lesson_name_lesson_date_key
      UNIQUE (person_id, lesson_name, lesson_date);
  END IF;
END $$;

-- 3) Clean duplicate workshop_answers for same person/lesson/question.
WITH ranked_a AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY person_id, lesson_name, question_id
           ORDER BY created_at DESC
         ) AS rn
  FROM public.workshop_answers
)
DELETE FROM public.workshop_answers w
USING ranked_a r
WHERE w.id = r.id AND r.rn > 1;

-- 4) Add unique constraint to workshop_answers to prevent future duplicates.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'workshop_answers_person_lesson_question_key'
  ) THEN
    ALTER TABLE public.workshop_answers
      ADD CONSTRAINT workshop_answers_person_lesson_question_key
      UNIQUE (person_id, lesson_name, question_id);
  END IF;
END $$;