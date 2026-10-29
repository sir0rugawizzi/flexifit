// client/src/components/PitchModeBar.jsx
// Floating demo navigation bar for a seamless 5-minute pitch walkthrough

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function PitchModeBar({ onNavigateBeat }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { demoLogin, isTrainer, isClient, user } = useAuth();

  const beats = [
    {
      id: 'triage',
      step: '1',
      title: 'Flagged Triage',
      desc: 'Spot non-compliant clients',
      targetRole: 'trainer',
      action: async () => {
        if (!isTrainer) await demoLogin('trainer');
        onNavigateBeat && onNavigateBeat('clients');
      },
    },
    {
      id: 'meal-builder',
      step: '2',
      title: 'Local Meal Plan',
      desc: 'Matooke & Tilapia macros',
      targetRole: 'trainer',
      action: async () => {
        if (!isTrainer) await demoLogin('trainer');
        onNavigateBeat && onNavigateBeat('meal-builder');
      },
    },
    {
      id: 'client-pwa',
      step: '3',
      title: 'Client Mobile PWA',
      desc: 'Today schedule & food log',
      targetRole: 'client',
      action: async () => {
        if (!isClient) await demoLogin('client');
        onNavigateBeat && onNavigateBeat('today');
      },
    },
    {
      id: 'pose-ai',
      step: '4',
      title: 'Live Pose & AI Form',
      desc: 'Squat counter & Claude review',
      targetRole: 'client',
      action: async () => {
        if (!isClient) await demoLogin('client');
        onNavigateBeat && onNavigateBeat('pose');
      },
    },
    {
      id: 'business-roi',
      step: '5',
      title: 'Trainer Economics',
      desc: '8 to 60 clients (UGX 5.4M MRR)',
      targetRole: 'trainer',
      action: async () => {
        if (!isTrainer) await demoLogin('trainer');
        onNavigateBeat && onNavigateBeat('business');
      },
    },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#0B0B0B]/95 backdrop-blur-md border-b border-orange-500/30 text-white shadow-xl transition-all">
      <div className="max-w-7xl mx-auto px-3 py-1.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
          <span className="font-bold text-xs uppercase tracking-wider text-primary">5-Min Pitch Mode</span>
          <span className="hidden sm:inline text-xs text-gray-400">
            Current: <strong className="text-white">{user?.name}</strong> ({user?.role})
          </span>
        </div>

        {!isCollapsed && (
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
            {beats.map((b) => (
              <button
                key={b.id}
                onClick={b.action}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white/10 hover:bg-primary hover:text-white transition-all whitespace-nowrap flex items-center gap-1.5 border border-white/5 active:scale-95"
              >
                <span className="bg-primary/20 text-primary group-hover:bg-white/20 px-1.5 py-0.2 rounded font-mono text-[10px]">
                  {b.step}
                </span>
                <span>{b.title}</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => demoLogin(isTrainer ? 'client' : 'trainer')}
            className="text-[11px] px-2 py-0.5 bg-orange-600/30 hover:bg-orange-600 text-orange-200 hover:text-white rounded border border-orange-500/40 transition"
            title="Fast switch between Trainer and Client"
          >
            Switch to {isTrainer ? 'Client' : 'Trainer'}
          </button>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-white text-xs px-1.5 py-0.5"
            title={isCollapsed ? 'Expand Pitch Bar' : 'Collapse Pitch Bar'}
          >
            {isCollapsed ? '▼' : '▲'}
          </button>
        </div>
      </div>
    </div>
  );
}
