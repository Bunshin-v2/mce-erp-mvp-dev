import { NextResponse } from 'next/server';
import { getSafeAuth } from '@/lib/auth-safe';

type ProxyOptions = {
  requireAuth?: boolean;
};

function getGatewayBaseUrl(): string {
  const url = (process.env.AI_GATEWAY_URL ?? '').trim().replace(/\/$/, '');
  if (!url) {
    throw new Error('AI_GATEWAY_URL is missing. Configure it in Vercel environment variables.');
  }
  return url;
}

function buildHeaders(request: Request, extra: Record<string, string>): Headers {
  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);

  const accept = request.headers.get('accept');
  if (accept) headers.set('accept', accept);

  for (const [key, value] of Object.entries(extra)) {
    headers.set(key, value);
  }

  return headers;
}

export async function proxyToAiGateway(request: Request, path: string, options: ProxyOptions = {}) {
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID();

  let authHeaders: Record<string, string> = {
    'x-request-id': requestId,
  };

  if (options.requireAuth) {
    const authResult = await getSafeAuth();
    const { userId, orgId } = authResult;

    if (!userId) {
      return NextResponse.json(
        {
          request_id: requestId,
          outcome: 'failed',
          error: {
            code: 'AUTH_REQUIRED',
            message: 'Unauthorized',
            detail: { reason: 'Missing session' },
          },
          data: null,
        },
        { status: 401 }
      );
    }

    const token =
      (await authResult.getToken({ template: 'supabase' }).catch(() => null)) ??
      (await authResult.getToken().catch(() => null));

    if (!token) {
      return NextResponse.json(
        {
          request_id: requestId,
          outcome: 'failed',
          error: {
            code: 'AUTH_TOKEN_MISSING',
            message: 'Unauthorized',
            detail: { reason: 'Unable to mint auth token' },
          },
          data: null,
        },
        { status: 401 }
      );
    }

    authHeaders = {
      ...authHeaders,
      authorization: `Bearer ${token}`,
      'x-user-id': userId,
      ...(orgId ? { 'x-org-id': orgId } : {}),
    };
  }

  let gatewayUrl: string;
  try {
    gatewayUrl = getGatewayBaseUrl();
  } catch (error: any) {
    return NextResponse.json(
      {
        request_id: requestId,
        outcome: 'failed',
        error: {
          code: 'AI_GATEWAY_MISCONFIGURED',
          message: error?.message ? String(error.message) : 'AI gateway is not configured.',
          detail: {},
        },
        data: null,
      },
      { status: 500 }
    );
  }

  const targetUrl = `${gatewayUrl}${path.startsWith('/') ? '' : '/'}${path}`;

  const response = await fetch(targetUrl, {
    method: request.method,
    headers: buildHeaders(request, authHeaders),
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.text(),
  });

  const body = await response.text();
  const responseHeaders = new Headers();
  responseHeaders.set('content-type', response.headers.get('content-type') ?? 'application/json');
  responseHeaders.set('x-request-id', requestId);

  return new NextResponse(body, {
    status: response.status,
    headers: responseHeaders,
  });
}
