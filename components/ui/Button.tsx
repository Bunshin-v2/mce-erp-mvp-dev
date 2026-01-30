'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'xs';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const variantStyles = {
  primary: `
    bg-brand-500 text-white border border-brand-600
    hover:bg-brand-600 hover:shadow-lg
    active:bg-brand-700
    disabled:bg-zinc-800 disabled:text-zinc-500 disabled:border-zinc-800
    focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-black
  `,
  secondary: `
    bg-glass text-zinc-200 border border-glass-strong
    hover:bg-glass-elevated hover:border-white/20
    active:bg-white/[0.1]
    disabled:opacity-50
    focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-black
  `,
  tertiary: `
    bg-zinc-900 text-zinc-400 border border-transparent
    hover:bg-zinc-800 hover:text-white
    active:bg-zinc-700
  `,
  danger: `
    bg-rose-500/10 text-rose-500 border border-rose-500/20
    hover:bg-rose-500 hover:text-white
    active:bg-rose-600
  `,
  ghost: `
    bg-transparent text-zinc-500 border border-transparent
    hover:bg-glass hover:text-zinc-200
    active:bg-white/10
  `,
  glass: `
    bg-glass backdrop-blur-md text-white border border-glass-strong
    hover:bg-glass-elevated hover:border-white/20 hover:shadow-lg
    active:bg-glass-elevated
  `
};

const sizeStyles = {
  xs: 'px-2.5 py-1 text-xs font-bold italic',
  sm: 'px-3 py-1.5 text-sm font-bold italic',
  md: 'px-4 py-2 text-sm font-bold italic',
  lg: 'px-6 py-3 text-base font-bold italic',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  children,
  className,
  disabled,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2',
        'rounded-lg transition-all duration-200',
        'hover:scale-[1.02] active:scale-[0.98]',
        'focus:outline-none',
        'disabled:cursor-not-allowed disabled:hover:scale-100',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" size={14} />}
      {!loading && icon && iconPosition === 'left' && icon}
      {children}
      {!loading && icon && iconPosition === 'right' && icon}
    </button>
  );
});

Button.displayName = 'Button';

