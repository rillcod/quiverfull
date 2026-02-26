-- Admission applications submitted via the public website
CREATE TABLE IF NOT EXISTS admission_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Parent / Guardian
  parent_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  -- Child
  child_name text NOT NULL,
  child_age text,
  date_of_birth date,
  gender text,
  program text NOT NULL,
  previous_school text,
  medical_conditions text,
  -- Emergency contact
  emergency_contact text,
  emergency_phone text,
  -- Additional
  message text,
  -- Workflow
  status text NOT NULL DEFAULT 'pending', -- pending | reviewed | approved | rejected | enrolled
  admin_notes text,
  reviewed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admission_applications ENABLE ROW LEVEL SECURITY;

-- Public (anon) can submit applications
CREATE POLICY "Public can submit admission application"
  ON admission_applications FOR INSERT TO anon
  WITH CHECK (true);

-- Authenticated users can also submit (logged-in parents)
CREATE POLICY "Authenticated can submit admission application"
  ON admission_applications FOR INSERT TO authenticated
  WITH CHECK (true);

-- Only admins can view / manage applications
CREATE POLICY "Admins manage admission applications"
  ON admission_applications FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());
