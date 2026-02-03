# Prometheus Monitoring Setup for Nexus Construct ERP

## Overview
This setup provides comprehensive monitoring for the MCE Command Center using Prometheus and Grafana.

## Features
- **HTTP Request Metrics**: Duration and total counts per route
- **Database Metrics**: Query duration and active connections
- **Application Metrics**: Active users, projects, invoices
- **Error Tracking**: Categorized by type and severity
- **AI Service Metrics**: Request duration and success rates
- **Real-time Subscriptions**: Active subscription tracking

## Quick Start

### 1. Start the Application
```bash
npm run dev
```

### 2. Start Prometheus & Grafana
```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

### 3. Access the Dashboards
- **Application**: http://localhost:3000
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin)
- **Metrics Endpoint**: http://localhost:3000/api/metrics

## Prometheus Configuration

The `prometheus.yml` file scrapes metrics from:
- Your Next.js app at `/api/metrics` every 15 seconds
- Prometheus itself for self-monitoring

## Available Metrics

### HTTP Metrics
- `http_request_duration_seconds`: Request latency histogram
- `http_requests_total`: Total HTTP request counter

### Database Metrics
- `db_query_duration_seconds`: Database query duration
- `db_connections_active`: Active database connections

### Application Metrics
- `active_users_total`: Currently active users
- `projects_total{status}`: Projects by status
- `invoices_total{status}`: Invoices by status

### Error Metrics
- `errors_total{type,severity}`: Error counter

### AI Service Metrics
- `ai_request_duration_seconds`: AI request latency
- `ai_requests_total`: AI request counter

### Real-time Metrics
- `realtime_subscriptions_active`: Active subscriptions

## Usage Examples

### In API Routes
```typescript
import { metricsMiddleware } from '@/lib/metrics/middleware';
import { dbQueryDuration } from '@/lib/metrics/prometheus';

export const GET = metricsMiddleware(async (req) => {
  const timer = dbQueryDuration.startTimer({ operation: 'select', table: 'projects' });
  
  const data = await supabase.from('projects').select('*');
  
  timer();
  
  return NextResponse.json(data);
});
```

### Tracking Errors
```typescript
import { errorsTotal } from '@/lib/metrics/prometheus';

try {
  // your code
} catch (error) {
  errorsTotal.inc({ type: 'database_error', severity: 'high' });
  throw error;
}
```

### Tracking Application State
```typescript
import { activeUsers, projectsTotal } from '@/lib/metrics/prometheus';

activeUsers.set(25);
projectsTotal.set({ status: 'active' }, 42);
```

## Grafana Dashboard Setup

1. Access Grafana at http://localhost:3001
2. Add Prometheus data source:
   - URL: `http://prometheus:9090`
3. Import dashboard or create custom panels

### Example Queries

**Request Rate:**
```promql
rate(http_requests_total[5m])
```

**Average Response Time:**
```promql
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])
```

**Error Rate:**
```promql
rate(errors_total[5m])
```

**Database Query Latency (p95):**
```promql
histogram_quantile(0.95, rate(db_query_duration_seconds_bucket[5m]))
```

## Production Deployment

### Environment Variables
Add to `.env.local`:
```env
PROMETHEUS_ENABLED=true
METRICS_AUTH_TOKEN=your-secret-token
```

### Secure Metrics Endpoint
Update `app/api/metrics/route.ts`:
```typescript
export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization');
  if (token !== `Bearer ${process.env.METRICS_AUTH_TOKEN}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  // ... rest of the code
}
```

### Update Prometheus Config
```yaml
scrape_configs:
  - job_name: 'nexus-erp-app'
    authorization:
      credentials: your-secret-token
    static_configs:
      - targets: ['your-production-domain.com']
```

## Monitoring Best Practices

1. **Set Alerts**: Configure Prometheus alerts for critical metrics
2. **Retention Policy**: Adjust data retention based on needs
3. **Resource Limits**: Monitor Prometheus memory usage
4. **Backup**: Regularly backup Prometheus data
5. **Access Control**: Secure Grafana and Prometheus in production

## Troubleshooting

**Metrics not appearing:**
- Check app is running: http://localhost:3000/api/metrics
- Verify Prometheus config: http://localhost:9090/targets
- Check Docker logs: `docker-compose -f docker-compose.monitoring.yml logs`

**High memory usage:**
- Reduce scrape frequency in `prometheus.yml`
- Adjust retention period: `--storage.tsdb.retention.time=15d`

## Integration with GitHub Copilot

Ask Copilot to:
- Generate custom metrics for specific features
- Create Grafana dashboard JSON
- Write PromQL queries for specific insights
- Set up alerting rules

Example: *"Create a metric to track invoice generation time"*

## Next Steps

1. Create custom Grafana dashboards for business metrics
2. Set up Alertmanager for notifications
3. Add OpenTelemetry tracing
4. Integrate with your CI/CD pipeline
