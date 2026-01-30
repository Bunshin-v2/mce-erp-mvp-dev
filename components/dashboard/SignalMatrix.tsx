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
                className="w-full max-w-4xl bg-[#1e293b]/90 border border-[var(--color-info)]/20 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col max-h-full overflow-hidden animate-in slide-in-from-top-4 duration-500"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search Header */}
                <div className="p-8 border-b border-glass flex items-center justify-between bg-glass">
                    <div className="flex items-center space-x-6">
                        <div className="p-3 bg-[var(--color-info)]/10 rounded-xl border border-[var(--color-info)]/30">
                            <Search className="text-[var(--color-info)]" size={24} />
                        </div>
                        <div>
                            <h2 className="type-personality type-hero italic tracking-[0.2em] text-white">
                                Signal Matrix <span className="type-caption type-personality-soft text-[var(--color-info)]/80 ml-2 text-sm not-italic font-mono">v0.1</span>
                            </h2>
                            <p className="type-caption type-personality-soft text-slate-400 uppercase tracking-[0.4em] mt-1">
                                Cross-Module Query Results for: <span className="text-white">"{query}"</span>
                            </p>
                        </div>

                    </div>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-glass hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold italic text-slate-400 hover:text-white transition-all"
                    >
                        Close Shield
                    </button>
                </div>

                {/* Results Matrix */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {totalResults === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 opacity-30 grayscale">
                            <Database size={64} className="mb-6" />
                            <p className="type-caption type-personality-soft uppercase tracking-[0.4em]">
                                No Cluster Matches Detected
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Projects Column */}
                            {results.projects.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="type-title type-personality-soft uppercase tracking-[0.35em] text-[var(--color-info)] mb-4 flex items-center gap-2">
                                        <Briefcase size={14} className="" /> Projects ({results.projects.length})
                                    </h3>
                                    {results.projects.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => onNavigate('projects', p.id)}
                                            className="w-full text-left p-4 bg-glass border border-glass rounded-xl hover:bg-white/10 hover:border-[var(--color-info)]/30 transition-all group"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-bold italic text-slate-500 font-mono tracking-tighter">{p.project_code}</span>
                                                <ArrowRight size={14} className="text-slate-700 group-hover:text-[var(--color-info)] -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                                            </div>
                                            <p className="text-sm font-bold italic text-white group-hover:text-[var(--color-info)] transition-colors">{p.project_name}</p>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Tenders Column */}
                            {results.tenders.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="type-title type-personality-soft uppercase tracking-[0.35em] text-amber-500 mb-4 flex items-center gap-2">
                                        <Zap size={14} className="" /> Tenders ({results.tenders.length})
                                    </h3>
                                    {results.tenders.map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => onNavigate('tenders', t.id)}
                                            className="w-full text-left p-4 bg-glass border border-glass rounded-xl hover:bg-white/10 hover:border-amber-500/30 transition-all group"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-bold italic text-slate-500 font-mono tracking-tighter">{t.client}</span>
                                                <ArrowRight size={14} className="text-slate-700 group-hover:text-amber-500 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                                            </div>
                                            <p className="text-sm font-bold italic text-white group-hover:text-amber-400 transition-colors">{t.title}</p>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Documents Column */}
                            {results.documents.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="type-title type-personality-soft uppercase tracking-[0.35em] text-blue-500 mb-4 flex items-center gap-2">
                                        <FileText size={14} className="" /> Documents ({results.documents.length})
                                    </h3>
                                    {results.documents.map(d => (
                                        <button
                                            key={d.id}
                                            onClick={() => onNavigate('documents', d.id)}
                                            className="w-full text-left p-4 bg-glass border border-glass rounded-xl hover:bg-white/10 hover:border-blue-500/30 transition-all group"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-bold italic text-slate-500 font-mono tracking-tighter">{d.type}</span>
                                                <ArrowRight size={14} className="text-slate-700 group-hover:text-blue-400 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                                            </div>
                                            <p className="text-sm font-bold italic text-white group-hover:text-blue-300 transition-colors">{d.title}</p>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Tasks Column */}
                            {results.tasks.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="type-title type-personality-soft uppercase tracking-[0.35em] text-emerald-500 mb-4 flex items-center gap-2">
                                        <CheckCircle2 size={14} className="" /> Action Items ({results.tasks.length})
                                    </h3>
                                    {results.tasks.map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => onNavigate('tasks', null)}
                                            className="w-full text-left p-4 bg-glass border border-glass rounded-xl hover:bg-white/10 hover:border-emerald-500/30 transition-all group"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-bold italic text-slate-500 font-mono tracking-tighter">{t.status}</span>
                                                <ArrowRight size={14} className="text-slate-700 group-hover:text-emerald-400 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                                            </div>
                                            <p className="text-sm font-bold italic text-white group-hover:text-emerald-300 transition-colors">{t.title}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Metrics */}
                <div className="p-6 bg-black/40 border-t border-glass flex items-center justify-between text-xs font-bold italic text-slate-600 font-mono">
                    <div className="flex items-center space-x-6">
                        <span>Cluster Density: {totalResults > 10 ? 'HIGH' : 'NOMINAL'}</span>
                        <span>Sync TTL: 240ms</span>
                    </div>
                    <div className="text-[var(--color-info)]">MATRIX ALPHA READY</div>
                </div>
            </div>
        </div>
    );
};

