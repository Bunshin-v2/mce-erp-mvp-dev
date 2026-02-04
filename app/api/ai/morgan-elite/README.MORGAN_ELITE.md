MR. MORGAN ELITE - Internal README

Env vars
- ANTHROPIC_API_KEY (required)
- MORGAN_MODEL (optional, default claude-2.1)
- MORGAN_CACHE_DIR (optional)
- MORGAN_CACHE_TYPE (file|redis) - note: our code uses REDIS_URL presence for Redis
- REDIS_URL (optional)
- CACHE_TTL (seconds, default 3600)

Endpoints
- POST /api/ai/morgan-elite
  - Body: { query: string, stream?: boolean }

Notes
- The route attempts streaming when `stream:true`. If the SDK does not support streaming it falls back to returning a full JSON response.
- Domain knowledge is loaded from morgan_knowledge.txt in project root, data/, or app/ai/.
- File cache stored at .morgan_cache by default
