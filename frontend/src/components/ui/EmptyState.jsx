import { FileQuestion } from 'lucide-react';
import { cn } from '../../lib/utils';

export function EmptyState({
  icon: Icon = FileQuestion,
  title = 'No data found',
  description,
  action,
  className
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div className="rounded-full bg-zinc-100 p-6 dark:bg-zinc-800">
        <Icon className="h-10 w-10 text-zinc-400" />
      </div>
      <h3 className="mt-6 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {title}
      </h3>
      {description && (
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
