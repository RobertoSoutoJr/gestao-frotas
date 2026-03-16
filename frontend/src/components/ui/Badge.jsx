import { cn } from '../../lib/utils';

const variants = {
  default: 'border-[#2D1B4E] text-[#E0E0E0] bg-[#1a103c]',
  success: 'border-[#00FF88] text-[#00FF88] bg-[#00FF88]/10',
  warning: 'border-[#FF9900] text-[#FF9900] bg-[#FF9900]/10',
  danger: 'border-[#FF00FF] text-[#FF00FF] bg-[#FF00FF]/10',
  info: 'border-[#00FFFF] text-[#00FFFF] bg-[#00FFFF]/10',
  outline: 'border-[#FF00FF]/50 text-[#E0E0E0] bg-transparent'
};

export function Badge({ children, variant = 'default', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-none border px-2.5 py-0.5',
        'font-mono text-xs uppercase tracking-wider',
        '-skew-x-6 transform',
        variants[variant],
        className
      )}
    >
      <span className="skew-x-6 transform">{children}</span>
    </span>
  );
}
