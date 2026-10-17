import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'cobalt' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'cobalt', size = 'default', ...props }, ref) => {
    const variants = {
      cobalt: 'btn-cobalt',
      ghost: 'btn-ghost-editorial',
      secondary: 'btn-ghost-editorial',
    };
    const sizes = {
      sm: 'text-[12px] py-1.5 px-3',
      default: 'text-[14px] py-2.5 px-5',
      lg: 'text-[15px] py-3.5 px-7',
    };
    return (
      <button
        className={cn(variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
