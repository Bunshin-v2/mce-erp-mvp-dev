import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID();

  return NextResponse.json(
    {
      request_id: requestId,
      outcome: 'failed',
      error: {
        code: 'LEGACY_ENDPOINT_DISABLED',
        message: 'RAG ingestion is disabled on Vercel. Use the external AI Gateway indexing API/worker.',
        detail: {},
      },
      data: null,
    },
    { status: 410, headers: { 'x-request-id': requestId } }
  );
}
