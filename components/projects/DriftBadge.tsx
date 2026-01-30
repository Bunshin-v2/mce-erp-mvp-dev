import React from 'react';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DriftBadgeProps {
  plannedDate?: string;
  status?: string;
  className?: string;
}

export const DriftBadge: React.FC<DriftBadgeProps> = ({ plannedDate, status, className }) => {
  if (!plannedDate || status === 'Completed' || status === 'Finalized') {
    return (
      <div className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded border border-white/5 bg-white/[0.02] text-[8px] font-bold italic text-zinc-600 tracking-widest", className)}>
        <CheckCircle2 size={10} />
        Node Stable
      </div>
    );
  }

  const planned = new Date(plannedDate);
  const today = new Date();
  const diffTime = today.getTime() - planned.getTime();
  const driftDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (driftDays > 0) {
    return (
      <div className={cn(
        "flex items-center gap-1.5 px-2 py-0.5 rounded border animate-pulse-fast",
        driftDays > 7 
          ? "bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.2)]" 
          : "bg-amber-500/10 text-amber-500 border-amber-500/20",
        className
      )}>
        <AlertCircle size={10} />
        <span className="text-[8px] font-bold italic tracking-widest">
          Temporal Drift: {driftDays}D
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded border border-emerald-500/10 bg-emerald-500/[0.02] text-[8px] font-bold italic text-emerald-500/60 tracking-widest", className)}>
      <Clock size={10} />
      On Schedule
    </div>
  );
};
