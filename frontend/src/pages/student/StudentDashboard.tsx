import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  GraduationCap,
  CheckCircle,
  AlertTriangle,
  CreditCard,
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  FileText,
  Megaphone,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export const StudentDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/student/dashboard');
        if (res.data.success) {
          setData(res.data.dashboard);
        }
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) return <div>Failed to load dashboard.</div>;

  const { student, summary, registeredCourses, attendanceOverview, examinations, feeSummary, announcements } = data;

  // Chart data for attendance
  const chartData = attendanceOverview.byCourse.map((c: any) => ({
    name: c.courseCode,
    attendance: c.percentage,
    threshold: student.attendanceThreshold,
  }));

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-navy-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={student.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${student.rollNumber}`}
              alt={student.name}
              className="w-16 h-16 rounded-2xl border-2 border-white/20 shadow-md bg-white/10"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">Welcome, {student.name}</h1>
                <span className="bg-sky-500/20 text-sky-300 text-xs px-2.5 py-0.5 rounded-full font-medium border border-sky-500/30">
                  Sem {student.currentSemester}
                </span>
              </div>
              <p className="text-slate-300 text-sm mt-0.5">
                USN: <span className="font-mono text-white font-bold">{student.rollNumber}</span> • {student.department}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 px-4 text-center border border-white/10">
              <p className="text-xs text-slate-300 font-medium">Cumulative GPA</p>
              <p className="text-xl font-bold text-white mt-0.5 flex items-center justify-center gap-1">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                {student.cgpa.toFixed(2)}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 px-4 text-center border border-white/10">
              <p className="text-xs text-slate-300 font-medium">Earned Credits</p>
              <p className="text-xl font-bold text-sky-400 mt-0.5">{student.earnedCredits}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Shortage Warning Alert */}
      {summary.hasAttendanceShortage && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-900">Attendance Shortage Warning!</p>
              <p className="text-xs text-amber-800 mt-0.5">
                You have {summary.shortageCoursesCount} subject(s) below your department threshold ({student.attendanceThreshold}%). You may apply for attendance condonation with medical justification.
              </p>
            </div>
          </div>
          <Link
            to="/student/attendance"
            className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
          >
            Apply Condonation
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Overall Attendance</span>
            <div className={`p-2 rounded-xl ${summary.overallAttendance >= student.attendanceThreshold ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-2xl font-bold text-slate-900">{summary.overallAttendance}%</p>
            <span className="text-xs text-slate-500">Req: {student.attendanceThreshold}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full ${summary.overallAttendance >= student.attendanceThreshold ? 'bg-emerald-500' : 'bg-amber-500'}`}
              style={{ width: `${Math.min(100, summary.overallAttendance)}%` }}
            ></div>
          </div>
        </div>

        {/* Registered Courses */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Enrolled Courses</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-2xl font-bold text-slate-900">{summary.totalRegisteredCourses}</p>
            <span className="text-xs text-slate-500">Subjects</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Total Credits: <span className="font-semibold text-slate-800">{summary.totalCreditsRegistered}</span>
          </p>
        </div>

        {/* Fee Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Semester Fee</span>
            <div className={`p-2 rounded-xl ${summary.pendingFee === 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-2xl font-bold text-slate-900">
              {summary.pendingFee === 0 ? 'Paid' : `₹${summary.pendingFee.toLocaleString('en-IN')}`}
            </p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${summary.pendingFee === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
              {summary.feeStatus}
            </span>
          </div>
          <Link to="/student/fees" className="text-xs text-sky-600 hover:text-sky-700 font-medium mt-2 inline-flex items-center gap-1">
            View receipts & pay <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Grievances */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Grievance Desk</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-2xl font-bold text-slate-900">{summary.activeGrievances}</p>
            <span className="text-xs text-slate-500">Active tickets</span>
          </div>
          <Link to="/student/grievances" className="text-xs text-purple-600 hover:text-purple-700 font-medium mt-2 inline-flex items-center gap-1">
            Submit or track tickets <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Main 2-column Layout: Attendance Graph + Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Chart (2 columns) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Subject-wise Attendance Analysis</h2>
              <p className="text-xs text-slate-500">Requirement threshold: {student.attendanceThreshold}% minimum</p>
            </div>
            <Link to="/student/attendance" className="text-xs font-semibold text-sky-600 hover:underline">
              View Detailed Log
            </Link>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={12} />
                <Tooltip
                  formatter={(value: any) => [`${value}%`, 'Attendance']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="attendance" fill="#0284c7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Examinations */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900">Upcoming Exams</h2>
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>
            <div className="space-y-3">
              {examinations.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No scheduled exams at this time.</p>
              ) : (
                examinations.slice(0, 3).map((exam: any) => (
                  <div key={exam.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded">
                        {exam.courseCode}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {new Date(exam.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 mt-1 line-clamp-1">{exam.name}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> {exam.time}
                      </span>
                      <span>{exam.room || 'Hall TBA'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <Link
            to="/student/examinations"
            className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center justify-between"
          >
            <span>View Full Timetable & Results</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Registered Courses & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registered Courses (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Registered Subjects (Spring 2026)</h2>
            <Link to="/student/courses" className="text-xs font-semibold text-sky-600 hover:underline">
              Course Registration Portal
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {registeredCourses.map((c: any) => (
              <div key={c.registrationId} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700 font-mono">
                    {c.code}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{c.title}</p>
                    <p className="text-xs text-slate-500">
                      Faculty: {c.facultyName} • <span className="font-semibold text-slate-700">{c.credits} Credits</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.type === 'CORE' ? 'bg-slate-100 text-slate-700' : c.type === 'ELECTIVE' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {c.type}
                  </span>
                  {c.internalMarks !== null && (
                    <p className="text-xs text-slate-500 mt-1">
                      Internal: <span className="font-bold text-slate-800">{c.internalMarks}</span>/30
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Announcements */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-slate-900">Announcements</h2>
            <Megaphone className="w-4 h-4 text-slate-400" />
          </div>
          <div className="space-y-3">
            {announcements.length === 0 ? (
              <p className="text-xs text-slate-400">No recent announcements.</p>
            ) : (
              announcements.slice(0, 3).map((a: any) => (
                <div key={a.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </span>
                    {a.isPinned && (
                      <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-bold">
                        PINNED
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">{a.title}</p>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{a.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

