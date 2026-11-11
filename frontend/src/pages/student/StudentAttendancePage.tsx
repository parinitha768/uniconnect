import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  CheckSquare,
  AlertTriangle,
  FileCheck,
  FileText,
  Clock,
  Send,
  X,
  ShieldAlert,
} from 'lucide-react';

export const StudentAttendancePage: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourseForCondonation, setSelectedCourseForCondonation] = useState<any>(null);
  const [condonationReason, setCondonationReason] = useState('');
  const [medicalCert, setMedicalCert] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchAttendance = async () => {
    try {
      const res = await api.get('/student/attendance');
      if (res.data.success) {
        setAttendanceData(res.data.attendance);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleApplyCondonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForCondonation || !condonationReason) return;
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await api.post('/student/condonation', {
        courseId: selectedCourseForCondonation.courseId,
        currentPercentage: selectedCourseForCondonation.percentage,
        reason: condonationReason,
        medicalCert,
      });

      if (res.data.success) {
        setMessage('Condonation application submitted successfully! Under review by administrator.');
        setSelectedCourseForCondonation(null);
        setCondonationReason('');
        setMedicalCert('');
        fetchAttendance();
      }
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!attendanceData) return <div>Failed to load attendance records.</div>;

  const { overallPercentage, totalClasses, totalPresent, totalAbsent, departmentThreshold, condonationMin, courses, condonations } = attendanceData;

  const hasShortage = overallPercentage < departmentThreshold;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance Monitoring & Shortage Management</h1>
          <p className="text-sm text-slate-500">
            Official department policy threshold: <span className="font-bold text-slate-800">{departmentThreshold}%</span> • Condonation lower limit: <span className="font-bold text-slate-800">{condonationMin}%</span>
          </p>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-sm flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Attendance</p>
          <p className={`text-3xl font-extrabold mt-1 ${hasShortage ? 'text-amber-600' : 'text-emerald-600'}`}>
            {overallPercentage}%
          </p>
          <span className={`text-[11px] font-semibold mt-1 inline-block ${hasShortage ? 'text-amber-700' : 'text-emerald-700'}`}>
            {hasShortage ? 'Shortage Detected' : 'Eligible for Exams'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Classes Held</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">{totalClasses}</p>
          <span className="text-[11px] text-slate-400 mt-1 inline-block">Conducted sessions</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attended Classes</p>
          <p className="text-3xl font-extrabold text-emerald-600 mt-1">{totalPresent}</p>
          <span className="text-[11px] text-slate-400 mt-1 inline-block">Sessions present</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Absences</p>
          <p className="text-3xl font-extrabold text-rose-600 mt-1">{totalAbsent}</p>
          <span className="text-[11px] text-slate-400 mt-1 inline-block">Sessions missed</span>
        </div>
      </div>

      {/* Subject-wise Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Subject-wise Attendance Breakdown</h2>
            <p className="text-xs text-slate-500">Live attendance calculated per session by course faculty</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Course Code & Title</th>
                <th className="px-6 py-3.5">Credits</th>
                <th className="px-6 py-3.5">Faculty In-Charge</th>
                <th className="px-6 py-3.5 text-center">Total</th>
                <th className="px-6 py-3.5 text-center">Attended</th>
                <th className="px-6 py-3.5 text-center">Missed</th>
                <th className="px-6 py-3.5 text-center">Percentage</th>
                <th className="px-6 py-3.5 text-right">Status / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {courses.map((c: any) => (
                <tr key={c.courseId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{c.courseCode}</p>
                    <p className="text-xs text-slate-500">{c.courseTitle}</p>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700">{c.credits}</td>
                  <td className="px-6 py-4 text-slate-600">{c.facultyName}</td>
                  <td className="px-6 py-4 text-center font-semibold text-slate-800">{c.total}</td>
                  <td className="px-6 py-4 text-center font-semibold text-emerald-600">{c.present}</td>
                  <td className="px-6 py-4 text-center font-semibold text-rose-600">{c.absent}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center gap-1.5">
                      <span className={`font-bold ${c.isShortage ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {c.percentage}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {c.isShortage ? (
                      <div className="inline-flex items-center gap-2">
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                          Shortage (&lt;{c.requiredPercentage}%)
                        </span>
                        {c.condonationAllowed && (
                          <button
                            onClick={() => setSelectedCourseForCondonation(c)}
                            className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors"
                          >
                            Apply Condonation
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        Regular
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Condonation History Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-indigo-600" /> Condonation Applications & Review Status
        </h2>
        {condonations.length === 0 ? (
          <p className="text-xs text-slate-400 py-3">No condonation applications submitted yet.</p>
        ) : (
          <div className="space-y-3">
            {condonations.map((app: any) => (
              <div key={app.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{app.course.code}: {app.course.title}</span>
                    <span className="text-xs text-slate-500">({app.currentPercentage}%)</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1"><span className="font-semibold">Reason:</span> {app.reason}</p>
                  {app.adminRemarks && (
                    <p className="text-xs text-indigo-700 mt-0.5"><span className="font-semibold">Admin Remarks:</span> {app.adminRemarks}</p>
                  )}
                </div>
                <div className="sm:text-right shrink-0">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${app.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : app.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                    {app.status}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">Submitted on {new Date(app.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Condonation Application Modal */}
      {selectedCourseForCondonation && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-600" /> Apply for Attendance Condonation
              </h3>
              <button onClick={() => setSelectedCourseForCondonation(null)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleApplyCondonation} className="space-y-4 mt-4">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                <p className="font-semibold">{selectedCourseForCondonation.courseCode}: {selectedCourseForCondonation.courseTitle}</p>
                <p className="mt-0.5">Current Attendance: <span className="font-bold">{selectedCourseForCondonation.percentage}%</span> (Eligible for condonation since &gt;= {condonationMin}%)</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Absence / Medical Condition *
                </label>
                <textarea
                  required
                  rows={3}
                  value={condonationReason}
                  onChange={(e) => setCondonationReason(e.target.value)}
                  placeholder="Detail the circumstances (e.g., hospitalization, approved university athletic event, severe fever)..."
                  className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Supporting Medical Certificate / Proof URL (Optional)
                </label>
                <input
                  type="url"
                  value={medicalCert}
                  onChange={(e) => setMedicalCert(e.target.value)}
                  placeholder="https://hospital-records.com/certs/cert_102.pdf"
                  className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedCourseForCondonation(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-md transition-colors flex items-center gap-1.5"
                >
                  {submitting ? 'Submitting...' : 'Submit to Academic Dean'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

