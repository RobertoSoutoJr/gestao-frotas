import { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { PlanLimitProvider } from './contexts/PlanLimitContext';
import { useAuth } from './hooks/useAuth';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { LoadingScreen } from './components/ui/Spinner';
import { PageSkeleton } from './components/ui/Skeleton';
import { Button } from './components/ui/Button';
import { ToastContainer } from './components/ui/Toast';
import { useFleet } from './hooks/useFleet';
import { useToast } from './hooks/useToast';
import { OnboardingWizard, isOnboardingDone } from './components/ui/OnboardingWizard';

// Lazy-loaded pages (code splitting)
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const DriverDashboardPage = lazy(() => import('./pages/DriverDashboardPage').then(m => ({ default: m.DriverDashboardPage })));
const TrucksPage = lazy(() => import('./pages/TrucksPage').then(m => ({ default: m.TrucksPage })));
const DriversPage = lazy(() => import('./pages/DriversPage').then(m => ({ default: m.DriversPage })));
const ClientsPage = lazy(() => import('./pages/ClientsPage').then(m => ({ default: m.ClientsPage })));
const SuppliersPage = lazy(() => import('./pages/SuppliersPage').then(m => ({ default: m.SuppliersPage })));
const TripsPage = lazy(() => import('./pages/TripsPage').then(m => ({ default: m.TripsPage })));
const StockPage = lazy(() => import('./pages/StockPage').then(m => ({ default: m.StockPage })));
const FuelPage = lazy(() => import('./pages/FuelPage').then(m => ({ default: m.FuelPage })));
const MaintenancePage = lazy(() => import('./pages/MaintenancePage').then(m => ({ default: m.MaintenancePage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then(m => ({ default: m.ReportsPage })));
const OficinasPage = lazy(() => import('./pages/OficinasPage').then(m => ({ default: m.OficinasPage })));
const PostosPage = lazy(() => import('./pages/PostosPage').then(m => ({ default: m.PostosPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const AuditPage = lazy(() => import('./pages/AuditPage').then(m => ({ default: m.AuditPage })));
const AuthPage = lazy(() => import('./pages/AuthPage').then(m => ({ default: m.AuthPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));

// PageSkeleton imported from './components/ui/Skeleton'

function MotoristaBlockScreen({ user }) {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
      <div className="linear-bg" />
      <div className="relative z-10 text-center max-w-md">
        <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border-hover)] rounded-2xl p-8 shadow-lg">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
            Acesse pelo aplicativo
          </h1>
          <p className="text-[var(--color-text-secondary)] mb-1">
            Ola, <span className="font-semibold text-[var(--color-text-primary)]">{user?.nome?.split(' ')[0]}</span>
          </p>
          <p className="text-[var(--color-text-tertiary)] text-sm mb-6 leading-relaxed">
            O painel web esta disponivel apenas para gestores.
            Como motorista, utilize o aplicativo mobile para registrar
            abastecimentos, manutencoes e acompanhar suas viagens.
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={logout} variant="outline" className="w-full">
              Sair da conta
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthenticatedContent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { trucks, drivers, fuelRecords, maintenanceRecords, clients, suppliers, trips, stockRecords, oficinas, postos, loading, error, refetch } = useFleet();
  const isAdmin = user?.role !== 'motorista';
  const [showOnboarding, setShowOnboarding] = useState(!isOnboardingDone());

  const handleNavigate = (path, searchParams) => {
    if (searchParams) {
      const qs = new URLSearchParams(searchParams).toString();
      navigate(`/${path}?${qs}`);
    } else {
      navigate(`/${path}`);
    }
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

  // Motorista: block web access, redirect to "use mobile app" screen
  if (!isAdmin) {
    return (
      <MotoristaBlockScreen user={user} />
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] transition-colors duration-300">
      <div className="linear-bg" />
      <div className="linear-grid" />

      <Header searchData={{ trucks, drivers, clients, suppliers, trips }} />
      <Sidebar />

      <main className="relative z-10 lg:ml-56 container mx-auto px-4 py-6 md:py-8 pb-safe-bottom md:pb-8">
        <Suspense fallback={<div className="py-8"><PageSkeleton /></div>}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/auth" element={<Navigate to="/dashboard" replace />} />
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
              <FuelPage trucks={trucks} drivers={drivers} postos={postos} onRefetch={refetch} />
            } />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/trucks" element={
              <TrucksPage trucks={trucks} drivers={drivers} onRefetch={refetch} />
            } />
            <Route path="/drivers" element={
              <DriversPage drivers={drivers} trucks={trucks} trips={trips} fuelRecords={fuelRecords} onRefetch={refetch} />
            } />
            <Route path="/clients" element={
              <ClientsPage clients={clients} trips={trips} onRefetch={refetch} />
            } />
            <Route path="/suppliers" element={
              <SuppliersPage suppliers={suppliers} trips={trips} onRefetch={refetch} />
            } />
            <Route path="/stock" element={
              <StockPage onRefetch={refetch} />
            } />
            <Route path="/maintenance" element={
              <MaintenancePage trucks={trucks} oficinas={oficinas} onRefetch={refetch} />
            } />
            <Route path="/oficinas" element={
              <OficinasPage oficinas={oficinas} onRefetch={refetch} />
            } />
            <Route path="/postos" element={
              <PostosPage postos={postos} onRefetch={refetch} />
            } />
            <Route path="/audit" element={<AuditPage />} />
            <Route path="/reports" element={
              <ReportsPage
                trucks={trucks}
                drivers={drivers}
                clients={clients}
                fuelRecords={fuelRecords}
                maintenanceRecords={maintenanceRecords}
                trips={trips}
              />
            } />

            {/* Fallback: unknown routes go to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </main>

      {showOnboarding && trucks.length === 0 && (
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

function RootToastContainer() {
  const { toasts, dismiss } = useToast();
  return <ToastContainer toasts={toasts} onDismiss={dismiss} />;
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <ToastProvider>
            <PlanLimitProvider>
              <AuthProvider>
                <AppContent />
              </AuthProvider>
            </PlanLimitProvider>
            <RootToastContainer />
          </ToastProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
