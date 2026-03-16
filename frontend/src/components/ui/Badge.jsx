import { cn } from '../../lib/utils';

const variants = {
  default: 'bg-white/[0.08] text-[#EDEDEF] border-transparent',
  success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  danger:  'bg-red-500/15 text-red-400 border-red-500/20',
  info:    'bg-[#5E6AD2]/15 text-[#6872D9] border-[#5E6AD2]/20',
  outline: 'border-white/10 text-[#8A8F98] bg-transparent',
};

export function Badge({ children, variant = 'default', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5',
        'font-medium text-xs',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
