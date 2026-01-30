import React from 'react';
import { cn } from '../../lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    variant?: 'base' | 'hover' | 'active' | 'neon';
    className?: string;
    noPadding?: boolean;
}

/**
 * 2026 GlassCard Primitive
 * The fundamental building block for the Executive Dashboard.
 * Uses backdrop-blur, subtle borders, and specific depth shadows.
 */
export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    variant = 'base',
    className,
    noPadding = false,
    ...props
}) => {
    const variants = {
        base: "bg-zinc-950/40 border-white/5 shadow-xl backdrop-blur-xl",
        hover: "bg-zinc-950/40 border-white/10 shadow-2xl backdrop-blur-xl hover:bg-white/5 hover:border-white/20 transition-all duration-300",
        active: "bg-zinc-900/60 border-brand-500/30 shadow-glow-brand",
        neon: "bg-zinc-950/80 border-brand-500/50 shadow-[0_0_20px_rgba(51,57,153,0.3)]"
    };

    return (
        <motion.div
            className={cn(
                "rounded-2xl border relative overflow-hidden",
                variants[variant],
                noPadding ? "" : "p-6",
                className
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }} // quintOut ease
            {...props}
        >
            {/* Glossy reflection effect at top */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />

            {children}
        </motion.div>
    );
};
