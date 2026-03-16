import { cn } from '../../lib/utils';

export function Select({ className, error, label, children, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="font-mono text-sm uppercase tracking-wider text-[#E0E0E0]/70">
          {label}
        </label>
      )}
      <select
        className={cn(
          'flex h-12 w-full rounded-none border-b-2 border-[#FF00FF]/50 bg-black/60 px-3 py-2',
          'font-mono text-sm text-[#00FFFF]',
          'focus-visible:outline-none focus-visible:border-[#00FFFF] focus-visible:shadow-[0_2px_15px_rgba(0,255,255,0.3)]',
          'disabled:cursor-not-allowed disabled:opacity-40',
          'transition-all duration-200',
          error && 'border-[#FF00FF]',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="font-mono text-xs text-[#FF00FF]">{error}</p>
      )}
    </div>
  );
}
