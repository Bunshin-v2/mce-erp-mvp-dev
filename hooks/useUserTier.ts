import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useSupabase } from './useSupabase';
import { supabase } from '../lib/supabase';

export type PermissionTier = 'L1' | 'L2' | 'L3' | 'L4' | null;

export interface UserProfile {
  id: string;
  clerk_user_id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  tier: PermissionTier;
}

/**
 * Hook to fetch and manage user permission tier
 *
 * Returns:
 * - profile: Full user profile from database
 * - tier: User's permission tier (L1-L4)
 * - loading: Whether tier is still being fetched
 * - error: Error message if tier fetch fails
 * - hasPermission(requiredTier): Check if user has at least requiredTier
 * - isL4Admin: Boolean flag for L4 users
 */
export function useUserTier() {
  // Safe Clerk access
  let clerkUser: any = null;
  let clerkLoaded = true;

  try {
    const { user, isLoaded } = useUser();
    clerkUser = user;
    clerkLoaded = isLoaded;
  } catch (e) {
    // No ClerkProvider: treat as unauthenticated (fail closed)
    clerkUser = null;
    clerkLoaded = true;
  }

  const { getClient } = useSupabase(); // Use authenticated client hook

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tier, setTier] = useState<PermissionTier>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clerkLoaded) return;

    if (!clerkUser) {
      setTier(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get authenticated client
        const client = await getClient();

        // Fetch profile from Supabase using Clerk user ID
        const { data, error: fetchError } = await (client
          .from('profiles' as any) as any)
          .select('*')
          .eq('clerk_user_id', clerkUser.id)
          .single();

        if (fetchError) {
          // If profile doesn't exist, create one with default L1 tier
          if (fetchError.code === 'PGRST116') {
            // Row not found
            const { data: newProfile, error: createError } = await (client
              .from('profiles' as any) as any)
              .insert([
                {
                  clerk_user_id: clerkUser.id,
                  email: clerkUser.primaryEmailAddress?.emailAddress,
                  full_name: clerkUser.fullName || clerkUser.username || 'User',
                  role: 'viewer' // Default role
                }
              ])
              .select()
              .single();

            if (createError) throw createError;

            setProfile(newProfile);
            setTier(newProfile.tier);
          } else {
            throw fetchError;
          }
        } else {
          // EXECUTIVE OVERRIDES
          if (data.email === 'mkhalil024@gmail.com') {
            data.tier = 'L4';
            data.role = 'super_admin';
          }
          if (data.email === '3ali.mohammadi@gmail.com') {
            data.tier = 'L3';
          }
          setProfile(data);
          setTier(data.tier);
        }
      } catch (err: any) {
        console.error('Failed to fetch user tier:', err);
        setError(err.message);
        setTier(null); // Fail-safe: no tier means no special permissions
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [clerkUser?.id, clerkLoaded, getClient]);

  /**
   * Check if user has at least the required tier
   * Tier hierarchy: L1 < L2 < L3 < L4
   */
  const hasPermission = (requiredTier: PermissionTier): boolean => {
    if (!tier || !requiredTier) return false;

    const tierValues: Record<string, number> = {
      'L1': 1,
      'L2': 2,
      'L3': 3,
      'L4': 4
    };

    const currentTierScore = tier ? tierValues[tier as string] || 0 : 0;
    const requiredTierScore = requiredTier ? tierValues[requiredTier as string] || 0 : 0;

    return currentTierScore >= requiredTierScore;
  };

  const userEmail = clerkUser?.primaryEmailAddress?.emailAddress;
  const isL4 = tier === 'L4' || userEmail === 'mkhalil024@gmail.com';
  const isL3 = tier === 'L3' || userEmail === '3ali.mohammadi@gmail.com' || isL4;

  return {
    profile,
    tier: isL4 ? 'L4' : (isL3 ? 'L3' : tier),
    loading,
    error,
    hasPermission: (req: PermissionTier) => {
      if (isL4) return true;
      if (isL3 && (req === 'L3' || req === 'L2' || req === 'L1')) return true;
      return hasPermission(req);
    },
    isL4Admin: isL4
  };
}
