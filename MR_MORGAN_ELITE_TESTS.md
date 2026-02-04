Local Testing — MR. MORGAN ELITE

1) Install deps

npm install

2) Set env (create .env.local)

ANTHROPIC_API_KEY=sk-ant-...
MORGAN_MODEL=claude-2.1
MORGAN_CACHE_DIR=.morgan_cache
CACHE_TTL=300

3) Start dev

npm run dev

4) Quick non-stream test

curl -X POST http://localhost:3000/api/ai/morgan-elite \
  -H "Content-Type: application/json" \
  -d '{"query":"What are the top 3 risks for an AED 30M residential project in Dubai?"}'

Expect: 200 JSON { response: string, cached: boolean }

5) Quick streaming test

curl -N -X POST http://localhost:3000/api/ai/morgan-elite \
  -H "Content-Type: application/json" \
  -d '{"query":"Summarize tender risks for Marina Tower", "stream": true}'

Expect: streaming text chunks or final plaintext response.

6) Verify cache

- First request should return cached: false
- Subsequent request with same query should return cached: true

7) Run build (verify)

npm run build

If build fails due to missing optional deps (ioredis, @anthropic-ai/sdk), run:

npm install @anthropic-ai/sdk ioredis --save

(These are optional at runtime if you only use file cache but required to satisfy TypeScript types during build.)

8) Manual UI test

- Open app (http://localhost:3000)
- Click Mr. Morgan assistant in bottom-right
- Send a query and observe streaming updates & suggestion chips

9) Troubleshooting

- If LSP/type checks fail on Windows due to Bun bug, run builds via WSL or install newer Bun.
- Check .morgan_cache for stored entries (json files named by sha256)