import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  GraduationCap,
  Calendar,
  Clock,
  Award,
  CheckCircle,
  FileText,
  MapPin,
  TrendingUp,
} from 'lucide-react';

export const StudentExaminationsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await api.get('/student/examinations');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) return <div>Failed to load examination details.</div>;

  const { examinations, semesterResults, cgpa, earnedCredits } = data;

  return (
    <div className="space-y-6">
      {/* Header with CGPA Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 sm:p-8 rounded-2xl text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold">Examinations & Academic Performance</h1>
          <p className="text-slate-300 text-sm mt-1">
            Track examination timetables, internal assessment scores, and published semester grade cards.
          </p>
        </div>

        <div className="flex gap-4">
          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/10 text-center">
            <p className="text-xs text-slate-300 font-medium">Cumulative GPA</p>
            <p className="text-2xl font-extrabold text-emerald-400 mt-0.5">{cgpa.toFixed(2)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/10 text-center">
            <p className="text-xs text-slate-300 font-medium">Earned Credits</p>
            <p className="text-2xl font-extrabold text-sky-400 mt-0.5">{earnedCredits}</p>
          </div>
        </div>
      </div>

      {/* Examination Schedule Timetable */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-600" /> Examination Timetable & Assessment Scores
            </h2>
            <p className="text-xs text-slate-500">Official scheduled theory and lab assessments</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Assessment Name & Subject</th>
                <th className="px-6 py-3.5">Exam Date</th>
                <th className="px-6 py-3.5">Time</th>
                <th className="px-6 py-3.5">Hall / Venue</th>
                <th className="px-6 py-3.5 text-center">Max Marks</th>
                <th className="px-6 py-3.5 text-center">Marks Obtained</th>
                <th className="px-6 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {examinations.map((e: any) => (
                <tr key={e.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{e.name}</p>
                    <p className="text-xs text-slate-500">{e.courseCode}: {e.courseTitle}</p>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">
                    {new Date(e.date).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{e.startTime} - {e.endTime}</td>
                  <td className="px-6 py-4 text-slate-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {e.roomNumber || 'Hall TBA'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-slate-700">{e.maxMarks}</td>
                  <td className="px-6 py-4 text-center font-bold text-slate-900">
                    {e.marksObtained !== null ? (
                      <span className="text-emerald-600">{e.marksObtained}</span>
                    ) : (
                      <span className="text-slate-400 font-normal">Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {e.isApproved ? (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                        Approved
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
                        Scheduled
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Published Semester Grade Cards */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-600" /> Published Semester Grade Cards
        </h2>
        {semesterResults.length === 0 ? (
          <p className="text-xs text-slate-400">No semester results published yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {semesterResults.map((r: any) => (
              <div key={r.id} className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-indigo-100 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base text-slate-900">{r.semester.name}</span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                      OFFICIAL RESULT
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Year {r.semester.year} Academic Evaluation</p>
                </div>

                <div className="grid grid-cols-3 gap-2 py-4 my-3 border-y border-indigo-100/60 text-center">
                  <div>
                    <p className="text-[11px] text-slate-500">Semester GPA</p>
                    <p className="text-xl font-black text-indigo-700 mt-0.5">{r.sgpa.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500">Cumulative GPA</p>
                    <p className="text-xl font-black text-slate-800 mt-0.5">{r.cgpa.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500">Earned Credits</p>
                    <p className="text-xl font-black text-emerald-600 mt-0.5">{r.earnedCredits}</p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 text-right">
                  Published: {new Date(r.publishedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

