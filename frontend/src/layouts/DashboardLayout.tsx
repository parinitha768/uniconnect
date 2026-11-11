import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';

interface DashboardLayoutProps {
  allowedRoles?: string[];
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ allowedRoles }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400 font-medium tracking-wide">
            Loading UniConnect Portal...
          </p>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to user's permitted role dashboard
    const defaultRoute =
      user.role === 'STUDENT'
        ? '/student/dashboard'
        : user.role === 'FACULTY'
        ? '/faculty/dashboard'
        : user.role === 'PARENT'
        ? '/parent/dashboard'
        : '/admin/dashboard';
    return <Navigate to={defaultRoute} replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

