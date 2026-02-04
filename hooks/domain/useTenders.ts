import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Tender } from '@/types';
import { useSupabase } from '../useSupabase';
import { logger } from '@/lib/logger';

export function useTenders(searchQuery: string = '') {
    const { getClient } = useSupabase();
    const [tenders, setTenders] = useState<Tender[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTenders = async () => {
        setLoading(true);
        try {
            const { fetchWithRetry, getErrorMessage } = await import('@/lib/fetch-utils');

            const data = await fetchWithRetry(async () => {
                let query = (supabase.from('tenders' as any) as any).select('*');
                if (searchQuery) query = query.or(`title.ilike.%${searchQuery}%,client.ilike.%${searchQuery}%`);

                const { data, error } = await query.order('created_at', { ascending: false });

                if (error) throw error;
                return data || [];
            }, {
                maxRetries: 3,
                baseDelay: 1000,
                timeoutMs: 10000
            });

            setTenders(data);
            setError(null);
        } catch (e: any) {
            const { getErrorMessage } = await import('@/lib/fetch-utils');
            const friendlyMessage = getErrorMessage(e);
            logger.error('DOMAIN_TENDERS_ERROR', e);
            setError(friendlyMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTenders();

        const setupSubscription = async () => {
            const client = await getClient();
            const channel = client.channel('domain_tenders_channel')
                .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'tenders' }, () => fetchTenders())
                .subscribe();

            return () => { client.removeChannel(channel); };
        };

        const cleanup = setupSubscription();
        return () => { cleanup.then(unsub => unsub()); };
    }, [searchQuery]);

    return { tenders, loading, error, refetch: fetchTenders };
}
