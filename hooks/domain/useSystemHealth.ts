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
            const { data, error } = await supabase
                .from('system_notifications')
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(10);

            if (error) throw error;
            setAlerts(data || []);
            setError(null);
        } catch (e: any) {
            logger.error('DOMAIN_ALERTS_ERROR', e);
            setError(e.message);
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
