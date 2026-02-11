import { useState } from 'react';
import { Truck, User, LogOut, Settings, ChevronDown, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../lib/utils';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
  };

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                Frota<span className="text-blue-600">Pro</span>
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Controle Financeiro e Operacional
              </p>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600"
                title={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
              >
                {theme === 'light' ? (
                  <Moon className="h-5 w-5 text-zinc-600" />
                ) : (
                  <Sun className="h-5 w-5 text-yellow-500" />
                )}
              </button>

              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600"
                >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-semibold text-white">
                  {user.nome?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {user.nome}
                  </div>
                  {user.empresa && (
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {user.empresa}
                    </div>
                  )}
                </div>
                <ChevronDown className={cn(
                  "h-4 w-4 text-zinc-500 transition-transform duration-200",
                  menuOpen && "rotate-180"
                )} />
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-800">
                    <div className="border-b border-zinc-200 p-4 dark:border-zinc-700">
                      <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                        {user.nome}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        {user.email}
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
                        onClick={() => setMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        Configurações
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                      >
                        <LogOut className="h-4 w-4" />
                        Sair
                      </button>
                    </div>
                  </div>
                </>
              )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
