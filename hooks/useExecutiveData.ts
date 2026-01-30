import { useQuery } from '@tanstack/react-query';
import { useSupabase } from './useSupabase';

export const useExecutiveData = () => {
    const { getClient } = useSupabase();

    return useQuery({
        queryKey: ['executive-hud'],
        queryFn: async () => {
            const client = await getClient();
            const [invoices, projects, tenders, pos] = await Promise.all([
                client.from('invoices').select('amount, created_at, status'),
                client.from('projects_master').select('*'),
                client.from('tenders').select('value, status, title'),
                client.from('purchase_orders').select('*')
            ]);

            if (invoices.error) throw invoices.error;
            if (projects.error) throw projects.error;
            if (tenders.error) throw tenders.error;
            if (pos.error) throw pos.error;

            // KPI Aggregation logic
            let totalPaidRev = 0;
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const revenueMap: Record<string, number> = {};

            // Initialize with zero
            months.forEach(m => {
                revenueMap[m] = 0;
            });

            (invoices.data || []).forEach(inv => {
                const month = new Date(inv.created_at).toLocaleString('default', { month: 'short' });
                revenueMap[month] = (revenueMap[month] || 0) + (inv.amount || 0);
                if (inv.status === 'Paid') totalPaidRev += inv.amount;
            });

            let totalPipeline = 0;
            const pipelineDistribution: Record<string, number> = {};
            (projects.data || []).forEach(p => {
                const type = p.project_type || 'Infrastructure';
                pipelineDistribution[type] = (pipelineDistribution[type] || 0) + 1;
                totalPipeline += p.contract_value_excl_vat || 0;
            });

            // Financial Iron Dome Analysis
            const poBreaches = (pos.data || []).filter(po => po.remaining_balance < 0 || po.status === 'exhausted');
            const totalPoValue = (pos.data || []).reduce((sum, po) => sum + Number(po.total_amount || 0), 0);
            const budgetIntegrity = totalPoValue > 0 ? (((totalPoValue - poBreaches.length * 100000) / totalPoValue) * 100).toFixed(1) : '100';

            return {
                kpis: {
                    revenue: totalPaidRev,
                    pipeline: totalPipeline,
                    carbon: 0,
                    velocity: 0,
                    budgetIntegrity: Number(budgetIntegrity),
                    poBreachCount: poBreaches.length,
                    safety: { value: 0, label: 'LTI Free Hours', trend: 'neutral' }
                },
                projects: projects.data || [],
                revenueChart: months.map(m => ({ name: m, value: Math.round(revenueMap[m]) })),
                pipelineChart: Object.keys(pipelineDistribution).map(t => ({ name: t, value: pipelineDistribution[t] })),
                poBreaches: poBreaches.map(b => ({ id: b.id, ref: b.po_number, vendor: b.vendor_name, balance: b.remaining_balance }))
            };
        },
        staleTime: 10 * 60 * 1000, // 10 minutes cache for executive data
    });
};