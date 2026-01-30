/**
 * ENDPOINT REGISTRY - Production Diagnostic Mesh
 * Defines all API endpoints with health contracts
 *
 * Every endpoint must specify:
 * - Expected latency budgets (p50, p95, p99)
 * - Acceptable error rate ceiling
 * - Authentication & RLS requirements
 * - Response shape validation
 */

export interface EndpointContract {
  name: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  path: string;
  description: string;

  // Latency budgets in milliseconds
  latency: {
    p50: number;
    p95: number;
    p99: number;
  };

  // Maximum acceptable error rate (0.001 = 0.1%)
  errorRate: number;

  // Authentication requirements
  authContext: 'none' | 'required' | 'optional';

  // RLS enforcement
  requiredRLS: boolean;

  // Response validation
  responseSchema?: {
    type: 'array' | 'object' | 'string' | 'number';
    items?: any;
    required?: string[];
  };

  // Testing behavior
  stressTest: boolean;  // Include in load tests
  criticality: 'BLOCKING' | 'CRITICAL' | 'HIGH' | 'MEDIUM';

  // Test payload (if needed)
  testPayload?: Record<string, any>;
}

export const ENDPOINT_REGISTRY: EndpointContract[] = [
  // ==========================================================================
  // AUTHENTICATION ENDPOINTS
  // ==========================================================================
  {
    name: 'System Health',
    method: 'GET',
    path: '/api/health',
    description: 'System status probe - database, AI gateway, alarms',
    latency: { p50: 20, p95: 50, p99: 200 },
    errorRate: 0.0, // MUST NOT FAIL
    authContext: 'none',
    requiredRLS: false,
    stressTest: true,
    criticality: 'BLOCKING',
    responseSchema: {
      type: 'object',
      required: ['status', 'timestamp', 'database', 'ai', 'alarms'],
    },
  },
  {
    name: 'AI Gateway Ready (Proxy)',
    method: 'GET',
    path: '/api/ai/ready',
    description: 'Reflects authoritative AI Gateway readiness',
    latency: { p50: 50, p95: 200, p99: 800 },
    errorRate: 0.0, // MUST NOT FAIL
    authContext: 'none',
    requiredRLS: false,
    stressTest: true,
    criticality: 'BLOCKING',
  },
  {
    name: 'AI Gateway Health (Proxy)',
    method: 'GET',
    path: '/api/ai/health',
    description: 'Reflects authoritative AI Gateway health details',
    latency: { p50: 50, p95: 200, p99: 800 },
    errorRate: 0.001,
    authContext: 'none',
    requiredRLS: false,
    stressTest: true,
    criticality: 'HIGH',
  },
  {
    name: 'AI Gateway Version (Proxy)',
    method: 'GET',
    path: '/api/ai/version',
    description: 'Returns AI Gateway build + index version',
    latency: { p50: 50, p95: 200, p99: 800 },
    errorRate: 0.001,
    authContext: 'none',
    requiredRLS: false,
    stressTest: true,
    criticality: 'HIGH',
  },

  // ==========================================================================
  // PROJECTS ENDPOINTS
  // ==========================================================================
  {
    name: 'List Projects',
    method: 'GET',
    path: '/api/projects',
    description: 'Fetch all active projects with filtering',
    latency: { p50: 50, p95: 150, p99: 500 },
    errorRate: 0.001,
    authContext: 'required',
    requiredRLS: true,
    stressTest: true,
    criticality: 'CRITICAL',
    responseSchema: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'project_name', 'project_status'],
      },
    },
  },

  {
    name: 'Get Project Detail',
    method: 'GET',
    path: '/api/projects/:id',
    description: 'Fetch single project with all metadata',
    latency: { p50: 80, p95: 200, p99: 800 },
    errorRate: 0.001,
    authContext: 'required',
    requiredRLS: true,
    stressTest: true,
    criticality: 'CRITICAL',
    responseSchema: {
      type: 'object',
      required: ['id', 'project_name', 'client_name'],
    },
  },

  {
    name: 'Create Project',
    method: 'POST',
    path: '/api/projects',
    description: 'Create new project (L3+ only)',
    latency: { p50: 150, p95: 400, p99: 1500 },
    errorRate: 0.0005,
    authContext: 'required',
    requiredRLS: true,
    stressTest: false,  // Don't create garbage data in tests
    criticality: 'CRITICAL',
    testPayload: {
      project_name: 'Test Project',
      client_name: 'Test Client',
      project_type: 'Infrastructure',
    },
  },

  {
    name: 'Update Project',
    method: 'PATCH',
    path: '/api/projects/:id',
    description: 'Update project fields (L3+ only)',
    latency: { p50: 120, p95: 300, p99: 1000 },
    errorRate: 0.0005,
    authContext: 'required',
    requiredRLS: true,
    stressTest: false,
    criticality: 'CRITICAL',
  },

  // ==========================================================================
  // DOCUMENTS ENDPOINTS
  // ==========================================================================
  {
    name: 'List Documents',
    method: 'GET',
    path: '/api/documents',
    description: 'Fetch documents with RLS filtering',
    latency: { p50: 100, p95: 250, p99: 800 },
    errorRate: 0.001,
    authContext: 'required',
    requiredRLS: true,
    stressTest: true,
    criticality: 'HIGH',
    responseSchema: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'title', 'status'],
      },
    },
  },

  {
    name: 'Get Document Detail',
    method: 'GET',
    path: '/api/documents/:id',
    description: 'Fetch single document with audit trail',
    latency: { p50: 80, p95: 200, p99: 600 },
    errorRate: 0.001,
    authContext: 'required',
    requiredRLS: true,
    stressTest: true,
    criticality: 'HIGH',
  },

  {
    name: 'Update Document Status',
    method: 'PATCH',
    path: '/api/documents/:id/status',
    description: 'Move document through workflow (Review → Reviewed → Approved/Rejected)',
    latency: { p50: 120, p95: 300, p99: 1000 },
    errorRate: 0.0005,
    authContext: 'required',
    requiredRLS: true,
    stressTest: false,
    criticality: 'CRITICAL',
    testPayload: {
      status: 'Reviewed',
    },
  },

  // ==========================================================================
  // TENDERS ENDPOINTS
  // ==========================================================================
  {
    name: 'List Tenders',
    method: 'GET',
    path: '/api/tenders',
    description: 'Fetch all active tenders',
    latency: { p50: 80, p95: 200, p99: 600 },
    errorRate: 0.001,
    authContext: 'required',
    requiredRLS: true,
    stressTest: true,
    criticality: 'HIGH',
  },

  {
    name: 'Get Tender Detail',
    method: 'GET',
    path: '/api/tenders/:id',
    description: 'Fetch tender with bid history',
    latency: { p50: 100, p95: 250, p99: 800 },
    errorRate: 0.001,
    authContext: 'required',
    requiredRLS: true,
    stressTest: true,
    criticality: 'HIGH',
  },

  {
    name: 'Create Tender',
    method: 'POST',
    path: '/api/tenders',
    description: 'Create new tender (L3+ only)',
    latency: { p50: 200, p95: 500, p99: 2000 },
    errorRate: 0.0005,
    authContext: 'required',
    requiredRLS: true,
    stressTest: false,
    criticality: 'CRITICAL',
    testPayload: {
      title: 'Test Tender',
      client: 'Test Client',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
  },

  // ==========================================================================
  // RESOURCE ENDPOINTS
  // ==========================================================================
  {
    name: 'List Team Members',
    method: 'GET',
    path: '/api/resources/team-members',
    description: 'Fetch active personnel',
    latency: { p50: 60, p95: 180, p99: 700 },
    errorRate: 0.001,
    authContext: 'required',
    requiredRLS: true,
    stressTest: true,
    criticality: 'HIGH',
  },

  {
    name: 'Get Resource Allocations',
    method: 'GET',
    path: '/api/resources/allocations',
    description: 'Fetch current project assignments',
    latency: { p50: 80, p95: 200, p99: 800 },
    errorRate: 0.001,
    authContext: 'required',
    requiredRLS: true,
    stressTest: true,
    criticality: 'MEDIUM',
  },

  // ==========================================================================
  // ADMIN ENDPOINTS (L4+ only)
  // ==========================================================================
  {
    name: 'Validation Report',
    method: 'GET',
    path: '/api/admin/validation/report',
    description: 'Full system validation (schema, RLS, audit)',
    latency: { p50: 500, p95: 2000, p99: 5000 },
    errorRate: 0.001,
    authContext: 'required',
    requiredRLS: false,  // RLS checked inside endpoint
    stressTest: false,
    criticality: 'HIGH',
  },

  {
    name: 'System Logs',
    method: 'GET',
    path: '/api/admin/logs',
    description: 'Fetch audit trail and diagnostic logs',
    latency: { p50: 200, p95: 500, p99: 2000 },
    errorRate: 0.001,
    authContext: 'required',
    requiredRLS: false,
    stressTest: false,
    criticality: 'MEDIUM',
  },
];

/**
 * Get endpoint by name for testing
 */
export function getEndpointByName(name: string): EndpointContract | undefined {
  return ENDPOINT_REGISTRY.find(e => e.name === name);
}

/**
 * Get all critical endpoints (must never fail in production)
 */
export function getCriticalEndpoints(): EndpointContract[] {
  return ENDPOINT_REGISTRY.filter(e => e.criticality === 'BLOCKING' || e.criticality === 'CRITICAL');
}

/**
 * Get all endpoints that should be stress tested
 */
export function getStressTestEndpoints(): EndpointContract[] {
  return ENDPOINT_REGISTRY.filter(e => e.stressTest === true);
}

/**
 * Get all endpoints requiring RLS validation
 */
export function getRLSProtectedEndpoints(): EndpointContract[] {
  return ENDPOINT_REGISTRY.filter(e => e.requiredRLS === true);
}
