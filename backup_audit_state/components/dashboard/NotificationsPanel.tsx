import React, { useEffect, useState } from 'react';
import { X, Bell, CheckCircle2, AlertTriangle, Clock, ShieldAlert, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isOpen, onClose }) => {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      const fetchAlerts = async () => {
        const { data } = await supabase
          .from('alerts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);
        if (data) setAlerts(data);
      };
      fetchAlerts();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Invisible Backdrop for clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[90]"
          onClick={onClose}
        />
      )}

      {/* Modern Dropdown Panel */}
      {isOpen && (
        <div className="fixed top-16 right-6 z-[100] w-[380px] origin-top-right animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200">
          <div className="bg-[#09090b]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-black/50">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <Bell size={14} className="text-white" />
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[var(--color-critical)] rounded-full animate-pulse shadow-[0_0_8px_var(--color-critical)]"></span>
                </div>
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] font-sans">Signals</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">{alerts.length} New</span>
                <button
                  onClick={onClose}
                  className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/5 rounded-md transition-all"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Content SCROLL AREA */}
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-1.5 space-y-0.5">
              {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-zinc-600">
                  <CheckCircle2 size={24} className="mb-3 opacity-20" />
                  <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">All Systems Nominal</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="group px-4 py-3.5 rounded-xl border border-transparent hover:bg-white/[0.04] hover:border-white/[0.05] transition-all cursor-pointer relative overflow-hidden"
                  >
                    <div className="flex items-start gap-3 relative z-10">
                      <div className={`mt-0.5 p-1 rounded-md border ${alert.severity === 'critical' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                        alert.severity === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                          'bg-blue-500/10 border-blue-500/20 text-blue-500'
                        }`}>
                        {alert.severity === 'critical' ? <ShieldAlert size={12} /> :
                          alert.severity === 'warning' ? <AlertTriangle size={12} /> :
                            <Clock size={12} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wide truncate pr-2 ${alert.severity === 'critical' ? 'text-rose-400' : 'text-zinc-200'
                            }`}>
                            {alert.title || 'System Alert'}
                          </span>
                          <span className="text-[8px] font-mono text-zinc-600 whitespace-nowrap">
                            {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500 leading-relaxed font-medium group-hover:text-zinc-400 transition-colors line-clamp-2">
                          {alert.message || 'Anomaly detected in operational sector.'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-white/5 bg-white/[0.02] backdrop-blur-md">
              <button className="w-full py-2.5 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-[0.2em] transition-all border border-white/5 hover:border-white/10 flex items-center justify-center gap-2 group">
                Open Command Center <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
