import React from 'react';
import { Gavel, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface TendersModuleProps {
  tenders: any[];
}

export const TendersModule: React.FC<TendersModuleProps> = ({ tenders }) => {
  const safeTenders = tenders || [];
  return (
    <Card title="Tender Tracker" icon={Gavel} className="h-full motion-entry">
      <div className="flex flex-col divide-y divide-[var(--surface-border)]">
        {safeTenders.map((tender) => (
          <div
            key={tender.id}
            className="p-4 hover:bg-white/5 transition-colors group flex items-center justify-between"
          >
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-[var(--surface-base)] border border-[var(--surface-border)] text-zinc-600 rounded">
                <TrendingUp size={14} />
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-white transition-colors font-brand group-hover:text-white">
                  {tender.title}
                </h4>
                <div className="flex items-center space-x-3 mt-1 text-[9px] font-black uppercase tracking-widest text-zinc-500 font-brand">
                  <span className="text-zinc-500 font-bold">{tender.client}</span>
                  <span className="w-1 h-1 rounded-full bg-[var(--surface-border)]"></span>
                  <span className="flex items-center text-zinc-600">
                    <Clock size={10} className="mr-1.5 opacity-50" />
                    {tender.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-black text-white tabular-nums font-mono">
                  AED {(tender.value || 0).toLocaleString()}
                </p>
                <div className="flex items-center justify-end space-x-2 mt-1">
                  <span className="text-[8px] text-zinc-600 font-black uppercase tracking-tighter font-sans">Win Prob:</span>
                  <span className={`text-[8px] font-black uppercase tracking-widest font-mono ${tender.probability === 'High' ? 'text-[var(--color-success)]' :
                    tender.probability === 'Medium' ? 'text-[var(--color-warning)]' : 'text-[var(--color-critical)]'
                    }`}>{tender.probability}</span>
                </div>
              </div>
              <Badge status={tender.status === 'Pre-Award' ? 'Success' : 'Pending'}>{tender.status}</Badge>
            </div>
          </div>
        ))}
        {tenders.length === 0 && (
          <div className="p-8 text-center text-zinc-600 text-[10px] font-black uppercase tracking-widest font-brand">
            Idle Hub • No Active Signals
          </div>
        )}
      </div>
    </Card>
  );
};
