import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RippleButton } from './RippleButton';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className
}) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-12 text-center matte-surface border border-glass rounded-xl bg-white/[0.01]",
      className
    )}>
      <div className="w-16 h-16 mb-6 bg-zinc-900/50 border border-glass rounded-xl flex items-center justify-center text-zinc-700">
        <Icon size={32} strokeWidth={1.5} />
      </div>

      <h3 className="text-lg font-bold italic text-white tracking-tight mb-2">
        {title}
      </h3>

      <p className="text-[10px] font-mono text-zinc-500 tracking-widest mb-8 max-w-sm">
        {description}
      </p>

      {action && (
        <RippleButton
          onClick={action.onClick}
          className="px-6 py-2.5 text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
          rippleColor="rgba(255,255,255,0.1)"
        >
          {action.label}
        </RippleButton>
      )}
    </div>
  );
};

