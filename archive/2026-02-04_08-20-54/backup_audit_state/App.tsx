import React, { useState, useEffect } from 'react';
import { useDashboardData } from './hooks/useDashboardData';
import { supabase } from './lib/supabase';
import { SignedIn, SignedOut, SignIn } from "@clerk/clerk-react";
import { StyleProvider, useStyleSystem } from './lib/StyleSystem';
import { ProjectDetail } from './components/projects/ProjectDetail';
import { TenderDetail } from './components/tenders/TenderDetail';
import { ProjectsPage } from './components/pages/ProjectsPage';
import { TendersPage } from './components/pages/TendersPage';
import { DocumentsPage } from './components/pages/DocumentsPage';
import { FinancialsPage } from './components/pages/FinancialsPage';
import { ResourcesPage } from './components/pages/ResourcesPage';
import { TasksPage } from './components/pages/TasksPage';
import { CalendarPage } from './components/pages/CalendarPage';
import { ProfilePage } from './components/pages/ProfilePage';
import { AgentConsole } from './components/pages/AgentConsole';
import { ExecutiveCockpit } from './components/pages/ExecutiveCockpit';
import { IntegrationsPage } from './components/pages/IntegrationsPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { ReportsPage } from './components/pages/ReportsPage';
import { FieldOperationsPage } from './components/pages/FieldOperationsPage';
import { NotificationsPage } from './components/pages/NotificationsPage';
import { RouteGuard } from './components/auth/RouteGuard';
import { Briefcase, AlertTriangle, Loader2, ShieldAlert, CheckCircle2, Clock, Zap } from 'lucide-react';
import { Shell } from './components/layout/Shell';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { SignalMatrix } from './components/dashboard/SignalMatrix';
import { Watermark } from './components/Watermark';

export default function App({ bypassAuth = false }) {
  return (
    <StyleProvider>
      <AppContent bypassAuth={bypassAuth} />
    </StyleProvider>
  );
}

function AppContent({ bypassAuth }: { bypassAuth: boolean }) {
  const {
    documents, alerts, kpis, chartData, statusData, loading, error, refetch,
    projects, tenders, agentActivity, auditLogs, signals, tasks
  } = useDashboardData();
  const { config, updateConfig } = useStyleSystem();

  const [activeView, setActiveView] = useState('dashboard');
  const [previousView, setPreviousView] = useState('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedTenderId, setSelectedTenderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dashboardMode, setDashboardMode] = useState<'operational' | 'executive'>('operational');

  // Unified Navigation Handler
  const handleNavigate = (view: string) => {
    if (activeView !== 'notifications') {
      setPreviousView(activeView);
    }
    setActiveView(view);
    setSelectedProjectId(null);
    setSelectedTenderId(null);
  };

  // Signal Management
  const [isSignalModalOpen, setIsSignalModalOpen] = useState(false);
  const [customSignals, setCustomSignals] = useState<any[]>([]);
  const [archivedSignals, setArchivedSignals] = useState<string[]>([]);
  const [newSignalText, setNewSignalText] = useState('');

  const handleAddSignal = () => {
    if (!newSignalText.trim()) return;
    setCustomSignals([...customSignals, { id: Date.now(), text: newSignalText, type: 'manual' }]);
    setNewSignalText('');
    setIsSignalModalOpen(false);
  };

  const handleArchive = () => {
    // Archive all current visible signals
    const currentKeys = [];
    if (signals?.complianceIssues > 0) currentKeys.push('compliance');
    if (signals?.stagnationIssues > 0) currentKeys.push('stagnation');
    if (signals?.hasBacklog) currentKeys.push('backlog');
    setArchivedSignals([...archivedSignals, ...currentKeys]);
    setCustomSignals([]); // Clear manual signals too
  };

  // Sync Countdown Logic
  const [nextSyncSeconds, setNextSyncSeconds] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => {
      setNextSyncSeconds(prev => {
        if (prev <= 1) {
          refetch();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [refetch]);



  const handleAcknowledge = async (id: string) => {
    try {
      const { error } = await supabase.from('alerts').update({ acked_at: new Date().toISOString() }).eq('id', id);
      if (!error) {
        refetch();
      }
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  const unreadCount = alerts ? alerts.filter(a => !a.acked_at).length : 0;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    refetch(query);
  };

  const filteredProjects = projects || [];

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center max-w-md text-center p-8 bg-zinc-900 rounded border border-zinc-800">
          <AlertTriangle size={32} className="text-zinc-500 mb-6" />
          <h2 className="text-xl font-bold text-zinc-50 mb-2">System Variance Detected</h2>
          <p className="text-zinc-400 mb-8 text-sm">{error}</p>
          <button
            onClick={() => refetch()}
            className="px-6 py-2 bg-zinc-50 text-zinc-950 rounded text-xs font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors"
          >
            Neutralize & Retry
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (selectedProjectId) {
      return <ProjectDetail projectId={selectedProjectId} onBack={() => setSelectedProjectId(null)} />;
    }

    if (selectedTenderId) {
      const tender = tenders.find(t => t.id === selectedTenderId);
      return <TenderDetail tender={tender} onBack={() => setSelectedTenderId(null)} />;
    }

    switch (activeView) {
      case 'cockpit':
        return (
          <RouteGuard requiredTier="L3">
            <ExecutiveCockpit projects={filteredProjects} tenders={tenders || []} kpis={kpis} onNavigate={handleNavigate} onSelectProject={setSelectedProjectId} />
          </RouteGuard>
        );
      case 'notifications':
        return <NotificationsPage notifications={alerts} onAcknowledge={handleAcknowledge} />;
      case 'projects':
        return <ProjectsPage projects={projects || []} onSelectProject={setSelectedProjectId} onRefresh={refetch} searchQuery={searchQuery} onNavigate={handleNavigate} />;
      case 'tenders':
        return <TendersPage tenders={tenders || []} onSelectTender={setSelectedTenderId} onRefresh={refetch} onNavigate={handleNavigate} />;
      case 'documents':
        return <DocumentsPage documents={documents || []} onRefresh={refetch} onNavigate={handleNavigate} />;
      case 'financials':
        return <FinancialsPage projects={projects || []} onRefresh={refetch} onNavigate={handleNavigate} onSelectProject={setSelectedProjectId} />;
      case 'tasks':
        return <TasksPage onNavigate={handleNavigate} />;
      case 'calendar':
        return <CalendarPage />;
      case 'profile':
        return <ProfilePage />;
      case 'team':
        return <ResourcesPage projects={projects || []} onRefresh={refetch} onNavigate={handleNavigate} />;
      case 'agents':
        return (
          <RouteGuard requiredTier="L3">
            <AgentConsole activity={agentActivity || []} auditLogs={auditLogs || []} />
          </RouteGuard>
        );
      case 'integrations':
        return <IntegrationsPage />;
      case 'settings':
        return (
          <RouteGuard requiredTier="L4">
            <SettingsPage />
          </RouteGuard>
        );
      case 'reports':
        return <ReportsPage />;
      case 'field':
        return <FieldOperationsPage projects={projects || []} onNavigate={handleNavigate} />;
      case 'dashboard':
      default:
        return (
          <div className={`flex flex-col ${config.density === 'executive' ? 'gap-1' : 'gap-4'} bg-[var(--surface-base)] p-1`}>

            {/* Global Intelligence Layer */}
            <div className="flex flex-col space-y-4 mb-2">
              <div className="flex justify-between items-end px-2">
                <div className="flex items-center space-x-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500 opacity-60">Global Signal Intelligence</h3>
                  <div className="flex items-center space-x-2 bg-zinc-950/40 px-3 py-1 rounded-full border border-white/5 backdrop-blur-md">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00dc82] animate-pulse shadow-[0_0_8px_rgba(0,220,130,0.5)]"></div>
                    <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">
                      Pulse T-Minus {nextSyncSeconds}s
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-6 overflow-x-auto pb-4 px-2 scrollbar-none">
                {/* Reconciled Hazard Set */}
                {signals?.riskDistribution?.critical > 0 && (
                  <div className="flex-shrink-0 min-w-[380px] bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 flex items-center justify-between backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
                    <div className="absolute left-0 inset-y-0 w-[3px] bg-rose-500 shadow-[2px_0_15px_rgba(244,63,94,0.4)]"></div>
                    <div className="flex items-center text-rose-500/90 space-x-4 pl-2">
                      <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center border border-rose-500/20">
                        <ShieldAlert size={20} className="animate-pulse" strokeWidth={2} />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-widest block text-white/90">Critical Hazard Alert</span>
                        <span className="text-[10px] font-semibold opacity-60 block mt-0.5">{signals.riskDistribution.critical} Critical Anomalies Detected</span>
                      </div>
                    </div>
                    <button onClick={() => handleNavigate('cockpit')} className="text-[10px] font-bold text-rose-500 hover:text-white uppercase tracking-widest bg-rose-500/10 px-3 py-1.5 rounded-lg transition-all border border-rose-500/20">Cockpit</button>
                  </div>
                )}

                {!archivedSignals.includes('compliance') && signals?.complianceIssues > 0 && (
                  <div className="flex-shrink-0 min-w-[340px] bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 flex items-center justify-between backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
                    <div className="absolute left-0 inset-y-0 w-[3px] bg-amber-500 shadow-[2px_0_15px_rgba(245,158,11,0.4)]"></div>
                    <div className="flex items-center text-amber-500/90 space-x-4 pl-2">
                      <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                        <ShieldAlert size={20} strokeWidth={2} />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-widest block text-white/90">Compliance Breach</span>
                        <span className="text-[10px] font-semibold opacity-60 block mt-0.5">{signals.complianceIssues} Records Missing Artifacts</span>
                      </div>
                    </div>
                    <button onClick={() => handleNavigate('documents')} className="text-[10px] font-bold text-amber-500 hover:text-white uppercase tracking-widest bg-amber-500/10 px-3 py-1.5 rounded-lg transition-all border border-amber-500/20">Audit</button>
                  </div>
                )}

                {!archivedSignals.includes('backlog') && signals?.hasBacklog && (
                  <div className="flex-shrink-0 min-w-[340px] bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 flex items-center justify-between backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
                    <div className="absolute left-0 inset-y-0 w-[3px] bg-emerald-500 shadow-[2px_0_15px_rgba(16,185,129,0.4)]"></div>
                    <div className="flex items-center text-emerald-500/90 space-x-4 pl-2">
                      <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                        <Clock size={20} strokeWidth={2} className="animate-pulse" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-widest block text-white/90">Cognitive Load Alert</span>
                        <span className="text-[10px] font-semibold opacity-60 block mt-0.5">{signals.backlogCount} Pending Intervention Points</span>
                      </div>
                    </div>
                    <button onClick={() => handleNavigate('documents')} className="text-[10px] font-bold text-emerald-500 hover:text-white uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-lg transition-all border border-emerald-500/20">Execute</button>
                  </div>
                )}

                <div className="flex-shrink-0 min-w-[280px] bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 flex items-center justify-between backdrop-blur-2xl shadow-2xl group">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/5 shadow-inner">
                      <CheckCircle2 size={20} className="text-[#00dc82]" strokeWidth={2} />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-widest block text-white/90">MCE System Status</span>
                      <span className="text-[10px] font-semibold opacity-40 block mt-0.5 text-zinc-500 uppercase">Operational Environment</span>
                    </div>
                  </div>
                  <span className="text-[9px] bg-[#00dc82]/20 text-[#00dc82] border border-[#00dc82]/30 px-3 py-1 rounded-full font-bold shadow-[0_0_15px_rgba(0,220,130,0.2)] tracking-widest uppercase">Active</span>
                </div>
              </div>
            </div>

            <DashboardLayout
              mode={dashboardMode}
              signals={signals}
              kpis={kpis}
              projects={projects || []}
              tenders={tenders || []}
              documents={documents || []}
              alerts={alerts || []}
              statusData={statusData}
              searchQuery={searchQuery}
              loading={loading}
              onRefetch={refetch}
              onSelectProject={setSelectedProjectId}
              onSelectTender={setSelectedTenderId}
              onNavigate={handleNavigate}
            />
          </div>
        );
    }
  };

  const renderDashboard = () => (
    loading && kpis.length === 0 ? (
      <div className="h-screen w-screen flex items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center">
          <Loader2 size={32} className="animate-spin text-zinc-500 mb-6" />
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em]">Calibrating Financial Engine...</p>
        </div>
      </div>
    ) : (
      <Shell
        activeView={activeView}
        onNavigate={handleNavigate}
        onSearch={handleSearch}
        mode={dashboardMode}
        onToggleMode={() => setDashboardMode(prev => prev === 'operational' ? 'executive' : 'operational')}
        onNotificationsClick={() => handleNavigate('notifications')}
        unreadCount={unreadCount}
      >
        {renderContent()}
      </Shell>
    )
  );

  if (bypassAuth) {
    return renderDashboard();
  }

  return (
    <>
      <SignedOut>
        <div className="h-screen w-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full animate-in fade-in zoom-in duration-500">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-[#00FFFF] rounded-xl shadow-[0_0_20px_rgba(0,255,255,0.4)] mb-4 text-[#0A0F2C]">
                <Briefcase size={24} />
              </div>
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">MCE Command Center</h1>
              <p className="text-slate-300 text-sm mt-1">Authorized Personnel Only</p>
            </div>
            <SignIn appearance={{
              elements: {
                formButtonPrimary: 'bg-[#00FFFF] hover:bg-[#00FFFF]/80 text-[#0A0F2C] font-bold',
                card: 'shadow-2xl border-white/20 rounded-2xl bg-[#444444]/90 backdrop-blur-xl border'
              }
            }} />
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        {renderDashboard()}
      </SignedIn>

      {/* Add Signal Modal */}
      {isSignalModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1e293b] border border-white/10 rounded-xl p-6 w-96 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Add Manual Signal</h3>
            <input
              autoFocus
              type="text"
              value={newSignalText}
              onChange={(e) => setNewSignalText(e.target.value)}
              placeholder="Describe the signal event..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white mb-4 focus:outline-none focus:border-[#00FFFF]"
              onKeyDown={(e) => e.key === 'Enter' && handleAddSignal()}
            />
            <div className="flex justify-end space-x-3">
              <button onClick={() => setIsSignalModalOpen(false)} className="text-slate-400 hover:text-white text-sm font-bold">Cancel</button>
              <button onClick={handleAddSignal} className="bg-[#00FFFF] text-[#0A0F2C] px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#00FFFF]/80">Add Signal</button>
            </div>
          </div>
        </div>
      )}
      {searchQuery && (
        <SignalMatrix
          query={searchQuery}
          results={{
            projects: projects || [],
            tenders: tenders || [],
            documents: documents || [],
            tasks: tasks || []
          }}
          onClose={() => setSearchQuery('')}
          onNavigate={(view, id) => {
            handleNavigate(view);
            if (view === 'projects' && id) setSelectedProjectId(id);
            if (view === 'tenders' && id) setSelectedTenderId(id);
            setSearchQuery('');
          }}
        />
      )}
    </>
  );
}
