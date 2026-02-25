import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { ProfileRow, StudentWithProfileAndClass, GradeRow, AttendanceRow, ClassLevel } from '../../../lib/supabase';

interface Props { profile: ProfileRow; onNavigate?: (s: string) => void; }

const LEVEL_LABELS: Record<ClassLevel, string> = { creche: 'Creche', basic1: 'Basic 1', basic2: 'Basic 2', basic3: 'Basic 3', basic4: 'Basic 4', basic5: 'Basic 5', basic6: 'Basic 6' };
interface StudentParentLink { student_id: string }

export default function ChildrenSection({ profile }: Props) {
  const [children, setChildren] = useState<StudentWithProfileAndClass[]>([]);
  const [selected, setSelected] = useState<StudentWithProfileAndClass | null>(null);
  const [grades, setGrades] = useState<GradeRow[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: parent } = await supabase.from('parents').select('id').eq('profile_id', profile.id).single();
      if (!parent) { setLoading(false); return; }
      const { data: links } = await supabase.from('student_parents').select('student_id').eq('parent_id', parent.id);
      const ids = (links || []).map((l: StudentParentLink) => l.student_id);
      if (ids.length > 0) {
        const { data } = await supabase.from('students').select('*, profiles:profile_id(first_name,last_name,email), classes:class_id(name,level)').in('id', ids);
        setChildren((data || []) as StudentWithProfileAndClass[]);
        if (data && data.length > 0) loadChildDetails(data[0] as StudentWithProfileAndClass);
      }
      setLoading(false);
    })();
  }, [profile.id]);

  const loadChildDetails = async (child: StudentWithProfileAndClass) => {
    setSelected(child);
    const [{ data: g }, { data: a }] = await Promise.all([
      supabase.from('grades').select('*').eq('student_id', child.id).order('created_at', { ascending: false }).limit(20),
      supabase.from('attendance').select('*').eq('student_id', child.id).order('date', { ascending: false }).limit(20),
    ]);
    setGrades((g || []) as GradeRow[]);
    setAttendance((a || []) as AttendanceRow[]);
  };

  const gradeColor = (pct: number) => pct >= 70 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-600';
  const attColor: Record<string, string> = { present: 'bg-green-100 text-green-700', absent: 'bg-red-100 text-red-700', late: 'bg-yellow-100 text-yellow-700', excused: 'bg-blue-100 text-blue-700' };

  if (loading) return <div className="flex justify-center items-center h-40"><div className="w-8 h-8 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-gray-900">My Children</h2>
      {children.length === 0 && <div className="text-center py-16 text-gray-400"><Users className="w-12 h-12 mx-auto mb-3 opacity-40" /><p>No children linked yet. Contact the school administrator.</p></div>}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {children.map(c => (
          <button key={c.id} onClick={() => loadChildDetails(c)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${selected?.id === c.id ? 'bg-purple-600 text-white shadow' : 'bg-white border border-gray-200 text-gray-700 hover:border-purple-300'}`}>
            {c.profiles?.first_name} {c.profiles?.last_name}
          </button>
        ))}
      </div>
      {selected && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-xl">{selected.profiles?.first_name?.[0]}</div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{selected.profiles?.first_name} {selected.profiles?.last_name}</h3>
                <p className="text-sm text-gray-500">{selected.classes?.name && selected.classes.level != null ? `${LEVEL_LABELS[selected.classes.level]} · ` : ''}{selected.student_id}</p>
              </div>
            </div>
            <h4 className="font-semibold text-gray-700 mb-3">Recent Grades</h4>
            {grades.length === 0 ? <p className="text-gray-400 text-sm">No grades yet</p> : grades.slice(0, 8).map(g => {
              const pct = Math.round((g.score / g.max_score) * 100);
              return (
                <div key={g.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <div><p className="text-sm font-medium text-gray-700">{g.subject}</p><p className="text-xs text-gray-400">{g.assessment_type} · {g.term}</p></div>
                  <span className={`font-bold text-sm ${gradeColor(pct)}`}>{g.score}/{g.max_score} ({pct}%)</span>
                </div>
              );
            })}
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h4 className="font-semibold text-gray-700 mb-3">Recent Attendance</h4>
            {attendance.length === 0 ? <p className="text-gray-400 text-sm">No attendance records yet</p> : attendance.slice(0, 10).map(a => (
              <div key={a.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-700">{new Date(a.date).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${attColor[a.status]}`}>{a.status}</span>
              </div>
            ))}
            {attendance.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                <p className="text-sm text-gray-600">Attendance rate (last 20 days): <span className="font-bold text-green-600">{Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100)}%</span></p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
