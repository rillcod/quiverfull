-- Fix: infinite recursion in "Teachers can read all profiles" policy
-- The policy was querying the profiles table from within a profiles policy.
-- Solution: wrap the check in a SECURITY DEFINER function (same pattern as is_admin()).

CREATE OR REPLACE FUNCTION is_teacher_or_admin()
RETURNS boolean
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND role IN ('teacher', 'admin')
  );
$$;

-- Drop the recursive policy and recreate it using the safe function
DROP POLICY IF EXISTS "Teachers can read all profiles" ON profiles;

CREATE POLICY "Teachers can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_teacher_or_admin());
