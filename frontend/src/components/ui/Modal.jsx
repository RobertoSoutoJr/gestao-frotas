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
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal — Terminal Window */}
      <div
        className={`relative w-full ${sizeClasses[size]} animate-scale-in`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-2 border-[#00FFFF] bg-black/90 shadow-[0_0_30px_rgba(0,255,255,0.2)]">
          {/* Title Bar */}
          <div className="flex items-center justify-between border-b border-[#00FFFF]/30 bg-[#00FFFF]/10 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-[#FF00FF]" />
                <div className="h-3 w-3 rounded-full bg-[#00FFFF]" />
                <div className="h-3 w-3 rounded-full bg-[#FF9900]" />
              </div>
              <h2 className="font-[Orbitron] text-sm font-semibold uppercase tracking-wider text-[#00FFFF] drop-shadow-[0_0_5px_rgba(0,255,255,0.8)]">
                {title}
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="max-h-[calc(100vh-12rem)] overflow-y-auto px-6 py-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
