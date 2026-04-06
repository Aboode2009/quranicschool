-- جدول فعاليات التفاعل الإلكتروني
CREATE TABLE IF NOT EXISTS electronic_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  date date NOT NULL,
  workshop_number text NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE electronic_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_electronic_activities" ON electronic_activities
  FOR ALL USING (true) WITH CHECK (true);

-- جدول تفاعل الطلاب بالفعاليات
CREATE TABLE IF NOT EXISTS electronic_activity_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL REFERENCES electronic_activities(id) ON DELETE CASCADE,
  person_id uuid NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(activity_id, person_id)
);

ALTER TABLE electronic_activity_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_electronic_responses" ON electronic_activity_responses
  FOR ALL USING (true) WITH CHECK (true);
