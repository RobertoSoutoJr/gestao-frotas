import { cn } from '../../lib/utils';
import { LayoutDashboard, Truck, Users, Fuel, Wrench, BarChart3, Building2, Factory, Route, Warehouse } from 'lucide-react';

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
  return (
    <nav className="relative z-10 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-xl transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="flex overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
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
      </div>
    </nav>
  );
}
