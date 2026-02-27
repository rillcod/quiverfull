-- ── Fix 1: Admission applications RLS ────────────────────────────────────
-- The role-specific anon policy did not match with Supabase's new publishable
-- key format. Replace with a public (role-agnostic) INSERT policy.

DROP POLICY IF EXISTS "Public can submit admission application" ON admission_applications;
DROP POLICY IF EXISTS "Authenticated can submit admission application" ON admission_applications;

-- Allow ANY role (anon AND authenticated) to submit admission forms.
-- The admin SELECT/UPDATE/DELETE policy below still restricts reads/edits.
CREATE POLICY "Anyone can submit admission application"
  ON admission_applications FOR INSERT
  WITH CHECK (true);

-- ── Fix 2: Ensure parents.address column exists ───────────────────────────
-- Column was added manually; add IF NOT EXISTS so migrations stay in sync.
ALTER TABLE parents ADD COLUMN IF NOT EXISTS address text;
