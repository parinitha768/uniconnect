import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { BookOpen, Users, Calendar, CheckSquare, Layers, Clock } from 'lucide-react';

export const FacultyCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/faculty/courses');
        if (res.data.success) {
          setCourses(res.data.courses);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Assigned Courses & Curriculum Management</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Review course specifications, syllabi, and student enrollment lists.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((c) => (
          <div key={c.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded">
                  {c.code}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  c.type === 'CORE'
                    ? 'bg-slate-100 text-slate-700'
                    : c.type === 'ELECTIVE'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {c.type} SUBJECT
                </span>
              </div>

              <h2 className="text-lg font-bold text-slate-900 mt-3">{c.title}</h2>
              <p className="text-xs text-slate-500 mt-1">{c.description || 'Full accredited university curriculum course.'}</p>

              <div className="grid grid-cols-3 gap-3 my-4 py-3 border-y border-slate-100 text-center">
                <div>
                  <p className="text-[11px] text-slate-400">Credits</p>
                  <p className="text-base font-bold text-sky-600 mt-0.5">{c.credits}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400">Semester</p>
                  <p className="text-base font-bold text-slate-800 mt-0.5">Sem {c.semesterNumber}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400">Enrolled</p>
                  <p className="text-base font-bold text-emerald-600 mt-0.5">
                    {c._count?.registrations || 0} / {c.capacity}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600">
                Department: <strong className="text-slate-800">{c.department.name}</strong>
              </p>
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
              <Link
                to={`/faculty/attendance?courseId=${c.id}`}
                className="flex-1 py-2 text-center text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-colors"
              >
                Mark Attendance
              </Link>
              <Link
                to={`/faculty/marks`}
                className="flex-1 py-2 text-center text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Enter Marks
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

