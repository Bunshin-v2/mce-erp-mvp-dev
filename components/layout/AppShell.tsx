import React from 'react';
import { Sidebar } from '../Sidebar';
import { Header } from '../Header';
import { Watermark } from '../Watermark';
import { useStyleSystem } from '../../lib/StyleSystem';

interface AppShellProps {
    children: React.ReactNode;
    activeView: string;
    onNavigate: (view: string) => void;
    onSearch: (query: string) => void;
    mode?: 'operational' | 'executive';
    onToggleMode?: () => void;
    onNotificationsClick?: () => void;
    unreadCount?: number;
    loading?: boolean;
}

/**
 * AppShell (2026 AAA Grade)
 * The unified layout wrapper that orchestrates the Glass Rail navigation
 * and the main content surface.
 */
export const AppShell: React.FC<AppShellProps> = ({
    children,
    activeView,
    onNavigate,
    onSearch,
    mode = 'operational',
    onToggleMode,
    onNotificationsClick,
    unreadCount = 0,
    loading = false
}) => {
    const { config, updateConfig } = useStyleSystem();
    const collapsed = config.sidebarOptimized;

    return (
        <div className="flex h-screen overflow-hidden font-sans text-white relative selection:bg-brand-500/30">
            {/* Background Watermark */}
            <Watermark opacity={0.03} text="MORGAN" />

            {/* Sidebar - 2026 Glass Rail */}
            {/* Width is handled by the Sidebar component itself, but we need margin on content */}
            <Sidebar
                activeView={activeView}
                collapsed={collapsed}
                onToggle={() => updateConfig({ sidebarOptimized: !collapsed })}
                onNavigate={onNavigate}
            />

            {/* Main Content Area */}
            <div
                className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? 'ml-[64px]' : 'ml-[156px]'} relative z-10 h-full`}
            >
                <Header
                    onSearch={onSearch}
                    activeView={activeView}
                    onNavigate={onNavigate}
                    mode={mode}
                    onToggleMode={onToggleMode}
                    onNotificationsClick={onNotificationsClick}
                    unreadCount={unreadCount}
                />

                {/* Content Surface */}
                <main className={`flex-1 overflow-y-auto custom-scrollbar relative z-10 ${config.density === 'executive' ? 'px-4 py-2' : 'p-6'}`}>
                    <div className="min-h-full animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};
