// client/src/pages/SettingsPage.jsx
// User account settings and security management
import { useState } from 'react';
import { apiPost } from '../api/client';

export default function SettingsPage() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }

    setLoading(true);
    try {
      await apiPost('/auth/change-password', { oldPassword, newPassword });
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to change password.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[rgb(var(--color-fg))] tracking-tight">Account Settings</h1>
        <p className="text-sm text-gray-500">Manage your security and profile preferences</p>
      </div>

      <div className="bg-white rounded-3xl border border-[rgb(var(--color-border))] shadow-sm overflow-hidden soft-shadow">
        <div className="p-6 border-b border-[rgb(var(--color-border))] bg-gray-50">
          <h2 className="font-bold text-[rgb(var(--color-fg))] flex items-center gap-2">
            <span>🔒</span> Security
          </h2>
        </div>

        <div className="p-6">
          <p className="text-xs text-gray-500 mb-6">
            Keep your account secure by updating your password regularly.
            Ensure your new password is strong and not used on other platforms.
          </p>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-600 uppercase">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-600 uppercase">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] transition-all"
                />
              </div>
            </div>

            {message.text && (
              <div className={`p-3 rounded-xl text-xs font-medium ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[rgb(var(--color-primary))] text-white font-bold text-xs hover:bg-[rgb(var(--color-fg))] transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-[rgb(var(--color-primary))]/20"
            >
              {loading ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      <div className="mt-6 p-4 bg-[rgb(var(--color-primary))]/5 rounded-2xl border border-[rgb(var(--color-primary))]/20 flex gap-3">
        <span className="text-lg">💡</span>
        <p className="text-xs text-[rgb(var(--color-fg))] leading-relaxed">
          <strong className="text-[rgb(var(--color-primary))]">Tip:</strong> If you've forgotten your password, please contact your trainer
          directly via WhatsApp to initiate a secure reset process.
        </p>
      </div>
    </div>
  );
}
