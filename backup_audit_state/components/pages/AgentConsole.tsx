import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Terminal, Zap, ShieldAlert, Activity, CheckCircle2, RefreshCcw, Database, ShieldCheck, Globe, Bot } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { agentRegistry } from '../../utils/agent';
import { useDashboardData } from '../../hooks/useDashboardData';

interface AgentConsoleProps {
  activity: any[];
  auditLogs: any[];
}

export const AgentConsole: React.FC<AgentConsoleProps> = ({ activity, auditLogs }) => {
  const [activeTab, setActiveTab] = useState<'mesh' | 'audit' | 'intelligence'>('mesh');
  const [isScanning, setIsScanning] = useState(false);
  const { projects } = useDashboardData();
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleGlobalScan = async () => {
    setIsScanning(true);
    console.log("Mission Control: Initiating Multi-Factor Risk Scan...");
    try {
      for (const project of projects || []) {
        await agentRegistry.p5.run(project.id);
      }
      alert("Neural Scan Complete: Portfolio Risk Vectors synchronized.");
    } catch (err) {
      console.error("Scan Interrupted:", err);
    } finally {
      setIsScanning(false);
    }
  };

  // Auto-scroll terminal
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activity]);

  const agents = [
    { id: 'P1', name: 'Contract Extractor', model: 'Sonnet 4.5', status: 'Active', load: '12%', color: 'text-emerald-500' },
    { id: 'P5', name: 'Risk Compliance', model: 'Sonnet 4.5', status: 'Monitoring', load: '4%', color: 'text-blue-500' },
    { id: 'P9', name: 'Knowledge Core', model: 'Gemini 1.5', status: 'Active', load: '28%', color: 'text-[#00FFFF]' },
    { id: 'S1', name: 'Security Guard', model: 'RLS-Engine', status: 'Standby', load: '0%', color: 'text-rose-500' },
  ];

  return (
    <div className="page-container space-y-8 animate-in fade-in duration-700">
      
      {/* HUD HEADER */}
      <div className="flex justify-between items-end mb-12 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.4em] mb-3 font-mono">
            <Globe size={10} className="text-emerald-500" />
            <span>Mission Control // Sector 01</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Agent Command</h1>
        </div>
        
        <div className="flex items-center gap-4">
           <button 
             onClick={handleGlobalScan}
             disabled={isScanning}
             className={`bg-emerald-500 text-black px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${isScanning ? 'animate-pulse opacity-50' : 'hover:bg-emerald-400'}`}
           >
             <ShieldCheck size={14} strokeWidth={3} />
             {isScanning ? 'Scanning Cluster...' : 'Execute Compliance Scan'}
           </button>
           <div className="px-4 py-2 bg-black/40 border border-white/5 rounded-xl flex items-center gap-3">
              <div className="flex space-x-1">
                 <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                 <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse [animation-delay:0.2s]"></div>
                 <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse [animation-delay:0.4s]"></div>
              </div>
              <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Neural Link: SECURE</span>
           </div>
           <button 
             onClick={() => window.location.reload()}
             className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-zinc-400"
           >
             <RefreshCcw size={16} />
           </button>
        </div>
      </div>

      {/* COMMAND NAVIGATION */}
      <div className="flex space-x-2 p-1.5 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/5 w-fit mb-10 shadow-2xl">
        {[
          { id: 'mesh', label: 'NEURAL_MESH', icon: Bot },
          { id: 'intelligence', label: 'INTELLIGENCE_STREAM', icon: Zap },
          { id: 'audit', label: 'IMMUTABLE_LEDGER', icon: Database }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all flex items-center gap-3 ${
              activeTab === tab.id 
                ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
            }`}
          >
            <tab.icon size={14} strokeWidth={2.5} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'mesh' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
            {agents.map((agent) => (
              <div key={agent.id} className="bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[2rem] p-8 shadow-2xl hover:border-emerald-500/20 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                   <Cpu size={80} />
                </div>
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${agent.color}`}>
                    <Cpu size={20} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">{agent.model}</span>
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full border ${
                      agent.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                    }`}>{agent.status}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight mb-6 relative z-10 uppercase italic">
                   <span className="text-zinc-600 mr-2 font-mono">[{agent.id}]</span>
                   {agent.name}
                </h3>
                <div className="space-y-3 relative z-10">
                   <div className="flex items-end justify-between">
                     <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Cognitive Load</span>
                     <span className="text-[11px] font-mono font-bold text-emerald-500">{agent.load}</span>
                   </div>
                   <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden shadow-inner">
                     <div className="bg-emerald-500 h-full transition-all duration-[2000ms] shadow-[0_0_15px_#10b981]" style={{ width: agent.load }}></div>
                   </div>
                </div>
              </div>
            ))}
          </div>

          {/* Live Terminal */}
          <div className="lg:col-span-5 bg-[#050505] border border-white/10 rounded-[2rem] overflow-hidden flex flex-col h-[600px] shadow-3xl">
            <div className="px-6 py-4 border-b border-white/5 bg-black/40 flex justify-between items-center">
              <div className="flex items-center gap-3">
                 <Terminal size={14} className="text-emerald-500" />
                 <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] font-mono italic">live_stream.sh</h3>
              </div>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 font-mono text-[11px] leading-relaxed custom-scrollbar">
              {activity.length === 0 ? (
                <div className="h-full flex items-center justify-center opacity-20 flex-col gap-4">
                   <Activity size={40} className="animate-pulse" />
                   <p className="tracking-[0.5em] uppercase text-xs">Waiting for Neural Event...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activity.map((log, i) => (
                    <div key={i} className="flex gap-4 group border-l border-white/5 pl-4 hover:border-emerald-500/30 transition-colors">
                      <span className="text-zinc-700 whitespace-nowrap">[{new Date(log.created_at || Date.now()).toLocaleTimeString()}]</span>
                      <div className="flex flex-col gap-1">
                         <div className="flex items-center gap-3">
                            <span className="text-emerald-500 font-bold tracking-tighter">❯ {log.agent_id}</span>
                            <span className="text-zinc-200 uppercase font-black tracking-widest text-[9px]">{log.action_type}</span>
                         </div>
                         <div className="text-zinc-500 break-all bg-white/[0.02] p-2 rounded border border-white/5 group-hover:text-zinc-300">
                            {JSON.stringify(log.payload || {})}
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'intelligence' && (
        <div className="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-12 min-h-[500px] flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95 duration-500">
           <Zap size={48} className="text-[#00FFFF] animate-pulse" />
           <h2 className="text-2xl font-bold text-white uppercase tracking-tighter italic">Intelligence Engine // Sonnet V4.5</h2>
           <p className="text-zinc-500 text-sm max-w-xl leading-relaxed uppercase tracking-widest font-medium">
              Real-time reasoning over the project ledger. Every query is filtered through the RAG Hybrid pipeline and verified against the Iron Dome financial barrier.
           </p>
           <div className="grid grid-cols-3 gap-12 w-full max-w-3xl pt-12 border-t border-white/5">
              <div className="space-y-2">
                 <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Model Precision</p>
                 <p className="text-3xl font-black text-white font-mono tracking-tighter">99.2%</p>
              </div>
              <div className="space-y-2">
                 <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Reasoning Hops</p>
                 <p className="text-3xl font-black text-emerald-500 font-mono tracking-tighter">15-T</p>
              </div>
              <div className="space-y-2">
                 <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Latency (P95)</p>
                 <p className="text-3xl font-black text-blue-500 font-mono tracking-tighter">1.2s</p>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl animate-in fade-in duration-500">
          <div className="px-8 py-6 border-b border-white/10 bg-black/20 flex justify-between items-center">
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.4em] font-mono italic flex items-center gap-3">
               <ShieldCheck size={16} className="text-emerald-500" /> Immutable_System_Ledger
            </h3>
            <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">{auditLogs.length} Records Identity Verified</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] bg-black/40 border-b border-white/5">
                <tr>
                  <th className="px-8 py-4 font-mono">Temporal_Signature</th>
                  <th className="px-8 py-4">Actor_ID</th>
                  <th className="px-8 py-4">Action_Node</th>
                  <th className="px-8 py-4 text-right pr-8 font-mono">Ref_Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-zinc-400 font-mono">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-5 text-zinc-600 group-hover:text-emerald-500 transition-colors">{new Date(log.created_at).toISOString()}</td>
                    <td className="px-8 py-5 font-bold text-zinc-300 tracking-tighter">{log.actor_id || 'SYSTEM_DAEMON'}</td>
                    <td className="px-8 py-5">
                      <span className={`px-2 py-1 rounded text-[9px] font-black border uppercase tracking-widest ${
                        log.action === 'INSERT' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' :
                        log.action === 'UPDATE' ? 'text-blue-500 border-blue-500/20 bg-blue-500/5' : 
                        'text-rose-500 border-rose-500/20 bg-rose-500/5'
                      }`}>{log.action}</span>
                    </td>
                    <td className="px-8 py-5 text-right pr-8 text-zinc-700 group-hover:text-zinc-500">{(log.entity_id || '0000').substring(0, 12)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Workflow Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] p-8 relative overflow-hidden">
          <Zap className="absolute -right-4 -bottom-4 w-24 h-24 text-emerald-500/5" />
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total Operations</p>
          <h4 className="text-4xl font-black text-white tracking-tighter font-mono shadow-[0_0_15px_rgba(16,185,129,0.2)]">1,402</h4>
          <p className="text-emerald-500 text-[10px] font-bold mt-4 uppercase tracking-widest">↑ 12% VELOCITY INCREASE</p>
        </div>
        <div className="bg-black/40 border border-white/5 rounded-[2rem] p-8">
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Success Rate</p>
          <h4 className="text-4xl font-black text-white tracking-tighter font-mono shadow-[0_0_15px_rgba(255,255,255,0.1)]">99.8%</h4>
          <div className="flex items-center space-x-2 mt-4 text-zinc-500">
            <CheckCircle2 size={12} className="text-emerald-500" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Exceeding SLA Baseline</span>
          </div>
        </div>
        <div className="bg-black/40 border border-white/5 rounded-[2rem] p-8">
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Avg Latency</p>
          <h4 className="text-4xl font-black text-white tracking-tighter font-mono shadow-[0_0_15px_rgba(255,255,255,0.1)]">142ms</h4>
          <div className="flex items-center space-x-2 mt-4 text-zinc-500">
            <Activity size={12} className="text-emerald-500" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Optimal Node Response</span>
          </div>
        </div>
      </div>

    </div>
  );
};