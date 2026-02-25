/*
  ============================================================
  Quiverfull School - Complete Database Setup
  ============================================================
  HOW TO USE:
    1. Go to: https://supabase.com/dashboard/project/vitvykboryrudxofgyso/sql/new
    2. Copy this entire file and paste into the SQL Editor
    3. Click "Run" (or press Ctrl+Enter)
    4. After success, run:  node scripts/setup-demo-users.mjs
  ============================================================
*/

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE IF NOT EXISTS user_role AS ENUM ('admin', 'teacher', 'parent', 'student');
CREATE TYPE IF NOT EXISTS class_level AS ENUM ('creche', 'basic1', 'basic2', 'basic3', 'basic4', 'basic5', 'basic6');
CREATE TYPE IF NOT EXISTS fee_status AS ENUM ('pending', 'partial', 'paid', 'overdue');
CREATE TYPE IF NOT EXISTS attendance_status AS ENUM ('present', 'absent', 'late', 'excused');

-- ============================================================
-- TABLES
-- ============================================================

-- Profiles (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email text UNIQUE NOT NULL,
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  role user_role NOT NULL DEFAULT 'parent',
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Classes
CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  level class_level NOT NULL,
  academic_year text NOT NULL DEFAULT '2024/2025',
  teacher_id uuid REFERENCES profiles(id),
  capacity integer DEFAULT 25,
  created_at timestamptz DEFAULT now()
);

-- Students
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  student_id text UNIQUE NOT NULL,
  class_id uuid REFERENCES classes(id),
  date_of_birth date,
  gender text CHECK (gender IN ('male', 'female')),
  address text,
  emergency_contact text,
  emergency_phone text,
  medical_conditions text,
  enrollment_date date DEFAULT CURRENT_DATE,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Teachers
CREATE TABLE IF NOT EXISTS teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  employee_id text UNIQUE NOT NULL,
  qualification text,
  specialization text,
  hire_date date DEFAULT CURRENT_DATE,
  salary decimal(10,2),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Parents
CREATE TABLE IF NOT EXISTS parents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  occupation text,
  workplace text,
  relationship_to_student text DEFAULT 'parent',
  created_at timestamptz DEFAULT now()
);

-- Student–Parent relationship
CREATE TABLE IF NOT EXISTS student_parents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES parents(id) ON DELETE CASCADE,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, parent_id)
);

-- Attendance
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  status attendance_status NOT NULL DEFAULT 'present',
  notes text,
  marked_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, date)
);

-- Grades
CREATE TABLE IF NOT EXISTS grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  subject text NOT NULL,
  assessment_type text NOT NULL,
  score decimal(5,2) NOT NULL,
  max_score decimal(5,2) NOT NULL DEFAULT 100,
  term text NOT NULL,
  academic_year text NOT NULL DEFAULT '2024/2025',
  graded_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Fees
CREATE TABLE IF NOT EXISTS fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  fee_type text NOT NULL,
  amount decimal(10,2) NOT NULL,
  due_date date NOT NULL,
  paid_amount decimal(10,2) DEFAULT 0,
  status fee_status NOT NULL DEFAULT 'pending',
  term text NOT NULL,
  academic_year text NOT NULL DEFAULT '2024/2025',
  created_at timestamptz DEFAULT now()
);

-- Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  target_audience text[] DEFAULT ARRAY['all'],
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  published boolean DEFAULT false,
  published_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- Health records
CREATE TABLE IF NOT EXISTS health_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  record_type text NOT NULL,
  description text NOT NULL,
  date_recorded date DEFAULT CURRENT_DATE,
  recorded_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Transport
CREATE TABLE IF NOT EXISTS transport (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  route_name text NOT NULL,
  pickup_location text NOT NULL,
  pickup_time time NOT NULL,
  dropoff_location text NOT NULL,
  dropoff_time time NOT NULL,
  monthly_fee decimal(8,2) DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE students        ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents         ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance      ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades          ENABLE ROW LEVEL SECURITY;
ALTER TABLE fees            ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements   ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records  ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport       ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER: is_admin()
-- ============================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- ============================================================
-- RLS POLICIES: profiles
-- ============================================================

-- Anyone can insert their own profile (needed for registration)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can do everything with profiles
CREATE POLICY "Admins can manage all profiles"
  ON profiles FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Helper to avoid RLS recursion when checking teacher/admin role
CREATE OR REPLACE FUNCTION is_teacher_or_admin()
RETURNS boolean
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND role IN ('teacher', 'admin')
  );
$$;

-- Teachers can read any profile (to look up parents/students)
CREATE POLICY "Teachers can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_teacher_or_admin());

-- ============================================================
-- RLS POLICIES: classes
-- ============================================================

CREATE POLICY "Admins manage classes"
  ON classes FOR ALL
  TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Authenticated users read classes"
  ON classes FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================
-- RLS POLICIES: students
-- ============================================================

CREATE POLICY "Admins manage all students"
  ON students FOR ALL
  TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Teachers read their class students"
  ON students FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM classes c
      JOIN teachers t ON c.teacher_id = t.profile_id
      JOIN profiles p ON t.profile_id = p.id
      WHERE c.id = students.class_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Parents read their children"
  ON students FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_parents sp
      JOIN parents par ON sp.parent_id = par.id
      JOIN profiles pr ON par.profile_id = pr.id
      WHERE sp.student_id = students.id AND pr.user_id = auth.uid()
    )
  );

CREATE POLICY "Students read own record"
  ON students FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = students.profile_id AND p.user_id = auth.uid()
    )
  );

-- ============================================================
-- RLS POLICIES: teachers
-- ============================================================

CREATE POLICY "Admins manage teachers"
  ON teachers FOR ALL
  TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Teachers read own record"
  ON teachers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = teachers.profile_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated read teachers"
  ON teachers FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================
-- RLS POLICIES: parents
-- ============================================================

CREATE POLICY "Admins manage parents"
  ON parents FOR ALL
  TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Parents read own record"
  ON parents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = parents.profile_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Parents insert own record"
  ON parents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = profile_id AND p.user_id = auth.uid()
    )
  );

-- ============================================================
-- RLS POLICIES: student_parents
-- ============================================================

CREATE POLICY "Admins manage student_parents"
  ON student_parents FOR ALL
  TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Parents read own student links"
  ON student_parents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM parents par
      JOIN profiles pr ON par.profile_id = pr.id
      WHERE par.id = student_parents.parent_id AND pr.user_id = auth.uid()
    )
  );

-- ============================================================
-- RLS POLICIES: attendance
-- ============================================================

CREATE POLICY "Admins manage attendance"
  ON attendance FOR ALL
  TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Teachers manage their class attendance"
  ON attendance FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN classes c ON s.class_id = c.id
      JOIN teachers t ON c.teacher_id = t.profile_id
      JOIN profiles p ON t.profile_id = p.id
      WHERE s.id = attendance.student_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Parents read children attendance"
  ON attendance FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_parents sp
      JOIN parents par ON sp.parent_id = par.id
      JOIN profiles pr ON par.profile_id = pr.id
      WHERE sp.student_id = attendance.student_id AND pr.user_id = auth.uid()
    )
  );

CREATE POLICY "Students read own attendance"
  ON attendance FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN profiles p ON s.profile_id = p.id
      WHERE s.id = attendance.student_id AND p.user_id = auth.uid()
    )
  );

-- ============================================================
-- RLS POLICIES: grades
-- ============================================================

CREATE POLICY "Admins manage grades"
  ON grades FOR ALL
  TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Teachers manage grades for their students"
  ON grades FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN classes c ON s.class_id = c.id
      JOIN teachers t ON c.teacher_id = t.profile_id
      JOIN profiles p ON t.profile_id = p.id
      WHERE s.id = grades.student_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Parents read children grades"
  ON grades FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_parents sp
      JOIN parents par ON sp.parent_id = par.id
      JOIN profiles pr ON par.profile_id = pr.id
      WHERE sp.student_id = grades.student_id AND pr.user_id = auth.uid()
    )
  );

CREATE POLICY "Students read own grades"
  ON grades FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN profiles p ON s.profile_id = p.id
      WHERE s.id = grades.student_id AND p.user_id = auth.uid()
    )
  );

-- ============================================================
-- RLS POLICIES: fees
-- ============================================================

CREATE POLICY "Admins manage fees"
  ON fees FOR ALL
  TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Parents read children fees"
  ON fees FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_parents sp
      JOIN parents par ON sp.parent_id = par.id
      JOIN profiles pr ON par.profile_id = pr.id
      WHERE sp.student_id = fees.student_id AND pr.user_id = auth.uid()
    )
  );

CREATE POLICY "Students read own fees"
  ON fees FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN profiles p ON s.profile_id = p.id
      WHERE s.id = fees.student_id AND p.user_id = auth.uid()
    )
  );

-- ============================================================
-- RLS POLICIES: announcements
-- ============================================================

CREATE POLICY "Admins manage announcements"
  ON announcements FOR ALL
  TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Teachers manage announcements"
  ON announcements FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'teacher')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'teacher')
  );

CREATE POLICY "Authenticated read published announcements"
  ON announcements FOR SELECT
  TO authenticated
  USING (published = true);

-- ============================================================
-- RLS POLICIES: health_records
-- ============================================================

CREATE POLICY "Admins manage health records"
  ON health_records FOR ALL
  TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Teachers manage health records"
  ON health_records FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'teacher')
  );

CREATE POLICY "Parents read children health records"
  ON health_records FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_parents sp
      JOIN parents par ON sp.parent_id = par.id
      JOIN profiles pr ON par.profile_id = pr.id
      WHERE sp.student_id = health_records.student_id AND pr.user_id = auth.uid()
    )
  );

-- ============================================================
-- RLS POLICIES: transport
-- ============================================================

CREATE POLICY "Admins manage transport"
  ON transport FOR ALL
  TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Parents read children transport"
  ON transport FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_parents sp
      JOIN parents par ON sp.parent_id = par.id
      JOIN profiles pr ON par.profile_id = pr.id
      WHERE sp.student_id = transport.student_id AND pr.user_id = auth.uid()
    )
  );

CREATE POLICY "Students read own transport"
  ON transport FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN profiles p ON s.profile_id = p.id
      WHERE s.id = transport.student_id AND p.user_id = auth.uid()
    )
  );

-- ============================================================
-- TRIGGER: auto-update updated_at on profiles
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Done!
SELECT 'Database setup complete!' AS status;
