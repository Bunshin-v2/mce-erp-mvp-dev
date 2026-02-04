import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DocumentItem, KPIMetric, SystemNotification, ChartData } from '../types';
import { FileText, Clock, AlertTriangle, Briefcase, CheckCircle2, DollarSign, ShieldCheck } from 'lucide-react';

export const useDashboardData = () => {
  // 1. Restore Missing State Definitions
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
    let query = supabase.from('tasks').select('*');
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
      console.log(`[DashboardData] Fetched ${mappedDocs.length} documents.`);
      setDocuments(mappedDocs);

      // 2. Fetch Alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (alertsError) throw alertsError;
      setAlerts((alertsData || []).map((a: any) => ({
        id: a.id,
        title: a.title,
        message: a.message,
        timestamp: new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        priority: a.severity,
        isUnread: !a.acked_at,
        acked_at: a.acked_at
      })));

      // 3. Fetch Projects with Search
      let projectQuery = supabase.from('projects_master').select('*', { count: 'exact' });
      if (searchQuery) {
        projectQuery = projectQuery.or(`project_name.ilike.%${searchQuery}%,project_code.ilike.%${searchQuery}%`);
      }
      const { data: projMaster, error: projError } = await projectQuery;
      if (projError) throw projError;
      console.log(`[DashboardData] Fetched ${projMaster?.length || 0} projects.`);
      setProjects(projMaster || []);

      // 4. Fetch Tenders with Search
      let tenderQuery = supabase.from('tenders').select('*');
      if (searchQuery) {
        tenderQuery = tenderQuery.or(`title.ilike.%${searchQuery}%,client.ilike.%${searchQuery}%`);
      }
      const { data: tenderData, error: tenderError } = await tenderQuery.order('created_at', { ascending: false });
      if (tenderError) throw tenderError;
      setTenders(tenderData || []);

      // 5. Fetch Agent Activity (Design Doc Step 5)
      const { data: activityData, error: activityError } = await supabase
        .from('agent_activity')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(20);
      if (activityError) throw activityError;
      setAgentActivity(activityData || []);

      // 6. Fetch Audit Logs (Design Doc Step 4)
      const { data: logData, error: logError } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (logError) throw logError;
      setAuditLogs(logData || []);

      // 7. Fetch Iron Dome PO Data
      const { data: poData, error: poError } = await supabase
        .from('purchase_orders')
        .select('*');
      if (!poError && poData) setPurchaseOrders(poData);

      // 6. Unified Decision Logic (Command Rollup v3)
      const reconciledProjects = projMaster || [];
      const totalCount = reconciledProjects.length;

      const riskDistribution = {
        critical: reconciledProjects.filter(p => p.delivery_risk_rating === 'Critical' || p.flag_for_ceo_attention).length,
        high: reconciledProjects.filter(p => p.delivery_risk_rating === 'High' && !p.flag_for_ceo_attention).length,
        nominal: reconciledProjects.filter(p => p.delivery_risk_rating === 'Medium').length,
        stable: reconciledProjects.filter(p => !p.delivery_risk_rating || p.delivery_risk_rating === 'Low').length,
      };

      // Iron Dome Breach Detection
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
        {
          label: "Active Projects",
          value: totalCount.toString(),
          trend: "Full Portfolio",
          trendDirection: "neutral" as const,
          trendSentiment: "neutral" as const,
          description: "Universe Synchronized",
          icon: Briefcase,
          color: "blue"
        },
        {
          label: "Portfolio Value",
          value: `AED ${(totalContractValue / 1000000).toFixed(1)}M`,
          trend: "Ledger Verified",
          trendDirection: "neutral" as const,
          trendSentiment: "positive" as const,
          description: "Aggregate Contract Value",
          icon: DollarSign,
          color: "emerald"
        },
        {
          label: "Active Bids",
          value: activeBids.toString(),
          trend: "SLA Compliant",
          trendDirection: "neutral" as const,
          trendSentiment: "positive" as const,
          description: "Open Tenders",
          icon: FileText,
          color: "amber"
        },
        {
          label: "Critical Hazards",
          value: (riskDistribution.critical + poBreachesResults).toString(),
          trend: "Direct Action",
          trendDirection: (riskDistribution.critical + poBreachesResults) > 0 ? "up" : "neutral" as const,
          trendSentiment: (riskDistribution.critical + poBreachesResults) > 0 ? "negative" : "positive" as const,
          description: "Operational Triggers",
          icon: AlertTriangle,
          color: 'rose'
        },

      ];

      setKpis(newKpis);

      // 5. Calculate Stats & Charts

      // Status Pie Chart
      const statusCounts = mappedDocs.reduce((acc: any, doc) => {
        acc[doc.status] = (acc[doc.status] || 0) + 1;
        return acc;
      }, {});

      const newStatusData = [
        { name: 'Approved', value: statusCounts['Approved'] || 0, color: '#10b981' },
        { name: 'Pending', value: statusCounts['Review'] || 0, color: '#f59e0b' },
        { name: 'Reviewed', value: statusCounts['Reviewed'] || 0, color: '#3b82f6' },
        { name: 'Rejected', value: statusCounts['Rejected'] || 0, color: '#ef4444' },
      ].filter(d => d.value > 0);
      setStatusData(newStatusData);

      // Velocity Chart
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
          date: d.toISOString().split('T')[0],
          name: days[d.getDay()]
        };
      });

      const newChartData = last7Days.map(day => {
        const docsOnDay = mappedDocs.filter(d => d.created_at.startsWith(day.date)).length;
        const reviewedOnDay = mappedDocs.filter(d => d.reviewed_at && d.reviewed_at.startsWith(day.date)).length;
        return { name: day.name, docs: docsOnDay, review: reviewedOnDay };
      });
      setChartData(newChartData);

      setError(null);
    } catch (e: any) {
      console.error(e);
      if (e.message && (e.message.includes('relation') || e.message.includes('does not exist'))) {
        setError("Database schema mismatch. Please run the provided SQL scripts.");
      } else {
        setError(e.message || "An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Realtime Subscriptions
    const channels = [
      supabase.channel('documents_channel').on('postgres_changes' as any, { event: '*', schema: 'public', table: 'documents' }, fetchData).subscribe(),
      supabase.channel('alerts_channel').on('postgres_changes' as any, { event: '*', schema: 'public', table: 'alerts' }, fetchData).subscribe(),
      supabase.channel('tenders_channel').on('postgres_changes' as any, { event: '*', schema: 'public', table: 'tenders' }, fetchData).subscribe(),
      supabase.channel('projects_channel').on('postgres_changes' as any, { event: '*', schema: 'public', table: 'projects_master' }, fetchData).subscribe(),
      supabase.channel('agent_channel').on('postgres_changes' as any, { event: '*', schema: 'public', table: 'agent_activity' }, fetchData).subscribe(),
      supabase.channel('audit_channel').on('postgres_changes' as any, { event: '*', schema: 'public', table: 'audit_logs' }, fetchData).subscribe(),
      supabase.channel('po_channel').on('postgres_changes' as any, { event: '*', schema: 'public', table: 'purchase_orders' }, fetchData).subscribe(),
      supabase.channel('tasks_channel').on('postgres_changes' as any, { event: '*', schema: 'public', table: 'tasks' }, fetchData).subscribe(),
    ];

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, []);

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

  // Phase 15: Automated Compliance Scanner Simulation
  useEffect(() => {
    const runComplianceScan = async () => {
      console.log("Agent-03: Initiating global compliance scan...");
      // Logic to detect missing critical documents per project
      const projectsMissingSafety = projects.filter(p => p.project_status === 'Construction' && !documents.find(d => d.type === 'SAFETY' && d.status === 'Approved'));
      if (projectsMissingSafety.length > 0) {
        console.log(`Agent-03: Compliance breach detected in ${projectsMissingSafety.length} active sites.`);
      }
    };
    if (projects.length > 0 && documents.length > 0) runComplianceScan();
  }, [projects, documents]);

  // Phase 7: Automated Worker Simulation
  useEffect(() => {
    const runAutomatedChecks = async () => {
      const stalled = projects.filter(p => !p.flag_for_ceo_attention && p.completion_percent > 0 && p.completion_percent < 90);
      if (stalled.length > 0) {
        console.log("Agent-00: Detected potential project stagnation. Flagging for review.");
      }
    };
    if (projects.length > 0) runAutomatedChecks();
  }, [projects]);

  return { documents, alerts, kpis, chartData, statusData, loading, error, refetch: fetchData, projects, tenders, agentActivity, auditLogs, signals, tasks, purchaseOrders };
};