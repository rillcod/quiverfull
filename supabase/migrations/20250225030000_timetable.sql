/*
  # Timetable Table
  Weekly class schedule per term/academic year.
*/

CREATE TABLE IF NOT EXISTS timetable (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id      uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  day_of_week   text NOT NULL CHECK (day_of_week IN ('Monday','Tuesday','Wednesday','Thursday','Friday')),
  period        integer NOT NULL CHECK (period >= 1 AND period <= 12),
  subject       text NOT NULL,
  teacher_id    uuid REFERENCES teachers(id) ON DELETE SET NULL,
  start_time    time NOT NULL,
  end_time      time NOT NULL,
  term          text NOT NULL DEFAULT 'First Term',
  academic_year text NOT NULL DEFAULT '2024/2025',
  created_at    timestamptz DEFAULT now(),
  UNIQUE(class_id, day_of_week, period, term, academic_year)
);

ALTER TABLE timetable ENABLE ROW LEVEL SECURITY;

-- Staff full access
CREATE POLICY "Staff can manage timetable"
  ON timetable FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'teacher'))
  );

-- Students can view their own class timetable
CREATE POLICY "Students can view own class timetable"
  ON timetable FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN profiles pr ON s.profile_id = pr.id
      WHERE s.class_id = timetable.class_id AND pr.user_id = auth.uid()
    )
  );

-- Parents can view their children's timetable
CREATE POLICY "Parents can view children timetable"
  ON timetable FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_parents sp
      JOIN parents par ON sp.parent_id = par.id
      JOIN profiles pr ON par.profile_id = pr.id
      JOIN students s ON sp.student_id = s.id
      WHERE s.class_id = timetable.class_id AND pr.user_id = auth.uid()
    )
  );
