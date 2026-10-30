// client/src/pages/auth/LoginPage.jsx
// Login and Registration
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [role, setRole] = useState('client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [inviteCode, setInviteCode] = useState('');
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
        await register({ email, password, name, phone, role, inviteCode });
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Wordmark */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[rgb(var(--color-primary))] text-white font-black text-2xl shadow-xl shadow-[rgb(var(--color-primary))]/25 mb-4">
          FF
        </div>
        <h1 className="text-4xl font-black tracking-tight text-[rgb(var(--color-fg))]">
          <span className="text-[rgb(var(--color-primary))]">Flexi</span>
          <span className="text-[rgb(var(--color-fg))]">Fit</span>
        </h1>
        <p className="mt-2 text-sm text-gray-500 font-medium">
          Personalised coaching &amp; local meal planning for urban professionals in Uganda
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Regular Login / Register Container */}
        <div className="bg-white text-[rgb(var(--color-fg))] py-8 px-6 shadow-2xl rounded-3xl border border-[rgb(var(--color-border))] soft-shadow">
          <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
                mode === 'login' ? 'bg-white shadow text-[rgb(var(--color-fg))] scale-105' : 'text-gray-500 hover:text-[rgb(var(--color-fg))]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
                mode === 'register' ? 'bg-white shadow text-[rgb(var(--color-fg))] scale-105' : 'text-gray-500 hover:text-[rgb(var(--color-fg))]'
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
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-600 uppercase">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Denis Kigozi"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-600 uppercase">
                    Account Role
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('client')}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        role === 'client'
                          ? 'border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))]'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      Client (Coachee)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('trainer')}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        role === 'trainer'
                          ? 'border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))]'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      Independent Trainer
                    </button>
                  </div>
                </div>

                {role === 'client' && (
                  <div className="bg-[rgb(var(--color-primary))]/5 p-3 rounded-xl border border-[rgb(var(--color-primary))]/20 space-y-1">
                    <label className="block text-[10px] font-bold text-[rgb(var(--color-primary))] uppercase">
                      Trainer Invite Code
                    </label>
                    <input
                      type="text"
                      required
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      placeholder="e.g. FF-A1B2C3"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] bg-white"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">Required to link your account to your coach.</p>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-600 uppercase">
                    Phone (WhatsApp)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+256 701 234 567"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] transition-all"
                  />
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-600 uppercase">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="brian@flexifit.ug"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-600 uppercase">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-fg))] text-white font-bold text-sm shadow-lg shadow-[rgb(var(--color-primary))]/20 transition-all duration-200 active:scale-[0.98] tap-target"
            >
              {loading ? 'Authenticating…' : mode === 'login' ? 'Sign In to FlexiFit' : 'Complete Registration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
