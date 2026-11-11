import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Users,
  Building2,
  BookOpen,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  MessageSquareWarning,
  FileCheck,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminDashboard = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) return <div>Failed to load administrator dashboard.</div>;

  const { stats, departments, currentSemester, recentPayments, recentGrievances } = data;

  const collectionPercentage = stats.totalFeeExpected > 0 ? ((stats.totalFeeCollected / stats.totalFeeExpected) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Admin Banner */}
      <div className="bg-gradient-to-r from-rose-50/70 via-sky-50 to-indigo-50/60 p-6 sm:p-8 rounded-2xl text-slate-900 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">University Administration Console</h1>
            <span className="bg-rose-100 text-rose-800 text-xs px-2.5 py-0.5 rounded-full font-bold border border-rose-200">
              Super Admin
            </span>
          </div>
          <p className="text-slate-600 text-sm mt-1">
            Nagarjuna University • Central Academic, Policy, Finance & Grievance Control
          </p>
        </div>

        <div className="flex gap-4">
          <div className="bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-200/80 text-center shadow-xs">
            <p className="text-xs text-slate-500">Active Term</p>
            <p className="text-sm font-bold text-slate-900 mt-0.5">{currentSemester?.name || 'Spring 2026'}</p>
          </div>
        </div>
      </div>

      {/* 4 Main Entity Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/admin/users?role=STUDENT" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-sky-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Students</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">{stats.totalStudents}</p>
          <span className="text-xs text-slate-400 mt-1 block">Active across departments</span>
        </Link>

        <Link to="/admin/users?role=FACULTY" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Faculty</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">{stats.totalFaculty}</p>
          <span className="text-xs text-slate-400 mt-1 block">Professors & Instructors</span>
        </Link>

        <Link to="/admin/departments" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Departments</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">{stats.totalDepartments}</p>
          <span className="text-xs text-slate-400 mt-1 block">Configurable policies</span>
        </Link>

        <Link to="/admin/courses" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Courses</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">{stats.totalCourses}</p>
          <span className="text-xs text-slate-400 mt-1 block">Core, Electives & Open</span>
        </Link>
      </div>

      {/* Finance & Grievance Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fee Collection Overview (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Semester Fee Collection Overview</h2>
              <p className="text-xs text-slate-500">Live reconciliation across all active students</p>
            </div>
            <Link to="/admin/fees" className="text-xs font-semibold text-sky-600 hover:underline">
              Detailed Reports
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500 font-medium">Total Expected</p>
              <p className="text-xl font-bold text-slate-900 mt-1">₹{stats.totalFeeExpected.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-xs text-emerald-800 font-medium">Total Collected</p>
              <p className="text-xl font-bold text-emerald-700 mt-1">₹{stats.totalFeeCollected.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
              <p className="text-xs text-rose-800 font-medium">Pending Arrears</p>
              <p className="text-xl font-bold text-rose-700 mt-1">₹{stats.totalFeePending.toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Collection Progress</span>
              <span className="font-bold text-slate-900">{collectionPercentage}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${collectionPercentage}%` }}></div>
            </div>
          </div>
        </div>

        {/* Grievance & Condonation Actions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-3">Pending Administrative Actions</h2>
            <div className="space-y-3">
              <Link to="/admin/grievances" className="p-3.5 rounded-xl bg-purple-50 hover:bg-purple-100/80 border border-purple-200 flex items-center justify-between transition-colors">
                <div className="flex items-center gap-3">
                  <MessageSquareWarning className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-bold text-purple-950">Grievances</p>
                    <p className="text-xs text-purple-700">{stats.pendingGrievances} Pending • {stats.inProgressGrievances} In Progress</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-purple-600" />
              </Link>

              <Link to="/admin/attendance" className="p-3.5 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200 flex items-center justify-between transition-colors">
                <div className="flex items-center gap-3">
                  <FileCheck className="w-5 h-5 text-amber-600" />
                  <div>
                    <p className="text-sm font-bold text-amber-950">Attendance Condonations</p>
                    <p className="text-xs text-amber-700">{stats.pendingCondonations} Review Requests</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-600" />
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Automated Notifications Active</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
        </div>
      </div>

      {/* Recent Payments & Grievances */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Recent Online Fee Payments</h2>
            <Link to="/admin/fees" className="text-xs font-semibold text-sky-600 hover:underline">
              View All
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentPayments.map((p: any) => (
              <div key={p.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-sm text-slate-900">{p.student.user.name}</p>
                  <p className="text-xs text-slate-500">
                    {p.student.rollNumber} • <span className="font-mono text-slate-600">{p.receiptNumber}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-emerald-600">₹{p.amount.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-slate-400">{new Date(p.paidAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Grievance Tickets */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Recent Grievance Submissions</h2>
            <Link to="/admin/grievances" className="text-xs font-semibold text-sky-600 hover:underline">
              Open Grievance Desk
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentGrievances.map((g: any) => (
              <div key={g.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold font-mono bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded">
                      {g.category}
                    </span>
                    <p className="font-bold text-sm text-slate-900 line-clamp-1">{g.subject}</p>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">By {g.student.user.name} ({g.student.rollNumber})</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  g.status === 'RESOLVED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : g.status === 'IN_PROGRESS'
                    ? 'bg-sky-100 text-sky-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {g.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

