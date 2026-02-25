import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// DB enums (match PostgreSQL enums)
export type UserRole = 'admin' | 'teacher' | 'parent' | 'student';
export type ClassLevel = 'creche' | 'basic1' | 'basic2' | 'basic3' | 'basic4' | 'basic5' | 'basic6';
export type FeeStatus = 'pending' | 'partial' | 'paid' | 'overdue';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
export type AnnouncementPriority = 'low' | 'normal' | 'high' | 'urgent';
export type EventType = 'holiday' | 'exam' | 'meeting' | 'sports' | 'cultural' | 'general';
export type AssignmentType = 'homework' | 'quiz' | 'exam' | 'project' | 'classwork';
export type StudentGender = 'male' | 'female';

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          first_name: string;
          last_name: string;
          phone: string | null;
          role: UserRole;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          first_name?: string;
          last_name?: string;
          phone?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      students: {
        Row: {
          id: string;
          profile_id: string;
          student_id: string;
          class_id: string | null;
          date_of_birth: string | null;
          gender: StudentGender | null;
          address: string | null;
          emergency_contact: string | null;
          emergency_phone: string | null;
          medical_conditions: string | null;
          enrollment_date: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          student_id: string;
          class_id?: string | null;
          date_of_birth?: string | null;
          gender?: StudentGender | null;
          address?: string | null;
          emergency_contact?: string | null;
          emergency_phone?: string | null;
          medical_conditions?: string | null;
          enrollment_date?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          class_id?: string | null;
          date_of_birth?: string | null;
          gender?: StudentGender | null;
          address?: string | null;
          emergency_contact?: string | null;
          emergency_phone?: string | null;
          medical_conditions?: string | null;
          is_active?: boolean;
        };
      };
      classes: {
        Row: {
          id: string;
          name: string;
          level: ClassLevel;
          academic_year: string;
          teacher_id: string | null;
          capacity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          level: ClassLevel;
          academic_year?: string;
          teacher_id?: string | null;
          capacity?: number;
          created_at?: string;
        };
        Update: {
          name?: string;
          level?: ClassLevel;
          academic_year?: string;
          teacher_id?: string | null;
          capacity?: number;
        };
      };
      teachers: {
        Row: {
          id: string;
          profile_id: string;
          employee_id: string;
          qualification: string | null;
          specialization: string | null;
          hire_date: string | null;
          salary: number | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          employee_id: string;
          qualification?: string | null;
          specialization?: string | null;
          hire_date?: string | null;
          salary?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          qualification?: string | null;
          specialization?: string | null;
          hire_date?: string | null;
          salary?: number | null;
          is_active?: boolean;
        };
      };
      attendance: {
        Row: {
          id: string;
          student_id: string;
          date: string;
          status: AttendanceStatus;
          notes: string | null;
          marked_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          date: string;
          status?: AttendanceStatus;
          notes?: string | null;
          marked_by?: string | null;
          created_at?: string;
        };
        Update: {
          status?: AttendanceStatus;
          notes?: string | null;
          marked_by?: string | null;
        };
      };
      grades: {
        Row: {
          id: string;
          student_id: string;
          subject: string;
          assessment_type: string;
          score: number;
          max_score: number;
          term: string;
          academic_year: string;
          graded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          subject: string;
          assessment_type: string;
          score: number;
          max_score: number;
          term?: string;
          academic_year?: string;
          graded_by?: string | null;
          created_at?: string;
        };
        Update: {
          subject?: string;
          assessment_type?: string;
          score?: number;
          max_score?: number;
          term?: string;
          academic_year?: string;
        };
      };
      fees: {
        Row: {
          id: string;
          student_id: string;
          fee_type: string;
          amount: number;
          due_date: string;
          paid_amount: number;
          status: FeeStatus;
          term: string;
          academic_year: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          fee_type: string;
          amount: number;
          due_date: string;
          paid_amount?: number;
          status?: FeeStatus;
          term: string;
          academic_year?: string;
          created_at?: string;
        };
        Update: {
          fee_type?: string;
          amount?: number;
          due_date?: string;
          paid_amount?: number;
          status?: FeeStatus;
          term?: string;
          academic_year?: string;
        };
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          content: string;
          target_audience: string[];
          priority: AnnouncementPriority;
          published: boolean;
          published_by: string | null;
          created_at: string;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          target_audience?: string[];
          priority?: AnnouncementPriority;
          published?: boolean;
          published_by?: string | null;
          created_at?: string;
          expires_at?: string | null;
        };
        Update: {
          title?: string;
          content?: string;
          target_audience?: string[];
          priority?: AnnouncementPriority;
          published?: boolean;
          published_by?: string | null;
          expires_at?: string | null;
        };
      };
      courses: {
        Row: {
          id: string;
          class_id: string | null;
          subject: string;
          title: string;
          description: string | null;
          teacher_id: string | null;
          term: string;
          academic_year: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          class_id?: string | null;
          subject: string;
          title: string;
          description?: string | null;
          teacher_id?: string | null;
          term?: string;
          academic_year?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          class_id?: string | null;
          subject?: string;
          title?: string;
          description?: string | null;
          teacher_id?: string | null;
          term?: string;
          academic_year?: string;
          is_active?: boolean;
        };
      };
      assignments: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description: string | null;
          due_date: string | null;
          max_score: number;
          type: AssignmentType;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          description?: string | null;
          due_date?: string | null;
          max_score?: number;
          type?: AssignmentType;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          course_id?: string;
          title?: string;
          description?: string | null;
          due_date?: string | null;
          max_score?: number;
          type?: AssignmentType;
          created_by?: string | null;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          start_date: string;
          end_date: string | null;
          event_type: EventType;
          target_audience: string[];
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          start_date: string;
          end_date?: string | null;
          event_type?: EventType;
          target_audience?: string[];
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          start_date?: string;
          end_date?: string | null;
          event_type?: EventType;
          target_audience?: string[];
          created_by?: string | null;
        };
      };
      submissions: {
        Row: {
          id: string;
          assignment_id: string | null;
          student_id: string | null;
          content: string | null;
          file_url: string | null;
          score: number | null;
          feedback: string | null;
          submitted_at: string;
          graded_at: string | null;
          graded_by: string | null;
          status: string;
        };
        Insert: {
          id?: string;
          assignment_id: string;
          student_id: string;
          content?: string | null;
          file_url?: string | null;
          score?: number | null;
          feedback?: string | null;
          submitted_at?: string;
          graded_at?: string | null;
          graded_by?: string | null;
          status?: string;
        };
        Update: {
          content?: string | null;
          file_url?: string | null;
          score?: number | null;
          feedback?: string | null;
          submitted_at?: string;
          graded_at?: string | null;
          graded_by?: string | null;
          status?: string;
        };
      };
      course_materials: {
        Row: {
          id: string;
          course_id: string | null;
          title: string;
          type: string;
          url: string | null;
          description: string | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          type?: string;
          url?: string | null;
          description?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: {
          title?: string;
          type?: string;
          url?: string | null;
          description?: string | null;
          uploaded_by?: string | null;
        };
      };
      parents: {
        Row: {
          id: string;
          profile_id: string | null;
          occupation: string | null;
          workplace: string | null;
          relationship_to_student: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          occupation?: string | null;
          workplace?: string | null;
          relationship_to_student?: string | null;
          created_at?: string;
        };
        Update: {
          occupation?: string | null;
          workplace?: string | null;
          relationship_to_student?: string | null;
        };
      };
      student_parents: {
        Row: {
          id: string;
          student_id: string | null;
          parent_id: string | null;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          parent_id: string;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: {
          is_primary?: boolean;
        };
      };
      health_records: {
        Row: {
          id: string;
          student_id: string | null;
          record_type: string;
          description: string;
          date_recorded: string | null;
          recorded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          record_type: string;
          description: string;
          date_recorded?: string | null;
          recorded_by?: string | null;
          created_at?: string;
        };
        Update: {
          record_type?: string;
          description?: string;
          date_recorded?: string | null;
          recorded_by?: string | null;
        };
      };
      school_settings: {
        Row: {
          id: string;
          key: string;
          value: unknown;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value?: unknown;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: unknown;
          updated_at?: string;
        };
      };
      transport: {
        Row: {
          id: string;
          student_id: string | null;
          route_name: string;
          pickup_location: string;
          pickup_time: string;
          dropoff_location: string;
          dropoff_time: string;
          monthly_fee: number | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          route_name: string;
          pickup_location: string;
          pickup_time: string;
          dropoff_location: string;
          dropoff_time: string;
          monthly_fee?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          route_name?: string;
          pickup_location?: string;
          pickup_time?: string;
          dropoff_location?: string;
          dropoff_time?: string;
          monthly_fee?: number | null;
          is_active?: boolean;
        };
      };
    };
  };
};

// Convenience row types
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type StudentRow = Database['public']['Tables']['students']['Row'];
export type StudentInsert = Database['public']['Tables']['students']['Insert'];
export type StudentUpdate = Database['public']['Tables']['students']['Update'];
export type ClassRow = Database['public']['Tables']['classes']['Row'];
export type ClassInsert = Database['public']['Tables']['classes']['Insert'];
export type ClassUpdate = Database['public']['Tables']['classes']['Update'];
export type TeacherRow = Database['public']['Tables']['teachers']['Row'];
export type TeacherInsert = Database['public']['Tables']['teachers']['Insert'];
export type TeacherUpdate = Database['public']['Tables']['teachers']['Update'];
export type AttendanceRow = Database['public']['Tables']['attendance']['Row'];
export type AttendanceInsert = Database['public']['Tables']['attendance']['Insert'];
export type GradeRow = Database['public']['Tables']['grades']['Row'];
export type GradeInsert = Database['public']['Tables']['grades']['Insert'];
export type FeeRow = Database['public']['Tables']['fees']['Row'];
export type FeeInsert = Database['public']['Tables']['fees']['Insert'];
export type FeeUpdate = Database['public']['Tables']['fees']['Update'];
export type AnnouncementRow = Database['public']['Tables']['announcements']['Row'];
export type AnnouncementInsert = Database['public']['Tables']['announcements']['Insert'];
export type CourseRow = Database['public']['Tables']['courses']['Row'];
export type CourseInsert = Database['public']['Tables']['courses']['Insert'];
export type AssignmentRow = Database['public']['Tables']['assignments']['Row'];
export type AssignmentInsert = Database['public']['Tables']['assignments']['Insert'];
export type EventRow = Database['public']['Tables']['events']['Row'];
export type EventInsert = Database['public']['Tables']['events']['Insert'];
export type EventUpdate = Database['public']['Tables']['events']['Update'];
export type SubmissionRow = Database['public']['Tables']['submissions']['Row'];
export type SubmissionInsert = Database['public']['Tables']['submissions']['Insert'];
export type CourseMaterialRow = Database['public']['Tables']['course_materials']['Row'];
export type CourseMaterialInsert = Database['public']['Tables']['course_materials']['Insert'];
export type ParentRow = Database['public']['Tables']['parents']['Row'];
export type ParentInsert = Database['public']['Tables']['parents']['Insert'];
export type StudentParentRow = Database['public']['Tables']['student_parents']['Row'];
export type HealthRecordRow = Database['public']['Tables']['health_records']['Row'];
export type TransportRow = Database['public']['Tables']['transport']['Row'];
export type SchoolSettingsRow = Database['public']['Tables']['school_settings']['Row'];

// Common relation shapes (for selects with embedded relations)
export interface ProfileBasic {
  id?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string | null;
}
export interface ClassBasic {
  name: string;
  level: ClassLevel;
}
export interface StudentWithProfileAndClass extends StudentRow {
  profiles: ProfileBasic | null;
  classes: ClassBasic | null;
}