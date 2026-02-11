import { CheckCircle, XCircle, X } from 'lucide-react';
import { cn } from '../../lib/utils';

const variants = {
  success: {
    bg: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
    icon: CheckCircle,
    iconColor: 'text-green-600 dark:text-green-400'
  },
  error: {
    bg: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    icon: XCircle,
    iconColor: 'text-red-600 dark:text-red-400'
  },
  default: {
    bg: 'bg-white border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800',
    icon: null,
    iconColor: ''
  }
};

export function Toast({ id, title, description, variant = 'default', onDismiss }) {
  const config = variants[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'pointer-events-auto w-full max-w-sm rounded-lg border p-4 shadow-lg',
        'animate-in slide-in-from-right',
        config.bg
      )}
    >
      <div className="flex items-start gap-3">
        {Icon && <Icon className={cn('h-5 w-5 flex-shrink-0', config.iconColor)} />}
        <div className="flex-1 space-y-1">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {title}
          </p>
          {description && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {description}
            </p>
          )}
        </div>
        <button
          onClick={() => onDismiss(id)}
          className="flex-shrink-0 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="pointer-events-none fixed bottom-0 right-0 z-50 flex max-w-full flex-col gap-2 p-4">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
