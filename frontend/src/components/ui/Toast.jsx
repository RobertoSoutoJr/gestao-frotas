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
      border: 'border-[#5E6AD2]/30',
      icon: null,
    },
  };

  const style = variants[toast.variant] || variants.default;

  return (
    <div
      className={cn(
        'animate-in slide-in-from-right pointer-events-auto flex w-full max-w-sm items-start gap-3',
        'border bg-[#0a0a0c] rounded-xl p-4 backdrop-blur-md',
        'shadow-[0_8px_32px_rgba(0,0,0,0.5)]',
        style.border
      )}
    >
      {style.icon && <div className="mt-0.5 shrink-0">{style.icon}</div>}
      <div className="flex-1">
        {toast.title && (
          <p className="text-sm font-semibold text-[#EDEDEF]">
            {toast.title}
          </p>
        )}
        {toast.description && (
          <p className="mt-0.5 text-xs text-[#8A8F98]">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 text-[#8A8F98] hover:text-[#EDEDEF] transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onDismiss }) {
  if (!toasts?.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
