-- ============================================================
-- Run this in Supabase SQL Editor (Dashboard → SQL)
-- 1. Marks previously-applied migrations as recorded
-- 2. Creates the admission_applications table safely
-- ============================================================

-- Step 1: Mark migrations that were applied outside the CLI
INSERT INTO supabase_migrations.schema_migrations (version, name) VALUES
  ('20260225200000', 'subjects'),
  ('20260225210000', 'fee_templates')
ON CONFLICT (version) DO NOTHING;

-- Step 2: Create admission_applications table (safe: IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS admission_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  child_name text NOT NULL,
  child_age text,
  date_of_birth date,
  gender text,
  program text NOT NULL,
  previous_school text,
  medical_conditions text,
  emergency_contact text,
  emergency_phone text,
  message text,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  reviewed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admission_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can submit admission application" ON admission_applications;
DROP POLICY IF EXISTS "Authenticated can submit admission application" ON admission_applications;
DROP POLICY IF EXISTS "Admins manage admission applications" ON admission_applications;

CREATE POLICY "Public can submit admission application"
  ON admission_applications FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Authenticated can submit admission application"
  ON admission_applications FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admins manage admission applications"
  ON admission_applications FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- Mark this migration as applied
INSERT INTO supabase_migrations.schema_migrations (version, name) VALUES
  ('20260226000000', 'admission_applications')
ON CONFLICT (version) DO NOTHING;

SELECT 'Done: admission_applications table created' AS status;
