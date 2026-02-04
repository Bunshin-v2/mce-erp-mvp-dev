import React from 'react';
import { GlassPanel } from '../ui/GlassPanel';
import { Badge } from '../ui/Badge';
import { Tender } from '../../types';
import { MoreHorizontal, DollarSign, Calendar, Clock } from 'lucide-react';

interface TenderKanbanProps {
    tenders: Tender[];
    onSelectTender: (id: string) => void;
}

const COLUMNS = [
    { id: 'OPEN', label: 'Intake' },
    { id: 'REVIEW', label: 'Go / No-Go' },
    { id: 'SUBMITTED', label: 'Submission' },
    { id: 'AWARDED', label: 'Awarded' }
];

export const TenderKanban: React.FC<TenderKanbanProps> = ({ tenders, onSelectTender }) => {

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
                                <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-brand">
                                    {col.label}
                                </span>
                                <span className="bg-zinc-800 text-zinc-500 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
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
                                <GlassPanel
                                    key={tender.id}
                                    variant="base"
                                    className="p-4 cursor-pointer hover:border-[var(--mce-primary)]/50 group transition-all"
                                    onClick={() => onSelectTender(tender.id)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge status={tender.status}>{tender.status}</Badge>
                                        <button className="text-zinc-600 hover:text-white transition-colors">
                                            <MoreHorizontal size={14} />
                                        </button>
                                    </div>

                                    <h4 className="text-sm font-bold text-zinc-200 mb-1 line-clamp-2 leading-tight group-hover:text-white transition-colors">
                                        {tender.title}
                                    </h4>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-3">
                                        {tender.client}
                                    </p>

                                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                        <div className="flex items-center gap-1.5 text-emerald-400">
                                            <DollarSign size={12} />
                                            <span className="text-xs font-mono font-bold">
                                                {(Number(tender.value) || 0).toLocaleString(undefined, { notation: 'compact' })}
                                            </span>
                                        </div>

                                        {tender.probability && (
                                            <div className={`text-[9px] font-bold uppercase tracking-tight px-1.5 py-0.5 rounded ${tender.probability === 'High' ? 'bg-emerald-500/10 text-emerald-500' :
                                                    tender.probability === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
                                                        'bg-rose-500/10 text-rose-500'
                                                }`}>
                                                {tender.probability}
                                            </div>
                                        )}
                                    </div>
                                </GlassPanel>
                            ))}
                        </div>
                    </div>
                )
            })}
        </div>
    );
};
