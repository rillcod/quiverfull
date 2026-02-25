import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, X, Link2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { ProfileRow, ParentRow } from '../../../lib/supabase';

interface ParentWithProfile extends ParentRow {
  profiles: { first_name: string; last_name: string; email: string; phone: string | null } | null;
  children?: { id: string; student_id: string; profiles: { first_name: string; last_name: string } | null }[];
}

interface Props { profile: ProfileRow; onNavigate?: (s: string) => void; }

export default function ParentsSection({ profile: _profile }: Props) {
  const [parents, setParents] = useState<ParentWithProfile[]>([]);
  const [students, setStudents] = useState<{ id: string; student_id: string; profiles: { first_name: string; last_name: string } | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showLink, setShowLink] = useState<ParentWithProfile | null>(null);
  const [linkStudentId, setLinkStudentId] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const { data: parentData } = await supabase.from('parents')
      .select('*, profiles:profile_id(first_name, last_name, email, phone)')
      .order('created_at', { ascending: false });
    const { data: studentData } = await supabase.from('students')
      .select('id, student_id, profiles:profile_id(first_name, last_name)')
      .eq('is_active', true);
    const { data: links } = await supabase.from('student_parents').select('parent_id, student_id');

    const withChildren = (parentData || []).map((p: ParentWithProfile) => {
      const childIds = (links || []).filter((l: { parent_id: string }) => l.parent_id === p.id).map((l: { student_id: string }) => l.student_id);
      const children = (studentData || []).filter((s: { id: string }) => childIds.includes(s.id));
      return { ...p, children };
    });
    setParents(withChildren);
    setStudents((studentData || []) as { id: string; student_id: string; profiles: { first_name: string; last_name: string } | null }[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = parents.filter(p => {
    const name = `${p.profiles?.first_name} ${p.profiles?.last_name}`.toLowerCase();
    return !search || name.includes(search.toLowerCase()) || p.profiles?.email?.toLowerCase().includes(search.toLowerCase());
  });

  const linkParentToStudent = async () => {
    if (!showLink || !linkStudentId) return;
    setSaving(true);
    try {
      await supabase.from('student_parents').upsert({ parent_id: showLink.id, student_id: linkStudentId, is_primary: false }, { onConflict: 'student_id,parent_id' });
      setShowLink(null); setLinkStudentId(''); fetchData();
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const unlink = async (parentId: string, studentId: string) => {
    await supabase.from('student_parents').delete().eq('parent_id', parentId).eq('student_id', studentId);
    fetchData();
  };

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-gray-900">Parents</h2>
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input placeholder="Search parents..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs text-gray-500 uppercase">
                  <th className="py-3 px-4">Parent</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Occupation</th>
                  <th className="py-3 px-4">Children</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-800">{p.profiles?.first_name} {p.profiles?.last_name}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-xs">{p.profiles?.email} {p.profiles?.phone ? `• ${p.profiles.phone}` : ''}</td>
                    <td className="py-3 px-4 text-gray-600">{p.occupation || '—'}</td>
                    <td className="py-3 px-4">
                      {(p.children || []).length === 0 ? (
                        <span className="text-gray-400">None linked</span>
                      ) : (
                        (p.children || []).map((c: { id: string; student_id: string; profiles: { first_name: string; last_name: string } | null }) => (
                          <span key={c.id} className="inline-flex items-center gap-1 mr-2 px-2 py-0.5 bg-gray-100 rounded text-xs">
                            {c.profiles?.first_name} {c.profiles?.last_name}
                            <button type="button" onClick={() => unlink(p.id, c.id)} className="text-red-500 hover:text-red-700">×</button>
                          </span>
                        ))
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => { setShowLink(p); setLinkStudentId(''); }} className="text-indigo-600 hover:text-indigo-700 text-sm flex items-center gap-1">
                        <Link2 className="w-4 h-4" /> Link student
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={5} className="text-center py-10 text-gray-400">No parents found. Parents are created when they register.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-gray-800 text-lg mb-4">Link parent to student</h3>
            <p className="text-sm text-gray-600 mb-3">{showLink.profiles?.first_name} {showLink.profiles?.last_name}</p>
            <select value={linkStudentId} onChange={e => setLinkStudentId(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4">
              <option value="">Select student...</option>
              {students.filter(s => !(showLink.children || []).some((c: { id: string }) => c.id === s.id)).map(s => (
                <option key={s.id} value={s.id}>{s.profiles?.first_name} {s.profiles?.last_name} ({s.student_id})</option>
              ))}
            </select>
            <div className="flex gap-3">
              <button onClick={() => setShowLink(null)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm">Cancel</button>
              <button onClick={linkParentToStudent} disabled={!linkStudentId || saving} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">Link</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
