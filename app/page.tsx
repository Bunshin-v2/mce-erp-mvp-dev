
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useDashboardData } from '@/hooks/useDashboardData';
import { supabase } from '@/lib/supabase';
import { SignedIn, SignedOut, SignIn } from "@clerk/clerk-react";
import { StyleProvider, useStyleSystem } from '@/lib/StyleSystem';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { logger } from '@/lib/logger';

// Standard Lucide icons - reduced set for initial load
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Briefcase,
  Loader2
} from 'lucide-react';

// Dynamic Imports for View Components
const ProjectDetail = dynamic(() => import('@/components/projects/ProjectDetail').then(mod => mod.ProjectDetail));
const TenderDetail = dynamic(() => import('@/components/tenders/TenderDetail').then(mod => mod.TenderDetail));
const ProjectsPage = dynamic(() => import('@/components/pages/ProjectsPage').then(mod => mod.ProjectsPage));
const TendersPage = dynamic(() => import('@/components/pages/TendersPage').then(mod => mod.TendersPage));
const DocumentsPage = dynamic(() => import('@/components/pages/DocumentsPage').then(mod => mod.DocumentsPage));
const FinancialsPage = dynamic(() => import('@/components/pages/FinancialsPage').then(mod => mod.FinancialsPage));
const ResourcesPage = dynamic(() => import('@/components/pages/ResourcesPage').then(mod => mod.ResourcesPage));
const TasksPage = dynamic(() => import('@/components/pages/TasksPage').then(mod => mod.TasksPage));
const ProfilePage = dynamic(() => import('@/components/pages/ProfilePage').then(mod => mod.ProfilePage));
const AgentConsole = dynamic(() => import('@/components/pages/AgentConsole').then(mod => mod.AgentConsole));
const ExecutiveCockpit = dynamic(() => import('@/components/pages/ExecutiveCockpit').then(mod => mod.ExecutiveCockpit));
const IntegrationsPage = dynamic(() => import('@/components/pages/IntegrationsPage').then(mod => mod.IntegrationsPage));
const SettingsPage = dynamic(() => import('@/components/pages/SettingsPage').then(mod => mod.SettingsPage));
const ReportsPage = dynamic(() => import('@/components/pages/ReportsPage').then(mod => mod.ReportsPage));
const FieldOperationsPage = dynamic(() => import('@/components/pages/FieldOperationsPage').then(mod => mod.FieldOperationsPage));
const NotificationsPage = dynamic(() => import('@/components/pages/NotificationsPage').then(mod => mod.NotificationsPage));
const LiabilityDashboard = dynamic(() => import('@/components/pages/LiabilityDashboard').then(mod => mod.LiabilityDashboard));
const PersonalTasksPage = dynamic(() => import('@/components/pages/PersonalTasksPage').then(mod => mod.PersonalTasksPage));
const ValidationDashboard = dynamic(() => import('@/components/pages/ValidationDashboard').then(mod => mod.ValidationDashboard));
const RedactionPage = dynamic(() => import('@/components/pages/RedactionPage').then(mod => ({ default: mod.default })));
const AlarmRuleEditorPage = dynamic(() => import('@/components/pages/admin/AlarmRuleEditorPage').then(mod => ({ default: mod.default })));

// Layout Components
const AppShell = dynamic(() => import('@/components/layout/AppShell').then(mod => mod.AppShell));
const DashboardLayout = dynamic(() => import('@/components/layout/DashboardLayout').then(mod => mod.DashboardLayout));
const SignalMatrix = dynamic(() => import('@/components/dashboard/SignalMatrix').then(mod => mod.SignalMatrix));
const Watermark = dynamic(() => import('@/components/Watermark').then(mod => mod.Watermark));
const ChatAssistant = dynamic(() => import('@/components/ChatAssistant').then(mod => mod.ChatAssistant));
const InputZero = dynamic(() => import('@/components/landing/InputZero').then(mod => mod.InputZero));

export default function HomePage() {
  return (
    <StyleProvider>
      <AppContent />
    </StyleProvider>
  );
}

function AppContent() {
  const {
    documents, alerts, kpis, chartData, statusData, loading, error, refetch,
    projects, tenders, agentActivity, auditLogs, signals, tasks
  } = useDashboardData();
  const { config } = useStyleSystem();

  const [activeView, setActiveView] = useState('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedTenderId, setSelectedTenderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dashboardMode, setDashboardMode] = useState<'operational' | 'executive'>('operational');
  const [archivedSignals, setArchivedSignals] = useState<string[]>([]);

  // Unified Navigation Handler
  const handleNavigate = useCallback((view: string) => {
    setActiveView(view);
    setSelectedProjectId(null);
    setSelectedTenderId(null);
  }, []);

  // Sync Countdown Logic
  const [nextSyncSeconds, setNextSyncSeconds] = useState(60);
  useEffect(() => {
    const timer = setInterval(() => {
      setNextSyncSeconds(prev => {
        if (prev <= 1) { refetch(); return 60; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [refetch]);

  const handleAcknowledge = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}/ack`, { method: 'POST' });
      if (res.ok) { refetch(); } else { logger.error('API_ACKNOWLEDGE_FAILED', { id }); }
    } catch (err) {
      logger.error('ACKNOWLEDGE_EXCEPTION', { error: String(err), id });
    }
  }, [refetch]);

  const unreadCount = alerts ? alerts.filter(a => !a.acked_at).length : 0;

  const notificationFeed = useMemo(() => (alerts || []).map((n: any) => ({
    id: n.id,
    message: n.message || n.title || '',
    severity: (n.priority || 'info') as 'info' | 'warning' | 'critical',
    created_at: new Date().toISOString(),
    read_at: n.acked_at,
    ack_required: true,
  })), [alerts]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    refetch(query);
  };

  const renderContent = useCallback(() => {
    if (selectedProjectId) {
      return <ProjectDetail projectId={selectedProjectId} onBack={() => setSelectedProjectId(null)} />;
    }

    if (selectedTenderId) {
      const tender = tenders.find((t: any) => t.id === selectedTenderId);
      return <TenderDetail tender={tender} onBack={() => setSelectedTenderId(null)} />;
    }

    switch (activeView) {
      case 'cockpit':
        return (
          <RouteGuard requiredTier="L3">
            <ExecutiveCockpit
              projects={projects || []}
              tenders={tenders || []}
              kpis={kpis}
              onNavigate={handleNavigate}
              onSelectProject={setSelectedProjectId}
              notifications={notificationFeed}
            />
          </RouteGuard>
        );
      case 'notifications':
        return <NotificationsPage notifications={notificationFeed} onAcknowledge={handleAcknowledge} />;
      case 'projects':
        return <ProjectsPage projects={projects || []} onSelectProject={setSelectedProjectId} onRefresh={refetch} searchQuery={searchQuery} onNavigate={handleNavigate} loading={loading} />;
      case 'tenders':
        return (
          <TendersPage
            tenders={tenders || []}
            onSelectTender={setSelectedTenderId}
            onRefresh={refetch}
            onNavigate={handleNavigate}
            loading={loading}
          />
        );
      case 'documents':
        return <DocumentsPage documents={documents || []} onRefresh={refetch} onNavigate={handleNavigate} loading={loading} />;
      case 'financials':
        return <FinancialsPage projects={projects || []} onRefresh={refetch} onNavigate={handleNavigate} onSelectProject={setSelectedProjectId} loading={loading} />;
      case 'tasks':
        return <TasksPage projects={projects || []} onSelectProject={setSelectedProjectId} />;
      case 'personaltasks':
        return <PersonalTasksPage />;
      case 'admin/rules':
        return (
          <RouteGuard requiredTier="L4">
            <AlarmRuleEditorPage />
          </RouteGuard>
        );
      case 'admin/validation':
        return (
          <RouteGuard requiredTier="L4">
            <ValidationDashboard />
          </RouteGuard>
        );
      case 'redaction':
        return <RedactionPage />;
      case 'calendar':
        return (
          <TasksPage
            projects={projects || []}
            onSelectProject={setSelectedProjectId}
            initialView="calendar"
          />
        );
      case 'profile':
        return <ProfilePage />;
      case 'team':
        return <ResourcesPage projects={projects || []} onRefresh={refetch} loading={loading} />;
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
      case 'liability':
        return <LiabilityDashboard />;
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
                  <h3 className="text-2xl font-black italic tracking-tighter text-white">Global Portfolio Intelligence</h3>
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
  }, [
    selectedProjectId, selectedTenderId, activeView, projects, tenders, kpis, handleNavigate,
    notificationFeed, handleAcknowledge, refetch, searchQuery, documents, dashboardMode,
    config.density, nextSyncSeconds, signals, tasks, auditLogs, agentActivity, loading
  ]);

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

  const renderDashboard = () => (
    <AppShell
      activeView={activeView}
      onNavigate={handleNavigate}
      onSearch={handleSearch}
      mode={dashboardMode}
      onToggleMode={() => setDashboardMode(prev => prev === 'operational' ? 'executive' : 'operational')}
      onNotificationsClick={() => handleNavigate('notifications')}
      unreadCount={unreadCount}
      loading={loading}
    >
      {renderContent()}
    </AppShell>
  );

  const disableAuth =
    (typeof window !== 'undefined' && (window as any).__ENV?.NEXT_PUBLIC_DISABLE_AUTH === 'true') ||
    process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true';

  if (disableAuth) {
    return (
      <>
        {renderDashboard()}
        <ChatAssistant />
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
              if (id) {
                if (view === 'projects') setSelectedProjectId(id);
                if (view === 'tenders') setSelectedTenderId(id);
              }
              setActiveView(view);
              setSearchQuery('');
            }}
          />
        )}
        <Watermark />
      </>
    );
  }

  return (
    <>
      <SignedOut>
        <InputZero />
      </SignedOut>

      <SignedIn>
        {renderDashboard()}
        <ChatAssistant />
      </SignedIn>

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
