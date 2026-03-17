import { cn } from '../../lib/utils';

export function Card({ className, children, onClick, ...props }) {
  return (
    <div
      className={cn(
        'bg-gradient-to-b from-[var(--color-card-from)] to-[var(--color-card-to)]',
        'border border-[var(--color-border)]',
        'rounded-2xl',
        'shadow-[0_0_0_1px_var(--color-border),0_8px_32px_var(--color-shadow)]',
        'hover:border-[var(--color-border-hover)] hover:shadow-[0_0_0_1px_var(--color-border-hover),0_12px_40px_var(--color-shadow-hover)]',
        'transition-all duration-200',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(e); } } : undefined}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3
      className={cn(
        'text-lg font-semibold text-[var(--color-text)]',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }) {
  return (
    <p
      className={cn('text-sm text-[var(--color-text-secondary)]', className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn('p-6 pt-0', className)} {...props}>
      {children}
    </div>
  );
}
