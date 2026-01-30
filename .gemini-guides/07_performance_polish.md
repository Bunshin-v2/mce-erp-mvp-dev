# Guide 7: Performance Optimization & Polish

**Objective:** Implement caching, React Query, service worker, performance monitoring, and error recovery.

**Time Estimate:** 2.5-3 hours

**Prerequisites:**
- Guides 1-6 completed
- Node.js and npm installed
- App running on localhost:3000

---

## Phase 1: React Query Setup

### Step 1.1: Install React Query

Run:

```bash
npm install @tanstack/react-query
npm install --save-dev @types/react-query
```

### Step 1.2: Create Query Client Provider

Create file: `lib/queryClient.ts`

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});
```

**Save the file.**

### Step 1.3: Wrap App with QueryClientProvider

Open `app.tsx` or main app wrapper:

```typescript
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app content */}
    </QueryClientProvider>
  );
}
```

### Step 1.4: Update useDashboardData Hook

Update `hooks/useDashboardData.ts` to use React Query:

```typescript
import { useQuery, useQueries } from '@tanstack/react-query';

export function useDashboardData(searchQuery: string = '') {
  // Replace individual fetches with useQuery
  const { data: documents, isLoading: docsLoading } = useQuery({
    queryKey: ['documents', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('documents')
        .select('*,projects_master(project_name,project_code,client_name)')
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(mapDoc);
    },
  });

  const { data: projects, isLoading: projLoading } = useQuery({
    queryKey: ['projects', searchQuery],
    queryFn: async () => {
      let query = supabase.from('projects_master').select('*');

      if (searchQuery) {
        query = query.or(`project_name.ilike.%${searchQuery}%,project_code.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const loading = docsLoading || projLoading;

  return {
    documents: documents || [],
    projects: projects || [],
    loading,
    // ... other data
  };
}
```

---

## Phase 2: Caching Strategy

### Step 2.1: Enable Query Caching in Supabase

In your Supabase dashboard:

1. Navigate to **Database** → **Tables**
2. For high-traffic tables (projects_master, documents, tenders):
   - Click the table
   - Go to **Performance** tab
   - Enable **Query Performance Insights**
3. Configure cache duration (recommended: 5-10 minutes for read-heavy queries)

### Step 2.2: Implement Local Caching Hook

Create file: `hooks/useLocalCache.ts`

```typescript
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
```

**Save the file.**

---

## Phase 3: Service Worker for Offline Support

### Step 3.1: Create Service Worker

Create file: `public/service-worker.js`

```javascript
const CACHE_NAME = 'mce-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching app shell');
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response.ok) {
          const cache = caches.open(CACHE_NAME);
          cache.then((c) => c.put(event.request, response.clone()));
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(event.request).then((cached) => {
          if (cached) {
            return cached;
          }
          // Offline fallback for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('Offline - Resource not available', {
            status: 503,
            statusText: 'Service Unavailable',
          });
        });
      })
  );
});
```

**Save the file.**

### Step 3.2: Register Service Worker

Update your main app initialization (e.g., `main.tsx` or `_app.tsx`):

```typescript
// Register service worker
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((reg) => console.log('Service Worker registered:', reg))
      .catch((err) => console.warn('Service Worker registration failed:', err));
  });
}
```

---

## Phase 4: Performance Monitoring

### Step 4.1: Create Performance Monitor Utility

Create file: `utils/performance-monitor.ts`

```typescript
// Performance monitoring and reporting

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
}

const metrics: PerformanceMetric[] = [];

export const performanceMonitor = {
  // Mark performance events
  mark: (name: string, label?: string) => {
    const key = label ? `${name}-${label}` : name;
    performance.mark(key);
  },

  // Measure time between two marks
  measure: (name: string, startMark: string, endMark: string) => {
    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0] as PerformanceMeasure;

      metrics.push({
        name,
        value: measure.duration,
        unit: 'ms',
        timestamp: Date.now(),
      });

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`⏱ ${name}: ${measure.duration.toFixed(2)}ms`);
      }

      return measure.duration;
    } catch (err) {
      console.warn(`Failed to measure ${name}:`, err);
      return 0;
    }
  },

  // Report Core Web Vitals
  reportWebVitals: (metric: any) => {
    metrics.push({
      name: metric.name,
      value: metric.value,
      unit: metric.unit || 'ms',
      timestamp: Date.now(),
    });

    // Send to analytics
    if (metric.value > 2500) {
      console.warn(`⚠ ${metric.name} exceeds threshold: ${metric.value.toFixed(2)}`);
    }
  },

  // Get metrics summary
  getSummary: () => {
    return {
      totalMetrics: metrics.length,
      averageTime: metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length,
      slowestMetric: metrics.reduce((max, m) => (m.value > max.value ? m : max), metrics[0]),
      timestamp: new Date().toISOString(),
    };
  },

  // Export metrics as CSV
  exportCSV: () => {
    const csv = [
      'Name,Value,Unit,Timestamp',
      ...metrics.map((m) => `${m.name},${m.value.toFixed(2)},${m.unit},${new Date(m.timestamp).toISOString()}`),
    ].join('\n');

    return csv;
  },

  // Clear metrics
  clear: () => {
    metrics.length = 0;
  },
};
```

**Save the file.**

### Step 4.2: Track Critical Paths

Update `hooks/useDashboardData.ts` to use monitoring:

```typescript
import { performanceMonitor } from '../utils/performance-monitor';

export function useDashboardData(searchQuery: string = '') {
  useEffect(() => {
    const startMark = `dashboard-load-start-${Date.now()}`;
    const endMark = `dashboard-load-end-${Date.now()}`;

    performanceMonitor.mark(startMark);

    // ... fetch data ...

    performanceMonitor.mark(endMark);
    performanceMonitor.measure('Dashboard Load Time', startMark, endMark);
  }, [searchQuery]);

  // ... rest of hook
}
```

---

## Phase 5: Error Recovery & Resilience

### Step 5.1: Create Error Recovery Utility

Create file: `utils/error-recovery.ts`

```typescript
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

  const errorMap: Record<string, string> = {
    'Network error': 'Unable to reach the server. Please check your internet connection.',
    'Unauthorized': 'Your session has expired. Please log in again.',
    'Forbidden': 'You do not have permission to perform this action.',
    'Not found': 'The requested resource was not found.',
    'Server error': 'An unexpected error occurred. Our team has been notified.',
  };

  const message = error?.message || 'Unknown error';

  for (const [key, value] of Object.entries(errorMap)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  return message;
};

// Fallback data for offline mode
export const getOfflineData = (dataType: string): any => {
  const cache = localStorage.getItem(`offline_${dataType}`);
  if (cache) {
    try {
      return JSON.parse(cache);
    } catch {
      return null;
    }
  }
  return null;
};

// Store data locally as fallback
export const cacheOfflineData = (dataType: string, data: any): void => {
  try {
    localStorage.setItem(`offline_${dataType}`, JSON.stringify(data));
  } catch (err) {
    console.warn('Failed to cache offline data:', err);
  }
};
```

**Save the file.**

### Step 5.2: Wrap API Calls with Error Recovery

Update components to use retry logic:

```typescript
import { retryWithBackoff, getErrorMessage, getOfflineData } from '@/utils/error-recovery';

async function fetchDocuments() {
  try {
    const docs = await retryWithBackoff(
      async () => {
        const { data, error } = await supabase
          .from('documents')
          .select('*');

        if (error) throw error;
        return data;
      },
      { maxRetries: 3, initialDelay: 500 }
    );

    return docs;
  } catch (error) {
    // Try offline fallback
    const offlineData = getOfflineData('documents');
    if (offlineData) {
      console.warn('Using offline data');
      return offlineData;
    }

    // Show user-friendly error
    const message = getErrorMessage(error);
    console.error(message);
    throw error;
  }
}
```

---

## Phase 6: User-Friendly Error Boundaries

### Step 6.1: Create Error Boundary Component

Create file: `components/ui/ErrorBoundary.tsx`

```typescript
import React, { ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
            <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-6">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 mx-auto"
            >
              <RefreshCw size={18} />
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Save the file.**

### Step 6.2: Wrap App with Error Boundary

Update main app file:

```typescript
import { ErrorBoundary } from './components/ui/ErrorBoundary';

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {/* Your app content */}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
```

---

## Phase 7: Performance Testing

### Step 7.1: Test Performance Locally

1. Open Chrome DevTools (F12)
2. Go to **Performance** tab
3. Click record
4. Navigate your app
5. Click stop to see timeline

### Step 7.2: Check Web Vitals

Install web-vitals:

```bash
npm install web-vitals
```

Create file: `utils/reportWebVitals.ts`

```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
import { performanceMonitor } from './performance-monitor';

export function reportWebVitals() {
  getCLS((metric) => performanceMonitor.reportWebVitals(metric));
  getFID((metric) => performanceMonitor.reportWebVitals(metric));
  getFCP((metric) => performanceMonitor.reportWebVitals(metric));
  getLCP((metric) => performanceMonitor.reportWebVitals(metric));
  getTTFB((metric) => performanceMonitor.reportWebVitals(metric));
}
```

---

## Success Criteria

- [ ] React Query installed and configured
- [ ] Service worker registered and caching
- [ ] Performance monitoring active
- [ ] Error recovery with exponential backoff working
- [ ] Error boundaries catching errors
- [ ] Offline fallback data working
- [ ] No TypeScript errors: `npm run build`
- [ ] App loads faster with caching
- [ ] Core Web Vitals improving

---

## Performance Baseline Targets

After implementation, you should see:
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **API Response Time**: < 500ms (with caching)
- **Cache Hit Rate**: > 70% for repeat requests

---

## Next Steps

1. Proceed to **Guide 8: Production Deployment**

---

**TROUBLESHOOTING:**

If service worker doesn't work:
- Check `public/service-worker.js` path
- Ensure app is served over HTTPS in production
- Clear browser cache and reinstall

If React Query causes issues:
- Verify QueryClient provider wraps entire app
- Check for duplicate providers
- Review console for React Query debug logs

If performance doesn't improve:
- Check Network tab in DevTools
- Look for large bundle sizes
- Verify caching is actually working
