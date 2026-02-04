import React, { useState } from 'react';
import { FileText, CheckSquare, ArrowRight, Layers, Wand2, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useSupabase } from '../../hooks/useSupabase';

const TEMPLATES = [
    {
        id: 'RFP',
        name: 'STANDARD CONSTRUCTION RFP',
        sections: [
            { title: 'Volume 1: Commercial', items: ['Form of Tender', 'Trade License', 'Bond', 'Pricing Schedule'] },
            { title: 'Volume 2: Technical', items: ['Method Statement', 'HSE Plan', 'Project Schedule', 'Resources'] }
        ]
    },
    {
        id: 'DESIGN_BUILD',
        name: 'DESIGN & BUILD',
        sections: [
            { title: 'Design', items: ['Concept Drawings', 'BIM Execution Plan'] },
            { title: 'Commercial', items: ['Lump Sum Breakdown'] }
        ]
    }
];

interface TenderIntakeWizardProps {
    tenderId: string;
    tenderTitle?: string;
    clientName?: string;
    initialTemplate?: string;
    onComplete: () => void;
    onCancel: () => void;
}

export const TenderIntakeWizard: React.FC<TenderIntakeWizardProps> = ({ tenderId, tenderTitle, clientName, initialTemplate, onComplete, onCancel }) => {
    const [step, setStep] = useState(initialTemplate ? 2 : 1);
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(initialTemplate || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { getClient } = useSupabase();

    const handleGenerate = async () => {
        if (!selectedTemplate || !tenderId) return;
        setLoading(true);
        setError(null);

        try {
            const client = await getClient();
            const { error } = await (client.rpc as any)('generate_tender_checklist', {
                target_tender_id: tenderId,
                template_type: selectedTemplate
            });
            if (error) throw error;

            // Artificial delay for specific "CALIBRATING..." effect
            setTimeout(() => {
                setLoading(false);
                setStep(3); // Move to success step
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Failed to initialize checklist nodes.');
            setLoading(false);
        }
    };

    const template = TEMPLATES.find(t => t.id === selectedTemplate);

    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
            <div className={`border border-white/5 w-full max-w-4xl rounded-3xl shadow-5xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 transition-all ${step === 3 ? 'bg-black scale-105 border-emerald-500/20' : 'bg-[var(--surface-base)]'}`}>

                {/* Header - Dynamic based on Step */}
                <div className="bg-zinc-900/10 p-8 border-b border-white/5 flex justify-between items-start">
                    <div>
                        {tenderTitle ? (
                            <>
                                <h2 className="text-xl font-bold italic text-white tracking-tighter mb-1">{tenderTitle}</h2>
                                <p className="text-[10px] text-zinc-500 font-bold italic tracking-[0.3em]">
                                    Client: <span className="text-white">{clientName || 'Unknown'}</span> | Priority: <span className="text-emerald-500">High</span>
                                </p>
                            </>
                        ) : (
                            <p className="text-[10px] font-bold italic tracking-[0.4em] text-zinc-500">Registry Calibration Framework v2.0</p>
                        )}
                    </div>
                    {step !== 3 && (
                        <button onClick={onCancel} className="text-zinc-600 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-12 min-h-[500px] bg-black/40 flex flex-col relative">
                    {error && (
                        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center gap-3 rounded-lg">
                            <AlertTriangle size={18} />
                            <span className="text-[10px] font-bold italic tracking-widest">{error}</span>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h4 className="text-[11px] font-bold italic tracking-[0.3em] text-zinc-400 mb-8 flex items-center gap-3">
                                    <span className="w-6 h-px bg-zinc-700"></span>
                                    Select Template Framework
                                    <span className="w-6 h-px bg-zinc-700"></span>
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {TEMPLATES.map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => setSelectedTemplate(t.id)}
                                            className={`p-10 rounded-2xl border transition-all text-left group relative overflow-hidden ${selectedTemplate === t.id
                                                ? 'border-emerald-500 bg-emerald-500/[0.03] shadow-[0_0_30px_rgba(16,185,129,0.1)]'
                                                : 'border-white/5 bg-zinc-900/40 hover:border-zinc-700'
                                                }`}
                                        >
                                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-8 border transition-all ${selectedTemplate === t.id ? 'bg-emerald-500 text-black border-emerald-500 shadow-lg scale-110' : 'bg-zinc-900 text-zinc-600 border-white/5 group-hover:bg-zinc-800 group-hover:text-zinc-400'
                                                }`}>
                                                <Layers size={24} strokeWidth={selectedTemplate === t.id ? 2.5 : 2} />
                                            </div>
                                            <h5 className={`text-base font-bold italic tracking-widest leading-tight mb-4 ${selectedTemplate === t.id ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>{t.name}</h5>
                                            <p className="text-[10px] font-mono text-zinc-600 tracking-widest font-bold italic group-hover:text-zinc-500 transition-colors">
                                                {t.sections.length} Clusters • {t.sections.reduce((acc, s) => acc + s.items.length, 0)} Nodes
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && template && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500 h-full flex flex-col">
                            <h4 className="text-[11px] font-bold italic tracking-[0.3em] text-zinc-400 flex items-center gap-3">
                                <span className="w-6 h-px bg-zinc-700"></span>
                                Review Requirements Structure
                                <span className="w-6 h-px bg-zinc-700"></span>
                            </h4>
                            <div className="bg-black border border-white/5 rounded-xl p-8 overflow-y-auto custom-scrollbar flex flex-col divide-y divide-zinc-900 shadow-inner flex-1">
                                {template.sections.map((section, idx) => (
                                    <div key={idx} className="py-6 first:pt-0 last:pb-0">
                                        <h5 className="text-emerald-500 font-bold italic text-[10px] mb-5 tracking-[0.2em] flex items-center">
                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-3 shadow-[0_0_8px_var(--color-success)]"></div>
                                            {section.title}
                                        </h5>
                                        <div className="space-y-3 ml-6">
                                            {section.items.map((item, i) => (
                                                <div key={i} className="flex items-center text-[10px] font-mono font-bold italic text-zinc-500 tracking-tight group hover:text-zinc-200 transition-colors cursor-default">
                                                    <div className="w-1 h-1 bg-zinc-800 rounded-full mr-3 group-hover:bg-emerald-500 transition-colors"></div>
                                                    {item}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="flex flex-col items-center justify-center h-full animate-in zoom-in-95 duration-700 space-y-10 py-10">

                            {/* Success Icon */}
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.2)] animate-pulse">
                                    <CheckCircle2 size={40} className="text-emerald-500" strokeWidth={3} />
                                </div>
                                <div className="absolute inset-0 border border-emerald-500 rounded-full animate-ping opacity-20"></div>
                            </div>

                            <div className="text-center space-y-4">
                                <h2 className="text-4xl font-bold italic text-white tracking-tighter">
                                    Project Registry<br />Synchronized
                                </h2>
                                <p className="text-[10px] font-bold italic text-zinc-500 tracking-[0.2em] max-w-sm mx-auto leading-relaxed">
                                    Technical requirements have been mapped. 100% traceability achieved via Neural Vault Linking.
                                </p>
                            </div>

                            <div className="pt-8">
                                <button
                                    onClick={onComplete}
                                    className="bg-white text-black hover:bg-zinc-200 px-12 py-4 rounded-xl text-xs font-bold italic tracking-[0.25em] shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all hover:scale-105"
                                >
                                    Open Requirement Matrix
                                </button>
                            </div>

                            <div className="absolute bottom-0 w-full flex justify-between items-center pt-12 opacity-50">
                                <span className="text-[9px] font-mono text-zinc-600 tracking-widest font-bold italic flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-zinc-800"></span> Auth: L3-Executive
                                </span>
                                <button className="text-[9px] font-bold italic text-rose-900/50 hover:text-rose-500 tracking-widest transition-colors">
                                    Hard Reset Registry
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {step < 3 && (
                    <div className="p-8 border-t border-white/5 flex justify-between items-center bg-zinc-900/30 backdrop-blur-md">
                        <span className="text-[10px] font-bold italic text-zinc-600 tracking-[0.4em]">Step 0{step} / 02</span>
                        <div className="flex items-center gap-4">
                            {step > 1 && (
                                <button
                                    onClick={() => setStep(step - 1)}
                                    className="text-zinc-500 hover:text-white px-6 py-2 text-[10px] font-bold italic tracking-widest transition-all hover:-translate-x-1"
                                >
                                    Back
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    if (step === 1 && selectedTemplate) setStep(2);
                                    else if (step === 2) handleGenerate();
                                }}
                                disabled={!selectedTemplate || loading}
                                className={`
                            px-10 py-3 rounded-lg text-[10px] font-bold italic tracking-[0.2em] flex items-center shadow-2xl transition-all disabled:opacity-30 disabled:cursor-not-allowed
                            ${loading
                                        ? 'bg-zinc-800 text-zinc-500 cursor-wait'
                                        : 'bg-[var(--color-success)] text-black hover:bg-emerald-400 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,220,130,0.4)]'
                                    }
                        `}
                            >
                                {loading ? 'CALIBRATING...' : step === 1 ? 'Execute Mapping' : 'Initialize Checklist'}
                                {!loading && <ArrowRight size={14} className="ml-3" />}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
