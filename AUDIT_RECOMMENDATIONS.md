Repo Audit Recommendations

Summary:
- Project uses Next.js 16 and Tailwind 4. Tailwind 4 is fine but consider upgrading to Tailwind 5 when stable with your toolchain.
- Typescript 5.8 pinned in devDependencies — okay.

Key dependency notes:
- @anthropic-ai/sdk is added. Confirm version (0.32.1) is desired.
- ioredis is not listed in package.json. If you plan to use REDIS_URL, install ioredis or use @upstash/redis already present.
- Consider replacing ioredis with @upstash/redis for serverless-friendly Redis (already included as dependency).

Specific recommendations:
1) Add ioredis to optionalDependencies or switch to @upstash/redis in route.ts.
2) Bump Next.js only after testing; current ^16.1.5 is modern.
3) Tailwind: repo uses tailwind 4; verify Storybook compatibility.
4) Remove generated .next and build artifacts from repo (they're present in local .next) — ensure .gitignore excludes them.
5) ADD: recommend adding @types/ioredis to devDependencies if you use ioredis.

Commands to apply:
- npm i --save ioredis
- npm i --save-dev @types/ioredis

If you prefer serverless Redis (Upstash), switch route.ts to use @upstash/redis client (already present in package.json). This avoids adding ioredis.
