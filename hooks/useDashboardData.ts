
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import { useSupabase } from './useSupabase';
import { DocumentItem, SystemNotification, ChartData } from '../types';
import { Briefcase, FileText, AlertTriangle, DollarSign } from 'lucide-react';

export function useDashboardData(searchQuery: string = '') {
  const { getClient } = useSupabase();

  // 1. STATE DEFINITIONS
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [alerts, setAlerts] = useState<SystemNotification[]>([]);
  const [kpis, setKpis] = useState<any[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);

  const [statusData, setStatusData] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [tenders, setTenders] = useState<any[]>([]);
  const [agentActivity, setAgentActivity] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to map DB doc to UI doc
  const mapDoc = (doc: any): DocumentItem => ({
    id: doc.id,
    title: doc.title,
    type: doc.category || 'CONTRACT',
    date: new Date(doc.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
    status: doc.status || 'Review',
    created_at: doc.created_at,
    updated_at: doc.updated_at,
    reviewed_at: doc.reviewed_at,
    project_name: doc.projects_master?.project_name,
    project_code: doc.projects_master?.project_code,
    client_name: doc.projects_master?.client_name,
    client_id: doc.projects_master?.client_entity_uid,
    project_id: doc.project_id
  });

  const fetchTasks = async (searchQuery: string = '') => {
    let query = supabase.from('tasks').select('*'); // Using the canonical 'tasks' table
    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (!error && data) setTasks(data);
  };

  const fetchData = async (searchQuery: string = '') => {
    setLoading(true);
    try {
      await fetchTasks(searchQuery);
      // 1. Fetch Documents with Project Join
      const { data: docsData, error: docsError } = await supabase
        .from('documents')
        .select(`
          *,
          projects_master (
            project_name,
            project_code,
            client_name,
            client_entity_uid
          )
        `)
        .order('created_at', { ascending: false });

      if (docsError) throw docsError;
      const mappedDocs = (docsData || []).map(mapDoc);

      setDocuments(mappedDocs);

      // 2. Fetch Alerts (using the new 'notifications' table)
      const { data: alertsData, error: alertsError } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (alertsError) throw alertsError;
      setAlerts((alertsData || []).map((a: any) => ({
        id: a.id,
        title: a.message.substring(0, 30) + '...',
        message: a.message,
        timestamp: new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        priority: a.severity,
        isUnread: !a.read_at,
        acked_at: a.ack_at
      })));

      // 3. Fetch Projects with Search
      let projectQuery = supabase.from('projects_master').select('*', { count: 'exact' });
      if (searchQuery) {
        projectQuery = projectQuery.or(`project_name.ilike.%${searchQuery}%,project_code.ilike.%${searchQuery}%`);
      }
      const { data: projMaster, error: projError } = await projectQuery;
      if (projError) throw projError;

      logger.debug('SUPABASE_PROJECTS_SYNC', { count: projMaster?.length });
      setProjects(projMaster || []);

      // 4. Fetch Tenders with Search
      let tenderQuery = supabase.from('tenders').select('*');
      if (searchQuery) {
        tenderQuery = tenderQuery.or(`title.ilike.%${searchQuery}%,client.ilike.%${searchQuery}%`);
      }
      const { data: tenderData, error: tenderError } = await tenderQuery.order('created_at', { ascending: false });
      if (tenderError) throw tenderError;
      setTenders(tenderData || []);

      // 5. Fetch Agent Activity (using agent_activity)
      const { data: activityData, error: activityError } = await supabase
        .from('agent_activity')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(20);
      if (activityError) logger.warn("Agent activity table not found.");
      setAgentActivity(activityData || []);

      // 6. Fetch Audit Logs 
      const { data: logData, error: logError } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (logError) logger.warn("Audit logs table not found.");
      setAuditLogs(logData || []);

      // 7. Fetch Purchase Orders (using a mock table for now)
      const { data: poData, error: poError } = await supabase
        .from('purchase_orders')
        .select('*');
      if (!poError && poData) setPurchaseOrders(poData);

      // 8. Unified Decision Logic (Command Rollup v3)
      const reconciledProjects = projMaster || [];
      const totalCount = reconciledProjects.length;

      const riskDistribution = {
        critical: reconciledProjects.filter(p => p.delivery_risk_rating === 'Critical' || p.flag_for_ceo_attention).length,
        high: reconciledProjects.filter(p => p.delivery_risk_rating === 'High' && !p.flag_for_ceo_attention).length,
        nominal: reconciledProjects.filter(p => p.delivery_risk_rating === 'Medium').length,
        stable: reconciledProjects.filter(p => !p.delivery_risk_rating || p.delivery_risk_rating === 'Low').length,
      };

      const poBreachesResults = (poData || []).filter(po => po.remaining_balance < 0 || po.status === 'exhausted').length;

      const signals = {
        hasBacklog: documents.filter(d => d.status === 'Review').length > 10,
        backlogCount: documents.filter(d => d.status === 'Review').length,
        stagnantProjects: reconciledProjects.filter(p => p.completion_percent < 100 && new Date(p.updated_at || p.created_at) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
        stagnationIssues: reconciledProjects.filter(p => p.completion_percent < 100 && new Date(p.updated_at || p.created_at) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
        complianceIssues: reconciledProjects.filter(p => p.compliance_status === 'Issues').length,
        poBreaches: poBreachesResults,
        systemStatus: poBreachesResults > 0 ? 'DANGER' : 'NOMINAL',
        riskDistribution,
        clusterCount: 1
      };

      const totalContractValue = reconciledProjects.reduce((sum: number, p: any) => sum + (Number(p.contract_value_excl_vat) || 0), 0);
      const activeBids = (tenderData || []).length;

      const newKpis = [
        { label: "Active Projects", value: totalCount.toString(), trend: "Full Portfolio", trendDirection: "neutral" as const, trendSentiment: "neutral" as const, description: "Universe Synchronized", icon: Briefcase, color: "blue" },
        { label: "Portfolio Value", value: `AED ${(totalContractValue / 1000000).toFixed(1)}M`, trend: "Ledger Verified", trendDirection: "neutral" as const, trendSentiment: "positive" as const, description: "Aggregate Contract Value", icon: DollarSign, color: "emerald" },
        { label: "Active Bids", value: activeBids.toString(), trend: "SLA Compliant", trendDirection: "neutral" as const, trendSentiment: "positive" as const, description: "Open Tenders", icon: FileText, color: "amber" },
        { label: "Critical Hazards", value: (riskDistribution.critical + poBreachesResults).toString(), trend: "Direct Action", trendDirection: (riskDistribution.critical + poBreachesResults) > 0 ? "up" : "neutral" as const, trendSentiment: (riskDistribution.critical + poBreachesResults) > 0 ? "negative" : "positive" as const, description: "Operational Triggers", icon: AlertTriangle, color: 'rose' },
      ];

      setKpis(newKpis);

      // 9. Calculate Status & Charts
      const statusCounts = mappedDocs.reduce((acc: any, doc) => { acc[doc.status] = (acc[doc.status] || 0) + 1; return acc; }, {});
      const newStatusData = [
        { name: 'Approved', value: statusCounts['Approved'] || 0, color: 'var(--color-success)' },
        { name: 'Pending', value: statusCounts['Review'] || 0, color: 'var(--color-warning)' },
        { name: 'Reviewed', value: statusCounts['Reviewed'] || 0, color: '#3b82f6' },
        { name: 'Rejected', value: statusCounts['Rejected'] || 0, color: 'var(--color-critical)' },
      ].filter(d => d.value > 0);
      setStatusData(newStatusData);

      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const last7Days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return { date: d.toISOString().split('T')[0], name: days[d.getDay()] }; });
      const newChartData = last7Days.map(day => {
        const docsOnDay = mappedDocs.filter(d => d.created_at.startsWith(day.date)).length;
        const reviewedOnDay = mappedDocs.filter(d => d.reviewed_at && d.reviewed_at.startsWith(day.date)).length;
        return { name: day.name, docs: docsOnDay, review: reviewedOnDay };
      });
      setChartData(newChartData);

      setError(null);
    } catch (e: any) {
      logger.error('DATA_SYNC_FATAL', e);
      if (e.message && (e.message.includes('relation') || e.message.includes('does not exist'))) {
        // Provide clear instruction on DB failure
        setError("Database schema mismatch. Please run ALL provided SQL scripts.");
      } else {
        setError("Data synchronization failed. Check console for details.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Realtime Subscriptions
    const setupSubscriptions = async () => {
      const client = await getClient();
      const channels = [
        client.channel('documents_channel').on('postgres_changes' as any, { event: '*', schema: 'public', table: 'documents' }, () => fetchData()).subscribe(),
        client.channel('alerts_channel').on('postgres_changes' as any, { event: '*', schema: 'public', table: 'notifications' }, () => fetchData()).subscribe(),
        client.channel('tenders_channel').on('postgres_changes' as any, { event: '*', schema: 'public', table: 'tenders' }, () => fetchData()).subscribe(),
        client.channel('projects_channel').on('postgres_changes' as any, { event: '*', schema: 'public', table: 'projects_master' }, () => fetchData()).subscribe(),
        client.channel('agent_channel').on('postgres_changes' as any, { event: '*', schema: 'public', table: 'agent_activity' }, () => fetchData()).subscribe(),
        client.channel('audit_channel').on('postgres_changes' as any, { event: '*', schema: 'public', table: 'audit_logs' }, () => fetchData()).subscribe(),
        client.channel('po_channel').on('postgres_changes' as any, { event: '*', schema: 'public', table: 'purchase_orders' }, () => fetchData()).subscribe(),
        client.channel('tasks_channel').on('postgres_changes' as any, { event: '*', schema: 'public', table: 'todos' }, () => fetchData()).subscribe(),
      ];

      return () => { channels.forEach(channel => client.removeChannel(channel)); };
    };

    setupSubscriptions();
  }, []);

  // Automated Compliance Scanner Simulation (Client Side)
  useEffect(() => {
    const runComplianceScan = async () => {
      // Logic to detect missing critical documents per project
      const projectsMissingSafety = projects.filter(p => p.project_status === 'Construction' && !documents.find(d => d.type === 'SAFETY' && d.status === 'Approved'));
      if (projectsMissingSafety.length > 0) { /* trigger alert */ }
    };
    if (projects.length > 0 && documents.length > 0) runComplianceScan();
  }, [projects, documents]);

  const riskDistribution = {
    critical: projects.filter(p => (p.delivery_risk_rating === 'Critical' || p.flag_for_ceo_attention)).length,
    high: projects.filter(p => p.delivery_risk_rating === 'High' && !p.flag_for_ceo_attention).length,
    nominal: projects.filter(p => p.delivery_risk_rating === 'Medium').length,
    stable: projects.filter(p => !p.delivery_risk_rating || p.delivery_risk_rating === 'Low').length,
  };

  const signals = {
    hasBacklog: documents.filter(d => d.status === 'Review').length > 10,
    backlogCount: documents.filter(d => d.status === 'Review').length,
    stagnantProjects: projects.filter(p => p.completion_percent < 100 && new Date(p.updated_at) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
    stagnationIssues: projects.filter(p => p.completion_percent < 100 && new Date(p.updated_at) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
    complianceIssues: projects.filter(p => p.compliance_status === 'Issues' || !p.last_compliance_scan).length,
    isAgentIdle: false,
    systemStatus: documents.filter(d => d.status === 'Review').length > 5 ? 'Congested' : 'Optimal',
    riskDistribution
  };

  return { documents, alerts, kpis, chartData, statusData, loading, error, refetch: fetchData, projects, tenders, agentActivity, auditLogs, signals, tasks, purchaseOrders };
};
