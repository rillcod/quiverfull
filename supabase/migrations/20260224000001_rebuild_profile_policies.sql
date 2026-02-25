-- Drop ALL existing policies on profiles (catches any name variants)
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE tablename = 'profiles' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', pol.policyname);
  END LOOP;
END;
$$;

-- Safe helper functions using SECURITY DEFINER (bypass RLS inside the function)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION is_teacher_or_admin()
RETURNS boolean
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND role IN ('teacher', 'admin')
  );
$$;

-- Recreate all profiles policies (no subqueries inside — all use safe helper functions)

-- INSERT: users can create their own profile on sign-up
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- SELECT: each user can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- UPDATE: each user can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- ALL: admins can do everything (uses SECURITY DEFINER is_admin())
CREATE POLICY "Admins can manage all profiles"
  ON profiles FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- SELECT: teachers and admins can read any profile (uses SECURITY DEFINER function)
CREATE POLICY "Teachers can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_teacher_or_admin());
