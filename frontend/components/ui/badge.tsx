import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'fog' | 'cobalt' | 'secondary';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-fog text-graphite border-fog',
    fog: 'bg-fog text-iron border-dove/40',
    cobalt: 'bg-cobalt-signal text-pure-white border-cobalt-signal',
    secondary: 'bg-fog/60 text-iron border-fog',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-pills border px-2.5 py-0.5 font-sans text-[11px] font-normal tracking-wide uppercase transition-colors',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
