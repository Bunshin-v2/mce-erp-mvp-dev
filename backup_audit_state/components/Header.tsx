import React from 'react';
import { Bell, Search, User, SlidersHorizontal, HelpCircle, Layout, Activity } from 'lucide-react';

interface HeaderProps {
  onSearch: (query: string) => void;
  activeView?: string;
  onNavigate?: (view: string) => void;
  mode?: 'operational' | 'executive';
  onToggleMode?: () => void;
  onNotificationsClick?: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ onSearch, activeView, onNavigate, mode = 'operational', onToggleMode, onNotificationsClick, unreadCount = 0 }) => {
  return (
    <header className="bg-[var(--surface-base)] sticky top-0 z-40 border-b border-[var(--surface-border)] px-8 py-3 flex items-center justify-between transition-all duration-300">

      {/* Minimalist Branding */}
      <div className="flex items-center space-x-3">
        <div className={`w-2 h-2 rounded-full ${mode === 'executive' ? 'bg-[#33CCCC]/60 shadow-[0_0_8px_#33CCCC]' : 'bg-[#10b981]/60 shadow-[0_0_8px_#10b981]'}`} />
        <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider font-sans select-none">
          {mode === 'executive' ? 'Executive Overview' : 'Operational Workspace'}
        </span>
      </div>

      {/* High-Fidelity Actions */}
      <div className="flex items-center space-x-8">

        {/* Global Search - Matrix */}
        <div className="hidden md:flex items-center bg-[var(--surface-layer)] border border-[var(--surface-border)] rounded px-4 py-2 w-72 focus-within:w-96 focus-within:border-white/20 transition-all">
          <Search size={12} className="text-zinc-500 mr-3" />
          <input
            type="text"
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Query Cluster Signals..."
            className="bg-transparent border-none outline-none text-[11px] text-white placeholder-zinc-600 w-full font-bold uppercase tracking-wider font-mono"
          />
          <kbd className="hidden sm:inline-block text-[8px] text-zinc-600 font-black border border-[var(--surface-border)] rounded px-1.5 py-0.5 font-mono">/</kbd>
        </div>

        {/* Global Control Group */}
        <div className="flex items-center space-x-2">
          {onToggleMode && (
            <button
              onClick={onToggleMode}
              className={`p-2 transition-all duration-300 ${mode === 'executive'
                ? 'text-[#33CCCC] bg-[#33CCCC]/10 rounded shadow-[0_0_10px_rgba(51,204,204,0.3)]'
                : 'text-zinc-500 hover:text-white'
                }`}
              title="Toggle Executive Mode"
            >
              {mode === 'executive' ? <Activity size={14} /> : <Layout size={14} />}
            </button>
          )}
          <button
            onClick={() => onNavigate && onNavigate('settings')}
            className={`p-2 transition-colors ${activeView === 'settings' ? 'text-white bg-white/5 rounded' : 'text-zinc-500 hover:text-white'}`}
            title="Settings"
          >
            <SlidersHorizontal size={14} />
          </button>
          <button
            onClick={onNotificationsClick}
            className={`p-2 transition-colors relative ${activeView === 'notifications' ? 'text-[var(--color-critical)] bg-rose-500/5 rounded' : 'text-zinc-500 hover:text-[var(--color-critical)]'}`}
            title="Signals"
          >
            <Bell size={14} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[14px] h-[14px] bg-[var(--color-critical)] text-[8px] font-bold text-white rounded-full px-0.5 shadow-[0_0_5px_#ef4444]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <button onClick={() => onNavigate && onNavigate('profile')} className="flex items-center space-x-3 group ml-4">
            <div className="w-6 h-6 rounded bg-[var(--surface-layer)] border border-[var(--surface-border)] text-[10px] flex items-center justify-center font-black text-white group-hover:bg-white/10 transition-colors font-mono">MC</div>
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.15em] group-hover:text-white transition-colors font-brand">Morgan Corp</span>
          </button>
        </div>
      </div>
    </header>
  );
};