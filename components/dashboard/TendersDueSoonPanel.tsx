import React from 'react';
import { Clock, Briefcase, ChevronRight, AlertCircle } from 'lucide-react';
import type { Tender } from '../../types';

interface TendersDueSoonPanelProps {
  tenders: Tender[];
}

export const TendersDueSoonPanel: React.FC<TendersDueSoonPanelProps> = ({ tenders }) => {
  const upcomingTenders = tenders
    .filter(t => {
      if (!t.submission_deadline) return false;
      const days = Math.ceil((new Date(t.submission_deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return days >= 0 && days <= 30;
    })
    .sort((a, b) => new Date(a.submission_deadline!).getTime() - new Date(b.submission_deadline!).getTime())
    .slice(0, 5);

  return (
    <div className="bg-zinc-900/50 backdrop-blur-md border border-glass rounded-xl p-6 shadow-xl flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Clock size={16} className="text-[var(--color-warning)]" />
          <h4 className="text-xs font-bold italic text-zinc-500">Pipeline_Urgency</h4>
        </div>
        <span className="text-xs font-bold italic text-zinc-600 bg-glass px-3 py-1 rounded-full border border-glass">
          {upcomingTenders.length} Critical
        </span>
      </div>

      <div className="flex-1 space-y-6">
        {upcomingTenders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30">
            <Briefcase size={32} className="mb-4 text-zinc-500" />
            <p className="text-xs font-bold italic text-zinc-600">No Imminent Deadlines</p>
          </div>
        ) : (
          upcomingTenders.map(t => {
            const daysLeft = Math.ceil((new Date(t.submission_deadline!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            return (
              <div key={t.id} className="group cursor-pointer border-b border-glass pb-4 last:border-0 hover:bg-glass-subtle -mx-4 px-4 rounded-xl transition-all">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h5 className="text-[11px] font-bold italic text-white tracking-wider group-hover:text-[var(--color-warning)] transition-colors line-clamp-1">{t.title}</h5>
                    <p className="text-xs font-bold italic text-zinc-600 mt-1">{t.client}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-xl font-bold italic font-mono tracking-tighter ${daysLeft <= 7 ? 'text-[var(--color-critical)]' : 'text-zinc-300'}`}>
                      {daysLeft}D
                    </span>
                  </div>
                </div>
                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full ${daysLeft <= 7 ? 'bg-[var(--color-critical)]' : 'bg-[var(--color-warning)]'}`}
                    style={{ width: `${Math.max(5, 100 - (daysLeft * 3))}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
