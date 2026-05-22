import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  isLoading,
  /** When set, user must type this exact value to enable the confirm button */
  confirmValue,
  /** Label shown above the input (default: 'Digite "VALUE" para confirmar') */
  confirmLabel,
}) {
  const [typed, setTyped] = useState('');

  useEffect(() => {
    if (!isOpen) setTyped('');
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const needsTyping = !!confirmValue;
  const typingMatch = !needsTyping || typed === confirmValue;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-[var(--color-overlay)] backdrop-blur-md" />

      <div
        className="relative w-full max-w-md animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[var(--color-bg-elevated)] rounded-2xl border border-[var(--color-border-hover)] p-6 shadow-[0_24px_64px_var(--color-shadow)]">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-red-500/10">
              <AlertTriangle className="h-7 w-7 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--color-text)]">
              {title}
            </h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{description}</p>
          </div>

          {needsTyping && (
            <div className="mt-4">
              <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">
                {confirmLabel || (
                  <>Digite <span className="font-semibold text-[var(--color-text)]">{confirmValue}</span> para confirmar</>
                )}
              </label>
              <input
                type="text"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder={confirmValue}
                autoFocus
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-2 text-sm text-[var(--color-text)] placeholder-[var(--color-text-dim)] focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/60"
              />
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              variant={variant}
              onClick={onConfirm}
              loading={isLoading}
              disabled={!typingMatch}
              className="flex-1"
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
