import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Building2, Settings, Save, CheckCircle, AlertTriangle, X } from 'lucide-react';

export const AdminDepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDept, setEditingDept] = useState<any>(null);
  const [threshold, setThreshold] = useState(75);
  const [condonationMin, setCondonationMin] = useState(65);
  const [condonationFee, setCondonationFee] = useState(500);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchDepts = async () => {
    try {
      const res = await api.get('/admin/departments');
      if (res.data.success) {
        setDepartments(res.data.departments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepts();
  }, []);

  const openEditModal = (d: any) => {
    setEditingDept(d);
    setThreshold(d.attendanceThreshold);
    setCondonationMin(d.condonationMin);
    setCondonationFee(d.condonationFee);
  };

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await api.patch(`/admin/departments/${editingDept.id}/policy`, {
        attendanceThreshold: threshold,
        condonationMin,
        condonationFee,
      });

      if (res.data.success) {
        setMessage(`Attendance policy for ${editingDept.name} updated successfully!`);
        setEditingDept(null);
        fetchDepts();
      }
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Failed to update department policy.');
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
        <h1 className="text-2xl font-bold text-slate-900">Configurable Department Policies</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Configure dynamic attendance thresholds (e.g. 75% vs 85%), condonation eligibility, and fees without hardcoded constraints.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {departments.map((d) => (
          <div key={d.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded">
                  {d.code}
                </span>
                <span className="text-[10px] font-bold bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full">
                  Configurable
                </span>
              </div>

              <h2 className="text-lg font-bold text-slate-900 mt-3">{d.name}</h2>
              <p className="text-xs text-slate-500 mt-1">{d.description || 'Nagarjuna University Department'}</p>

              {/* Policy Settings card */}
              <div className="my-4 p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Attendance Minimum:</span>
                  <span className="font-bold text-slate-900">{d.attendanceThreshold}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Condonation Floor:</span>
                  <span className="font-bold text-slate-900">{d.condonationMin}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Condonation Fee:</span>
                  <span className="font-bold text-emerald-600">₹{d.condonationFee}</span>
                </div>
              </div>

              {/* Statistics counts */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 border-t border-slate-100">
                <div>
                  <p className="text-slate-400 font-medium">Students</p>
                  <p className="font-bold text-slate-800 mt-0.5">{d._count?.students || 0}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Faculty</p>
                  <p className="font-bold text-slate-800 mt-0.5">{d._count?.faculties || 0}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Courses</p>
                  <p className="font-bold text-slate-800 mt-0.5">{d._count?.courses || 0}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => openEditModal(d)}
              className="mt-4 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5" /> Configure Policy Rules
            </button>
          </div>
        ))}
      </div>

      {/* Edit Policy Modal */}
      {editingDept && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-sky-600" /> Edit Policy: {editingDept.code}
              </h3>
              <button onClick={() => setEditingDept(null)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleSavePolicy} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mandatory Attendance Threshold (%)
                </label>
                <input
                  type="number"
                  min={50}
                  max={100}
                  required
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold"
                />
                <p className="text-[11px] text-slate-400 mt-1">E.g., 75% for CSE/MECH, or 85% for ECE strict guidelines.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Minimum Attendance for Medical Condonation (%)
                </label>
                <input
                  type="number"
                  min={40}
                  max={threshold - 1}
                  required
                  value={condonationMin}
                  onChange={(e) => setCondonationMin(Number(e.target.value))}
                  className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold"
                />
                <p className="text-[11px] text-slate-400 mt-1">Students below this percentage cannot apply for condonation.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Condonation Application Fee (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  step={50}
                  required
                  value={condonationFee}
                  onChange={(e) => setCondonationFee(Number(e.target.value))}
                  className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingDept(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md transition-colors"
                >
                  {saving ? 'Saving Changes...' : 'Save Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

