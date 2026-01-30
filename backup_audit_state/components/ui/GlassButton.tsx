import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'critical';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
}

export const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {

        const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-[var(--mce-primary)]/50 border font-brand tracking-wide uppercase";

        const variants = {
            primary: "bg-[var(--mce-primary)] border-[var(--mce-primary)] text-white hover:bg-[var(--mce-primary)]/90 shadow-[0_0_15px_rgba(194,23,25,0.4)] hover:shadow-[0_0_25px_rgba(194,23,25,0.6)]",
            secondary: "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white hover:border-white/20 backdrop-blur-md",
            ghost: "bg-transparent border-transparent text-zinc-400 hover:text-white hover:bg-white/5",
            critical: "bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500/20 hover:border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.1)]"
        };

        const sizes = {
            sm: "h-8 px-3 text-xs",
            md: "h-10 px-4 text-sm",
            lg: "h-12 px-6 text-base",
            icon: "h-10 w-10 p-0"
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!isLoading && children}
                {variant === 'primary' && !isLoading && (
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                )}
            </button>
        );
    }
);
GlassButton.displayName = "GlassButton";
