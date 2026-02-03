import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { KPIMetric } from '../types';
import { LucideIcon } from 'lucide-react';
import { useFlashAnimation } from '@/hooks/useFlashAnimation';

interface MetricTileProps {
  metric: KPIMetric;
  icon: LucideIcon;
  color: 'blue' | 'emerald' | 'rose' | 'orange' | 'cyan';
  variant?: 'default' | 'filled';
  index?: number;
  onClick?: () => void;
}

const AnimatedCounter: React.FC<{ value: string | number; isNumber?: boolean }> = ({ value, isNumber = true }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isNumber) return;

    const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : Number(value);
    if (isNaN(numValue)) {
      setDisplayValue(0);
      return;
    }

    if (numValue === 0) {
      setDisplayValue(0);
      return;
    }

    let startValue = displayValue;
    const duration = 1000;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const nextValue = startValue + (numValue - startValue) * easeProgress;
      setDisplayValue(nextValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, isNumber]);

  if (!isNumber) return <>{value}</>;

  if (typeof value === 'string' && value.includes('M')) {
    return <>{displayValue.toFixed(1)}M</>;
  }
  if (typeof value === 'string' && value.includes('%')) {
    return <>{Math.round(displayValue)}%</>;
  }
  return <>{Math.round(displayValue)}</>;
};

export const MetricTile: React.FC<MetricTileProps> = ({ metric, icon: Icon, color, variant = 'default', index = 0, onClick }) => {
  // MANDATE: Disable flash animation in light mode (removed entirely for calm)
  const flashClass = '';

  const getTrendColor = (sentiment?: 'positive' | 'negative' | 'neutral') => {
    switch (sentiment) {
      case 'positive': return 'text-emerald-500';
      case 'negative': return 'text-rose-500';
      default: return 'text-zinc-500';
    }
  };

  const formattedValue = typeof metric.value === 'number' && metric.value < 10 && metric.value > 0
    ? `0${metric.value}`
    : metric.value;

  return (
    <div
      onClick={onClick}
      className={cn(
        // Morgan Manifesto Synthesis
        "rounded-[var(--radius-lg)] flex flex-col p-5 gap-4 h-full relative overflow-hidden transition-all duration-300",

        // Nominal vs Critical Evaluation
        metric.status?.toLowerCase().includes('critical') || metric.trendSentiment === 'negative'
          ? "bg-white border-2 border-[var(--morgan-red-dark)] morgan-critical-card-glow"
          : "bg-[var(--morgan-teal)] text-white shadow-[0_8px_30px_-10px_rgba(44,62,80,0.12)]",

        onClick ? "cursor-pointer hover:scale-[1.01]" : "",
        flashClass
      )}
    >
      {/* Structural Anchor De-emphasis: Background is now solid per Manifesto */}

      {/* Label Row */}
      <div className="flex items-center justify-between relative z-10">
        <span className={cn(
          "text-[11px] font-oswald font-black italic uppercase tracking-[0.14em]",
          (metric.status?.toLowerCase().includes('critical') || metric.trendSentiment === 'negative') ? "text-[var(--morgan-red-dark)]" : "text-white opacity-90"
        )}>
          {metric.label}
        </span>
        <Icon size={14} className={cn(
          (metric.status?.toLowerCase().includes('critical') || metric.trendSentiment === 'negative') ? "text-[var(--morgan-red-dark)]" : "text-white",
          "opacity-40"
        )} strokeWidth={2.5} />
      </div>

      {/* Value Row - Mandate: Value Dominance Reinforcement */}
      <div className="flex flex-col items-start gap-1 relative z-10">
        <span className={cn(
          "text-4xl font-oswald font-black italic tracking-tight leading-none transition-transform duration-500",
          (metric.status?.toLowerCase().includes('critical') || metric.trendSentiment === 'negative') ? "text-[var(--morgan-red-dark)] morgan-critical-glow" : "text-white"
        )}>
          <AnimatedCounter value={formattedValue} isNumber={typeof metric.value === 'number'} />
          {metric.isCurrency && <span className="text-[12px] font-bold italic ml-1.5 opacity-70 tracking-widest uppercase">AED</span>}
        </span>
      </div>

      {/* Premium Accent Bar */}
      <div className="absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-[var(--morgan-teal)]/40 to-transparent w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {(metric.status || metric.trend) && (
        <div className="flex items-center gap-2 mt-auto relative z-10">
          {metric.status && (
            <span className={cn(
              "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm border",
              metric.status?.toLowerCase().includes('critical')
                ? "bg-[var(--morgan-red-dark)] text-white border-[var(--morgan-red-dark)]"
                : "bg-white/20 text-white border-white/30"
            )}>
              {metric.status}
            </span>
          )}
          {metric.trend && (
            <span className={cn(
              "text-[10px] font-black italic flex items-center gap-1 font-oswald",
              metric.status?.toLowerCase().includes('critical') ? "text-[var(--morgan-red-dark)]" : "text-white/80"
            )}>
              {metric.trendSentiment === 'positive' ? '↑' : '↓'} {metric.trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};