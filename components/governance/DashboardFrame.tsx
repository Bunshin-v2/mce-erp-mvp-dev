import React from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Text } from '../primitives';
import { PageHeader } from '../ui/PageHeader';

interface DashboardFrameProps {
    title: string;
    subtitle?: string;
    metrics?: React.ReactNode;
    tabs?: React.ReactNode;
    children: React.ReactNode;
    loading?: boolean;
}

/**
 * DashboardFrame - The canonical layout frame for MAXZI dashboards.
 * Enforces vertical hierarchy: Header -> Metrics -> Tabs -> Data Surface.
 * Now includes high-end Crystallization reveal.
 */
export const DashboardFrame: React.FC<DashboardFrameProps> = ({
    title,
    subtitle,
    metrics,
    tabs,
    children,
    loading = false
}) => {
    return (
        <div className="flex flex-col w-full h-full space-y-[var(--space-4)] p-[var(--gov-s3)] relative">
            {/* Neural Top-Bar (Stripe Style) */}
            <AnimatePresence>
                {loading && (
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "circIn" }}
                        className="absolute top-0 left-0 right-0 h-[2px] bg-emerald-500 origin-left z-50 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                    />
                )}
            </AnimatePresence>

            {/* 2. Metric Summary Row */}
            {metrics && (
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[var(--space-6)] mb-[var(--space-8)]">
                    {metrics}
                </section>
            )}

            {/* 3. Navigation Tabs */}
            {tabs && (
                <nav className="border-b border-[var(--border-subtle)]">
                    {tabs}
                </nav>
            )}

            {/* 4. Primary Data Surface with Crystallization */}
            <main className="flex-1 min-h-[600px] bg-[var(--bg-surface)] backdrop-blur-md border border-[var(--surface-border)] rounded-[var(--gov-radius)] overflow-hidden shadow-2xl relative group">
                <div className={cn(
                    "absolute inset-0 overflow-auto custom-scrollbar transition-all duration-700 ease-in-out",
                    loading ? "opacity-20 blur-md grayscale pointer-events-none scale-[0.99]" : "opacity-100 blur-0 grayscale-0 scale-100"
                )}>
                    {children}
                </div>

                {/* Glass Overlay during load */}
                <AnimatePresence>
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center pointer-events-none"
                        >
                            <div className="flex flex-col items-center gap-2">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full"
                                />
                                <span className="text-[8px] font-bold text-emerald-500/60 tracking-[0.3em]">Neural_Syncing...</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

