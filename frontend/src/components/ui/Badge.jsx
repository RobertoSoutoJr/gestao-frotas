import { cn } from '../../lib/utils';

const variants = {
  default: 'bg-[var(--color-surface)] text-[var(--color-text)] border-transparent',
  success: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20',
  warning: 'bg-amber-500/15 text-amber-500 border-amber-500/20',
  danger:  'bg-red-500/15 text-red-500 border-red-500/20',
  info:    'bg-[var(--color-accent)]/15 text-[var(--color-accent)] border-[var(--color-accent)]/20',
  outline: 'border-[var(--color-border)] text-[var(--color-text-secondary)] bg-transparent',
};

export function Badge({ children, variant = 'default', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5',
        'font-medium text-xs',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
