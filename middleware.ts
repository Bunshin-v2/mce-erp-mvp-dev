import { clerkMiddleware } from '@clerk/nextjs/server';

// Provides Clerk auth context for App Router APIs.
// Route access is enforced by application-level guards and API handlers.
export default clerkMiddleware();

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
