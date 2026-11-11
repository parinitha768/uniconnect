import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Users,
  BookOpen,
  Calendar,
  CheckSquare,
  Clock,
  ArrowRight,
  Layers,
  GraduationCap,
  Megaphone,
} from 'lucide-react';

export const FacultyDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/faculty/dashboard');
        if (res.data.success) {
          setData(res.data.dashboard);
        }
      } catch (err) {
        console.error(err);
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

  if (!data) return <div>Failed to load faculty dashboard.</div>;

  const { faculty, stats, assignedCourses, todayTimetable, assignments, announcements } = data;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-2xl text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={faculty.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${faculty.employeeId}`}
            alt={faculty.name}
            className="w-16 h-16 rounded-2xl border-2 border-white/20 shadow-md bg-white/10 object-cover"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{faculty.name}</h1>
              <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-indigo-500/30">
                {faculty.designation}
              </span>
            </div>
            <p className="text-slate-300 text-sm mt-0.5">
              Emp ID: <span className="font-mono text-white font-semibold">{faculty.employeeId}</span> • {faculty.department}
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/10 text-center">
            <p className="text-xs text-slate-300">Enrolled Students</p>
            <p className="text-2xl font-black text-sky-400 mt-0.5">{stats.totalStudents}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/10 text-center">
            <p className="text-xs text-slate-300">Assigned Courses</p>
            <p className="text-2xl font-black text-white mt-0.5">{stats.assignedCoursesCount}</p>
          </div>
        </div>
      </div>

      {/* 4 Quick Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Classes Scheduled Today</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.classesToday}</p>
          <span className="text-xs text-slate-400 mt-1 block">Lectures on timetable</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Assignments</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.activeAssignmentsCount}</p>
          <span className="text-xs text-slate-400 mt-1 block">Course submissions open</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Mark Attendance</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <Link
            to="/faculty/attendance"
            className="text-xs font-bold text-sky-600 hover:text-sky-700 mt-3 inline-flex items-center gap-1"
          >
            Open Attendance Sheet <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Assessment Marks</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <Link
            to="/faculty/marks"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 mt-3 inline-flex items-center gap-1"
          >
            Enter Internal Marks <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Main Grid: Assigned Courses & Today's Timetable */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assigned Courses (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Assigned Courses & Enrollment</h2>
            <Link to="/faculty/courses" className="text-xs font-semibold text-sky-600 hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {assignedCourses.map((c: any) => (
              <div key={c.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                      {c.code}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900">{c.title}</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {c.credits} Credits • {c.type} Subject
                  </p>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{c.enrolledCount} / {c.capacity}</p>
                    <p className="text-[10px] text-slate-400">Enrolled Students</p>
                  </div>
                  <Link
                    to={`/faculty/attendance?courseId=${c.id}`}
                    className="p-2 rounded-lg bg-white border border-slate-200 text-sky-600 hover:bg-sky-50 transition-colors shadow-sm"
                    title="Mark Attendance"
                  >
                    <CheckSquare className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Timetable */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900">Today's Class Schedule</h2>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <div className="space-y-3">
              {todayTimetable.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No classes scheduled for today.
                </div>
              ) : (
                todayTimetable.map((slot: any) => (
                  <div key={slot.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-xs font-bold text-sky-600">{slot.startTime} - {slot.endTime}</p>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">{slot.course.code}: {slot.course.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Room: {slot.roomNumber}</p>
                  </div>
                ))
              )}
            </div>
          </div>
          <p className="text-xs text-slate-400 pt-3 border-t border-slate-100">
            Nagarjuna University Master Timetable
          </p>
        </div>
      </div>
    </div>
  );
};

