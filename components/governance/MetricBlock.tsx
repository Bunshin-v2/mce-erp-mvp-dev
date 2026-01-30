import React, { ReactNode } from 'react';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { cn } from '../../lib/utils';

interface MetricBlockProps {
    label: string;
    value: string | number | ReactNode;
    unit?: string;
    trend?: {
        value: number;
        type: 'up' | 'down';
    };
    status?: 'nominal' | 'warning' | 'critical' | 'inactive';
    lastAudited?: string; // e.g., "12:00 PM"
    className?: string;
}

/**
 * MetricBlock - Reusable primitive for dashboard metrics.
 * Enforces "Golden State DNA" (Bold Italic) for numerical data.
 */
export const MetricBlock: React.FC<MetricBlockProps> = ({
    label,
    value,
    unit,
    trend,
    status = 'nominal',
    lastAudited,
    className
}) => {
    const isCritical = status === 'critical';

    return (
        <Box className={cn(`
            bg-zinc-900/40 backdrop-blur-md border border-white/5 p-[var(--gov-s3)] rounded-xl 
            flex flex-col justify-between space-y-1 hover:bg-white/[0.05] transition-all group relative overflow-hidden
            ${isCritical ? 'border-rose-500/30' : ''}
        `, className)}>
            <Box className="flex justify-between items-start">
                <Text variant="gov-label" color="tertiary" className="group-hover:text-zinc-400">
                    {label}
                </Text>
                <Box className="flex flex-col items-end">
                    {trend && (
                        <Text variant="caption" className={cn("font-bold italic uppercase tracking-tighter", trend.type === 'up' ? 'text-emerald-500' : 'text-rose-500')}>
                            {trend.type === 'up' ? '↑' : '↓'} {trend.value}%
                        </Text>
                    )}
                </Box>
            </Box>

            <Box className="flex items-baseline gap-2">
                <Text variant="gov-hero" className="text-white">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </Text>
                {unit && (
                    <Text variant="gov-label" color="tertiary" className="mb-1 uppercase tracking-widest opacity-60">
                        {unit}
                    </Text>
                )}
            </Box>

            {/* Audit label - subtle footer */}
            {lastAudited && (
                <Box className="mt-2 pt-2 border-t border-white/5">
                    <Text variant="caption" color="tertiary" className="font-bold italic uppercase tracking-[0.1em] opacity-50">
                        SYNC_LOCK: {lastAudited}
                    </Text>
                </Box>
            )}

            {/* Critical indicator glow */}
            {isCritical && (
                <div className="absolute inset-0 bg-rose-500/5 pointer-events-none animate-pulse" />
            )}
        </Box>
    );
};

