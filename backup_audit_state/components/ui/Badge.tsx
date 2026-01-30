import React from 'react';

interface BadgeProps {
  status?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ status = '', variant, children }) => {
  const getStyles = () => {
    // Branded Tiered States
    if (variant) {
      switch (variant) {
        case 'success': return 'border-[var(--color-success)]/20 text-[var(--color-success)]/80 bg-[var(--color-success)]/5 motion-success';
        case 'warning': return 'border-[var(--color-warning)]/20 text-[var(--color-warning)]/80 bg-[var(--color-warning)]/5 motion-warning';
        case 'danger': return 'border-[var(--color-critical)]/20 text-[var(--color-critical)]/80 bg-[var(--color-critical)]/5 motion-critical';
        case 'info': return 'border-[var(--color-info)]/20 text-[var(--color-info)]/80 bg-[var(--color-info)]/5';
        default: return 'border-[var(--surface-border)] text-zinc-500 bg-[var(--surface-base)]';
      }
    }

    // Otherwise infer from status string
    const s = status.toLowerCase();

    if (s.includes('review') || s.includes('approv') || s.includes('success') || s.includes('track') || s.includes('paid') || s.includes('active')) {
      return 'border-[var(--color-success)]/20 text-[var(--color-success)]/80 bg-[var(--color-success)]/5';
    }
    if (s.includes('pending') || s.includes('wait') || s.includes('progress') || s.includes('warning') || s.includes('delayed')) {
      return 'border-[var(--color-warning)]/20 text-[var(--color-warning)]/80 bg-[var(--color-warning)]/5 motion-warning';
    }
    if (s.includes('reject') || s.includes('fail') || s.includes('error') || s.includes('overdue') || s.includes('critical') || s.includes('risk')) {
      return 'border-[var(--color-critical)]/20 text-[var(--color-critical)]/80 bg-[var(--color-critical)]/5 motion-critical';
    }

    return 'border-[var(--surface-border)] text-zinc-600 bg-[var(--surface-base)]';
  };

  return (
    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${getStyles()} font-sans`}>
      {children}
    </span>
  );
};
