// client/src/components/Navbar.jsx
// Main application header and responsive navigation

import { useAuth } from '../context/AuthContext';

export default function Navbar({ activeTab, onSelectTab, country = 'UG', onSelectCountry }) {
  const { user, isTrainer, isClient, logout, demoLogin, isDemoMode } = useAuth();

  const trainerTabs = [
    { id: 'clients', label: 'Clients & Flags', icon: '👥' },
    { id: 'workout-builder', label: 'Workout Plans', icon: '🏋️' },
    { id: 'meal-builder', label: 'Meal Plans', icon: '🍲' },
    { id: 'foods', label: 'Food Database', icon: '🥑' },
    { id: 'business', label: 'Business & Scaling', icon: '📈' },
  ];

  const clientTabs = [
    { id: 'today', label: 'Today', icon: '☀️' },
    { id: 'log-meal', label: 'Log Meal', icon: '🍌' },
    { id: 'progress', label: 'Progress Charts', icon: '📊' },
    { id: 'pose', label: 'Live Pose Tracker', icon: '👁️' },
    { id: 'form-check', label: 'AI Form Check', icon: '🤖' },
    { id: 'messages', label: 'Chat with Coach', icon: '💬' },
    { id: 'subscription', label: 'MoMo Subscription', icon: '📱' },
  ];

  const currentTabs = isTrainer ? trainerTabs : clientTabs;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-9 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-extrabold text-base shadow-md shadow-orange-500/30">
              FF
            </div>
            <div>
              <div className="text-xl font-black tracking-tight flex items-center">
                <span className="text-primary">Flexi</span>
                <span className="text-dark">Fit</span>
                <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 uppercase">
                  {isTrainer ? 'Trainer SaaS' : 'Client PWA'}
                </span>
              </div>
              <div className="text-[10px] text-gray-400 -mt-1 hidden sm:block">
                Ugandan Nutrition &amp; Calisthenics Coaching
              </div>
            </div>
          </div>

          {/* User controls & quick tools */}
          <div className="flex items-center gap-2.5">
            {/* Country / Area of Residence Selector */}
            <div className="flex items-center gap-1 bg-surface px-2.5 py-1 rounded-xl border border-gray-200 text-xs">
              <span className="text-gray-500 hidden sm:inline text-[11px]">Area:</span>
              <select
                value={country}
                onChange={(e) => onSelectCountry && onSelectCountry(e.target.value)}
                className="bg-transparent font-bold text-xs text-dark focus:outline-none cursor-pointer"
                title="Adapts local food database and visual portion descriptors"
              >
                <option value="UG">🇺🇬 Uganda (Kampala)</option>
                <option value="KE">🇰🇪 Kenya (East Africa)</option>
                <option value="NG">🇳🇬 Nigeria (West Africa)</option>
                <option value="INT">🌍 International (Standard)</option>
              </select>
            </div>

            {/* Quick Demo Switcher */}
            {isDemoMode && (
              <button
                onClick={() => demoLogin(isTrainer ? 'client' : 'trainer')}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-orange-50 text-primary border border-orange-200 hover:bg-orange-100 transition"
              >
                <span>⇄</span>
                <span>Demo as {isTrainer ? 'Client' : 'Trainer'}</span>
              </button>
            )}

            {/* User profile capsule */}
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-dark leading-tight">{user?.name}</div>
                <div className="text-[10px] text-gray-500 capitalize">{user?.role}</div>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                title="Log out"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Tab navigation strip */}
        <nav className="flex space-x-1 overflow-x-auto no-scrollbar border-t border-gray-100 py-1">
          {currentTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap tap-target ${
                  isActive
                    ? 'bg-primary text-white shadow-sm shadow-orange-500/20'
                    : 'text-gray-600 hover:text-dark hover:bg-surface'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
