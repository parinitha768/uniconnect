import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  GraduationCap,
  Save,
  CheckCircle,
  X,
  Award,
  AlertCircle,
} from 'lucide-react';

export const FacultyMarksPage: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);
  const [marksMap, setMarksMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/faculty/courses');
        if (res.data.success && res.data.courses.length > 0) {
          setCourses(res.data.courses);
          setSelectedCourseId(res.data.courses[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourseId) return;

    const fetchStudents = async () => {
      try {
        const res = await api.get(`/faculty/courses/${selectedCourseId}/students`);
        if (res.data.success) {
          setStudents(res.data.students);
          const initialMarks: Record<string, number> = {};
          res.data.students.forEach((s: any) => {
            initialMarks[s.studentId] = s.internalMarks ?? 25;
          });
          setMarksMap(initialMarks);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchStudents();
  }, [selectedCourseId]);

  const handleMarkChange = (studentId: string, val: string) => {
    const num = Math.min(30, Math.max(0, Number(val) || 0));
    setMarksMap((prev) => ({ ...prev, [studentId]: num }));
  };

  const handleSaveMarks = async () => {
    if (!selectedCourseId || students.length === 0) return;
    setSaving(true);
    setMessage(null);

    const marksData = students.map((s) => ({
      studentId: s.studentId,
      marks: marksMap[s.studentId] ?? 0,
    }));

    try {
      const res = await api.post('/faculty/marks', {
        courseId: selectedCourseId,
        marksData,
      });

      if (res.data.success) {
        setMessage({ text: res.data.message, type: 'success' });
      }
    } catch (err: any) {
      setMessage({
        text: err.response?.data?.error || 'Failed to save marks.',
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Internal Assessment Marks Entry</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Submit continuous internal assessment (CIA) marks out of 30 for enrolled students.
          </p>
        </div>

        <button
          onClick={handleSaveMarks}
          disabled={saving || students.length === 0}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-md transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Internal Marks'}
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

      {/* Course Selector */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm max-w-md">
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Select Subject
        </label>
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code}: {c.title}
            </option>
          ))}
        </select>
      </div>

      {/* Marks Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Student Marks Sheet ({students.length} Candidates)
          </h2>
          <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-semibold">
            Maximum Internal Score: 30 Marks
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Roll Number</th>
                <th className="px-6 py-3.5">Student Name</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5 text-center">Marks Obtained (/30)</th>
                <th className="px-6 py-3.5 text-right">Performance Indicator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-slate-400 text-xs">
                    No students found.
                  </td>
                </tr>
              ) : (
                students.map((s) => {
                  const score = marksMap[s.studentId] ?? 0;
                  return (
                    <tr key={s.studentId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">{s.rollNumber}</td>
                      <td className="px-6 py-4 font-semibold text-slate-800">{s.name}</td>
                      <td className="px-6 py-4 text-slate-500 font-medium">{s.department}</td>
                      <td className="px-6 py-4 text-center">
                        <input
                          type="number"
                          min={0}
                          max={30}
                          step={0.5}
                          value={score}
                          onChange={(e) => handleMarkChange(s.studentId, e.target.value)}
                          className="w-20 p-2 text-center text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        {score >= 27 ? (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                            Excellent
                          </span>
                        ) : score >= 20 ? (
                          <span className="text-[10px] font-bold bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full">
                            Good
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
                            Needs Attention
                          </span>
                        )}
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

