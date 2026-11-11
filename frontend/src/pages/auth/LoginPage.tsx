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

  const demoStudents = [
    { usn: '1NC24IS001', name: 'Aarav Sharma', att: '83.3%', note: '< 85% Warning Popup' },
    { usn: '1NC24IS002', name: 'Priya Nair', att: '91.2%', note: 'Compliant (>=85%)' },
    { usn: '1NC24IS003', name: 'Rohan Deshmukh', att: '70.6%', note: '< 85% Shortage' },
    { usn: '1NC24IS004', name: 'Sneha Reddy', att: '86.4%', note: 'Compliant (>=85%)' },
    { usn: '1NC24IS005', name: 'Kavya Krishnan', att: '81.6%', note: '< 85% Shortage' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background soft ambient glows */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/20 mb-3">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          UniConnect
        </h2>
        <p className="mt-1 text-sm text-sky-600 font-semibold">
          Nagarjuna University • Academic Portal
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg z-10">
        <div className="bg-white py-7 px-6 shadow-xl shadow-slate-200/60 rounded-2xl border border-slate-200 sm:px-8">
          <form className="space-y-4" onSubmit={handleSubmit}>
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
              className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
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

            {/* Student Login Credentials Notice */}
            <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900 flex flex-col sm:flex-row sm:items-center justify-between gap-1 shadow-xs">
              <span className="font-medium">🎓 <strong>Student Login:</strong> Enter USN (e.g. <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-sky-200">1NC24IS001</code>)</span>
              <span className="font-medium">Password: <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-sky-200">12345678</code></span>
            </div>
          </form>

          {/* 5 Registered Students Quick 1-Click Login */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center justify-between">
              <span>5 Registered Students (1-Click Login)</span>
              <span className="text-[10px] text-sky-600 font-mono font-semibold">Pass: 12345678</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {demoStudents.map((st) => (
                <button
                  key={st.usn}
                  type="button"
                  onClick={() => handleDemoLogin(st.usn, '12345678')}
                  className="p-2.5 rounded-xl border border-sky-100 bg-sky-50/60 hover:bg-sky-100 text-slate-800 text-xs font-medium flex items-center justify-between transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2 truncate">
                    <GraduationCap className="w-4 h-4 text-sky-600 shrink-0" />
                    <div className="truncate">
                      <p className="font-semibold text-slate-900 truncate">{st.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{st.usn}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${st.note.includes('Warning') || st.note.includes('Shortage') ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {st.att}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Other Roles Quick Demo Logins Section */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Faculty / Admin / Parent
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('admin@uniconnect.edu', 'Admin@123')}
                className="p-2 rounded-xl border border-red-100 bg-red-50/50 hover:bg-red-100 text-red-800 text-xs font-medium flex flex-col items-center text-center transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-red-600 mb-0.5" />
                <span className="font-semibold text-[11px]">Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('faculty.sharma@uniconnect.edu', 'Faculty@123')}
                className="p-2 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-100 text-indigo-800 text-xs font-medium flex flex-col items-center text-center transition-colors cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-indigo-600 mb-0.5" />
                <span className="font-semibold text-[11px]">Faculty</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('parent.rajesh@uniconnect.edu', 'Parent@123')}
                className="p-2 rounded-xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-100 text-emerald-800 text-xs font-medium flex flex-col items-center text-center transition-colors cursor-pointer"
              >
                <Users className="w-4 h-4 text-emerald-600 mb-0.5" />
                <span className="font-semibold text-[11px]">Parent</span>
              </button>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          UniConnect Academic ERP • Nagarjuna University
        </p>
      </div>
    </div>
  );
};
