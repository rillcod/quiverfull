import { useState, useEffect } from 'react';
import { BarChart3, Search, Download, Plus, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { TERMS, getDefaultAcademicYear } from '../../../lib/academicConfig';
import type { ProfileRow, GradeRow, GradeInsert, ClassRow } from '../../../lib/supabase';

interface Props { profile: ProfileRow; onNavigate?: (s: string) => void; }

interface GradeWithStudent extends GradeRow {
  students?: { student_id: string; profiles?: { first_name: string; last_name: string }; classes?: { id: string; name: string } } | null;
}

interface StudentOption {
  id: string;
  student_id: string;
  profiles?: { first_name: string; last_name: string } | null;
}

function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  return (
    <div className={`fixed bottom-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium flex items-center gap-2 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {msg} <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X className="w-4 h-4" /></button>
    </div>
  );
}

const ASSESSMENT_TYPES = ['Test', 'CA', 'Exam', 'Project', 'Assignment', 'Quiz'];

export default function GradesSection({ profile }: Props) {
  const [grades, setGrades] = useState<GradeWithStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [classes, setClasses] = useState<Pick<ClassRow, 'id' | 'name'>[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    student_id: '', subject: '', assessment_type: 'Test', score: '', max_score: '100',
    term: 'First Term' as string, academic_year: getDefaultAcademicYear(),
  });

  useEffect(() => {
    supabase.from('classes').select('id, name').order('name').then(({ data }) => setClasses((data || []) as Pick<ClassRow, 'id' | 'name'>[]));
    supabase.from('students').select('id, student_id, profiles:profile_id(first_name, last_name)').eq('is_active', true).order('student_id').then(({ data }) => setStudents((data || []) as unknown as StudentOption[]));
  }, []);

  const fetchGrades = async () => {
    setLoading(true);
    const { data } = await supabase.from('grades').select('*, students:student_id(student_id, profiles:profile_id(first_name, last_name), classes:class_id(id, name))').order('created_at', { ascending: false }).limit(200);
    setGrades((data || []) as GradeWithStudent[]);
    setLoading(false);
  };

  useEffect(() => { fetchGrades(); }, []);

  const filtered = grades.filter(g => {
    const name = `${g.students?.profiles?.first_name} ${g.students?.profiles?.last_name}`.toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase()) || g.subject.toLowerCase().includes(search.toLowerCase());
    const matchClass = !filterClass || g.students?.classes?.id === filterClass;
    return matchSearch && (filterClass ? matchClass : true);
  });

  const exportCSV = () => {
    const rows: string[][] = [['Student', 'Class', 'Subject', 'Type', 'Score', 'Max', 'Term', 'Year']];
    filtered.forEach(g => rows.push([
      `${g.students?.profiles?.first_name ?? ''} ${g.students?.profiles?.last_name ?? ''}`.trim(),
      g.students?.classes?.name ?? '',
      g.subject, g.assessment_type,
      String(g.score), String(g.max_score), g.term, g.academic_year,
    ]));
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows.map(r => r.join(',')).join('\n'));
    a.download = 'grades.csv'; a.click();
  };

  const openAdd = () => {
    setForm({ student_id: '', subject: '', assessment_type: 'Test', score: '', max_score: '100', term: 'First Term' as string, academic_year: getDefaultAcademicYear() });
    setShowModal(true);
  };

  const save = async () => {
    if (!form.student_id || !form.subject.trim() || !form.score) return setToast({ msg: 'Student, subject and score are required', type: 'error' });
    const score = parseFloat(form.score);
    const max_score = parseFloat(form.max_score) || 100;
    if (isNaN(score) || score < 0) return setToast({ msg: 'Enter a valid score', type: 'error' });
    if (score > max_score) return setToast({ msg: 'Score cannot exceed max score', type: 'error' });
    setSaving(true);
    try {
      const payload: GradeInsert = {
        student_id: form.student_id, subject: form.subject.trim(),
        assessment_type: form.assessment_type, score, max_score,
        term: form.term, academic_year: form.academic_year, graded_by: profile.id,
      };
      await supabase.from('grades').insert(payload);
      setToast({ msg: 'Grade added', type: 'success' });
      setShowModal(false);
      fetchGrades();
    } catch (e: unknown) {
      setToast({ msg: e instanceof Error ? e.message : 'Failed to save grade', type: 'error' });
    }
    setSaving(false);
  };

  const gradeColor = (pct: number) => pct >= 70 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="space-y-5">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-900">Grades</h2>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={openAdd} className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
            <Plus className="w-4 h-4" /> Add Grade
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input placeholder="Search by student or subject..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
        </div>
        <select value={filterClass} onChange={e => setFilterClass(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
          <option value="">All classes</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-16"><div className="w-8 h-8 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs text-gray-500 uppercase">
                  <th className="py-3 px-4">Student</th><th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Subject</th><th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Score</th><th className="py-3 px-4">Term</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(g => {
                  const pct = Math.round((g.score / g.max_score) * 100);
                  return (
                    <tr key={g.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-800">{g.students?.profiles?.first_name} {g.students?.profiles?.last_name}</td>
                      <td className="py-3 px-4 text-gray-600">{g.students?.classes?.name ?? '—'}</td>
                      <td className="py-3 px-4 text-gray-700">{g.subject}</td>
                      <td className="py-3 px-4 text-gray-500">{g.assessment_type}</td>
                      <td className="py-3 px-4"><span className={`font-semibold ${gradeColor(pct)}`}>{g.score}/{g.max_score} ({pct}%)</span></td>
                      <td className="py-3 px-4 text-gray-500 text-xs">{g.term}</td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-gray-400">No grades found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2"><BarChart3 className="w-5 h-5 text-purple-500" /> Add Grade</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Student *</label>
                <select value={form.student_id} onChange={e => setForm(f => ({ ...f, student_id: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">Select student...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.profiles?.first_name} {s.profiles?.last_name} ({s.student_id})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Subject *</label>
                <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="e.g. Mathematics"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Assessment Type</label>
                <select value={form.assessment_type} onChange={e => setForm(f => ({ ...f, assessment_type: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                  {ASSESSMENT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Score *</label>
                  <input type="number" min={0} step={0.5} value={form.score} onChange={e => setForm(f => ({ ...f, score: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Max Score</label>
                  <input type="number" min={1} value={form.max_score} onChange={e => setForm(f => ({ ...f, max_score: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Term</label>
                  <select value={form.term} onChange={e => setForm(f => ({ ...f, term: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                    {TERMS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Academic Year</label>
                  <input value={form.academic_year} onChange={e => setForm(f => ({ ...f, academic_year: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save Grade'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
