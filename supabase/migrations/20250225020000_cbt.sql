/*
  # CBT (Computer-Based Testing) Tables

  Tables:
    cbt_exams      – exam metadata (title, class, duration, schedule)
    cbt_questions  – MCQ questions with 4 options and correct answer
    cbt_sessions   – per-student exam attempt (score, timing)
    cbt_answers    – per-question answer selected by student
*/

-- ─── TABLES (all created before policies) ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS cbt_exams (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title            text NOT NULL,
  subject          text NOT NULL,
  class_id         uuid REFERENCES classes(id) ON DELETE SET NULL,
  duration_minutes integer NOT NULL DEFAULT 30 CHECK (duration_minutes > 0),
  total_marks      integer NOT NULL DEFAULT 0,
  start_time       timestamptz,
  end_time         timestamptz,
  term             text NOT NULL DEFAULT 'First Term',
  academic_year    text NOT NULL DEFAULT '2024/2025',
  instructions     text NOT NULL DEFAULT '',
  is_published     boolean NOT NULL DEFAULT false,
  created_by       uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cbt_questions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id         uuid NOT NULL REFERENCES cbt_exams(id) ON DELETE CASCADE,
  question_text   text NOT NULL,
  option_a        text NOT NULL DEFAULT '',
  option_b        text NOT NULL DEFAULT '',
  option_c        text NOT NULL DEFAULT '',
  option_d        text NOT NULL DEFAULT '',
  correct_option  text NOT NULL CHECK (correct_option IN ('a', 'b', 'c', 'd')),
  marks           integer NOT NULL DEFAULT 1 CHECK (marks > 0),
  order_index     integer NOT NULL DEFAULT 0,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cbt_sessions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id       uuid NOT NULL REFERENCES cbt_exams(id) ON DELETE CASCADE,
  student_id    uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  started_at    timestamptz DEFAULT now(),
  submitted_at  timestamptz,
  total_score   integer NOT NULL DEFAULT 0,
  is_submitted  boolean NOT NULL DEFAULT false,
  created_at    timestamptz DEFAULT now(),
  UNIQUE(exam_id, student_id)
);

CREATE TABLE IF NOT EXISTS cbt_answers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      uuid NOT NULL REFERENCES cbt_sessions(id) ON DELETE CASCADE,
  question_id     uuid NOT NULL REFERENCES cbt_questions(id) ON DELETE CASCADE,
  selected_option text CHECK (selected_option IN ('a', 'b', 'c', 'd')),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  UNIQUE(session_id, question_id)
);

-- ─── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE cbt_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE cbt_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cbt_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cbt_answers ENABLE ROW LEVEL SECURITY;

-- cbt_exams policies
CREATE POLICY "Staff can manage cbt_exams"
  ON cbt_exams FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'teacher'))
  );

CREATE POLICY "Students can view published cbt_exams for their class"
  ON cbt_exams FOR SELECT TO authenticated
  USING (
    is_published = true AND
    EXISTS (
      SELECT 1 FROM students s
      JOIN profiles pr ON s.profile_id = pr.id
      WHERE s.class_id = cbt_exams.class_id AND pr.user_id = auth.uid()
    )
  );

-- cbt_questions policies (cbt_sessions now exists)
CREATE POLICY "Staff can manage cbt_questions"
  ON cbt_questions FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'teacher'))
  );

CREATE POLICY "Students can read questions for their active session"
  ON cbt_questions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cbt_sessions cs
      JOIN students s ON cs.student_id = s.id
      JOIN profiles pr ON s.profile_id = pr.id
      WHERE cs.exam_id = cbt_questions.exam_id
        AND pr.user_id = auth.uid()
        AND cs.is_submitted = false
    )
  );

-- cbt_sessions policies
CREATE POLICY "Staff can view all cbt_sessions"
  ON cbt_sessions FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'teacher'))
  );

CREATE POLICY "Students can manage own cbt_sessions"
  ON cbt_sessions FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN profiles pr ON s.profile_id = pr.id
      WHERE s.id = cbt_sessions.student_id AND pr.user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can view children cbt_sessions"
  ON cbt_sessions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_parents sp
      JOIN parents par ON sp.parent_id = par.id
      JOIN profiles pr ON par.profile_id = pr.id
      WHERE sp.student_id = cbt_sessions.student_id AND pr.user_id = auth.uid()
    )
  );

-- cbt_answers policies
CREATE POLICY "Staff can view all cbt_answers"
  ON cbt_answers FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'teacher'))
  );

CREATE POLICY "Students can manage own cbt_answers"
  ON cbt_answers FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cbt_sessions cs
      JOIN students s ON cs.student_id = s.id
      JOIN profiles pr ON s.profile_id = pr.id
      WHERE cs.id = cbt_answers.session_id AND pr.user_id = auth.uid()
    )
  );
