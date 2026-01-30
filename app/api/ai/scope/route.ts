import { NextResponse } from 'next/server';
import { buildKnowledgeScope } from '@/lib/ai/knowledge-scope';

export async function GET() {
  try {
    const scope = buildKnowledgeScope();
    return NextResponse.json({ scope, success: true });
  } catch (error) {
    console.error('Failed to build knowledge scope:', error);
    return NextResponse.json({ success: false, error: 'scope_fetch_failed' }, { status: 500 });
  }
}
