import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID();

  return NextResponse.json(
    {
      request_id: requestId,
      outcome: 'failed',
      error: {
        code: 'LEGACY_ENDPOINT_DISABLED',
        message: 'This endpoint is disabled. Use /api/ai/chat.',
        detail: { replacement: '/api/ai/chat' },
      },
      data: null,
    },
    { status: 410, headers: { 'x-request-id': requestId } }
  );
}
