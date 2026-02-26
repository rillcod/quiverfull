/*
  # Fee Templates Table
  Allows admin to define fee structures (group/item) before bulk-applying to students.
  Maps to SchoolBase's "fee groups/items" + "bulk debt uploads".
*/

CREATE TABLE IF NOT EXISTS fee_templates (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name               text NOT NULL,
  fee_type           text NOT NULL,
  amount             decimal(10,2) NOT NULL,
  term               text NOT NULL,
  academic_year      text NOT NULL DEFAULT '2024/2025',
  applies_to_class   uuid REFERENCES classes(id) ON DELETE SET NULL, -- null = all classes
  created_at         timestamptz DEFAULT now()
);

ALTER TABLE fee_templates ENABLE ROW LEVEL SECURITY;

-- Only admins can manage fee templates
CREATE POLICY "Admins manage fee_templates"
  ON fee_templates FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Staff can read fee templates
CREATE POLICY "Staff read fee_templates"
  ON fee_templates FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'teacher')
    )
  );
