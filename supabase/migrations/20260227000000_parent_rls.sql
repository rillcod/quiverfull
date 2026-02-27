-- ── Parent-level RLS policies for grades, fees, health_records, parents, student_parents ──

-- Helper: check if current user is a parent of a given student
CREATE OR REPLACE FUNCTION public.is_parent_of(target_student_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM student_parents sp
    JOIN parents p ON sp.parent_id = p.id
    JOIN profiles pr ON p.profile_id = pr.id
    WHERE sp.student_id = target_student_id
      AND pr.user_id = auth.uid()
  );
$$;

-- ── GRADES ──────────────────────────────────────────────────────────────
-- Admins manage all grades
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='grades' AND policyname='Admins manage grades'
  ) THEN
    CREATE POLICY "Admins manage grades" ON grades
      FOR ALL TO authenticated
      USING (is_admin())
      WITH CHECK (is_admin());
  END IF;
END $$;

-- Teachers read/write grades for their class students
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='grades' AND policyname='Teachers manage class grades'
  ) THEN
    CREATE POLICY "Teachers manage class grades" ON grades
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM students s
          JOIN classes c ON s.class_id = c.id
          JOIN teachers t ON c.teacher_id = t.profile_id
          JOIN profiles p ON t.profile_id = p.id
          WHERE s.id = grades.student_id AND p.user_id = auth.uid()
        )
        OR is_teacher_or_admin()
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM students s
          JOIN classes c ON s.class_id = c.id
          JOIN teachers t ON c.teacher_id = t.profile_id
          JOIN profiles p ON t.profile_id = p.id
          WHERE s.id = grades.student_id AND p.user_id = auth.uid()
        )
        OR is_teacher_or_admin()
      );
  END IF;
END $$;

-- Students read their own grades
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='grades' AND policyname='Students read own grades'
  ) THEN
    CREATE POLICY "Students read own grades" ON grades
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM students s
          JOIN profiles p ON s.profile_id = p.id
          WHERE s.id = grades.student_id AND p.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Parents read their children's grades
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='grades' AND policyname='Parents read children grades'
  ) THEN
    CREATE POLICY "Parents read children grades" ON grades
      FOR SELECT TO authenticated
      USING (is_parent_of(grades.student_id));
  END IF;
END $$;

-- ── FEES ─────────────────────────────────────────────────────────────────
-- Admins manage all fees
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='fees' AND policyname='Admins manage fees'
  ) THEN
    CREATE POLICY "Admins manage fees" ON fees
      FOR ALL TO authenticated
      USING (is_admin())
      WITH CHECK (is_admin());
  END IF;
END $$;

-- Students read own fees
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='fees' AND policyname='Students read own fees'
  ) THEN
    CREATE POLICY "Students read own fees" ON fees
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM students s
          JOIN profiles p ON s.profile_id = p.id
          WHERE s.id = fees.student_id AND p.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Parents read their children's fees
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='fees' AND policyname='Parents read children fees'
  ) THEN
    CREATE POLICY "Parents read children fees" ON fees
      FOR SELECT TO authenticated
      USING (is_parent_of(fees.student_id));
  END IF;
END $$;

-- ── HEALTH RECORDS ───────────────────────────────────────────────────────
-- Admins manage all health records
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='health_records' AND policyname='Admins manage health records'
  ) THEN
    CREATE POLICY "Admins manage health records" ON health_records
      FOR ALL TO authenticated
      USING (is_admin())
      WITH CHECK (is_admin());
  END IF;
END $$;

-- Parents read their children's health records
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='health_records' AND policyname='Parents read children health records'
  ) THEN
    CREATE POLICY "Parents read children health records" ON health_records
      FOR SELECT TO authenticated
      USING (is_parent_of(health_records.student_id));
  END IF;
END $$;

-- ── PARENTS TABLE ────────────────────────────────────────────────────────
-- Admins manage all parent records
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='parents' AND policyname='Admins manage parents'
  ) THEN
    CREATE POLICY "Admins manage parents" ON parents
      FOR ALL TO authenticated
      USING (is_admin())
      WITH CHECK (is_admin());
  END IF;
END $$;

-- Parents read own record
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='parents' AND policyname='Parents read own record'
  ) THEN
    CREATE POLICY "Parents read own record" ON parents
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles p
          WHERE p.id = parents.profile_id AND p.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ── STUDENT_PARENTS ──────────────────────────────────────────────────────
-- Admins manage all links
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='student_parents' AND policyname='Admins manage student_parents'
  ) THEN
    CREATE POLICY "Admins manage student_parents" ON student_parents
      FOR ALL TO authenticated
      USING (is_admin())
      WITH CHECK (is_admin());
  END IF;
END $$;

-- Parents read own links
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='student_parents' AND policyname='Parents read own links'
  ) THEN
    CREATE POLICY "Parents read own links" ON student_parents
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM parents p
          JOIN profiles pr ON p.profile_id = pr.id
          WHERE p.id = student_parents.parent_id AND pr.user_id = auth.uid()
        )
      );
  END IF;
END $$;
