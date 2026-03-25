import { useState, useId } from 'react';
import { cn } from '../../lib/utils';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export function Input({
  label,
  error,
  success,
  helperText,
  icon: Icon,
  className,
  type = 'text',
  mask,
  id: externalId,
  onFocus,
  onBlur,
  onChange,
  ...props
}) {
  const autoId = useId();
  const inputId = externalId || autoId;

  const applyMask = (value) => {
    if (!mask) return value;
    const digits = value.replace(/\D/g, '');
    switch (mask) {
      case 'cpf':
        return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4').slice(0, 14);
      case 'phone':
        return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3').slice(0, 15);
      case 'plate':
        return value.toUpperCase().slice(0, 7);
      case 'currency':
        if (!digits) return '';
        const num = parseInt(digits) / 100;
        return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      default:
        return value;
    }
  };

  const handleChange = (e) => {
    if (mask) {
      e.target.value = applyMask(e.target.value);
    }
    onChange?.(e);
  };

  const handleFocus = (e) => {
    setFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setFocused(false);
    onBlur?.(e);
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-[var(--color-text-secondary)]">
          {label}
          {props.required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-secondary)]" aria-hidden="true" />
        )}
        <input
          id={inputId}
          type={type}
          className={cn(
            'w-full rounded-lg border bg-[var(--color-input-bg)] px-3 py-2.5 text-base sm:text-sm text-[var(--color-text)] min-h-[44px] sm:min-h-0 touch-manipulation',
            'placeholder:text-[var(--color-text-secondary)]/50',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/40 focus:border-[var(--color-accent)]',
            error
              ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
              : success
                ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500/20'
                : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)]',
            Icon && 'pl-10',
            className
          )}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          {...props}
        />
        {error && <AlertCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-red-400" aria-hidden="true" />}
        {success && !error && <CheckCircle2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-400" aria-hidden="true" />}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {helperText && !error && <p className="text-xs text-[var(--color-text-secondary)]">{helperText}</p>}
    </div>
  );
}
