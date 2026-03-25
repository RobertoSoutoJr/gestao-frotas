import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useAuth } from './hooks/useAuth';
import { Header } from './components/layout/Header';
import { TabNavigation } from './components/layout/TabNavigation';
import { DashboardPage } from './pages/DashboardPage';
import { TrucksPage } from './pages/TrucksPage';
import { DriversPage } from './pages/DriversPage';
import { ClientsPage } from './pages/ClientsPage';
import { SuppliersPage } from './pages/SuppliersPage';
import { TripsPage } from './pages/TripsPage';
import { StockPage } from './pages/StockPage';
import { FuelPage } from './pages/FuelPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { ReportsPage } from './pages/ReportsPage';
import { AuthPage } from './pages/AuthPage';
import { LoadingScreen } from './components/ui/Spinner';
import { Button } from './components/ui/Button';
import { ToastContainer } from './components/ui/Toast';
import { useFleet } from './hooks/useFleet';
import { useToast } from './hooks/useToast';

function AuthenticatedContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { trucks, drivers, fuelRecords, maintenanceRecords, clients, suppliers, trips, stockRecords, loading, error, refetch } = useFleet();
  const { toasts, dismiss } = useToast();

  const handleRefetch = () => {
    refetch();
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
        <div className="linear-bg" />
        <div className="relative z-10 text-center bg-[var(--color-bg-elevated)] border border-[var(--color-border-hover)] rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-red-400">
            Erro ao carregar dados
          </h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{error}</p>
          <Button
            onClick={() => refetch()}
            variant="primary"
            className="mt-4"
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] transition-colors duration-300">
      <div className="linear-bg" />
      <div className="linear-grid" />

      <Header />
      <TabNavigation activeTab={activeTab} onChange={setActiveTab} />

      {/* Main content: add bottom padding on mobile for the fixed bottom nav */}
      <main className="relative z-10 container mx-auto px-4 py-6 md:py-8 pb-safe-bottom md:pb-8">
        {activeTab === 'dashboard' && (
          <DashboardPage
            trucks={trucks}
            drivers={drivers}
            clients={clients}
            suppliers={suppliers}
            trips={trips}
            stockRecords={stockRecords}
            fuelRecords={fuelRecords}
            maintenanceRecords={maintenanceRecords}
            onNavigate={setActiveTab}
          />
        )}
        {activeTab === 'trucks' && (
          <TrucksPage trucks={trucks} drivers={drivers} onRefetch={handleRefetch} />
        )}
        {activeTab === 'drivers' && (
          <DriversPage drivers={drivers} onRefetch={handleRefetch} />
        )}
        {activeTab === 'clients' && (
          <ClientsPage clients={clients} onRefetch={handleRefetch} />
        )}
        {activeTab === 'suppliers' && (
          <SuppliersPage suppliers={suppliers} onRefetch={handleRefetch} />
        )}
        {activeTab === 'trips' && (
          <TripsPage trucks={trucks} drivers={drivers} onRefetch={handleRefetch} />
        )}
        {activeTab === 'stock' && (
          <StockPage onRefetch={handleRefetch} />
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
