import { proxyToAiGateway } from '@/lib/ai-gateway/proxy';

export async function GET(request: Request) {
  return proxyToAiGateway(request, '/healthz');
}
