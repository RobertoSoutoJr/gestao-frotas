import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

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
      onClick={onClose}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-[var(--color-overlay)] backdrop-blur-md" />

      {/* Modal box */}
      <div
        className={`relative w-full ${sizeClasses[size]} animate-scale-in`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border-hover)] rounded-t-2xl sm:rounded-2xl shadow-[0_24px_64px_var(--color-shadow)]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 sm:px-6 py-4">
            <h2 className="text-base font-semibold text-[var(--color-text)]">
              {title}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 sm:h-8 sm:w-8 p-0 flex items-center justify-center"
            >
              <X className="h-5 w-5 sm:h-4 sm:w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="max-h-[calc(100dvh-4rem)] sm:max-h-[calc(100dvh-12rem)] overflow-y-auto overscroll-contain px-4 sm:px-6 py-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
