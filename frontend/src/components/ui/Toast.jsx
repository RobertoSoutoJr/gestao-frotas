import { CheckCircle, XCircle, X } from 'lucide-react';
import { cn } from '../../lib/utils';

function Toast({ toast, onDismiss }) {
  const variants = {
    success: {
      border: 'border-emerald-500/30',
      icon: <CheckCircle className="h-4 w-4 text-emerald-400" />,
    },
    error: {
      border: 'border-red-500/30',
      icon: <XCircle className="h-4 w-4 text-red-400" />,
    },
    default: {
      border: 'border-[var(--color-accent)]/30',
      icon: null,
    },
  };

  const style = variants[toast.variant] || variants.default;

  return (
    <div
      className={cn(
        'animate-in slide-in-from-right sm:slide-in-from-right pointer-events-auto flex w-full sm:max-w-sm items-start gap-3',
        'border bg-[var(--color-bg-elevated)] rounded-xl p-4 backdrop-blur-md',
        'shadow-[0_8px_32px_var(--color-shadow)]',
        style.border
      )}
      role="alert"
      aria-live={toast.variant === 'error' ? 'assertive' : 'polite'}
    >
      {style.icon && <div className="mt-0.5 shrink-0">{style.icon}</div>}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-sm font-semibold text-[var(--color-text)]">
            {toast.title}
          </p>
        )}
        {toast.description && (
          <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors cursor-pointer touch-manipulation"
        aria-label="Fechar notificação"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onDismiss }) {
  if (!toasts?.length) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-[60] flex flex-col gap-2 safe-bottom">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
