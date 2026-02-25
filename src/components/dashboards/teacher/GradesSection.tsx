import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { TERMS, getDefaultAcademicYear } from '../../../lib/academicConfig';
import type { ProfileRow, GradeRow } from '../../../lib/supabase';

interface Props { profile: ProfileRow; onNavigate?: (s: string) => void; }

interface GradeWithStudentAndClass extends GradeRow {
  students?: { id: string; student_id: string; profiles?: { first_name: string; last_name: string }; classes?: { name: string } } | null;
}
interface StudentWithProfile {
  id: string; student_id: string;
  profiles?: { first_name: string; last_name: string } | null;
}

export default function GradesSection({ profile }: Props) {
  const [grades, setGrades] = useState<GradeWithStudentAndClass[]>([]);
  const [students, setStudents] = useState<StudentWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ student_id: '', subject: '', assessment_type: 'Test', score: '', max_score: '100', term: 'First Term' as string, academic_year: getDefaultAcademicYear() });
  const [saving, setSaving] = useState(false);

  const fetchGrades = async () => {
    const { data } = await supabase.from('grades').select('*, students:student_id(id, student_id, profiles:profile_id(first_name,last_name), classes:class_id(name))').eq('graded_by', profile.id).order('created_at', { ascending: false }).limit(50);
    setGrades((data || []) as GradeWithStudentAndClass[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchGrades();
    supabase.from('classes').select('id').eq('teacher_id', profile.id).then(({ data: cls }) => {
      if (cls && cls.length > 0) {
        supabase.from('students').select('id, student_id, profiles:profile_id(first_name,last_name)').in('class_id', cls.map(c => c.id)).eq('is_active', true)
          .then(({ data }) => setStudents((data || []) as StudentWithProfile[]));
      }
    });
  }, [profile.id]);

  const gradeLabel = (pct: number) => pct >= 70 ? 'A' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : pct >= 40 ? 'D' : 'F';
  const gradeColor = (pct: number) => pct >= 70 ? 'bg-green-100 text-green-800' : pct >= 60 ? 'bg-blue-100 text-blue-800' : pct >= 50 ? 'bg-yellow-100 text-yellow-800' : pct >= 40 ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800';

  const save = async () => {
    if (!form.student_id || !form.subject || !form.score) return;
    setSaving(true);
    await supabase.from('grades').insert({ ...form, score: parseFloat(form.score), max_score: parseFloat(form.max_score), graded_by: profile.id });
    setSaving(false); setShowModal(false);
    setForm({ student_id: '', subject: '', assessment_type: 'Test', score: '', max_score: '100', term: 'First Term' as string, academic_year: getDefaultAcademicYear() });
    fetchGrades();
  };

  if (loading) return <div className="flex justify-center items-center h-40"><div className="w-8 h-8 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Grades</h2>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">+ Add Grade</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase bg-gray-50">
              <th className="py-3 px-4">Student</th><th className="py-3 px-4">Class</th><th className="py-3 px-4">Subject</th><th className="py-3 px-4">Type</th><th className="py-3 px-4">Score</th><th className="py-3 px-4">Grade</th><th className="py-3 px-4">Term</th>
            </tr></thead>
            <tbody>
              {grades.map(g => {
                const pct = Math.round((g.score / g.max_score) * 100);
                return (
                  <tr key={g.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">{g.students?.profiles?.first_name} {g.students?.profiles?.last_name}</td>
                    <td className="py-3 px-4 text-gray-500">{g.students?.classes?.name}</td>
                    <td className="py-3 px-4 text-gray-700">{g.subject}</td>
                    <td className="py-3 px-4 text-gray-500">{g.assessment_type}</td>
                    <td className="py-3 px-4 font-semibold text-blue-600">{g.score}/{g.max_score} <span className="text-gray-400 font-normal">({pct}%)</span></td>
                    <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${gradeColor(pct)}`}>{gradeLabel(pct)}</span></td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{g.term}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {grades.length === 0 && <p className="text-center py-10 text-gray-400">No grades entered yet</p>}
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="font-bold text-gray-800 text-lg mb-4">Add Grade</h3>
            <div className="space-y-3">
              <select value={form.student_id} onChange={e => setForm(f => ({ ...f, student_id: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="">Select student...</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.profiles?.first_name} {s.profiles?.last_name}</option>)}
              </select>
              <input placeholder="Subject" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Score" value={form.score} onChange={e => setForm(f => ({ ...f, score: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                <input type="number" placeholder="Max Score" value={form.max_score} onChange={e => setForm(f => ({ ...f, max_score: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <select value={form.assessment_type} onChange={e => setForm(f => ({ ...f, assessment_type: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                {['Test','CA','Exam','Project','Assignment'].map(t => <option key={t}>{t}</option>)}
              </select>
              <select value={form.term} onChange={e => setForm(f => ({ ...f, term: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                {TERMS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save Grade'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
