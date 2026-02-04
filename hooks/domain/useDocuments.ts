import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { DocumentItem } from '@/types';
import { useSupabase } from '../useSupabase';
import { logger } from '@/lib/logger';

export function useDocuments(searchQuery: string = '') {
    const { getClient } = useSupabase();
    const [documents, setDocuments] = useState<DocumentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const { fetchWithRetry, getErrorMessage } = await import('@/lib/fetch-utils');

            const data = await fetchWithRetry(async () => {
                let query = (supabase.from('documents' as any) as any).select('*');
                if (searchQuery) query = query.or(`title.ilike.%${searchQuery}%,project_name.ilike.%${searchQuery}%`);

                const { data, error } = await query.order('created_at', { ascending: false }).limit(20);

                if (error) throw error;
                return data || [];
            }, {
                maxRetries: 3,
                baseDelay: 1000,
                timeoutMs: 10000
            });

            setDocuments(data);
            setError(null);
        } catch (e: any) {
            const { getErrorMessage } = await import('@/lib/fetch-utils');
            const friendlyMessage = getErrorMessage(e);
            logger.error('DOMAIN_DOCUMENTS_ERROR', e);
            setError(friendlyMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();

        const setupSubscription = async () => {
            const client = await getClient();
            const channel = client.channel('domain_documents_channel')
                .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'documents' }, () => fetchDocuments())
                .subscribe();
            return () => { client.removeChannel(channel); };
        };

        const cleanup = setupSubscription();
        return () => { cleanup.then(unsub => unsub()); };
    }, [searchQuery]);

    return { documents, loading, error, refetch: fetchDocuments };
}
