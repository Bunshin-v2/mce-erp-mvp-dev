import React, { useState } from 'react';
import { Bell, ShieldAlert, Clock, CheckCircle2, MoreVertical, Filter, Zap } from 'lucide-react';
import { SystemNotification } from '../../types';

interface NotificationsPageProps {
   notifications?: SystemNotification[];
   onAcknowledge?: (id: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ notifications = [], onAcknowledge }) => {
   const [activeTab, setActiveTab] = useState<'all' | 'critical' | 'followup'>('all');

   // Filter logic (if we had specific flags for critical/followup)
   // For now, we can check priority for 'critical' tab.
   const filteredNotifications = notifications.filter(n => {
      if (activeTab === 'all') return true;
      if (activeTab === 'critical') return n.priority === 'critical';
      if (activeTab === 'followup') return false; // Not implemented yet
      return true;
   });

   const getSeverityColor = (priority: string) => {
      switch (priority) {
         case 'critical': return 'bg-rose-500 animate-pulse shadow-[0_0_10px_#f43f5e]';
         case 'warning': return 'bg-amber-500';
         default: return 'bg-emerald-500';
      }
   };

   const criticalCount = notifications.filter(n => n.priority === 'critical').length;
   const warningCount = notifications.filter(n => n.priority === 'warning').length;

   return (
      <div className="page-container space-y-6">
         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <h1 className="text-2xl font-bold text-white flex items-center">
                  <Bell className="mr-3 text-[#FFD700]" /> Notification Center
               </h1>
               <p className="text-slate-400 text-sm mt-1 ml-9">Manage alerts, acknowledgments, and strategic follow-ups.</p>
            </div>
            <div className="flex bg-[#444444]/60 p-1 rounded-xl border border-white/5 shadow-xl">
               {(['all', 'critical', 'followup'] as const).map((tab) => (
                  <button
                     key={tab}
                     onClick={() => setActiveTab(tab)}
                     className={`px-6 py-2 text-xs font-bold rounded-lg transition-all uppercase tracking-wider ${activeTab === tab
                        ? 'bg-white/10 text-white shadow-inner'
                        : 'text-slate-500 hover:text-slate-300'
                        }`}
                  >
                     {tab}
                  </button>
               ))}
            </div>
         </div>

         {/* Stats Summary */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#444444]/40 border border-rose-500/20 rounded-2xl p-4 flex items-center justify-between">
               <div>
                  <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Unresolved Critical</p>
                  <h3 className="text-2xl font-bold text-white mt-1">{criticalCount.toString().padStart(2, '0')}</h3>
               </div>
               <ShieldAlert size={24} className="text-rose-500 opacity-50" />
            </div>
            <div className="bg-[#444444]/40 border border-[#33CCCC]/20 rounded-2xl p-4 flex items-center justify-between">
               <div>
                  <p className="text-[10px] font-bold text-[#33CCCC] uppercase tracking-widest">T-Minus Alarms</p>
                  <h3 className="text-2xl font-bold text-white mt-1">{warningCount.toString().padStart(2, '0')}</h3>
               </div>
               <Clock size={24} className="text-[#33CCCC] opacity-50" />
            </div>
            <div className="bg-[#444444]/40 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
               <div>
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">System Health</p>
                  <h3 className="text-2xl font-bold text-white mt-1">98%</h3>
               </div>
               <CheckCircle2 size={24} className="text-emerald-500 opacity-50" />
            </div>
         </div>

         {/* Inbox List */}
         <div className="bg-[#444444]/60 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl overflow-hidden min-h-[500px]">
            <div className="px-6 py-4 border-b border-white/5 bg-slate-900/40 flex justify-between items-center">
               <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center">
                  <Zap size={14} className="mr-2 text-amber-400" /> Strategic Inbox
               </h4>
               <div className="flex items-center space-x-2">
                  <button className="p-2 text-slate-500 hover:text-white transition-colors"><Filter size={16} /></button>
                  <button className="p-2 text-slate-500 hover:text-white transition-colors"><MoreVertical size={16} /></button>
               </div>
            </div>

            <div className="divide-y divide-white/5">
               {filteredNotifications.length === 0 ? (
                  <div className="p-12 text-center text-zinc-500">
                     <p>No active notifications in this category.</p>
                  </div>
               ) : filteredNotifications.map((n) => (
                  <div key={n.id} className="p-6 hover:bg-white/5 transition-all group flex items-start justify-between cursor-pointer">
                     <div className="flex items-start space-x-5">
                        <div className={`mt-1 w-2 h-2 rounded-full ${getSeverityColor(n.priority)}`}></div>
                        <div>
                           <div className="flex items-center space-x-3">
                              <h4 className="text-base font-bold text-white group-hover:text-[#33CCCC] transition-colors">{n.title}</h4>
                              <span className="text-[9px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 font-bold uppercase tracking-tighter">
                                 {n.priority.toUpperCase()}
                              </span>
                           </div>
                           <p className="text-sm text-slate-400 mt-1 max-w-2xl">{n.message || 'Action Required'}</p>
                           <div className="flex items-center space-x-4 mt-3">
                              <span className="text-[10px] text-slate-500 font-mono">{n.timestamp}</span>
                              <span className="text-[10px] text-slate-600">•</span>
                              <button
                                 onClick={(e) => { e.stopPropagation(); onAcknowledge?.(n.id); }}
                                 className="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-wider flex items-center transition-colors hover:underline"
                              >
                                 ACKNOWLEDGE
                              </button>
                           </div>
                        </div>
                     </div>
                     <button className="text-slate-600 hover:text-white p-2 opacity-0 group-hover:opacity-100 transition-all">
                        <MoreVertical size={18} />
                     </button>
                  </div>
               ))}
            </div>
         </div>
      </div>
   );
};
