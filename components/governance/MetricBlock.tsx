import React, { ReactNode } from 'react';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { cn } from '../../lib/utils';

interface MetricBlockProps {
    label: string;
    value: string | number | ReactNode;
    unit?: string;
    isCurrency?: boolean;
    trend?: {
        value: number;
        type: 'up' | 'down';
    };
    status?: 'nominal' | 'warning' | 'critical' | 'inactive';
    lastAudited?: string; // e.g., "12:00 PM"
    className?: string;
}

export const MetricBlock: React.FC<MetricBlockProps> = ({
    label,
    value,
    unit,
    isCurrency,
    trend,
    status = 'nominal',
    lastAudited,
    className
}) => {
    const isCritical = status === 'critical';
    const isWarning = status === 'warning';

    return (
        <Box
            className={cn(
                "px-4 py-3 rounded-lg flex flex-col justify-between space-y-2 relative overflow-hidden transition-none",
                className
            )}
            style={{
                backgroundColor: 'var(--bg-subtle)', // Zinc-100
                border: '1px solid var(--border-subtle)', // Neutral border
                boxShadow: 'none'
            }}
        >
            <Box className="flex justify-between items-start">
                <Text className="text-caption text-tertiary uppercase tracking-wide font-medium">
                    {label}
                </Text>

                {/* Critical Badge or Trend */}
                {isCritical ? (
                    <span className="bg-[var(--color-critical)] text-white text-xs font-bold px-2 py-1 rounded-sm uppercase tracking-wide shadow-[0_2px_4px_rgba(190,24,93,0.3)]">
                        CRITICAL
                    </span>
                ) : (
                    <Box className="flex flex-col items-end">
                        {trend && (
                            <Text variant="caption" className={cn("font-medium uppercase tracking-tighter", trend.type === 'up' ? 'text-emerald-600' : 'text-rose-600')}>
                                {trend.type === 'up' ? '↑' : '↓'} {trend.value}%
                            </Text>
                        )}
                    </Box>
                )}
            </Box>

            <Box className="flex items-baseline gap-2">
                <Text className="text-[var(--text-primary)] font-bold text-lg italic tracking-tight">
                    {isCurrency && typeof value === 'number'
                        ? (value > 1000000
                            ? `${(value / 1000000).toFixed(1)}M`
                            : value.toLocaleString())
                        : (typeof value === 'number' ? value.toLocaleString() : value)}
                </Text>
                {(unit || isCurrency) && (
                    <Text className="text-caption text-tertiary mb-0.5 uppercase tracking-widest opacity-60">
                        {unit || (isCurrency ? 'AED' : '')}
                    </Text>
                )}
            </Box>

            {/* Audit label - subtle footer */}
            {lastAudited && (
                <Box className="mt-1 pt-2 border-t border-[var(--border-subtle)]">
                    <Text className="text-[10px] text-tertiary font-medium uppercase tracking-widest opacity-60">
                        SYNC_LOCK: {lastAudited}
                    </Text>
                </Box>
            )}
        </Box>
    );
};

