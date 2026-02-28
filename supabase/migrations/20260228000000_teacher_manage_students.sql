-- Allow teachers to see unassigned students (so they can add them to their class)
CREATE POLICY "Teachers can read unassigned students"
  ON students FOR SELECT
  TO authenticated
  USING (
    class_id IS NULL AND
    EXISTS (
      SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'teacher'
    )
  );

-- Allow teachers to assign unassigned students to their own class
-- USING: student is currently unassigned OR already in teacher's class
-- WITH CHECK: after update, student must be in teacher's class
CREATE POLICY "Teachers can assign students to their class"
  ON students FOR UPDATE
  TO authenticated
  USING (
    class_id IS NULL OR
    EXISTS (
      SELECT 1 FROM classes c
      JOIN profiles p ON c.teacher_id = p.id
      WHERE c.id = students.class_id AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM classes c
      JOIN profiles p ON c.teacher_id = p.id
      WHERE c.id = students.class_id AND p.user_id = auth.uid()
    )
  );

-- Bulk promote students from one class to another (admin only)
CREATE OR REPLACE FUNCTION promote_students(
  p_from_class_id uuid,
  p_to_class_id uuid,
  p_student_ids uuid[] DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected integer;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can promote students';
  END IF;

  IF p_student_ids IS NULL THEN
    UPDATE students
    SET class_id = p_to_class_id
    WHERE class_id = p_from_class_id AND is_active = true;
  ELSE
    UPDATE students
    SET class_id = p_to_class_id
    WHERE id = ANY(p_student_ids)
      AND class_id = p_from_class_id
      AND is_active = true;
  END IF;

  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;
