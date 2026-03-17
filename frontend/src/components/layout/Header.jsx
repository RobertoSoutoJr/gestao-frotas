import { useState } from 'react';
import { Fuel, LogOut, ChevronDown, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../lib/utils';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
  };

  return (
    <header className="relative z-10 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-xl transition-colors duration-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/25">
              <Fuel className="h-4 w-4 text-[var(--color-accent)]" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-[var(--color-text)]">Fuel</span>
              <span className="text-[var(--color-accent)]">Track</span>
            </h1>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] transition-all duration-200 hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-border-hover)] cursor-pointer"
              aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
              title={isDark ? 'Modo claro' : 'Modo escuro'}
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-[var(--color-text-secondary)]" />
              )}
            </button>

            {/* User Menu */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2.5 rounded-xl bg-[var(--color-surface)] px-3 py-2 transition-all duration-200 hover:bg-[var(--color-surface-hover)] cursor-pointer"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-accent)]/20 text-xs font-semibold text-[var(--color-accent)]">
                    {user.nome?.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium text-[var(--color-text)] leading-none">
                      {user.nome}
                    </div>
                    {user.empresa && (
                      <div className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                        {user.empresa}
                      </div>
                    )}
                  </div>
                  <ChevronDown className={cn(
                    "h-4 w-4 text-[var(--color-text-secondary)] transition-transform duration-200",
                    menuOpen && "rotate-180"
                  )} />
                </button>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 z-20 mt-2 w-60 rounded-xl border border-[var(--color-border-hover)] bg-[var(--color-bg-elevated)] shadow-[0_16px_48px_var(--color-shadow)] animate-scale-in">
                      <div className="border-b border-[var(--color-border)] px-4 py-3">
                        <div className="text-sm font-medium text-[var(--color-text)]">
                          {user.nome}
                        </div>
                        <div className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                          {user.email}
                        </div>
                      </div>
                      <div className="p-1.5">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-500 transition-all hover:bg-red-500/10 cursor-pointer"
                        >
                          <LogOut className="h-4 w-4" />
                          Sair da conta
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
