import { CheckCircle, XCircle, X } from 'lucide-react';
import { cn } from '../../lib/utils';

function Toast({ toast, onDismiss }) {
  const variants = {
    success: {
      border: 'border-[#00FF88]',
      glow: 'shadow-[0_0_15px_rgba(0,255,136,0.3)]',
      icon: <CheckCircle className="h-5 w-5 text-[#00FF88]" />,
    },
    error: {
      border: 'border-[#FF00FF]',
      glow: 'shadow-[0_0_15px_rgba(255,0,255,0.3)]',
      icon: <XCircle className="h-5 w-5 text-[#FF00FF]" />,
    },
    default: {
      border: 'border-[#00FFFF]',
      glow: 'shadow-[0_0_15px_rgba(0,255,255,0.3)]',
      icon: null,
    },
  };

  const style = variants[toast.variant] || variants.default;

  return (
    <div
      className={cn(
        'animate-in slide-in-from-right pointer-events-auto flex w-full max-w-sm items-start gap-3',
        'border-2 bg-black/90 p-4 backdrop-blur-md',
        style.border,
        style.glow
      )}
    >
      {style.icon && <div className="mt-0.5 shrink-0">{style.icon}</div>}
      <div className="flex-1 font-mono">
        {toast.title && (
          <p className="text-sm font-semibold uppercase tracking-wider text-[#E0E0E0]">
            {toast.title}
          </p>
        )}
        {toast.description && (
          <p className="mt-1 text-xs text-[#E0E0E0]/60">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 text-[#E0E0E0]/40 hover:text-[#00FFFF] transition-colors"
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
