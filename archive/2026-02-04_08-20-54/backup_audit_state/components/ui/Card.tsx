import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CardProps {
  title: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ title, icon: Icon, action, children, className = '', noPadding = false }) => {
  return (
    <div className={`bg-[var(--surface-layer)] border border-[var(--surface-border)] rounded-sm flex flex-col group transition-all duration-200 ${className}`}>
      <div className="px-6 py-4 border-b border-[var(--surface-border)] bg-[var(--surface-base)]/20 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {Icon && (
            <div className="text-zinc-600 transition-colors group-hover:text-zinc-400">
              <Icon size={14} />
            </div>
          )}
          <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] font-brand group-hover:text-white transition-colors">{title}</h3>
        </div>
        {action && <div className="font-mono text-[9px] text-zinc-500">{action}</div>}
      </div>
      <div className={`flex-1 ${noPadding ? '' : 'p-0'}`}>
        {children}
      </div>
    </div>
  );
};
