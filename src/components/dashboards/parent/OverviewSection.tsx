import { useState, useEffect } from 'react';
import { Heart, Bell } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { ProfileRow, StudentWithProfileAndClass, FeeRow, AttendanceRow, AnnouncementRow, ClassLevel } from '../../../lib/supabase';

interface Props { profile: ProfileRow; onNavigate?: (s: string) => void; }

const LEVEL_LABELS: Record<ClassLevel, string> = { creche: 'Creche', basic1: 'Basic 1', basic2: 'Basic 2', basic3: 'Basic 3', basic4: 'Basic 4', basic5: 'Basic 5', basic6: 'Basic 6' };
interface StudentParentLink { student_id: string }

export default function OverviewSection({ profile }: Props) {
  const [data, setData] = useState<{ children: StudentWithProfileAndClass[]; pendingTotal: number; announcements: Pick<AnnouncementRow, 'id' | 'title' | 'content' | 'created_at' | 'priority'>[]; attendanceRate: number }>({ children: [], pendingTotal: 0, announcements: [], attendanceRate: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: parent } = await supabase.from('parents').select('id').eq('profile_id', profile.id).single();
      if (!parent) { setLoading(false); return; }
      const { data: links } = await supabase.from('student_parents').select('student_id').eq('parent_id', parent.id);
      const ids = (links || []).map((l: StudentParentLink) => l.student_id);
      const [{ data: children }, { data: fees }, { data: att }, { data: ann }] = await Promise.all([
        ids.length > 0 ? supabase.from('students').select('id,student_id, profiles:profile_id(first_name,last_name), classes:class_id(name,level)').in('id', ids) : Promise.resolve({ data: [] }),
        ids.length > 0 ? supabase.from('fees').select('amount,paid_amount,status').in('student_id', ids).in('status', ['pending','partial','overdue']) : Promise.resolve({ data: [] }),
        ids.length > 0 ? supabase.from('attendance').select('status').in('student_id', ids).gte('date', new Date(Date.now()-30*86400000).toISOString().split('T')[0]) : Promise.resolve({ data: [] }),
        supabase.from('announcements').select('id,title,content,created_at,priority').eq('published', true).order('created_at', { ascending: false }).limit(4),
      ]);
      const feeRows = (fees || []) as Pick<FeeRow, 'amount' | 'paid_amount' | 'status'>[];
      const pendingTotal = feeRows.reduce((s, f) => s + ((f.amount ?? 0) - (f.paid_amount ?? 0)), 0);
      const attRows = (att || []) as Pick<AttendanceRow, 'status'>[];
      const attendanceRate = attRows.length ? Math.round((attRows.filter(a => a.status === 'present').length / attRows.length) * 100) : 0;
      setData({ children: (children || []) as StudentWithProfileAndClass[], pendingTotal, announcements: (ann || []) as Pick<AnnouncementRow, 'id' | 'title' | 'content' | 'created_at' | 'priority'>[], attendanceRate });
      setLoading(false);
    })();
  }, [profile.id]);

  if (loading) return <div className="flex justify-center items-center h-40"><div className="w-8 h-8 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Welcome back, {profile.first_name}!</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'My Children', value: data.children.length, color: 'from-purple-500 to-purple-600' },
          { label: 'Attendance Rate', value: `${data.attendanceRate}%`, color: 'from-green-500 to-green-600' },
          { label: 'Pending Fees', value: `₦${data.pendingTotal.toLocaleString()}`, color: 'from-orange-500 to-red-500' },
          { label: 'Announcements', value: data.announcements.length, color: 'from-blue-500 to-blue-600' },
        ].map(s => (
          <div key={s.label} className={`bg-gradient-to-r ${s.color} rounded-xl p-4 text-white`}>
            <p className="text-white/80 text-xs font-medium">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Heart className="w-4 h-4 text-red-500" /> My Children</h3>
          {data.children.length === 0
            ? <p className="text-gray-400 text-sm text-center py-6">No children linked to your account yet. Contact the school administrator.</p>
            : data.children.map(c => (
              <div key={c.id} className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">{c.profiles?.first_name?.[0]}</div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{c.profiles?.first_name} {c.profiles?.last_name}</p>
                  <p className="text-xs text-gray-500">{c.classes?.name ? `${c.classes.level != null ? LEVEL_LABELS[c.classes.level] : ''} · ` : ''}{c.student_id}</p>
                </div>
              </div>
            ))
          }
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Bell className="w-4 h-4 text-orange-500" /> School Announcements</h3>
          {data.announcements.length === 0
            ? <p className="text-gray-400 text-sm text-center py-6">No announcements yet</p>
            : data.announcements.map(a => (
              <div key={a.id} className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400 mb-3">
                <p className="font-medium text-gray-800 text-sm">{a.title}</p>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{a.content}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(a.created_at).toLocaleDateString()}</p>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
