import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  ShieldAlert,
  User,
  Calendar,
  Loader2,
  Link as LinkIcon,
  FileText,
  X,
  Sparkles
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { agentRegistry } from '../../utils/agent';

interface TenderChecklistTrackerProps {
  tenderId: string;
}

interface Requirement {
  id: string;
  section_name: string;
  title: string;
  status: string;
  is_mandatory: boolean;
  assigned_to?: string;
  due_date?: string;
  evidence_doc_id?: string;
}

interface Doc {
  id: string;
  title: string;
  category: string;
}

export const TenderChecklistTracker: React.FC<TenderChecklistTrackerProps> = ({ tenderId }) => {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [linkingReqId, setLinkingReqId] = useState<string | null>(null);
  const [availableDocs, setAvailableDocs] = useState<Doc[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);

  const handleAutoSuggest = async (req: Requirement) => {
    try {
      const match = await agentRegistry.p5.findEvidence(req.title);
      if (match) {
        if (window.confirm(`AI AGENT: Identified matching artifact in vault:\n"${match.title}" (${Math.round(match.confidence * 100)}% Confidence).\n\nExecute automated linking?`)) {
          await handleLinkDocument(match.doc_id);
        }
      } else {
        alert("AI AGENT: No high-confidence matching artifacts identified in current registry volume.");
      }
    } catch (err) {
      console.error("Auto-suggest failed", err);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, [tenderId]);

  const fetchRequirements = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks') 
        .select('*')
        .eq('tender_id', tenderId)
        .order('section_name', { ascending: true });

      if (error) throw error;
      setRequirements(data || []);
    } catch (err) {
      console.error('Failed to fetch checklist:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkDocument = async (docId: string) => {
    if (!linkingReqId) return;
    try {
      const { error } = await supabase.from('tasks').update({ evidence_doc_id: docId, status: 'completed' }).eq('id', linkingReqId);
      if (error) throw error;
      await fetchRequirements();
      setLinkingReqId(null);
    } catch (err) {
      console.error('Link failed:', err);
    }
  };

  const openLinkModal = async (reqId: string) => {
    setLinkingReqId(reqId);
    setDocsLoading(true);
    const { data } = await supabase.from('documents').select('id, title, category');
    setAvailableDocs(data || []);
    setDocsLoading(false);
  };

  const sections: Record<string, Requirement[]> = {};
  requirements.forEach(r => {
    if (!sections[r.section_name]) sections[r.section_name] = [];
    sections[r.section_name].push(r);
  });

  const total = requirements.length;
  const completed = requirements.filter(i => i.status === 'completed').length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  if (loading) return <div className="p-12 text-center text-zinc-500 animate-pulse font-mono uppercase tracking-[0.3em]">Syncing Requirements Matrix...</div>;

  return (
    <div className="space-y-8 font-sans w-full max-w-7xl mx-auto">
      
      {/* 1. Readiness Telemetry - REVERTED TO NON-SPINNING VERSION */}
      <div className="bg-[#0f0f11] border border-white/5 rounded-2xl p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00dc82]/5 blur-3xl pointer-events-none group-hover:bg-[#00dc82]/10 transition-colors"></div>
        
        <div className="flex items-center space-x-8 w-full md:w-auto relative z-10">
           <div className={`relative w-24 h-24 rounded-full border border-zinc-900 flex items-center justify-center bg-black shadow-inner`}>
              <span className={`text-3xl font-black italic tracking-tighter ${progress === 100 ? 'text-[#00dc82]' : 'text-blue-400'}`}>{progress}%</span>
              {/* STATIC CIRCLE - NO ANIMATION PER USER HINT */}
              <div className={`absolute inset-0 rounded-full border-2 ${progress === 100 ? 'border-[#00dc82]/40 shadow-[0_0_15px_rgba(0,220,130,0.3)]' : 'border-zinc-800'}`}></div>
           </div>
           <div>
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none">Submission Saturation</h3>
              <div className="flex items-center space-x-2 mt-3">
                 <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-sm border ${progress === 100 ? 'border-[#00dc82]/30 text-[#00dc82] bg-[#00dc82]/5' : 'border-zinc-800 text-zinc-500 bg-black/40'}`}>
                    {progress === 100 ? 'OPTIMAL_CALIBRATION' : 'NODE_INIT_IN_PROGRESS'}
                 </span>
              </div>
           </div>
        </div>

        <div className="flex space-x-16 mt-8 md:mt-0 relative z-10 border-l border-zinc-900 pl-16">
           <div className="text-center">
              <p className="text-3xl font-black text-white font-mono tracking-tighter">{completed}</p>
              <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest mt-1">Verified</p>
           </div>
           <div className="text-center">
              <p className="text-3xl font-black text-zinc-500 font-mono tracking-tighter">{total - completed}</p>
              <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest mt-1">Pending</p>
           </div>
        </div>
      </div>

      {/* 2. Cluster Grid */}
      <div className="space-y-8">
        {Object.entries(sections).map(([title, items]) => (
          <div key={title} className="bg-[#0f0f11] border border-white/5 rounded-2xl overflow-hidden group hover:border-zinc-700 transition-colors">
            <div className="px-8 py-5 bg-zinc-900/10 flex justify-between items-center border-b border-white/5">
               <h4 className="font-black text-zinc-400 text-xs uppercase tracking-[0.3em] italic">{title}</h4>
               <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest font-bold">
                 SYNC_COEFFICIENT: {items.filter(i => i.status === 'completed').length} / {items.length}
               </span>
            </div>

            <div className="divide-y divide-zinc-900 bg-black/20">
              {items.map((item) => (
                <div key={item.id} className="px-8 py-6 flex items-center justify-between hover:bg-zinc-900/40 transition-all group/row">
                   <div className="flex items-center space-x-8">
                      <div className="shrink-0">
                         {item.status === 'completed' ? <CheckCircle2 className="text-[#00dc82]" size={22} /> : <Circle className="text-zinc-800 group-hover/row:text-zinc-600 transition-colors" size={22} />}
                      </div>
                      <div>
                         <p className={`text-base font-bold uppercase tracking-tight ${item.status === 'completed' ? 'text-zinc-600 line-through' : 'text-zinc-200 group-hover/row:text-white'}`}>
                           {item.title}
                           {item.is_mandatory && <span className="ml-4 text-[9px] text-rose-500 bg-rose-950/20 px-2 py-0.5 rounded-sm uppercase font-black border border-rose-900/20 tracking-widest">Mandatory</span>}
                         </p>
                         {item.evidence_doc_id && (
                            <div className="flex items-center gap-2 text-[10px] text-[#00dc82] mt-2 font-mono uppercase font-black bg-[#00dc82]/5 px-2 py-0.5 rounded-sm w-fit border border-[#00dc82]/10">
                              <LinkIcon size={10} /> Artifact_Secure
                            </div>
                         )}
                      </div>
                   </div>

                   <div className="flex items-center space-x-8 text-[10px] font-mono uppercase tracking-widest">
                      {item.status !== 'completed' && (
                        <div className="flex gap-3">
                          <button 
                            onClick={() => handleAutoSuggest(item)}
                            className="px-4 py-1.5 bg-[#00dc82]/10 border border-[#00dc82]/20 rounded-lg hover:bg-[#00dc82]/20 text-[#00dc82] font-black uppercase transition-all flex items-center gap-2"
                          >
                            <Sparkles size={12} /> Auto-Map
                          </button>
                          <button 
                            onClick={() => openLinkModal(item.id)}
                            className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-zinc-400 font-black uppercase transition-all flex items-center gap-2"
                          >
                            <LinkIcon size={12} /> Link Manual
                          </button>
                        </div>
                      )}
                   </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal - Aligned Typography */}
      {linkingReqId && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-[#0f0f11] border border-white/10 w-full max-w-lg rounded-2xl shadow-5xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-zinc-900/50">
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Vault_Artifact_Sync</h3>
              <button onClick={() => setLinkingReqId(null)}><X size={20} className="text-zinc-500 hover:text-white" /></button>
            </div>
            <div className="max-h-[400px] overflow-y-auto p-2 custom-scrollbar">
              {docsLoading ? (
                <div className="p-12 text-center text-zinc-600 font-mono text-[10px] uppercase tracking-[0.3em]">Scanning_Vault...</div>
              ) : (
                <div className="space-y-1">
                  {availableDocs.map(doc => (
                    <button
                      key={doc.id}
                      onClick={() => handleLinkDocument(doc.id)}
                      className="w-full text-left p-4 hover:bg-white/[0.03] rounded-xl flex items-center gap-4 transition-all group border border-transparent hover:border-white/5"
                    >
                      <FileText size={18} className="text-zinc-600 group-hover:text-[#00dc82]" />
                      <div>
                        <p className="text-xs font-black text-zinc-300 group-hover:text-white uppercase">{doc.title}</p>
                        <p className="text-[9px] text-zinc-600 uppercase tracking-widest mt-1 font-bold">{doc.category}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};