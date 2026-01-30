import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SignIn } from '@clerk/clerk-react';
import { ShieldCheck, Database, Activity, Globe, ArrowRight, Lock, Command, ChevronRight } from 'lucide-react';

const NewsTicker = () => (
    <div className="flex items-center space-x-8 text-[10px] font-mono text-zinc-500 uppercase tracking-widest animate-scroll-left whitespace-nowrap">
        <span><span className="text-emerald-500 px-2">●</span>System Operational</span>
        <span><span className="text-blue-500 px-2">●</span>Global Finance Sync: Active</span>
        <span><span className="text-amber-500 px-2">●</span>Risk Matrix: Nominal</span>
        <span><span className="text-emerald-500 px-2">●</span>Input Zero: Secure</span>
        <span><span className="text-zinc-500 px-2">●</span>Version 4.2.0-Alpha</span>

        {/* Duplicate for infinite loop illusion */}
        <span><span className="text-emerald-500 px-2">●</span>System Operational</span>
        <span><span className="text-blue-500 px-2">●</span>Global Finance Sync: Active</span>
        <span><span className="text-amber-500 px-2">●</span>Risk Matrix: Nominal</span>
        <span><span className="text-emerald-500 px-2">●</span>Input Zero: Secure</span>
    </div>
);

const BentoCard = ({ children, className, delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
        className={`bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden relative group hover:border-white/10 transition-colors ${className}`}
    >
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        {children}
    </motion.div>
);

export const InputZero: React.FC = () => {
    const [authMode, setAuthMode] = useState(false);

    return (
        <div className="min-h-screen bg-zinc-950 text-white selection:bg-emerald-500/30 font-sans overflow-hidden flex flex-col items-center justify-center relative">

            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-zinc-950 to-zinc-950 pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none mix-blend-overlay"></div>

            {/* Neural Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

            <AnimatePresence mode="wait">
                {!authMode ? (
                    <motion.div
                        key="landing"
                        exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                        transition={{ duration: 0.5 }}
                        className="relative z-10 w-full max-w-7xl mx-auto px-6 h-full flex flex-col"
                    >
                        {/* Header */}
                        <header className="py-8 flex justify-between items-center mb-12">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-3"
                            >
                                <div className="w-10 h-10 bg-white rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.1)] flex items-center justify-center">
                                    <Command size={20} className="text-zinc-950" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold italic tracking-tight">MCE <span className="opacity-40 font-bold italic">NEXUS</span></h1>
                                    <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold italic">Enterprise Resource Planning</div>
                                </div>
                            </motion.div>

                            <motion.button
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setAuthMode(true)}
                                className="px-6 py-2.5 bg-white text-zinc-950 rounded-full text-sm font-bold italic shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] transition-all flex items-center gap-2 group"
                            >
                                Identify <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </motion.button>
                        </header>

                        {/* Bento Grid layout */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[180px]">

                            {/* Main Hero Card */}
                            <BentoCard className="md:col-span-8 md:row-span-2 relative p-10 flex flex-col justify-between overflow-hidden" delay={0.1}>
                                <div className="absolute top-0 right-0 p-8 opacity-20">
                                    <Globe size={300} strokeWidth={0.5} />
                                </div>
                                <div className="relative z-10 max-w-lg">
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold italic uppercase tracking-widest mb-6"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        v4.0 Live Environment
                                    </motion.div>
                                    <h2 className="text-5xl font-bold italic tracking-tight mb-6 leading-[1.1]">
                                        Total <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Visibility.</span><br />
                                        Absolute <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">Control.</span>
                                    </h2>
                                    <p className="text-zinc-400 text-lg leading-relaxed">
                                        The Nexus framework unifies project delivery, financial governance, and risk intelligence into a single crystalline interface.
                                    </p>
                                </div>

                                <div className="relative z-10 flex gap-4 mt-8">
                                    <div className="flex -space-x-4">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-10 h-10 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center text-xs text-zinc-500">
                                                U{i}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-xs text-zinc-500 flex items-center h-10">
                                        <span className="font-bold italic text-white mx-1">14</span> Executives Online
                                    </div>
                                </div>
                            </BentoCard>

                            {/* Risk Module Teaser */}
                            <BentoCard className="md:col-span-4 md:row-span-1 p-6 flex flex-col justify-between bg-rose-950/10 border-rose-500/10 group-hover:border-rose-500/20" delay={0.2}>
                                <div className="flex justify-between items-start">
                                    <ShieldCheck className="text-rose-500" size={24} />
                                    <span className="text-[10px] uppercase font-bold italic text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded">Defense</span>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold italic text-white mb-1">Iron Dome</div>
                                    <div className="text-xs text-rose-300/60">Automated compliance enforcement & risk triangulation.</div>
                                </div>
                            </BentoCard>

                            {/* Financial Teaser */}
                            <BentoCard className="md:col-span-4 md:row-span-1 p-6 flex flex-col justify-between bg-emerald-950/10 border-emerald-500/10 group-hover:border-emerald-500/20" delay={0.3}>
                                <div className="flex justify-between items-start">
                                    <Activity className="text-emerald-500" size={24} />
                                    <span className="text-[10px] uppercase font-bold italic text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">Fiscal</span>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold italic text-white mb-1">Live Ledger</div>
                                    <div className="text-xs text-emerald-300/60">Real-time P&L synthesis and forecasting engine.</div>
                                </div>
                            </BentoCard>

                            {/* News Ticker */}
                            <BentoCard className="md:col-span-12 md:row-span-1 flex items-center px-6 overflow-hidden bg-zinc-950/50" delay={0.4}>
                                <div className="bg-zinc-900 px-3 py-1 rounded text-[10px] font-bold italic text-white mr-6 uppercase tracking-wider shrink-0 border border-white/10">
                                    System Updates
                                </div>
                                <div className="overflow-hidden w-full mask-linear-fade">
                                    <NewsTicker />
                                </div>
                            </BentoCard>

                        </div>

                        <footer className="mt-12 flex justify-between items-center text-[10px] text-zinc-600 uppercase tracking-widest">
                            <div>MCE Construction © 2026</div>
                            <div className="flex gap-6">
                                <span>Security Level 5</span>
                                <span>Dubai // London // Singapore</span>
                            </div>
                        </footer>

                    </motion.div>
                ) : (
                    <motion.div
                        key="auth"
                        initial={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5, ease: "circOut" }}
                        className="relative z-20 flex flex-col items-center"
                    >
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            onClick={() => setAuthMode(false)}
                            className="absolute top-[-80px] left-0 text-zinc-500 hover:text-white text-xs uppercase tracking-widest font-bold italic flex items-center gap-2 transition-colors"
                        >
                            <ArrowRight className="rotate-180" size={14} /> Return to Nexus
                        </motion.button>

                        <div className="mb-8 text-center">
                            <div className="w-16 h-16 bg-white rounded-2xl mx-auto mb-6 shadow-[0_0_40px_rgba(255,255,255,0.2)] flex items-center justify-center">
                                <Lock size={28} className="text-zinc-950" />
                            </div>
                            <h2 className="text-2xl font-bold italic tracking-tight">Biometric Verification</h2>
                            <p className="text-zinc-500 text-sm mt-2">Authorized personnel identification required.</p>
                        </div>

                        <div className="p-1 bg-gradient-to-b from-white/10 to-transparent rounded-2xl">
                            <div className="bg-zinc-950 border border-white/10 rounded-xl p-6 shadow-2xl backdrop-blur-3xl min-w-[380px]">
                                <SignIn
                                    appearance={{
                                        layout: { socialButtonsPlacement: "bottom", socialButtonsVariant: "iconButton" },
                                        elements: {
                                            rootBox: "w-full",
                                            card: "bg-transparent shadow-none p-0 w-full",
                                            headerTitle: "hidden",
                                            headerSubtitle: "hidden",
                                            formButtonPrimary: "bg-white hover:bg-zinc-200 text-zinc-950 font-bold italic py-3 rounded-lg normal-case",
                                            formFieldInput: "bg-zinc-900 border-zinc-800 text-white focus:border-white/20 rounded-lg",
                                            formFieldLabel: "text-zinc-500 text-xs font-bold italic uppercase tracking-widest",
                                            footerAction: "hidden",
                                            dividerLine: "bg-zinc-800",
                                            dividerText: "text-zinc-600 text-[10px] font-bold italic uppercase tracking-widest bg-zinc-950"
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex gap-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className={`w-2 h-2 rounded-full ${i === 1 ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-800'}`} />
                            ))}
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};
