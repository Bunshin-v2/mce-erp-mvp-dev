import React from 'react';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DriftBadgeProps {
  plannedDate?: string;
  status?: string;
  className?: string;
}

export const DriftBadge: React.FC<DriftBadgeProps> = ({ plannedDate, status, className }) => {
  // Logic: Completed projects are nominal
  if (!plannedDate || status === 'Completed' || status === 'Finalized') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
        <span className="text-caption text-tertiary">NODE STABLE</span>
      </div>
    );
  }

  const planned = new Date(plannedDate);
  const today = new Date();
  const diffTime = today.getTime() - planned.getTime();
  const driftDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Critical Overdue (0 days or passed)
  if (driftDays >= 0) {
    return (
      <div className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded-sm bg-rose-50 border border-rose-200 shadow-[0_2px_4px_rgba(190,24,93,0.1)]",
        className
      )}>
        <AlertCircle size={10} className="text-rose-600" />
        <span className="text-caption font-bold text-rose-600">
          OVERDUE: {driftDays}D
        </span>
      </div>
    );
  }

  // Warning (< 30 Days Remaining) -> diffTime is negative, so driftDays is negative. 
  // e.g. -5 days means 5 days remaining. 
  // Logic: If driftDays > -30 (i.e., -29 to -1)
  if (driftDays > -30) {
    return (
      <div className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded-sm bg-amber-50 border border-amber-200",
        className
      )}>
        <Clock size={10} className="text-amber-600" />
        <span className="text-caption font-bold text-amber-600">
          DRIFT RISK: {Math.abs(driftDays)}D
        </span>
      </div>
    );
  }

  // Stable (> 30 Days Remaining)
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
      <span className="text-caption text-tertiary">NODE STABLE</span>
    </div>
  );
};
