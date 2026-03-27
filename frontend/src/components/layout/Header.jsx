import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fuel, LogOut, ChevronDown, Sun, Moon, X, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { GlobalSearch } from '../ui/GlobalSearch';
import { cn } from '../../lib/utils';

export function Header({ searchData }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
  };

  return (
    <header
      className="relative z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-xl transition-colors duration-200"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="container mx-auto px-3 py-2 md:px-4 md:py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/25">
              <Fuel className="h-4 w-4 text-[var(--color-accent)]" />
            </div>
            <h1 className="text-xl font-bold tracking-tight hidden sm:block">
              <span className="text-[var(--color-text)]">Fuel</span>
              <span className="text-[var(--color-accent)]">Track</span>
            </h1>
          </div>

          {/* Global Search */}
          {searchData && (
            <div className="hidden sm:block flex-1 max-w-md mx-4">
              <GlobalSearch data={searchData} />
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex h-11 w-11 md:h-9 md:w-9 items-center justify-center rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] transition-all duration-200 hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-border-hover)] cursor-pointer"
              aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
              title={isDark ? 'Modo claro' : 'Modo escuro'}
            >
              {isDark ? (
                <Sun className="h-5 w-5 md:h-4 md:w-4 text-amber-400" />
              ) : (
                <Moon className="h-5 w-5 md:h-4 md:w-4 text-[var(--color-text-secondary)]" />
              )}
            </button>

            {/* User Menu */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 rounded-xl bg-[var(--color-surface)] px-2.5 py-1.5 md:px-3 md:py-2 min-h-[44px] transition-all duration-200 hover:bg-[var(--color-surface-hover)] cursor-pointer"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-accent)]/20 text-xs font-semibold text-[var(--color-accent)]">
                    {user.nome?.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium text-[var(--color-text)] leading-none">
                      {user.nome}
                    </div>
                    {user.role === 'motorista' ? (
                      <div className="text-xs text-amber-400 mt-0.5 font-medium">Motorista</div>
                    ) : user.empresa ? (
                      <div className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                        {user.empresa}
                      </div>
                    ) : null}
                  </div>
                  <ChevronDown className={cn(
                    "h-4 w-4 text-[var(--color-text-secondary)] transition-transform duration-200",
                    menuOpen && "rotate-180"
                  )} />
                </button>

                {menuOpen && (
                  <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />

                    {/* Desktop dropdown */}
                    <div className="hidden md:block absolute right-0 z-20 mt-2 w-60 rounded-xl border border-[var(--color-border-hover)] bg-[var(--color-bg-elevated)] shadow-[0_16px_48px_var(--color-shadow)] animate-scale-in">
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
                          onClick={() => { navigate('/settings'); setMenuOpen(false); }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[var(--color-text-secondary)] transition-all hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] cursor-pointer"
                        >
                          <Settings className="h-4 w-4" />
                          Configuracoes
                        </button>
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-500 transition-all hover:bg-red-500/10 cursor-pointer"
                        >
                          <LogOut className="h-4 w-4" />
                          Sair da conta
                        </button>
                      </div>
                    </div>

                    {/* Mobile slide-up menu */}
                    <div className="md:hidden fixed inset-0 z-[60]">
                      <div
                        className="absolute inset-0 bg-black/50 animate-fade-in"
                        onClick={() => setMenuOpen(false)}
                      />
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-[var(--color-bg-elevated)] border-t border-[var(--color-border-hover)] rounded-t-2xl animate-slide-up"
                        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
                      >
                        {/* Handle bar */}
                        <div className="flex justify-center pt-3 pb-1">
                          <div className="h-1 w-10 rounded-full bg-[var(--color-border)]" />
                        </div>

                        {/* User info */}
                        <div className="flex items-center justify-between px-5 pb-3">
                          <div>
                            <div className="text-sm font-semibold text-[var(--color-text)]">
                              {user.nome}
                            </div>
                            <div className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                              {user.email}
                            </div>
                          </div>
                          <button
                            onClick={() => setMenuOpen(false)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[var(--color-surface-hover)] cursor-pointer"
                          >
                            <X className="h-5 w-5 text-[var(--color-text-secondary)]" />
                          </button>
                        </div>

                        <div className="border-t border-[var(--color-border)] mx-4" />

                        <div className="p-4 space-y-2">
                          <button
                            onClick={() => { navigate('/settings'); setMenuOpen(false); }}
                            className="flex w-full items-center justify-center gap-2.5 rounded-xl px-4 py-3 min-h-[44px] text-sm font-medium text-[var(--color-text)] bg-[var(--color-surface)] transition-all hover:bg-[var(--color-surface-hover)] cursor-pointer"
                          >
                            <Settings className="h-5 w-5" />
                            Configuracoes
                          </button>
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center justify-center gap-2.5 rounded-xl px-4 py-3 min-h-[44px] text-sm font-medium text-red-500 bg-red-500/10 transition-all hover:bg-red-500/15 cursor-pointer"
                          >
                            <LogOut className="h-5 w-5" />
                            Sair da conta
                          </button>
                        </div>
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
