import React, { useState, useEffect } from 'react';
import { Bus, Plus, Search } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { ProfileRow, TransportRow, TransportInsert } from '../../../lib/supabase';

interface TransportWithStudent extends TransportRow {
  students?: { student_id: string; profiles?: { first_name: string; last_name: string } | null } | null;
}

interface Props { profile: ProfileRow; onNavigate?: (s: string) => void; }

export default function TransportSection({ profile: _profile }: Props) {
  const [transports, setTransports] = useState<TransportWithStudent[]>([]);
  const [students, setStudents] = useState<{ id: string; student_id: string; profiles: { first_name: string; last_name: string } | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    student_id: '',
    route_name: '',
    pickup_location: '',
    pickup_time: '07:30',
    dropoff_location: '',
    dropoff_time: '15:30',
    monthly_fee: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from('transport')
      .select('*, students:student_id(student_id, profiles:profile_id(first_name, last_name))')
      .order('route_name');
    setTransports((data || []) as TransportWithStudent[]);
    const { data: studs } = await supabase.from('students').select('id, student_id, profiles:profile_id(first_name, last_name)').eq('is_active', true);
    setStudents((studs || []) as { id: string; student_id: string; profiles: { first_name: string; last_name: string } | null }[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = transports.filter(t => {
    const name = `${t.students?.profiles?.first_name} ${t.students?.profiles?.last_name}`.toLowerCase();
    return !search || name.includes(search.toLowerCase()) || t.route_name?.toLowerCase().includes(search.toLowerCase());
  });

  const addTransport = async () => {
    if (!form.student_id || !form.route_name || !form.pickup_location || !form.dropoff_location) return;
    setSaving(true);
    try {
      const payload: TransportInsert = {
        student_id: form.student_id,
        route_name: form.route_name,
        pickup_location: form.pickup_location,
        pickup_time: form.pickup_time,
        dropoff_location: form.dropoff_location,
        dropoff_time: form.dropoff_time,
        monthly_fee: form.monthly_fee ? parseFloat(form.monthly_fee) : null,
      };
      await supabase.from('transport').insert(payload);
      setShowAdd(false);
      setForm({ student_id: '', route_name: '', pickup_location: '', pickup_time: '07:30', dropoff_location: '', dropoff_time: '15:30', monthly_fee: '' });
      fetchData();
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const toggleActive = async (t: TransportWithStudent) => {
    await supabase.from('transport').update({ is_active: !t.is_active }).eq('id', t.id);
    fetchData();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Transport</h2>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700">
          <Plus className="w-4 h-4" /> Add Route
        </button>
      </div>
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input placeholder="Search by student or route..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-amber-300 border-t-amber-600 rounded-full animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs text-gray-500 uppercase">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Route</th>
                  <th className="py-3 px-4">Pickup</th>
                  <th className="py-3 px-4">Dropoff</th>
                  <th className="py-3 px-4">Monthly Fee</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">{t.students?.profiles?.first_name} {t.students?.profiles?.last_name}</td>
                    <td className="py-3 px-4 text-gray-600">{t.route_name}</td>
                    <td className="py-3 px-4 text-gray-600 text-xs">{t.pickup_location} @ {t.pickup_time}</td>
                    <td className="py-3 px-4 text-gray-600 text-xs">{t.dropoff_location} @ {t.dropoff_time}</td>
                    <td className="py-3 px-4">{t.monthly_fee != null ? `₦${Number(t.monthly_fee).toLocaleString()}` : '—'}</td>
                    <td className="py-3 px-4">
                      <button onClick={() => toggleActive(t)} className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {t.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-gray-400">No transport records</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
            <h3 className="font-bold text-gray-800 text-lg mb-4">Add Transport Route</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Student *</label>
                <select value={form.student_id} onChange={e => setForm(f => ({ ...f, student_id: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <option value="">Select...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.profiles?.first_name} {s.profiles?.last_name} ({s.student_id})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Route name *</label>
                <input value={form.route_name} onChange={e => setForm(f => ({ ...f, route_name: e.target.value }))} placeholder="e.g. Route A" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Pickup location *</label>
                <input value={form.pickup_location} onChange={e => setForm(f => ({ ...f, pickup_location: e.target.value }))} placeholder="Address" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Pickup time</label>
                <input type="time" value={form.pickup_time} onChange={e => setForm(f => ({ ...f, pickup_time: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Dropoff location *</label>
                <input value={form.dropoff_location} onChange={e => setForm(f => ({ ...f, dropoff_location: e.target.value }))} placeholder="School" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Dropoff time</label>
                <input type="time" value={form.dropoff_time} onChange={e => setForm(f => ({ ...f, dropoff_time: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Monthly fee (₦)</label>
                <input type="number" value={form.monthly_fee} onChange={e => setForm(f => ({ ...f, monthly_fee: e.target.value }))} placeholder="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm">Cancel</button>
              <button onClick={addTransport} disabled={saving} className="flex-1 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
