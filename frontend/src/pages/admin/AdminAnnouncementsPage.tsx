import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Megaphone,
  Plus,
  Send,
  Pin,
  X,
  Users,
  Calendar,
  CheckCircle,
} from 'lucide-react';

export const AdminAnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetRole, setTargetRole] = useState('ALL');
  const [departmentId, setDepartmentId] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [uRes, dRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/departments'),
      ]);
      if (dRes.data.success) setDepartments(dRes.data.departments);
      // Fetch announcements from recent announcements on dashboard
      const dash = uRes.data;
      if (dash?.announcements) setAnnouncements(dash.announcements);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    setBroadcasting(true);
    setMessage(null);

    try {
      const res = await api.post('/admin/announcements', {
        title,
        content,
        targetRole,
        departmentId: departmentId || null,
        isPinned,
      });

      if (res.data.success) {
        setMessage('Announcement broadcasted successfully to all target users!');
        setShowAddModal(false);
        setTitle('');
        setContent('');
        setIsPinned(false);
        fetchData();
      }
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Failed to broadcast announcement.');
    } finally {
      setBroadcasting(false);
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
          <h1 className="text-2xl font-bold text-slate-900">Broadcast Announcements & Notices</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Send university-wide bulletins, academic circulars, and departmental announcements.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Broadcast Announcement
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Broadcast History */}
      <div className="space-y-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Active University Bulletins</h2>
          </div>

          <div className="space-y-4">
            {announcements.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-400">
                Click "Broadcast Announcement" above to send notices to students, faculty, or parents.
              </div>
            ) : (
              announcements.map((a: any) => (
                <div key={a.id} className="p-5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {a.isPinned && (
                        <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                          <Pin className="w-3 h-3" /> PINNED
                        </span>
                      )}
                      <span className="text-xs font-mono font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                        Audience: {a.targetRole}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900">{a.title}</h3>
                  <p className="text-xs text-slate-700 leading-relaxed">{a.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Broadcast Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-sky-600" /> Broadcast University Bulletin
              </h3>
              <button onClick={() => setShowAddModal(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Audience *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['ALL', 'STUDENT', 'FACULTY', 'PARENT'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setTargetRole(role)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                        targetRole === role
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Schedule for University Annual Convocation 2026"
                  className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notice Content *
                </label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Official notice body, instructions, and dates..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                ></textarea>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pinNotice"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                />
                <label htmlFor="pinNotice" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Pin to top of user dashboards
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={broadcasting}
                  className="px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md transition-colors flex items-center gap-1.5"
                >
                  {broadcasting ? 'Broadcasting...' : 'Broadcast Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

