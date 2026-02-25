import { BookOpen, Star, Target, Trophy, Heart, AlertCircle } from 'lucide-react';
import { useStudentData } from './useStudentData';
import type { ProfileRow } from '../../../lib/supabase';

interface Props { profile: ProfileRow; onNavigate?: (s: string) => void; }

export default function OverviewSection({ profile }: Props) {
  const { student, grades, attendance, loading, error } = useStudentData(profile.id);

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

  const avg = grades.length ? Math.round(grades.reduce((s, g) => s + (g.score / g.max_score) * 100, 0) / grades.length) : 0;
  const attRate = attendance.length ? Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Welcome back, {profile.first_name}! 🌟</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'My Class', value: student?.classes?.name || '—', color: 'from-pink-500 to-rose-500' },
          { label: 'Avg Score', value: `${avg}%`, color: 'from-yellow-500 to-orange-500' },
          { label: 'Attendance', value: `${attRate}%`, color: 'from-green-500 to-emerald-500' },
          { label: 'Grades', value: grades.length, color: 'from-purple-500 to-indigo-500' },
        ].map(s => (
          <div key={s.label} className={`bg-gradient-to-r ${s.color} rounded-xl p-4 text-white`}>
            <p className="text-white/80 text-xs font-medium">{s.label}</p>
            <p className="text-2xl font-bold mt-1 truncate">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Target className="w-4 h-4 text-blue-500" /> Recent Scores</h3>
          {grades.length === 0 ? <p className="text-gray-400 text-sm text-center py-6">No grades yet</p> : grades.slice(0, 5).map(g => {
            const pct = Math.round((g.score / g.max_score) * 100);
            return (
              <div key={g.id} className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{g.subject}</p>
                  <p className="text-xs text-gray-400">{g.assessment_type} · {g.term}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">{g.score}/{g.max_score}</p>
                  <p className="text-xs text-gray-400">{pct}%</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-yellow-200 to-orange-300 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center"><Heart className="w-5 h-5 text-red-500" /></div>
              <h3 className="font-bold text-gray-800">Daily Motivation</h3>
            </div>
            <p className="text-gray-700 text-sm">"Every day is a chance to learn something amazing. Keep shining bright!"</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-500" /> Achievements</h3>
            <div className="space-y-2">
              {attRate >= 90 && <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg"><Trophy className="w-5 h-5 text-green-500" /><span className="text-sm font-medium text-green-800">Perfect Attendance</span></div>}
              {avg >= 70 && <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg"><Star className="w-5 h-5 text-blue-500" /><span className="text-sm font-medium text-blue-800">High Achiever</span></div>}
              {grades.length >= 5 && <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg"><BookOpen className="w-5 h-5 text-purple-500" /><span className="text-sm font-medium text-purple-800">Active Learner</span></div>}
              {attRate < 90 && avg < 70 && grades.length < 5 && <p className="text-gray-400 text-sm text-center py-2">Complete more activities to earn badges!</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
