import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserPreferences } from '../types';

export function usePreferences() {
    const [preferences, setPreferences] = useState<UserPreferences | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPreferences();
    }, []);

    async function fetchPreferences() {
        // In a demo, we fetch or create a default record
        const { data, error } = await (supabase
            .from('user_preferences' as any) as any)
            .select('*')
            .maybeSingle();

        if (!error && data) {
            setPreferences(data);
        } else {
            const defaults: Partial<UserPreferences> = {
                theme: 'dark',
                default_view: 'dashboard',
                default_sort: 'due_date',
                tasks_per_page: 20,
                date_format: 'MM/DD/YYYY',
                time_format: '12h',
                email_notifications: true
            };

            // Try to create defaults if missing (ignore error if no user_id available)
            setPreferences(defaults as UserPreferences);
        }
        setLoading(false);
    }

    async function updatePreference(updates: Partial<UserPreferences>) {
        // This assumes user_preferences exists for the user
        const { error } = await (supabase
            .from('user_preferences' as any) as any)
            .update(updates)
            .eq('user_id', preferences?.user_id);

        if (!error) {
            setPreferences(prev => prev ? { ...prev, ...updates } : null);
        }
    }

    return { preferences, updatePreference, loading };
}
