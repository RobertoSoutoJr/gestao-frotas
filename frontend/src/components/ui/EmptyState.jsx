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
      <div className="mb-4 flex h-16 w-16 items-center justify-center border-2 border-[#FF00FF]/30 rotate-45 bg-[#FF00FF]/5">
        <Icon className="h-8 w-8 text-[#FF00FF]/60 -rotate-45" />
      </div>
      <h3 className="font-[Orbitron] text-lg font-semibold uppercase tracking-wider text-[#E0E0E0]/80">
        {title}
      </h3>
      {description && (
        <p className="mt-2 max-w-sm font-mono text-sm text-[#E0E0E0]/50">
          {description}
        </p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
