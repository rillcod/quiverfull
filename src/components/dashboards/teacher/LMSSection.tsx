import { useState, useEffect } from 'react';
import { BookOpen, FileText, Monitor, Plus, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { TERMS, getDefaultAcademicYear } from '../../../lib/academicConfig';
import type { ProfileRow, ClassRow, CourseRow, CourseInsert, AssignmentRow, AssignmentInsert, AssignmentType, ClassLevel } from '../../../lib/supabase';

interface Props { profile: ProfileRow; onNavigate?: (s: string) => void; }

const ASSIGNMENT_TYPES: AssignmentType[] = ['homework', 'quiz', 'exam', 'project', 'classwork'];

interface CourseWithClass extends CourseRow { classes?: { name: string; level: ClassLevel } | null; }
interface AssignmentWithCourse extends AssignmentRow { courses?: { title: string; subject: string } | null; }

function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  return (
    <div className={`fixed bottom-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium flex items-center gap-2 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {msg} <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X className="w-4 h-4" /></button>
    </div>
  );
}

export default function LMSSection({ profile }: Props) {
  const [courses, setCourses] = useState<CourseWithClass[]>([]);
  const [assignments, setAssignments] = useState<AssignmentWithCourse[]>([]);
  const [classes, setClasses] = useState<Pick<ClassRow, 'id' | 'name'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'courses' | 'assignments'>('courses');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [courseForm, setCourseForm] = useState({ subject: '', title: '', description: '', class_id: '', term: 'First Term' as string, academic_year: getDefaultAcademicYear() });
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({ course_id: '', title: '', description: '', due_date: '', max_score: '100', type: 'homework' as AssignmentType });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: courseData }, { data: classData }] = await Promise.all([
      supabase.from('courses').select('*, classes:class_id(name, level)').eq('teacher_id', profile.id).eq('is_active', true).order('created_at', { ascending: false }),
      supabase.from('classes').select('id, name').eq('teacher_id', profile.id).order('name'),
    ]);
    setCourses((courseData || []) as CourseWithClass[]);
    setClasses((classData || []) as Pick<ClassRow, 'id' | 'name'>[]);
    const courseIds = (courseData || []).map((c: { id: string }) => c.id);
    if (courseIds.length > 0) {
      const { data: assignData } = await supabase.from('assignments')
        .select('*, courses:course_id(title, subject)')
        .in('course_id', courseIds)
        .order('created_at', { ascending: false })
        .limit(50);
      setAssignments((assignData || []) as AssignmentWithCourse[]);
    } else {
      setAssignments([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [profile.id]);

  const addCourse = async () => {
    if (!courseForm.subject.trim() || !courseForm.title.trim()) return setToast({ msg: 'Subject and title are required', type: 'error' });
    setSaving(true);
    try {
      const payload: CourseInsert = {
        subject: courseForm.subject.trim(), title: courseForm.title.trim(),
        description: courseForm.description.trim() || null,
        class_id: courseForm.class_id || null, teacher_id: profile.id,
        term: courseForm.term, academic_year: courseForm.academic_year,
      };
      await supabase.from('courses').insert(payload);
      setToast({ msg: 'Course created', type: 'success' });
      setShowAddCourse(false);
      setCourseForm({ subject: '', title: '', description: '', class_id: '', term: 'First Term' as string, academic_year: getDefaultAcademicYear() });
      fetchData();
    } catch (e: unknown) {
      setToast({ msg: e instanceof Error ? e.message : 'Failed to create course', type: 'error' });
    }
    setSaving(false);
  };

  const addAssignment = async () => {
    if (!assignForm.course_id || !assignForm.title.trim()) return setToast({ msg: 'Course and title are required', type: 'error' });
    setSaving(true);
    try {
      const payload: AssignmentInsert = {
        course_id: assignForm.course_id, title: assignForm.title.trim(),
        description: assignForm.description.trim() || null,
        due_date: assignForm.due_date ? new Date(assignForm.due_date).toISOString() : null, max_score: parseFloat(assignForm.max_score) || 100,
        type: assignForm.type, created_by: profile.id,
      };
      await supabase.from('assignments').insert(payload);
      setToast({ msg: 'Assignment created', type: 'success' });
      setShowAssignModal(false);
      setAssignForm({ course_id: '', title: '', description: '', due_date: '', max_score: '100', type: 'homework' });
      fetchData();
    } catch (e: unknown) {
      setToast({ msg: e instanceof Error ? e.message : 'Failed to create assignment', type: 'error' });
    }
    setSaving(false);
  };

  return (
    <div className="space-y-5">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-900">My LMS</h2>
        <div className="flex gap-2">
          {tab === 'courses' && <button onClick={() => setShowAddCourse(true)} className="flex items-center gap-1.5 px-4 py-2 bg-pink-600 text-white rounded-lg text-sm font-medium hover:bg-pink-700"><Plus className="w-4 h-4" /> Add Course</button>}
          {tab === 'assignments' && <button onClick={() => setShowAssignModal(true)} className="flex items-center gap-1.5 px-4 py-2 bg-pink-600 text-white rounded-lg text-sm font-medium hover:bg-pink-700"><Plus className="w-4 h-4" /> Add Assignment</button>}
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setTab('courses')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'courses' ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><BookOpen className="w-4 h-4 inline mr-1.5 -mt-0.5" /> My Courses</button>
        <button onClick={() => setTab('assignments')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'assignments' ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><FileText className="w-4 h-4 inline mr-1.5 -mt-0.5" /> My Assignments</button>
      </div>
      {loading ? (
        <div className="flex justify-center items-center py-16"><div className="w-8 h-8 border-4 border-pink-300 border-t-pink-600 rounded-full animate-spin" /></div>
      ) : tab === 'courses' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-gray-400"><Monitor className="w-10 h-10 mx-auto mb-3 opacity-40" /><p>No courses yet. Click "Add Course" to create one.</p></div>
          ) : courses.map(c => (
            <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-2">
                <div><h3 className="font-semibold text-gray-800">{c.title}</h3><p className="text-xs text-pink-600 font-medium mt-0.5">{c.subject}</p></div>
                <span className="px-2 py-0.5 bg-pink-100 text-pink-700 rounded-full text-xs">{c.term}</span>
              </div>
              {c.description && <p className="text-sm text-gray-500 mb-2">{c.description}</p>}
              <p className="text-xs text-gray-400">{c.classes?.name || 'No class'} · {c.academic_year}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase bg-gray-50">
                <th className="py-3 px-4">Title</th><th className="py-3 px-4">Course</th><th className="py-3 px-4">Type</th><th className="py-3 px-4">Max Score</th><th className="py-3 px-4">Due Date</th>
              </tr></thead>
              <tbody>
                {assignments.map(a => (
                  <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">{a.title}</td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{a.courses?.subject} · {a.courses?.title}</td>
                    <td className="py-3 px-4 text-gray-600 capitalize">{a.type}</td>
                    <td className="py-3 px-4 text-gray-600">{a.max_score ?? 100}</td>
                    <td className="py-3 px-4 text-gray-500">{a.due_date ? new Date(a.due_date).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
                {assignments.length === 0 && <tr><td colSpan={5} className="text-center py-10 text-gray-400">No assignments yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAddCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-lg">Add Course</h3>
              <button onClick={() => setShowAddCourse(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-3">
              <input value={courseForm.subject} onChange={e => setCourseForm(f => ({ ...f, subject: e.target.value }))} placeholder="Subject *" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" />
              <input value={courseForm.title} onChange={e => setCourseForm(f => ({ ...f, title: e.target.value }))} placeholder="Course Title *" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" />
              <textarea value={courseForm.description} onChange={e => setCourseForm(f => ({ ...f, description: e.target.value }))} placeholder="Description (optional)" rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none" />
              <select value={courseForm.class_id} onChange={e => setCourseForm(f => ({ ...f, class_id: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500">
                <option value="">No class assigned</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <select value={courseForm.term} onChange={e => setCourseForm(f => ({ ...f, term: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500">
                  {TERMS.map(t => <option key={t}>{t}</option>)}
                </select>
                <input value={courseForm.academic_year} onChange={e => setCourseForm(f => ({ ...f, academic_year: e.target.value }))} placeholder="Academic Year" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setShowAddCourse(false)} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={addCourse} disabled={saving} className="flex-1 py-2.5 bg-pink-600 text-white rounded-xl text-sm font-medium hover:bg-pink-700 disabled:opacity-50">{saving ? 'Saving...' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-lg">Add Assignment</h3>
              <button onClick={() => setShowAssignModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-3">
              <select value={assignForm.course_id} onChange={e => setAssignForm(f => ({ ...f, course_id: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500">
                <option value="">Select course...</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.subject} – {c.title}</option>)}
              </select>
              <input value={assignForm.title} onChange={e => setAssignForm(f => ({ ...f, title: e.target.value }))} placeholder="Assignment title *" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" />
              <textarea value={assignForm.description} onChange={e => setAssignForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none" />
              <div className="grid grid-cols-2 gap-3">
                <select value={assignForm.type} onChange={e => setAssignForm(f => ({ ...f, type: e.target.value as AssignmentType }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500">
                  {ASSIGNMENT_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                </select>
                <input type="number" min={1} value={assignForm.max_score} onChange={e => setAssignForm(f => ({ ...f, max_score: e.target.value }))} placeholder="Max Score" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" />
              </div>
              <input type="datetime-local" value={assignForm.due_date} onChange={e => setAssignForm(f => ({ ...f, due_date: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" />
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setShowAssignModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={addAssignment} disabled={saving} className="flex-1 py-2.5 bg-pink-600 text-white rounded-xl text-sm font-medium hover:bg-pink-700 disabled:opacity-50">{saving ? 'Saving...' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
