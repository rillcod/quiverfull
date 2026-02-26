/*
  # Result Sheets Table
  Stores per-student per-term metadata for Nigerian-style report cards:
  - Teacher & principal comments
  - Affective/psychomotor domain ratings
  - Attendance summary
  - Next term details
  - Publication status
*/

-- Add address field to parents (needed by admin UI)
ALTER TABLE parents ADD COLUMN IF NOT EXISTS address text;

-- Result sheets table
CREATE TABLE IF NOT EXISTS result_sheets (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id        uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  term              text NOT NULL,
  academic_year     text NOT NULL,

  -- Remarks
  teacher_comment   text NOT NULL DEFAULT '',
  principal_comment text NOT NULL DEFAULT '',

  -- Affective / Psychomotor domain (1 = Poor … 5 = Excellent)
  punctuality       smallint DEFAULT 3 CHECK (punctuality BETWEEN 1 AND 5),
  neatness          smallint DEFAULT 3 CHECK (neatness BETWEEN 1 AND 5),
  honesty           smallint DEFAULT 3 CHECK (honesty BETWEEN 1 AND 5),
  cooperation       smallint DEFAULT 3 CHECK (cooperation BETWEEN 1 AND 5),
  attentiveness     smallint DEFAULT 3 CHECK (attentiveness BETWEEN 1 AND 5),
  politeness        smallint DEFAULT 3 CHECK (politeness BETWEEN 1 AND 5),

  -- Attendance (filled when result is generated)
  days_present      integer NOT NULL DEFAULT 0,
  days_absent       integer NOT NULL DEFAULT 0,
  total_school_days integer NOT NULL DEFAULT 0,

  -- Next term
  next_term_begins  date,
  next_term_fees    text NOT NULL DEFAULT '',

  -- Status
  is_published      boolean NOT NULL DEFAULT false,
  created_by        uuid REFERENCES profiles(id),
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now(),

  UNIQUE(student_id, term, academic_year)
);

ALTER TABLE result_sheets ENABLE ROW LEVEL SECURITY;

-- Admins and teachers can do everything
CREATE POLICY "Staff can manage result_sheets"
  ON result_sheets FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'teacher')
    )
  );

-- Parents can read their children's published sheets
CREATE POLICY "Parents can view published result_sheets"
  ON result_sheets FOR SELECT TO authenticated
  USING (
    is_published = true AND
    EXISTS (
      SELECT 1 FROM student_parents sp
      JOIN parents par ON sp.parent_id = par.id
      JOIN profiles pr ON par.profile_id = pr.id
      WHERE sp.student_id = result_sheets.student_id AND pr.user_id = auth.uid()
    )
  );

-- Students can view their own published sheets
CREATE POLICY "Students can view own published result_sheets"
  ON result_sheets FOR SELECT TO authenticated
  USING (
    is_published = true AND
    EXISTS (
      SELECT 1 FROM students s
      JOIN profiles pr ON s.profile_id = pr.id
      WHERE s.id = result_sheets.student_id AND pr.user_id = auth.uid()
    )
  );
