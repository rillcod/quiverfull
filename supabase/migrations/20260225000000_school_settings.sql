-- ============================================================
-- School settings table for configurable app-wide values
-- ============================================================

CREATE TABLE IF NOT EXISTS school_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE school_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage school_settings"
  ON school_settings FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "All authenticated read school_settings"
  ON school_settings FOR SELECT
  TO authenticated
  USING (true);

-- Seed default settings
INSERT INTO school_settings (key, value) VALUES
  ('school_name', '"The Quiverfull School"'),
  ('current_academic_year', '"2024/2025"'),
  ('terms', '["First Term", "Second Term", "Third Term"]'),
  ('currency', '"₦"'),
  ('currency_code', '"NGN"'),
  ('address', '""'),
  ('phone', '""'),
  ('email', '""')
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION update_school_settings_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_school_settings_updated_at ON school_settings;
CREATE TRIGGER set_school_settings_updated_at
  BEFORE UPDATE ON school_settings
  FOR EACH ROW EXECUTE FUNCTION update_school_settings_updated_at();

SELECT 'School settings table created!' AS status;
