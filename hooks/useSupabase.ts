import { useAuth } from '@clerk/clerk-react';
import { useMemo } from 'react';
import { getSupabaseClient } from '../lib/supabase';

/**
 * Hook to get a Supabase client authenticated with the current user's Clerk session.
 *
 * Usage:
 * const client = useSupabase();
 * const { data } = await client.from('table').select('*');
 *
 * If the user is NOT logged in, it falls back to the anonymous client (public access only).
 * If Clerk is not available, returns the anonymous client.
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
        const client = getSupabaseClient();
        if (!userId) return client;

        try {
            const token = await getToken({ template: 'supabase' });

            if (token) {
                // Update the singleton's session with the Clerk-generated JWT
                await client.auth.setSession({
                    access_token: token,
                    refresh_token: '',
                });
            }

            return client;
        } catch (error) {
            console.error('Error fetching Supabase token from Clerk:', error);
            return client;
        }
    };

    return { getClient };
}
