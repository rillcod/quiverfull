import React, { useState, ReactNode } from 'react';
import { Menu, ChevronRight, LogOut, School } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ProfileRow } from '../../lib/supabase';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
}

interface DashboardShellProps {
  profile: ProfileRow;
  navItems: NavItem[];
  activeSection: string;
  onSectionChange: (id: string) => void;
  children: ReactNode;
  gradientFrom?: string;
  gradientTo?: string;
}

export default function DashboardShell({
  profile,
  navItems,
  activeSection,
  onSectionChange,
  children,
  gradientFrom = 'from-indigo-700',
  gradientTo = 'to-indigo-900',
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleSignOut = async () => { await supabase.auth.signOut(); };
  const activeNav = navItems.find(n => n.id === activeSection);

  const roleBadge: Record<string, string> = {
    admin: 'Administrator',
    teacher: 'Teacher',
    parent: 'Parent',
    student: 'Student',
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <School className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && (
            <div className="min-w-0">
              <p className="text-white font-bold text-sm leading-tight truncate">The Quiverfull</p>
              <p className="text-white/60 text-xs truncate">{roleBadge[profile?.role] || 'Portal'}</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = activeSection === item.id;
          return (
            <button key={item.id}
              onClick={() => { onSectionChange(item.id); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 ${
                active ? 'bg-white text-indigo-700 shadow-md' : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}>
              <item.icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-indigo-600' : item.color}`} />
              {sidebarOpen && <span className="text-sm font-medium truncate flex-1 text-left">{item.label}</span>}
              {active && sidebarOpen && <ChevronRight className="w-4 h-4 opacity-50 flex-shrink-0" />}
            </button>
          );
        })}
      </nav>

      <div className="px-2 pb-4 border-t border-white/10 pt-4 space-y-1">
        <div className={`flex items-center gap-3 px-3 py-2 ${sidebarOpen ? '' : 'justify-center'}`}>
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {profile?.first_name?.[0]?.toUpperCase()}
          </div>
          {sidebarOpen && (
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs font-semibold truncate">{profile?.first_name} {profile?.last_name}</p>
              <p className="text-white/50 text-xs truncate">{roleBadge[profile?.role]}</p>
            </div>
          )}
        </div>
        <button onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:bg-red-500/20 hover:text-red-300 transition-colors">
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {sidebarOpen && <span className="text-sm font-medium">Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col bg-gradient-to-b ${gradientFrom} via-indigo-800 ${gradientTo} transition-all duration-300 flex-shrink-0 ${sidebarOpen ? 'w-60' : 'w-16'}`}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
          <aside className={`absolute left-0 top-0 bottom-0 w-64 bg-gradient-to-b ${gradientFrom} via-indigo-800 ${gradientTo} z-50`}>
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:flex p-1.5 rounded-lg text-gray-500 hover:bg-gray-100">
              <Menu className="w-5 h-5" />
            </button>
            <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100">
              <Menu className="w-5 h-5" />
            </button>
            {activeNav && (
              <div className="flex items-center gap-2">
                <activeNav.icon className={`w-5 h-5 ${activeNav.color}`} />
                <h1 className="text-lg font-semibold text-gray-900">{activeNav.label}</h1>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-gray-500">
              {new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {profile?.first_name?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
