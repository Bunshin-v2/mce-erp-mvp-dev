import React, { useState, useEffect } from 'react';
import { ArrowLeft, Gavel, Calendar, Clock, TrendingUp, Wand2, AlertTriangle, UserPlus, X, Loader2, Lock, CheckCircle2, Layers, FileText } from 'lucide-react';
import { Watermark } from '../Watermark';
import { TenderIntakeWizard } from './TenderIntakeWizard';
import { TenderChecklistTracker } from './TenderChecklistTracker';
import { supabase } from '../../lib/supabase';
import { useUserTier } from '../../hooks/useUserTier';

interface TenderDetailProps {
   tender: any;
   onBack: () => void;
}

export const TenderDetail: React.FC<TenderDetailProps> = ({ tender, onBack }) => {
   const [showWizard, setShowWizard] = useState(false);
   const [hasChecklist, setHasChecklist] = useState(false);
   const [checking, setChecking] = useState(true);
   const [resetting, setResetting] = useState(false);
   const [showMatrix, setShowMatrix] = useState(false);
   const [initialTemplate, setInitialTemplate] = useState<string | undefined>(undefined);

   const { hasPermission } = useUserTier();
   const isManager = hasPermission('L3');

   useEffect(() => {
      if (!tender?.id) return;
      const checkRequirements = async () => {
         try {
            const { count } = await supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('tender_id', tender.id);
            if (count && count > 0) {
               setHasChecklist(true);
               setShowMatrix(true); // Auto-open matrix if calibrated
            }
         } catch (err) {
            console.error('Failed to verify registry:', err);
         } finally {
            setChecking(false);
         }
      };
      checkRequirements();
   }, [tender?.id]);

   const handleReset = async () => {
      if (!window.confirm('WARNING: Permanent deletion of requirement matrix and linked evidence. Continue?')) return;
      setResetting(true);
      try {
         const { error } = await supabase.rpc('reset_tender_checklist', { target_tender_id: tender.id });
         if (error) throw error;
         setHasChecklist(false);
         setShowWizard(false);
         setShowMatrix(false);
      } catch (err: any) {
         alert('Reset Failed: ' + err.message);
      } finally {
         setResetting(false);
      }
   };

   const handleStartWizard = (templateId?: string) => {
      setInitialTemplate(templateId);
      setShowWizard(true);
   };

   if (!tender) return (
      <div className="p-8 text-center text-rose-500 font-bold uppercase tracking-widest bg-[var(--surface-base)] min-h-screen">
         Tender Data Identity Not Found
         <button onClick={onBack} className="block mx-auto mt-4 text-zinc-500 hover:text-white underline text-[10px]">Return to Registry</button>
      </div>
   );

   if (checking) return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
         <Loader2 className="animate-spin text-emerald-500" size={32} />
         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 font-mono">Syncing Registry Clusters...</p>
      </div>
   );

   return (
      <div className="space-y-8 animate-fade-in pb-10 font-sans relative min-h-screen">
         <Watermark />

         {/* Normalized Header Size */}
         <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <div className="flex items-center space-x-6">
               <button onClick={onBack} className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-all text-zinc-400 hover:text-white">
                  <ArrowLeft size={18} />
               </button>
               <div>
                  <h1 className="text-2xl font-bold text-white uppercase tracking-tight">{tender.title}</h1>
                  <div className="flex items-center space-x-4 mt-2 text-[10px] font-black uppercase tracking-widest">
                     <span className="text-zinc-600">CLIENT: <span className="text-zinc-200">{tender.client}</span></span>
                     <span className="text-zinc-800">|</span>
                     <span className="text-zinc-600">PRIORITY: <span className="text-emerald-500">{tender.probability || 'HIGH'}</span></span>
                  </div>
               </div>
            </div>
            {showMatrix && (
               <button
                  onClick={() => setShowMatrix(false)}
                  className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-widest transition-all"
               >
                  Return to Setup Node
               </button>
            )}
         </div>

         {!showMatrix ? (
            <div className="flex items-center justify-center min-h-[65vh] animate-in zoom-in-95 duration-500">
               {!hasChecklist ? (
                  <div className="bg-[#0a0a0c] border border-white/10 rounded-[2.5rem] w-full max-w-3xl overflow-hidden shadow-5xl relative">
                     <div className="p-16 text-center">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                           <Wand2 size={32} className="text-emerald-500" />
                        </div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Intake Calibration Required</h2>
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-12">Registry Calibration Framework v2.0</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                           <button
                              onClick={() => handleStartWizard('RFP')}
                              className="bg-white/[0.02] border border-white/5 p-10 rounded-[2rem] text-center group hover:border-emerald-500/30 hover:bg-emerald-500/[0.02] transition-all relative overflow-hidden"
                           >
                              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                                 <FileText size={24} className="text-emerald-500" />
                              </div>
                              <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Standard_Construction_RFP</h4>
                              <p className="text-[9px] text-zinc-600 font-bold uppercase mt-3 leading-relaxed">Commercial & Technical Volumes. Standard breakdown structure.</p>
                           </button>

                           <button
                              onClick={() => handleStartWizard('DESIGN_BUILD')}
                              className="bg-white/[0.02] border border-white/5 p-10 rounded-[2rem] text-center group hover:border-blue-500/30 hover:bg-blue-500/[0.02] transition-all relative overflow-hidden"
                           >
                              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20 group-hover:scale-110 transition-transform">
                                 <Layers size={24} className="text-blue-500" />
                              </div>
                              <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Design_&_Build</h4>
                              <p className="text-[9px] text-zinc-600 font-bold uppercase mt-3 leading-relaxed">Combined Work Packages with Design execution nodes.</p>
                           </button>
                        </div>

                        <button
                           onClick={() => handleStartWizard()}
                           className="bg-emerald-500 text-black px-16 py-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.5em] shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] hover:scale-105 transition-all"
                        >
                           Initialize Calibration
                        </button>
                     </div>
                  </div>
               ) : (
                  <div className="bg-[#0a0a0c] border border-[#00dc82]/20 rounded-[3rem] w-full max-w-xl overflow-hidden shadow-5xl p-20 text-center relative">
                     <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-12 shadow-[0_0_40px_rgba(16,185,129,0.15)]">
                        <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-black">
                           <CheckCircle2 size={32} strokeWidth={3} />
                        </div>
                     </div>
                     <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-tight mb-6">Project Registry<br />Synchronized</h2>
                     <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.4em] max-w-xs mx-auto leading-relaxed mb-16">
                        Technical requirements have been mapped. 100% traceability achieved via neural vault linking.
                     </p>
                     <button
                        onClick={() => setShowMatrix(true)}
                        className="w-full bg-white text-black py-6 rounded-2xl font-black text-xs uppercase tracking-[0.5em] transition-all hover:bg-emerald-500 hover:text-black shadow-2xl"
                     >
                        Open Requirement Matrix
                     </button>
                     <div className="mt-20 pt-10 border-t border-white/5 flex justify-between items-center opacity-40 font-black uppercase text-[9px] text-zinc-600 tracking-widest">
                        <div className="flex items-center gap-2"><Lock size={12} /> AUTH: L3-EXECUTIVE</div>
                        {isManager && <button onClick={handleReset} className="text-rose-500 hover:text-rose-400">Hard Reset Registry</button>}
                     </div>
                  </div>
               )}
            </div>
         ) : (
            <div className="animate-in slide-in-from-right-10 duration-700">
               <TenderChecklistTracker tenderId={tender.id} />
            </div>
         )}

         {showWizard && (
            <TenderIntakeWizard
               tenderId={tender.id}
               initialTemplate={initialTemplate}
               onComplete={() => {
                  setShowWizard(false);
                  setHasChecklist(true);
                  setShowMatrix(true);
               }}
               onCancel={() => setShowWizard(false)}
            />
         )}
      </div>
   );
};
