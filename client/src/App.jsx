// client/src/App.jsx
// Main FlexiFit Single Page / PWA application
import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import Navbar from './components/Navbar';
import TrainerDashboard from './pages/trainer/TrainerDashboard';
import ClientApp from './pages/client/ClientApp';
import PrivacyPage from './pages/PrivacyPage';
import SettingsPage from './pages/SettingsPage';

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
    return (
      <div className="flex flex-col min-h-screen">
        <LoginPage />
        <footer className="mt-auto p-6 text-center text-xs text-gray-500 flex justify-center gap-4">
          <a href="/privacy" className="underline">Privacy Policy</a>
          <a href="/faq" className="underline">FAQs</a>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-dark flex flex-col pt-8">
      {/* Main App Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        country={country}
        onSelectCountry={setCountry}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 pb-16">
        {activeTab === 'privacy' && <PrivacyPage />}
        {activeTab === 'faq' && <FAQPage />}
        {activeTab === 'settings' && <SettingsPage />}
        {activeTab !== 'privacy' && activeTab !== 'faq' && activeTab !== 'settings' && (
          isTrainer ? (
            <TrainerDashboard activeTab={activeTab} country={country} />
          ) : (
            <ClientApp activeTab={activeTab} country={country} />
          )
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
