import React, { useState } from 'react';
import {
  GraduationCap,
  Lock,
  Mail,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface LoginProps {
  onSuccess?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const { login, switchDemoRole } = useAuth();
  const [loginMode, setLoginMode] = useState<'tpo' | 'student'>('tpo');
  const [email, setEmail] = useState('admin@college.edu');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email.trim(), password);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string, mode: 'tpo' | 'student') => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoginMode(mode);
    setError(null);
  };

  return (
    <div
      id="login-page-container"
      className="min-h-screen bg-[#0b1329] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      {/* Subtle ambient lighting */}
      <div className="absolute top-0 right-1/3 w-[32rem] h-[32rem] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-[32rem] h-[32rem] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 px-4">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 border border-blue-400/30">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Apex Placement Portal
        </h1>
        <p className="mt-1 text-xs text-slate-400 font-medium">
          Integrated Campus Recruitment & Student Career System
        </p>

        {/* Mode Selector Pill */}
        <div className="mt-5 inline-flex p-1 bg-slate-900/80 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setLoginMode('tpo');
              setEmail('admin@college.edu');
              setPassword('admin123');
              setError(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              loginMode === 'tpo'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>TPO & Coordinators</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMode('student');
              setEmail('rahul.sharma@apex.edu');
              setPassword('student123');
              setError(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              loginMode === 'student'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Students</span>
          </button>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10">
        <div className="bg-[#111c3a]/90 border border-slate-800 rounded-3xl py-7 px-6 sm:px-9 shadow-2xl backdrop-blur-md">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                {loginMode === 'student' ? 'Student College Email' : 'Institutional Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  id="login-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={loginMode === 'student' ? 'student@apex.edu' : 'name@college.edu'}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#091024] border border-slate-700/80 text-white text-xs font-medium placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Access Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  id="login-password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#091024] border border-slate-700/80 text-white text-xs font-medium placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                />
              </div>
            </div>

            <button
              id="login-submit-button"
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50 tracking-wide"
            >
              <span>
                {loading
                  ? 'Authenticating Credentials...'
                  : loginMode === 'student'
                  ? 'Sign In to Student Portal'
                  : 'Sign In to TPO Dashboard'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Sign-In Selector */}
          <div className="mt-7 pt-5 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Instant Demo Logins
              </p>
              <span className="text-[10px] text-blue-400 font-semibold">Click to prefill</span>
            </div>

            {loginMode === 'tpo' ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="demo-fill-admin"
                  type="button"
                  onClick={() => handleQuickFill('admin@college.edu', 'admin123', 'tpo')}
                  className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 text-left transition flex items-start gap-2 group"
                >
                  <div className="p-1 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">TPO Head</p>
                    <p className="text-[10px] text-slate-400 font-medium">Administrator</p>
                  </div>
                </button>

                <button
                  id="demo-fill-cs-coord"
                  type="button"
                  onClick={() => handleQuickFill('cs.coord@college.edu', 'coord123', 'tpo')}
                  className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 text-left transition flex items-start gap-2 group"
                >
                  <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">CS Coord</p>
                    <p className="text-[10px] text-slate-400 font-medium">Computer Dept</p>
                  </div>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="demo-fill-student-rahul"
                  type="button"
                  onClick={() => handleQuickFill('rahul.sharma@apex.edu', 'student123', 'student')}
                  className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 text-left transition flex items-start gap-2 group"
                >
                  <div className="p-1 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition">
                    <GraduationCap className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">Rahul Sharma</p>
                    <p className="text-[10px] text-emerald-400 font-medium">8.45 CGPA · CS</p>
                  </div>
                </button>

                <button
                  id="demo-fill-student-sanika"
                  type="button"
                  onClick={() => handleQuickFill('sanika.joshi@apex.edu', 'student123', 'student')}
                  className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 text-left transition flex items-start gap-2 group"
                >
                  <div className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition">
                    <GraduationCap className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">Sanika Joshi</p>
                    <p className="text-[10px] text-emerald-400 font-medium">7.75 CGPA · IT</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#111c3a] rounded-3xl max-w-sm w-full p-6 border border-slate-800 text-white shadow-2xl">
            <h3 className="text-base font-bold tracking-tight">Institutional Account Assistance</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Enter your college email address to receive credentials reset assistance.
            </p>

            {forgotMessage && (
              <div className="mt-3.5 p-3 rounded-xl bg-blue-900/40 border border-blue-700/60 text-xs text-blue-200 font-medium">
                {forgotMessage}
              </div>
            )}

            <input
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="e.g. yourname@apex.edu"
              className="mt-4 w-full px-3.5 py-2.5 rounded-xl bg-[#091024] border border-slate-700/80 text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />

            <div className="mt-4 p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] text-slate-300">
              <span className="font-bold text-amber-400 block mb-1">Preconfigured System Passwords:</span>
              <div className="space-y-0.5">
                <div>• TPO Administrator: <span className="font-mono font-bold text-white">admin123</span></div>
                <div>• Coordinators: <span className="font-mono font-bold text-white">coord123</span></div>
                <div>• Students: <span className="font-mono font-bold text-white">student123</span></div>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotMessage(null);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setForgotMessage(`Recovery dispatch sent to ${forgotEmail || email}. Refer to demo credentials.`);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition shadow-xs shadow-blue-500/30"
              >
                Send Instructions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
