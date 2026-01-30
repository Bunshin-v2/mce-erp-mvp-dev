import { proxyToAiGateway } from '@/lib/ai-gateway/proxy';

export async function POST(request: Request) {
  return proxyToAiGateway(request, '/chat', { requireAuth: true });
}
