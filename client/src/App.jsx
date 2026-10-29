import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

function Home() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then(setHealth)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark">
      <div className="text-center space-y-6 p-8">
        {/* Wordmark */}
        <h1 className="text-6xl font-extrabold tracking-tight">
          <span className="text-primary">Flexi</span>
          <span className="text-white">Fit</span>
        </h1>

        <p className="text-gray-400 text-lg max-w-md mx-auto">
          Personalised coaching &amp; local meal planning for urban professionals
        </p>

        {/* Phase badge */}
        <div className="inline-flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-full text-sm font-medium">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Phase 0 — Scaffolding Complete
        </div>

        {/* Health check */}
        <div className="mt-6 bg-white/5 rounded-xl p-4 text-left max-w-sm mx-auto">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Server Health</p>
          {error && (
            <p className="text-danger text-sm">
              ✗ Cannot reach server: {error}
            </p>
          )}
          {health && (
            <pre className="text-green-400 text-xs font-mono whitespace-pre-wrap">
              {JSON.stringify(health, null, 2)}
            </pre>
          )}
          {!health && !error && (
            <p className="text-gray-500 text-sm animate-pulse">Connecting…</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/*" element={<Home />} />
    </Routes>
  );
}
