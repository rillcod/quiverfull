import { useState, useEffect } from 'react';
import { BarChart3, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { TERMS, getDefaultAcademicYear } from '../../../lib/academicConfig';
import type { ProfileRow } from '../../../lib/supabase';

interface Props { profile: ProfileRow; }

interface Child {
  id: string;
  student_id: string;
  profiles?: { first_name: string; last_name: string } | null;
  classes?: { name: string } | null;
}

interface Grade {
  id: string;
  subject: string;
  assessment_type: string;
  score: number;
  max_score: number;
  term: string;
  academic_year: string;
  created_at: string;
}

interface CbtResult {
  id: string;
  total_score: number;
  is_submitted: boolean;
  submitted_at: string | null;
  cbt_exams?: { title: string; subject: string; total_marks: number } | null;
}

function gradeColor(pct: number) {
  return pct >= 70 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-600';
}

export default function ParentGradesSection({ profile }: Props) {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [grades, setGrades] = useState<Grade[]>([]);
  const [cbtResults, setCbtResults] = useState<CbtResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTerm, setFilterTerm] = useState('');
  const [filterYear, setFilterYear] = useState(getDefaultAcademicYear());
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Get parent's children
    supabase.from('parents').select('id').eq('profile_id', profile.id).single().then(({ data: parent }) => {
      if (!parent) { setLoading(false); return; }
      supabase
        .from('student_parents')
        .select('students:student_id(id, student_id, profiles:profile_id(first_name, last_name), classes:class_id(name))')
        .eq('parent_id', parent.id)
        .then(({ data }) => {
          const kids = (data || []).map((r: unknown) => (r as { students: Child }).students).filter(Boolean);
          setChildren(kids);
          if (kids.length > 0) { setSelectedChild(kids[0].id); fetchGrades(kids[0].id); }
          else setLoading(false);
        });
    });
  }, []);

  const fetchGrades = async (childId: string) => {
    setLoading(true);
    const [gradesRes, cbtRes] = await Promise.all([
      supabase.from('grades').select('*').eq('student_id', childId).order('created_at', { ascending: false }).limit(200),
      supabase.from('cbt_sessions').select('*, cbt_exams:exam_id(title, subject, total_marks)').eq('student_id', childId).eq('is_submitted', true).order('submitted_at', { ascending: false }),
    ]);
    setGrades((gradesRes.data || []) as Grade[]);
    setCbtResults((cbtRes.data || []) as CbtResult[]);
    setLoading(false);
  };

  useEffect(() => { if (selectedChild) fetchGrades(selectedChild); }, [selectedChild]);

  // Filter
  const filteredGrades = grades.filter(g =>
    (!filterTerm || g.term === filterTerm) &&
    (!filterYear || g.academic_year === filterYear)
  );

  // Group by subject
  const bySubject: Record<string, Grade[]> = {};
  filteredGrades.forEach(g => { (bySubject[g.subject] = bySubject[g.subject] || []).push(g); });

  const childName = (c: Child) => `${c.profiles?.first_name ?? ''} ${c.profiles?.last_name ?? ''}`.trim();

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-purple-500" /> Academic Results
      </h2>

      {/* Child selector */}
      {children.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {children.map(c => (
            <button key={c.id} onClick={() => setSelectedChild(c.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${selectedChild === c.id ? 'bg-purple-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
              {childName(c)}
            </button>
          ))}
        </div>
      )}

      {children.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-400">No children linked to your account.</div>
      )}

      {children.length > 0 && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select value={filterTerm} onChange={e => setFilterTerm(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="">All Terms</option>
              {TERMS.map(t => <option key={t}>{t}</option>)}
            </select>
            <input value={filterYear} onChange={e => setFilterYear(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-28" />
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin" /></div>
          ) : (
            <>
              {/* Grades by subject */}
              {Object.keys(bySubject).length === 0 ? (
                <div className="text-center py-10 text-gray-400">No grade records for this period.</div>
              ) : (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-700 text-sm">Grades by Subject</h3>
                  {Object.entries(bySubject).map(([subject, subGrades]) => {
                    const avg = subGrades.reduce((s, g) => s + Math.round((g.score / g.max_score) * 100), 0) / subGrades.length;
                    const open = expanded[subject];
                    return (
                      <div key={subject} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <button onClick={() => setExpanded(e => ({ ...e, [subject]: !e[subject] }))}
                          className="w-full flex items-center justify-between p-4 hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
                              <BarChart3 className="w-4 h-4 text-purple-600" />
                            </div>
                            <div className="text-left">
                              <p className="font-semibold text-gray-800">{subject}</p>
                              <p className="text-xs text-gray-500">{subGrades.length} assessment{subGrades.length !== 1 ? 's' : ''}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`font-bold text-lg ${gradeColor(avg)}`}>{Math.round(avg)}%</span>
                            {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                          </div>
                        </button>
                        {open && (
                          <div className="border-t border-gray-100">
                            <table className="w-full text-sm">
                              <tbody>
                                {subGrades.map(g => {
                                  const pct = Math.round((g.score / g.max_score) * 100);
                                  return (
                                    <tr key={g.id} className="border-b border-gray-50 last:border-0">
                                      <td className="py-2.5 px-4 text-gray-600">{g.assessment_type}</td>
                                      <td className="py-2.5 px-4 text-gray-500 text-xs">{g.term}</td>
                                      <td className="py-2.5 px-4 text-right">
                                        <span className={`font-semibold ${gradeColor(pct)}`}>{g.score}/{g.max_score} ({pct}%)</span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* CBT Results */}
              {cbtResults.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-700 text-sm">CBT Exam Results</h3>
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase text-left">
                          <th className="py-3 px-4">Exam</th>
                          <th className="py-3 px-4">Subject</th>
                          <th className="py-3 px-4">Score</th>
                          <th className="py-3 px-4">%</th>
                          <th className="py-3 px-4">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cbtResults.map(r => {
                          const total = r.cbt_exams?.total_marks ?? 0;
                          const pct = total > 0 ? Math.round((r.total_score / total) * 100) : 0;
                          return (
                            <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                              <td className="py-3 px-4 font-medium text-gray-800">{r.cbt_exams?.title ?? '—'}</td>
                              <td className="py-3 px-4 text-gray-600">{r.cbt_exams?.subject}</td>
                              <td className="py-3 px-4 font-semibold">{r.total_score}/{total}</td>
                              <td className="py-3 px-4"><span className={`font-medium ${gradeColor(pct)}`}>{pct}%</span></td>
                              <td className="py-3 px-4 text-gray-400 text-xs">{r.submitted_at ? new Date(r.submitted_at).toLocaleDateString() : '—'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
