import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { KPIMetric } from '../types';
import { LucideIcon } from 'lucide-react';
import { TiltCard } from '@/components/ui/TiltCard';
import { useFlashAnimation } from '@/hooks/useFlashAnimation';

interface MetricTileProps {
  metric: KPIMetric;
  icon: LucideIcon;
  color: 'blue' | 'emerald' | 'rose' | 'orange' | 'cyan';
  variant?: 'default' | 'filled';
  index?: number;
  onClick?: () => void;
}

// ... (AnimatedCounter and Sparkline components remain unchanged) ...
// For brevity in this tool call, I will include the full file content or just the MetricTile component. 
// Since replace_file_content requires exact match, and I want to replace the whole MetricTile component logic.
// I will rewrite the MetricTile component part.

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
  const [isHovered, setIsHovered] = React.useState(false);
  const [hasChanged, setHasChanged] = React.useState(false);

  React.useEffect(() => {
    setHasChanged(true);
    const timer = setTimeout(() => setHasChanged(false), 1000);
    return () => clearTimeout(timer);
  }, [metric.value]);

  // Elite ERP Color Palette
  const colors = {
    emerald: { text: 'var(--color-success)', bg: 'rgba(16, 185, 129, 0.03)', border: 'rgba(16, 185, 129, 0.1)', trend: [20, 25, 22, 30, 35, 38] },
    blue: { text: '#3b82f6', bg: 'rgba(59, 130, 246, 0.03)', border: 'rgba(59, 130, 246, 0.1)', trend: [10, 15, 12, 18, 25, 20] },
    rose: { text: '#f43f5e', bg: 'rgba(244, 63, 94, 0.03)', border: 'rgba(244, 63, 94, 0.1)', trend: [2, 1, 3, 0, 1, 1] },
    amber: { text: 'var(--color-warning)', bg: 'rgba(245, 158, 11, 0.03)', border: 'rgba(245, 158, 11, 0.1)', trend: [5, 8, 4, 10, 7, 5] },
    cyan: { text: '#06b6d4', bg: 'rgba(6, 182, 212, 0.03)', border: 'rgba(6, 182, 212, 0.1)', trend: [15, 20, 18, 22, 30, 25] },
  };

  const activeColor = metric.trendSentiment === 'positive' ? colors.emerald :
    metric.trendSentiment === 'negative' ? colors.rose :
      colors.blue;

  const formattedValue = typeof metric.value === 'number' && metric.value < 10
    ? `0${metric.value}`
    : metric.value;

  const trendData = (colors as any)[color]?.trend || [10, 20, 15, 25, 22, 30];

  const flashClass = useFlashAnimation(metric.value);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <TiltCard
        onClick={onClick}
        className={cn(
          "group h-full w-full rounded-[var(--gov-radius)] border transition-all duration-500 flex flex-col justify-between p-5 overflow-hidden",
          "border-white/5 shadow-lg bg-white/[0.02]",
          isHovered && "border-white/30 shadow-glow-strong bg-white/[0.05]",
          hasChanged && "animate-data-pulse"
        )}
        maxRotation={8}
      >
      {/* Matte Surface Layer with Premium Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br from-[#1e293b] via-[#1a1f35] to-[#0f172a] border border-glass group-hover:border-glass-strong transition-colors rounded-xl shadow-elevation ${flashClass}`} />

      <div className="relative z-10 h-full flex flex-col justify-between min-w-0">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h4 className="text-xs font-bold italic text-zinc-600 opacity-70">
              {metric.label}
            </h4>
            <div className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] ${metric.trendSentiment === 'positive' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' :
              metric.trendSentiment === 'negative' ? 'bg-rose-500/5 border-rose-500/20 text-rose-400' :
                'bg-zinc-500/5 border-zinc-500/20 text-zinc-400'
              }`}>
              <span className="type-caption text-[10px]">{metric.trend}</span>
            </div>
          </div>
          <div className="p-2 bg-black/20 border border-white/5 rounded-lg group-hover:bg-white/5 transition-all">
            <Icon size={16} className="text-zinc-500 group-hover:text-white transition-colors" />
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-end mt-4 min-w-0">
          <div className="flex flex-col gap-3">
            <div className="flex items-end gap-1.5 min-w-0">
              {metric.label.toLowerCase().includes('value') && (
                <span className="text-xs font-bold italic text-zinc-600 opacity-50 flex-shrink-0 leading-none pb-0.5">AED</span>
              )}
              <h3
                className={cn(
                  "text-3xl md:text-4xl text-white font-bold italic tracking-tight tabular-nums flex-1 truncate transition-colors duration-300 leading-none",
                  flashClass && "text-blue-400"
                )}
              >
                <AnimatedCounter value={formattedValue} isNumber={typeof formattedValue === 'number' || /^\d+/.test(formattedValue as string)} />
              </h3>
            </div>

            <div className="hidden sm:block">
              <svg viewBox="0 0 100 30" className="w-full h-6 opacity-40 group-hover:opacity-100 transition-opacity">
                <path
                  d={`M0 25 ${trendData.map((v: number, idx: number) => `L${(idx + 1) * (100 / trendData.length)} ${25 - (v * 0.8)}`).join(' ')}`}
                  fill="none"
                  stroke={activeColor.text}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
            <div className="mt-3 pt-2 border-t border-white/5 w-full min-w-0">
              <span className="type-caption text-xs text-zinc-400 block truncate">
                {metric.description}
              </span>
            </div>

        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
    </TiltCard>
    </div>
  );
};