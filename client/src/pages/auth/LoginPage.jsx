// client/src/pages/auth/LoginPage.jsx
// Login, Registration, and Instant Demo Mode access for class walkthrough

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login, register, demoLogin } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [role, setRole] = useState('client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({ email, password, name, phone, role });
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (demoRole, clientId) => {
    setError(null);
    setLoading(true);
    try {
      await demoLogin(demoRole, clientId);
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Wordmark */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-white font-black text-2xl shadow-xl shadow-orange-500/25 mb-4">
          FF
        </div>
        <h1 className="text-4xl font-black tracking-tight">
          <span className="text-primary">Flexi</span>
          <span className="text-white">Fit</span>
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          Personalised coaching &amp; local meal planning for urban professionals in Uganda
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* 1-Click Demo Launcher Cards */}
        <div className="mb-6 bg-white/5 border border-primary/40 rounded-2xl p-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              Class Demo Fast-Track
            </span>
            <span className="text-[10px] text-gray-400 font-mono">Password: password123</span>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => handleDemo('trainer')}
              disabled={loading}
              className="w-full py-2.5 px-3 rounded-xl bg-primary hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-between shadow-lg shadow-orange-500/20 active:scale-[0.99] transition tap-target"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">👔</span>
                <div className="text-left">
                  <div>Demo as Trainer (Coach Brian Mukasa)</div>
                  <div className="text-[10px] font-normal text-orange-100">Full client flag triage &amp; meal plan SaaS</div>
                </div>
              </div>
              <span className="text-xs">→</span>
            </button>

            <button
              onClick={() => handleDemo('client', 'client_akello_grace')}
              disabled={loading}
              className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center justify-between border border-white/10 active:scale-[0.99] transition"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">📱</span>
                <div className="text-left">
                  <div>Demo as Client (Grace Akello)</div>
                  <div className="text-[10px] text-gray-400">PWA Today view, Posho/Matooke log &amp; Live Pose</div>
                </div>
              </div>
              <span className="text-xs text-primary">→</span>
            </button>
          </div>
        </div>

        {/* Regular Login / Register Container */}
        <div className="bg-white text-dark py-8 px-6 shadow-2xl rounded-2xl border border-gray-100">
          <div className="flex rounded-xl bg-surface p-1 mb-6">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                mode === 'login' ? 'bg-white shadow text-dark' : 'text-gray-500 hover:text-dark'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                mode === 'register' ? 'bg-white shadow text-dark' : 'text-gray-500 hover:text-dark'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Denis Kigozi"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Account Role
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('client')}
                      className={`py-2 text-xs font-bold rounded-xl border ${
                        role === 'client'
                          ? 'border-primary bg-orange-50 text-primary'
                          : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      Client (Coachee)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('trainer')}
                      className={`py-2 text-xs font-bold rounded-xl border ${
                        role === 'trainer'
                          ? 'border-primary bg-orange-50 text-primary'
                          : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      Independent Trainer
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Phone (WhatsApp)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+256 701 234 567"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="brian@flexifit.ug"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-500/20 transition active:scale-[0.99] tap-target"
            >
              {loading ? 'Authenticating…' : mode === 'login' ? 'Sign In to FlexiFit' : 'Complete Registration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
