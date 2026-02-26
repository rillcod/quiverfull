-- ============================================================
-- Missing migrations: LMS tables + School Settings
-- Safe to run: uses CREATE TABLE IF NOT EXISTS
-- ============================================================

-- ─── LMS Tables ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE,
  subject text NOT NULL,
  title text NOT NULL,
  description text,
  teacher_id uuid REFERENCES profiles(id),
  term text NOT NULL DEFAULT 'First Term',
  academic_year text NOT NULL DEFAULT '2024/2025',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  due_date timestamptz,
  max_score decimal(5,2) DEFAULT 100,
  type text DEFAULT 'homework' CHECK (type IN ('homework', 'quiz', 'exam', 'project', 'classwork')),
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid REFERENCES assignments(id) ON DELETE CASCADE,
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  content text,
  file_url text,
  score decimal(5,2),
  feedback text,
  submitted_at timestamptz DEFAULT now(),
  graded_at timestamptz,
  graded_by uuid REFERENCES profiles(id),
  status text DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'returned', 'late')),
  UNIQUE(assignment_id, student_id)
);

CREATE TABLE IF NOT EXISTS course_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  type text DEFAULT 'document' CHECK (type IN ('document', 'video', 'link', 'image')),
  url text,
  description text,
  uploaded_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date,
  event_type text DEFAULT 'general' CHECK (event_type IN ('holiday', 'exam', 'meeting', 'sports', 'cultural', 'general')),
  target_audience text[] DEFAULT ARRAY['all'],
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Courses policies
DROP POLICY IF EXISTS "Admins manage courses" ON courses;
DROP POLICY IF EXISTS "All authenticated read courses" ON courses;
CREATE POLICY "Admins manage courses" ON courses FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "All authenticated read courses" ON courses FOR SELECT TO authenticated USING (true);

-- Assignments policies
DROP POLICY IF EXISTS "Admins manage assignments" ON assignments;
DROP POLICY IF EXISTS "Teachers manage own assignments" ON assignments;
DROP POLICY IF EXISTS "All authenticated read assignments" ON assignments;
CREATE POLICY "Admins manage assignments" ON assignments FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Teachers manage own assignments" ON assignments FOR ALL TO authenticated USING (is_teacher_or_admin()) WITH CHECK (is_teacher_or_admin());
CREATE POLICY "All authenticated read assignments" ON assignments FOR SELECT TO authenticated USING (true);

-- Submissions policies
DROP POLICY IF EXISTS "Admins manage submissions" ON submissions;
DROP POLICY IF EXISTS "Students manage own submissions" ON submissions;
DROP POLICY IF EXISTS "Teachers read all submissions" ON submissions;
CREATE POLICY "Admins manage submissions" ON submissions FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Students manage own submissions" ON submissions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM students s JOIN profiles p ON s.profile_id = p.id WHERE s.id = submissions.student_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM students s JOIN profiles p ON s.profile_id = p.id WHERE s.id = submissions.student_id AND p.user_id = auth.uid()));
CREATE POLICY "Teachers read all submissions" ON submissions FOR SELECT TO authenticated USING (is_teacher_or_admin());

-- Course Materials policies
DROP POLICY IF EXISTS "Admins manage materials" ON course_materials;
DROP POLICY IF EXISTS "Teachers manage materials" ON course_materials;
DROP POLICY IF EXISTS "All authenticated read materials" ON course_materials;
CREATE POLICY "Admins manage materials" ON course_materials FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Teachers manage materials" ON course_materials FOR ALL TO authenticated USING (is_teacher_or_admin()) WITH CHECK (is_teacher_or_admin());
CREATE POLICY "All authenticated read materials" ON course_materials FOR SELECT TO authenticated USING (true);

-- Events policies
DROP POLICY IF EXISTS "Admins manage events" ON events;
DROP POLICY IF EXISTS "All authenticated read events" ON events;
DROP POLICY IF EXISTS "Teachers can insert events" ON events;
DROP POLICY IF EXISTS "Teachers can update events" ON events;
DROP POLICY IF EXISTS "Teachers can delete events" ON events;
CREATE POLICY "Admins manage events" ON events FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "All authenticated read events" ON events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Teachers can insert events" ON events FOR INSERT TO authenticated WITH CHECK (is_teacher_or_admin());
CREATE POLICY "Teachers can update events" ON events FOR UPDATE TO authenticated USING (is_teacher_or_admin()) WITH CHECK (is_teacher_or_admin());
CREATE POLICY "Teachers can delete events" ON events FOR DELETE TO authenticated USING (is_teacher_or_admin());

-- Seed demo academic calendar events
INSERT INTO events (title, description, start_date, end_date, event_type) VALUES
  ('First Term Begins', 'Start of First Academic Term 2024/2025', '2024-09-09', '2024-09-09', 'general'),
  ('Mid-Term Break', 'Mid-term holiday break', '2024-10-14', '2024-10-18', 'holiday'),
  ('First Term Exams', 'End of First Term Examinations', '2024-11-25', '2024-12-06', 'exam'),
  ('Christmas Break', 'Christmas and New Year Holiday', '2024-12-13', '2025-01-05', 'holiday'),
  ('Second Term Begins', 'Start of Second Academic Term', '2025-01-06', '2025-01-06', 'general'),
  ('Inter-House Sports', 'Annual Inter-House Sports Competition', '2025-02-14', '2025-02-14', 'sports'),
  ('Parent-Teacher Meeting', 'First Term Progress Report Meeting', '2025-02-28', '2025-02-28', 'meeting'),
  ('Cultural Day', 'Annual Cultural Day Celebration', '2025-03-15', '2025-03-15', 'cultural'),
  ('Second Term Exams', 'End of Second Term Examinations', '2025-03-24', '2025-04-04', 'exam'),
  ('Easter Break', 'Easter Holiday', '2025-04-11', '2025-04-25', 'holiday'),
  ('Third Term Begins', 'Start of Third Academic Term', '2025-04-28', '2025-04-28', 'general'),
  ('Graduation Ceremony', 'Basic 6 Graduation Day', '2025-07-04', '2025-07-04', 'cultural'),
  ('Third Term Exams', 'End of Year Examinations', '2025-06-16', '2025-06-27', 'exam'),
  ('Long Vacation', 'Annual Long Vacation', '2025-07-11', '2025-09-07', 'holiday')
ON CONFLICT DO NOTHING;

-- ─── School Settings Table ────────────────────────────────────

CREATE TABLE IF NOT EXISTS school_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE school_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage school_settings" ON school_settings;
DROP POLICY IF EXISTS "All authenticated read school_settings" ON school_settings;

CREATE POLICY "Admins manage school_settings"
  ON school_settings FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "All authenticated read school_settings"
  ON school_settings FOR SELECT TO authenticated USING (true);

INSERT INTO school_settings (key, value) VALUES
  ('school_name', '"The Quiverfull School"'),
  ('current_academic_year', '"2024/2025"'),
  ('terms', '["First Term", "Second Term", "Third Term"]'),
  ('currency', '"₦"'),
  ('currency_code', '"NGN"'),
  ('address', '""'),
  ('phone', '""'),
  ('email', '""')
ON CONFLICT (key) DO NOTHING;

DROP TRIGGER IF EXISTS set_school_settings_updated_at ON school_settings;
CREATE OR REPLACE FUNCTION update_school_settings_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER set_school_settings_updated_at
  BEFORE UPDATE ON school_settings
  FOR EACH ROW EXECUTE FUNCTION update_school_settings_updated_at();

SELECT 'Done: 7 missing tables created (courses, assignments, submissions, course_materials, events, school_settings)' AS status;
