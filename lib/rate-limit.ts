import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Production-ready Redis-backed rate limiting
// Fallback to memory-based limiting if environment variables are missing
let ratelimit: Ratelimit | null = null;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '60 s'), // 20 requests per minute
      analytics: true,
      prefix: '@nexus-erp/ratelimit',
    });
  }
} catch (error) {
  console.error('[RateLimit] Failed to initialize Upstash Redis:', error);
}

export interface RateLimitOptions {
  windowMs: number;
  max: number;
}

/**
 * Checks rate limit for a specific identifier.
 * Upgrades from simple memory store to Upstash if configured.
 */
export async function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { windowMs: 60000, max: 20 }
): Promise<{ success: boolean; remaining: number; reset: number }> {
  // If Upstash is configured, use it (distributed)
  if (ratelimit) {
    const { success, limit, remaining, reset } = await ratelimit.limit(identifier);
    return { success, remaining, reset };
  }

  // Fallback to simple in-memory limiter for local development
  return checkRateLimitMemory(identifier, options);
}

// In-memory fallback
const memoryStore: Record<string, { count: number; resetTime: number }> = {};

function checkRateLimitMemory(identifier: string, options: RateLimitOptions) {
  const now = Date.now();
  const entry = memoryStore[identifier];

  if (!entry || now > entry.resetTime) {
    memoryStore[identifier] = {
      count: 1,
      resetTime: now + options.windowMs,
    };
    return { success: true, remaining: options.max - 1, reset: now + options.windowMs };
  }

  if (entry.count >= options.max) {
    return { success: false, remaining: 0, reset: entry.resetTime };
  }

  entry.count += 1;
  return { success: true, remaining: options.max - entry.count, reset: entry.resetTime };
}

