import { useState, useEffect, useMemo } from 'react';
import { useDashboardData } from './useDashboardData';

export type ReportSource = 'PROJECTS' | 'TENDERS' | 'FINANCIALS';
export type ReportProfile = 'Executive' | 'Standard' | 'Depth' | 'Audit';

interface UseReportsProps {
    source: ReportSource;
    profile: ReportProfile;
    groupBy?: 'Platform' | 'Location' | 'Day';
}

export const useReports = ({ source, profile, groupBy }: UseReportsProps) => {
    const { projects, tenders, auditLogs, purchaseOrders, loading } = useDashboardData();
    const [data, setData] = useState<any>([]);

    const rawData = useMemo(() => {
        if (source === 'PROJECTS') return projects.map(p => ({ 
            ...p,
            id: p.id,
            identifier: p.project_name, 
            status: p.project_status, 
            value: Number(p.contract_value_excl_vat || 0),
            completion: p.completion_percent,
            risk: p.delivery_risk_rating,
            location: p.project_location_city || 'Global',
            platform: p.doc_control_platform || 'Internal',
            updated_at: p.updated_at || new Date().toISOString()
        }));
        if (source === 'TENDERS') return tenders.map(t => ({ 
            ...t,
            id: t.id,
            identifier: t.title, 
            status: t.status, 
            value: Number(t.value || 0),
            location: t.client || 'Corporate',
            platform: 'MCE_Portal',
            updated_at: t.created_at || new Date().toISOString()
        }));
        if (source === 'FINANCIALS') return purchaseOrders.map(po => ({
            ...po,
            id: po.id,
            identifier: po.po_number,
            status: po.status,
            value: Number(po.total_amount || 0),
            location: po.vendor_name || 'Supply Chain',
            platform: 'Oracle_ERP',
            updated_at: po.created_at || new Date().toISOString()
        }));
        return [];
    }, [source, projects, tenders, purchaseOrders]);

    const transformByProfile = (items: any[]) => {
        switch (profile) {
            case 'Executive':
                return items.map(d => ({
                    IDENTIFIER: d.identifier,
                    VALUE_AED: (d.value / 1000000).toFixed(2) + 'M',
                    STATUS: d.status?.toUpperCase(),
                    PROGRESS: d.completion ? `${d.completion}%` : 'N/A',
                    RISK_VECTOR: d.risk || 'NOMINAL'
                }));
            case 'Audit':
                // For Audit, we return richer metadata for the hierarchy
                return items.map(d => ({
                    ...d,
                    RECORD_ID: d.id.substring(0, 8),
                    LAST_MODIFIED: new Date(d.updated_at).toLocaleDateString(),
                    PLATFORM: d.platform,
                    LOCATION: d.location
                }));
            case 'Depth':
                return items; // Full raw data
            default: // Standard
                return items.map(d => ({ 
                    NAME: d.identifier, 
                    CODE: d.project_code || d.id.substring(0, 4),
                    CLIENT: d.client_name || d.client || d.vendor_name || 'N/A',
                    STATUS: d.status, 
                    LOCATION: d.location 
                }));
        }
    };

    useEffect(() => {
        if (loading) return;
        
        let processedData: any[] = transformByProfile(rawData);
        
        // 1. Dynamic Grouping (Pivot)
        if (groupBy) {
            const grouped = processedData.reduce((acc: any, item: any) => {
                 let key = 'Other';
                 if (groupBy === 'Platform') key = item.PLATFORM || item.platform || 'Internal';
                 if (groupBy === 'Location') key = item.LOCATION || item.location || 'HQ';
                 if (groupBy === 'Day') key = new Date(item.updated_at || new Date()).toLocaleDateString('en-US', { weekday: 'long' });
                 
                 acc[key] = acc[key] || [];
                 acc[key].push(item);
                 return acc;
             }, {});
             setData(grouped);
             return;
        }

        // 2. Default Audit Hierarchy (Platform -> Location -> Day)
        if (profile === 'Audit') {
             const hierarchy = processedData.reduce((acc: any, item: any) => {
                const platform = item.PLATFORM || 'MCE_Internal';
                const location = item.LOCATION || 'Corporate_HQ';
                const day = new Date(item.updated_at).toISOString().split('T')[0];

                if (!acc[platform]) acc[platform] = {};
                if (!acc[platform][location]) acc[platform][location] = {};
                if (!acc[platform][location][day]) acc[platform][location][day] = [];

                acc[platform][location][day].push({
                    ARTIFACT: item.identifier,
                    STATUS: item.status,
                    ID: item.RECORD_ID,
                    TIMESTAMP: new Date(item.updated_at).toLocaleTimeString()
                });

                return acc;
            }, {});
            setData(hierarchy);
            return;
        }

        setData(processedData);

    }, [loading, source, profile, groupBy, rawData]);

    return { data, isLoading: loading };
};