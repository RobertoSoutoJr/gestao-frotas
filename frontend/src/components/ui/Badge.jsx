import { cn } from '../../lib/utils';

const variants = {
  default: 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50',
  success: 'bg-green-100 text-green-900 dark:bg-green-900/20 dark:text-green-400',
  warning: 'bg-yellow-100 text-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-400',
  danger: 'bg-red-100 text-red-900 dark:bg-red-900/20 dark:text-red-400',
  info: 'bg-blue-100 text-blue-900 dark:bg-blue-900/20 dark:text-blue-400'
};

export function Badge({ children, variant = 'default', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
