import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import DashboardView from './components/Dashboard/DashboardView';
import CropsView from './components/Farmer/CropsView';
import AdvisoriesView from './components/Common/AdvisoriesView';
import InventoryView from './components/Common/InventoryView';
import TraceabilityView from './components/Common/TraceabilityView';
import CreditView from './components/Farmer/CreditView';
import AnalyticsView from './components/Analytics/AnalyticsView';
import { Sprout } from 'lucide-react';

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl mb-4 shadow-lg">
              <Sprout className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Oilseed Value Chain Platform
            </h1>
            <p className="text-gray-600">
              AI-Enabled Platform for Self-Reliance
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setShowRegister(false)}
                className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                  !showRegister
                    ? 'text-emerald-600 border-b-2 border-emerald-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setShowRegister(true)}
                className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                  showRegister
                    ? 'text-emerald-600 border-b-2 border-emerald-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Register
              </button>
            </div>

            {showRegister ? <RegisterForm /> : <LoginForm />}
          </div>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Powered by AI & Blockchain Technology</p>
            <p className="mt-1">Supporting India's Oilseed Mission 2030-31</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6">
            {currentView === 'dashboard' && <DashboardView />}
            {currentView === 'crops' && <CropsView />}
            {currentView === 'advisories' && <AdvisoriesView />}
            {currentView === 'inventory' && <InventoryView />}
            {currentView === 'traceability' && <TraceabilityView />}
            {currentView === 'credit' && <CreditView />}
            {currentView === 'analytics' && <AnalyticsView />}
            {currentView === 'settings' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
                <p className="text-gray-600">Settings panel coming soon...</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
