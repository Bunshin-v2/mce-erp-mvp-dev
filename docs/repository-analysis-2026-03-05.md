# Repository Analysis – 2026-03-05

## Scope & context
- Reviewed the Next.js 16 App Router stack (React 19, TypeScript 5.8, Turbopack, Tailwind 4 tokens) with Supabase + Clerk auth and Storybook/Playwright tooling.
- Baseline commands executed: `npm run lint` fails with TS2307 for `@playwright/test` in `tests/*.spec.ts`; `npm run build` fails because `next/font` cannot download Inter/JetBrains Mono/Oswald (network-blocked) from `app/layout.tsx`.

## Architecture snapshot
- UI: `app/page.tsx` composes `StyleProvider`, `AppShell`, and dynamic feature pages with design tokens from `styles/tokens-2026.css`; error boundary and toast/provider stack live in `app/providers.tsx`.
- Data: Domain hooks in `hooks/domain/*` query Supabase directly (plus realtime channels) and are aggregated in `hooks/useDashboardData.ts:14-152` for KPIs, alerts, and signals.
- Auth: Clerk enforced via `middleware.ts` route matcher and `app/providers.tsx` client bootstrap; falls back to open access if Clerk env vars are absent.
- Platform: Supabase client wrappers in `lib/supabase.ts`; diagnostic/health scripts under `scripts/health` and `scripts/diagnostic`; Prometheus client declared but not wired to an endpoint.

## Build & test status (2026-03-05)
- `npm run lint` → fails: TS2307 cannot find module `@playwright/test` in `tests/e2e-data-flow.spec.ts`, `tests/system-audit.spec.ts`, `tests/theme-system.spec.ts`.
- `npm run build` → fails: `next/font` cannot fetch Google fonts (Inter/JetBrains Mono/Oswald) in `app/layout.tsx:4-25`; warnings about missing SWC cache entries, deprecated `middleware` naming, and absent build cache.

## Code review findings
- `app/layout.tsx:4-25` – Build is blocked by remote Google font downloads; switch to `next/font/local` or vendored font files to remove network dependence.
- `tests/system-audit.spec.ts:1-82` (and other Playwright specs) – Reference `@playwright/test` which is not installed/typed, causing TypeScript failure; add the devDependency or exclude e2e specs from the main TS compile.
- `middleware.ts:1-48` – Next 16 warns that `middleware` is deprecated in favor of `proxy.ts`; migrate to avoid future breakage and to align with current routing guidance.
- `hooks/useDashboardData.ts:14-152` – Aggregates mixed Supabase clients with `any`-typed collections and unbounded refetch on search changes; lacks React Query caching/abort semantics, increasing API load and schema-drift risk.

## Missing or weak architecture pieces
- No unified data-access layer or generated Supabase types; domain hooks build ad-hoc queries with `any`, leaving schema evolution error-prone.
- Observability is limited to console logging; `prom-client` is unused and there is no `/api/metrics` or tracing for deployments.
- Testing is limited to Playwright smoke flows (currently failing to compile); there are no unit tests for derived KPI/signal logic or role-gated routes.
- Build resilience gaps: dependency on live Google Fonts, deprecated middleware naming, and SWC cache warnings make builds brittle in locked-down environments.

## SWOT
- Strengths: Design tokens + StyleSystem enforce brand coherence; dynamic imports keep initial bundles lean; Supabase realtime channels provide live updates; logger + error boundary centralize failures; health scripts exist for diagnostics.
- Weaknesses: TypeScript strict mode disabled with heavy `any` usage; lint/build currently fail; auth bootstrap blocks rendering until Clerk key loads; data fetching bypasses React Query cache; middleware deprecation unresolved.
- Opportunities: Self-host fonts; add `@playwright/test` and align tsconfig for e2e; generate Supabase types and move hooks onto React Query with abort/debounce; migrate to `proxy.ts`; wire `prom-client` into an `/api/metrics` endpoint; expand tests around KPI derivation and RouteGuard access control.
- Threats: Placeholder Supabase credentials in `lib/supabase.ts` can hide misconfiguration and send traffic to dummy endpoints; repeated refetch cycles can hit rate limits; reliance on client-side auth/data loading can impact SEO and resilience in degraded networks.

## Recommended next steps
- Restore build and lint by installing `@playwright/test` (or excluding e2e specs) and replacing Google Fonts with local assets.
- Migrate edge protection to `proxy.ts` while keeping Clerk route guards consistent with app-level `RouteGuard`.
- Introduce generated Supabase types and React Query-powered data loaders with abortable, debounced search to stabilize data flows.
- Expose Prometheus metrics via an API route and add targeted unit tests for `useDashboardData` derived metrics and role-based rendering paths.
