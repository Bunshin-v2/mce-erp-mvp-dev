'use client';

import { useState, useEffect } from 'react';

interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  key: string;
}

export function useLocalCache<T>(
  fetcher: () => Promise<T>,
  config: CacheConfig
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refresh: () => void;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Check local storage cache first
    const cached = localStorage.getItem(config.key);
    if (cached) {
      try {
        const { value, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < config.ttl) {
          setData(value);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Failed to parse cache:', err);
      }
    }

    // Fetch fresh data
    fetcher()
      .then((result) => {
        setData(result);
        // Store in localStorage
        localStorage.setItem(
          config.key,
          JSON.stringify({
            value: result,
            timestamp: Date.now(),
          })
        );
      })
      .catch((err) => setError(err as Error))
      .finally(() => setLoading(false));
  }, [config.key, config.ttl, fetcher]);

  const refresh = () => {
    localStorage.removeItem(config.key);
    setLoading(true);
    fetcher()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  };

  return { data, loading, error, refresh };
}
