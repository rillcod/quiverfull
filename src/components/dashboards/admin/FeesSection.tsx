import { useState, useEffect } from 'react';
import { DollarSign, Search, Plus, X, Download } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { ProfileRow, FeeRow, FeeInsert, FeeStatus } from '../../../lib/supabase';

interface Props { profile: ProfileRow; onNavigate?: (s: string) => void; }

interface FeeWithStudent extends FeeRow {
  students?: { student_id: string; profiles?: { first_name: string; last_name: string } } | null;
}

interface StudentOption {
  id: string;
  student_id: string;
  profiles?: { first_name: string; last_name: string } | null;
}

function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  return (
    <div className={`fixed bottom-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium flex items-center gap-2 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {msg} <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X className="w-4 h-4" /></button>
    </div>
  );
}

const STATUS_COLORS: Record<FeeStatus, string> = { paid: 'bg-green-100 text-green-700', partial: 'bg-blue-100 text-blue-700', pending: 'bg-yellow-100 text-yellow-700', overdue: 'bg-red-100 text-red-700' };
const FEE_TYPES = ['School Fees', 'Uniform', 'Books', 'Transport', 'Feeding', 'Exam Fees', 'Other'];
import { TERMS, getDefaultAcademicYear } from '../../../lib/academicConfig';

export default function FeesSection({ profile: _profile }: Props) {
  const [fees, setFees] = useState<FeeWithStudent[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FeeStatus | ''>('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [showPayment, setShowPayment] = useState<FeeWithStudent | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [showAddFee, setShowAddFee] = useState(false);
  const [addFeeForm, setAddFeeForm] = useState({
    student_id: '', fee_type: 'School Fees', amount: '', due_date: '', term: 'First Term' as string, academic_year: getDefaultAcademicYear(),
  });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from('fees').select('*, students:student_id(student_id, profiles:profile_id(first_name, last_name))').order('due_date', { ascending: false });
    setFees((data || []) as FeeWithStudent[]);
    const { data: studs } = await supabase.from('students').select('id, student_id, profiles:profile_id(first_name, last_name)').eq('is_active', true);
    setStudents((studs || []) as unknown as StudentOption[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = fees.filter(f => {
    const name = `${f.students?.profiles?.first_name} ${f.students?.profiles?.last_name}`.toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase()) || f.fee_type.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || f.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const recordPayment = async () => {
    if (!showPayment) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return setToast({ msg: 'Enter a valid amount', type: 'error' });
    setSaving(true);
    try {
      const newPaid = showPayment.paid_amount + amount;
      const status: FeeStatus = newPaid >= showPayment.amount ? 'paid' : 'partial';
      await supabase.from('fees').update({ paid_amount: newPaid, status }).eq('id', showPayment.id);
      setToast({ msg: 'Payment recorded', type: 'success' });
      setShowPayment(null); setPaymentAmount(''); fetchData();
    } catch (e: unknown) {
      setToast({ msg: e instanceof Error ? e.message : 'Failed to record payment', type: 'error' });
    }
    setSaving(false);
  };

  const addFee = async () => {
    if (!addFeeForm.student_id || !addFeeForm.amount || !addFeeForm.due_date)
      return setToast({ msg: 'Student, amount and due date are required', type: 'error' });
    const amount = parseFloat(addFeeForm.amount);
    if (isNaN(amount) || amount <= 0) return setToast({ msg: 'Enter a valid amount', type: 'error' });
    setSaving(true);
    try {
      const payload: FeeInsert = {
        student_id: addFeeForm.student_id,
        fee_type: addFeeForm.fee_type,
        amount, due_date: addFeeForm.due_date,
        term: addFeeForm.term, academic_year: addFeeForm.academic_year,
        paid_amount: 0, status: 'pending',
      };
      await supabase.from('fees').insert(payload);
      setToast({ msg: 'Fee record created', type: 'success' });
      setShowAddFee(false);
      setAddFeeForm({ student_id: '', fee_type: 'School Fees', amount: '', due_date: '', term: 'First Term' as string, academic_year: getDefaultAcademicYear() });
      fetchData();
    } catch (e: unknown) {
      setToast({ msg: e instanceof Error ? e.message : 'Failed to create fee', type: 'error' });
    }
    setSaving(false);
  };

  const exportCSV = () => {
    const rows: string[][] = [['Student', 'Fee Type', 'Amount', 'Paid', 'Balance', 'Due Date', 'Status']];
    filtered.forEach(f => rows.push([
      `${f.students?.profiles?.first_name ?? ''} ${f.students?.profiles?.last_name ?? ''}`.trim(),
      f.fee_type, String(f.amount), String(f.paid_amount),
      String(f.amount - f.paid_amount), f.due_date, f.status,
    ]));
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows.map(r => r.join(',')).join('\n'));
    a.download = 'fees.csv'; a.click();
  };

  return (
    <div className="space-y-5">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-900">Fees & Finance</h2>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={() => setShowAddFee(true)} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
            <Plus className="w-4 h-4" /> Add Fee
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input placeholder="Search by student or fee type..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as FeeStatus | '')}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option value="">All statuses</option>
          {(Object.keys(STATUS_COLORS) as FeeStatus[]).map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-16"><div className="w-8 h-8 border-4 border-emerald-300 border-t-emerald-600 rounded-full animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs text-gray-500 uppercase">
                  <th className="py-3 px-4">Student</th><th className="py-3 px-4">Fee Type</th>
                  <th className="py-3 px-4">Amount (₦)</th><th className="py-3 px-4">Paid (₦)</th>
                  <th className="py-3 px-4">Balance</th><th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th><th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(f => (
                  <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">{f.students?.profiles?.first_name} {f.students?.profiles?.last_name}</td>
                    <td className="py-3 px-4 text-gray-600">{f.fee_type}</td>
                    <td className="py-3 px-4 font-medium">₦{Number(f.amount).toLocaleString()}</td>
                    <td className="py-3 px-4 text-green-600">₦{Number(f.paid_amount).toLocaleString()}</td>
                    <td className="py-3 px-4 font-medium text-red-600">₦{(f.amount - f.paid_amount).toLocaleString()}</td>
                    <td className="py-3 px-4 text-gray-500">{new Date(f.due_date).toLocaleDateString()}</td>
                    <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[f.status]}`}>{f.status}</span></td>
                    <td className="py-3 px-4">
                      {f.status !== 'paid' && (
                        <button onClick={() => { setShowPayment(f); setPaymentAmount(String(f.amount - f.paid_amount)); }} className="text-emerald-600 hover:underline text-xs font-medium">Record payment</button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={8} className="text-center py-10 text-gray-400">No fee records found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 text-lg">Record Payment</h3>
              <button onClick={() => { setShowPayment(null); setPaymentAmount(''); }} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <p className="text-sm text-gray-600 mb-1">{showPayment.students?.profiles?.first_name} {showPayment.students?.profiles?.last_name} · {showPayment.fee_type}</p>
            <p className="text-xs text-gray-500 mb-4">Balance: ₦{(showPayment.amount - showPayment.paid_amount).toLocaleString()}</p>
            <input type="number" step="0.01" min="0" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Amount (₦)" />
            <div className="flex gap-3">
              <button onClick={() => { setShowPayment(null); setPaymentAmount(''); }} className="flex-1 py-2 border border-gray-300 rounded-xl text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={recordPayment} disabled={saving} className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Fee Modal */}
      {showAddFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2"><DollarSign className="w-5 h-5 text-emerald-500" /> Add Fee Record</h3>
              <button onClick={() => setShowAddFee(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Student *</label>
                <select value={addFeeForm.student_id} onChange={e => setAddFeeForm(f => ({ ...f, student_id: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="">Select student...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.profiles?.first_name} {s.profiles?.last_name} ({s.student_id})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Fee Type</label>
                <select value={addFeeForm.fee_type} onChange={e => setAddFeeForm(f => ({ ...f, fee_type: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  {FEE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Amount (₦) *</label>
                  <input type="number" min={0} step={100} value={addFeeForm.amount} onChange={e => setAddFeeForm(f => ({ ...f, amount: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Due Date *</label>
                  <input type="date" value={addFeeForm.due_date} onChange={e => setAddFeeForm(f => ({ ...f, due_date: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Term</label>
                  <select value={addFeeForm.term} onChange={e => setAddFeeForm(f => ({ ...f, term: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    {TERMS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Academic Year</label>
                  <input value={addFeeForm.academic_year} onChange={e => setAddFeeForm(f => ({ ...f, academic_year: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setShowAddFee(false)} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={addFee} disabled={saving} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">{saving ? 'Saving...' : 'Create Fee'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
