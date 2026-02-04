/**
 * Fetch utilities for reliable API calls with retry logic and timeout handling
 */

export interface RetryOptions {
    maxRetries?: number;
    baseDelay?: number;
    timeoutMs?: number;
}

/**
 * Executes a fetch function with automatic retry on transient failures
 */
export async function fetchWithRetry<T>(
    fetchFn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const { maxRetries = 3, baseDelay = 1000, timeoutMs = 10000 } = options;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            // Wrap in timeout
            const result = await fetchWithTimeout(fetchFn(), timeoutMs);
            return result;
        } catch (error: any) {
            const isLastAttempt = attempt === maxRetries - 1;
            const isRetryable = isRetryableError(error);

            // Don't retry on last attempt or non-retryable errors
            if (isLastAttempt || !isRetryable) {
                throw error;
            }

            // Exponential backoff: 1s, 2s, 4s
            const delay = baseDelay * Math.pow(2, attempt);
            console.warn(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`, error.message);
            await sleep(delay);
        }
    }

    throw new Error('Retry logic failed unexpectedly');
}

/**
 * Wraps a promise with a timeout
 */
export async function fetchWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
): Promise<T> {
    const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    );

    return Promise.race([promise, timeout]);
}

/**
 * Determines if an error is retryable (network/timeout issues)
 */
function isRetryableError(error: any): boolean {
    const message = error.message?.toLowerCase() || '';

    // Network errors
    if (message.includes('fetch')) return true;
    if (message.includes('network')) return true;
    if (message.includes('timeout')) return true;
    if (message.includes('econnrefused')) return true;
    if (message.includes('enotfound')) return true;

    // HTTP status codes that are retryable
    if (error.status === 408) return true; // Request Timeout
    if (error.status === 429) return true; // Too Many Requests
    if (error.status === 500) return true; // Internal Server Error
    if (error.status === 502) return true; // Bad Gateway
    if (error.status === 503) return true; // Service Unavailable
    if (error.status === 504) return true; // Gateway Timeout

    return false;
}

/**
 * Gets a user-friendly error message
 */
export function getErrorMessage(error: any): string {
    const message = error.message?.toLowerCase() || '';

    if (message.includes('fetch') || message.includes('network')) {
        return 'Network connection lost. Please check your internet connection.';
    }

    if (message.includes('timeout')) {
        return 'Request timed out. The server is taking too long to respond.';
    }

    if (error.code === 'PGRST116') {
        return 'Database query error. Please contact support.';
    }

    if (error.status === 401 || error.status === 403) {
        return 'Authentication error. Please sign in again.';
    }

    if (error.status === 429) {
        return 'Too many requests. Please wait a moment and try again.';
    }

    if (error.status >= 500) {
        return 'Server error. Our team has been notified.';
    }

    return error.message || 'An unexpected error occurred';
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
