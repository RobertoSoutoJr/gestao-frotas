import { cn } from '../../lib/utils';

export function Spinner({ size = 'md', className }) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-[#2D1B4E] border-t-[#00FFFF]',
        sizes[size],
        className
      )}
    />
  );
}

export function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#090014]">
      <div className="vw-grid-bg" />
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#2D1B4E] border-t-[#00FFFF] shadow-[0_0_20px_rgba(0,255,255,0.3)]" />
        <div className="font-[Orbitron] text-lg uppercase tracking-[0.3em] text-[#00FFFF] animate-neon-pulse drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">
          Inicializando Sistema...
        </div>
      </div>
    </div>
  );
}
