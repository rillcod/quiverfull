-- Update promote_students to also allow class teachers (not only admins)
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
  v_profile_id uuid;
BEGIN
  SELECT id INTO v_profile_id FROM profiles WHERE user_id = auth.uid();

  -- Must be admin OR the teacher assigned to the from_class
  IF NOT (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM classes
      WHERE id = p_from_class_id AND teacher_id = v_profile_id
    )
  ) THEN
    RAISE EXCEPTION 'You can only promote students from your own class';
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
