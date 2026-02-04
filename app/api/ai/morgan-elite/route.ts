import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

// MR. MORGAN ELITE - Construction ERP Intelligence
// POST /api/ai/morgan-elite
// Body: { query: string, stream?: boolean }

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const CACHE_DIR = process.env.MORGAN_CACHE_DIR || path.join(process.cwd(), '.morgan_cache');
const CACHE_TTL_SECONDS = Number(process.env.CACHE_TTL || '3600');
const MODEL = process.env.MORGAN_MODEL || 'claude-2.1';
let redisClient: unknown = null;

async function ensureCacheDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch (e) {
    // ignore
  }
}

function sha256(input: string) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

async function fileGet(key: string): Promise<string | null> {
  const file = path.join(CACHE_DIR, `${key}.json`);
  try {
    const raw = await fs.readFile(file, 'utf8');
    const obj = JSON.parse(raw) as { createdAt: number; ttl?: number; value: string };
    const now = Math.floor(Date.now() / 1000);
    if (obj.ttl && now - obj.createdAt > obj.ttl) return null;
    return obj.value;
  } catch (e) {
    return null;
  }
}

async function fileSet(key: string, value: string): Promise<void> {
  await ensureCacheDir();
  const file = path.join(CACHE_DIR, `${key}.json`);
  const obj = { createdAt: Math.floor(Date.now() / 1000), ttl: CACHE_TTL_SECONDS, value };
  await fs.writeFile(file, JSON.stringify(obj), 'utf8');
}

async function tryInitRedis() {
  if (!process.env.REDIS_URL) return;
  if (redisClient) return;
  try {
    const IORedisModule = await import('ioredis');
    // IORedisModule.default when using ES default export
    const IORedis = (IORedisModule as any).default || IORedisModule;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    redisClient = new (IORedis as any)(process.env.REDIS_URL);
  } catch (e) {
    // fail silently, fall back to file cache
    // eslint-disable-next-line no-console
    console.warn('redis init failed - falling back to file cache', e);
    redisClient = null;
  }
}

async function redisGet(key: string): Promise<string | null> {
  if (!redisClient) return null;
  try {
    const val = await (redisClient as any).get(key);
    return typeof val === 'string' ? val : null;
  } catch (e) {
    return null;
  }
}

async function redisSet(key: string, value: string): Promise<void> {
  if (!redisClient) return;
  try {
    await (redisClient as any).set(key, value, 'EX', CACHE_TTL_SECONDS);
  } catch (e) {
    // ignore
  }
}

async function getFromCache(key: string): Promise<string | null> {
  if (process.env.REDIS_URL) {
    await tryInitRedis();
    const r = await redisGet(key);
    if (r) return r;
  }
  return await fileGet(key);
}

async function setToCache(key: string, value: string): Promise<void> {
  if (process.env.REDIS_URL) {
    await tryInitRedis();
    if (redisClient) {
      await redisSet(key, value);
      return;
    }
  }
  await fileSet(key, value);
}

async function loadKnowledge(): Promise<string> {
  const candidates = [
    path.join(process.cwd(), 'morgan_knowledge.txt'),
    path.join(process.cwd(), 'data', 'morgan_knowledge.txt'),
    path.join(process.cwd(), 'app', 'ai', 'morgan_knowledge.txt')
  ];
  for (const c of candidates) {
    try {
      const raw = await fs.readFile(c, 'utf8');
      if (raw && raw.trim().length > 0) return raw;
    } catch (e) {
      // continue
    }
  }
  return '';
}

// Defensive extractor
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractTextFromAnthropicResponse(resp: any): string | null {
  if (!resp) return null;
  if (typeof resp === 'string') return resp;
  if (resp.output && Array.isArray(resp.output)) {
    for (const item of resp.output) {
      if (typeof item === 'string') return item;
      if (item?.content) {
        if (typeof item.content === 'string') return item.content;
        if (Array.isArray(item.content)) {
          const found = item.content.find((c: any) => typeof c === 'string');
          if (found) return found;
        }
      }
    }
  }
  if (resp?.content) {
    if (typeof resp.content === 'string') return resp.content;
    if (Array.isArray(resp.content)) {
      const found = resp.content.find((c: any) => typeof c === 'string' || c?.text);
      if (found && typeof found === 'string') return found;
      if (found && found?.text) return found.text;
    }
  }
  try {
    return JSON.stringify(resp);
  } catch (e) {
    return null;
  }
}

export async function POST(req: NextRequest) {
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'Missing ANTHROPIC_API_KEY' }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const query = typeof (body as any)?.query === 'string' ? ((body as any).query as string).trim() : '';
  const wantStream = Boolean((body as any)?.stream === true);
  if (!query) return NextResponse.json({ error: 'query is required' }, { status: 400 });

  const knowledge = await loadKnowledge();
  const systemPrompt = `You are MR. MORGAN ELITE, an expert construction ERP assistant for UAE projects. Use the domain knowledge and be concise, actionable, and cite sources when relevant.`;
  const assembled = [systemPrompt, knowledge ? `DomainKnowledge:\n${knowledge}` : '', `UserQuery:\n${query}`].filter(Boolean).join('\n\n');

  const key = sha256(assembled);
  try {
    const cached = await getFromCache(key);
    if (cached) return NextResponse.json({ response: cached, cached: true });
  } catch (e) {
    // ignore cache errors
  }

  // Runtime import of SDK to avoid hard dependency at build-time
  try {
    const AnthropicModule = await import('@anthropic-ai/sdk');
    // default export or named
    const Anthropic = AnthropicModule?.default || AnthropicModule;
    // instantiate
    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

    if (wantStream) {
      // Attempt streaming - prefer SDK streaming methods if available.
      try {
        // Try known SDK streaming entry points
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const streamable = (client as any).responses?.stream || (client as any).responses?.createStream || (client as any).stream;
        if (streamable) {
          const stream = new ReadableStream({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            async start(controller: any) {
              try {
                // Call streaming method — it may return an async iterable or an object with async iterator
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const sdkStream = await (streamable as any)({ model: MODEL, input: assembled });

                // helper to extract text from a streaming chunk
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const extractTextFromChunk = (chunk: any): string | null => {
                  if (!chunk) return null;
                  if (typeof chunk === 'string') return chunk;
                  if (chunk.delta && typeof chunk.delta === 'object') {
                    // common pattern: { delta: { content: '...' } }
                    if (chunk.delta.content) return String(chunk.delta.content);
                  }
                  if (chunk.output && Array.isArray(chunk.output)) {
                    for (const it of chunk.output) {
                      if (typeof it === 'string') return it;
                      if (it?.content) return typeof it.content === 'string' ? it.content : JSON.stringify(it.content);
                    }
                  }
                  if (chunk?.text) return String(chunk.text);
                  if (chunk?.content) return typeof chunk.content === 'string' ? chunk.content : JSON.stringify(chunk.content);
                  return null;
                };

                // If sdkStream is async iterable, iterate
                if (sdkStream[Symbol.asyncIterator]) {
                  for await (const chunk of sdkStream) {
                    const t = extractTextFromChunk(chunk) ?? JSON.stringify(chunk);
                    controller.enqueue(new TextEncoder().encode(t));
                  }
                } else if (sdkStream[Symbol.iterator]) {
                  for (const chunk of sdkStream) {
                    const t = extractTextFromChunk(chunk) ?? JSON.stringify(chunk);
                    controller.enqueue(new TextEncoder().encode(t));
                  }
                } else if (typeof sdkStream.on === 'function' && typeof sdkStream.read === 'function') {
                  // stream-like (Node)
                  sdkStream.on('data', (chunk: any) => {
                    const t = extractTextFromChunk(chunk) ?? JSON.stringify(chunk);
                    controller.enqueue(new TextEncoder().encode(t));
                  });
                  sdkStream.on('end', () => controller.close());
                } else {
                  // unexpected shape — emit whole object
                  controller.enqueue(new TextEncoder().encode(JSON.stringify(sdkStream)));
                }

                controller.close();
              } catch (err) {
                controller.enqueue(new TextEncoder().encode('\n[stream error]'));
                controller.close();
              }
            }
          });

          return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
        }
      } catch (e) {
        // fall through to non-stream behavior
      }
    }


    // Non-streaming call - prefer 'responses.create' interface
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (client as any).responses?.create ? (client as any).responses.create({ model: MODEL, input: assembled, max_tokens: 800 }) : (client as any).create ? (client as any).create({ model: MODEL, input: assembled, max_tokens: 800 }) : (client as any).responses?.create({ model: MODEL, input: assembled, max_tokens: 800 });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const text = extractTextFromAnthropicResponse(result as any) || 'No answer from model.';

      try {
        await setToCache(key, text);
      } catch (e) {
        // ignore cache write failures
      }

      return NextResponse.json({ response: text, cached: false });
    } catch (innerErr) {
      // If the non-streaming SDK path fails, include error detail
      // eslint-disable-next-line no-console
      console.error('Non-stream Anthropic call failed', innerErr);
      const msg = innerErr && typeof innerErr === 'object' && 'message' in innerErr ? (innerErr as any).message : String(innerErr);
      return NextResponse.json({ error: 'Upstream error', detail: msg }, { status: 502 });
    }
  } catch (err: unknown) {
    // eslint-disable-next-line no-console
    console.error('Anthropic call failed', err);
    const msg = err && typeof err === 'object' && 'message' in err ? (err as any).message : String(err);
    return NextResponse.json({ error: 'Upstream error', detail: msg }, { status: 502 });
  }
}
