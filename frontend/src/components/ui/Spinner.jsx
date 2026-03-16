import { cn } from '../../lib/utils';

export function Spinner({ size = 'md', className }) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-2',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-white/10 border-t-[#5E6AD2]',
        sizes[size],
        className
      )}
    />
  );
}

export function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#050506]">
      <div className="linear-bg" />
      <div className="relative z-10 flex flex-col items-center gap-5">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-[#5E6AD2]" />
        <p className="text-sm font-medium text-[#8A8F98]">Carregando...</p>
      </div>
    </div>
  );
}
