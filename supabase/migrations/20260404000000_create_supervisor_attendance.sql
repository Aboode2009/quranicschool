-- جدول حضور المشرفين
CREATE TABLE IF NOT EXISTS supervisor_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  lesson_id text NOT NULL DEFAULT '',
  lesson_category text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE supervisor_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "allow_all_supervisor_attendance" ON supervisor_attendance
  FOR ALL USING (true) WITH CHECK (true);

-- عمود حضور المشرفين في مقررات الجلسة
ALTER TABLE session_notes ADD COLUMN IF NOT EXISTS supervisor_attendance_notes text NOT NULL DEFAULT '';
