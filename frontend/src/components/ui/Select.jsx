import { cn } from '../../lib/utils';

export function Select({ className, error, label, children, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-[#8A8F98]">
          {label}
        </label>
      )}
      <select
        className={cn(
          'flex h-10 w-full rounded-lg border border-white/10 bg-[#0F0F12] px-3 py-2',
          'text-sm text-gray-100',
          'focus-visible:outline-none focus-visible:border-[#5E6AD2] focus-visible:ring-2 focus-visible:ring-[#5E6AD2]/20',
          'disabled:cursor-not-allowed disabled:opacity-40',
          'transition-all duration-200',
          error && 'border-red-500/50',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
