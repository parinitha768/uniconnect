import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, Settings, Save, CheckCircle, Clock, X } from 'lucide-react';

export const AdminSemestersPage: React.FC = () => {
  const [semesters, setSemesters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSemester, setEditingSemester] = useState<any>(null);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [minCredits, setMinCredits] = useState(16);
  const [maxCredits, setMaxCredits] = useState(28);
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchSemesters = async () => {
    try {
      const res = await api.get('/admin/semesters');
      if (res.data.success) {
        setSemesters(res.data.semesters);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSemesters();
  }, []);

  const openEditModal = (sem: any) => {
    setEditingSemester(sem);
    setRegistrationOpen(sem.registrationOpen);
    setMinCredits(sem.minCredits);
    setMaxCredits(sem.maxCredits);
    setRegistrationDeadline(
      sem.registrationDeadline
        ? new Date(sem.registrationDeadline).toISOString().split('T')[0]
        : ''
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSemester) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await api.patch(`/admin/semesters/${editingSemester.id}`, {
        registrationOpen,
        minCredits,
        maxCredits,
        registrationDeadline: registrationDeadline || null,
      });

      if (res.data.success) {
        setMessage('Academic semester settings updated successfully!');
        setEditingSemester(null);
        fetchSemesters();
      }
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Failed to update semester.');
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
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Academic Semesters & Credit Limits</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Configure course registration periods, minimum and maximum allowable credits.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {semesters.map((s) => (
          <div key={s.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded">
                  {s.code}
                </span>
                {s.isCurrent && (
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                    CURRENT TERM
                  </span>
                )}
              </div>

              <h2 className="text-lg font-bold text-slate-900 mt-3">{s.name}</h2>
              <p className="text-xs text-slate-500 mt-1">Academic Year {s.year}</p>

              <div className="my-4 p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Registration Status:</span>
                  <span className={`font-bold ${s.registrationOpen ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {s.registrationOpen ? 'Open for Students' : 'Closed'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Allowable Credit Range:</span>
                  <span className="font-bold text-slate-900">{s.minCredits} - {s.maxCredits} Credits</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Registration Deadline:</span>
                  <span className="font-bold text-slate-800">
                    {s.registrationDeadline ? new Date(s.registrationDeadline).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => openEditModal(s)}
              className="mt-4 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5" /> Configure Registration Rules
            </button>
          </div>
        ))}
      </div>

      {/* Edit Semester Modal */}
      {editingSemester && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sky-600" /> Configure {editingSemester.name}
              </h3>
              <button onClick={() => setEditingSemester(null)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-700">Course Registration Window</span>
                <button
                  type="button"
                  onClick={() => setRegistrationOpen(!registrationOpen)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                    registrationOpen ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                  }`}
                >
                  {registrationOpen ? 'OPEN' : 'CLOSED'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Min Credits
                  </label>
                  <input
                    type="number"
                    required
                    value={minCredits}
                    onChange={(e) => setMinCredits(Number(e.target.value))}
                    className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Max Credits
                  </label>
                  <input
                    type="number"
                    required
                    value={maxCredits}
                    onChange={(e) => setMaxCredits(Number(e.target.value))}
                    className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registration Deadline Date
                </label>
                <input
                  type="date"
                  value={registrationDeadline}
                  onChange={(e) => setRegistrationDeadline(e.target.value)}
                  className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSemester(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

