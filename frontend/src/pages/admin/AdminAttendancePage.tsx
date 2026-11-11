import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  ShieldAlert,
  FileCheck,
  Check,
  X,
  AlertTriangle,
  FileText,
  User,
} from 'lucide-react';

export const AdminAttendancePage: React.FC = () => {
  const [shortages, setShortages] = useState<any[]>([]);
  const [condonations, setCondonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'SHORTAGES' | 'CONDONATIONS'>('SHORTAGES');
  const [reviewingApp, setReviewingApp] = useState<any>(null);
  const [status, setStatus] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [adminRemarks, setAdminRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [sRes, cRes] = await Promise.all([
        api.get('/admin/attendance-shortage'),
        api.get('/admin/condonations'),
      ]);
      if (sRes.data.success) setShortages(sRes.data.report);
      if (cRes.data.success) setCondonations(cRes.data.condonations);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReviewCondonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingApp) return;
    setActionLoading(true);
    setMessage(null);

    try {
      const res = await api.patch(`/admin/condonations/${reviewingApp.id}`, {
        status,
        adminRemarks,
      });

      if (res.data.success) {
        setMessage(`Condonation request has been ${status}.`);
        setReviewingApp(null);
        setAdminRemarks('');
        fetchData();
      }
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Failed to review condonation.');
    } finally {
      setActionLoading(false);
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
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Attendance Policies, Shortages & Condonations</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Monitor attendance shortage reports and review medical condonation requests.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('SHORTAGES')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'SHORTAGES' ? 'border-amber-600 text-amber-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          University Shortage Report ({shortages.length})
        </button>

        <button
          onClick={() => setActiveTab('CONDONATIONS')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'CONDONATIONS' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck className="w-4 h-4 text-indigo-600" />
          Condonation Requests ({condonations.length})
        </button>
      </div>

      {/* Tab 1: Shortages */}
      {activeTab === 'SHORTAGES' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Students Below Attendance Threshold
            </h2>
            <span className="text-xs text-slate-500">
              Auto-flagged against respective department requirements
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Roll No & Student</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5 text-center">Department Threshold</th>
                  <th className="px-6 py-3.5 text-center">Actual Attendance</th>
                  <th className="px-6 py-3.5 text-center">Classes Attended</th>
                  <th className="px-6 py-3.5 text-right">Condonation Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shortages.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-slate-400 text-xs">
                      No attendance shortages detected. All students meet criteria.
                    </td>
                  </tr>
                ) : (
                  shortages.map((s) => (
                    <tr key={s.studentId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {s.name}
                        <span className="block font-mono text-xs font-normal text-slate-500">{s.rollNumber}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{s.department}</td>
                      <td className="px-6 py-4 text-center font-bold text-slate-700">{s.departmentThreshold}%</td>
                      <td className="px-6 py-4 text-center font-bold text-amber-600">{s.overallPercentage}%</td>
                      <td className="px-6 py-4 text-center text-slate-600">{s.presentClasses} / {s.totalClasses}</td>
                      <td className="px-6 py-4 text-right">
                        {s.eligibleForCondonation ? (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                            Eligible for Condonation (Fee: ₹{s.condonationFee})
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                            Debarred from Exams
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Condonations */}
      {activeTab === 'CONDONATIONS' && (
        <div className="space-y-4">
          {condonations.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400">
              No condonation requests submitted.
            </div>
          ) : (
            condonations.map((c) => (
              <div key={c.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">{c.student.user.name}</span>
                    <span className="font-mono text-xs text-slate-500">({c.student.rollNumber})</span>
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                      {c.course.code}: {c.course.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
                    <strong>Reason:</strong> {c.reason}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Current Attendance: <strong className="text-amber-600">{c.currentPercentage}%</strong>
                  </p>
                  {c.adminRemarks && (
                    <p className="text-xs text-indigo-700 mt-1">
                      <strong>Admin Decision Note:</strong> {c.adminRemarks}
                    </p>
                  )}
                </div>

                <div className="sm:text-right shrink-0 flex flex-col sm:items-end gap-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    c.status === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : c.status === 'REJECTED'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {c.status}
                  </span>

                  {c.status === 'PENDING' && (
                    <button
                      onClick={() => {
                        setReviewingApp(c);
                        setStatus('APPROVED');
                      }}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
                    >
                      Review & Approve
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Review Modal */}
      {reviewingApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-indigo-600" /> Review Condonation
              </h3>
              <button onClick={() => setReviewingApp(null)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleReviewCondonation} className="space-y-4 mt-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <p><strong>Student:</strong> {reviewingApp.student.user.name} ({reviewingApp.student.rollNumber})</p>
                <p><strong>Subject:</strong> {reviewingApp.course.code}</p>
                <p><strong>Attendance:</strong> {reviewingApp.currentPercentage}%</p>
                <p><strong>Claim:</strong> {reviewingApp.reason}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Decision *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('APPROVED')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                      status === 'APPROVED' ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    Approve Condonation
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('REJECTED')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                      status === 'REJECTED' ? 'bg-rose-600 text-white border-rose-600 shadow-sm' : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    Reject Application
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Administrator Remarks
                </label>
                <textarea
                  rows={3}
                  value={adminRemarks}
                  onChange={(e) => setAdminRemarks(e.target.value)}
                  placeholder="Official comments recorded on file..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReviewingApp(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md transition-colors"
                >
                  {actionLoading ? 'Saving...' : 'Confirm Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

