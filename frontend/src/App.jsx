import { useState } from 'react';
import { Header } from './components/layout/Header';
import { TabNavigation } from './components/layout/TabNavigation';
import { TrucksPage } from './pages/TrucksPage';
import { DriversPage } from './pages/DriversPage';
import { FuelPage } from './pages/FuelPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { ReportsPage } from './pages/ReportsPage';
import { LoadingScreen } from './components/ui/Spinner';
import { ToastContainer } from './components/ui/Toast';
import { useFleet } from './hooks/useFleet';
import { useToast } from './hooks/useToast';

function App() {
  const [activeTab, setActiveTab] = useState('trucks');
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Erro</h2>
          <p className="mt-2 text-zinc-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />
      <TabNavigation activeTab={activeTab} onChange={setActiveTab} />

      <main className="container mx-auto px-4 py-8">
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

export default App;
