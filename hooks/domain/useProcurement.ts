import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export interface PurchaseOrder {
    id: string;
    po_number: string;
    description: string;
    vendor_name: string;
    total_amount: number;
    remaining_balance: number;
    status: 'draft' | 'issued' | 'paid' | 'exhausted';
    project_id?: string;
    created_at: string;
}

export function useProcurement(searchQuery: string = '') {
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPOs = async () => {
        setLoading(true);
        try {
            let query = (supabase.from('purchase_orders' as any) as any).select('*');

            if (searchQuery) {
                query = query.or(`po_number.ilike.%${searchQuery}%,vendor_name.ilike.%${searchQuery}%`);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;
            setPurchaseOrders(data || []);
            setError(null);
        } catch (e: any) {
            logger.error('DOMAIN_PROCUREMENT_ERROR', e);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPOs();

        // Real-time subscription for immediate updates
        const subscription = supabase
            .channel('procurement_changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'purchase_orders' },
                () => {
                    logger.info('REALTIME_POS_UPDATE');
                    fetchPOs();
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [searchQuery]);

    return {
        purchaseOrders,
        loading,
        error,
        refetch: fetchPOs,
        // Helper to check budget health
        metrics: {
            totalValue: purchaseOrders.reduce((acc, po) => acc + (Number(po.total_amount) || 0), 0),
            breachedCount: purchaseOrders.filter(po => po.remaining_balance < 0).length
        }
    };
}
