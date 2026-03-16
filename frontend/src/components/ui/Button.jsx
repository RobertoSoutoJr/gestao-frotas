import { cn } from '../../lib/utils';

const variants = {
  primary: 'bg-[#5E6AD2] text-white hover:bg-[#6872D9] shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_4px_16px_rgba(94,106,210,0.35)] active:scale-[0.98]',
  default: 'bg-white/[0.05] text-[#EDEDEF] hover:bg-white/[0.08] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]',
  success: 'bg-emerald-600 text-white hover:bg-emerald-500 active:scale-[0.98]',
  danger:  'bg-red-600 text-white hover:bg-red-500 active:scale-[0.98]',
  outline: 'border border-white/10 bg-transparent text-[#EDEDEF] hover:bg-white/[0.05]',
  ghost:   'bg-transparent text-[#8A8F98] hover:bg-white/[0.05] hover:text-[#EDEDEF]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

export function Button({
  children,
  variant = 'default',
  size = 'md',
  className,
  disabled,
  loading,
  ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E6AD2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050506]',
        'disabled:pointer-events-none disabled:opacity-40',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
}
