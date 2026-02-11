import { cn } from '../../lib/utils';
import { LayoutDashboard, Truck, Users, Fuel, Wrench, BarChart3 } from 'lucide-react';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'trucks', label: 'Caminhões', icon: Truck },
  { id: 'drivers', label: 'Motoristas', icon: Users },
  { id: 'fuel', label: 'Abastecimento', icon: Fuel },
  { id: 'maintenance', label: 'Manutenção', icon: Wrench },
  { id: 'reports', label: 'Relatórios', icon: BarChart3 }
];

export function TabNavigation({ activeTab, onChange }) {
  return (
    <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="container mx-auto px-4">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={cn(
                  'flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
