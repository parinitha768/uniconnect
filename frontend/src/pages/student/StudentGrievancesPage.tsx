import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  MessageSquareWarning,
  Plus,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  FileText,
  User,
} from 'lucide-react';

export const StudentGrievancesPage: React.FC = () => {
  const [grievances, setGrievances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [category, setCategory] = useState('ACADEMIC');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchGrievances = async () => {
    try {
      const res = await api.get('/student/grievances');
      if (res.data.success) {
        setGrievances(res.data.grievances);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) return;
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await api.post('/student/grievances', {
        category,
        subject,
        description,
      });

      if (res.data.success) {
        setMessage('Your grievance ticket has been submitted to the university administrator.');
        setShowSubmitModal(false);
        setSubject('');
        setDescription('');
        fetchGrievances();
      }
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Failed to submit grievance.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">Resolved</span>;
      case 'IN_PROGRESS':
        return <span className="bg-sky-100 text-sky-800 text-xs px-2.5 py-0.5 rounded-full font-bold">In Progress</span>;
      case 'REJECTED':
        return <span className="bg-rose-100 text-rose-800 text-xs px-2.5 py-0.5 rounded-full font-bold">Rejected</span>;
      default:
        return <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold">Pending</span>;
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
          <h1 className="text-2xl font-bold text-slate-900">Student Grievance & Redressal Portal</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Submit academic, examination, hostel or fee complaints and track administrative resolution.
          </p>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-sky-600/20 transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Log New Grievance Ticket
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-sm flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Grievance Ticket Cards */}
      <div className="space-y-4">
        {grievances.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
            <MessageSquareWarning className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="text-base font-semibold text-slate-700">No grievances logged</p>
            <p className="text-xs text-slate-400 mt-1">If you face any issues with courses, fees, or facilities, click "Log New Grievance Ticket".</p>
          </div>
        ) : (
          grievances.map((g) => (
            <div key={g.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {g.category}
                  </span>
                  <h3 className="font-bold text-base text-slate-900">{g.subject}</h3>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(g.status)}
                  <span className="text-xs text-slate-400">
                    {new Date(g.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed">{g.description}</p>

              {/* Admin response block */}
              {g.adminResponse ? (
                <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-sky-600" />
                    Administrative Response {g.resolvedBy ? `(${g.resolvedBy})` : ''}:
                  </p>
                  <p className="text-slate-700 leading-normal">{g.adminResponse}</p>
                  {g.resolvedAt && (
                    <p className="text-[10px] text-slate-400 pt-1">
                      Resolved on: {new Date(g.resolvedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic pt-1">
                  Awaiting review and assignment by the university grievance cell.
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Submit Grievance Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <MessageSquareWarning className="w-5 h-5 text-purple-600" /> Submit Grievance Ticket
              </h3>
              <button onClick={() => setShowSubmitModal(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                >
                  <option value="ACADEMIC">Academic / Course Issue</option>
                  <option value="EXAMINATION">Examination & Grading</option>
                  <option value="FEE">Fee & Payments</option>
                  <option value="HOSTEL">Hostel & Accommodation</option>
                  <option value="INFRASTRUCTURE">Campus Infrastructure & Labs</option>
                  <option value="HARASSMENT">Harassment & Anti-Ragging</option>
                  <option value="OTHER">General Grievance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Concise summary of the grievance..."
                  className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Detailed Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide complete facts, dates, subject codes, or affected faculty/facility..."
                  className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {submitting ? 'Submitting...' : 'Submit Grievance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

