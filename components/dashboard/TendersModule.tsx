import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { FileText, TrendingUp } from 'lucide-react';

interface TendersModuleProps {
  tenders?: any[];
}

export const TendersModule: React.FC<TendersModuleProps> = ({ tenders = [] }) => {
  return (
    <Card className="h-full bg-zinc-900/50 backdrop-blur-md border-zinc-800/50" padding="none">
      <CardHeader className="px-6 py-4 border-b border-glass">
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-zinc-500" />
          <CardTitle>TENDER TRACKER</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="divide-y divide-zinc-800/50 flex-col h-full overflow-y-auto custom-scrollbar">
        {tenders.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-xs font-bold italic opacity-50">No Active Signals</div>
        ) : (
          tenders.map((tender) => (
            <div key={tender.id} className="p-4 hover:bg-glass-subtle transition-colors group cursor-pointer border-l-2 border-transparent hover:border-emerald-500">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800 group-hover:border-zinc-700 transition-colors">
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
                        <span className="font-mono text-zinc-400">{tender.status.toUpperCase()}</span>
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
                    className={`text-xs tracking-wider font-mono px-2 py-1 rounded ${
                      (tender.winProbability || tender.probability) === 'High'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : (tender.winProbability || tender.probability) === 'Medium'
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-rose-500/10 text-rose-500'
                    }`}
                  >
                  {(tender.winProbability || tender.probability || 'Medium')} Prob
                </span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

