import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  MessageSquareWarning,
  CheckCircle,
  Clock,
  User,
  X,
  Filter,
  Send,
  AlertCircle,
} from 'lucide-react';

export const AdminGrievancesPage: React.FC = () => {
  const [grievances, setGrievances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedGrievance, setSelectedGrievance] = useState<any>(null);
  const [responseStatus, setResponseStatus] = useState('RESOLVED');
  const [adminResponse, setAdminResponse] = useState('');
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchGrievances = async () => {
    try {
      const res = await api.get('/admin/grievances');
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

  const handleUpdateGrievance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGrievance || !adminResponse) return;
    setUpdating(true);
    setMessage(null);

    try {
      const res = await api.patch(`/admin/grievances/${selectedGrievance.id}`, {
        status: responseStatus,
        adminResponse,
      });

      if (res.data.success) {
        setMessage(`Grievance status updated to ${responseStatus} and student notified!`);
        setSelectedGrievance(null);
        setAdminResponse('');
        fetchGrievances();
      }
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Failed to update grievance.');
    } finally {
      setUpdating(false);
    }
  };

  const filteredGrievances = grievances.filter((g) => {
    const matchesStatus = statusFilter === 'ALL' || g.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || g.category === categoryFilter;
    return matchesStatus && matchesCategory;
  });

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
        <h1 className="text-2xl font-bold text-slate-900">Student Grievance Administration</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Review, investigate, and provide official redressal for complaints submitted by students.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Status:</span>
          {['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-semibold text-slate-700"
          >
            <option value="ALL">All Categories</option>
            <option value="ACADEMIC">Academic</option>
            <option value="EXAMINATION">Examination</option>
            <option value="FEE">Fee</option>
            <option value="HOSTEL">Hostel</option>
            <option value="INFRASTRUCTURE">Infrastructure</option>
            <option value="HARASSMENT">Harassment</option>
          </select>
        </div>
      </div>

      {/* Grievances List */}
      <div className="space-y-4">
        {filteredGrievances.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
            No grievance tickets matching current filter criteria.
          </div>
        ) : (
          filteredGrievances.map((g) => (
            <div key={g.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between gap-4">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {g.category}
                    </span>
                    <h3 className="font-bold text-base text-slate-900">{g.subject}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      g.status === 'RESOLVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : g.status === 'IN_PROGRESS'
                        ? 'bg-sky-100 text-sky-800'
                        : g.status === 'REJECTED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {g.status}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(g.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="py-2 flex items-center gap-2 text-xs text-slate-500">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Student: <strong className="text-slate-800">{g.student?.user?.name}</strong> ({g.student?.rollNumber} • {g.student?.department?.code})</span>
                </div>

                <p className="text-sm text-slate-700 leading-relaxed mt-1">{g.description}</p>

                {g.adminResponse && (
                  <div className="mt-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <p className="font-bold text-slate-900">Recorded Administrative Response:</p>
                    <p className="text-slate-700 mt-0.5">{g.adminResponse}</p>
                    {g.resolvedBy && (
                      <p className="text-[10px] text-slate-400 mt-1">
                        By {g.resolvedBy} on {g.resolvedAt ? new Date(g.resolvedAt).toLocaleDateString() : ''}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => {
                    setSelectedGrievance(g);
                    setResponseStatus(g.status === 'PENDING' ? 'IN_PROGRESS' : 'RESOLVED');
                    setAdminResponse(g.adminResponse || '');
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition-colors"
                >
                  {g.adminResponse ? 'Update Response & Status' : 'Respond & Resolve Ticket'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Response Modal */}
      {selectedGrievance && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <MessageSquareWarning className="w-5 h-5 text-purple-600" /> Redress Grievance Ticket
              </h3>
              <button onClick={() => setSelectedGrievance(null)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleUpdateGrievance} className="space-y-4 mt-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <p><strong>Subject:</strong> {selectedGrievance.subject}</p>
                <p><strong>Complainant:</strong> {selectedGrievance.student?.user?.name} ({selectedGrievance.student?.rollNumber})</p>
                <p><strong>Details:</strong> {selectedGrievance.description}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ticket Status *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['IN_PROGRESS', 'RESOLVED', 'REJECTED'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setResponseStatus(st)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                        responseStatus === st
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Redressal / Action Taken *
                </label>
                <textarea
                  required
                  rows={4}
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="Detail action taken by academic committee or department..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedGrievance(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-colors"
                >
                  {updating ? 'Saving...' : 'Save & Notify Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

