import { cn } from '../../lib/utils';

export function Select({ className, error, label, children, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-[var(--color-text-secondary)]">
          {label}
          {props.required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      <select
        className={cn(
          'flex min-h-[44px] sm:min-h-0 sm:h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2',
          'text-base sm:text-sm text-[var(--color-text)] touch-manipulation',
          'focus-visible:outline-none focus-visible:border-[var(--color-accent)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/20',
          'disabled:cursor-not-allowed disabled:opacity-40',
          'transition-all duration-200 cursor-pointer',
          error && 'border-red-500/50',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
