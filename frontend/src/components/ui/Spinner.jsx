import { cn } from '../../lib/utils';
import { Fuel } from 'lucide-react';

export function Spinner({ size = 'md', className }) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-2',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-[var(--color-border)] border-t-[var(--color-accent)]',
        sizes[size],
        className
      )}
    />
  );
}

export function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-bg)]">
      <div className="linear-bg" />
      <div className="relative z-10 flex flex-col items-center gap-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/25">
          <Fuel className="h-6 w-6 text-[var(--color-accent)] animate-pulse" />
        </div>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)]" />
        <p className="text-sm font-medium text-[var(--color-text-secondary)]">Carregando FuelTrack...</p>
      </div>
    </div>
  );
}
