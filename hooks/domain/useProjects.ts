import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Project } from '@/types';
import { useSupabase } from '../useSupabase';
import { logger } from '@/lib/logger';

export function useProjects(searchQuery: string = '') {
    const { getClient } = useSupabase();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            let query = supabase.from('projects_master').select('*', { count: 'exact' });
            if (searchQuery) {
                query = query.or(`project_name.ilike.%${searchQuery}%,project_code.ilike.%${searchQuery}%`);
            }
            const { data, error } = await query;

            if (error) throw error;
            setProjects(data || []);
            logger.debug('DOMAIN_PROJECTS_SYNC', { count: data?.length });
            setError(null);
        } catch (e: any) {
            logger.error('DOMAIN_PROJECTS_ERROR', e);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();

        const setupSubscription = async () => {
            const client = await getClient();
            const channel = client.channel('domain_projects_channel')
                .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'projects_master' }, () => fetchProjects())
                .subscribe();

            return () => { client.removeChannel(channel); };
        };

        const cleanup = setupSubscription();
        return () => { cleanup.then(unsub => unsub()); };
    }, [searchQuery]);

    return { projects, loading, error, refetch: fetchProjects };
}
