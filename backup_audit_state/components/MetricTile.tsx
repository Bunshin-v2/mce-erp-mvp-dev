import React, { useState, useEffect } from 'react';
import { KPIMetric } from '../types';
import { LucideIcon } from 'lucide-react';
import { useStyleSystem } from '../lib/StyleSystem';

interface MetricTileProps {
  metric: KPIMetric;
  icon: LucideIcon;
  color: 'blue' | 'emerald' | 'rose' | 'orange' | 'cyan';
  variant?: 'default' | 'filled';
  index?: number;
  onClick?: () => void;
}

// Animated Counter Component
const AnimatedCounter: React.FC<{ value: string | number; isNumber?: boolean }> = ({ value, isNumber = true }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isNumber) return;

    const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : Number(value);
    if (isNaN(numValue)) {
      setDisplayValue(0);
      return;
    }

    // Direct update if value is small or 0
    if (numValue === 0) {
      setDisplayValue(0);
      return;
    }

    let startValue = displayValue;
    const duration = 1000; // 1 second
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function: easeOutExpo
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

// Sparkline Chart Component
const Sparkline: React.FC<{ data?: number[] }> = ({ data = [0, 25, 15, 35, 20, 40, 30] }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 80 - 10;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 100 30" className="w-full h-8 opacity-60 group-hover:opacity-100 transition-opacity">
      <defs>
        <linearGradient id="sparkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00dc82" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#00dc82" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <polyline points={points} fill="url(#sparkGradient)" stroke="#00dc82" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const MetricTile: React.FC<MetricTileProps> = ({ metric, icon: Icon, color, variant = 'default', index = 0, onClick }) => {
  const { config } = useStyleSystem();
  const [isHovering, setIsHovering] = useState(false);

  // Elite ERP Color Palette
  const colors = {
    emerald: { text: '#10b981', bg: 'rgba(16, 185, 129, 0.03)', border: 'rgba(16, 185, 129, 0.1)' },
    blue: { text: '#3b82f6', bg: 'rgba(59, 130, 246, 0.03)', border: 'rgba(59, 130, 246, 0.1)' },
    rose: { text: '#f43f5e', bg: 'rgba(244, 63, 94, 0.03)', border: 'rgba(244, 63, 94, 0.1)' },
    amber: { text: '#f59e0b', bg: 'rgba(245, 158, 11, 0.03)', border: 'rgba(245, 158, 11, 0.1)' },
    cyan: { text: '#06b6d4', bg: 'rgba(6, 182, 212, 0.03)', border: 'rgba(6, 182, 212, 0.1)' },
  };

  const activeColor = metric.trendSentiment === 'positive' ? colors.emerald :
    metric.trendSentiment === 'negative' ? colors.rose :
      colors.blue;

  return (
    <div
      className={`relative h-full transition-all duration-500 rounded-2xl overflow-hidden group ${onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={onClick}
    >
      {/* Precision Engineered Surface */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#16161a] to-[#0a0a0c] border border-white/[0.05] group-hover:border-white/[0.12] transition-colors rounded-2xl shadow-2xl" />

      {/* Beveled Top Highlight (Light Source) */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      {/* Subtle Vertical Accent */}
      <div
        className="absolute left-0 top-6 bottom-6 w-[3px] rounded-r-full transition-all duration-500 opacity-60 group-hover:opacity-100 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
        style={{ backgroundColor: activeColor.text }}
      />

      <div className="relative z-10 p-7 h-full flex flex-col">
        {/* Top Intelligence Layer */}
        <div className="flex justify-between items-start mb-10">
          <div className="space-y-1.5">
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] font-sans">
              {metric.label}
            </h4>
            <div className="flex items-center gap-2.5">
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider border ${metric.trendSentiment === 'positive' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' :
                metric.trendSentiment === 'negative' ? 'bg-rose-500/5 border-rose-500/20 text-rose-400' :
                  'bg-zinc-500/5 border-zinc-500/20 text-zinc-500'
                }`}>
                {metric.trend}
              </div>
              <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter opacity-40">System Reconciled</span>
            </div>
          </div>
          <div className="p-2.5 bg-white/[0.03] border border-white/[0.05] rounded-xl group-hover:bg-white/[0.06] group-hover:border-white/[0.1] transition-all shadow-inner">
            <Icon size={15} className="text-zinc-500 group-hover:text-emerald-400 transition-colors" />
          </div>
        </div>

        {/* Data Maturation Layer */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-baseline justify-center gap-2.5">
            {metric.label.toLowerCase().includes('value') && (
              <span className="text-xs font-black text-zinc-600 tracking-tight font-mono opacity-50">AED</span>
            )}
            <h3 className="text-4xl font-bold text-white tracking-tighter font-sans drop-shadow-sm">
              <AnimatedCounter value={metric.value} isNumber={typeof metric.value === 'number' || /^\d+/.test(metric.value)} />
            </h3>
          </div>
        </div>

        {/* Dynamic Context Footer */}
        <div className="mt-10 pt-5 border-t border-white/[0.04] flex items-center justify-between">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.15em] opacity-60">
            {metric.description}
          </span>
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] ${metric.trendSentiment === 'positive' ? 'bg-emerald-500' :
              metric.trendSentiment === 'negative' ? 'bg-rose-500' : 'bg-zinc-700'
              }`} />
            <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">Active</span>
          </div>
        </div>
      </div>

      {/* Internal Reflection Effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
    </div>
  );
};