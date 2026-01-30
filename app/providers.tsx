'use client';

import React, { useEffect, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider } from '@clerk/clerk-react';
import { ToastProvider } from '@/lib/toast-context';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { queryClient } from '@/lib/queryClient';

export function Providers({ children }: { children: React.ReactNode }) {
  const [clerkKey, setClerkKey] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Get Clerk key from window.__ENV set by layout
    const key = (window as any).__ENV?.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    setClerkKey(key || null);
    setMounted(true);
  }, []);

  const content = (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <ToastProvider>
          {children}
        </ToastProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );

  // Don't render actual content until mounted to avoid hydration mismatch
  if (!mounted) {
    return <div />;
  }

  // If Clerk key is available, wrap with ClerkProvider
  if (clerkKey) {
    return (
      <ClerkProvider publishableKey={clerkKey}>
        {content}
      </ClerkProvider>
    );
  }

  // If no Clerk key, just render content without auth
  return content;
}
