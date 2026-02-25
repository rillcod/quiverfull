-- Allow teachers to insert, update, delete events (admins already can via "Admins manage events")
-- Idempotent: drop if exists to avoid duplicate policy errors
DROP POLICY IF EXISTS "Teachers can insert events" ON events;
DROP POLICY IF EXISTS "Teachers can update events" ON events;
DROP POLICY IF EXISTS "Teachers can delete events" ON events;

CREATE POLICY "Teachers can insert events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (is_teacher_or_admin());

CREATE POLICY "Teachers can update events"
  ON events FOR UPDATE
  TO authenticated
  USING (is_teacher_or_admin())
  WITH CHECK (is_teacher_or_admin());

CREATE POLICY "Teachers can delete events"
  ON events FOR DELETE
  TO authenticated
  USING (is_teacher_or_admin());
