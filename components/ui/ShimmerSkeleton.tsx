import React from 'react';

interface ShimmerSkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
}

export const ShimmerSkeleton: React.FC<ShimmerSkeletonProps> = ({
  width = '100%',
  height = '20px',
  borderRadius = '8px',
  className = ''
}) => {
  return (
    <div
      className={`animate-shimmer bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 ${className}`}
      style={{
        width,
        height,
        borderRadius,
        backgroundSize: '200% 100%',
        animation: 'shimmer 2s infinite'
      }}
    />
  );
};

export const SkeletonLoader: React.FC<{ variant?: 'card' | 'chart' | 'metric' }> = ({ variant = 'card' }) => {
  if (variant === 'chart') {
    return (
      <div className="space-y-4">
        <ShimmerSkeleton height="24px" width="60%" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <ShimmerSkeleton key={i} height={`${Math.random() * 40 + 20}px`} />
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'metric') {
    return (
      <div className="space-y-3">
        <ShimmerSkeleton height="16px" width="40%" />
        <ShimmerSkeleton height="32px" width="70%" />
        <ShimmerSkeleton height="12px" width="50%" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <ShimmerSkeleton height="24px" width="80%" />
      <ShimmerSkeleton height="16px" width="100%" />
      <ShimmerSkeleton height="16px" width="95%" />
    </div>
  );
};
