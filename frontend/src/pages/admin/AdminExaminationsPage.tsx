import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  GraduationCap,
  Calendar,
  Plus,
  Award,
  Clock,
  MapPin,
  CheckCircle,
  X,
  Send,
} from 'lucide-react';

export const AdminExaminationsPage: React.FC = () => {
  const [examinations, setExaminations] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishSemesterId, setPublishSemesterId] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // New exam state
  const [name, setName] = useState('');
  const [type, setType] = useState('SEMESTER_END');
  const [courseId, setCourseId] = useState('');
  const [semesterId, setSemesterId] = useState('');
  const [examDate, setExamDate] = useState('');
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('01:00 PM');
  const [maxMarks, setMaxMarks] = useState(100);
  const [weightage, setWeightage] = useState(60);
  const [roomNumber, setRoomNumber] = useState('Main Exam Hall');
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    try {
      const [eRes, cRes, sRes] = await Promise.all([
        api.get('/examinations'),
        api.get('/admin/courses'),
        api.get('/admin/semesters'),
      ]);
      if (eRes.data.success) setExaminations(eRes.data.examinations);
      if (cRes.data.success) {
        setCourses(cRes.data.courses);
        if (cRes.data.courses.length > 0) setCourseId(cRes.data.courses[0].id);
      }
      if (sRes.data.success) {
        setSemesters(sRes.data.semesters);
        const current = sRes.data.semesters.find((s: any) => s.isCurrent) || sRes.data.semesters[0];
        if (current) {
          setSemesterId(current.id);
          setPublishSemesterId(current.id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !courseId || !semesterId || !examDate) return;
    setCreating(true);
    setMessage(null);

    try {
      const res = await api.post('/examinations', {
        name,
        type,
        courseId,
        semesterId,
        examDate,
        startTime,
        endTime,
        maxMarks,
        weightage,
        roomNumber,
      });

      if (res.data.success) {
        setMessage('Examination scheduled and students notified!');
        setShowAddModal(false);
        setName('');
        fetchData();
      }
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Failed to create examination.');
    } finally {
      setCreating(false);
    }
  };

  const handlePublishResults = async () => {
    if (!publishSemesterId) return;
    setPublishing(true);
    setMessage(null);

    try {
      const res = await api.post('/examinations/publish-results', {
        semesterId: publishSemesterId,
      });

      if (res.data.success) {
        setMessage(res.data.message);
        setShowPublishModal(false);
        fetchData();
      }
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Failed to publish results.');
    } finally {
      setPublishing(false);
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
          <h1 className="text-2xl font-bold text-slate-900">Examination Schedules & Results Approval</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure examination timetables and calculate/publish official semester SGPA/CGPA cards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPublishModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md transition-colors flex items-center gap-1.5"
          >
            <Award className="w-4 h-4" /> Publish Semester Results
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Schedule New Exam
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Examinations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Scheduled Examinations ({examinations.length} Exams)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Exam Name & Subject</th>
                <th className="px-6 py-3.5">Semester</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Timing</th>
                <th className="px-6 py-3.5">Venue</th>
                <th className="px-6 py-3.5 text-center">Marks / Weightage</th>
                <th className="px-6 py-3.5 text-right">Student Scores</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {examinations.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{e.name}</p>
                    <p className="text-xs text-slate-500">{e.course.code}: {e.course.title}</p>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-700">{e.semester.name}</td>
                  <td className="px-6 py-4 text-slate-800 font-medium">{new Date(e.examDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-slate-600 text-xs">{e.startTime} - {e.endTime}</td>
                  <td className="px-6 py-4 text-slate-600 text-xs">{e.roomNumber || 'Hall TBA'}</td>
                  <td className="px-6 py-4 text-center font-bold text-slate-800">
                    {e.maxMarks} M ({e.weightage}%)
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-bold">
                      {e._count?.marks || 0} Recorded
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Exam Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sky-600" /> Schedule Examination
              </h3>
              <button onClick={() => setShowAddModal(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Title *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. End-Semester Examination"
                  className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject *</label>
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.code}: {c.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Semester *</label>
                  <select
                    value={semesterId}
                    onChange={(e) => setSemesterId(e.target.value)}
                    className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {semesters.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Date *</label>
                  <input
                    type="date"
                    required
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Marks</label>
                  <input
                    type="number"
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(Number(e.target.value))}
                    className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Weightage %</label>
                  <input
                    type="number"
                    value={weightage}
                    onChange={(e) => setWeightage(Number(e.target.value))}
                    className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Venue</label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
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
                  disabled={creating}
                  className="px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md transition-colors"
                >
                  {creating ? 'Scheduling...' : 'Confirm Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Publish Results Confirmation Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" /> Publish Semester Results
              </h3>
              <button onClick={() => setShowPublishModal(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <div className="space-y-4 mt-4">
              <p className="text-xs text-slate-600">
                This process computes official SGPA, CGPA, and earned credits for all registered students in the selected term, locks grade cards, and dispatches real-time result publication alerts to students and parents.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Academic Semester
                </label>
                <select
                  value={publishSemesterId}
                  onChange={(e) => setPublishSemesterId(e.target.value)}
                  className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                >
                  {semesters.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePublishResults}
                  disabled={publishing}
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-colors flex items-center gap-1.5"
                >
                  {publishing ? 'Publishing Results...' : 'Approve & Publish Results'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

