/*
  # Subjects Table
  Manages subjects as first-class entities: name, code, class, teacher, term.
*/

CREATE TABLE IF NOT EXISTS subjects (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  code          text,
  class_id      uuid REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id    uuid REFERENCES profiles(id) ON DELETE SET NULL,
  term          text NOT NULL DEFAULT 'First Term',
  academic_year text NOT NULL DEFAULT '2024/2025',
  is_active     boolean DEFAULT true,
  created_at    timestamptz DEFAULT now(),
  UNIQUE(name, class_id, term, academic_year)
);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- Staff (admin + teacher) can manage subjects
CREATE POLICY "Staff manage subjects"
  ON subjects FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'teacher')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'teacher')
    )
  );

-- All authenticated users can read subjects
CREATE POLICY "All read subjects"
  ON subjects FOR SELECT TO authenticated
  USING (true);
