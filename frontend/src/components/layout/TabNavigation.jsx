import { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { LayoutDashboard, Truck, Users, Fuel, Wrench, BarChart3, Building2, Factory, Route, Warehouse, ChevronLeft, ChevronRight, MoreHorizontal, X } from 'lucide-react';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'trucks', label: 'Caminhões', icon: Truck },
  { id: 'drivers', label: 'Motoristas', icon: Users },
  { id: 'clients', label: 'Clientes', icon: Building2 },
  { id: 'suppliers', label: 'Fornecedores', icon: Factory },
  { id: 'trips', label: 'Viagens', icon: Route },
  { id: 'stock', label: 'Estoque', icon: Warehouse },
  { id: 'fuel', label: 'Abastecimento', icon: Fuel },
  { id: 'maintenance', label: 'Manutenção', icon: Wrench },
  { id: 'reports', label: 'Relatórios', icon: BarChart3 }
];

// Primary tabs shown in mobile bottom nav
const primaryTabIds = ['dashboard', 'trucks', 'trips', 'stock', 'reports'];
const primaryTabs = tabs.filter(t => primaryTabIds.includes(t.id));
const secondaryTabs = tabs.filter(t => !primaryTabIds.includes(t.id));

export function TabNavigation({ activeTab, onChange }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const activeBtn = el.querySelector(`[data-tab="${activeTab}"]`);
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeTab]);

  // Close "more" panel when switching tabs
  useEffect(() => {
    setMoreOpen(false);
  }, [activeTab]);

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * 200, behavior: 'smooth' });
  };

  const isSecondaryActive = secondaryTabs.some(t => t.id === activeTab);

  return (
    <>
      {/* ===== Desktop/Tablet: horizontal scrollable tabs (>= md) ===== */}
      <nav className="relative z-10 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-xl transition-colors duration-200 hidden md:block">
        <div className="container mx-auto px-4">
          <div className="relative">
            {canScrollLeft && (
              <button
                onClick={() => scroll(-1)}
                className="absolute left-0 top-0 bottom-0 z-20 flex items-center pr-2 bg-gradient-to-r from-[var(--color-bg)] via-[var(--color-bg)]/80 to-transparent cursor-pointer"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-4 w-4 text-[var(--color-text-secondary)]" />
              </button>
            )}

            <div ref={scrollRef} className="flex overflow-x-auto scrollbar-hide">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    data-tab={tab.id}
                    onClick={() => onChange(tab.id)}
                    className={cn(
                      'flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-all duration-200 cursor-pointer',
                      isActive
                        ? 'border-[var(--color-accent)] text-[var(--color-text)] bg-[var(--color-surface)]'
                        : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {canScrollRight && (
              <button
                onClick={() => scroll(1)}
                className="absolute right-0 top-0 bottom-0 z-20 flex items-center pl-2 bg-gradient-to-l from-[var(--color-bg)] via-[var(--color-bg)]/80 to-transparent cursor-pointer"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-4 w-4 text-[var(--color-text-secondary)]" />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ===== Mobile: fixed bottom navigation bar (< md) ===== */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur-xl" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="flex items-stretch justify-around px-1">
          {primaryTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] py-2 px-1 flex-1 transition-colors duration-150 cursor-pointer',
                  isActive
                    ? 'text-[var(--color-accent)]'
                    : 'text-[var(--color-text-secondary)]'
                )}
              >
                <Icon className="h-6 w-6 shrink-0" />
                <span className={cn(
                  'text-[10px] leading-tight font-medium truncate max-w-full',
                  isActive && 'font-semibold'
                )}>
                  {tab.label}
                </span>
              </button>
            );
          })}

          {/* "Mais" button */}
          <button
            onClick={() => setMoreOpen(true)}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] py-2 px-1 flex-1 transition-colors duration-150 cursor-pointer',
              isSecondaryActive
                ? 'text-[var(--color-accent)]'
                : 'text-[var(--color-text-secondary)]'
            )}
          >
            <MoreHorizontal className="h-6 w-6 shrink-0" />
            <span className={cn(
              'text-[10px] leading-tight font-medium',
              isSecondaryActive && 'font-semibold'
            )}>
              Mais
            </span>
          </button>
        </div>
      </nav>

      {/* ===== Mobile "More" slide-up panel ===== */}
      {moreOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 animate-fade-in"
            onClick={() => setMoreOpen(false)}
          />

          {/* Panel */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-[var(--color-bg-elevated)] border-t border-[var(--color-border-hover)] rounded-t-2xl animate-slide-up"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-[var(--color-border)]" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3">
              <span className="text-sm font-semibold text-[var(--color-text)]">Mais opções</span>
              <button
                onClick={() => setMoreOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[var(--color-surface-hover)] cursor-pointer"
              >
                <X className="h-5 w-5 text-[var(--color-text-secondary)]" />
              </button>
            </div>

            {/* Secondary tabs grid */}
            <div className="grid grid-cols-3 gap-1 px-4 pb-5">
              {secondaryTabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className={cn(
                      'flex flex-col items-center justify-center gap-1.5 rounded-xl py-4 px-2 min-h-[72px] transition-colors duration-150 cursor-pointer',
                      isActive
                        ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent)]'
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
                    )}
                  >
                    <Icon className="h-6 w-6 shrink-0" />
                    <span className={cn(
                      'text-xs font-medium',
                      isActive && 'font-semibold'
                    )}>
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
