
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Wand2, Loader2, Lock, CheckCircle2, Layers, FileText } from 'lucide-react';
import { Watermark } from '../Watermark';
import { TenderIntakeWizard } from './TenderIntakeWizard';
import { TenderChecklistTracker } from './TenderChecklistTracker';
import { CommsLog } from './CommsLog';
import { RequirementsChecklist } from './RequirementsChecklist';
import { supabase } from '../../lib/supabase';
import { useUserTier } from '../../hooks/useUserTier';
import { GlassButton } from '../ui/GlassButton';

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
   const [commsEvents, setCommsEvents] = useState<any[]>([]);
   const [requirements, setRequirements] = useState<any[]>([]);
   const [isExtracting, setIsExtracting] = useState(false);

   const { hasPermission } = useUserTier();
   const isManager = hasPermission('L3');

   useEffect(() => {
      if (!tender?.id) return;
      const checkRequirementsAndFetchComms = async () => {
         setChecking(true);
         try {
            const { count } = await (supabase.from('tasks' as any) as any).select('*', { count: 'exact', head: true }).eq('tender_id', tender.id);
            setHasChecklist(count && count > 0);
            if (count && count > 0) setShowMatrix(true);

            const { data: commsData, error: commsError } = await (supabase.from('tender_comms_events' as any) as any).select('*').eq('tender_id', tender.id).order('event_at', { ascending: false });
            if (commsError) throw commsError;
            setCommsEvents(commsData || []);
         } catch (err) {
            console.error('Failed to fetch tender details:', err);
         } finally {
            setChecking(false);
         }
      };
      checkRequirementsAndFetchComms();
   }, [tender?.id]);

   const handleAddComms = async (newEvent: any) => {
      const mockEvent = { id: new Date().toISOString(), tender_id: tender.id, logged_by_user_id: 'mock-user', event_at: new Date().toISOString(), ...newEvent };
      setCommsEvents(prev => [mockEvent, ...prev]);
   };

   const handleExtractRequirements = async () => {
      if (!tender?.id) return;
      setIsExtracting(true);
      try {
         const res = await fetch(`/api/documents/${tender.id}/extract-requirements`, { method: 'POST' });
         if (!res.ok) throw new Error('Extraction API failed');
         const data = await res.json();
         setRequirements(data.requirements || []);
      } catch (error) {
         console.error("Extraction failed", error);
         alert('Failed to extract requirements.');
      } finally {
         setIsExtracting(false);
      }
   };

   const handleReset = async () => {
      if (!window.confirm('Reset checklist?')) return;
      setResetting(true);
      try {
         await (supabase as any).rpc('reset_tender_checklist', { target_tender_id: tender.id });
         setHasChecklist(false);
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

   if (!tender) return <div>Tender not found.</div>;
   if (checking) return <Loader2 className="animate-spin" />;

   return (
      <div className="space-y-8 animate-fade-in pb-10 font-sans relative min-h-screen">
         <Watermark />
         <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <div className="flex items-center space-x-6">
               <button onClick={onBack} className="p-2 bg-white/5 border border-white/10 rounded-xl"><ArrowLeft size={18} /></button>
               <div>
                  <h1 className="text-2xl font-bold italic text-white">{tender.title}</h1>
               </div>
            </div>
            {showMatrix && <button onClick={() => setShowMatrix(false)}>Return to Setup</button>}
         </div>

         {!showMatrix ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 space-y-6">
                  <div className="min-h-[65vh] flex items-center justify-center">
                     {!hasChecklist ? (
                        <div>
                           <h2 className="text-3xl font-bold italic text-white">Intake Calibration Required</h2>
                           <GlassButton onClick={() => handleStartWizard()}>Initialize Calibration</GlassButton>
                        </div>
                     ) : (
                        <div>
                           <h2 className="text-3xl font-bold italic text-white">Project Registry Synchronized</h2>
                           <GlassButton onClick={() => setShowMatrix(true)}>Open Requirement Matrix</GlassButton>
                        </div>
                     )}
                  </div>
                  <div className="space-y-4">
                     <GlassButton onClick={handleExtractRequirements} disabled={isExtracting} className="w-full justify-center">
                        {isExtracting ? 'Analyzing Document...' : 'Extract Requirements from Document'}
                     </GlassButton>
                     {requirements.length > 0 && <RequirementsChecklist requirements={requirements} />}
                  </div>
               </div>
               <div className="lg:col-span-1">
                  <CommsLog tenderId={tender.id} commsEvents={commsEvents} onAddComms={handleAddComms} />
               </div>
            </div>
         ) : (
            <TenderChecklistTracker tenderId={tender.id} />
         )}

         {showWizard && (
            <TenderIntakeWizard
               tenderId={tender.id}
               initialTemplate={initialTemplate}
               onComplete={() => { setShowWizard(false); setHasChecklist(true); setShowMatrix(true); }}
               onCancel={() => setShowWizard(false)}
            />
         )}
      </div>
   );
};
