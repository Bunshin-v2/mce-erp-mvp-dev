import React from 'react';
import { cn } from '../../lib/utils';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { Box, Text } from '../primitives';

interface MetricDisplayProps {
    label: string;
    value: string | number | React.ReactNode;
    trend?: {
        value: number;
        label?: string; // e.g. "vs last month"
        direction?: 'up' | 'down' | 'neutral';
        isGood?: boolean; // true if up is good, false if up is bad (e.g. costs)
    };
    prefix?: string;
    suffix?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    valueClassName?: string;
    showTrendIcon?: boolean;
}

/**
 * 2026 MetricDisplay Primitive
 * Standardized typography for data presentation.
 * Uses JetBrains Mono for values, Inter for labels.
 */
export const MetricDisplay: React.FC<MetricDisplayProps> = ({
    label,
    value,
    trend,
    prefix,
    suffix,
    size = 'md',
    className,
    valueClassName,
    showTrendIcon = true
}) => {
    const sizeClasses = {
        sm: { label: "text-[10px]", value: "text-lg" },
        md: { label: "text-[11px]", value: "text-2xl" },
        lg: { label: "text-[12px]", value: "text-3xl" },
        xl: { label: "text-[13px]", value: "text-4xl" }
    };

    const currentSize = sizeClasses[size];

    // Determine trend color based on isGood. 
    // Default: up is green (success), down is red (critical).
    // If isGood is false (e.g. Debt): up is red (critical), down is green (success).
    const getTrendColor = (direction: 'up' | 'down' | 'neutral', isGood: boolean = true) => {
        if (direction === 'neutral') return 'text-zinc-500';

        if (direction === 'up') {
            return isGood ? 'text-emerald-500' : 'text-rose-500';
        }
        // down
        return isGood ? 'text-rose-500' : 'text-emerald-500'; // If "up is good", then down is bad (red). If "up is bad", down is good (green).
    };

    const trendColor = trend ? getTrendColor(trend.direction || 'neutral', trend.isGood !== false) : '';
    const TrendIcon = trend ? (trend.direction === 'up' ? ArrowUpRight : trend.direction === 'down' ? ArrowDownRight : Minus) : null;

    return (
        <Box className={cn("flex flex-col group", className)}>
            <Text
                variant="gov-label"
                color="tertiary"
                className={cn("mb-0.5 transition-colors group-hover:text-zinc-400", currentSize.label)}
            >
                {label}
            </Text>

            <Box className="flex items-end gap-2 flex-wrap">
                <Text
                    variant="gov-metric"
                    className={cn(
                        "text-white leading-none flex items-baseline",
                        currentSize.value,
                        valueClassName
                    )}
                >
                    {prefix && <Text as="span" variant="gov-label" color="tertiary" className="mr-1 opacity-50 font-bold italic uppercase tracking-widest">{prefix}</Text>}
                    {value}
                    {suffix && <Text as="span" variant="gov-label" color="tertiary" className="ml-1 opacity-50 font-bold italic uppercase tracking-widest">{suffix}</Text>}
                </Text>

                {trend && (
                    <Box className={cn("flex items-center mb-1", trendColor)}>
                        {showTrendIcon && TrendIcon && <TrendIcon size={12} className="mr-0.5" strokeWidth={3} />}
                        <Text variant="gov-label" className="text-[10px] font-bold italic">{Math.abs(trend.value)}%</Text>
                        {trend.label && <Text variant="gov-label" color="tertiary" className="ml-1 opacity-50 font-bold italic uppercase tracking-widest">{trend.label}</Text>}
                    </Box>
                )}
            </Box>
        </Box>
    );
};
