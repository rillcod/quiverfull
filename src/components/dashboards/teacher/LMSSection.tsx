import { useState, useEffect, useCallback } from 'react';
import {
  BookOpen, FileText, Users, Plus, X, CheckCircle, Clock, Star,
  RefreshCw, ChevronDown, ChevronRight, Eye, Trash2, Layers,
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { TERMS, getDefaultAcademicYear, getAcademicYearOptions } from '../../../lib/academicConfig';
import type {
  ProfileRow, ClassRow, CourseRow, CourseInsert,
  AssignmentRow, AssignmentInsert, AssignmentType, ClassLevel, SubmissionRow,
} from '../../../lib/supabase';

interface Props { profile: ProfileRow; onNavigate?: (s: string) => void; }

const ASSIGNMENT_TYPES: AssignmentType[] = ['homework', 'quiz', 'exam', 'project', 'classwork'];
const DEFAULT_SUBJECTS = [
  'Mathematics', 'English Language', 'Basic Science', 'Social Studies',
  'Cultural & Creative Arts', 'Civic Education', 'Computer Studies',
  'Christian Religious Studies', 'Physical & Health Education',
  'Agricultural Science', 'Home Economics', 'Verbal Reasoning',
  'Quantitative Reasoning', 'French', 'Yoruba', 'Igbo',
];

interface CourseWithClass extends CourseRow { classes?: { name: string; level: ClassLevel } | null; }
interface AssignmentWithCourse extends AssignmentRow { courses?: { title: string; subject: string } | null; }
interface SubmissionWithStudent extends SubmissionRow {
  students?: { student_id: string; profiles?: { first_name: string; last_name: string } | null } | null;
  assignments?: { title: string; max_score: number; course_id: string; courses?: { subject: string } | null } | null;
}

function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  return (
    <div className={`fixed bottom-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium flex items-center gap-2 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {msg} <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X className="w-4 h-4" /></button>
    </div>
  );
}

export default function LMSSection({ profile }: Props) {
  const [topics, setTopics] = useState<CourseWithClass[]>([]);   // "courses" = topics
  const [assignments, setAssignments] = useState<AssignmentWithCourse[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionWithStudent[]>([]);
  const [classes, setClasses] = useState<Pick<ClassRow, 'id' | 'name'>[]>([]);
  const [subjectOptions, setSubjectOptions] = useState<string[]>(DEFAULT_SUBJECTS);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'subjects' | 'assignments' | 'submissions'>('subjects');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [saving, setSaving] = useState(false);

  // Expanded subject accordion key
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  // Topic modal
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [topicForm, setTopicForm] = useState({
    subject: '', title: '', description: '', class_id: '',
    term: 'First Term' as string, academic_year: getDefaultAcademicYear(),
  });
  const [prevDescriptions, setPrevDescriptions] = useState<string[]>([]);

  // Assignment modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({
    course_id: '', title: '', description: '', due_date: '',
    max_score: '20', type: 'homework' as AssignmentType,
  });

  // Grade modal
  const [gradeTarget, setGradeTarget] = useState<SubmissionWithStudent | null>(null);
  const [gradeScore, setGradeScore] = useState('');
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [grading, setGrading] = useState(false);

  // Material viewer
  const [viewTopic, setViewTopic] = useState<CourseWithClass | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Round 1: courses + classes + subjects in parallel
      const [{ data: topicData }, { data: classData }, { data: subRows }] = await Promise.all([
        supabase.from('courses')
          .select('*, classes:class_id(name, level)')
          .eq('teacher_id', profile.id).eq('is_active', true)
          .order('subject').order('created_at', { ascending: false }),
        supabase.from('classes').select('id, name').eq('teacher_id', profile.id).order('name'),
        supabase.from('subjects').select('name').eq('is_active', true).order('name'),
      ]);
      setTopics((topicData || []) as CourseWithClass[]);
      setClasses((classData || []) as Pick<ClassRow, 'id' | 'name'>[]);
      if (subRows && subRows.length > 0) {
        const dbSubjects = [...new Set((subRows as { name: string }[]).map(s => s.name))];
        setSubjectOptions(dbSubjects);
      }

      // Round 2: assignments (depends on courseIds)
      const courseIds = (topicData || []).map((c: { id: string }) => c.id);
      if (courseIds.length > 0) {
        const { data: assignData } = await supabase
          .from('assignments')
          .select('*, courses:course_id(title, subject)')
          .in('course_id', courseIds)
          .order('created_at', { ascending: false })
          .limit(100);
        setAssignments((assignData || []) as AssignmentWithCourse[]);

        // Round 3: submissions (depends on assignIds)
        const assignIds = (assignData || []).map((a: { id: string }) => a.id);
        if (assignIds.length > 0) {
          const { data: subData } = await supabase
            .from('submissions')
            .select('*, students:student_id(student_id, profiles:profile_id(first_name, last_name)), assignments:assignment_id(title, max_score, course_id, courses:course_id(subject))')
            .in('assignment_id', assignIds)
            .order('submitted_at', { ascending: false });
          setSubmissions((subData || []) as SubmissionWithStudent[]);
        } else {
          setSubmissions([]);
        }
      } else {
        setAssignments([]);
        setSubmissions([]);
      }
    } finally {
      setLoading(false);
    }
  }, [profile.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // When subject changes in topic form, load previous descriptions for that subject
  const loadPrevDescriptions = async (subject: string) => {
    if (!subject) { setPrevDescriptions([]); return; }
    const { data } = await supabase
      .from('courses')
      .select('description')
      .eq('subject', subject)
      .eq('teacher_id', profile.id)
      .not('description', 'is', null)
      .order('created_at', { ascending: false })
      .limit(5);
    const descs = (data || [])
      .map((d: { description: string | null }) => d.description || '')
      .filter(Boolean);
    setPrevDescriptions([...new Set(descs)]);
  };

  // Group topics by subject
  const topicsBySubject = topics.reduce<Record<string, CourseWithClass[]>>((acc, t) => {
    const s = t.subject || 'Uncategorised';
    if (!acc[s]) acc[s] = [];
    acc[s].push(t);
    return acc;
  }, {});

  const openAddTopic = () => {
    setTopicForm({ subject: '', title: '', description: '', class_id: '', term: 'First Term', academic_year: getDefaultAcademicYear() });
    setPrevDescriptions([]);
    setShowTopicModal(true);
  };

  const addTopic = async () => {
    if (!topicForm.subject || !topicForm.title.trim()) return setToast({ msg: 'Subject and topic name required', type: 'error' });
    setSaving(true);
    try {
      const payload: CourseInsert = {
        subject: topicForm.subject, title: topicForm.title.trim(),
        description: topicForm.description.trim() || null,
        class_id: topicForm.class_id || null, teacher_id: profile.id,
        term: topicForm.term, academic_year: topicForm.academic_year,
      };
      await supabase.from('courses').insert(payload);
      setToast({ msg: 'Topic created', type: 'success' });
      setShowTopicModal(false);
      fetchData();
    } catch (e: unknown) {
      setToast({ msg: e instanceof Error ? e.message : 'Failed to create topic', type: 'error' });
    }
    setSaving(false);
  };

  const deleteTopic = async (id: string) => {
    await supabase.from('courses').update({ is_active: false }).eq('id', id);
    setToast({ msg: 'Topic removed', type: 'success' });
    fetchData();
  };

  const deleteAssignment = async (id: string) => {
    if (!confirm('Delete this assignment? This will also remove all submissions.')) return;
    await supabase.from('assignments').delete().eq('id', id);
    setToast({ msg: 'Assignment deleted', type: 'success' });
    fetchData();
  };

  const addAssignment = async () => {
    if (!assignForm.course_id || !assignForm.title.trim()) return setToast({ msg: 'Subject and title required', type: 'error' });
    setSaving(true);
    try {
      const payload: AssignmentInsert = {
        course_id: assignForm.course_id, title: assignForm.title.trim(),
        description: assignForm.description.trim() || null,
        due_date: assignForm.due_date ? new Date(assignForm.due_date).toISOString() : null,
        max_score: parseFloat(assignForm.max_score) || 20,
        type: assignForm.type, created_by: profile.id,
      };
      await supabase.from('assignments').insert(payload);
      setToast({ msg: 'Assignment created', type: 'success' });
      setShowAssignModal(false);
      setAssignForm({ course_id: '', title: '', description: '', due_date: '', max_score: '20', type: 'homework' });
      fetchData();
    } catch (e: unknown) {
      setToast({ msg: e instanceof Error ? e.message : 'Failed to create assignment', type: 'error' });
    }
    setSaving(false);
  };

  const openGrade = (sub: SubmissionWithStudent) => {
    setGradeTarget(sub);
    setGradeScore(sub.score != null ? String(sub.score) : '');
    setGradeFeedback(sub.feedback || '');
  };

  const saveGrade = async () => {
    if (!gradeTarget) return;
    const score = parseFloat(gradeScore);
    const maxScore = gradeTarget.assignments?.max_score ?? 20;
    if (isNaN(score) || score < 0) return setToast({ msg: 'Enter a valid score', type: 'error' });
    if (score > maxScore) return setToast({ msg: `Score cannot exceed ${maxScore}`, type: 'error' });
    setGrading(true);
    try {
      // Update submission record
      await supabase.from('submissions').update({
        score, feedback: gradeFeedback.trim() || null,
        graded_at: new Date().toISOString(), graded_by: profile.id, status: 'graded',
      }).eq('id', gradeTarget.id);

      // Also write/update a grade record so it appears in the result card
      if (gradeTarget.student_id) {
        const subject = gradeTarget.assignments?.courses?.subject || gradeTarget.assignments?.title || 'General';
        await supabase.from('grades').upsert({
          student_id: gradeTarget.student_id,
          subject,
          assessment_type: 'Home Work',
          score,
          max_score: maxScore,
          term: topicForm.term || 'First Term',
          academic_year: topicForm.academic_year || getDefaultAcademicYear(),
          graded_by: profile.id,
        }, { onConflict: 'student_id,subject,assessment_type,term,academic_year' });
      }

      setToast({ msg: 'Grade saved and recorded in gradebook', type: 'success' });
      setGradeTarget(null);
      fetchData();
    } catch (e: unknown) {
      setToast({ msg: e instanceof Error ? e.message : 'Failed to save grade', type: 'error' });
    }
    setGrading(false);
  };

  const pendingCount = submissions.filter(s => s.status === 'submitted').length;
  const subsByAssignment = (aid: string) => submissions.filter(s => s.assignment_id === aid);

  return (
    <div className="space-y-5">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-900">Learning Management</h2>
        <div className="flex gap-2">
          {tab === 'subjects' && (
            <button onClick={openAddTopic}
              className="flex items-center gap-1.5 px-4 py-2 bg-pink-600 text-white rounded-lg text-sm font-medium hover:bg-pink-700">
              <Plus className="w-4 h-4" /> Add Topic
            </button>
          )}
          {tab === 'assignments' && (
            <button onClick={() => { setAssignForm({ course_id: '', title: '', description: '', due_date: '', max_score: '20', type: 'homework' }); setShowAssignModal(true); }}
              className="flex items-center gap-1.5 px-4 py-2 bg-pink-600 text-white rounded-lg text-sm font-medium hover:bg-pink-700">
              <Plus className="w-4 h-4" /> Add Assignment
            </button>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2 flex-wrap">
        {([
          { key: 'subjects', label: 'Subjects & Topics', icon: BookOpen },
          { key: 'assignments', label: 'Assignments', icon: FileText },
          { key: 'submissions', label: 'Submissions', icon: Users, badge: pendingCount },
        ] as const).map(({ key, label, icon: Icon, badge }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === key ? 'bg-pink-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            <Icon className="w-4 h-4" /> {label}
            {badge != null && badge > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">{badge}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="w-8 h-8 border-4 border-pink-300 border-t-pink-600 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* ══ SUBJECTS & TOPICS TAB ══ */}
          {tab === 'subjects' && (
            <div className="space-y-3">
              {Object.keys(topicsBySubject).length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Layers className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No topics yet</p>
                  <p className="text-xs mt-1">Click "Add Topic" to create lesson material for a subject</p>
                </div>
              ) : (
                Object.entries(topicsBySubject).map(([subject, items]) => (
                  <div key={subject} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Subject header */}
                    <button
                      className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-pink-50 transition-colors"
                      onClick={() => setExpandedSubject(expandedSubject === subject ? null : subject)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-pink-600" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-800">{subject}</p>
                          <p className="text-xs text-gray-400">{items.length} topic{items.length !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      {expandedSubject === subject
                        ? <ChevronDown className="w-5 h-5 text-gray-400" />
                        : <ChevronRight className="w-5 h-5 text-gray-400" />}
                    </button>

                    {/* Topic list */}
                    {expandedSubject === subject && (
                      <div className="border-t border-gray-100">
                        {items.map((t, i) => (
                          <div key={t.id}
                            className={`flex items-start justify-between px-5 py-3 gap-3 ${i > 0 ? 'border-t border-gray-50' : ''} hover:bg-gray-50`}>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-800 text-sm">{t.title}</p>
                              {t.description && (
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{t.description}</p>
                              )}
                              <div className="flex gap-2 mt-1 flex-wrap">
                                <span className="text-[10px] px-2 py-0.5 bg-pink-50 text-pink-700 rounded-full">{t.term}</span>
                                <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{t.academic_year}</span>
                                {t.classes?.name && (
                                  <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">{t.classes.name}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              {t.description && (
                                <button onClick={() => setViewTopic(t)}
                                  className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500" title="View materials">
                                  <Eye className="w-4 h-4" />
                                </button>
                              )}
                              <button onClick={() => deleteTopic(t.id)}
                                className="p-1.5 hover:bg-red-50 rounded-lg text-red-400" title="Remove">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* ══ ASSIGNMENTS TAB ══ */}
          {tab === 'assignments' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs text-gray-500 uppercase">
                      <th className="py-3 px-4">Topic / Assignment</th>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Max</th>
                      <th className="py-3 px-4">Due</th>
                      <th className="py-3 px-4">Submissions</th>
                      <th className="py-3 px-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map(a => {
                      const subs = subsByAssignment(a.id);
                      const graded = subs.filter(s => s.status === 'graded').length;
                      const pending = subs.filter(s => s.status === 'submitted').length;
                      return (
                        <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-800">{a.title}</td>
                          <td className="py-3 px-4 text-xs text-gray-500">{a.courses?.subject}</td>
                          <td className="py-3 px-4 capitalize text-gray-600">{a.type}</td>
                          <td className="py-3 px-4 text-gray-600">{a.max_score ?? 20}</td>
                          <td className="py-3 px-4 text-gray-500 text-xs">
                            {a.due_date ? new Date(a.due_date).toLocaleDateString('en-NG') : '—'}
                          </td>
                          <td className="py-3 px-4">
                            <button onClick={() => setTab('submissions')} className="flex items-center gap-2">
                              {pending > 0 && (
                                <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                  {pending} pending
                                </span>
                              )}
                              {graded > 0 && (
                                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                  {graded} graded
                                </span>
                              )}
                              {subs.length === 0 && <span className="text-xs text-gray-400">0 submitted</span>}
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            <button onClick={() => deleteAssignment(a.id)}
                              className="p-1.5 hover:bg-red-50 rounded-lg text-red-400" title="Delete assignment">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {assignments.length === 0 && (
                      <tr><td colSpan={7} className="text-center py-12 text-gray-400">
                        No assignments yet — click "Add Assignment" to create one
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ SUBMISSIONS TAB ══ */}
          {tab === 'submissions' && (
            <div className="space-y-4">
              {/* Stats bar */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Total Submitted', value: submissions.length, color: 'text-gray-800' },
                  { label: 'Pending Grading', value: pendingCount, color: 'text-amber-600' },
                  { label: 'Graded', value: submissions.filter(s => s.status === 'graded').length, color: 'text-green-600' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
                    <div className={`text-2xl font-bold ${color}`}>{value}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs text-gray-500 uppercase">
                        <th className="py-3 px-4">Student</th>
                        <th className="py-3 px-4">Assignment</th>
                        <th className="py-3 px-4">Submitted</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Score</th>
                        <th className="py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map(s => (
                        <tr key={s.id} className={`border-b border-gray-50 hover:bg-gray-50 ${s.status === 'submitted' ? 'bg-amber-50/30' : ''}`}>
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-800">
                              {s.students?.profiles?.first_name} {s.students?.profiles?.last_name}
                            </p>
                            <p className="text-xs text-gray-400 font-mono">{s.students?.student_id}</p>
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-xs">{s.assignments?.title}</td>
                          <td className="py-3 px-4 text-gray-500 text-xs">
                            {s.submitted_at ? new Date(s.submitted_at).toLocaleDateString('en-NG') : '—'}
                          </td>
                          <td className="py-3 px-4">
                            {s.status === 'graded' ? (
                              <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                                <CheckCircle className="w-3.5 h-3.5" /> Graded
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
                                <Clock className="w-3.5 h-3.5" /> Awaiting grade
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-sm font-medium">
                            {s.score != null ? `${s.score} / ${s.assignments?.max_score}` : '—'}
                          </td>
                          <td className="py-3 px-4">
                            <button onClick={() => openGrade(s)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-600 text-white rounded-lg text-xs font-medium hover:bg-pink-700">
                              <Star className="w-3.5 h-3.5" /> Grade
                            </button>
                          </td>
                        </tr>
                      ))}
                      {submissions.length === 0 && (
                        <tr><td colSpan={6} className="text-center py-12 text-gray-400">No submissions yet</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Add Topic Modal ── */}
      {showTopicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-lg">Add New Topic</h3>
              <button onClick={() => setShowTopicModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              {/* Subject dropdown */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Subject *</label>
                <select
                  value={topicForm.subject}
                  onChange={e => {
                    const v = e.target.value;
                    setTopicForm(f => ({ ...f, subject: v }));
                    loadPrevDescriptions(v);
                  }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">Select subject…</option>
                  {subjectOptions.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              {/* Topic name */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Topic / Lesson Title *</label>
                <input
                  value={topicForm.title}
                  onChange={e => setTopicForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Chapter 3: Addition & Subtraction"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              {/* Lesson notes / materials */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Lesson Notes / Materials</label>
                <textarea
                  value={topicForm.description}
                  onChange={e => setTopicForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Type lesson notes, key points, resources or URLs here…"
                  rows={5}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 resize-y"
                />

                {/* Previous content quick-fill */}
                {prevDescriptions.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1.5">Previous notes for {topicForm.subject} (click to reuse):</p>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {prevDescriptions.map((d, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setTopicForm(f => ({ ...f, description: d }))}
                          className="w-full text-left text-xs px-3 py-2 bg-pink-50 hover:bg-pink-100 border border-pink-100 rounded-lg text-gray-700 line-clamp-2 transition-colors"
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Class */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Class (optional)</label>
                <select
                  value={topicForm.class_id}
                  onChange={e => setTopicForm(f => ({ ...f, class_id: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">All classes / not assigned</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* Term + Year */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Term</label>
                  <select value={topicForm.term} onChange={e => setTopicForm(f => ({ ...f, term: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500">
                    {TERMS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Session</label>
                  <select value={topicForm.academic_year} onChange={e => setTopicForm(f => ({ ...f, academic_year: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500">
                    {getAcademicYearOptions().map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setShowTopicModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={addTopic} disabled={saving} className="flex-1 py-2.5 bg-pink-600 text-white rounded-xl text-sm font-medium hover:bg-pink-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {saving ? 'Saving…' : 'Create Topic'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Assignment Modal ── */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-lg">Add Assignment</h3>
              <button onClick={() => setShowAssignModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Topic (Subject) *</label>
                <select value={assignForm.course_id} onChange={e => setAssignForm(f => ({ ...f, course_id: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500">
                  <option value="">Select topic…</option>
                  {topics.map(c => <option key={c.id} value={c.id}>{c.subject} — {c.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Assignment Title *</label>
                <input value={assignForm.title} onChange={e => setAssignForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Homework 1 — Chapter 3 exercises"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Instructions</label>
                <textarea value={assignForm.description} onChange={e => setAssignForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Describe what students should do…" rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                  <select value={assignForm.type} onChange={e => setAssignForm(f => ({ ...f, type: e.target.value as AssignmentType }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500">
                    {ASSIGNMENT_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Max Score</label>
                  <input type="number" min={1} value={assignForm.max_score} onChange={e => setAssignForm(f => ({ ...f, max_score: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Due Date (optional)</label>
                <input type="datetime-local" value={assignForm.due_date} onChange={e => setAssignForm(f => ({ ...f, due_date: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setShowAssignModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={addAssignment} disabled={saving} className="flex-1 py-2.5 bg-pink-600 text-white rounded-xl text-sm font-medium hover:bg-pink-700 disabled:opacity-50">
                {saving ? 'Saving…' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Grade Submission Modal ── */}
      {gradeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">Grade Submission</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {gradeTarget.students?.profiles?.first_name} {gradeTarget.students?.profiles?.last_name} · {gradeTarget.assignments?.title}
                </p>
              </div>
              <button onClick={() => setGradeTarget(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              {gradeTarget.content && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Student's submission</p>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 max-h-40 overflow-y-auto">{gradeTarget.content}</div>
                </div>
              )}
              {gradeTarget.file_url && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Submitted link</p>
                  <a href={gradeTarget.file_url} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline break-all">{gradeTarget.file_url}</a>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Score (max: {gradeTarget.assignments?.max_score ?? 100}) *
                </label>
                <input
                  type="text" inputMode="numeric"
                  value={gradeScore}
                  onChange={e => { if (e.target.value === '' || /^\d*\.?\d*$/.test(e.target.value)) setGradeScore(e.target.value); }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Feedback (optional)</label>
                <textarea rows={3} value={gradeFeedback} onChange={e => setGradeFeedback(e.target.value)}
                  placeholder="e.g. Good work! Watch your handwriting…"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none" />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setGradeTarget(null)} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={saveGrade} disabled={grading}
                className="flex-1 py-2.5 bg-pink-600 text-white rounded-xl text-sm font-medium hover:bg-pink-700 disabled:opacity-50 flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {grading ? 'Saving…' : 'Save Grade'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Material Viewer Modal ── */}
      {viewTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <p className="text-xs font-medium text-pink-600 uppercase">{viewTopic.subject}</p>
                <h3 className="font-bold text-gray-800">{viewTopic.title}</h3>
              </div>
              <button onClick={() => setViewTopic(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5">
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap min-h-[120px] max-h-[400px] overflow-y-auto">
                {viewTopic.description}
              </div>
              <div className="flex gap-2 mt-3 text-xs text-gray-400 flex-wrap">
                <span className="px-2 py-1 bg-gray-100 rounded-full">{viewTopic.term}</span>
                <span className="px-2 py-1 bg-gray-100 rounded-full">{viewTopic.academic_year}</span>
                {viewTopic.classes?.name && <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full">{viewTopic.classes.name}</span>}
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end">
              <button onClick={() => setViewTopic(null)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
