// Exponential backoff retry logic

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffMultiplier = 2,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        const delay = Math.min(
          initialDelay * Math.pow(backoffMultiplier, attempt),
          maxDelay
        );

        console.warn(
          `Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`,
          error
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('All retry attempts failed');
}

// User-friendly error messages
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;

  const message = error?.message || 'Unknown error';
  
  if (message.includes('network')) return 'Unable to reach the server. Please check your connection.';
  if (message.includes('401')) return 'Your session has expired. Please log in again.';
  if (message.includes('403')) return 'You do not have permission to perform this action.';
  
  return message;
};
