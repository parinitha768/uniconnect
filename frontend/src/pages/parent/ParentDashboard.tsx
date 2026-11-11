import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Users,
  CheckCircle,
  AlertTriangle,
  GraduationCap,
  CreditCard,
  BookOpen,
  Calendar,
  Award,
  Megaphone,
} from 'lucide-react';

export const ParentDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudentIndex, setSelectedStudentIndex] = useState(0);

  useEffect(() => {
    const fetchParentDashboard = async () => {
      try {
        const res = await api.get('/parent/dashboard');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchParentDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) return <div>Failed to load parent dashboard.</div>;

  const { parent, linkedStudents, announcements } = data;

  if (linkedStudents.length === 0) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500">
        <Users className="w-12 h-12 mx-auto text-slate-300 mb-2" />
        <h2 className="text-lg font-bold text-slate-800">No Linked Student Records</h2>
        <p className="text-xs text-slate-400 mt-1">Please contact university administration to verify your ward's student linkage.</p>
      </div>
    );
  }

  const currentStudent = linkedStudents[selectedStudentIndex] || linkedStudents[0];
  const { profile, attendance, examinations, fees, registeredCourses } = currentStudent;

  return (
    <div className="space-y-6">
      {/* Top Welcome Card */}
      <div className="bg-gradient-to-r from-slate-900 to-emerald-950 p-6 sm:p-8 rounded-2xl text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Parent Portal: {parent.name}</h1>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30">
              Verified Parent / Guardian
            </span>
          </div>
          <p className="text-slate-300 text-sm mt-1">
            Monitoring academic performance, fee status, and attendance for your linked ward(s).
          </p>
        </div>

        {/* Student Selector if multiple linked students */}
        {linkedStudents.length > 1 && (
          <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-xl border border-white/10">
            {linkedStudents.map((s: any, idx: number) => (
              <button
                key={s.studentId}
                onClick={() => setSelectedStudentIndex(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedStudentIndex === idx
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {s.profile.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Ward Profile Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={profile.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.rollNumber}`}
            alt={profile.name}
            className="w-16 h-16 rounded-2xl border-2 border-slate-100 shadow-sm bg-slate-50"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold font-mono">
                {profile.rollNumber}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {profile.department} • Semester {profile.currentSemester} • Enrolled
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="p-3 bg-slate-50 rounded-xl text-center min-w-24 border border-slate-100">
            <p className="text-[11px] text-slate-400 font-medium">Cumulative GPA</p>
            <p className="text-lg font-bold text-emerald-600 mt-0.5">{profile.cgpa.toFixed(2)}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl text-center min-w-24 border border-slate-100">
            <p className="text-[11px] text-slate-400 font-medium">Earned Credits</p>
            <p className="text-lg font-bold text-sky-600 mt-0.5">{profile.earnedCredits}</p>
          </div>
        </div>
      </div>

      {/* Low Attendance Warning Alert */}
      {attendance.isWarningActive && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-900">Attendance Shortage Alert</p>
            <p className="text-xs text-amber-800 mt-0.5">
              {profile.name} has subject(s) where attendance has fallen below university compliance rules.
              Immediate consultation with respective faculty is advised.
            </p>
          </div>
        </div>
      )}

      {/* 3 Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Overall Attendance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Overall Attendance</span>
          <p className={`text-3xl font-extrabold mt-2 ${attendance.overallPercentage >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>
            {attendance.overallPercentage}%
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {attendance.presentClasses} attended of {attendance.totalClasses} total lectures
          </p>
        </div>

        {/* Current Fee Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Fee Payment Status</span>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">
            {fees.currentFee?.pendingFee === 0 ? 'Clear' : `₹${fees.currentFee?.pendingFee?.toLocaleString('en-IN')}`}
          </p>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${fees.currentFee?.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
            {fees.currentFee?.status || 'NO RECORD'}
          </span>
        </div>

        {/* Registered Courses count */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Courses</span>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{registeredCourses.length}</p>
          <span className="text-xs text-slate-400 mt-1 block">Registered in Spring 2026</span>
        </div>
      </div>

      {/* Subject-wise Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Course-wise Attendance Breakdown</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Course Code & Subject</th>
                <th className="px-6 py-3.5 text-center">Total Sessions</th>
                <th className="px-6 py-3.5 text-center">Attended</th>
                <th className="px-6 py-3.5 text-center">Percentage</th>
                <th className="px-6 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attendance.byCourse.map((c: any) => (
                <tr key={c.courseCode} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{c.courseCode}</p>
                    <p className="text-xs text-slate-500">{c.courseTitle}</p>
                  </td>
                  <td className="px-6 py-4 text-center font-semibold text-slate-700">{c.total}</td>
                  <td className="px-6 py-4 text-center font-semibold text-emerald-600">{c.present}</td>
                  <td className="px-6 py-4 text-center font-bold">
                    <span className={c.isShortage ? 'text-amber-600' : 'text-emerald-600'}>
                      {c.percentage}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {c.isShortage ? (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        Low Attendance
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        Satisfactory
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Examination Performance & Results */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-600" /> Academic Results & Grade Records
        </h2>
        {examinations.length === 0 ? (
          <p className="text-xs text-slate-400">No semester results published yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {examinations.map((res: any) => (
              <div key={res.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 text-sm">{res.semester.name}</p>
                  <p className="text-xs text-slate-500">Credits Completed: {res.earnedCredits}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-indigo-700">SGPA: {res.sgpa.toFixed(2)}</p>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Published
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

