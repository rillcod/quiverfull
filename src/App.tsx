import React, { useState } from 'react';

import { useAuth } from './hooks/useAuth';
import MainWebsite from './components/website/MainWebsite';
import AuthLayout from './components/auth/AuthLayout';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ParentDashboard from './components/dashboards/ParentDashboard';
import TeacherDashboard from './components/dashboards/TeacherDashboard';
import AdminDashboard from './components/dashboards/AdminDashboard';
import StudentDashboard from './components/dashboards/StudentDashboard';
import KidsLanding from './components/kids/KidsLanding';
import { LogOut } from 'lucide-react';

function App() {
  const { user, profile, loading, signOut } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showMainWebsite, setShowMainWebsite] = useState(true);
  const [showKidsZone, setShowKidsZone] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-300 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading The Quiverfull School...</p>
        </div>
      </div>
    );
  }

  // Show Kids Zone if requested
  if (showKidsZone) {
    return <KidsLanding onBack={() => {
      setShowKidsZone(false);
      if (!user) setShowMainWebsite(true);
    }} />;
  }

  // Show main website if not authenticated
  if (!user && showMainWebsite) {
    return (
      <MainWebsite
        onLoginClick={() => setShowMainWebsite(false)}
        onKidsZoneClick={() => {
          setShowKidsZone(true);
          setShowMainWebsite(false);
        }}
      />
    );
  }

  if (!user || !profile) {
    return (
      <AuthLayout
        title={authMode === 'login' ? 'Welcome Back!' : 'Join Our School Family'}
        subtitle={authMode === 'login'
          ? 'Please sign in to access your account'
          : 'Create your account to get started'
        }
      >
        {/* Kids Zone Button */}
        <div className="mb-6 text-center">
          <KidsButton onClick={() => {
            setShowKidsZone(true);
            setShowMainWebsite(false);
          }} />
        </div>

        {/* Back to Website Link */}
        <div className="text-center mb-4">
          <button
            onClick={() => setShowMainWebsite(true)}
            className="text-orange-600 hover:text-orange-700 text-sm font-medium underline"
          >
            ← Back to Main Website
          </button>
        </div>

        {authMode === 'login' ? (
          <LoginForm
            onSuccess={() => {}}
            onToggleMode={() => setAuthMode('register')}
          />
        ) : (
          <RegisterForm
            onSuccess={() => {}}
            onToggleMode={() => setAuthMode('login')}
          />
        )}
      </AuthLayout>
    );
  }

  // Render appropriate dashboard based on role
  const renderDashboard = () => {
    // Wrap dashboard with a floating "Main Website" shortcut
    const addKidsButton = (dashboard: React.ReactElement) => {
      return (
        <div className="relative">
          {dashboard}
          <div className="fixed bottom-6 right-6 z-50">
            <button
              onClick={() => setShowMainWebsite(true)}
              className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-full shadow-lg font-medium text-sm transition-all duration-200 transform hover:scale-105"
            >
              🏠 Main Website
            </button>
          </div>
        </div>
      );
    };

    switch (profile.role) {
      case 'parent':
        return addKidsButton(<ParentDashboard profile={profile} />);
      case 'teacher':
        return addKidsButton(<TeacherDashboard profile={profile} />);
      case 'admin':
        return addKidsButton(<AdminDashboard profile={profile} />);
      case 'student':
        return addKidsButton(<StudentDashboard profile={profile} />);
      default:
        return (
          <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600">Invalid user role. Please contact administrator.</p>
              <button
                onClick={signOut}
                className="mt-4 flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors mx-auto"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        );
    }
  };

  return renderDashboard();
}

export default App;