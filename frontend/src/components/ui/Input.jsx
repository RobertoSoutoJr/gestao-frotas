import { useState } from 'react';
import { cn } from '../../lib/utils';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export function Input({
  className,
  error,
  label,
  icon: Icon,
  required,
  success,
  helperText,
  mask,
  onBlur,
  onChange,
  value,
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  const showSuccess = success && isTouched && !error && value;
  const showError = error && isTouched;

  const handleBlur = (e) => {
    setIsFocused(false);
    setIsTouched(true);
    onBlur?.(e);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleChange = (e) => {
    let newValue = e.target.value;
    if (mask) {
      switch (mask) {
        case 'cpf':
          newValue = newValue.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
          break;
        case 'phone':
          newValue = newValue.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4,5})(\d{4})$/, '$1-$2');
          break;
        case 'plate':
          newValue = newValue.toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^([A-Z]{3})(\d{0,4}).*/, '$1-$2').substring(0, 8);
          break;
        case 'currency':
          newValue = newValue.replace(/\D/g, '').replace(/(\d)(\d{2})$/, '$1,$2').replace(/(?=(\d{3})+(\D))\B/g, '.');
          break;
      }
      e.target.value = newValue;
    }
    onChange?.(e);
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-[#8A8F98]">
          {label}
          {required && <span className="ml-1 text-[#5E6AD2]">*</span>}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className={cn(
            'absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200',
            isFocused ? 'text-[#5E6AD2]' : 'text-[#8A8F98]',
            showError && 'text-red-400',
            showSuccess && 'text-emerald-400'
          )}>
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          className={cn(
            'flex h-10 w-full rounded-lg border bg-[#0F0F12] px-3 py-2',
            'text-sm text-gray-100',
            'placeholder:text-gray-500',
            'focus-visible:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-40',
            'transition-all duration-200',
            !showError && !showSuccess && 'border-white/10 focus-visible:border-[#5E6AD2] focus-visible:ring-2 focus-visible:ring-[#5E6AD2]/20',
            showError && 'border-red-500/50 bg-red-500/5 focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500/20',
            showSuccess && 'border-emerald-500/50 pr-10 focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/20',
            Icon && 'pl-9',
            className
          )}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          required={required}
          {...props}
        />
        {showSuccess && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        )}
        {showError && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400">
            <AlertCircle className="h-4 w-4" />
          </div>
        )}
      </div>
      {helperText && !showError && (
        <p className="text-xs text-[#8A8F98]">{helperText}</p>
      )}
      {showError && (
        <p className="flex items-center gap-1 text-xs text-red-400">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}
