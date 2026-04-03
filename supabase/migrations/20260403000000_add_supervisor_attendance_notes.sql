ALTER TABLE session_notes ADD COLUMN IF NOT EXISTS supervisor_attendance_notes text NOT NULL DEFAULT '';
