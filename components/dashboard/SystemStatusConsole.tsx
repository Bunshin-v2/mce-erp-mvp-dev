import React, { useState, useEffect } from 'react';

import { Activity, Database, Server, Wifi, Cpu, ShieldCheck } from 'lucide-react';

export const SystemStatusConsole = () => {
    const [heartbeat, setHeartbeat] = useState(true);
    const [latency, setLatency] = useState(12);
    const [sessions, setSessions] = useState(4);
    const [logs, setLogs] = useState<string[]>([
        "SYSTEM_INIT: CORE_SERVICES_ONLINE",
        "SYNC_NODE_01: STABLE",
        "DB_SHARD_A: REBALANCED"
    ]);

    // Simulated Heartbeat
    useEffect(() => {
        const interval = setInterval(() => {
            setHeartbeat(prev => !prev);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Simulated Telemetry Updates
    useEffect(() => {
        const interval = setInterval(() => {
            setLatency(prev => Math.max(8, Math.min(24, prev + (Math.random() > 0.5 ? 2 : -2))));
            setSessions(prev => Math.max(2, Math.min(10, prev + (Math.random() > 0.8 ? 1 : 0))));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Simulated Log Stream
    useEffect(() => {
        const possibleLogs = [
            "AUTO_SAVE_PROJECT: #104 COMPLETED",
            "DATA_INTEGRITY_CHECK: PASSED",
            "FETCH_METADATA: SUCCESS",
            "CACHE_INVALIDATION: PARTIAL",
            "USER_ACTION: NAVIGATE_DASHBOARD",
            "SIGNAL_DETECTED: LOW_PRIORITY"
        ];

        const interval = setInterval(() => {
            const newLog = possibleLogs[Math.floor(Math.random() * possibleLogs.length)];
            setLogs(prev => [newLog, ...prev].slice(0, 5));
        }, 4500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-full bg-black/40 border border-zinc-800/50 backdrop-blur-md overflow-hidden flex flex-col group hover:border-emerald-500/30 transition-all duration-500">
            {/* Header / Top Bar */}
            <div className="px-4 py-3 border-b border-glass bg-glass-subtle flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Activity size={14} className={`text-emerald-500 ${heartbeat ? 'opacity-100' : 'opacity-50'} transition-opacity duration-300`} />
                    <span className="text-xs font-mono font-bold italic text-emerald-500 tracking-wider">SYSTEM_ONLINE</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <div className={`w-1 h-1 rounded-full ${heartbeat ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-zinc-600'} transition-all duration-300`} />
                        <span className="text-xs font-mono text-zinc-500">LIVE</span>
                    </div>
                </div>
            </div>

            {/* Main Console Content */}
            <div className="flex-1 p-4 flex flex-col gap-4 font-mono">

                {/* Telemetry Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Latency Metric */}
                    <div className="bg-glass-subtle border border-glass rounded-lg p-3 relative overflow-hidden group/item hover:bg-white/[0.04] transition-colors">
                        <div className="absolute top-0 right-0 p-1 opacity-20 group-hover/item:opacity-40 transition-opacity">
                            <Wifi size={24} />
                        </div>
                        <div className="text-xs text-zinc-500 mb-1">Latency</div>
                        <div className="text-lg font-bold italic text-zinc-200 flex items-baseline gap-1">
                            {latency} <span className="text-xs text-zinc-500 font-bold italic">ms</span>
                        </div>
                    </div>

                    {/* Active Sessions */}
                    <div className="bg-glass-subtle border border-glass rounded-lg p-3 relative overflow-hidden group/item hover:bg-white/[0.04] transition-colors">
                        <div className="absolute top-0 right-0 p-1 opacity-20 group-hover/item:opacity-40 transition-opacity">
                            <Server size={24} />
                        </div>
                        <div className="text-xs text-zinc-500 mb-1">Sessions</div>
                        <div className="text-lg font-bold italic text-zinc-200 flex items-baseline gap-1">
                            {sessions} <span className="text-xs text-zinc-500 font-bold italic">Active</span>
                        </div>
                    </div>
                </div>

                {/* System Terminal Log */}
                <div className="flex-1 bg-black/60 border border-glass rounded-lg p-3 relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent opacity-50"></div>
                    <div className="text-xs text-emerald-500/50 mb-2 flex items-center gap-1.5">
                        <Cpu size={10} />
                        <span>EVENT_STREAM</span>
                    </div>
                    <div className="flex-1 overflow-hidden relative">
                        <div className="space-y-1.5 absolute bottom-0 w-full transition-all duration-300">
                            {logs.map((log, i) => (
                                <div key={i} className={`text-xs font-mono truncate ${i === 0 ? 'text-emerald-400' : 'text-zinc-600'} ${i > 2 ? 'opacity-40' : 'opacity-100'} transition-all duration-300`}>
                                    <span className="opacity-50 mr-2">[{new Date().toLocaleTimeString('en-US', { hour12: false, hour: "2-digit", minute: "2-digit" })}]</span>
                                    {log}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorator Footer */}
            <div className="px-4 py-2 bg-white/[0.01] border-t border-glass flex items-center justify-between text-xs text-zinc-600 font-mono">
                <span>VER: 4.2.0-ALPHA</span>
                <span className="flex items-center gap-1 text-emerald-500/60"><ShieldCheck size={8} /> SECURED</span>
            </div>
        </div>
    );
};

