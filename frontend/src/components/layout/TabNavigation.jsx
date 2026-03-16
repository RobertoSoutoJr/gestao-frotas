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
    <nav className="relative z-10 border-b border-[#2D1B4E] bg-[#090014]/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex gap-0 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={cn(
                  'flex items-center gap-2 whitespace-nowrap border-b-2 px-5 py-3.5 font-mono text-sm uppercase tracking-wider transition-all duration-200',
                  isActive
                    ? 'border-[#00FFFF] text-[#00FFFF] bg-[#00FFFF]/5 shadow-[0_2px_10px_rgba(0,255,255,0.2)]'
                    : 'border-transparent text-[#E0E0E0]/40 hover:text-[#FF00FF] hover:border-[#FF00FF]/50'
                )}
              >
                <Icon className={cn('h-4 w-4', isActive && 'drop-shadow-[0_0_5px_rgba(0,255,255,0.8)]')} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
