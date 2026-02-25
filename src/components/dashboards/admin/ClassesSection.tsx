import { useState, useEffect } from 'react';
import { Plus, Edit2, X, Search } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { getDefaultAcademicYear } from '../../../lib/academicConfig';
import type { ProfileRow, ClassRow, ClassInsert, ClassLevel } from '../../../lib/supabase';

interface Props { profile: ProfileRow; onNavigate?: (s: string) => void; }

/** classes.teacher_id references profiles(id), so we get profile name via profiles:teacher_id */
interface ClassWithProfile extends ClassRow {
  profiles?: { first_name: string; last_name: string } | null;
  student_count?: number;
}

const LEVEL_LABELS: Record<ClassLevel, string> = { creche: 'Creche', basic1: 'Basic 1', basic2: 'Basic 2', basic3: 'Basic 3', basic4: 'Basic 4', basic5: 'Basic 5', basic6: 'Basic 6' };

function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  return (
    <div className={`fixed bottom-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium flex items-center gap-2 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {msg} <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X className="w-4 h-4" /></button>
    </div>
  );
}

export default function ClassesSection({ profile: _profile }: Props) {
  const [classes, setClasses] = useState<ClassWithProfile[]>([]);
  /** Teachers list: we need profile_id for classes.teacher_id (FK to profiles) */
  const [teachers, setTeachers] = useState<{ id: string; profile_id: string; profiles: { first_name: string; last_name: string } | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ClassWithProfile | null>(null);
  const [form, setForm] = useState<{ name: string; level: ClassLevel; academic_year: string; teacher_id: string; capacity: string }>({
    name: '', level: 'basic1', academic_year: getDefaultAcademicYear(), teacher_id: '', capacity: '25',
  });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const { data: classData } = await supabase.from('classes').select('*, profiles:teacher_id(first_name, last_name)').order('name');
    const { data: countData } = await supabase.from('students').select('class_id').eq('is_active', true);
    const countByClass: Record<string, number> = {};
    (countData || []).forEach((s: { class_id: string | null }) => {
      if (s.class_id) countByClass[s.class_id] = (countByClass[s.class_id] || 0) + 1;
    });
    const withCount = (classData || []).map((c: ClassWithProfile) => ({ ...c, student_count: countByClass[c.id] || 0 }));
    setClasses(withCount);
    const { data: teacherData } = await supabase.from('teachers').select('id, profile_id, profiles:profile_id(first_name, last_name)').eq('is_active', true);
    setTeachers((teacherData || []) as unknown as { id: string; profile_id: string; profiles: { first_name: string; last_name: string } | null }[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = classes.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || LEVEL_LABELS[c.level].toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', level: 'basic1', academic_year: getDefaultAcademicYear(), teacher_id: '', capacity: '25' });
    setShowModal(true);
  };

  const openEdit = (c: ClassWithProfile) => {
    setEditing(c);
    setForm({
      name: c.name,
      level: c.level,
      academic_year: c.academic_year,
      teacher_id: c.teacher_id || '',
      capacity: String(c.capacity ?? 25),
    });
    setShowModal(true);
  };

  const save = async () => {
    if (!form.name.trim()) return setToast({ msg: 'Class name is required', type: 'error' });
    setSaving(true);
    try {
      const payload: ClassInsert = {
        name: form.name.trim(),
        level: form.level,
        academic_year: form.academic_year,
        teacher_id: form.teacher_id || null,
        capacity: parseInt(form.capacity, 10) || 25,
      };
      if (editing) {
        await supabase.from('classes').update(payload).eq('id', editing.id);
        setToast({ msg: 'Class updated', type: 'success' });
      } else {
        await supabase.from('classes').insert(payload);
        setToast({ msg: 'Class created', type: 'success' });
      }
      setShowModal(false);
      fetchData();
    } catch (e: unknown) {
      setToast({ msg: e instanceof Error ? e.message : 'Failed to save', type: 'error' });
    }
    setSaving(false);
  };

  return (
    <div className="space-y-5">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-900">Classes</h2>
        <button onClick={openAdd} className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700">
          <Plus className="w-4 h-4" /> Add Class
        </button>
      </div>
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input placeholder="Search classes..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-16"><div className="w-8 h-8 border-4 border-violet-300 border-t-violet-600 rounded-full animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs text-gray-500 uppercase">
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Level</th>
                  <th className="py-3 px-4">Teacher</th>
                  <th className="py-3 px-4">Students</th>
                  <th className="py-3 px-4">Year</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">{c.name}</td>
                    <td className="py-3 px-4 text-gray-600">{LEVEL_LABELS[c.level]}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {c.profiles ? `${c.profiles.first_name} ${c.profiles.last_name}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{c.student_count ?? 0}</td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{c.academic_year}</td>
                    <td className="py-3 px-4">
                      <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-violet-50 rounded-lg text-violet-500" title="Edit"><Edit2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-gray-400">No classes found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-lg">{editing ? 'Edit Class' : 'Add Class'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Class Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="e.g. Primary 1A" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Level</label>
                <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value as ClassLevel }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
                  {(Object.keys(LEVEL_LABELS) as ClassLevel[]).map(l => <option key={l} value={l}>{LEVEL_LABELS[l]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Academic Year</label>
                <input value={form.academic_year} onChange={e => setForm(f => ({ ...f, academic_year: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Class Teacher</label>
                <select value={form.teacher_id} onChange={e => setForm(f => ({ ...f, teacher_id: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
                  <option value="">No teacher assigned</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.profile_id}>{t.profiles ? `${t.profiles.first_name} ${t.profiles.last_name}` : t.profile_id}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Capacity</label>
                <input type="number" min={1} value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
