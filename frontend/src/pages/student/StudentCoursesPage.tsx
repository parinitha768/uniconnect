import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  BookOpen,
  CheckCircle,
  Plus,
  Trash2,
  AlertCircle,
  Layers,
  Sparkles,
  Users,
  Calendar,
  X,
} from 'lucide-react';

export const StudentCoursesPage: React.FC = () => {
  const [coursesData, setCoursesData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState<'REGISTERED' | 'CORE' | 'ELECTIVE' | 'INTERDISCIPLINARY'>('REGISTERED');

  const fetchCourses = async () => {
    try {
      const res = await api.get('/student/courses');
      if (res.data.success) {
        setCoursesData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleRegister = async (courseId: string) => {
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await api.post('/student/courses/register', { courseId });
      if (res.data.success) {
        setMessage({ text: res.data.message, type: 'success' });
        await fetchCourses();
      }
    } catch (err: any) {
      setMessage({
        text: err.response?.data?.error || 'Registration failed.',
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDrop = async (courseId: string) => {
    if (!window.confirm('Are you sure you want to drop this elective course?')) return;
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await api.post('/student/courses/drop', { courseId });
      if (res.data.success) {
        setMessage({ text: res.data.message, type: 'success' });
        await fetchCourses();
      }
    } catch (err: any) {
      setMessage({
        text: err.response?.data?.error || 'Failed to drop course.',
        type: 'error',
      });
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

  if (!coursesData) return <div>Failed to load course information.</div>;

  const {
    currentSemester,
    totalCreditsRegistered,
    minCredits,
    maxCredits,
    isRegistrationOpen,
    registrationDeadline,
    registeredCourses,
    availableCourses,
  } = coursesData;

  const coreAvailable = availableCourses.filter((c: any) => c.type === 'CORE');
  const electiveAvailable = availableCourses.filter((c: any) => c.type === 'ELECTIVE');
  const interdisciplinaryAvailable = availableCourses.filter((c: any) => c.type === 'INTERDISCIPLINARY');

  const creditProgress = Math.min(100, (totalCreditsRegistered / maxCredits) * 100);

  return (
    <div className="space-y-6">
      {/* Header & Registration Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Flexible Credit-Based Course Registration</h1>
            <span className="bg-sky-100 text-sky-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {currentSemester?.name}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Register for core, departmental electives, and interdisciplinary open electives.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isRegistrationOpen ? (
            <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Registration Window Active
            </div>
          ) : (
            <div className="bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold px-3 py-1.5 rounded-xl">
              Registration Closed
            </div>
          )}
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Credit Limits & Guidelines Widget */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Credit Load Status</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900">{totalCreditsRegistered}</span>
              <span className="text-slate-500 text-sm">/ max {maxCredits} allowable credits</span>
              <span className="text-xs text-slate-400 font-medium">(Minimum required: {minCredits})</span>
            </div>
          </div>
          <div className="text-xs text-slate-500 sm:text-right">
            <p>Registration Deadline:</p>
            <p className="font-bold text-slate-800">
              {registrationDeadline ? new Date(registrationDeadline).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              totalCreditsRegistered < minCredits
                ? 'bg-amber-500'
                : totalCreditsRegistered <= maxCredits
                ? 'bg-sky-600'
                : 'bg-rose-600'
            }`}
            style={{ width: `${creditProgress}%` }}
          ></div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('REGISTERED')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'REGISTERED'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          My Registered Courses ({registeredCourses.length})
        </button>

        <button
          onClick={() => setActiveTab('CORE')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'CORE'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Core Subjects ({coreAvailable.length})
        </button>

        <button
          onClick={() => setActiveTab('ELECTIVE')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'ELECTIVE'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Department Electives ({electiveAvailable.length})
        </button>

        <button
          onClick={() => setActiveTab('INTERDISCIPLINARY')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'INTERDISCIPLINARY'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          Interdisciplinary Open Courses ({interdisciplinaryAvailable.length})
        </button>
      </div>

      {/* Tab 1: My Registered Courses */}
      {activeTab === 'REGISTERED' && (
        <div className="space-y-4">
          {registeredCourses.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400">
              You are not registered for any courses yet. Choose from the available catalog.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {registeredCourses.map((c: any) => (
                <div key={c.registrationId} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                        {c.code}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        c.type === 'CORE'
                          ? 'bg-slate-100 text-slate-700'
                          : c.type === 'ELECTIVE'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {c.type}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 mt-2 text-base">{c.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{c.description || 'Core departmental syllabus module.'}</p>
                    <p className="text-xs text-slate-600 mt-2">
                      Faculty: <span className="font-semibold">{c.faculty?.user?.name || 'Assigned Professor'}</span>
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-sm font-bold text-sky-600">{c.credits} Credits</span>
                    {c.type !== 'CORE' && isRegistrationOpen ? (
                      <button
                        onClick={() => handleDrop(c.id)}
                        disabled={actionLoading}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Drop Subject
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">Mandatory Core</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2, 3, 4: Available Catalog */}
      {activeTab !== 'REGISTERED' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(activeTab === 'CORE' ? coreAvailable : activeTab === 'ELECTIVE' ? electiveAvailable : interdisciplinaryAvailable).map((c: any) => (
            <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                    {c.code}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    c.type === 'CORE'
                      ? 'bg-slate-100 text-slate-700'
                      : c.type === 'ELECTIVE'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {c.type}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 mt-2 text-base">{c.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{c.description}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>Dept: <strong className="text-slate-700">{c.department?.name}</strong></span>
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {c.enrolledCount} / {c.capacity} enrolled
                  </span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm font-bold text-sky-600">{c.credits} Credits</span>
                <button
                  onClick={() => handleRegister(c.id)}
                  disabled={actionLoading || !isRegistrationOpen || c.isFull || totalCreditsRegistered + c.credits > maxCredits}
                  className="bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {c.isFull ? 'Class Full' : 'Enroll Subject'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

