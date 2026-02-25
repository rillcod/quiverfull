import { useState, useEffect } from 'react';
import { BookOpen, Users } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { ProfileRow, ClassRow, ClassLevel } from '../../../lib/supabase';

interface Props { profile: ProfileRow; onNavigate?: (s: string) => void; }

const LEVEL_LABELS: Record<ClassLevel, string> = { creche: 'Creche', basic1: 'Basic 1', basic2: 'Basic 2', basic3: 'Basic 3', basic4: 'Basic 4', basic5: 'Basic 5', basic6: 'Basic 6' };

interface ClassWithCount extends ClassRow { students: { count: number }[]; }
interface StudentWithProfile {
  id: string; student_id: string;
  profiles?: { first_name: string; last_name: string; email?: string } | null;
}

export default function ClassesSection({ profile }: Props) {
  const [classes, setClasses] = useState<ClassWithCount[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassWithCount | null>(null);
  const [students, setStudents] = useState<StudentWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('classes').select('*, students(count)').eq('teacher_id', profile.id)
      .then(({ data }) => { setClasses((data || []) as ClassWithCount[]); setLoading(false); });
  }, [profile.id]);

  const loadStudents = async (cls: ClassWithCount) => {
    setSelectedClass(cls);
    const { data } = await supabase.from('students').select('*, profiles:profile_id(first_name,last_name,email)').eq('class_id', cls.id).eq('is_active', true).order('created_at');
    setStudents((data || []) as StudentWithProfile[]);
  };

  if (loading) return <div className="flex justify-center items-center h-40"><div className="w-8 h-8 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">My Classes</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map(cls => (
          <div key={cls.id}
            className={`bg-white rounded-xl shadow-sm border-2 p-5 cursor-pointer transition-all ${selectedClass?.id === cls.id ? 'border-blue-500 shadow-md' : 'border-gray-100 hover:border-blue-200'}`}
            onClick={() => loadStudents(cls)}>
            <div className="flex items-start justify-between mb-3">
              <div><h3 className="font-bold text-gray-800">{cls.name}</h3><p className="text-sm text-gray-500">{LEVEL_LABELS[cls.level] || cls.level}</p></div>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">{cls.academic_year}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1 text-gray-600"><Users className="w-4 h-4" /> {cls.students?.[0]?.count || 0} students</span>
              <span className="text-blue-600 text-xs font-medium">Click to view →</span>
            </div>
          </div>
        ))}
        {classes.length === 0 && <div className="col-span-3 text-center py-12 text-gray-400"><BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" /><p>No classes assigned to you yet</p></div>}
      </div>
      {selectedClass && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">{selectedClass.name} — Student Roster ({students.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase">
                <th className="py-2 px-3">Name</th><th className="py-2 px-3">Student ID</th><th className="py-2 px-3">Email</th><th className="py-2 px-3">Status</th>
              </tr></thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 px-3 font-medium text-gray-800">{s.profiles?.first_name} {s.profiles?.last_name}</td>
                    <td className="py-2 px-3 text-gray-500 font-mono text-xs">{s.student_id}</td>
                    <td className="py-2 px-3 text-gray-500">{s.profiles?.email}</td>
                    <td className="py-2 px-3"><span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">Active</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
