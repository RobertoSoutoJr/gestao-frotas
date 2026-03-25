import { cn } from '../../lib/utils';

const variants = {
  primary: 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] shadow-[0_0_0_1px_var(--color-border),0_4px_16px_rgba(94,106,210,0.35)] active:scale-[0.98]',
  default: 'bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] shadow-[0_0_0_1px_var(--color-border)]',
  success: 'bg-emerald-600 text-white hover:bg-emerald-500 active:scale-[0.98]',
  danger:  'bg-red-600 text-white hover:bg-red-500 active:scale-[0.98]',
  outline: 'border border-[var(--color-border)] bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface)]',
  ghost:   'bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm min-h-[44px] sm:min-h-0',
  md: 'px-4 py-2 text-sm min-h-[44px] sm:min-h-0',
  lg: 'px-5 py-2.5 text-base min-h-[44px]',
};

export function Button({
  children,
  variant = 'default',
  size = 'md',
  className,
  disabled,
  loading,
  ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 cursor-pointer whitespace-nowrap touch-manipulation',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]',
        'disabled:pointer-events-none disabled:opacity-40',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
}
