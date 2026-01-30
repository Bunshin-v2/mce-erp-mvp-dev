import React, { useState, useMemo } from 'react';
import { Bell, ShieldAlert, Clock, CheckCircle2, MoreVertical, Filter, Zap, Search } from 'lucide-react';
import { Notification } from '@/components/notifications/NotificationBell'; // Using the richer type

// MOCK DATA - In a real app, this would be fetched.
const sampleNotifications: Notification[] = [
    { id: '1', message: 'Tender "RFP-2024-089" deadline approaching in 3 days.', severity: 'critical', created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), ack_required: true },
    { id: '2', message: 'Milestone "Foundation complete" for project MCE-010 is due in 7 days.', severity: 'warning', created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
    { id: '3', message: 'New document "Safety-Compliance-Check-April.pdf" uploaded.', severity: 'info', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
    { id: '4', message: 'Payment of $120,000 for "Al Wasl Tower" is overdue.', severity: 'critical', created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), ack_required: true, read_at: new Date().toISOString() },
    { id: '5', message: '[ESCALATION L1] Critical alert has not been acknowledged for 4 hours.', severity: 'critical', created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), ack_required: true },
    { id: '6', message: 'Compliance scan for project "Downtown Residences" is complete.', severity: 'info', created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), read_at: new Date().toISOString() },
];


interface NotificationsPageProps {
   notifications?: Notification[];
   onAcknowledge?: (id: string) => void;
}

import { PageHeader } from '../ui/PageHeader';

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ notifications: initialNotifications, onAcknowledge }) => {
   const [notifications, setNotifications] = useState<Notification[]>(initialNotifications ?? sampleNotifications);
   const [filters, setFilters] = useState({ search: '', severity: 'all', status: 'all' });

   const handleAcknowledge = (id: string) => {
       setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
       onAcknowledge?.(id);
   }

   const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      const searchMatch = filters.search === '' || n.message.toLowerCase().includes(filters.search.toLowerCase());
      const severityMatch = filters.severity === 'all' || n.severity === filters.severity;
      const statusMatch = filters.status === 'all' 
          || (filters.status === 'unread' && !n.read_at) 
          || (filters.status === 'acknowledged' && !!n.read_at) 
          || (filters.status === 'action_required' && !!n.ack_required && !n.read_at);
      return searchMatch && severityMatch && statusMatch;
    });
   }, [notifications, filters]);

   const getSeverityColor = (severity: 'info' | 'warning' | 'critical') => {
      switch (severity) {
         case 'critical': return 'bg-rose-500 animate-pulse shadow-[0_0_10px_#f43f5e]';
         case 'warning': return 'bg-amber-500';
         default: return 'bg-sky-500';
      }
   };
   
   const getSeverityBadge = (severity: 'info' | 'warning' | 'critical') => {
      switch (severity) {
         case 'critical': return 'text-rose-400 bg-rose-900/50 border-rose-500/30';
         case 'warning': return 'text-amber-400 bg-amber-900/50 border-amber-500/30';
         default: return 'text-sky-400 bg-sky-900/50 border-sky-500/30';
      }
   }

   const criticalCount = notifications.filter(n => n.severity === 'critical' && !n.read_at).length;
   const warningCount = notifications.filter(n => n.severity === 'warning' && !n.read_at).length;

    return (
      <div className="page-container space-y-8 pb-32 animate-fade-in">
         <PageHeader 
            title="Signal Center"
            subtitle="Global Alert Stream // Acknowledgments"
            actions={
               <button className="px-5 py-2 text-[10px] font-bold italic tracking-widest text-zinc-300 bg-glass hover:bg-white/10 border border-white/10 rounded-xl transition-all">
                  Flush All Signals
               </button>
            }
         />


         {/* Stats Summary */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="bg-[#444444]/40 border border-rose-500/20 rounded-xl p-4 flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-bold italic text-rose-400 tracking-widest">Unresolved Critical</p>
                   <h3 className="text-2xl font-bold italic text-white mt-1">{criticalCount.toString().padStart(2, '0')}</h3>
                </div>
                <ShieldAlert size={24} className="text-rose-500 opacity-50" />
             </div>
             <div className="bg-[#444444]/40 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-bold italic text-amber-400 tracking-widest">Active Warnings</p>
                   <h3 className="text-2xl font-bold italic text-white mt-1">{warningCount.toString().padStart(2, '0')}</h3>
                </div>
                <Clock size={24} className="text-amber-400 opacity-50" />
             </div>
             <div className="bg-[#444444]/40 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-bold italic text-emerald-400 tracking-widest">System Health</p>
                   <h3 className="text-2xl font-bold italic text-white mt-1">98%</h3>
                </div>
                <CheckCircle2 size={24} className="text-emerald-500 opacity-50" />
             </div>
         </div>

         {/* Filter and Search Controls */}
         <div className="bg-[#444444]/60 backdrop-blur-xl border border-glass rounded-xl shadow-2xl p-4 flex items-center space-x-4">
            <div className="flex-1 flex items-center bg-black/20 border border-white/10 rounded-lg px-3">
                <Search size={16} className="text-slate-500" />
                <input 
                    type="text" 
                    placeholder="Search notifications by message..." 
                    className="w-full bg-transparent p-2 text-sm text-white outline-none placeholder-slate-500"
                    onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                />
            </div>
            <select onChange={(e) => setFilters(f => ({ ...f, severity: e.target.value }))} className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-sky-500 outline-none">
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
            </select>
            <select onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))} className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-sky-500 outline-none">
                <option value="all">All Statuses</option>
                <option value="unread">Unread</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="action_required">Action Required</option>
            </select>
         </div>

         {/* Inbox List */}
         <div className="bg-[#444444]/60 backdrop-blur-xl border border-glass rounded-xl shadow-2xl overflow-hidden min-h-[500px]">
            <div className="px-6 py-4 border-b border-glass bg-slate-900/40 flex justify-between items-center">
               <h4 className="text-xs font-bold italic text-slate-300 tracking-widest flex items-center">
                  <Zap size={14} className="mr-2 text-amber-400" /> Inbox
               </h4>
               <div className="flex items-center space-x-2">
                  <button className="p-2 text-slate-500 hover:text-white transition-colors"><Filter size={16} /></button>
                  <button className="p-2 text-slate-500 hover:text-white transition-colors"><MoreVertical size={16} /></button>
               </div>
            </div>

            <div className="divide-y divide-white/5">
               {filteredNotifications.length === 0 ? (
                  <div className="p-12 text-center text-zinc-500">
                     <p>No notifications match the current filters.</p>
                  </div>
               ) : filteredNotifications.map((n) => (
                  <div key={n.id} className="p-6 hover:bg-glass transition-all group flex items-start justify-between">
                     <div className="flex items-start space-x-5">
                        <div className={`mt-1 w-2 h-2 rounded-full ${getSeverityColor(n.severity)}`}></div>
                        <div>
                           <div className="flex items-center space-x-3">
                              <span className={`text-[9px] px-2 py-0.5 rounded border font-bold italic tracking-tighter ${getSeverityBadge(n.severity)}`}>
                                 {n.severity}
                              </span>
                              <h4 className="text-base font-bold italic text-white">{n.message}</h4>
                           </div>
                           <p className="text-sm text-slate-400 mt-2 max-w-2xl">This is a placeholder for additional details about the notification, such as the related project or tender.</p>
<div className="flex items-center space-x-4 mt-3">
                               <span className="text-[10px] text-slate-500 font-mono">{new Date(n.created_at).toLocaleString()}</span>
                               {n.ack_required && !n.read_at && (
                                 <>
                                   <span className="text-[10px] text-slate-600">•</span>
                                   <button
                                      onClick={(e) => { e.stopPropagation(); handleAcknowledge(n.id); }}
                                      className="text-[10px] font-bold italic text-emerald-500 hover:text-emerald-400 tracking-wider flex items-center transition-colors hover:underline"
                                   >
                                      ACKNOWLEDGE
                                   </button>
                                   <span className="text-[10px] text-slate-600">•</span>
                                    <button className="text-[10px] font-bold italic text-sky-500 hover:text-sky-400 tracking-wider">SNOOZE</button>
                                 </>
                               )}
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

