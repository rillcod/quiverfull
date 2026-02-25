import { useState } from 'react';
import { LayoutDashboard, Heart, DollarSign, Bell, Calendar } from 'lucide-react';
import DashboardShell, { NavItem } from './DashboardShell';
import type { ProfileRow } from '../../lib/supabase';
import OverviewSection from './parent/OverviewSection';
import ChildrenSection from './parent/ChildrenSection';
import FeesSection from './parent/FeesSection';
import AnnouncementsSection from './parent/AnnouncementsSection';
import CalendarSection from './parent/CalendarSection';

const parentNav: NavItem[] = [
  { id: 'overview',      label: 'Overview',       icon: LayoutDashboard, color: 'text-purple-400' },
  { id: 'children',      label: 'My Children',    icon: Heart,           color: 'text-pink-400' },
  { id: 'fees',          label: 'Fees',           icon: DollarSign,      color: 'text-emerald-400' },
  { id: 'announcements', label: 'Announcements',  icon: Bell,            color: 'text-orange-400' },
  { id: 'calendar',      label: 'Calendar',       icon: Calendar,        color: 'text-teal-400' },
];

export default function ParentDashboard({ profile }: { profile: ProfileRow }) {
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
      case 'overview':      return <OverviewSection {...props} />;
      case 'children':      return <ChildrenSection {...props} />;
      case 'fees':          return <FeesSection {...props} />;
      case 'announcements': return <AnnouncementsSection />;
      case 'calendar':      return <CalendarSection />;
      default:              return <OverviewSection {...props} />;
    }
  };

  return (
    <DashboardShell
      profile={profile}
      navItems={parentNav}
      activeSection={section}
      onSectionChange={setSection}
      gradientFrom="from-purple-700"
      gradientTo="to-purple-900"
    >
      {renderSection()}
    </DashboardShell>
  );
}
