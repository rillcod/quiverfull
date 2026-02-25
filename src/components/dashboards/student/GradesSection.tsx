import { AlertCircle } from 'lucide-react';
import { useStudentData } from './useStudentData';
import type { ProfileRow } from '../../../lib/supabase';

interface Props { profile: ProfileRow; onNavigate?: (s: string) => void; }

export default function GradesSection({ profile }: Props) {
  const { grades, loading, error, student } = useStudentData(profile.id);
  const gradeLabel = (pct: number) => pct >= 70 ? 'A' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : pct >= 40 ? 'D' : 'F';
  const gradeColor = (pct: number) => pct >= 70 ? 'bg-green-100 text-green-800' : pct >= 60 ? 'bg-blue-100 text-blue-800' : pct >= 50 ? 'bg-yellow-100 text-yellow-800' : pct >= 40 ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800';

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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">My Grades</h2>
        <span className="text-sm text-gray-500">Overall Average: <strong className={avg >= 70 ? 'text-green-600' : avg >= 50 ? 'text-yellow-600' : 'text-red-600'}>{avg}%</strong></span>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase bg-gray-50">
              <th className="py-3 px-4">Subject</th><th className="py-3 px-4">Assessment</th><th className="py-3 px-4">Score</th><th className="py-3 px-4">%</th><th className="py-3 px-4">Grade</th><th className="py-3 px-4">Term</th><th className="py-3 px-4">Date</th>
            </tr></thead>
            <tbody>
              {grades.map(g => {
                const pct = Math.round((g.score / g.max_score) * 100);
                return (
                  <tr key={g.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">{g.subject}</td>
                    <td className="py-3 px-4 text-gray-500">{g.assessment_type}</td>
                    <td className="py-3 px-4 font-semibold text-blue-600">{g.score}/{g.max_score}</td>
                    <td className="py-3 px-4 text-gray-600">{pct}%</td>
                    <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${gradeColor(pct)}`}>{gradeLabel(pct)}</span></td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{g.term}</td>
                    <td className="py-3 px-4 text-gray-400 text-xs">{new Date(g.created_at).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {grades.length === 0 && <p className="text-center py-10 text-gray-400">No grades recorded yet</p>}
        </div>
      </div>
    </div>
  );
}
