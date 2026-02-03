import { Registry, Counter, Histogram, Gauge } from 'prom-client';

export const register = new Registry();

// HTTP Request Metrics
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register],
});

export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// Database Metrics
export const dbQueryDuration = new Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register],
});

export const dbConnectionsActive = new Gauge({
  name: 'db_connections_active',
  help: 'Number of active database connections',
  registers: [register],
});

// Application Metrics
export const activeUsers = new Gauge({
  name: 'active_users_total',
  help: 'Number of currently active users',
  registers: [register],
});

export const projectsTotal = new Gauge({
  name: 'projects_total',
  help: 'Total number of projects',
  labelNames: ['status'],
  registers: [register],
});

export const invoicesTotal = new Gauge({
  name: 'invoices_total',
  help: 'Total number of invoices',
  labelNames: ['status'],
  registers: [register],
});

// Error Metrics
export const errorsTotal = new Counter({
  name: 'errors_total',
  help: 'Total number of errors',
  labelNames: ['type', 'severity'],
  registers: [register],
});

// AI Service Metrics
export const aiRequestDuration = new Histogram({
  name: 'ai_request_duration_seconds',
  help: 'Duration of AI service requests',
  labelNames: ['service', 'model'],
  buckets: [0.5, 1, 2, 5, 10, 20, 30],
  registers: [register],
});

export const aiRequestTotal = new Counter({
  name: 'ai_requests_total',
  help: 'Total number of AI requests',
  labelNames: ['service', 'model', 'status'],
  registers: [register],
});

// Real-time Subscription Metrics
export const realtimeSubscriptionsActive = new Gauge({
  name: 'realtime_subscriptions_active',
  help: 'Number of active real-time subscriptions',
  labelNames: ['channel'],
  registers: [register],
});
