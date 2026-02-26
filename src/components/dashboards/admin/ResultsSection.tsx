import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Search, ChevronDown, Save, X, Eye, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { TERMS, getDefaultAcademicYear } from '../../../lib/academicConfig';
import { useSchoolSettings } from '../../../hooks/useSchoolSettings';
import ResultCard, { getNigerianGrade, printResultCard } from './ResultCard';
import type { ResultCardData, SubjectResult } from './ResultCard';
import type { ProfileRow, ClassRow, GradeRow } from '../../../lib/supabase';

interface Props { profile: ProfileRow; onNavigate?: (s: string) => void; }

/* ── Helpers ─────────────────────────────────────────────── */
function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const BEHAVIOR_TRAITS = ['punctuality', 'neatness', 'honesty', 'cooperation', 'attentiveness', 'politeness'] as const;
type BehaviorKey = typeof BEHAVIOR_TRAITS[number];

const defaultBehavior = { punctuality: 3, neatness: 3, honesty: 3, cooperation: 3, attentiveness: 3, politeness: 3 };
const defaultMeta = {
  teacher_comment: '',
  principal_comment: '',
  ...defaultBehavior,
  days_present: 0,
  days_absent: 0,
  total_school_days: 0,
  next_term_begins: '',
  next_term_fees: '',
  is_published: false,
};

type MetaForm = typeof defaultMeta;

interface StudentInfo {
  id: string;
  student_id: string;
  profiles: { first_name: string; last_name: string; email: string } | null;
  classes: { name: string; level: string } | null;
  gender: string | null;
  date_of_birth: string | null;
}

function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  return (
    <div className={`fixed bottom-6 right-6 z-[200] px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium flex items-center gap-2 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {msg} <button onClick={onClose}><X className="w-4 h-4" /></button>
    </div>
  );
}

/* ── Compute subject results from raw grade rows ─────────── */
function computeSubjects(grades: GradeRow[]): SubjectResult[] {
  const subjectMap = new Map<string, { ca1: { score: number; max: number } | null; ca2: { score: number; max: number } | null; exam: { score: number; max: number } | null }>();

  for (const g of grades) {
    const key = g.subject.trim();
    if (!subjectMap.has(key)) subjectMap.set(key, { ca1: null, ca2: null, exam: null });
    const entry = subjectMap.get(key)!;
    const type = g.assessment_type.toLowerCase();
    if (type === '1st ca' || type === 'first ca' || type === '1st continuous assessment') {
      entry.ca1 = { score: g.score, max: g.max_score };
    } else if (type === '2nd ca' || type === 'second ca' || type === '2nd continuous assessment') {
      entry.ca2 = { score: g.score, max: g.max_score };
    } else if (type === 'exam' || type === 'examination' || type === 'final exam') {
      entry.exam = { score: g.score, max: g.max_score };
    } else if (type === 'ca' || type === 'test' || type === 'continuous assessment') {
      // Generic CA — treat as 1st CA if not set, else 2nd CA
      if (!entry.ca1) entry.ca1 = { score: g.score, max: g.max_score };
      else if (!entry.ca2) entry.ca2 = { score: g.score, max: g.max_score };
    }
  }

  return Array.from(subjectMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([subject, s]) => {
      const ca1 = s.ca1 ? Math.round((s.ca1.score / s.ca1.max) * 20) : 0;
      const ca2 = s.ca2 ? Math.round((s.ca2.score / s.ca2.max) * 20) : 0;
      const exam = s.exam ? Math.round((s.exam.score / s.exam.max) * 60) : 0;
      const total = ca1 + ca2 + exam;
      return { subject, ca1, ca2, exam, total, ...getNigerianGrade(total) };
    });
}

/* ── Main Component ──────────────────────────────────────── */
export default function ResultsSection({ profile }: Props) {
  const { schoolName, settings } = useSchoolSettings();
  const [classes, setClasses] = useState<Pick<ClassRow, 'id' | 'name' | 'level'>[]>([]);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [resultSheets, setResultSheets] = useState<Record<string, MetaForm & { id?: string }>>({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Filters
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTerm, setSelectedTerm] = useState(TERMS[0]);
  const [academicYear, setAcademicYear] = useState(getDefaultAcademicYear());

  // Modal state
  const [activeStudent, setActiveStudent] = useState<StudentInfo | null>(null);
  const [activeSubjects, setActiveSubjects] = useState<SubjectResult[]>([]);
  const [activeClassStats, setActiveClassStats] = useState<ResultCardData['classStats'] | null>(null);
  const [metaForm, setMetaForm] = useState<MetaForm>(defaultMeta);
  const [saving, setSaving] = useState(false);
  const [modalTab, setModalTab] = useState<'preview' | 'edit'>('preview');

  // Load classes
  useEffect(() => {
    supabase.from('classes').select('id, name, level').order('name').then(({ data }) => {
      setClasses((data || []) as Pick<ClassRow, 'id' | 'name' | 'level'>[]);
    });
  }, []);

  // Load students + result sheets when filters change
  const loadClassData = useCallback(async () => {
    if (!selectedClass) { setStudents([]); setResultSheets({}); return; }
    setLoading(true);
    const { data: studs } = await supabase
      .from('students')
      .select('id, student_id, profiles:profile_id(first_name, last_name, email), classes:class_id(name, level), gender, date_of_birth')
      .eq('class_id', selectedClass)
      .eq('is_active', true)
      .order('student_id');

    const studList = (studs || []) as StudentInfo[];
    setStudents(studList);

    if (studList.length > 0) {
      const { data: sheets } = await supabase
        .from('result_sheets')
        .select('*')
        .in('student_id', studList.map(s => s.id))
        .eq('term', selectedTerm)
        .eq('academic_year', academicYear);

      const map: Record<string, MetaForm & { id?: string }> = {};
      (sheets || []).forEach((sh: MetaForm & { id: string; student_id: string }) => {
        map[sh.student_id] = { ...defaultMeta, ...sh };
      });
      setResultSheets(map);
    }
    setLoading(false);
  }, [selectedClass, selectedTerm, academicYear]);

  useEffect(() => { loadClassData(); }, [loadClassData]);

  // Open result for a student
  const openResult = async (student: StudentInfo) => {
    setActiveStudent(student);
    setModalTab('preview');

    // Fetch grades for this student + all classmates (for class stats)
    const [{ data: myGrades }, { data: classGrades }] = await Promise.all([
      supabase.from('grades').select('*').eq('student_id', student.id).eq('term', selectedTerm).eq('academic_year', academicYear),
      supabase.from('grades').select('*')
        .in('student_id', students.map(s => s.id))
        .eq('term', selectedTerm)
        .eq('academic_year', academicYear),
    ]);

    const mySubjects = computeSubjects((myGrades || []) as GradeRow[]);
    setActiveSubjects(mySubjects);

    // Compute class stats
    const grandTotalByStudent: Record<string, number> = {};
    const allGrades = (classGrades || []) as GradeRow[];
    students.forEach(s => {
      const sGrades = allGrades.filter(g => g.student_id === s.id);
      const sSubjects = computeSubjects(sGrades);
      grandTotalByStudent[s.id] = sSubjects.reduce((acc, sub) => acc + sub.total, 0);
    });

    const myGrandTotal = mySubjects.reduce((acc, s) => acc + s.total, 0);
    const allTotals = Object.values(grandTotalByStudent).filter(t => t > 0);
    const sorted = [...allTotals].sort((a, b) => b - a);
    const position = sorted.indexOf(myGrandTotal) + 1 || sorted.length + 1;

    setActiveClassStats({
      position,
      totalStudents: students.length,
      grandTotal: myGrandTotal,
      highestInClass: sorted[0] ?? 0,
      lowestInClass: sorted[sorted.length - 1] ?? 0,
      classAverage: allTotals.length > 0 ? Math.round(allTotals.reduce((a, b) => a + b, 0) / allTotals.length) : 0,
    });

    // Load meta form
    const existing = resultSheets[student.id];
    setMetaForm(existing ? { ...defaultMeta, ...existing } : { ...defaultMeta });
  };

  const closeModal = () => { setActiveStudent(null); setActiveSubjects([]); setActiveClassStats(null); };

  const saveMeta = async () => {
    if (!activeStudent) return;
    setSaving(true);
    try {
      const payload = {
        student_id: activeStudent.id,
        term: selectedTerm,
        academic_year: academicYear,
        teacher_comment: metaForm.teacher_comment,
        principal_comment: metaForm.principal_comment,
        punctuality: metaForm.punctuality,
        neatness: metaForm.neatness,
        honesty: metaForm.honesty,
        cooperation: metaForm.cooperation,
        attentiveness: metaForm.attentiveness,
        politeness: metaForm.politeness,
        days_present: metaForm.days_present,
        days_absent: metaForm.days_absent,
        total_school_days: metaForm.total_school_days,
        next_term_begins: metaForm.next_term_begins || null,
        next_term_fees: metaForm.next_term_fees,
        is_published: metaForm.is_published,
        created_by: profile.id,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from('result_sheets').upsert(payload, { onConflict: 'student_id,term,academic_year' });
      if (error) throw error;
      setToast({ msg: 'Result saved successfully', type: 'success' });
      setResultSheets(prev => ({ ...prev, [activeStudent.id]: { ...metaForm } }));
      loadClassData();
    } catch (e: unknown) {
      setToast({ msg: e instanceof Error ? e.message : 'Save failed', type: 'error' });
    }
    setSaving(false);
  };

  const filteredStudents = students.filter(s => {
    const name = `${s.profiles?.first_name} ${s.profiles?.last_name}`.toLowerCase();
    return !search || name.includes(search.toLowerCase()) || s.student_id.toLowerCase().includes(search.toLowerCase());
  });

  // Build ResultCardData for the modal
  const buildCardData = (): ResultCardData | null => {
    if (!activeStudent || !activeClassStats) return null;
    const meta = metaForm;
    return {
      student: {
        name: `${activeStudent.profiles?.first_name} ${activeStudent.profiles?.last_name}`,
        studentId: activeStudent.student_id,
        className: activeStudent.classes?.name || '—',
        gender: activeStudent.gender || '',
        dob: activeStudent.date_of_birth || '',
      },
      term: selectedTerm,
      academicYear,
      subjects: activeSubjects,
      classStats: activeClassStats,
      behavior: {
        punctuality: meta.punctuality,
        neatness: meta.neatness,
        honesty: meta.honesty,
        cooperation: meta.cooperation,
        attentiveness: meta.attentiveness,
        politeness: meta.politeness,
      },
      attendance: {
        daysPresent: meta.days_present,
        daysAbsent: meta.days_absent,
        totalDays: meta.total_school_days,
      },
      comments: { teacher: meta.teacher_comment, principal: meta.principal_comment },
      nextTerm: { begins: meta.next_term_begins, fees: meta.next_term_fees },
      schoolName,
      schoolAddress: (settings.school_address as string) || '',
    };
  };

  const cardData = buildCardData();

  return (
    <div className="space-y-5">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Result Sheets</h2>
          <p className="text-xs text-gray-500 mt-0.5">Generate Nigerian-style terminal report cards</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Filter</p>
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-36">
            <label className="block text-xs text-gray-500 mb-1">Class</label>
            <div className="relative">
              <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">— Select class —</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex-1 min-w-36">
            <label className="block text-xs text-gray-500 mb-1">Term</label>
            <div className="relative">
              <select value={selectedTerm} onChange={e => setSelectedTerm(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-green-500">
                {TERMS.map(t => <option key={t}>{t}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex-1 min-w-32">
            <label className="block text-xs text-gray-500 mb-1">Academic Year</label>
            <input value={academicYear} onChange={e => setAcademicYear(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
        </div>
      </div>

      {/* Student list */}
      {selectedClass && (
        <>
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="w-8 h-8 border-4 border-green-300 border-t-green-600 rounded-full animate-spin" />
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs text-gray-500 uppercase">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Student ID</th>
                    <th className="py-3 px-4">Result Status</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s, idx) => {
                    const sheet = resultSheets[s.id];
                    const hasSheet = Boolean(sheet);
                    const isPublished = sheet?.is_published;
                    return (
                      <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs flex-shrink-0">
                              {idx + 1}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{s.profiles?.first_name} {s.profiles?.last_name}</p>
                              <p className="text-xs text-gray-400">{s.profiles?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-gray-500">{s.student_id}</td>
                        <td className="py-3 px-4">
                          {!hasSheet ? (
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <Clock className="w-3.5 h-3.5" /> Not generated
                            </span>
                          ) : isPublished ? (
                            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                              <CheckCircle className="w-3.5 h-3.5" /> Published
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-yellow-600 font-medium">
                              <FileText className="w-3.5 h-3.5" /> Draft
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => openResult(s)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-700 text-white rounded-lg text-xs font-medium hover:bg-green-800"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            {hasSheet ? 'View / Edit' : 'Generate'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredStudents.length === 0 && (
                    <tr><td colSpan={4} className="text-center py-10 text-gray-400">No students found</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {!selectedClass && (
        <div className="text-center py-16 text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Select a class to view students</p>
          <p className="text-xs mt-1">Then generate individual result cards</p>
        </div>
      )}

      {/* ── Result Card Modal ──────────────────────────────── */}
      {activeStudent && cardData && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-4">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  {activeStudent.profiles?.first_name} {activeStudent.profiles?.last_name} — Result Card
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">{selectedTerm} · {academicYear} · {activeStudent.classes?.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-medium">
                  <button onClick={() => setModalTab('preview')} className={`px-3 py-1.5 ${modalTab === 'preview' ? 'bg-green-700 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>Preview</button>
                  <button onClick={() => setModalTab('edit')} className={`px-3 py-1.5 ${modalTab === 'edit' ? 'bg-green-700 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>Edit Details</button>
                </div>
                <button onClick={closeModal} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
              </div>
            </div>

            <div className="p-6">

              {/* Preview tab */}
              {modalTab === 'preview' && (
                <ResultCard
                  data={cardData}
                  onPrint={() => printResultCard(
                    `${activeStudent.profiles?.first_name} ${activeStudent.profiles?.last_name}`,
                    selectedTerm
                  )}
                />
              )}

              {/* Edit tab */}
              {modalTab === 'edit' && (
                <div className="space-y-6">

                  {/* Behavior ratings */}
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm mb-3">Affective / Psychomotor Domain</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {BEHAVIOR_TRAITS.map(trait => (
                        <div key={trait}>
                          <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">{trait}</label>
                          <select
                            value={metaForm[trait]}
                            onChange={e => setMetaForm(f => ({ ...f, [trait]: Number(e.target.value) }))}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            <option value={5}>A — Excellent</option>
                            <option value={4}>B — Very Good</option>
                            <option value={3}>C — Good</option>
                            <option value={2}>D — Fair</option>
                            <option value={1}>E — Poor</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Attendance */}
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm mb-3">Attendance</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Total School Days</label>
                        <input type="number" min={0} value={metaForm.total_school_days}
                          onChange={e => setMetaForm(f => ({ ...f, total_school_days: Number(e.target.value) }))}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Days Present</label>
                        <input type="number" min={0} value={metaForm.days_present}
                          onChange={e => setMetaForm(f => ({ ...f, days_present: Number(e.target.value) }))}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Days Absent</label>
                        <input type="number" min={0} value={metaForm.days_absent}
                          onChange={e => setMetaForm(f => ({ ...f, days_absent: Number(e.target.value) }))}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                      </div>
                    </div>
                  </div>

                  {/* Comments */}
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm mb-3">Remarks</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Class Teacher's Remark</label>
                        <textarea rows={2} value={metaForm.teacher_comment}
                          onChange={e => setMetaForm(f => ({ ...f, teacher_comment: e.target.value }))}
                          placeholder="e.g. A diligent student who shows great potential..."
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Principal's Remark</label>
                        <textarea rows={2} value={metaForm.principal_comment}
                          onChange={e => setMetaForm(f => ({ ...f, principal_comment: e.target.value }))}
                          placeholder="e.g. Excellent performance. Keep it up!"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
                      </div>
                    </div>
                  </div>

                  {/* Next term */}
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm mb-3">Next Term</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Next Term Begins</label>
                        <input type="date" value={metaForm.next_term_begins}
                          onChange={e => setMetaForm(f => ({ ...f, next_term_begins: e.target.value }))}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Fees for Next Term (e.g. ₦150,000)</label>
                        <input value={metaForm.next_term_fees}
                          onChange={e => setMetaForm(f => ({ ...f, next_term_fees: e.target.value }))}
                          placeholder="₦150,000"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                      </div>
                    </div>
                  </div>

                  {/* Publish toggle */}
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                    <input type="checkbox" id="published" checked={metaForm.is_published}
                      onChange={e => setMetaForm(f => ({ ...f, is_published: e.target.checked }))}
                      className="w-4 h-4 rounded accent-green-700 cursor-pointer" />
                    <label htmlFor="published" className="text-sm font-medium text-gray-700 cursor-pointer">
                      Publish result (visible to parents and student)
                    </label>
                  </div>

                  {/* Save + Preview */}
                  <div className="flex gap-3">
                    <button onClick={() => setModalTab('preview')} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-700 hover:bg-gray-50">
                      Preview Card
                    </button>
                    <button onClick={saveMeta} disabled={saving} className="flex-1 py-2.5 bg-green-700 text-white rounded-xl text-sm font-medium hover:bg-green-800 disabled:opacity-50 flex items-center justify-center gap-2">
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save Result Sheet'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
