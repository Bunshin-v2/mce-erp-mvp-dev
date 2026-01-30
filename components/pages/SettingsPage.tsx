import React, { useState } from 'react';
import { Settings, Shield, Bell, Database, Palette, Save, Users, Download, FileText, Zap } from 'lucide-react';
import { useDashboardData } from '../../hooks/useDashboardData';
import { TeamManagement } from '../settings/TeamManagement';
import { AlarmSettingsPanel } from '../settings/AlarmSettingsPanel';
import { DocumentSyncPanel } from '../admin/DocumentSyncPanel';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'team' | 'security' | 'notifications'>('team');
  const { auditLogs } = useDashboardData();

  const handleSave = () => {
    // Simulate save
    alert("Settings saved successfully.");
  };

  const getActionColor = (action: string) => {
    if (action.includes('DELETE') || action.includes('RESTRICT')) return 'text-rose-500';
    if (action.includes('CREATE') || action.includes('UPLOAD')) return 'text-emerald-500';
    if (action.includes('UPDATE') || action.includes('EDIT')) return 'text-blue-500';
    return 'text-zinc-400';
  };

  return (
    <div className="page-container space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--surface-border)] pb-4">
        <div>
          <div className="flex items-center text-zinc-400 text-[9px] tracking-[0.3em] font-bold italic mb-2 font-sans">
            <span>Home</span>
            <span className="mx-2 opacity-30">/</span>
            <span className="text-zinc-300">Settings</span>
          </div>
          <h1 className="text-3xl font-black italic tracking-tighter text-white font-display uppercase">System Config</h1>
        </div>
        <button onClick={handleSave} className="bg-[var(--color-critical)] text-white px-6 py-2 rounded-sm text-xs font-bold italic flex items-center shadow-lg shadow-red-900/30 hover:bg-[var(--color-critical)] transition-all tracking-wider font-brand">
          <Save size={14} className="mr-2" />
          Save Changes
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 p-1 bg-[var(--surface-elevated)] rounded border border-[var(--surface-border)] w-fit">
        {[
          { id: 'team', label: 'Team & Access', icon: Users },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'security', label: 'Security & Audit', icon: Shield },
          { id: 'general', label: 'General & Data', icon: Database },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-[10px] font-bold italic tracking-wider rounded transition-all flex items-center ${activeTab === tab.id
              ? 'bg-[var(--surface-layer)] text-white shadow-sm border border-[var(--surface-border)]'
              : 'text-zinc-500 hover:text-zinc-300'
              }`}
          >
            <tab.icon size={14} className="mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="min-h-[500px] border border-[var(--surface-border)] rounded bg-[var(--surface-layer)] p-6 shadow-sm">
        {activeTab === 'team' && <TeamManagement />}
        {activeTab === 'notifications' && <AlarmSettingsPanel />}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xs font-bold italic text-zinc-500 tracking-[0.2em] mb-1">Administrative Audit Trail</h3>
                <p className="text-[10px] text-zinc-400">Live monitoring of all ledger and resource interactions.</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold italic text-emerald-600">Live Stream Active</span>
              </div>
            </div>

            <div className="overflow-hidden border border-zinc-200 rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200">
                    <th className="p-3 text-[10px] font-bold italic text-zinc-500">Timestamp</th>
                    <th className="p-3 text-[10px] font-bold italic text-zinc-500">Actor</th>
                    <th className="p-3 text-[10px] font-bold italic text-zinc-500">Action Cluster</th>
                    <th className="p-3 text-[10px] font-bold italic text-zinc-500">Resource Pattern</th>
                    <th className="p-3 text-[10px] font-bold italic text-zinc-500 text-right">Signature</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-sans">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="p-3 text-[10px] font-mono text-zinc-400 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center mr-2 text-[9px] font-bold italic">
                            {log.user_email?.slice(0, 2).toUpperCase() || 'SYS'}
                          </div>
                          <span className="text-xs font-bold italic text-zinc-600">{log.user_email || 'System Agent'}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`text-[9px] font-bold italic px-2 py-0.5 rounded border border-current ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-zinc-500 max-w-xs truncate">
                        {log.entity_type}: {log.entity_id.slice(0, 8)}...
                      </td>
                      <td className="p-3 text-right text-[10px] font-mono text-zinc-300">
                        {log.id.slice(-8)}
                      </td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-zinc-400 text-xs">
                        No security events detected in the current maturation cycle.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'general' && (
          <div className="space-y-8">
            <section className="space-y-4">
              <h3 className="text-xs font-bold italic text-zinc-500 tracking-[0.2em] flex items-center">
                <Zap size={14} className="mr-2 text-emerald-500" /> Intelligence Layer
              </h3>
              <DocumentSyncPanel />
            </section>

            <div>
              <h3 className="text-xs font-bold italic text-zinc-500 tracking-[0.2em] mb-4 flex items-center">
                <Database size={14} className="mr-2 text-white" /> Data Management
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button onClick={() => alert("Downloading System Dump...")} className="p-5 border border-[var(--surface-border)] rounded bg-[var(--surface-base)] hover:border-zinc-400 text-left transition-all group flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold italic text-zinc-400 tracking-wider mb-1">Backup</p>
                    <p className="text-sm font-bold italic text-white group-hover:text-black">Download Full Dump</p>
                  </div>
                  <Download size={18} className="text-zinc-400 group-hover:text-white" />
                </button>
                <button onClick={() => alert("Exporting Audit Logs...")} className="p-5 border border-[var(--surface-border)] rounded bg-[var(--surface-base)] hover:border-zinc-400 text-left transition-all group flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold italic text-zinc-400 tracking-wider mb-1">Logs</p>
                    <p className="text-sm font-bold italic text-white group-hover:text-black">Export Audit Trail</p>
                  </div>
                  <FileText size={18} className="text-zinc-400 group-hover:text-white" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


