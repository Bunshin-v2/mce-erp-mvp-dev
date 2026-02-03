import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Easy-mode fix for Vercel "MIDDLEWARE_INVOCATION_FAILED":
// If Clerk isn't configured in this environment (missing env vars), do not run Clerk middleware.
// This matches existing app behavior (Providers renders without ClerkProvider when key missing).
const isClerkConfigured = Boolean(
  (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '').trim() &&
    (process.env.CLERK_SECRET_KEY ?? '').trim()
);

// Define public routes that do not require authentication.
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',

  // Webhooks must be reachable without auth
  '/api/webhooks(.*)',

  // Health / diagnostics endpoints must return JSON to CLI probes
  '/api/health',
  '/api/ai/ready',
  '/api/ai/health',
  '/api/ai/version',
]);

export default isClerkConfigured
  ? clerkMiddleware(async (auth, req) => {
      if (!isPublicRoute(req)) {
        const { userId, redirectToSignIn } = await auth();
        if (!userId) {
          return redirectToSignIn();
        }
      }
    })
  : function middleware() {
      // Clerk not configured: let requests through rather than crashing Edge middleware.
      return;
    };

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
