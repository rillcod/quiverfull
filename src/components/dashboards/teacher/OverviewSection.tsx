import { useState, useEffect } from 'react';
import { BookOpen, BarChart3 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { ProfileRow, ClassRow, GradeRow, ClassLevel } from '../../../lib/supabase';

interface Props { profile: ProfileRow; onNavigate?: (s: string) => void; }

const LEVEL_LABELS: Record<ClassLevel, string> = { creche: 'Creche', basic1: 'Basic 1', basic2: 'Basic 2', basic3: 'Basic 3', basic4: 'Basic 4', basic5: 'Basic 5', basic6: 'Basic 6' };

interface ClassWithCount extends ClassRow { students: { count: number }[]; }
interface GradeWithStudent extends GradeRow {
  students?: { profiles?: { first_name: string; last_name: string } } | null;
}

export default function OverviewSection({ profile }: Props) {
  const [data, setData] = useState<{ classes: ClassWithCount[]; recentGrades: GradeWithStudent[]; presentToday: number; totalStudents: number; totalGradesEntered: number }>({ classes: [], recentGrades: [], presentToday: 0, totalStudents: 0, totalGradesEntered: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().split('T')[0];
      const [{ data: classes }, { data: grades }, { count: totalGradesCount }] = await Promise.all([
        supabase.from('classes').select('*, students(count)').eq('teacher_id', profile.id),
        supabase.from('grades').select('*, students:student_id(profiles:profile_id(first_name,last_name))').eq('graded_by', profile.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('grades').select('*', { count: 'exact', head: true }).eq('graded_by', profile.id),
      ]);
      const classList = (classes || []) as ClassWithCount[];
      const classIds = classList.map(c => c.id);
      let presentToday = 0, totalStudents = 0;
      if (classIds.length > 0) {
        const { data: studentIds } = await supabase.from('students').select('id').in('class_id', classIds);
        const ids = (studentIds || []).map((s: { id: string }) => s.id);
        const { data: att } = await supabase.from('attendance').select('status').eq('date', today).in('student_id', ids);
        presentToday = (att || []).filter((a: { status: string }) => a.status === 'present').length;
        totalStudents = classList.reduce((s, c) => s + (c.students?.[0]?.count || 0), 0);
      }
      setData({ classes: classList, recentGrades: (grades || []) as GradeWithStudent[], presentToday, totalStudents, totalGradesEntered: totalGradesCount ?? 0 });
      setLoading(false);
    })();
  }, [profile.id]);

  if (loading) return <div className="flex justify-center items-center h-40"><div className="w-8 h-8 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {profile.first_name}!</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'My Classes', value: data.classes.length, color: 'from-blue-500 to-blue-600' },
          { label: 'My Students', value: data.totalStudents, color: 'from-green-500 to-green-600' },
          { label: 'Present Today', value: data.presentToday, color: 'from-emerald-500 to-teal-600' },
          { label: 'Grades Entered', value: data.totalGradesEntered, color: 'from-purple-500 to-purple-600' },
        ].map(s => (
          <div key={s.label} className={`bg-gradient-to-r ${s.color} rounded-xl p-4 text-white`}>
            <p className="text-white/80 text-xs font-medium">{s.label}</p>
            <p className="text-3xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><BookOpen className="w-4 h-4 text-blue-500" /> My Classes</h3>
          {data.classes.length === 0 ? <p className="text-gray-400 text-sm text-center py-6">No classes assigned yet</p> : (
            <div className="space-y-3">
              {data.classes.map(cls => (
                <div key={cls.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div><p className="font-medium text-gray-800">{cls.name}</p><p className="text-xs text-gray-500">{LEVEL_LABELS[cls.level]} · {cls.academic_year}</p></div>
                  <span className="text-sm font-semibold text-blue-600">{cls.students?.[0]?.count || 0} students</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-purple-500" /> Recent Grades Entered</h3>
          {data.recentGrades.length === 0 ? <p className="text-gray-400 text-sm text-center py-6">No grades entered yet</p> : (
            <div className="space-y-2">
              {data.recentGrades.map(g => (
                <div key={g.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg">
                  <div><p className="text-sm font-medium text-gray-800">{g.students?.profiles?.first_name} {g.students?.profiles?.last_name}</p><p className="text-xs text-gray-500">{g.subject} · {g.assessment_type}</p></div>
                  <span className="text-sm font-bold text-blue-600">{g.score}/{g.max_score}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
