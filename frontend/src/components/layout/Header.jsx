import { useState } from 'react';
import { Truck, LogOut, ChevronDown, Terminal } from 'lucide-react';
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
    <header className="relative z-10 border-b-2 border-[#FF00FF]/30 bg-[#090014]/90 backdrop-blur-md accent-bar-top">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center border-2 border-[#00FFFF] rotate-45 bg-[#00FFFF]/10 shadow-[0_0_15px_rgba(0,255,255,0.3)]">
              <Truck className="h-6 w-6 text-[#00FFFF] -rotate-45" />
            </div>
            <div>
              <h1 className="font-[Orbitron] text-2xl font-black tracking-wider">
                <span className="text-[#E0E0E0]">FROTA</span>
                <span className="text-gradient-sunset">PRO</span>
              </h1>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#FF00FF]/60">
                &gt; Sistema de Gestão
              </p>
            </div>
          </div>

          {/* User Menu */}
          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 border border-[#2D1B4E] bg-black/40 px-3 py-1.5">
                <Terminal className="h-3 w-3 text-[#00FFFF]" />
                <span className="font-mono text-xs text-[#00FFFF]/70">ONLINE</span>
                <div className="h-2 w-2 rounded-full bg-[#00FF88] animate-pulse" />
              </div>

              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-3 border-2 border-[#FF00FF]/30 bg-[#1a103c]/80 px-4 py-2.5 transition-all duration-200 hover:border-[#00FFFF] hover:shadow-[0_0_15px_rgba(0,255,255,0.2)]"
                >
                  <div className="flex h-8 w-8 items-center justify-center border border-[#FF00FF] bg-[#FF00FF]/20 text-sm font-bold text-[#FF00FF] font-[Orbitron]">
                    {user.nome?.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="font-mono text-sm text-[#E0E0E0]">
                      {user.nome}
                    </div>
                    {user.empresa && (
                      <div className="font-mono text-xs text-[#E0E0E0]/40">
                        {user.empresa}
                      </div>
                    )}
                  </div>
                  <ChevronDown className={cn(
                    "h-4 w-4 text-[#00FFFF] transition-transform duration-200",
                    menuOpen && "rotate-180"
                  )} />
                </button>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 z-20 mt-2 w-64 border-2 border-[#00FFFF] bg-black/95 shadow-[0_0_20px_rgba(0,255,255,0.2)]">
                      <div className="border-b border-[#00FFFF]/20 bg-[#00FFFF]/5 p-4">
                        <div className="font-mono text-sm text-[#00FFFF]">
                          &gt; {user.nome}
                        </div>
                        <div className="font-mono text-xs text-[#E0E0E0]/40">
                          {user.email}
                        </div>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 px-3 py-2 font-mono text-sm uppercase tracking-wider text-[#FF00FF] transition-all hover:bg-[#FF00FF]/10 hover:shadow-[inset_0_0_20px_rgba(255,0,255,0.1)]"
                        >
                          <LogOut className="h-4 w-4" />
                          Desconectar
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
