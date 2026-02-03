import { NextRequest, NextResponse } from 'next/server';
import { httpRequestDuration, httpRequestTotal } from './prometheus';

export function metricsMiddleware(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const start = Date.now();
    const route = req.nextUrl.pathname;
    const method = req.method;

    try {
      const response = await handler(req);
      const duration = (Date.now() - start) / 1000;
      const statusCode = response.status.toString();

      httpRequestDuration.observe(
        { method, route, status_code: statusCode },
        duration
      );
      httpRequestTotal.inc({ method, route, status_code: statusCode });

      return response;
    } catch (error) {
      const duration = (Date.now() - start) / 1000;
      httpRequestDuration.observe(
        { method, route, status_code: '500' },
        duration
      );
      httpRequestTotal.inc({ method, route, status_code: '500' });
      throw error;
    }
  };
}
