
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useDashboardData } from '@/hooks/useDashboardData';
import { supabase } from '@/lib/supabase';
import { SignedIn, SignedOut, SignIn } from "@clerk/clerk-react";
import { StyleProvider, useStyleSystem } from '@/lib/StyleSystem';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { logger } from '@/lib/logger';

import { MorganCommandCenter } from '@/components/dashboard/MorganCommandCenter';

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

  const [activeView, setActiveView] = useState('command');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedTenderId, setSelectedTenderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dashboardMode, setDashboardMode] = useState<'operational' | 'executive' | 'command'>('command');
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
    title: n.title || n.message || '',
    message: n.message || '',
    priority: (n.priority || 'info') as 'info' | 'warning' | 'critical',
    timestamp: n.created_at || new Date().toISOString(),
    isUnread: !n.acked_at,
    acked_at: n.acked_at,
  })), [alerts]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    refetch();
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
      case 'command':
      case 'projects':
      case 'tenders':
      case 'financials':
      case 'reports':
      case 'tasks':
      case 'calendar':
      case 'cockpit':
      case 'documents':
      case 'agents':
      case 'integrations':
      case 'field':
      case 'liability': // Map liability to risk
      case 'dashboard':
        return (
          <MorganCommandCenter
             kpis={kpis || []}
             projects={projects || []}
             tenders={tenders || []}
             tasks={tasks || []}
             alerts={notificationFeed}
             agentActivity={agentActivity || []}
             auditLogs={auditLogs || []}
             onSearch={handleSearch}
             onNavigate={handleNavigate}
             initialView={
               activeView === 'liability' ? 'risk' : 
               activeView === 'dashboard' ? 'command' : 
               activeView === 'cockpit' ? 'strategic' :
               activeView === 'field' ? 'field' :
               activeView as any
             }
          />
        );
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
      default:
        return (
          <div className={`flex flex-col ${config.density === 'executive' ? 'gap-1' : 'gap-4'} bg-[var(--surface-base)] p-1`}>
            <DashboardLayout
              mode={(dashboardMode === 'command' ? 'operational' : dashboardMode) as 'operational' | 'executive'}
              signals={signals}
              kpis={kpis || []}
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
      mode={(dashboardMode === 'command' ? 'operational' : dashboardMode) as 'operational' | 'executive'}
      onToggleMode={() => setDashboardMode(prev => prev === 'operational' ? 'executive' : 'operational')}
      onNotificationsClick={() => handleNavigate('notifications')}
      unreadCount={unreadCount}
      loading={loading}
    >
      {renderContent()}
    </AppShell>
  );

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
