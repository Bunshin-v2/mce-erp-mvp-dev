import React from 'react';
import { GlassPanel } from '../ui/GlassPanel';
import { TiltCard } from '../ui/TiltCard';
import { Badge } from '../ui/Badge';
import { Tender } from '../../types';
import { MoreHorizontal, DollarSign, Calendar, Clock, ChevronRight } from 'lucide-react';

interface TenderKanbanProps {
    tenders: Tender[];
    onSelectTender: (id: string) => void;
    onUpdateStatus?: (id: string, newStatus: string) => void;
}

const COLUMNS = [
    { id: 'OPEN', label: 'Intake' },
    { id: 'REVIEW', label: 'Go / No-Go' },
    { id: 'SUBMITTED', label: 'Submission' },
    { id: 'AWARDED', label: 'Awarded' }
];

export const TenderKanban: React.FC<TenderKanbanProps> = ({ tenders, onSelectTender, onUpdateStatus }) => {
    const [activeOverlay, setActiveOverlay] = React.useState<string | null>(null);

    const getColumnTenders = (status: string) => {
        // Basic mapping - in production this would be more robust
        return tenders.filter(t => {
            if (status === 'OPEN') return t.status === 'OPEN' || t.status === 'ACTIVE';
            if (status === 'REVIEW') return t.status === 'REVIEW' || t.status === 'PENDING';
            if (status === 'SUBMITTED') return t.status === 'SUBMITTED';
            if (status === 'AWARDED') return t.status === 'AWARDED';
            return false;
        });
    };

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-280px)]">
            {COLUMNS.map(col => {
                const items = getColumnTenders(col.id);
                const totalValue = items.reduce((sum, t) => sum + (Number(t.value) || 0), 0);

                return (
                    <div key={col.id} className="min-w-[320px] w-[320px] flex flex-col gap-3">
                        {/* Column Header */}
                        <GlassPanel className="p-3 flex justify-between items-center bg-[var(--surface-base)]/40 sticky top-0 z-10">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold italic tracking-widest text-zinc-400 font-brand">
                                    {col.label}
                                </span>
                                <span className="bg-zinc-800 text-zinc-500 text-[9px] font-bold italic px-1.5 py-0.5 rounded-full">
                                    {items.length}
                                </span>
                            </div>
                            {totalValue > 0 && (
                                <span className="text-[9px] font-mono text-emerald-500/80">
                                    {col.id === 'AWARDED' ? 'WON' : 'EST'}: ${(totalValue / 1000000).toFixed(1)}M
                                </span>
                            )}
                        </GlassPanel>

                        {/* Draggable Area (Visual) */}
                        <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                            {items.map(tender => (
                                <TiltCard
                                    key={tender.id}
                                    onClick={() => onSelectTender(tender.id)}
                                    className={`relative group ${activeOverlay === tender.id ? 'z-50' : ''}`}
                                    maxRotation={3}
                                    scale={1.02}
                                >
                                    <GlassPanel
                                        variant="base"
                                        className="p-4 cursor-pointer hover:border-[var(--mce-primary)]/50 transition-all h-full"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge status={tender.status}>{tender.status}</Badge>
                                            <div className="relative">
                                                <button
                                                    className={`text-zinc-600 hover:text-white transition-colors p-1 rounded-md ${activeOverlay === tender.id ? 'bg-white/10 text-white' : ''}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveOverlay(activeOverlay === tender.id ? null : tender.id);
                                                    }}
                                                >
                                                    <MoreHorizontal size={14} />
                                                </button>

                                                {/* Status Transition Overlay */}
                                                {activeOverlay === tender.id && (
                                                    <div className="absolute right-0 top-full mt-2 w-48 bg-[#0a0a0b] border border-white/10 rounded-lg shadow-2xl z-[100] p-1 backdrop-blur-xl animate-in fade-in zoom-in duration-200">
                                                        <div className="px-2 py-1.5 text-[10px] font-bold italic tracking-widest text-zinc-500 border-b border-white/5 mb-1">
                                                            Change Status
                                                        </div>
                                                        {COLUMNS.filter(c => c.id !== tender.status).map(col => (
                                                            <button
                                                                key={col.id}
                                                                className="w-full text-left px-2 py-2 text-[11px] font-bold italic text-zinc-400 hover:text-white hover:bg-white/5 rounded-md transition-all flex items-center justify-between group/item"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onUpdateStatus?.(tender.id, col.id);
                                                                    setActiveOverlay(null);
                                                                }}
                                                            >
                                                                {col.label}
                                                                <ChevronRight size={10} className="opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <h4 className="text-sm font-bold italic text-zinc-200 mb-1 line-clamp-2 leading-tight group-hover:text-white transition-colors">
                                            {tender.title}
                                        </h4>
                                        <p className="text-[10px] text-zinc-500 font-bold italic tracking-wider mb-3">
                                            {tender.client}
                                        </p>

                                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                            <div className="flex items-center gap-1.5 text-emerald-400">
                                                <DollarSign size={12} />
                                                <span className="text-xs font-mono font-bold italic">
                                                    {(Number(tender.value) || 0).toLocaleString(undefined, { notation: 'compact' })}
                                                </span>
                                            </div>

                                            {tender.probability && (
                                                <div className={`text-[9px] font-bold italic tracking-tight px-1.5 py-0.5 rounded ${tender.probability === 'High' ? 'bg-emerald-500/10 text-emerald-500' :
                                                    tender.probability === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
                                                        'bg-rose-500/10 text-rose-500'
                                                    }`}>
                                                    {tender.probability}
                                                </div>
                                            )}
                                        </div>
                                    </GlassPanel>
                                </TiltCard>
                            ))}
                        </div>
                    </div>
                )
            })}
        </div>
    );
};
