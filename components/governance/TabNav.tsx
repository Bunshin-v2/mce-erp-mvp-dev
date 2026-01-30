import React from 'react';
import { Box, Text } from '../primitives';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Tab {
    id: string;
    label: string;
    count?: number;
}

interface TabNavProps {
    tabs: Tab[];
    activeTab: string;
    onChange: (id: string) => void;
    variant?: 'category' | 'time';
}

/**
 * TabNav - Standardized tab navigation component.
 * Ensures consistent height, spacing, and active state styling.
 */
export const TabNav: React.FC<TabNavProps> = ({
    tabs,
    activeTab,
    onChange,
    variant = 'category'
}) => {
    return (
        <Box className="flex items-center space-x-6 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={cn(
                            "relative h-14 flex items-center space-x-2 px-1 transition-all duration-300 group selection:bg-emerald-500/30",
                            isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                        )}
                    >
                        <Text
                            variant="gov-header"
                            className={cn(
                                "whitespace-nowrap transition-transform duration-300",
                                isActive ? "scale-105 italic" : "group-hover:translate-x-0.5"
                            )}
                        >
                            {tab.label}
                        </Text>

                        {tab.count !== undefined && (
                            <Box className={cn(
                                "text-[9px] font-mono font-bold italic px-1.5 py-0.5 rounded-sm border transition-all duration-300",
                                isActive
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                    : 'bg-white/[0.02] border-white/5 text-zinc-600 group-hover:text-zinc-400'
                            )}>
                                {tab.count.toString().padStart(2, '0')}
                            </Box>
                        )}

                        {/* Active Indicator - Neon Blade */}
                        {isActive && (
                            <motion.div
                                layoutId="activeTabIndicator"
                                className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)] rounded-full"
                            />
                        )}
                    </button>
                );
            })}
        </Box>
    );
};

