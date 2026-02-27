import { useState, useEffect } from 'react';
import { Monitor, BookOpen, FileText, Plus, X, Search, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { TERMS, getDefaultAcademicYear } from '../../../lib/academicConfig';
import type { ProfileRow, CourseRow, CourseInsert, AssignmentRow, AssignmentInsert, AssignmentType, ClassRow } from '../../../lib/supabase';

interface Props { profile: ProfileRow; onNavigate?: (s: string) => void; }

interface CourseWithClass extends CourseRow {
  classes?: Pick<ClassRow, 'name' | 'level'> | null;
}

interface TeacherOption {
  id: string;
  profile_id: string;
  profiles?: { first_name: string; last_name: string } | null;
}

interface AssignmentWithCourse extends AssignmentRow {
  courses?: { title: string; subject: string } | null;
}

function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  return (
    <div className={`fixed bottom-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium flex items-center gap-2 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {msg} <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X className="w-4 h-4" /></button>
    </div>
  );
}

const ASSIGNMENT_TYPES: AssignmentType[] = ['homework', 'quiz', 'exam', 'project', 'classwork'];
const emptyCourseForm = { subject: '', title: '', description: '', class_id: '', teacher_id: '', term: 'First Term' as string, academic_year: getDefaultAcademicYear() };
const emptyAssignForm = { course_id: '', title: '', description: '', due_date: '', max_score: '20', type: 'homework' as AssignmentType };
const DEFAULT_SUBJECTS = [
  'Mathematics', 'English Language', 'Basic Science', 'Social Studies',
  'Cultural & Creative Arts', 'Civic Education', 'Computer Studies',
  'Christian Religious Studies', 'Physical & Health Education',
  'Agricultural Science', 'Home Economics', 'Verbal Reasoning',
  'Quantitative Reasoning', 'French', 'Yoruba', 'Igbo',
];

export default function LMSSection({ profile }: Props) {
  const [courses, setCourses] = useState<CourseWithClass[]>([]);
  const [assignments, setAssignments] = useState<AssignmentWithCourse[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [classes, setClasses] = useState<Pick<ClassRow, 'id' | 'name'>[]>([]);
  const [subjectOptions, setSubjectOptions] = useState<string[]>(DEFAULT_SUBJECTS);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'courses' | 'assignments'>('courses');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [saving, setSaving] = useState(false);

  // Course modal
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editCourse, setEditCourse] = useState<CourseWithClass | null>(null);
  const [courseForm, setCourseForm] = useState(emptyCourseForm);
  const [deleteCourse, setDeleteCourse] = useState<CourseWithClass | null>(null);
  const [deletingCourse, setDeletingCourse] = useState(false);

  // Assignment modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editAssignment, setEditAssignment] = useState<AssignmentWithCourse | null>(null);
  const [assignForm, setAssignForm] = useState(emptyAssignForm);
  const [deleteAssignment, setDeleteAssignment] = useState<AssignmentWithCourse | null>(null);
  const [deletingAssign, setDeletingAssign] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: courseData }, { data: assignData }, { data: teacherData }, { data: classData }, { data: subRows }] = await Promise.all([
      supabase.from('courses').select('*, classes:class_id(name, level)').eq('is_active', true).order('subject').order('created_at', { ascending: false }),
      supabase.from('assignments').select('*, courses:course_id(title, subject)').order('created_at', { ascending: false }).limit(100),
      supabase.from('teachers').select('id, profile_id, profiles:profile_id(first_name, last_name)').eq('is_active', true),
      supabase.from('classes').select('id, name').order('name'),
      supabase.from('subjects').select('name').eq('is_active', true).order('name'),
    ]);
    setCourses((courseData || []) as CourseWithClass[]);
    setAssignments((assignData || []) as AssignmentWithCourse[]);
    setTeachers((teacherData || []) as unknown as TeacherOption[]);
    setClasses((classData || []) as Pick<ClassRow, 'id' | 'name'>[]);
    if (subRows && subRows.length > 0) {
      setSubjectOptions([...new Set((subRows as { name: string }[]).map(s => s.name))]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filteredCourses = courses.filter(c =>
    !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.subject.toLowerCase().includes(search.toLowerCase())
  );
  const filteredAssignments = assignments.filter(a =>
    !search || a.title.toLowerCase().includes(search.toLowerCase())
  );

  // Course CRUD
  const openAddCourse = () => { setEditCourse(null); setCourseForm(emptyCourseForm); setShowCourseModal(true); };
  const openEditCourse = (c: CourseWithClass) => {
    setEditCourse(c);
    setCourseForm({ subject: c.subject, title: c.title, description: c.description || '', class_id: c.class_id || '', teacher_id: c.teacher_id || '', term: c.term, academic_year: c.academic_year });
    setShowCourseModal(true);
  };

  const saveCourse = async () => {
    if (!courseForm.subject.trim() || !courseForm.title.trim()) return setToast({ msg: 'Subject and title are required', type: 'error' });
    setSaving(true);
    try {
      if (editCourse) {
        await supabase.from('courses').update({
          subject: courseForm.subject.trim(), title: courseForm.title.trim(),
          description: courseForm.description.trim() || null,
          class_id: courseForm.class_id || null,
          teacher_id: courseForm.teacher_id || null,
          term: courseForm.term, academic_year: courseForm.academic_year,
        }).eq('id', editCourse.id);
        setToast({ msg: 'Course updated', type: 'success' });
      } else {
        const payload: CourseInsert = {
          subject: courseForm.subject.trim(), title: courseForm.title.trim(),
          description: courseForm.description.trim() || null,
          class_id: courseForm.class_id || null,
          teacher_id: courseForm.teacher_id || null,
          term: courseForm.term, academic_year: courseForm.academic_year,
        };
        await supabase.from('courses').insert(payload);
        setToast({ msg: 'Course created', type: 'success' });
      }
      setShowCourseModal(false);
      fetchData();
    } catch (e: unknown) {
      setToast({ msg: e instanceof Error ? e.message : 'Failed to save course', type: 'error' });
    }
    setSaving(false);
  };

  const confirmDeleteCourse = async () => {
    if (!deleteCourse) return;
    setDeletingCourse(true);
    try {
      await supabase.from('courses').update({ is_active: false }).eq('id', deleteCourse.id);
      setToast({ msg: 'Course removed', type: 'success' });
      setDeleteCourse(null);
      fetchData();
    } catch (e: unknown) {
      setToast({ msg: e instanceof Error ? e.message : 'Delete failed', type: 'error' });
    }
    setDeletingCourse(false);
  };

  // Assignment CRUD
  const openAddAssign = () => { setEditAssignment(null); setAssignForm(emptyAssignForm); setShowAssignModal(true); };
  const openEditAssign = (a: AssignmentWithCourse) => {
    setEditAssignment(a);
    setAssignForm({
      course_id: a.course_id, title: a.title, description: a.description || '',
      due_date: a.due_date ? new Date(a.due_date).toISOString().slice(0, 16) : '',
      max_score: String(a.max_score ?? 100), type: a.type,
    });
    setShowAssignModal(true);
  };

  const saveAssignment = async () => {
    if (!assignForm.course_id || !assignForm.title.trim()) return setToast({ msg: 'Course and title are required', type: 'error' });
    setSaving(true);
    try {
      if (editAssignment) {
        await supabase.from('assignments').update({
          title: assignForm.title.trim(),
          description: assignForm.description.trim() || null,
          due_date: assignForm.due_date ? new Date(assignForm.due_date).toISOString() : null,
          max_score: parseFloat(assignForm.max_score) || 100,
          type: assignForm.type,
        }).eq('id', editAssignment.id);
        setToast({ msg: 'Assignment updated', type: 'success' });
      } else {
        const payload: AssignmentInsert = {
          course_id: assignForm.course_id, title: assignForm.title.trim(),
          description: assignForm.description.trim() || null,
          due_date: assignForm.due_date ? new Date(assignForm.due_date).toISOString() : null,
          max_score: parseFloat(assignForm.max_score) || 100,
          type: assignForm.type, created_by: profile.id,
        };
        await supabase.from('assignments').insert(payload);
        setToast({ msg: 'Assignment created', type: 'success' });
      }
      setShowAssignModal(false);
      fetchData();
    } catch (e: unknown) {
      setToast({ msg: e instanceof Error ? e.message : 'Failed to save assignment', type: 'error' });
    }
    setSaving(false);
  };

  const confirmDeleteAssignment = async () => {
    if (!deleteAssignment) return;
    setDeletingAssign(true);
    try {
      await supabase.from('assignments').delete().eq('id', deleteAssignment.id);
      setToast({ msg: 'Assignment deleted', type: 'success' });
      setDeleteAssignment(null);
      fetchData();
    } catch (e: unknown) {
      setToast({ msg: e instanceof Error ? e.message : 'Delete failed', type: 'error' });
    }
    setDeletingAssign(false);
  };

  return (
    <div className="space-y-5">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-900">LMS – Subjects & Assignments</h2>
        <div className="flex gap-2">
          {tab === 'courses' && (
            <button onClick={openAddCourse} className="flex items-center gap-1.5 px-4 py-2 bg-pink-600 text-white rounded-lg text-sm font-medium hover:bg-pink-700">
              <Plus className="w-4 h-4" /> Add Topic
            </button>
          )}
          {tab === 'assignments' && (
            <button onClick={openAddAssign} className="flex items-center gap-1.5 px-4 py-2 bg-pink-600 text-white rounded-lg text-sm font-medium hover:bg-pink-700">
              <Plus className="w-4 h-4" /> Add Assignment
            </button>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setTab('courses')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'courses' ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          <BookOpen className="w-4 h-4 inline mr-1.5 -mt-0.5" /> Subjects & Topics
        </button>
        <button onClick={() => setTab('assignments')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'assignments' ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          <FileText className="w-4 h-4 inline mr-1.5 -mt-0.5" /> Assignments
        </button>
      </div>
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" />
      </div>

      {tab === 'courses' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-16"><div className="w-8 h-8 border-4 border-pink-300 border-t-pink-600 rounded-full animate-spin" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs text-gray-500 uppercase">
                    <th className="py-3 px-4">Subject / Topic</th><th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Term</th><th className="py-3 px-4">Year</th><th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map(c => (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4"><p className="font-medium text-gray-800">{c.title}</p><p className="text-xs text-gray-500">{c.subject}</p></td>
                      <td className="py-3 px-4 text-gray-600">{c.classes?.name ?? '—'}</td>
                      <td className="py-3 px-4 text-gray-500">{c.term}</td>
                      <td className="py-3 px-4 text-gray-500 text-xs">{c.academic_year}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEditCourse(c)} className="p-1.5 hover:bg-yellow-50 rounded-lg text-yellow-500" title="Edit"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteCourse(c)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500" title="Delete"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredCourses.length === 0 && <tr><td colSpan={5} className="text-center py-10 text-gray-400"><Monitor className="w-8 h-8 mx-auto mb-2 opacity-40" />No courses found</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'assignments' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-16"><div className="w-8 h-8 border-4 border-pink-300 border-t-pink-600 rounded-full animate-spin" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs text-gray-500 uppercase">
                    <th className="py-3 px-4">Title</th><th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4">Type</th><th className="py-3 px-4">Max Score</th><th className="py-3 px-4">Due Date</th><th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignments.map(a => (
                    <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-800">{a.title}</td>
                      <td className="py-3 px-4 text-gray-500 text-xs">{a.courses?.subject} · {a.courses?.title}</td>
                      <td className="py-3 px-4 text-gray-600 capitalize">{a.type}</td>
                      <td className="py-3 px-4 text-gray-600">{a.max_score ?? 100}</td>
                      <td className="py-3 px-4 text-gray-500">{a.due_date ? new Date(a.due_date).toLocaleDateString() : '—'}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEditAssign(a)} className="p-1.5 hover:bg-yellow-50 rounded-lg text-yellow-500" title="Edit"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteAssignment(a)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500" title="Delete"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredAssignments.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-gray-400">No assignments found</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-lg">{editCourse ? 'Edit Topic' : 'Add Topic'}</h3>
              <button onClick={() => setShowCourseModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Subject *</label>
                <select value={courseForm.subject} onChange={e => setCourseForm(f => ({ ...f, subject: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500">
                  <option value="">Select subject…</option>
                  {subjectOptions.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Topic / Lesson Title *</label>
                <input value={courseForm.title} onChange={e => setCourseForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Chapter 3: Basic Algebra"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Lesson Notes / Materials</label>
                <textarea value={courseForm.description} onChange={e => setCourseForm(f => ({ ...f, description: e.target.value }))} rows={4}
                  placeholder="Type lesson notes, key points or resource URLs…"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 resize-y" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Class</label>
                <select value={courseForm.class_id} onChange={e => setCourseForm(f => ({ ...f, class_id: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500">
                  <option value="">No class assigned</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Teacher</label>
                <select value={courseForm.teacher_id} onChange={e => setCourseForm(f => ({ ...f, teacher_id: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500">
                  <option value="">No teacher assigned</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.profile_id}>{t.profiles?.first_name} {t.profiles?.last_name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Term</label>
                  <select value={courseForm.term} onChange={e => setCourseForm(f => ({ ...f, term: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500">
                    {TERMS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Academic Year</label>
                  <input value={courseForm.academic_year} onChange={e => setCourseForm(f => ({ ...f, academic_year: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setShowCourseModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={saveCourse} disabled={saving} className="flex-1 py-2.5 bg-pink-600 text-white rounded-xl text-sm font-medium hover:bg-pink-700 disabled:opacity-50">{saving ? 'Saving...' : editCourse ? 'Update Topic' : 'Create Topic'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-lg">{editAssignment ? 'Edit Assignment' : 'Add Assignment'}</h3>
              <button onClick={() => setShowAssignModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Subject / Topic *</label>
                <select value={assignForm.course_id} onChange={e => setAssignForm(f => ({ ...f, course_id: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  disabled={!!editAssignment}>
                  <option value="">Select topic…</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.subject} – {c.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
                <input value={assignForm.title} onChange={e => setAssignForm(f => ({ ...f, title: e.target.value }))} placeholder="Assignment title"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea value={assignForm.description} onChange={e => setAssignForm(f => ({ ...f, description: e.target.value }))} rows={2}
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
                <label className="block text-xs font-medium text-gray-600 mb-1">Due Date</label>
                <input type="datetime-local" value={assignForm.due_date} onChange={e => setAssignForm(f => ({ ...f, due_date: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setShowAssignModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={saveAssignment} disabled={saving} className="flex-1 py-2.5 bg-pink-600 text-white rounded-xl text-sm font-medium hover:bg-pink-700 disabled:opacity-50">{saving ? 'Saving...' : editAssignment ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Course Confirm */}
      {deleteCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-bold text-gray-800 text-lg mb-2">Remove Topic</h3>
            <p className="text-sm text-gray-600 mb-5">Remove topic "<span className="font-semibold">{deleteCourse.title}</span>"?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteCourse(null)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-700">Cancel</button>
              <button onClick={confirmDeleteCourse} disabled={deletingCourse} className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">{deletingCourse ? 'Removing...' : 'Remove'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Assignment Confirm */}
      {deleteAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-bold text-gray-800 text-lg mb-2">Delete Assignment</h3>
            <p className="text-sm text-gray-600 mb-5">Delete "<span className="font-semibold">{deleteAssignment.title}</span>"?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteAssignment(null)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-700">Cancel</button>
              <button onClick={confirmDeleteAssignment} disabled={deletingAssign} className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">{deletingAssign ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
