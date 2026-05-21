import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import {
  LayoutDashboard, Truck, Users, Fuel, Wrench, BarChart3, Building2, Factory, Route, Warehouse,
  ChevronDown, ChevronRight, MoreHorizontal, X, FolderOpen, Store, ClipboardList
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['admin', 'motorista'] },
  { id: 'trips', label: 'Viagens', icon: Route, path: '/trips', roles: ['admin', 'motorista'] },
  { id: 'fuel', label: 'Abastecimento', icon: Fuel, path: '/fuel', roles: ['admin', 'motorista'] },
  { id: 'maintenance', label: 'Manutencao', icon: Wrench, path: '/maintenance', roles: ['admin'] },
  {
    id: 'cadastros',
    label: 'Cadastros',
    icon: FolderOpen,
    roles: ['admin'],
    children: [
      { id: 'trucks', label: 'Caminhoes', icon: Truck, path: '/trucks' },
      { id: 'drivers', label: 'Motoristas', icon: Users, path: '/drivers' },
      { id: 'clients', label: 'Clientes', icon: Building2, path: '/clients' },
      { id: 'suppliers', label: 'Fornecedores', icon: Factory, path: '/suppliers' },
      { id: 'oficinas', label: 'Oficinas', icon: Wrench, path: '/oficinas' },
      { id: 'postos', label: 'Postos', icon: Store, path: '/postos' },
    ],
  },
  { id: 'stock', label: 'Estoque', icon: Warehouse, path: '/stock', roles: ['admin'] },
  { id: 'reports', label: 'Relatorios', icon: BarChart3, path: '/reports', roles: ['admin'] },
  { id: 'audit', label: 'Auditoria', icon: ClipboardList, path: '/audit', roles: ['admin'] },
];

export function Sidebar() {
  const { user } = useAuth();
  const role = user?.role || 'admin';
  const location = useLocation();
  const navigate = useNavigate();
  const [cadastrosOpen, setCadastrosOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = MENU_ITEMS.filter(item => item.roles.includes(role));

  // Auto-expand cadastros if a child route is active
  const cadastrosChildPaths = MENU_ITEMS.find(i => i.id === 'cadastros')?.children?.map(c => c.path) || [];
  const isCadastroActive = cadastrosChildPaths.some(p => location.pathname.startsWith(p));

  useEffect(() => {
    if (isCadastroActive) setCadastrosOpen(true);
  }, [isCadastroActive]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname.startsWith(path);

  const NavItem = ({ item, indent = false }) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    return (
      <button
        onClick={() => navigate(item.path)}
        className={cn(
          'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 cursor-pointer',
          indent && 'pl-10',
          active
            ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent)]'
            : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]'
        )}
      >
        <Icon className="h-4.5 w-4.5 shrink-0" />
        <span className="truncate">{item.label}</span>
      </button>
    );
  };

  const NavContent = () => (
    <nav className="flex flex-col gap-1 px-3 py-4">
      {items.map(item => {
        if (item.children) {
          const Icon = item.icon;
          return (
            <div key={item.id}>
              <button
                onClick={() => setCadastrosOpen(!cadastrosOpen)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 cursor-pointer',
                  isCadastroActive
                    ? 'text-[var(--color-accent)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]'
                )}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                <span className="truncate flex-1 text-left">{item.label}</span>
                {cadastrosOpen
                  ? <ChevronDown className="h-4 w-4 shrink-0 transition-transform" />
                  : <ChevronRight className="h-4 w-4 shrink-0 transition-transform" />
                }
              </button>
              {cadastrosOpen && (
                <div className="mt-1 space-y-0.5">
                  {item.children.map(child => (
                    <NavItem key={child.id} item={child} indent />
                  ))}
                </div>
              )}
            </div>
          );
        }
        return <NavItem key={item.id} item={item} />;
      })}
    </nav>
  );

  // Mobile: primary bottom bar tabs
  const mobilePrimaryIds = role === 'motorista'
    ? ['dashboard', 'trips', 'fuel']
    : ['dashboard', 'trips', 'fuel', 'maintenance'];
  const mobilePrimary = items.filter(i => mobilePrimaryIds.includes(i.id));
  const isSecondaryActive = items.some(i => {
    if (mobilePrimaryIds.includes(i.id)) return false;
    if (i.children) return i.children.some(c => isActive(c.path));
    return i.path && isActive(i.path);
  });

  return (
    <>
      {/* ===== Desktop: fixed left sidebar (>= lg) ===== */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-56 lg:border-r lg:border-[var(--color-border)] lg:bg-[var(--color-bg)]/95 lg:backdrop-blur-xl lg:pt-[57px]">
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <NavContent />
        </div>
      </aside>

      {/* ===== Tablet: narrower sidebar (md to lg) ===== */}
      {/* We'll use bottom bar for tablet too, keeping it simple */}

      {/* ===== Mobile/Tablet: fixed bottom navigation bar (< lg) ===== */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur-xl" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="flex items-stretch justify-around px-1">
          {mobilePrimary.map(item => {
            const Icon = item.icon;
            const active = item.path && isActive(item.path);
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] py-2 px-1 flex-1 transition-colors duration-150 cursor-pointer',
                  active ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)]'
                )}
              >
                <Icon className="h-6 w-6 shrink-0" />
                <span className={cn('text-[10px] leading-tight font-medium truncate max-w-full', active && 'font-semibold')}>{item.label}</span>
              </button>
            );
          })}

          {/* "Mais" button for mobile */}
          <button
            onClick={() => setMobileOpen(true)}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] py-2 px-1 flex-1 transition-colors duration-150 cursor-pointer',
              isSecondaryActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)]'
            )}
          >
            <MoreHorizontal className="h-6 w-6 shrink-0" />
            <span className={cn('text-[10px] leading-tight font-medium', isSecondaryActive && 'font-semibold')}>Mais</span>
          </button>
        </div>
      </nav>

      {/* ===== Mobile "More" slide-up panel ===== */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={() => setMobileOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-[var(--color-bg-elevated)] border-t border-[var(--color-border-hover)] rounded-t-2xl animate-slide-up" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-[var(--color-border)]" />
            </div>
            <div className="flex items-center justify-between px-5 pb-3">
              <span className="text-sm font-semibold text-[var(--color-text)]">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[var(--color-surface-hover)] cursor-pointer">
                <X className="h-5 w-5 text-[var(--color-text-secondary)]" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto pb-4">
              <NavContent />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
