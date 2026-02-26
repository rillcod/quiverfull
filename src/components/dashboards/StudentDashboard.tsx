import { useState } from 'react';
import { LayoutDashboard, Star, FileText, ClipboardCheck, Calendar, User, MonitorCheck, Clock, DollarSign, BarChart3 } from 'lucide-react';
import DashboardShell, { NavItem } from './DashboardShell';
import type { ProfileRow } from '../../lib/supabase';
import OverviewSection from './student/OverviewSection';
import GradesSection from './student/GradesSection';
import AssignmentsSection from './student/AssignmentsSection';
import AttendanceSection from './student/AttendanceSection';
import ProfileSection from './student/ProfileSection';
import CalendarSection from './student/CalendarSection';
import StudentCBTSection from './student/CBTSection';
import StudentTimetableSection from './student/TimetableSection';
import StudentFeesSection from './student/FeesSection';
import StudentResultsSection from './student/ResultsSection';

const studentNav: NavItem[] = [
  { id: 'overview',    label: 'Overview',     icon: LayoutDashboard, color: 'text-pink-400' },
  { id: 'grades',      label: 'My Grades',    icon: Star,            color: 'text-yellow-400' },
  { id: 'results',     label: 'My Results',   icon: BarChart3,       color: 'text-green-400' },
  { id: 'assignments', label: 'Assignments',  icon: FileText,        color: 'text-orange-400' },
  { id: 'attendance',  label: 'Attendance',   icon: ClipboardCheck,  color: 'text-green-400' },
  { id: 'calendar',    label: 'Calendar',     icon: Calendar,        color: 'text-teal-400' },
  { id: 'cbt',         label: 'CBT Exams',   icon: MonitorCheck,    color: 'text-violet-400' },
  { id: 'timetable',  label: 'Timetable',    icon: Clock,           color: 'text-cyan-400' },
  { id: 'fees',       label: 'My Fees',      icon: DollarSign,      color: 'text-emerald-400' },
  { id: 'profile',     label: 'My Profile',   icon: User,            color: 'text-purple-400' },
];

export default function StudentDashboard({ profile }: { profile: ProfileRow }) {
  const [section, setSection] = useState('overview');

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center text-gray-500">Loading profile...</div>
      </div>
    );
  }

  const renderSection = () => {
    const props = { profile, onNavigate: setSection };
    switch (section) {
      case 'overview':    return <OverviewSection {...props} />;
      case 'grades':      return <GradesSection {...props} />;
      case 'results':     return <StudentResultsSection {...props} />;
      case 'assignments': return <AssignmentsSection {...props} />;
      case 'attendance':  return <AttendanceSection {...props} />;
      case 'calendar':    return <CalendarSection />;
      case 'cbt':         return <StudentCBTSection {...props} />;
      case 'timetable':   return <StudentTimetableSection {...props} />;
      case 'fees':        return <StudentFeesSection {...props} />;
      case 'profile':     return <ProfileSection {...props} />;
      default:            return <OverviewSection {...props} />;
    }
  };

  return (
    <DashboardShell
      profile={profile}
      navItems={studentNav}
      activeSection={section}
      onSectionChange={setSection}
      gradientFrom="from-pink-600"
      gradientTo="to-rose-900"
    >
      {renderSection()}
    </DashboardShell>
  );
}
