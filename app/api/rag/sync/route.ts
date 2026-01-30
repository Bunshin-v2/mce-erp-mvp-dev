import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID();

  return NextResponse.json(
    {
      request_id: requestId,
      outcome: 'failed',
      error: {
        code: 'LEGACY_ENDPOINT_DISABLED',
        message: 'RAG sync is disabled on Vercel. Use the external AI Gateway indexing API/worker.',
        detail: {},
      },
      data: null,
    },
    { status: 410, headers: { 'x-request-id': requestId } }
  );
}

export async function GET(request: Request) {
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID();

  return NextResponse.json(
    {
      request_id: requestId,
      outcome: 'failed',
      error: {
        code: 'LEGACY_ENDPOINT_DISABLED',
        message: 'RAG sync status is disabled on Vercel. Use the external AI Gateway status endpoints.',
        detail: {},
      },
      data: null,
    },
    { status: 410, headers: { 'x-request-id': requestId } }
  );
}
