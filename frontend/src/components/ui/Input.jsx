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
        <label className="font-mono text-sm uppercase tracking-wider text-[#E0E0E0]/70">
          {label}
          {required && <span className="ml-1 text-[#FF00FF]">*</span>}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className={cn(
            'absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200',
            isFocused ? 'text-[#00FFFF]' : 'text-[#FF00FF]/50',
            showError && 'text-[#FF00FF]',
            showSuccess && 'text-[#00FF88]'
          )}>
            <Icon className="h-5 w-5" />
          </div>
        )}
        <input
          className={cn(
            'flex h-12 w-full rounded-none border-b-2 bg-black/60 px-3 py-2',
            'font-mono text-[#00FFFF] text-sm',
            'placeholder:text-[#FF00FF]/40',
            'focus-visible:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-40',
            'transition-all duration-200',
            !showError && !showSuccess && 'border-[#FF00FF]/50 focus-visible:border-[#00FFFF] focus-visible:shadow-[0_2px_15px_rgba(0,255,255,0.3)]',
            showError && 'border-[#FF00FF] bg-[#FF00FF]/5',
            showSuccess && 'border-[#00FF88] pr-10',
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
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00FF88]">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        )}
        {showError && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#FF00FF]">
            <AlertCircle className="h-5 w-5" />
          </div>
        )}
      </div>
      {helperText && !showError && (
        <p className="font-mono text-xs text-[#E0E0E0]/40">{helperText}</p>
      )}
      {showError && (
        <p className="flex items-center gap-1 font-mono text-xs text-[#FF00FF]">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}
