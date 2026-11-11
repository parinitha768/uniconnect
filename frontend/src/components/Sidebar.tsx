import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  User,
  CheckSquare,
  BookOpen,
  GraduationCap,
  CreditCard,
  MessageSquareWarning,
  Users,
  Settings,
  Calendar,
  Layers,
  FileCheck,
  Megaphone,
  BarChart3,
  Building2,
  ShieldAlert,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role;

  const studentLinks = [
    { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/student/profile', icon: User, label: 'Student Profile' },
    { to: '/student/attendance', icon: CheckSquare, label: 'Attendance & Shortage' },
    { to: '/student/courses', icon: BookOpen, label: 'Course Registration' },
    { to: '/student/examinations', icon: GraduationCap, label: 'Examinations & Results' },
    { to: '/student/fees', icon: CreditCard, label: 'Fees & Payments' },
    { to: '/student/grievances', icon: MessageSquareWarning, label: 'Grievance Portal' },
  ];

  const facultyLinks = [
    { to: '/faculty/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/faculty/attendance', icon: CheckSquare, label: 'Mark Attendance' },
    { to: '/faculty/courses', icon: BookOpen, label: 'Assigned Courses' },
    { to: '/faculty/marks', icon: GraduationCap, label: 'Internal Marks Entry' },
    { to: '/faculty/assignments', icon: Layers, label: 'Assignments' },
  ];

  const parentLinks = [
    { to: '/parent/dashboard', icon: LayoutDashboard, label: 'Student Monitoring' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Admin Dashboard' },
    { to: '/admin/users', icon: Users, label: 'User Management' },
    { to: '/admin/departments', icon: Building2, label: 'Department Policies' },
    { to: '/admin/semesters', icon: Calendar, label: 'Semesters & Limits' },
    { to: '/admin/courses', icon: BookOpen, label: 'Course Management' },
    { to: '/admin/attendance', icon: ShieldAlert, label: 'Shortage & Condonations' },
    { to: '/admin/examinations', icon: GraduationCap, label: 'Exam Schedules & Results' },
    { to: '/admin/fees', icon: BarChart3, label: 'Fee Collection Reports' },
    { to: '/admin/grievances', icon: MessageSquareWarning, label: 'Grievance Desk' },
    { to: '/admin/announcements', icon: Megaphone, label: 'Broadcast Notices' },
  ];

  const links =
    role === 'STUDENT'
      ? studentLinks
      : role === 'FACULTY'
      ? facultyLinks
      : role === 'PARENT'
      ? parentLinks
      : adminLinks;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800">
      {/* Brand Logo Header */}
      <div className="h-16 flex items-center gap-3 px-6 bg-slate-950 border-b border-slate-800">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-sky-500/20">
          U
        </div>
        <div>
          <h1 className="font-bold text-white text-base tracking-wide flex items-center gap-1.5">
            UniConnect
            <span className="text-[10px] bg-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded font-mono font-semibold">2.0</span>
          </h1>
          <p className="text-[11px] text-slate-400 font-medium">Nagarjuna University</p>
        </div>
      </div>

      {/* Role Navigation section */}
      <div className="px-4 py-3 border-b border-slate-800/60 bg-slate-900/50">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {role} PORTAL
        </p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* University Footer info */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 text-xs text-slate-400 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
        <p className="truncate">Spring 2026 Academic Term</p>
      </div>
    </aside>
  );
};

