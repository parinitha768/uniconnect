import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import {
  CheckSquare,
  Users,
  Calendar,
  AlertTriangle,
  Save,
  CheckCircle,
  XCircle,
  Clock,
  Check,
  X,
} from 'lucide-react';

export const FacultyAttendancePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [sessionType, setSessionType] = useState<string>('LECTURE');
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: string; remarks: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/faculty/courses');
        if (res.data.success && res.data.courses.length > 0) {
          setCourses(res.data.courses);
          const initialCourseId = searchParams.get('courseId') || res.data.courses[0].id;
          setSelectedCourseId(initialCourseId);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [searchParams]);

  useEffect(() => {
    if (!selectedCourseId) return;

    const fetchStudents = async () => {
      try {
        const res = await api.get(`/faculty/courses/${selectedCourseId}/students`);
        if (res.data.success) {
          setStudents(res.data.students);

          // Default all to PRESENT
          const initialMap: Record<string, any> = {};
          res.data.students.forEach((s: any) => {
            initialMap[s.studentId] = { status: 'PRESENT', remarks: '' };
          });
          setAttendanceMap(initialMap);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchStudents();
  }, [selectedCourseId]);

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], remarks },
    }));
  };

  const markAll = (status: 'PRESENT' | 'ABSENT') => {
    const updated: Record<string, any> = {};
    students.forEach((s) => {
      updated[s.studentId] = { ...attendanceMap[s.studentId], status };
    });
    setAttendanceMap(updated);
  };

  const handleSaveAttendance = async () => {
    if (!selectedCourseId || students.length === 0) return;
    setSaving(true);
    setMessage(null);

    const records = students.map((s) => ({
      studentId: s.studentId,
      status: attendanceMap[s.studentId]?.status || 'PRESENT',
      remarks: attendanceMap[s.studentId]?.remarks || null,
    }));

    try {
      const res = await api.post('/faculty/attendance', {
        courseId: selectedCourseId,
        date,
        sessionType,
        records,
      });

      if (res.data.success) {
        setMessage({ text: res.data.message, type: 'success' });
        // Refresh students attendance stats
        const refRes = await api.get(`/faculty/courses/${selectedCourseId}/students`);
        if (refRes.data.success) setStudents(refRes.data.students);
      }
    } catch (err: any) {
      setMessage({
        text: err.response?.data?.error || 'Failed to save attendance.',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance Entry & Shortage Tracking</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Mark daily attendance. Automated notifications fire when attendance drops below department requirements.
          </p>
        </div>

        <button
          onClick={handleSaveAttendance}
          disabled={saving || students.length === 0}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-md transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving Records...' : 'Save & Submit Attendance'}
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Control Filters Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Assigned Course
          </label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code}: {c.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Session Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Session Type
          </label>
          <select
            value={sessionType}
            onChange={(e) => setSessionType(e.target.value)}
            className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
          >
            <option value="LECTURE">Theory Lecture</option>
            <option value="LAB">Laboratory Session</option>
            <option value="TUTORIAL">Tutorial / Seminar</option>
          </select>
        </div>
      </div>

      {/* Student Roster & Attendance Marking */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Enrolled Student Roster ({students.length} Students)
            </h2>
            <p className="text-xs text-slate-500">
              Department Policy Threshold: {selectedCourse?.department?.attendanceThreshold || 75}% minimum
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => markAll('PRESENT')}
              className="px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" /> All Present
            </button>
            <button
              onClick={() => markAll('ABSENT')}
              className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition-colors flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> All Absent
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Roll No & Student</th>
                <th className="px-6 py-3.5 text-center">Cumulative %</th>
                <th className="px-6 py-3.5 text-center">Shortage Warning</th>
                <th className="px-6 py-3.5 text-center">Attendance Status</th>
                <th className="px-6 py-3.5">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400 text-xs">
                    No students enrolled in this course yet.
                  </td>
                </tr>
              ) : (
                students.map((s) => {
                  const currentStatus = attendanceMap[s.studentId]?.status || 'PRESENT';
                  return (
                    <tr key={s.studentId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={s.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${s.rollNumber}`}
                            alt={s.name}
                            className="w-9 h-9 rounded-xl border border-slate-200"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{s.name}</p>
                            <p className="text-xs font-mono text-slate-500">{s.rollNumber}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className={`font-bold ${s.attendanceStats.isShortage ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {s.attendanceStats.percentage}%
                        </span>
                        <p className="text-[10px] text-slate-400">
                          {s.attendanceStats.presentClasses}/{s.attendanceStats.totalClasses} classes
                        </p>
                      </td>

                      <td className="px-6 py-4 text-center">
                        {s.attendanceStats.isShortage ? (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600" /> SHORTAGE
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            NORMAL
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200">
                          {['PRESENT', 'ABSENT', 'LATE'].map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleStatusChange(s.studentId, st)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                currentStatus === st
                                  ? st === 'PRESENT'
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : st === 'ABSENT'
                                    ? 'bg-rose-600 text-white shadow-sm'
                                    : 'bg-amber-600 text-white shadow-sm'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <input
                          type="text"
                          placeholder="Optional note..."
                          value={attendanceMap[s.studentId]?.remarks || ''}
                          onChange={(e) => handleRemarksChange(s.studentId, e.target.value)}
                          className="w-40 sm:w-48 p-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

