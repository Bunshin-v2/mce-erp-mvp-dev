'use client';

import React from 'react';
import { Bell, Search, User, SlidersHorizontal, HelpCircle, Layout, Activity, Sun, Moon } from 'lucide-react';
import { GlassButton } from '@/components/ui/GlassButton';
import { useTheme } from '@/hooks/useTheme';

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
  const { theme, toggleTheme } = useTheme();

  // Dynamic page title based on activeView
  const getPageTitle = () => {
    switch (activeView) {
      case 'projects': return 'Projects';
      case 'financials': return 'Financials';
      case 'tenders': return 'Tenders';
      case 'documents': return 'Documents';
      case 'tasks': return 'Tasks';
      case 'calendar': return 'Calendar';
      case 'reports': return 'Reports';
      case 'field': return 'Field Operations';
      case 'intelligence': return 'Intelligence';
      case 'settings': return 'Settings';
      case 'profile': return 'Profile';
      default: return 'Operational Workspace';
    }
  };

  return (
    <header className="bg-[var(--sidebar-bg)] sticky top-0 z-40 border-b border-[var(--brand-accent)]/20 px-8 py-3 flex items-center justify-between transition-all duration-300">

      {/* Dynamic Branding with Glow */}
      <div className="flex items-center space-x-3">
        <div className="w-2 h-2 rounded-full bg-[var(--brand-accent)] shadow-[0_0_12px_var(--brand-accent)]" />
        <div className="flex flex-col">
          <span 
            className="text-[14px] font-oswald font-black italic tracking-wider select-none text-[var(--text-primary)] uppercase transition-all duration-500"
            style={{ textShadow: 'var(--header-title-glow)' }}
          >
            {getPageTitle()}
          </span>
          <span className="text-[7px] font-bold text-[var(--brand-accent)] uppercase tracking-[0.3em] -mt-0.5">Beta Release V1.0</span>
        </div>
      </div>

      {/* High-Fidelity Actions */}
      <div className="flex items-center space-x-4">

        {/* Global Control Group */}
        <div className="flex items-center space-x-2">
          {onToggleMode && (
            <GlassButton
              variant="ghost"
              size="icon"
              onClick={onToggleMode}
              aria-label={`Switch to ${mode === 'operational' ? 'Executive' : 'Operational'} Mode`}
              className={`transition-all duration-300 ${mode === 'executive'
                ? 'text-[var(--color-info)] bg-[var(--color-info)]/10 shadow-[0_0_10px_rgba(51,204,204,0.3)]'
                : 'text-zinc-500 hover:text-white'
                }`}
              title="Toggle Executive Mode"
            >
              {mode === 'executive' ? <Activity size={14} /> : <Layout size={14} />}
            </GlassButton>
          )}
          <GlassButton
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle Light Mode"
            className="transition-colors text-zinc-500 hover:text-white"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </GlassButton>
          <GlassButton
            variant="ghost"
            size="icon"
            onClick={() => onNavigate && onNavigate('settings')}
            aria-label="System Settings"
            className={`transition-colors ${activeView === 'settings' ? 'text-white bg-white/5' : 'text-zinc-500 hover:text-white'}`}
            title="Settings"
          >
            <SlidersHorizontal size={14} />
          </GlassButton>

          <NotificationBell
            notifications={sampleNotifications}
            unreadCount={unreadCount}
            onNavigateToNotifications={() => onNavigate && onNavigate('notifications')}
            onMarkAllRead={() => { }}
          />

          <button
            onClick={() => onNavigate && onNavigate('profile')}
            aria-label="User Profile"
            className="flex items-center group ml-4"
          >
            <div className="w-6 h-6 rounded bg-[var(--surface-layer)] border border-[var(--surface-border)] text-[10px] flex items-center justify-center font-bold italic text-white group-hover:bg-white/10 transition-colors font-mono">MC</div>
          </button>
        </div>
      </div>
    </header>
  );
};
