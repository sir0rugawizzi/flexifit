// client/src/App.jsx
// Main FlexiFit Single Page / PWA application with Pitch Mode Bar and Role Router

import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import Navbar from './components/Navbar';
import PitchModeBar from './components/PitchModeBar';
import TrainerDashboard from './pages/trainer/TrainerDashboard';
import ClientApp from './pages/client/ClientApp';

function MainApp() {
  const { user, isAuthenticated, loading, isTrainer } = useAuth();
  const [activeTab, setActiveTab] = useState('clients');
  const [country, setCountry] = useState('UG'); // Default: Uganda (Kampala)

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center font-black text-xl mx-auto animate-pulse">
            FF
          </div>
          <p className="text-xs text-gray-400 font-mono">Loading FlexiFit Platform…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const handleNavigateBeat = (targetTab) => {
    setActiveTab(targetTab);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-dark flex flex-col pt-8">
      {/* 5-Min Pitch Mode Bar at the very top */}
      <PitchModeBar onNavigateBeat={handleNavigateBeat} />

      {/* Main App Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        country={country}
        onSelectCountry={setCountry}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 pb-16">
        {isTrainer ? (
          <TrainerDashboard activeTab={activeTab} country={country} />
        ) : (
          <ClientApp activeTab={activeTab} country={country} />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
