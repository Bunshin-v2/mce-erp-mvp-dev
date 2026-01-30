import React from 'react';
import { TrendingUp } from 'lucide-react';
import { TiltCard } from '@/components/ui/TiltCard';

interface TenderListProps {
    tenders: any[];
    limit?: number;
}

export const TenderList: React.FC<TenderListProps> = ({ tenders, limit }) => {
    if (!tenders || tenders.length === 0) {
        return (
            <div className="p-8 text-center text-zinc-500 text-xs font-bold italic opacity-50">
                No Active Tenders
            </div>
        );
    }

    return (
        <div className="divide-y divide-white/[0.05] flex-col h-full">
            {(limit ? tenders.slice(0, limit) : tenders).map((tender) => (
                <TiltCard
                    key={tender.id}
                    className="p-4 hover:bg-glass-subtle group cursor-pointer border-l-2 border-transparent hover:border-emerald-500 relative"
                    maxRotation={2}
                    scale={1.01}
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-zinc-900/50 rounded-lg border border-glass group-hover:border-white/[0.1] transition-colors">
                                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                            </div>
                            <div>
                                <h4 className="text-[13px] font-bold italic text-zinc-200 group-hover:text-white transition-colors">{tender.title}</h4>
                                <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                                    <span className="tracking-wider font-bold italic">{tender.client}</span>
                                    <span className="text-zinc-700">•</span>
                                    <span className="flex items-center gap-1.5">
                                        <div className={`w-1 h-1 rounded-full ${tender.status === 'Pre-Award' ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]' :
                                            tender.status === 'Tender Stage' ? 'bg-amber-500' : 'bg-rose-500'
                                            }`} />
                                        <span className="font-mono text-zinc-400">{tender.status ? tender.status.toUpperCase() : 'UNKNOWN'}</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-mono font-bold italic text-zinc-100 group-hover:text-emerald-400 transition-colors">
                                AED {(tender.value / 1000000).toFixed(1)}M
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pl-[3.25rem]">
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                                <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-900 flex items-center justify-center text-xs text-zinc-500">AB</div>
                                <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-900 flex items-center justify-center text-xs text-zinc-500">MC</div>
                            </div>
                            <span className="text-xs text-zinc-600 font-bold italic">+3 Team</span>
                        </div>
                        <span
                            className={`text-xs tracking-wider font-mono px-2 py-1 rounded ${(tender.winProbability || tender.probability) === 'High'
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : (tender.winProbability || tender.probability) === 'Medium'
                                    ? 'bg-amber-500/10 text-amber-500'
                                    : 'bg-rose-500/10 text-rose-500'
                                }`}
                        >
                            {(tender.winProbability || tender.probability || 'Medium')} Prob
                        </span>
                    </div>
                </TiltCard>
            ))}
        </div>
    );
};

