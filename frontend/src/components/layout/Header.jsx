import { useState } from 'react';
import { Truck, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
  };

  return (
    <header className="relative z-10 border-b border-white/[0.06] bg-[#050506]/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#5E6AD2]/15 border border-[#5E6AD2]/25">
              <Truck className="h-4 w-4 text-[#5E6AD2]" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-[#EDEDEF]">Frota</span>
              <span className="text-[#5E6AD2]">Pro</span>
            </h1>
          </div>

          {/* User Menu */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2.5 rounded-xl bg-white/[0.05] px-3 py-2 transition-all duration-200 hover:bg-white/[0.08]"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#5E6AD2]/20 text-xs font-semibold text-[#5E6AD2]">
                  {user.nome?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-[#EDEDEF] leading-none">
                    {user.nome}
                  </div>
                  {user.empresa && (
                    <div className="text-xs text-[#8A8F98] mt-0.5">
                      {user.empresa}
                    </div>
                  )}
                </div>
                <ChevronDown className={cn(
                  "h-4 w-4 text-[#8A8F98] transition-transform duration-200",
                  menuOpen && "rotate-180"
                )} />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-60 rounded-xl border border-white/[0.08] bg-[#0a0a0c] shadow-[0_16px_48px_rgba(0,0,0,0.6)]">
                    <div className="border-b border-white/[0.06] px-4 py-3">
                      <div className="text-sm font-medium text-[#EDEDEF]">
                        {user.nome}
                      </div>
                      <div className="text-xs text-[#8A8F98] mt-0.5">
                        {user.email}
                      </div>
                    </div>
                    <div className="p-1.5">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-400 transition-all hover:bg-red-500/10"
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
    </header>
  );
}
