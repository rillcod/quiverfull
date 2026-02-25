import { FileText, AlertCircle } from 'lucide-react';
import { useStudentData } from './useStudentData';
import type { ProfileRow } from '../../../lib/supabase';

interface Props { profile: ProfileRow; onNavigate?: (s: string) => void; }

export default function AssignmentsSection({ profile }: Props) {
  const { assignments, loading, error, student } = useStudentData(profile.id);
  const typeColor: Record<string, string> = { homework: 'bg-blue-100 text-blue-700', quiz: 'bg-purple-100 text-purple-700', exam: 'bg-red-100 text-red-700', project: 'bg-orange-100 text-orange-700', classwork: 'bg-green-100 text-green-700' };
  const statusColor: Record<string, string> = { submitted: 'bg-green-100 text-green-700', graded: 'bg-blue-100 text-blue-700', returned: 'bg-purple-100 text-purple-700', late: 'bg-red-100 text-red-700' };

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

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-gray-900">My Assignments</h2>
      {assignments.length === 0 ? (
        <div className="text-center py-16 text-gray-400"><FileText className="w-12 h-12 mx-auto mb-3 opacity-40" /><p>No assignments yet</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map(a => (
            <div key={a.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{a.assignments?.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{a.assignments?.courses?.subject} · {a.assignments?.courses?.title}</p>
                </div>
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${typeColor[a.assignments?.type ?? ''] || 'bg-gray-100 text-gray-600'}`}>{a.assignments?.type}</span>
              </div>
              {a.assignments?.description && <p className="text-sm text-gray-600 mb-3">{a.assignments.description}</p>}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Due: {a.assignments?.due_date ? new Date(a.assignments.due_date).toLocaleDateString() : 'No deadline'}</span>
                <div className="flex items-center gap-2">
                  {a.score != null && <span className="text-xs font-medium text-blue-600">{a.score}/{a.assignments?.max_score}</span>}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColor[a.status] || 'bg-gray-100 text-gray-600'}`}>{a.status}</span>
                </div>
              </div>
              {a.feedback && <div className="mt-3 p-2 bg-blue-50 rounded-lg text-xs text-blue-700"><span className="font-medium">Feedback: </span>{a.feedback}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
