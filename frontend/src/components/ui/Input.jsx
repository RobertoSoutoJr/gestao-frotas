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

    // Apply mask if provided
    if (mask) {
      switch (mask) {
        case 'cpf':
          newValue = newValue
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
          break;
        case 'phone':
          newValue = newValue
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{4,5})(\d{4})$/, '$1-$2');
          break;
        case 'plate':
          newValue = newValue
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '')
            .replace(/^([A-Z]{3})(\d{0,4}).*/, '$1-$2')
            .substring(0, 8);
          break;
        case 'currency':
          newValue = newValue
            .replace(/\D/g, '')
            .replace(/(\d)(\d{2})$/, '$1,$2')
            .replace(/(?=(\d{3})+(\D))\B/g, '.');
          break;
      }
      e.target.value = newValue;
    }

    onChange?.(e);
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className={cn(
            'absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200',
            isFocused ? 'text-blue-500' : 'text-zinc-400',
            showError && 'text-red-500',
            showSuccess && 'text-green-500'
          )}>
            <Icon className="h-5 w-5" />
          </div>
        )}
        <input
          className={cn(
            'flex h-11 w-full rounded-lg border bg-white px-3 py-2 text-sm font-medium',
            'placeholder:text-zinc-400 placeholder:font-normal',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-zinc-50',
            'dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:disabled:bg-zinc-800',
            'transition-all duration-200',
            // Default state
            !showError && !showSuccess && 'border-zinc-300 focus-visible:ring-blue-500 focus-visible:border-blue-500',
            // Error state
            showError && 'border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500 bg-red-50 dark:bg-red-950/10',
            // Success state
            showSuccess && 'border-green-500 focus-visible:ring-green-500 focus-visible:border-green-500 pr-10',
            Icon && 'pl-11',
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
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        )}
        {showError && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
            <AlertCircle className="h-5 w-5" />
          </div>
        )}
      </div>
      {helperText && !showError && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{helperText}</p>
      )}
      {showError && (
        <p className="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}
