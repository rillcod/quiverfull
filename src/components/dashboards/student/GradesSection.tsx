import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useStudentData } from './useStudentData';
import { TERMS, getDefaultAcademicYear } from '../../../lib/academicConfig';
import type { ProfileRow } from '../../../lib/supabase';

interface Props { profile: ProfileRow; onNavigate?: (s: string) => void; }

function getNigerianGrade(pct: number): { label: string; color: string } {
  if (pct >= 75) return { label: 'A1', color: 'bg-green-100 text-green-800' };
  if (pct >= 70) return { label: 'B2', color: 'bg-blue-100 text-blue-800' };
  if (pct >= 65) return { label: 'B3', color: 'bg-blue-100 text-blue-700' };
  if (pct >= 60) return { label: 'C4', color: 'bg-teal-100 text-teal-800' };
  if (pct >= 55) return { label: 'C5', color: 'bg-yellow-100 text-yellow-800' };
  if (pct >= 50) return { label: 'C6', color: 'bg-yellow-100 text-yellow-700' };
  if (pct >= 45) return { label: 'D7', color: 'bg-orange-100 text-orange-800' };
  if (pct >= 40) return { label: 'E8', color: 'bg-red-100 text-red-700' };
  return { label: 'F9', color: 'bg-red-100 text-red-800' };
}

export default function GradesSection({ profile }: Props) {
  const { grades, loading, error, student } = useStudentData(profile.id);
  const [filterTerm, setFilterTerm] = useState<string>(TERMS[0]);
  const [filterYear, setFilterYear] = useState(getDefaultAcademicYear());

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

  const filtered = grades.filter(g => g.term === filterTerm && g.academic_year === filterYear);
  const avg = filtered.length
    ? Math.round(filtered.reduce((s, g) => s + (g.score / g.max_score) * 100, 0) / filtered.length)
    : 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-gray-900">My Grades</h2>
        <div className="flex gap-2">
          <select value={filterTerm} onChange={e => setFilterTerm(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500">
            {TERMS.map(t => <option key={t}>{t}</option>)}
          </select>
          <input value={filterYear} onChange={e => setFilterYear(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 w-28" />
        </div>
      </div>
      {filtered.length > 0 && (
        <p className="text-sm text-gray-500">
          Average: <strong className={avg >= 70 ? 'text-green-600' : avg >= 50 ? 'text-yellow-600' : 'text-red-600'}>{avg}%</strong>
          <span className="text-gray-400 ml-2">({filterTerm} · {filterYear})</span>
        </p>
      )}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase bg-gray-50">
              <th className="py-3 px-4">Subject</th><th className="py-3 px-4">Assessment</th><th className="py-3 px-4">Score</th><th className="py-3 px-4">%</th><th className="py-3 px-4">Grade</th><th className="py-3 px-4">Date</th>
            </tr></thead>
            <tbody>
              {filtered.map(g => {
                const pct = Math.round((g.score / g.max_score) * 100);
                const { label, color } = getNigerianGrade(pct);
                return (
                  <tr key={g.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">{g.subject}</td>
                    <td className="py-3 px-4 text-gray-500">{g.assessment_type}</td>
                    <td className="py-3 px-4 font-semibold text-blue-600">{g.score}/{g.max_score}</td>
                    <td className="py-3 px-4 text-gray-600">{pct}%</td>
                    <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${color}`}>{label}</span></td>
                    <td className="py-3 px-4 text-gray-400 text-xs">{new Date(g.created_at).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center py-10 text-gray-400">No grades recorded for {filterTerm} · {filterYear}</p>
          )}
        </div>
      </div>
    </div>
  );
}
