import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useAuth } from './hooks/useAuth';
import { Header } from './components/layout/Header';
import { TabNavigation } from './components/layout/TabNavigation';
import { DashboardPage } from './pages/DashboardPage';
import { TrucksPage } from './pages/TrucksPage';
import { DriversPage } from './pages/DriversPage';
import { FuelPage } from './pages/FuelPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { ReportsPage } from './pages/ReportsPage';
import { AuthPage } from './pages/AuthPage';
import { LoadingScreen } from './components/ui/Spinner';
import { ToastContainer } from './components/ui/Toast';
import { useFleet } from './hooks/useFleet';
import { useToast } from './hooks/useToast';

function AuthenticatedContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { trucks, drivers, fuelRecords, maintenanceRecords, loading, error, refetch } = useFleet();
  const { toasts, success, dismiss } = useToast();

  const handleRefetch = () => {
    refetch();
    success('Sucesso', 'Dados atualizados com sucesso');
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090014]">
        <div className="vw-grid-bg" />
        <div className="relative z-10 text-center border-2 border-[#FF00FF] bg-black/80 p-8 shadow-[0_0_30px_rgba(255,0,255,0.2)]">
          <h2 className="font-[Orbitron] text-2xl font-bold text-[#FF00FF] drop-shadow-[0_0_10px_rgba(255,0,255,0.8)]">
            ERRO DE SISTEMA
          </h2>
          <p className="mt-3 font-mono text-[#E0E0E0]/60">&gt; {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090014]">
      {/* Background Effects */}
      <div className="vw-grid-bg" />
      <div className="vw-chromatic" />

      {/* App Content */}
      <Header />
      <TabNavigation activeTab={activeTab} onChange={setActiveTab} />

      <main className="relative z-10 container mx-auto px-4 py-8">
        {activeTab === 'dashboard' && (
          <DashboardPage
            trucks={trucks}
            fuelRecords={fuelRecords}
            maintenanceRecords={maintenanceRecords}
          />
        )}
        {activeTab === 'trucks' && (
          <TrucksPage trucks={trucks} onRefetch={handleRefetch} />
        )}
        {activeTab === 'drivers' && (
          <DriversPage drivers={drivers} onRefetch={handleRefetch} />
        )}
        {activeTab === 'fuel' && (
          <FuelPage trucks={trucks} drivers={drivers} onRefetch={handleRefetch} />
        )}
        {activeTab === 'maintenance' && (
          <MaintenancePage trucks={trucks} onRefetch={handleRefetch} />
        )}
        {activeTab === 'reports' && (
          <ReportsPage
            trucks={trucks}
            fuelRecords={fuelRecords}
            maintenanceRecords={maintenanceRecords}
          />
        )}
      </main>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, loading: authLoading } = useAuth();

  if (authLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return <AuthenticatedContent />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
