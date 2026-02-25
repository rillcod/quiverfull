-- ============================================================
-- LMS Tables: courses, assignments, submissions, materials
-- Plus academic calendar events
-- ============================================================

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

-- ============================================================
-- Enable RLS
-- ============================================================
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS Policies
-- ============================================================

-- Courses
CREATE POLICY "Admins manage courses" ON courses FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "All authenticated read courses" ON courses FOR SELECT TO authenticated USING (true);

-- Assignments
CREATE POLICY "Admins manage assignments" ON assignments FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Teachers manage own assignments" ON assignments FOR ALL TO authenticated
  USING (is_teacher_or_admin()) WITH CHECK (is_teacher_or_admin());
CREATE POLICY "All authenticated read assignments" ON assignments FOR SELECT TO authenticated USING (true);

-- Submissions
CREATE POLICY "Admins manage submissions" ON submissions FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Students manage own submissions" ON submissions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM students s JOIN profiles p ON s.profile_id = p.id WHERE s.id = submissions.student_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM students s JOIN profiles p ON s.profile_id = p.id WHERE s.id = submissions.student_id AND p.user_id = auth.uid()));
CREATE POLICY "Teachers read all submissions" ON submissions FOR SELECT TO authenticated USING (is_teacher_or_admin());

-- Course Materials
CREATE POLICY "Admins manage materials" ON course_materials FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Teachers manage materials" ON course_materials FOR ALL TO authenticated USING (is_teacher_or_admin()) WITH CHECK (is_teacher_or_admin());
CREATE POLICY "All authenticated read materials" ON course_materials FOR SELECT TO authenticated USING (true);

-- Events
CREATE POLICY "Admins manage events" ON events FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "All authenticated read events" ON events FOR SELECT TO authenticated USING (true);

-- Seed some demo events
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

SELECT 'LMS and Events tables created!' AS status;
