/*
  # School Management System Database Schema

  1. New Tables
    - `profiles` - User profiles with role-based access
    - `students` - Student information and enrollment data  
    - `classes` - Class/grade information
    - `teachers` - Teacher profiles and qualifications
    - `parents` - Parent information and relationships
    - `student_parents` - Many-to-many relationship between students and parents
    - `attendance` - Daily attendance records
    - `grades` - Academic performance records
    - `fees` - Fee structure and payment tracking
    - `announcements` - School announcements and notifications
    - `health_records` - Student health information
    - `transport` - Transportation management

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
*/

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'parent', 'student');
CREATE TYPE class_level AS ENUM ('creche', 'basic1', 'basic2', 'basic3', 'basic4', 'basic5', 'basic6');
CREATE TYPE fee_status AS ENUM ('pending', 'partial', 'paid', 'overdue');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'excused');

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  role user_role NOT NULL DEFAULT 'parent',
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Classes table
CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  level class_level NOT NULL,
  academic_year text NOT NULL DEFAULT '2024/2025',
  teacher_id uuid REFERENCES profiles(id),
  capacity integer DEFAULT 25,
  created_at timestamptz DEFAULT now()
);

-- Students table
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

-- Teachers table  
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

-- Parents table
CREATE TABLE IF NOT EXISTS parents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  occupation text,
  workplace text,
  relationship_to_student text DEFAULT 'parent',
  created_at timestamptz DEFAULT now()
);

-- Student-Parent relationship table
CREATE TABLE IF NOT EXISTS student_parents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES parents(id) ON DELETE CASCADE,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, parent_id)
);

-- Attendance table
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

-- Grades table
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

-- Fees table
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

-- Announcements table
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

-- Health records table
CREATE TABLE IF NOT EXISTS health_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  record_type text NOT NULL,
  description text NOT NULL,
  date_recorded date DEFAULT CURRENT_DATE,
  recorded_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Transport table
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

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Students policies
CREATE POLICY "Parents can read their children's records"
  ON students FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_parents sp
      JOIN parents p ON sp.parent_id = p.id
      JOIN profiles pr ON p.profile_id = pr.id
      WHERE sp.student_id = students.id AND pr.user_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can read their class students"
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

CREATE POLICY "Admins can manage all students"
  ON students FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Similar policies for other tables...
CREATE POLICY "Teachers can manage attendance for their classes"
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

CREATE POLICY "Parents can read their children's attendance"
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