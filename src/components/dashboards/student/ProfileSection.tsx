import { AlertCircle } from 'lucide-react';
import { useStudentData } from './useStudentData';
import type { ProfileRow, ClassLevel } from '../../../lib/supabase';

interface Props { profile: ProfileRow; onNavigate?: (s: string) => void; }

const LEVEL_LABELS: Record<ClassLevel, string> = { creche: 'Creche', basic1: 'Basic 1', basic2: 'Basic 2', basic3: 'Basic 3', basic4: 'Basic 4', basic5: 'Basic 5', basic6: 'Basic 6' };

export default function ProfileSection({ profile }: Props) {
  const { student, loading, error } = useStudentData(profile.id);

  if (loading) return <div className="flex justify-center items-center h-40"><div className="w-8 h-8 border-4 border-pink-300 border-t-pink-600 rounded-full animate-spin" /></div>;
  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-3">
      <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
      <div><h3 className="font-semibold text-red-800">Something went wrong</h3><p className="text-sm text-red-700 mt-1">{error}</p></div>
    </div>
  );
  if (!student) return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex items-start gap-3">
      <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
      <div><h3 className="font-semibold text-amber-800">No student record found</h3><p className="text-sm text-amber-700 mt-1">Please contact your school administrator.</p></div>
    </div>
  );

  const fields: [string, string | null | undefined][] = [
    ['Student ID', student?.student_id],
    ['Class', student?.classes?.name],
    ['Level', (student?.classes?.level != null ? LEVEL_LABELS[student.classes.level] : null) || '—'],
    ['Email', profile.email],
    ['Phone', profile.phone || 'Not provided'],
    ['Gender', student?.gender ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1) : 'Not provided'],
    ['Date of Birth', student?.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : 'Not provided'],
    ['Enrollment Date', student?.enrollment_date ? new Date(student.enrollment_date).toLocaleDateString() : 'Not provided'],
    ['Address', student?.address || 'Not provided'],
    ['Emergency Contact', student?.emergency_contact || 'Not provided'],
    ['Emergency Phone', student?.emergency_phone || 'Not provided'],
  ];

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-gray-900">My Profile</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-5 mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-3xl">
            {profile.first_name?.[0]}{profile.last_name?.[0]}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">{profile.first_name} {profile.last_name}</h3>
            <p className="text-gray-500">Student · {student?.classes?.name || 'Not assigned'}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map(([label, value]) => (
            <div key={label} className="border-b border-gray-50 pb-3">
              <p className="text-xs text-gray-400 uppercase font-medium mb-1">{label}</p>
              <p className="text-gray-800 font-medium text-sm">{value || '—'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
