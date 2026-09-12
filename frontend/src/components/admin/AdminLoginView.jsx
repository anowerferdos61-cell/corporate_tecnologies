import React, { useState } from 'react';
import { ShieldCheck, Users, KeyRound, Lock, Loader2, AlertCircle } from 'lucide-react';
import { loginAdmin } from '../../lib/adminAuth';

export default function AdminLoginView({ onLoginSuccess }) {
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPin, setLoginPin] = useState('');
  const [loginRememberMe, setLoginRememberMe] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  async function handleLoginSubmit(e) {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const session = await loginAdmin({
        username: loginUsername,
        pinOrPassword: loginPin,
        rememberMe: loginRememberMe
      });
      onLoginSuccess(session);
    } catch (err) {
      setLoginError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoginLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-fadeIn">
        {/* Top Brand Header */}
        <div className="p-8 pb-6 text-center border-b border-slate-100">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-black text-white mb-4 shadow-md">
            <ShieldCheck className="w-7 h-7 text-[#c92127]" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            CORPORATE <span className="text-[#c92127]">TECH</span>
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">
            Management Portal
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="p-8 pt-6 space-y-5">
          {loginError && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-[#c92127] rounded-xl text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Admin Username
            </label>
            <div className="relative">
              <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="admin"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#c92127] focus:ring-1 focus:ring-[#c92127]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Security PIN / Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={loginPin}
                onChange={(e) => setLoginPin(e.target.value)}
                placeholder="••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#c92127] focus:ring-1 focus:ring-[#c92127]"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 flex items-center justify-between">
              <span>Super Admin: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">admin</code></span>
              <span>Staff Dispatcher: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">staff</code></span>
            </p>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600">
              <input
                type="checkbox"
                checked={loginRememberMe}
                onChange={(e) => setLoginRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-[#c92127] focus:ring-[#c92127]"
              />
              <span>Remember this session</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loginLoading}
            className="w-full bg-[#18181b] hover:bg-black text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer hover:shadow-lg disabled:opacity-50"
          >
            {loginLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#c92127]" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-[#c92127]" />
                <span>Sign In to Admin Portal</span>
              </>
            )}
          </button>
        </form>

        {/* Bottom Security Note */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
          <span className="text-[11px] text-slate-400 font-medium">
            🔒 256-bit Encrypted Session • Corporate Technologies BD
          </span>
        </div>
      </div>
    </div>
  );
}
