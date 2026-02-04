'use client';

import React, { useEffect, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider } from '@clerk/clerk-react';
import { ToastProvider } from '@/lib/toast-context';
import { StyleProvider } from '@/lib/StyleSystem';
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
        <StyleProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </StyleProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );

  // Don't render actual content until mounted to avoid hydration mismatch
  if (!mounted) {
    return <div />;
  }

  // If no Clerk key, the system is misconfigured
  if (!clerkKey) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-zinc-950 text-white font-sans">
        <div className="p-8 border border-red-500/30 bg-red-500/5 rounded-2xl max-w-md text-center">
          <h2 className="text-xl font-black italic uppercase font-oswald mb-4">Security Breach Protocol</h2>
          <p className="text-sm text-zinc-400 leading-relaxed mb-6">
            The system identity core (Clerk) is not initialized. 
            All access nodes have been locked for your protection.
          </p>
          <div className="text-[10px] font-mono text-red-500/60 uppercase tracking-widest">
            ERROR_CODE: CLERK_KEY_MISSING
          </div>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkKey}>
      {content}
    </ClerkProvider>
  );
}
