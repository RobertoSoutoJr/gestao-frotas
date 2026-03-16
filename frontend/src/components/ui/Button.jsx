import { cn } from '../../lib/utils';

const variants = {
  default: 'border-2 border-[#00FFFF] bg-transparent text-[#00FFFF] hover:bg-[#00FFFF] hover:text-black hover:shadow-[0_0_20px_#00FFFF]',
  primary: '-skew-x-12 border-2 border-[#00FFFF] bg-transparent text-[#00FFFF] hover:skew-x-0 hover:bg-[#00FFFF] hover:text-black hover:shadow-[0_0_20px_#00FFFF]',
  success: '-skew-x-12 border-2 border-[#00FF88] bg-transparent text-[#00FF88] hover:skew-x-0 hover:bg-[#00FF88] hover:text-black hover:shadow-[0_0_20px_#00FF88]',
  danger: '-skew-x-12 border-2 border-[#FF00FF] bg-[#FF00FF] text-white hover:skew-x-0 hover:scale-105 hover:opacity-90 hover:shadow-[0_0_20px_#FF00FF]',
  outline: 'border-2 border-[#FF00FF] bg-transparent text-[#FF00FF] hover:bg-[#FF00FF] hover:text-white hover:shadow-[0_0_15px_#FF00FF]',
  ghost: 'text-[#E0E0E0] hover:bg-[rgba(0,255,255,0.1)] hover:text-[#00FFFF]'
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-7 py-3.5 text-lg'
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
  const isSkewed = ['primary', 'success', 'danger'].includes(variant);

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-none font-mono uppercase tracking-wider transition-all duration-200 ease-linear',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FFFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#090014]',
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
      {isSkewed ? (
        <span className="inline-flex items-center gap-2 skew-x-12 transform">{children}</span>
      ) : (
        children
      )}
    </button>
  );
}
