import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { SystemNotification } from '@/types';
import { useSupabase } from '../useSupabase';
import { logger } from '@/lib/logger';

export function useSystemHealth() {
    const { getClient } = useSupabase();
    const [alerts, setAlerts] = useState<SystemNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            const { fetchWithRetry, getErrorMessage } = await import('@/lib/fetch-utils');

            const data = await fetchWithRetry(async () => {
                const { data, error } = await (supabase
                    .from('system_notifications' as any) as any)
                    .select('*')
                    .order('timestamp', { ascending: false })
                    .limit(10);

                if (error) throw error;
                return data || [];
            }, {
                maxRetries: 3,
                baseDelay: 1000,
                timeoutMs: 10000
            });

            setAlerts(data);
            setError(null);
        } catch (e: any) {
            const { getErrorMessage } = await import('@/lib/fetch-utils');
            const friendlyMessage = getErrorMessage(e);
            logger.error('DOMAIN_ALERTS_ERROR', e);
            setError(friendlyMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();

        const setupSubscription = async () => {
            const client = await getClient();
            const channel = client.channel('domain_alerts_channel')
                .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'system_notifications' }, () => fetchAlerts())
                .subscribe();
            return () => { client.removeChannel(channel); };
        };

        const cleanup = setupSubscription();
        return () => { cleanup.then(unsub => unsub()); };
    }, []);

    return { alerts, loading, error, refetch: fetchAlerts };
}
