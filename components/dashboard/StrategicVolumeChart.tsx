import React from 'react';
import { motion } from 'framer-motion';
import { Box, Text } from '../primitives';
import { BarChart, Bar, ResponsiveContainer, Cell, Tooltip } from 'recharts';

interface StrategicVolumeChartProps {
    data: any[];
    activeUnits: number;
    criticalUnits: number;
}

export const StrategicVolumeChart: React.FC<StrategicVolumeChartProps> = ({ data, activeUnits, criticalUnits }) => {
    return (
        <div className="w-full h-full min-h-[220px] relative flex flex-col group bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] overflow-hidden backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.25)]">
            {/* 1. Metric Context Area */}
            <Box className="absolute top-4 left-4 z-20">
                <Box className="flex items-baseline gap-1.5">
                    <Text variant="gov-hero" className="text-4xl text-white drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]">
                        {activeUnits}
                    </Text>
                    <Text variant="gov-label" color="secondary" className="mb-1 text-xs font-black italic">ACTIVE_UNITS</Text>
                </Box>
                <Box className="flex items-center space-x-2 mt-2">
                    <span className="text-[9px] font-black italic text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 tracking-wider shadow-[0_0_10px_rgba(56,189,248,0.2)]">NETWORK_STABLE</span>
                </Box>
            </Box>

            {/* 2. Primary Visualization Area: Holographic Prism Bar */}
            <div className="flex-1 w-full relative mt-12 px-2">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} barGap={2}>
                        <defs>
                            <linearGradient id="prismBar" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--brand-accent)" stopOpacity={1} />
                                <stop offset="20%" stopColor="#ffffff" stopOpacity={0.4} /> {/* Specular Highlight */}
                                <stop offset="50%" stopColor="var(--brand-accent)" stopOpacity={0.4} />
                                <stop offset="100%" stopColor="var(--brand-accent)" stopOpacity={0.05} />
                            </linearGradient>
                            <filter id="barGlow">
                                <feGaussianBlur stdDeviation="2" result="glow" />
                                <feComposite in="SourceGraphic" in2="glow" operator="over" />
                            </filter>
                        </defs>
                        <Tooltip
                            cursor={{ fill: 'var(--bg-hover)' }}
                            contentStyle={{
                                backgroundColor: 'var(--bg-surface)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: '8px',
                                padding: '12px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                            }}
                            itemStyle={{
                                color: 'var(--brand-accent)',
                                fontSize: '10px',
                                fontWeight: '700',
                                fontStyle: 'italic',
                                fontFamily: 'var(--font-sans)',
                                textTransform: 'uppercase',
                            }}
                            labelStyle={{ display: 'none' }}
                        />
                        <Bar dataKey="revenue" radius={[2, 2, 0, 0]} animationDuration={1000}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill="url(#prismBar)"
                                    filter="url(#barGlow)"
                                    style={{
                                        opacity: 0.6 + (index / data.length) * 0.4, // Gradiated opacity
                                        transition: 'all 0.3s ease'
                                    }}
                                    className="hover:opacity-100 hover:brightness-150 transition-all cursor-crosshair"
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* 3. Operational Strip (Critical Indices) */}
            <Box className="mt-auto border-t border-[var(--border-subtle)] bg-[var(--bg-active)]/50 flex items-center justify-between px-4 py-3 backdrop-blur-md">
                <Box className="flex items-center space-x-8">
                    <Box className="flex flex-col">
                        <Text variant="gov-metric" className="text-sm">{activeUnits}</Text>
                        <Text variant="gov-label" color="tertiary" className="text-[7px] font-bold tracking-widest">LIVE_NODE</Text>
                    </Box>
                    <Box className="flex flex-col">
                        <Text variant="gov-metric" className={criticalUnits > 0 ? 'text-rose-500 animate-pulse text-sm' : 'text-zinc-500 text-sm'}>
                            {criticalUnits.toString().padStart(2, '0')}
                        </Text>
                        <Text variant="gov-label" color="tertiary" className="text-[7px] font-bold tracking-widest text-opacity-50">CRITICAL_PATH</Text>
                    </Box>
                </Box>
                <Box className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse" />
                    <Text variant="gov-label" color="tertiary" className="text-[8px] font-mono">STREAM_0x44</Text>
                </Box>
            </Box>

            {/* Holographic Edge Highlight */}
            <div className="absolute inset-0 border border-white/5 rounded-xl pointer-events-none z-30 ring-1 ring-white/5" />
        </div>
    );
};
