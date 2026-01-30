import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Briefcase, Mail, Phone, MoreHorizontal, Clock, DollarSign } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { supabase } from '../../lib/supabase';

import { TimesheetForm } from '../forms/TimesheetForm';
import { ResourceForm } from '../forms/ResourceForm';

interface ResourcesPageProps {
  projects: any[];
  onRefresh: () => void;
}

export const ResourcesPage: React.FC<ResourcesPageProps> = ({ projects, onRefresh }) => {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const fetchResources = async () => {
      const { data } = await supabase.from('resources').select('*').order('created_at', { ascending: false });
      if (data) setResources(data);
      setLoading(false);
    };
    fetchResources();
  }, []);

  return (
    <div className="page-container">
      {selectedResourceId && (
        <TimesheetForm
          resourceId={selectedResourceId}
          projects={projects}
          onClose={() => setSelectedResourceId(null)}
          onSuccess={onRefresh}
        />
      )}
      {isFormOpen && <ResourceForm onClose={() => setIsFormOpen(false)} onSuccess={onRefresh} />}
      
      <div className="flex justify-between items-end mb-8 border-b border-[var(--surface-border)] pb-4">
        <div>
          <div className="flex items-center text-zinc-400 text-[9px] uppercase tracking-[0.3em] font-black mb-2 font-sans">
             <span>Home</span>
             <span className="mx-2 opacity-30">/</span>
             <span className="text-zinc-300">Resources</span>
          </div>
          <h1 className="text-3xl font-black text-[#444444] tracking-tighter uppercase font-brand">Resource Command</h1>
        </div>
        <div className="flex space-x-3">
           <button 
             onClick={() => alert("Please run the 'import-manpower' script to load Demand Forecast data.")}
             className="bg-[var(--surface-layer)] border border-[var(--surface-border)] text-zinc-400 px-4 py-2 rounded text-xs font-bold hover:text-white hover:border-zinc-500 transition-all uppercase tracking-wider"
           >
             Demand Forecast
           </button>
           <button 
             onClick={() => setIsFormOpen(true)}
             className="bg-[#00FFFF] hover:bg-[#00FFFF]/80 text-[#0A0F2C] px-6 py-2 rounded-sm text-xs font-bold flex items-center shadow-[0_0_15px_rgba(0,255,255,0.4)] transition-all uppercase tracking-wider font-brand"
           >
              <UserPlus size={14} className="mr-2" />
              Add Resource
           </button>
        </div>
      </div>

      {/* Utilization Summary (Heatmap simulation) */}
      <div className="bg-[var(--surface-layer)] backdrop-blur-xl border border-[var(--surface-border)] rounded-sm p-6 shadow-sm">
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] font-sans">Global Capacity Heatmap</h3>
            <div className="flex items-center space-x-4">
               <div className="flex items-center space-x-2"><div className="w-1.5 h-1.5 bg-[#00FF9F] rounded-full"></div><span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Optimal</span></div>
               <div className="flex items-center space-x-2"><div className="w-1.5 h-1.5 bg-[#FFD700] rounded-full"></div><span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">At Capacity</span></div>
               <div className="flex items-center space-x-2"><div className="w-1.5 h-1.5 bg-[#FF3B3B] rounded-full"></div><span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Overloaded</span></div>
            </div>
         </div>
         <div className="grid grid-cols-7 gap-1">
            {/* Deterministic Load Simulation (Weekdays High, Weekends Low) */}
            {Array.from({length: 28}).map((_, i) => {
               const dayOfWeek = i % 7;
               const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; // Fri/Sat in some regions, or Sat/Sun
               const baseLoad = isWeekend ? 10 : 85;
               const variation = (i * 7) % 15; // Deterministic variation
               const load = Math.min(100, Math.max(0, baseLoad + variation));
               
               return (
                 <div key={i} className={`h-8 rounded-sm border backdrop-blur-sm ${
                   load > 90 ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                   load > 70 ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                   'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                 } flex items-center justify-center text-[9px] font-mono font-bold`}>
                    {load}%
                 </div>
               );
            })}
         </div>
         <p className="mt-4 text-[9px] text-zinc-600 text-center font-bold uppercase tracking-widest">Aggregate team load across 33 active projects for the next 4 weeks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((res) => (
          <div key={res.id} className="bg-[var(--surface-layer)] backdrop-blur-xl border border-[var(--surface-border)] rounded-sm p-6 hover:border-[#00FFFF]/30 transition-all group relative cursor-default">
            {/* Load indicator */}
            <div className="absolute top-4 right-4">
               <div className="flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20 text-[9px] font-black uppercase tracking-wider">
                  <div className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span>82% LOAD</span>
               </div>
            </div>

            <div className="flex justify-between items-start mb-6">
               <div className="w-10 h-10 bg-white/5 rounded border border-white/10 flex items-center justify-center text-[#00FFFF] font-bold text-sm group-hover:bg-[#00FFFF] group-hover:text-[#0A0F2C] transition-all duration-300 font-mono">
                  {res.full_name?.split(' ').map((n: any) => n[0]).join('')}
               </div>
            </div>

            <h3 className="text-lg font-bold text-white group-hover:text-[#00FFFF] transition-colors mb-1">{res.full_name}</h3>
            <p className="text-xs text-zinc-400 font-medium mb-4">{res.role}</p>
            <div className="inline-block px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-[9px] text-blue-400 font-bold uppercase tracking-wider shadow-sm">{res.department}</div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-[var(--surface-border)] text-sm">
               <div>
                  <p className="text-zinc-500 text-[9px] uppercase font-black tracking-widest mb-1">Rate</p>
                  <p className="font-mono font-bold text-zinc-300">AED {res.hourly_rate}</p>
               </div>
               <div>
                  <p className="text-zinc-500 text-[9px] uppercase font-black tracking-widest mb-1">Hours (Jan)</p>
                  <p className="font-mono font-bold text-zinc-300">162h <span className="text-[9px] text-emerald-500 ml-1">↑</span></p>
               </div>
            </div>

            <div className="mt-6 flex space-x-2">
               <button
                 onClick={() => setSelectedResourceId(res.id)}
                 className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white rounded-sm text-[10px] font-bold transition-all flex items-center justify-center border border-white/5 uppercase tracking-wider"
               >
                  <Clock size={12} className="mr-2 opacity-50" />
                  Timesheets
               </button>
               <button 
                 onClick={() => alert("Resource assignment coming in Phase 2.")}
                 className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white rounded-sm text-[10px] font-bold transition-all flex items-center justify-center border border-white/5 uppercase tracking-wider"
               >
                  <Briefcase size={12} className="mr-2 opacity-50" />
                  Assign
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
