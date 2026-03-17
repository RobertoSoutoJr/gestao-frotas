import { FileQuestion } from 'lucide-react';
import { cn } from '../../lib/utils';

export function EmptyState({
  icon: Icon = FileQuestion,
  title,
  description,
  children,
  className
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--color-surface)]">
        <Icon className="h-7 w-7 text-[var(--color-text-secondary)]" />
      </div>
      <h3 className="text-base font-semibold text-[var(--color-text)]">
        {title}
      </h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-[var(--color-text-secondary)]">
          {description}
        </p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
