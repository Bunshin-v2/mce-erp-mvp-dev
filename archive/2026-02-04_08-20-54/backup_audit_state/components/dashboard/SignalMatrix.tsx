import React from 'react';
import { Search, Briefcase, FileText, CheckCircle2, Zap, ArrowRight, Database } from 'lucide-react';

interface SignalMatrixProps {
    query: string;
    results: {
        projects: any[];
        tenders: any[];
        documents: any[];
        tasks: any[];
    };
    onClose: () => void;
    onNavigate: (view: string, id: string | null) => void;
}

export const SignalMatrix: React.FC<SignalMatrixProps> = ({ query, results, onClose, onNavigate }) => {
    if (!query) return null;

    const totalResults = results.projects.length + results.tenders.length + results.documents.length + results.tasks.length;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 pb-20 px-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-300">
            <div
                className="w-full max-w-4xl bg-[#1e293b]/90 border border-[#33CCCC]/20 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col max-h-full overflow-hidden animate-in slide-in-from-top-4 duration-500"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <div className="flex items-center space-x-6">
                        <div className="p-3 bg-[#33CCCC]/10 rounded-2xl border border-[#33CCCC]/30">
                            <Search className="text-[#33CCCC]" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white tracking-widest uppercase font-brand">Signal Matrix <span className="text-[#33CCCC]/40 ml-2">v0.1</span></h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Cross-Module Query Results for: <span className="text-white">"{query}"</span></p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all"
                    >
                        Close Shield
                    </button>
                </div>

                {/* Results Matrix */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {totalResults === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 opacity-30 grayscale">
                            <Database size={64} className="mb-6" />
                            <p className="text-[11px] font-black uppercase tracking-[0.5em]">No Cluster Matches Detected</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Projects Column */}
                            {results.projects.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#33CCCC] mb-4 flex items-center">
                                        <Briefcase size={14} className="mr-2" /> Projects ({results.projects.length})
                                    </h3>
                                    {results.projects.map(p => (
                                        <button
                                            key={p.ID}
                                            onClick={() => onNavigate('projects', p.ID)}
                                            className="w-full text-left p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-[#33CCCC]/30 transition-all group"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[9px] font-black text-slate-500 font-mono tracking-tighter uppercase">{p.PROJECT_CODE}</span>
                                                <ArrowRight size={14} className="text-slate-700 group-hover:text-[#33CCCC] -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                                            </div>
                                            <p className="text-sm font-bold text-white group-hover:text-[#33CCCC] transition-colors">{p.PROJECT_NAME}</p>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Tenders Column */}
                            {results.tenders.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 mb-4 flex items-center">
                                        <Zap size={14} className="mr-2" /> Tenders ({results.tenders.length})
                                    </h3>
                                    {results.tenders.map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => onNavigate('tenders', t.id)}
                                            className="w-full text-left p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-amber-500/30 transition-all group"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[9px] font-black text-slate-500 font-mono tracking-tighter uppercase">{t.client}</span>
                                                <ArrowRight size={14} className="text-slate-700 group-hover:text-amber-500 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                                            </div>
                                            <p className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">{t.title}</p>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Documents Column */}
                            {results.documents.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-4 flex items-center">
                                        <FileText size={14} className="mr-2" /> Documents ({results.documents.length})
                                    </h3>
                                    {results.documents.map(d => (
                                        <button
                                            key={d.id}
                                            onClick={() => onNavigate('documents', d.id)}
                                            className="w-full text-left p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-blue-500/30 transition-all group"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[9px] font-black text-slate-500 font-mono tracking-tighter uppercase">{d.type}</span>
                                                <ArrowRight size={14} className="text-slate-700 group-hover:text-blue-400 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                                            </div>
                                            <p className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">{d.title}</p>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Tasks Column */}
                            {results.tasks.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-4 flex items-center">
                                        <CheckCircle2 size={14} className="mr-2" /> Action Items ({results.tasks.length})
                                    </h3>
                                    {results.tasks.map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => onNavigate('tasks', null)}
                                            className="w-full text-left p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-emerald-500/30 transition-all group"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[9px] font-black text-slate-500 font-mono tracking-tighter uppercase">{t.status}</span>
                                                <ArrowRight size={14} className="text-slate-700 group-hover:text-emerald-400 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                                            </div>
                                            <p className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">{t.title}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Metrics */}
                <div className="p-6 bg-black/40 border-t border-white/5 flex items-center justify-between text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 font-mono">
                    <div className="flex items-center space-x-6">
                        <span>Cluster Density: {totalResults > 10 ? 'HIGH' : 'NOMINAL'}</span>
                        <span>Sync TTL: 240ms</span>
                    </div>
                    <div className="text-[#33CCCC]">MATRIX ALPHA READY</div>
                </div>
            </div>
        </div>
    );
};
