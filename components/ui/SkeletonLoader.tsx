import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  count?: number;
  height?: string;
  width?: string;
  className?: string;
  circle?: boolean;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  count = 1,
  height = 'h-4',
  width = 'w-full',
  className,
  circle = false
}) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'skeleton-shimmer',
            height,
            width,
            circle ? 'rounded-full' : 'rounded-lg',
            className
          )}
        />
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC = () => (
  <div className="space-y-4 p-6 bg-white/[0.02] border border-white/[0.05] rounded-xl">
    <SkeletonLoader height="h-6" width="w-3/4" />
    <SkeletonLoader count={3} height="h-4" />
    <div className="flex gap-3 pt-4">
      <SkeletonLoader height="h-8" width="w-1/4" />
      <SkeletonLoader height="h-8" width="w-1/4" />
    </div>
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-[130px] skeleton-shimmer rounded-xl" />
      ))}
    </div>
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  </div>
);
