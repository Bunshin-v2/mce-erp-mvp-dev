import { useAuth } from '@clerk/clerk-react';
import { useMemo } from 'react';
import { createAuthenticatedClient, supabase } from '../lib/supabase';

/**
 * Hook to get a Supabase client authenticated with the current user's Clerk session.
 * 
 * Usage:
 * const client = useSupabase();
 * const { data } = await client.from('table').select('*');
 * 
 * If the user is NOT logged in, it falls back to the anonymous client (public access only).
 */
export function useSupabase() {
    const { getToken, userId } = useAuth();

    // We use useMemo to ensure we don't recreate the client unnecessarily, but
    // in reality this might need to be async-aware. 
    // However, since createClient is synchronous, we just need the token.
    // The challenge is getToken is async.

    // Strategy: We return a helper function that resolves the client, 
    // OR we just return the fetcher function wrapper.

    // Simpler approach for React Query / useEffect usage:
    // Provide a method to get the client asynchronously.

    const getClient = async () => {
        if (!userId) return supabase;

        try {
            // 'supabase' here refers to the JWT template name in Clerk Dashboard.
            // You MUST create a template named 'supabase' in Clerk > JWT Templates.
            const token = await getToken({ template: 'supabase' });

            if (!token) return supabase;

            return createAuthenticatedClient(token);
        } catch (error) {
            console.error('Error fetching Supabase token from Clerk:', error);
            return supabase;
        }
    };

    return { getClient };
}
