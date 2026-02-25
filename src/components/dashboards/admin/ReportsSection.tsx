import { useState, useEffect } from 'react';
import { Download, RefreshCw, BarChart3, Users, DollarSign, ClipboardCheck } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useSchoolSettings } from '../../../hooks/useSchoolSettings';
import type { ProfileRow, FeeRow, AttendanceStatus } from '../../../lib/supabase';

interface Props { profile: ProfileRow; onNavigate?: (s: string) => void; }

export default function ReportsSection({ profile: _profile, onNavigate }: Props) {
  const { currency } = useSchoolSettings();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalRevenue: 0,
    pendingFees: 0,
    overdueFees: 0,
    attendanceRate: 0,
    presentThisWeek: 0,
    totalAttendanceRecords: 0,
  });

  const fetchReport = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

    const [
      { count: studentCount },
      { count: teacherCount },
      { count: classCount },
      { data: feesData },
      { data: attData },
    ] = await Promise.all([
      supabase.from('students').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('teachers').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('classes').select('*', { count: 'exact', head: true }),
      supabase.from('fees').select('amount, paid_amount, status'),
      supabase.from('attendance').select('status').gte('date', weekAgo).lte('date', today),
    ]);

    const feeRows = (feesData || []) as Pick<FeeRow, 'amount' | 'paid_amount' | 'status'>[];
    const totalRevenue = feeRows.reduce((s, f) => s + (f.paid_amount ?? 0), 0);
    const pendingFees = feeRows.filter(f => f.status === 'pending' || f.status === 'partial').reduce((s, f) => s + ((f.amount ?? 0) - (f.paid_amount ?? 0)), 0);
    const overdueFees = feeRows.filter(f => f.status === 'overdue').reduce((s, f) => s + ((f.amount ?? 0) - (f.paid_amount ?? 0)), 0);

    const attList = (attData || []) as { status: AttendanceStatus }[];
    const presentThisWeek = attList.filter(a => a.status === 'present').length;
    const attendanceRate = attList.length ? Math.round((presentThisWeek / attList.length) * 100) : 0;

    setStats({
      totalStudents: studentCount ?? 0,
      totalTeachers: teacherCount ?? 0,
      totalClasses: classCount ?? 0,
      totalRevenue,
      pendingFees,
      overdueFees,
      attendanceRate,
      presentThisWeek,
      totalAttendanceRecords: attList.length,
    });
    setLoading(false);
  };

  useEffect(() => { fetchReport(); }, []);

  const exportSummary = () => {
    const lines = [
      'Quiverfull School – Summary Report',
      `Generated: ${new Date().toLocaleString()}`,
      '',
      'Enrollment',
      `  Students: ${stats.totalStudents}`,
      `  Teachers: ${stats.totalTeachers}`,
      `  Classes: ${stats.totalClasses}`,
      '',
      `Finance (${currency})`,
      `  Total revenue: ${currency}${stats.totalRevenue.toLocaleString()}`,
      `  Pending fees: ${currency}${stats.pendingFees.toLocaleString()}`,
      `  Overdue: ${currency}${stats.overdueFees.toLocaleString()}`,
      '',
      'Attendance (last 7 days)',
      `  Present: ${stats.presentThisWeek}`,
      `  Records: ${stats.totalAttendanceRecords}`,
      `  Rate: ${stats.attendanceRate}%`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  if (loading) return (
    <div className="flex justify-center items-center py-16"><div className="w-8 h-8 border-4 border-red-300 border-t-red-600 rounded-full animate-spin" /></div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-900">Reports & Analytics</h2>
        <div className="flex gap-2">
          <button onClick={fetchReport} className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={exportSummary} className="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
            <Download className="w-4 h-4" /> Export Summary
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span className="text-xs font-medium text-gray-500">Students</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
          {onNavigate && <button onClick={() => onNavigate('students')} className="text-xs text-blue-600 hover:underline mt-1">View →</button>}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-green-500" />
            <span className="text-xs font-medium text-gray-500">Teachers</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalTeachers}</p>
          {onNavigate && <button onClick={() => onNavigate('teachers')} className="text-xs text-green-600 hover:underline mt-1">View →</button>}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-violet-500" />
            <span className="text-xs font-medium text-gray-500">Classes</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalClasses}</p>
          {onNavigate && <button onClick={() => onNavigate('classes')} className="text-xs text-violet-600 hover:underline mt-1">View →</button>}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardCheck className="w-5 h-5 text-cyan-500" />
            <span className="text-xs font-medium text-gray-500">Attendance (7d)</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.attendanceRate}%</p>
          <p className="text-xs text-gray-500">{stats.presentThisWeek} present</p>
          {onNavigate && <button onClick={() => onNavigate('attendance')} className="text-xs text-cyan-600 hover:underline mt-1">View →</button>}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><DollarSign className="w-4 h-4 text-emerald-500" /> Finance Summary</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500">Total Revenue</p>
            <p className="text-lg font-bold text-green-600">{currency}{stats.totalRevenue.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Pending</p>
            <p className="text-lg font-bold text-yellow-600">{currency}{stats.pendingFees.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Overdue</p>
            <p className="text-lg font-bold text-red-600">{currency}{stats.overdueFees.toLocaleString()}</p>
          </div>
        </div>
        {onNavigate && (
          <button onClick={() => onNavigate('fees')} className="mt-3 text-sm text-indigo-600 hover:underline">View full fee report →</button>
        )}
      </div>
    </div>
  );
}
