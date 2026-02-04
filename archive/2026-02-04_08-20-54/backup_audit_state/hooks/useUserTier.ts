import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
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
  let clerkUser: any;
  let clerkLoaded = true;
  
  try {
    const { user, isLoaded } = useUser();
    clerkUser = user;
    clerkLoaded = isLoaded;
  } catch (e) {
    // If ClerkProvider is missing, we are in Developer Bypass mode
    clerkUser = { id: 'demo-admin', fullName: 'System Developer', primaryEmailAddress: { emailAddress: 'dev@morgan.com' } };
    clerkLoaded = true;
  }

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tier, setTier] = useState<PermissionTier>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clerkLoaded) return;
    
    // If we are in demo/bypass mode (id starting with demo-)
    if (clerkUser?.id === 'demo-admin') {
      setTier('L4');
      setProfile({
        id: 'demo-id',
        clerk_user_id: 'demo-admin',
        email: 'dev@morgan.com',
        full_name: 'System Developer',
        role: 'super_admin',
        tier: 'L4'
      });
      setLoading(false);
      return;
    }

    if (!clerkUser) {
      setTier(null);
      setLoading(false);
      return;
    }

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch profile from Supabase using Clerk user ID
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('clerk_user_id', clerkUser.id)
          .single();

        if (fetchError) {
          // If profile doesn't exist, create one with default L1 tier
          if (fetchError.code === 'PGRST116') {
            // Row not found
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert([
                {
                  clerk_user_id: clerkUser.id,
                  email: clerkUser.primaryEmailAddress?.emailAddress,
                  full_name: clerkUser.fullName || clerkUser.username || 'User',
                  role: 'staff' // Default role (tier will be auto-set to L1 by trigger)
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
  }, [clerkUser?.id, clerkLoaded]);

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

  return {
    profile,
    tier,
    loading,
    error,
    hasPermission,
    isL4Admin: tier === 'L4'
  };
}
