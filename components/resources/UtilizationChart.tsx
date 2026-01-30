'use client';

import React from 'react';
import { UtilizationMetric } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Activity } from 'lucide-react';

interface UtilizationChartProps {
  metrics: UtilizationMetric[];
}

export default function UtilizationChart({ metrics }: UtilizationChartProps) {
  const sortedMetrics = [...metrics].sort((a, b) => b.total_allocation_percent - a.total_allocation_percent);

  return (
    <Card variant="matte" padding="none">
      <CardHeader className="px-8 py-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Activity size={20} className="text-brand-500" />
          <CardTitle>Personnel Capacity Pulse</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        {sortedMetrics.map((metric, index) => {
          const percentage = metric.total_allocation_percent;
          const target = 80;
          const isOver = percentage > target;

          return (
            <div key={metric.team_member_id} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold italic text-zinc-200">{metric.team_member_name}</span>
                <span className={`text-xs font-mono font-bold italic ${isOver ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {percentage}%
                </span>
              </div>

              <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden border border-white/5">
                <div
                  className={`h-full transition-all duration-1000 ease-out ${isOver ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]'}`}
                  style={{ width: `${Math.min(percentage, 100)}%`, transitionDelay: `${index * 100}ms` }}
                />
              </div>

              <div className="flex justify-between text-[9px] font-bold italic text-zinc-600 tracking-widest">
                <span>{metric.projects_count} Active Nodes</span>
                {metric.variance_percent !== undefined && (
                  <span className={metric.variance_percent < 0 ? 'text-rose-500/60' : 'text-emerald-500/60'}>
                    {metric.variance_percent > 0 ? '+' : ''}{metric.variance_percent}% Variance vs Target
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {metrics.length === 0 && (
          <div className="py-12 text-center text-zinc-600 text-xs tracking-[0.2em]">
            Null-set: No utilization telemetry available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
