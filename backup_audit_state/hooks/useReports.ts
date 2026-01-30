import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export type ReportProfile = 'Executive' | 'Standard' | 'Depth' | 'Audit';
export type ReportSource = 'PROJECTS' | 'TENDERS' | 'FINANCIALS';

interface ReportOptions {
    source: ReportSource;
    profile: ReportProfile;
    groupBy?: 'Platform' | 'Location' | 'Day';
}

// Mock Data Stores
const MOCK_PROJECTS = [
    { id: '1', PROJECT_NAME: 'Skyline Tower Alpha', PROJECT_CODE: 'STA-001', CLIENT_NAME: 'Emaar Properties', CONTRACT_VALUE_EXCL_VAT: 450000000, PROJECT_STATUS: 'Active', PROJECT_LOCATION_CITY: 'Dubai', DOC_CONTROL_PLATFORM: 'Aconex', created_at: '2025-11-15T00:00:00Z', updated_at: '2026-01-20T00:00:00Z', COMPLETION_PERCENT: 42 },
    { id: '2', PROJECT_NAME: 'West Rails Infra', PROJECT_CODE: 'WRI-099', CLIENT_NAME: 'Transport for London', CONTRACT_VALUE_EXCL_VAT: 1200000000, PROJECT_STATUS: 'Risk', PROJECT_LOCATION_CITY: 'London', DOC_CONTROL_PLATFORM: 'Procore', created_at: '2025-08-10T00:00:00Z', updated_at: '2025-12-05T00:00:00Z', COMPLETION_PERCENT: 78 },
    { id: '3', PROJECT_NAME: 'Eco-District Phase 2', PROJECT_CODE: 'EDP-002', CLIENT_NAME: 'Masdar', CONTRACT_VALUE_EXCL_VAT: 85000000, PROJECT_STATUS: 'Active', PROJECT_LOCATION_CITY: 'Abu Dhabi', DOC_CONTROL_PLATFORM: 'Accruent', created_at: '2025-12-01T00:00:00Z', updated_at: '2026-01-24T00:00:00Z', COMPLETION_PERCENT: 12 },
    { id: '4', PROJECT_NAME: 'Harbor Logistics Hub', PROJECT_CODE: 'HLH-550', CLIENT_NAME: 'DP World', CONTRACT_VALUE_EXCL_VAT: 320000000, PROJECT_STATUS: 'Delayed', PROJECT_LOCATION_CITY: 'Jebel Ali', DOC_CONTROL_PLATFORM: 'Aconex', created_at: '2025-06-15T00:00:00Z', updated_at: '2025-11-30T00:00:00Z', COMPLETION_PERCENT: 94 },
    { id: '5', PROJECT_NAME: 'North Sea Wind Farm', PROJECT_CODE: 'NSW-001', CLIENT_NAME: 'Orsted', CONTRACT_VALUE_EXCL_VAT: 600000000, PROJECT_STATUS: 'Active', PROJECT_LOCATION_CITY: 'Rotterdam', DOC_CONTROL_PLATFORM: 'SharePoint', created_at: '2026-01-05T00:00:00Z', updated_at: '2026-01-25T00:00:00Z', COMPLETION_PERCENT: 25 },
    { id: '6', PROJECT_NAME: 'Al Khail Avenue Fitout', PROJECT_CODE: 'AKA-202', CLIENT_NAME: 'Nakheel', CONTRACT_VALUE_EXCL_VAT: 45000000, PROJECT_STATUS: 'Completed', PROJECT_LOCATION_CITY: 'Dubai', DOC_CONTROL_PLATFORM: 'Procore', created_at: '2025-01-10T00:00:00Z', updated_at: '2025-10-15T00:00:00Z', COMPLETION_PERCENT: 100 },
    { id: '7', PROJECT_NAME: 'Riyadh Metro Station 4', PROJECT_CODE: 'RMS-004', CLIENT_NAME: 'Riyadh Dev Authority', CONTRACT_VALUE_EXCL_VAT: 850000000, PROJECT_STATUS: 'Active', PROJECT_LOCATION_CITY: 'Riyadh', DOC_CONTROL_PLATFORM: 'Aconex', created_at: '2025-09-20T00:00:00Z', updated_at: '2026-01-22T00:00:00Z', COMPLETION_PERCENT: 60 },
];

const MOCK_TENDERS = [
    { id: '1', title: 'Museum of Future Expansion', client: 'Dubai Future Foundation', value: 150000000, status: 'Submitted', created_at: '2026-01-10T00:00:00Z' },
    { id: '2', title: 'Yas Island Arena Works', client: 'Miral', value: 45000000, status: 'Pricing', created_at: '2026-01-18T00:00:00Z' },
    { id: '3', title: 'NEOM The Line - Sector 4', client: 'NEOM', value: 5000000000, status: 'Prequalification', created_at: '2025-12-15T00:00:00Z' },
    { id: '4', title: 'Red Sea Resort Phase 1', client: 'Red Sea Global', value: 750000000, status: 'Lost', created_at: '2025-11-01T00:00:00Z' },
];

const MOCK_FINANCIALS = [
    { id: '1', invoice_number: 'INV-2026-001', amount: 450000, status: 'Paid', due_date: '2026-01-15', client: 'Emaar Properties' },
    { id: '2', invoice_number: 'INV-2026-002', amount: 125000, status: 'Sent', due_date: '2026-02-01', client: 'Masdar' },
    { id: '3', invoice_number: 'INV-2026-003', amount: 3200000, status: 'Overdue', due_date: '2025-12-30', client: 'Transport for London' },
    { id: '4', invoice_number: 'INV-2026-004', amount: 85000, status: 'Draft', due_date: '2026-02-15', client: 'Nakheel' },
];

export const useReports = (options: ReportOptions) => {
    return useQuery({
        queryKey: ['reports', options.source, options.profile, options.groupBy],
        queryFn: async () => {
            let table = 'projects_master';
            let mockData = MOCK_PROJECTS;

            if (options.source === 'TENDERS') {
                table = 'tenders';
                mockData = MOCK_TENDERS as any;
            }
            if (options.source === 'FINANCIALS') {
                table = 'invoices';
                mockData = MOCK_FINANCIALS as any;
            }

            const { data, error } = await supabase
                .from(table)
                .select('*');

            // Fallback to mock data if DB is empty or has invalid data (e.g. no names)
            const isValid = data && data.length > 0 && (data[0].project_name || data[0].PROJECT_NAME || data[0].title);
            const finalData = isValid ? data : mockData;

            // Profile-based Transformation
            return transformByProfile(finalData, options.profile, options.groupBy);
        },
        enabled: !!options.source && !!options.profile,
    });
};

function transformByProfile(data: any[], profile: ReportProfile, groupBy?: string) {
    // 1. Basic Transformation & Metadata Enhancement
    const now = new Date();
    let transformed = data.map(item => {
        const base: any = { ...item };
        const updatedAt = new Date(item.updated_at || item.created_at || now);
        const diffDays = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 3600 * 24));

        // Add Audit Metadata
        base._audit = {
            stagnant: diffDays > 30,
            daysSinceUpdate: diffDays,
            formattedDate: new Date(item.created_at || now).toISOString().split('T')[0]
        };

        return base;
    });

    // 2. Profile Column Filtering
    let filtered: any[];
    switch (profile) {
        case 'Executive':
            filtered = transformed.map(d => ({
                IDENTIFIER: d.project_name || d.PROJECT_NAME || d.title || d.invoice_number,
                ENTITY: d.client_name || d.CLIENT_NAME || d.client || 'N/A',
                VALUE_AED: (d.contract_value_excl_vat || d.CONTRACT_VALUE_EXCL_VAT || d.value || d.amount || 0).toLocaleString(),
                STATUS: d.project_status || d.PROJECT_STATUS || d.status || 'OPEN',
                PROGRESS: (d.completion_percent || d.COMPLETION_PERCENT) ? `${d.completion_percent || d.COMPLETION_PERCENT}%` : 'N/A'
            }));
            break;
        case 'Audit':
            filtered = transformed.map(d => ({
                RECORD_ID: d.id?.substring(0, 8) || 'N/A',
                IDENTIFIER: d.project_name || d.PROJECT_NAME || d.title || d.invoice_number,
                CREATED: d._audit.formattedDate,
                STAGNANCY: d._audit.stagnant ? '⚠️ STAGNANT' : '✅ ACTIVE',
                DAYS_IDLE: d._audit.daysSinceUpdate,
                LAST_SYNC: new Date(d.updated_at || d.created_at || new Date()).toLocaleDateString()
            }));
            break;
        case 'Depth':
            filtered = transformed; // Return full data
            break;
        default: // Standard
            filtered = transformed.map(d => ({
                NAME: d.project_name || d.PROJECT_NAME || d.title || d.invoice_number || 'Unnamed Project',
                CODE: d.project_code || d.PROJECT_CODE || 'N/A',
                CLIENT: d.client_name || d.CLIENT_NAME || d.client || 'N/A',
                STATUS: d.project_status || d.PROJECT_STATUS || d.status || 'N/A',
                LOCATION: d.project_location_city || d.PROJECT_LOCATION_CITY || 'N/A'
            }));
    }

    // 3. Drill-down / Grouping Logic
    if (groupBy) {
        const groups: Record<string, any[]> = {};

        transformed.forEach((item, index) => {
            let key = 'Other';

            if (groupBy === 'Platform') {
                key = item.doc_control_platform || item.DOC_CONTROL_PLATFORM || 'INTERNAL';
            } else if (groupBy === 'Location') {
                key = item.project_location_city || item.PROJECT_LOCATION_CITY || item.client || 'Global';
            } else if (groupBy === 'Day') {
                key = item._audit.formattedDate;
            }

            if (!groups[key]) groups[key] = [];
            groups[key].push(filtered[index]);
        });

        return groups;
    }

    // 4. Default Hierarchical Audit (Platform -> Location -> Day)
    if (profile === 'Audit') {
        const hierarchy: any = {};

        transformed.forEach((item, index) => {
            const platform = item.doc_control_platform || item.DOC_CONTROL_PLATFORM || 'INTERNAL';
            const location = item.project_location_city || item.PROJECT_LOCATION_CITY || item.client || 'Global';
            const day = item._audit.formattedDate;

            if (!hierarchy[platform]) hierarchy[platform] = {};
            if (!hierarchy[platform][location]) hierarchy[platform][location] = {};
            if (!hierarchy[platform][location][day]) hierarchy[platform][location][day] = [];

            hierarchy[platform][location][day].push(filtered[index]);
        });

        return hierarchy;
    }

    return filtered;
}
