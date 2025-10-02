import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        style={{
          backgroundColor: variant === 'primary' ? 'hsl(var(--color-primary))' :
                          variant === 'secondary' ? 'hsl(var(--color-background))' :
                          variant === 'destructive' ? 'hsl(var(--color-destructive))' : undefined,
          color: variant === 'primary' ? 'hsl(var(--color-primary-foreground))' :
                 variant === 'secondary' ? 'hsl(var(--color-foreground))' :
                 variant === 'destructive' ? 'hsl(var(--color-destructive-foreground))' : undefined,
          borderColor: variant === 'secondary' ? 'hsl(var(--color-foreground))' : undefined,
        }}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium cursor-pointer',
          'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2',
          'disabled:pointer-events-none disabled:opacity-50',
          {
            'hover:brightness-125 active:brightness-115 focus-visible:ring-primary': variant === 'primary',
            'border-1 hover:bg-foreground hover:text-background active:opacity-90 focus-visible:ring-foreground': variant === 'secondary',
            'hover:brightness-110 active:brightness-105 focus-visible:ring-destructive': variant === 'destructive',
            'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
          },
          {
            'h-9 px-3 text-sm': size === 'sm',
            'h-10 px-4': size === 'md',
            'h-11 px-8 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
