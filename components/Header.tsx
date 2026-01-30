import React from 'react';
import { Bell, Search, User, SlidersHorizontal, HelpCircle, Layout, Activity } from 'lucide-react';

import { NotificationBell } from '@/components/notifications/NotificationBell';
import type { Notification } from '@/components/notifications/NotificationBell';

interface HeaderProps {
  onSearch: (query: string) => void;
  activeView?: string;
  onNavigate?: (view: string) => void;
  mode?: 'operational' | 'executive';
  onToggleMode?: () => void;
  onNotificationsClick?: () => void;
  unreadCount?: number;
}

// Sample notifications data - this should be fetched from your data layer
const sampleNotifications: Notification[] = [
  { id: '1', message: 'Tender "RFP-2024-089" deadline approaching in 3 days.', severity: 'critical', created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
  { id: '2', message: 'Milestone "Foundation complete" for project MCE-010 is due in 7 days.', severity: 'warning', created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: '3', message: 'New document "Safety-Compliance-Check-April.pdf" uploaded.', severity: 'info', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
  { id: '4', message: 'Payment of $120,000 for "Al Wasl Tower" is overdue.', severity: 'critical', created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
];

export const Header: React.FC<HeaderProps> = ({ onSearch, activeView, onNavigate, mode = 'operational', onToggleMode, onNotificationsClick, unreadCount = 2 }) => {
  return (
    <header className="bg-[var(--surface-base)] sticky top-0 z-40 border-b border-[var(--surface-border)] px-8 py-3 flex items-center justify-between transition-all duration-300">

      {/* Minimalist Branding */}
      <div className="flex items-center space-x-3">
        <div className={`w-2 h-2 rounded-full ${mode === 'executive' ? 'bg-[var(--color-info)]/60 shadow-[0_0_8px_var(--color-info)]' : 'bg-[var(--color-success)]/60 shadow-[0_0_8px_var(--color-success)]'}`} />
        <span className="type-label-small font-sans select-none">
          {mode === 'executive' ? 'Executive Overview' : 'Operational Workspace'}
        </span>
      </div>

      {/* High-Fidelity Actions */}
      <div className="flex items-center space-x-8">

        {/* Global Search - Matrix */}
        <div className="hidden md:flex items-center bg-zinc-900/50 border border-white/5 rounded-full px-4 py-2 w-72 focus-within:w-96 focus-within:border-[var(--color-info)]/30 focus-within:bg-zinc-900/80 transition-all shadow-inner">
          <Search size={14} className="text-zinc-500 mr-2" />
          <input
            type="text"
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search system..."
            className="bg-transparent border-none outline-none text-[12px] text-zinc-300 placeholder-zinc-600 w-full font-bold italic tracking-wide font-sans"
          />
          <kbd className="hidden sm:inline-block text-[9px] text-zinc-700 font-bold italic border border-zinc-800 rounded px-1.5 py-0.5 bg-zinc-900/50">/</kbd>
        </div>

        {/* Global Control Group */}
        <div className="flex items-center space-x-2">
          {onToggleMode && (
            <button
              onClick={onToggleMode}
              aria-label={`Switch to ${mode === 'operational' ? 'Executive' : 'Operational'} Mode`}
              className={`p-2 transition-all duration-300 ${mode === 'executive'
                ? 'text-[var(--color-info)] bg-[var(--color-info)]/10 rounded shadow-[0_0_10px_rgba(51,204,204,0.3)]'
                : 'text-zinc-500 hover:text-white'
                }`}
              title="Toggle Executive Mode"
            >
              {mode === 'executive' ? <Activity size={14} /> : <Layout size={14} />}
            </button>
          )}
          <button
            onClick={() => onNavigate && onNavigate('settings')}
            aria-label="System Settings"
            className={`p-2 transition-colors ${activeView === 'settings' ? 'text-white bg-white/5 rounded' : 'text-zinc-500 hover:text-white'}`}
            title="Settings"
          >
            <SlidersHorizontal size={14} />
          </button>

          <NotificationBell
            notifications={sampleNotifications}
            unreadCount={unreadCount}
            onNavigateToNotifications={() => onNavigate && onNavigate('notifications')}
            onMarkAllRead={() => { }}
          />

          <button
            onClick={() => onNavigate && onNavigate('profile')}
            aria-label="User Profile"
            className="flex items-center space-x-3 group ml-4"
          >
            <div className="w-6 h-6 rounded bg-[var(--surface-layer)] border border-[var(--surface-border)] text-[10px] flex items-center justify-center font-bold italic text-white group-hover:bg-white/10 transition-colors font-mono">MC</div>
            <span className="type-label-small text-zinc-500 group-hover:text-white transition-colors font-brand">Morgan Corp</span>
          </button>
        </div>
      </div>
    </header>
  );
};
