-- SECURITY DEFINER RPC: lets a teacher assign any student to one of their own classes.
-- This bypasses the row-level USING/WITH-CHECK so the teacher doesn't need the student
-- to already be unassigned — admin may have initially placed a student in the wrong class.
CREATE OR REPLACE FUNCTION teacher_assign_student(
  p_student_id  uuid,
  p_class_id    uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id uuid;
BEGIN
  SELECT id INTO v_profile_id FROM profiles WHERE user_id = auth.uid();

  -- Caller must be a teacher AND must own the target class
  IF NOT EXISTS (
    SELECT 1 FROM classes
    WHERE id = p_class_id AND teacher_id = v_profile_id
  ) THEN
    RAISE EXCEPTION 'You can only assign students to your own class';
  END IF;

  UPDATE students SET class_id = p_class_id WHERE id = p_student_id;
END;
$$;

-- Also allow teachers to read ALL active students (so they can pick from the full list)
DROP POLICY IF EXISTS "Teachers can read unassigned students" ON students;

CREATE POLICY "Teachers can read all active students"
  ON students FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'teacher'
    )
  );
