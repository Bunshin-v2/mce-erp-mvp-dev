import React from 'react';
import { cn } from '../../lib/utils';
import { Box, Text } from '../primitives';

type StatusVariant = 'nominal' | 'success' | 'warning' | 'critical' | 'inactive' | 'info';

interface StatusBadgeProps {
    status: StatusVariant | string;
    label?: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    dot?: boolean;
    pulse?: boolean;
}

/**
 * 2026 StatusBadge Primitive
 * Displays state with unified color coding and optional metabolic pulse.
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
    status,
    label,
    className,
    size = 'md',
    dot = true,
    pulse = false
}) => {
    // Normalize string status to variant
    const getVariant = (s: string): StatusVariant => {
        const lower = s.toString().toLowerCase();
        if (['nominal', 'success', 'active', 'completed', 'paid', 'up'].includes(lower)) return 'nominal';
        if (['warning', 'pending', 'review', 'hold', 'at_risk'].includes(lower)) return 'warning';
        if (['critical', 'error', 'failed', 'overdue', 'rejected', 'down'].includes(lower)) return 'critical';
        if (['info', 'processing', 'running', 'in_progress'].includes(lower)) return 'info';
        return 'inactive';
    };

    const variant = getVariant(status as string);

    const styles = {
        nominal: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        success: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        critical: "bg-rose-500/10 text-rose-500 border-rose-500/20 cursor-alert",
        info: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        inactive: "bg-zinc-800/40 text-zinc-500 border-zinc-700/30",
    };

    const dotColors = {
        nominal: "bg-emerald-500",
        success: "bg-emerald-500",
        warning: "bg-amber-500",
        critical: "bg-rose-500",
        info: "bg-blue-500",
        inactive: "bg-zinc-500",
    };

    const sizes = {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-2.5 py-1 text-[11px]",
        lg: "px-3 py-1.5 text-[12px]",
    };

    return (
        <Box as="span" className={cn(
            "inline-flex items-center rounded-sm border font-bold italic uppercase tracking-widest backdrop-blur-md select-none",
            styles[variant],
            sizes[size],
            className
        )}>
            {dot && (
                <Box as="span" className={cn(
                    "w-1 h-1 rounded-full mr-2 shadow-[0_0_8px_rgba(0,0,0,0.2)]",
                    dotColors[variant],
                    (pulse || variant === 'critical') && "animate-pulse"
                )} />
            )}
            <Text variant="gov-label" className="text-[inherit] font-bold italic">
                {label || status}
            </Text>
        </Box>
    );
};
