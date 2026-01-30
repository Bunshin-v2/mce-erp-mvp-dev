import React, { useState } from 'react';
import { DocumentItem } from '../../types';
import { Badge } from '../ui/Badge';
import { FileText, ChevronDown, Check, SlidersHorizontal, MoreHorizontal, Loader2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { agentTaskWriter } from '../../utils/agent';

interface DocumentsModuleProps {
  documents: DocumentItem[];
  loading: boolean;
  onRefresh: () => void;
}

type SortOption = 'newest' | 'oldest' | 'type';

export const DocumentsModule: React.FC<DocumentsModuleProps> = ({ documents, loading, onRefresh }) => {
  const [sortOrder, setSortOrder] = useState<SortOption>('newest');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleReview = async (id: string) => {
    setProcessingId(id);
    try {
      await agentTaskWriter.reviewDocument(id, 'Reviewed');
      onRefresh(); // Trigger re-fetch
    } catch (error) {
      console.error("Agent failed to review:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const getSortValue = (doc: DocumentItem) => {
    return new Date(doc.created_at).getTime();
  };

  const sortedDocuments = [...documents].sort((a, b) => {
    if (sortOrder === 'type') {
      return a.type.localeCompare(b.type);
    }

    const timeA = getSortValue(a);
    const timeB = getSortValue(b);

    return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
  });

  return (
    <Card
      title="Recent Document Flow"
      icon={FileText}
      className="motion-entry"
      action={
        <div className="flex items-center space-x-6">
          <div className="relative">
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center space-x-2 text-[9px] font-black text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-widest"
            >
              <SlidersHorizontal size={10} />
              <span>Ordering</span>
              <ChevronDown size={10} />
            </button>

            {isSortOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsSortOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--surface-base)] rounded border border-[var(--surface-border)] z-20 py-1 overflow-hidden shadow-2xl">
                  <div className="px-3 py-2 text-[8px] uppercase font-black text-zinc-600 bg-[var(--surface-layer)] tracking-widest">
                    Sequence Order
                  </div>
                  {[
                    { id: 'newest', label: 'Chronological: Newest' },
                    { id: 'oldest', label: 'Chronological: Oldest' },
                    { id: 'type', label: 'Categorical' },
                  ].map(option => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setSortOrder(option.id as SortOption);
                        setIsSortOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-[10px] flex items-center justify-between hover:bg-[var(--surface-layer)] transition-colors ${sortOrder === option.id ? 'text-zinc-50 font-black bg-[var(--surface-layer)]' : 'text-zinc-500 font-bold'
                        }`}
                    >
                      <span className="uppercase tracking-widest">{option.label}</span>
                      {sortOrder === option.id && <Check size={10} />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="h-3 w-[1px] bg-[var(--surface-border)]" />
          <button className="text-[9px] text-zinc-500 hover:text-zinc-200 font-black uppercase tracking-widest transition-colors">
            Expand Flow
          </button>
        </div>
      }
    >
      <div className="flex flex-col divide-y divide-[var(--surface-border)]">
        {loading && documents.length === 0 ? (
          <div className="p-12 flex justify-center">
            <Loader2 size={16} className="animate-spin text-[var(--color-info)]" />
          </div>
        ) : sortedDocuments.map(doc => (
          <div
            key={doc.id}
            className="px-8 py-4 hover:bg-white/5 transition-colors flex justify-between items-center group cursor-pointer"
          >
            <div className="flex items-start space-x-5">
              <div className={`p-2 rounded border border-[var(--surface-border)] bg-[var(--surface-base)] ${doc.type === 'COMPLIANCE' ? 'text-[var(--color-warning)]' :
                doc.type === 'CONTRACT' ? 'text-zinc-500' :
                  doc.type === 'INVOICE' ? 'text-[var(--color-success)]' :
                    'text-zinc-700'
                }`}>
                <FileText size={14} />
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-zinc-100 group-hover:text-white transition-colors tracking-tight font-brand">{doc.title}</h4>
                <div className="flex items-center space-x-3 mt-1.5 font-brand">
                  <span className="text-[9px] uppercase font-black text-zinc-500 tracking-[0.2em]">
                    {doc.type}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-[var(--surface-border)]"></span>
                  <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest tabular-nums font-mono">{doc.date}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              {doc.status === 'Review' ? (
                <button
                  onClick={() => handleReview(doc.id)}
                  disabled={processingId === doc.id}
                  className="text-[9px] bg-white text-zinc-950 px-3 py-1 rounded-sm font-black uppercase tracking-widest hover:bg-[var(--surface-elevated)] hover:text-white transition-all disabled:opacity-50 shadow-lg font-brand"
                >
                  {processingId === doc.id && <Loader2 size={10} className="animate-spin mr-1.5" />}
                  Determination
                </button>
              ) : (
                <Badge status={doc.status}>{doc.status}</Badge>
              )}
              <button className="text-zinc-700 hover:text-zinc-400 p-1 rounded transition-colors opacity-0 group-hover:opacity-100">
                <MoreHorizontal size={14} />
              </button>
            </div>
          </div>
        ))}
        {!loading && sortedDocuments.length === 0 && (
          <div className="p-8 text-center text-zinc-600 font-bold text-[10px] uppercase tracking-widest bg-zinc-950/20">
            [NULL-SET] / NO ACTIVE SIGNALS
          </div>
        )}
      </div>
    </Card>
  );
};

