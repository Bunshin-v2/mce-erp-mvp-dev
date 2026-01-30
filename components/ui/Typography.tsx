import React from 'react';
import { cn } from '@/lib/utils';

interface TypographyProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'code' | 'meta';
  children: React.ReactNode;
  className?: string;
  component?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

const variantStyles = {
  h1: 'text-3xl font-bold italic text-white tracking-tighter',
  h2: 'text-2xl font-bold italic text-white tracking-tight',
  h3: 'text-xl font-bold italic text-white tracking-tight',
  h4: 'text-lg font-bold italic text-white tracking-normal',
  body: 'text-sm text-zinc-300 leading-relaxed',
  caption: 'text-xs text-zinc-500 leading-normal',
  code: 'text-[11px] font-mono bg-glass text-emerald-500 px-1.5 py-0.5 rounded border border-glass',
  meta: 'text-[10px] font-mono text-zinc-500 tracking-widest',
};

export function Typography({ 
  variant = 'body', 
  children, 
  className,
  component
}: TypographyProps) {
  const Component = component || (variant.startsWith('h') ? (variant as any) : 'div');
  
  return (
    <Component className={cn(variantStyles[variant], className)}>
      {children}
    </Component>
  );
}

