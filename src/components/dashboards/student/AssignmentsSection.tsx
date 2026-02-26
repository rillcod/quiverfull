import { useState, useEffect } from 'react';
import { FileText, AlertCircle, Send, X, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useStudentData } from './useStudentData';
import type { ProfileRow, AssignmentRow, SubmissionRow } from '../../../lib/supabase';

interface Props { profile: ProfileRow; onNavigate?: (s: string) => void; }

interface AssignmentWithCourse extends AssignmentRow {
  courses?: { title: string; subject: string; class_id: string | null } | null;
}

function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  return (
    <div className={`fixed bottom-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium flex items-center gap-2 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {msg} <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X className="w-4 h-4" /></button>
    </div>
  );
}

const typeColor: Record<string, string> = {
  homework: 'bg-blue-100 text-blue-700',
  quiz: 'bg-purple-100 text-purple-700',
  exam: 'bg-red-100 text-red-700',
  project: 'bg-orange-100 text-orange-700',
  classwork: 'bg-green-100 text-green-700',
};

export default function AssignmentsSection({ profile }: Props) {
  const { student, loading: studentLoading, error: studentError } = useStudentData(profile.id);
  const [classAssignments, setClassAssignments] = useState<AssignmentWithCourse[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Submit modal state
  const [submitTarget, setSubmitTarget] = useState<AssignmentWithCourse | null>(null);
  const [submitContent, setSubmitContent] = useState('');
  const [submitUrl, setSubmitUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAssignments = async (studentId: string, classId: string) => {
    setLoading(true);
    try {
      // Get courses for this class
      const { data: courses } = await supabase
        .from('courses')
        .select('id')
        .eq('class_id', classId)
        .eq('is_active', true);

      const courseIds = (courses || []).map((c: { id: string }) => c.id);

      if (courseIds.length > 0) {
        const [{ data: assigns }, { data: subs }] = await Promise.all([
          supabase
            .from('assignments')
            .select('*, courses:course_id(title, subject, class_id)')
            .in('course_id', courseIds)
            .order('due_date', { ascending: false }),
          supabase
            .from('submissions')
            .select('*')
            .eq('student_id', studentId),
        ]);
        setClassAssignments((assigns || []) as AssignmentWithCourse[]);
        setSubmissions((subs || []) as SubmissionRow[]);
      } else {
        setClassAssignments([]);
        setSubmissions([]);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!student) return;
    if (student.class_id) {
      fetchAssignments(student.id, student.class_id);
    } else {
      setLoading(false);
    }
  }, [student]);

  const getSubmission = (assignmentId: string) =>
    submissions.find(s => s.assignment_id === assignmentId) || null;

  const openSubmit = (assignment: AssignmentWithCourse) => {
    const existing = getSubmission(assignment.id);
    setSubmitTarget(assignment);
    setSubmitContent(existing?.content || '');
    setSubmitUrl(existing?.file_url || '');
  };

  const submitAssignment = async () => {
    if (!submitTarget || !student) return;
    if (!submitContent.trim() && !submitUrl.trim()) {
      return setToast({ msg: 'Please provide content or a URL', type: 'error' });
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('submissions').upsert(
        {
          assignment_id: submitTarget.id,
          student_id: student.id,
          content: submitContent.trim() || null,
          file_url: submitUrl.trim() || null,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
        },
        { onConflict: 'assignment_id,student_id' }
      );
      if (error) throw error;
      setToast({ msg: 'Assignment submitted successfully', type: 'success' });
      setSubmitTarget(null);
      setSubmitContent('');
      setSubmitUrl('');
      // Refresh submissions
      if (student.class_id) fetchAssignments(student.id, student.class_id);
    } catch (e: unknown) {
      setToast({ msg: e instanceof Error ? e.message : 'Submission failed', type: 'error' });
    }
    setSubmitting(false);
  };

  if (studentLoading || loading) return (
    <div className="flex justify-center items-center h-40">
      <div className="w-8 h-8 border-4 border-pink-300 border-t-pink-600 rounded-full animate-spin" />
    </div>
  );

  if (studentError) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-3">
      <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
      <div><h3 className="font-semibold text-red-800">Something went wrong</h3><p className="text-sm text-red-700 mt-1">{studentError}</p></div>
    </div>
  );

  if (!student) return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex items-start gap-3">
      <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
      <div><h3 className="font-semibold text-amber-800">No student record found</h3><p className="text-sm text-amber-700 mt-1">Please contact your school administrator.</p></div>
    </div>
  );

  return (
    <div className="space-y-5">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <h2 className="text-xl font-bold text-gray-900">My Assignments</h2>

      {classAssignments.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>No assignments yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classAssignments.map(a => {
            const submission = getSubmission(a.id);
            const isOverdue = a.due_date && new Date(a.due_date) < new Date() && !submission;
            return (
              <div key={a.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{a.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {a.courses?.subject} · {a.courses?.title}
                    </p>
                  </div>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${typeColor[a.type] || 'bg-gray-100 text-gray-600'}`}>
                    {a.type}
                  </span>
                </div>

                {a.description && (
                  <p className="text-sm text-gray-600 mb-3">{a.description}</p>
                )}

                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                    Due: {a.due_date ? new Date(a.due_date).toLocaleDateString() : 'No deadline'}
                    {isOverdue && ' · Overdue'}
                  </span>
                  <div className="flex items-center gap-2">
                    {submission?.score != null && (
                      <span className="text-xs font-medium text-blue-600">{submission.score}/{a.max_score}</span>
                    )}
                    {!submission ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                        <Clock className="w-3 h-3" /> Not submitted
                      </span>
                    ) : submission.status === 'graded' ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        <CheckCircle className="w-3 h-3" /> Graded
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3" /> Submitted
                      </span>
                    )}
                  </div>
                </div>

                {submission?.feedback && (
                  <div className="mb-3 p-2 bg-blue-50 rounded-lg text-xs text-blue-700">
                    <span className="font-medium">Feedback: </span>{submission.feedback}
                  </div>
                )}

                {/* Submit / Resubmit button */}
                {submission?.status !== 'graded' && (
                  <button
                    onClick={() => openSubmit(a)}
                    className="flex items-center gap-1.5 w-full justify-center px-3 py-2 bg-pink-600 text-white rounded-lg text-xs font-medium hover:bg-pink-700 mt-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {submission ? 'Resubmit' : 'Submit Assignment'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Submit modal */}
      {submitTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">Submit Assignment</h3>
                <p className="text-xs text-gray-500 mt-0.5">{submitTarget.title}</p>
              </div>
              <button onClick={() => setSubmitTarget(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Your Answer / Work</label>
                <textarea
                  rows={5}
                  value={submitContent}
                  onChange={e => setSubmitContent(e.target.value)}
                  placeholder="Type your answer or describe your work here..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">File / Link URL (optional)</label>
                <input
                  value={submitUrl}
                  onChange={e => setSubmitUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setSubmitTarget(null)} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={submitAssignment} disabled={submitting}
                className="flex-1 py-2.5 bg-pink-600 text-white rounded-xl text-sm font-medium hover:bg-pink-700 disabled:opacity-50 flex items-center justify-center gap-2">
                <Send className="w-4 h-4" />
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
