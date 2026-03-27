import { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useAuth } from './hooks/useAuth';
import { Header } from './components/layout/Header';
import { TabNavigation } from './components/layout/TabNavigation';
import { LoadingScreen } from './components/ui/Spinner';
import { Button } from './components/ui/Button';
import { ToastContainer } from './components/ui/Toast';
import { useFleet } from './hooks/useFleet';
import { useToast } from './hooks/useToast';
import { OnboardingWizard, isOnboardingDone } from './components/ui/OnboardingWizard';

// Lazy-loaded pages (code splitting)
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const TrucksPage = lazy(() => import('./pages/TrucksPage').then(m => ({ default: m.TrucksPage })));
const DriversPage = lazy(() => import('./pages/DriversPage').then(m => ({ default: m.DriversPage })));
const ClientsPage = lazy(() => import('./pages/ClientsPage').then(m => ({ default: m.ClientsPage })));
const SuppliersPage = lazy(() => import('./pages/SuppliersPage').then(m => ({ default: m.SuppliersPage })));
const TripsPage = lazy(() => import('./pages/TripsPage').then(m => ({ default: m.TripsPage })));
const StockPage = lazy(() => import('./pages/StockPage').then(m => ({ default: m.StockPage })));
const FuelPage = lazy(() => import('./pages/FuelPage').then(m => ({ default: m.FuelPage })));
const MaintenancePage = lazy(() => import('./pages/MaintenancePage').then(m => ({ default: m.MaintenancePage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then(m => ({ default: m.ReportsPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const AuthPage = lazy(() => import('./pages/AuthPage').then(m => ({ default: m.AuthPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));

// Skeleton fallback for route transitions
function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded-lg bg-[var(--color-surface)]" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-[var(--color-surface)]" />
        ))}
      </div>
      <div className="h-64 rounded-xl bg-[var(--color-surface)]" />
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-[var(--color-surface)]" />
        ))}
      </div>
    </div>
  );
}

function AuthenticatedContent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { trucks, drivers, fuelRecords, maintenanceRecords, clients, suppliers, trips, stockRecords, loading, error, refetch } = useFleet();
  const { toasts, dismiss } = useToast();
  const isAdmin = user?.role !== 'motorista';
  const [showOnboarding, setShowOnboarding] = useState(!isOnboardingDone());

  const handleNavigate = (path) => {
    navigate(`/${path}`);
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

      <Header searchData={{ trucks, drivers, clients, suppliers, trips }} />
      <TabNavigation />

      <main className="relative z-10 container mx-auto px-4 py-6 md:py-8 pb-safe-bottom md:pb-8">
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={
              <DashboardPage
                trucks={trucks}
                drivers={drivers}
                clients={clients}
                suppliers={suppliers}
                trips={trips}
                stockRecords={stockRecords}
                fuelRecords={fuelRecords}
                maintenanceRecords={maintenanceRecords}
                onNavigate={handleNavigate}
              />
            } />
            <Route path="/trips" element={
              <TripsPage trucks={trucks} drivers={drivers} onRefetch={refetch} />
            } />
            <Route path="/fuel" element={
              <FuelPage trucks={trucks} drivers={drivers} onRefetch={refetch} />
            } />
            <Route path="/settings" element={<SettingsPage />} />

            {/* Admin-only routes */}
            {isAdmin && (
              <>
                <Route path="/trucks" element={
                  <TrucksPage trucks={trucks} drivers={drivers} onRefetch={refetch} />
                } />
                <Route path="/drivers" element={
                  <DriversPage drivers={drivers} trips={trips} fuelRecords={fuelRecords} onRefetch={refetch} />
                } />
                <Route path="/clients" element={
                  <ClientsPage clients={clients} trips={trips} onRefetch={refetch} />
                } />
                <Route path="/suppliers" element={
                  <SuppliersPage suppliers={suppliers} onRefetch={refetch} />
                } />
                <Route path="/stock" element={
                  <StockPage onRefetch={refetch} />
                } />
                <Route path="/maintenance" element={
                  <MaintenancePage trucks={trucks} onRefetch={refetch} />
                } />
                <Route path="/reports" element={
                  <ReportsPage
                    trucks={trucks}
                    drivers={drivers}
                    fuelRecords={fuelRecords}
                    maintenanceRecords={maintenanceRecords}
                    trips={trips}
                  />
                } />
              </>
            )}

            {/* Fallback: motorista trying admin routes */}
            {!isAdmin && (
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            )}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      {showOnboarding && isAdmin && trucks.length === 0 && (
        <OnboardingWizard onComplete={() => { setShowOnboarding(false); refetch(); }} />
      )}
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, loading: authLoading } = useAuth();

  if (authLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </Suspense>
    );
  }

  return <AuthenticatedContent />;
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
