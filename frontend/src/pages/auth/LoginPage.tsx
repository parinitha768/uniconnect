import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Users,
  AlertCircle,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'STUDENT') navigate('/student/dashboard');
      else if (user.role === 'FACULTY') navigate('/faculty/dashboard');
      else if (user.role === 'PARENT') navigate('/parent/dashboard');
      else navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setLoading(true);

    try {
      const user = await login(demoEmail, demoPass);
      if (user.role === 'STUDENT') navigate('/student/dashboard');
      else if (user.role === 'FACULTY') navigate('/faculty/dashboard');
      else if (user.role === 'PARENT') navigate('/parent/dashboard');
      else navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to authenticate demo account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background subtle ambient glows */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-xl shadow-sky-500/20 mb-4">
          <GraduationCap className="w-9 h-9" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          UniConnect
        </h2>
        <p className="mt-1 text-sm text-sky-400 font-medium">
          Nagarjuna University • Intelligent Management Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl border border-slate-200 sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address / USN
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. 1NC24IS001 or name@uniconnect.edu"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 text-center">
              Quick 1-Click Demo Login
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleDemoLogin('admin@uniconnect.edu', 'Admin@123')}
                className="p-2.5 rounded-xl border border-red-100 bg-red-50/60 hover:bg-red-100 text-red-800 text-xs font-medium flex items-center gap-2 transition-colors text-left cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-red-600 shrink-0" />
                <div>
                  <p className="font-semibold leading-tight">Admin</p>
                  <p className="text-[10px] text-red-600/80">Dr. Ramanathan</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('faculty.sharma@uniconnect.edu', 'Faculty@123')}
                className="p-2.5 rounded-xl border border-indigo-100 bg-indigo-50/60 hover:bg-indigo-100 text-indigo-800 text-xs font-medium flex items-center gap-2 transition-colors text-left cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <div>
                  <p className="font-semibold leading-tight">Faculty</p>
                  <p className="text-[10px] text-indigo-600/80">Prof. Sharma</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('1NC24IS001', 'Student@123')}
                className="p-2.5 rounded-xl border border-sky-100 bg-sky-50/60 hover:bg-sky-100 text-sky-800 text-xs font-medium flex items-center gap-2 transition-colors text-left cursor-pointer"
              >
                <GraduationCap className="w-4 h-4 text-sky-600 shrink-0" />
                <div>
                  <p className="font-semibold leading-tight">Student</p>
                  <p className="text-[10px] text-sky-600/80">1NC24IS001</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('parent.rajesh@uniconnect.edu', 'Parent@123')}
                className="p-2.5 rounded-xl border border-emerald-100 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-800 text-xs font-medium flex items-center gap-2 transition-colors text-left cursor-pointer"
              >
                <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-semibold leading-tight">Parent</p>
                  <p className="text-[10px] text-emerald-600/80">Rajesh Sharma</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          UniConnect ERP Architecture • Agile Scrum Prototype 2026
        </p>
      </div>
    </div>
  );
};
