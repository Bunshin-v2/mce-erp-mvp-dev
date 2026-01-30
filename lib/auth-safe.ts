import { auth } from '@clerk/nextjs/server';
import { logger } from '@/lib/logger';

/**
 * Robust auth helper that prevents 500 errors if Clerk is misconfigured
 * or the session is invalid.
 */
export async function getSafeAuth() {
  try {
    const authResult = await auth();
    return {
      userId: authResult.userId,
      orgId: authResult.orgId,
      sessionClaims: authResult.sessionClaims,
      getToken: authResult.getToken,
    };
  } catch (error) {
    logger.warn('AUTH_BOUND_FAILURE', { 
      error: error instanceof Error ? error.message : 'Unknown' 
    });
    return {
      userId: null,
      orgId: null,
      sessionClaims: null,
      getToken: async () => null,
    };
  }
}
