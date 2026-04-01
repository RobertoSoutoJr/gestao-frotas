import { useEffect, useRef, useId, useCallback } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

export function Modal({ isOpen, onClose, title, children, size = 'md', warnUnsaved = false }) {
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      document.body.style.overflow = 'hidden';
      setTimeout(() => dialogRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = 'unset';
      previousFocusRef.current?.focus();
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const hasFilledInputs = useCallback(() => {
    if (!warnUnsaved || !dialogRef.current) return false;
    const inputs = dialogRef.current.querySelectorAll('input, textarea, select');
    for (const el of inputs) {
      if (el.type === 'hidden' || el.type === 'submit') continue;
      if (el.tagName === 'SELECT') {
        // Skip selects that only have a placeholder selected (first option)
        if (el.selectedIndex > 0) return true;
        continue;
      }
      if (el.value && el.value.trim()) return true;
    }
    return false;
  }, [warnUnsaved]);

  const handleClose = useCallback(() => {
    if (hasFilledInputs() && !window.confirm('Existem alterações não salvas. Deseja sair sem salvar?')) return;
    onClose();
  }, [onClose, hasFilledInputs]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) handleClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, handleClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleTab = (e) => {
      if (e.key !== 'Tab') return;
      const focusable = dialog.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    dialog.addEventListener('keydown', handleTab);
    return () => dialog.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'sm:max-w-md',
    md: 'sm:max-w-2xl',
    lg: 'sm:max-w-4xl',
    xl: 'sm:max-w-6xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 animate-fade-in"
      onClick={handleClose}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-[var(--color-overlay)] backdrop-blur-md" aria-hidden="true" />

      {/* Modal box */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative w-full ${sizeClasses[size]} animate-scale-in outline-none`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border-hover)] rounded-t-2xl sm:rounded-2xl shadow-[0_24px_64px_var(--color-shadow)]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 sm:px-6 py-4">
            <h2 id={titleId} className="text-base font-semibold text-[var(--color-text)]">
              {title}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              aria-label="Fechar"
              className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 sm:h-8 sm:w-8 p-0 flex items-center justify-center"
            >
              <X className="h-5 w-5 sm:h-4 sm:w-4" aria-hidden="true" />
            </Button>
          </div>

          {/* Content */}
          <div className="max-h-[calc(100dvh-4rem)] sm:max-h-[calc(100dvh-12rem)] overflow-y-auto overscroll-contain px-4 sm:px-6 py-6">
            <div className="mx-auto max-w-4xl">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
