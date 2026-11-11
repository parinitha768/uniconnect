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
  X,
  ShieldAlert,
  UserCheck,
  Award,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  Cell,
} from 'recharts';

export const StudentDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showShortageModal, setShowShortageModal] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/student/dashboard');
        if (res.data.success) {
          const dashboardData = res.data.dashboard;
          setData(dashboardData);

          // Check if overall attendance is < 85% or any subject is < 85%
          const isBelow85 =
            dashboardData.summary.overallAttendance < 85 ||
            dashboardData.attendanceOverview.byCourse.some((c: any) => c.percentage < 85);

          if (isBelow85) {
            setShowShortageModal(true);
          }
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

  // Chart data for subject-wise attendance analysis
  const chartData = attendanceOverview.byCourse.map((c: any) => ({
    code: c.courseCode,
    title: c.courseTitle,
    percentage: c.percentage,
    present: c.present,
    total: c.total,
  }));

  const shortageCourses = attendanceOverview.byCourse.filter((c: any) => c.percentage < 85);
  const isOverallShortage = summary.overallAttendance < 85;

  return (
    <div className="space-y-6 relative">
      {/* ========================================================================= */}
      {/* 1. MANDATORY ATTENDANCE POP-UP MESSAGE FOR LESS THAN 85% ATTENDANCE       */}
      {/* ========================================================================= */}
      {showShortageModal && (isOverallShortage || shortageCourses.length > 0) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border-2 border-rose-400 relative overflow-hidden">
            {/* Red alert top banner */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600"></div>

            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200 shadow-xs">
                  <AlertTriangle className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] font-black tracking-widest uppercase bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full border border-rose-200">
                    Mandatory University Alert
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-1">
                    Attendance Shortage Below 85%
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setShowShortageModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
                title="Dismiss Alert"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Warning Callout Box */}
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-slate-800 space-y-2 mb-4">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold text-rose-950">Your Overall Attendance:</span>
                <span className="text-2xl font-black text-rose-600 font-mono">
                  {summary.overallAttendance}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600 pt-1.5 border-t border-rose-200/70">
                <span>Mandatory University Requirement:</span>
                <span className="font-bold text-slate-900 font-mono">85.0% Minimum</span>
              </div>
              <p className="text-xs text-rose-800 pt-1 leading-relaxed">
                ⚠️ <strong>Examination Debarment Notice:</strong> University regulations mandate a minimum of <strong>85% attendance</strong> in each subject. Students with attendance below 85% are ineligible for semester examinations unless approved for formal condonation.
              </p>
            </div>

            {/* List of Subjects Below 85% */}
            {shortageCourses.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Subjects with Shortage (&lt; 85%):
                </p>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {shortageCourses.map((c: any) => (
                    <div
                      key={c.courseCode}
                      className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/50 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-rose-200">
                            {c.courseCode}
                          </span>
                          <span className="text-slate-700 truncate max-w-[200px] font-medium">{c.courseTitle}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Classes: {c.present} attended of {c.total} held
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-rose-600 text-sm font-mono">{c.percentage}%</span>
                        <p className="text-[10px] text-rose-600 font-semibold">&lt; 85% Shortage</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <Link
                to="/student/attendance"
                onClick={() => setShowShortageModal(false)}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/20 text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Apply for Attendance Condonation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setShowShortageModal(false)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors text-center cursor-pointer"
              >
                Acknowledge & Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Persistent Shortage Warning Banner (< 85%) */}
      {(isOverallShortage || shortageCourses.length > 0) && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-600 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-rose-900">
                Attendance Shortage Warning ({summary.overallAttendance}% &lt; 85.0% Mandatory Requirement)
              </p>
              <p className="text-xs text-rose-800 mt-0.5">
                You have {shortageCourses.length} subject(s) below the 85% attendance threshold. You risk examination debarment unless condonation is submitted.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              onClick={() => setShowShortageModal(true)}
              className="text-xs font-semibold text-rose-700 bg-white border border-rose-300 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              View Warning Popup
            </button>
            <Link
              to="/student/attendance"
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              Apply Condonation
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Overall Attendance</span>
            <div className={`p-2 rounded-xl ${!isOverallShortage ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p className={`text-2xl font-bold font-mono ${!isOverallShortage ? 'text-slate-900' : 'text-rose-600'}`}>
              {summary.overallAttendance}%
            </p>
            <span className="text-xs text-slate-500">Threshold: 85.0%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${!isOverallShortage ? 'bg-emerald-500' : 'bg-rose-500'}`}
              style={{ width: `${Math.min(100, summary.overallAttendance)}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {isOverallShortage ? '⚠️ Attendance Shortage (< 85%)' : '✓ Exam Eligible (>= 85%)'}
          </p>
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
            <p className="text-2xl font-bold text-slate-900">{registeredCourses.length}</p>
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
            <p className="text-2xl font-bold text-slate-900 font-mono">
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

      {/* ========================================================================= */}
      {/* 2. SUBJECT-WISE ATTENDANCE ANALYSIS GRAPH (WITH 85% THRESHOLD REFERENCE)  */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Subject-wise Attendance Analysis</h2>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-mono">
                Semester 4
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Red dashed line marks the <strong className="text-rose-600">85% Mandatory Minimum Attendance Requirement</strong>.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
              &ge; 85% (Compliant)
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span className="w-3 h-3 rounded bg-rose-500 inline-block"></span>
              &lt; 85% (Shortage)
            </span>
            <Link to="/student/attendance" className="font-bold text-sky-600 hover:underline ml-2">
              Full Attendance Log &rarr;
            </Link>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 25, right: 20, left: -15, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="code"
                stroke="#64748b"
                fontSize={12}
                interval={0}
                tick={{ dy: 5 }}
              />
              <YAxis domain={[0, 100]} stroke="#64748b" fontSize={12} unit="%" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    const isOk = d.percentage >= 85;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs space-y-1">
                        <p className="font-bold text-sky-400 font-mono">{d.code}: {d.title}</p>
                        <p className="flex justify-between gap-4">
                          <span>Attendance:</span>
                          <span className={`font-bold font-mono ${isOk ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {d.percentage}%
                          </span>
                        </p>
                        <p className="text-[11px] text-slate-300">
                          Sessions: {d.present} attended of {d.total} held
                        </p>
                        <p className={`text-[10px] font-bold uppercase tracking-wider pt-1 ${isOk ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isOk ? '✓ Compliant (Eligible for Exams)' : '⚠️ Shortage Warning (< 85% Debarment Risk)'}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                y={85}
                stroke="#ef4444"
                strokeDasharray="4 4"
                strokeWidth={2}
                label={{
                  value: '85% Minimum Required Threshold',
                  fill: '#dc2626',
                  fontSize: 11,
                  position: 'top',
                }}
              />
              <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
                {chartData.map((entry: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.percentage >= 85 ? '#10b981' : '#f43f5e'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. ALL REGISTERED SUBJECT DETAILS SECTION                                  */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              All Enrolled Subjects & Course Information
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review syllabus, credits, assigned professors, live subject attendance, and internal assessment marks.
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full self-start sm:self-auto">
            {registeredCourses.length} Subjects Enrolled • {summary.totalCreditsRegistered} Total Credits
          </span>
        </div>

        {/* Grid of Subject Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {registeredCourses.map((c: any) => {
            const att = c.attendance || { total: 0, present: 0, percentage: 100, isShortage: false };
            const isShortage = att.percentage < 85;

            return (
              <div
                key={c.code}
                className={`p-5 rounded-2xl border transition-all hover:shadow-md flex flex-col justify-between ${
                  isShortage
                    ? 'border-rose-200 bg-rose-50/20 hover:border-rose-300'
                    : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="font-mono text-xs font-bold bg-slate-900 text-white px-2.5 py-1 rounded-lg">
                      {c.code}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        {c.credits} Credits
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.type === 'CORE'
                            ? 'bg-blue-100 text-blue-800'
                            : c.type === 'ELECTIVE'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {c.type}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1">{c.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {c.description || 'Comprehensive curriculum covering theoretical foundations and practical laboratory work.'}
                  </p>

                  {/* Faculty Info */}
                  <div className="mt-3.5 pt-3 border-t border-slate-200/60 text-xs space-y-1">
                    <p className="text-slate-700 font-semibold flex items-center justify-between">
                      <span className="text-slate-400 font-normal">Instructor:</span>
                      <span className="truncate max-w-[180px] font-medium">{c.facultyName}</span>
                    </p>
                    <p className="text-slate-600 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Designation:</span>
                      <span>{c.facultyDesignation}</span>
                    </p>
                    <p className="text-slate-600 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Location:</span>
                      <span>{c.officeRoom}</span>
                    </p>
                  </div>
                </div>

                {/* Bottom Performance Metrics: Attendance & Internal Marks */}
                <div className="mt-4 pt-3 border-t border-slate-200/60 space-y-2.5">
                  {/* Attendance Bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-600">Attendance:</span>
                      <span
                        className={`font-bold font-mono px-2 py-0.5 rounded text-[11px] ${
                          isShortage ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {att.percentage}% {isShortage ? '(Shortage < 85%)' : '(Compliant)'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isShortage ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(100, att.percentage)}%` }}
                      ></div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 text-right font-mono">
                      {att.present} of {att.total} classes attended
                    </p>
                  </div>

                  {/* Internal Assessment Marks */}
                  <div className="flex items-center justify-between text-xs bg-white p-2 rounded-xl border border-slate-200/70">
                    <span className="text-slate-500 font-medium">Internal Assessment:</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {c.internalMarks !== null ? `${c.internalMarks} / 30 Marks` : 'Pending Entry'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Examinations & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Examinations */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-600" />
                Upcoming Examinations
              </h2>
              <Link to="/student/examinations" className="text-xs font-semibold text-sky-600 hover:underline">
                Full Timetable &rarr;
              </Link>
            </div>
            <div className="space-y-3">
              {examinations.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No scheduled exams at this time.</p>
              ) : (
                examinations.slice(0, 3).map((exam: any) => (
                  <div key={exam.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-mono">
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
                      <span className="font-medium text-slate-700">{exam.room || 'Hall TBA'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Announcements */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-amber-500" />
                University Announcements
              </h2>
              <span className="text-xs text-slate-400">Spring 2026</span>
            </div>
            <div className="space-y-3">
              {announcements.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No recent announcements.</p>
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
    </div>
  );
};
