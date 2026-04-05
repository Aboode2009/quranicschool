-- أعمدة جديدة لجدول people
ALTER TABLE people ADD COLUMN IF NOT EXISTS mosque_name text;
ALTER TABLE people ADD COLUMN IF NOT EXISTS job text;
ALTER TABLE people ADD COLUMN IF NOT EXISTS has_children boolean;
ALTER TABLE people ADD COLUMN IF NOT EXISTS family_in_courses text;
ALTER TABLE people ADD COLUMN IF NOT EXISTS skills text;

-- جدول أسماء المشرفين
CREATE TABLE IF NOT EXISTS supervisors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE supervisors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_supervisors" ON supervisors FOR ALL USING (true) WITH CHECK (true);

-- جدول حضور المشرفين
CREATE TABLE IF NOT EXISTS supervisor_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supervisor_id uuid NOT NULL REFERENCES supervisors(id) ON DELETE CASCADE,
  lesson_id text NOT NULL,
  lesson_category text NOT NULL DEFAULT 'muhadera',
  is_present boolean NOT NULL DEFAULT false,
  excuse text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(supervisor_id, lesson_id)
);
ALTER TABLE supervisor_attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_supervisor_attendance" ON supervisor_attendance FOR ALL USING (true) WITH CHECK (true);

-- عمود مقررات الجلسة
ALTER TABLE session_notes ADD COLUMN IF NOT EXISTS supervisor_attendance_notes text NOT NULL DEFAULT '';
