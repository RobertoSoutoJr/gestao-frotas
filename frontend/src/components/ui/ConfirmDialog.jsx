import { useEffect } from 'react';
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
}) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-md animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-2 border-[#FF00FF] bg-black/90 p-6 shadow-[0_0_30px_rgba(255,0,255,0.2)]">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center border-2 border-[#FF00FF] rotate-45 bg-[#FF00FF]/10">
              <AlertTriangle className="h-7 w-7 text-[#FF00FF] -rotate-45" />
            </div>
            <h3 className="font-[Orbitron] text-lg font-semibold uppercase tracking-wider text-[#FF00FF] drop-shadow-[0_0_5px_rgba(255,0,255,0.8)]">
              {title}
            </h3>
            <p className="mt-3 font-mono text-sm text-[#E0E0E0]/70">{description}</p>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              variant="ghost"
              onClick={onClose}
              className="flex-1 border border-[#2D1B4E]"
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              variant={variant}
              onClick={onConfirm}
              loading={isLoading}
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
