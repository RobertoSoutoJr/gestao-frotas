import { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { LayoutDashboard, Truck, Users, Fuel, Wrench, BarChart3, Building2, Factory, Route, Warehouse, ChevronLeft, ChevronRight } from 'lucide-react';

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

export function TabNavigation({ activeTab, onChange }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * 200, behavior: 'smooth' });
  };

  return (
    <nav className="relative z-10 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-xl transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="relative">
          {/* Left fade + arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scroll(-1)}
              className="absolute left-0 top-0 bottom-0 z-20 flex items-center pr-2 bg-gradient-to-r from-[var(--color-bg)] via-[var(--color-bg)]/80 to-transparent cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4 text-[var(--color-text-secondary)]" />
            </button>
          )}

          {/* Tabs */}
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
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right fade + arrow */}
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
  );
}
