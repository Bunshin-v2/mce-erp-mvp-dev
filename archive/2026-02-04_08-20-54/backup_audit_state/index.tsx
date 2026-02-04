import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';

// @ts-ignore
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

if (!PUBLISHABLE_KEY) {
  const handleBypass = () => {
    // Force render the app without ClerkProvider for local preview
    root.render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <App bypassAuth={true} />
        </QueryClientProvider>
      </React.StrictMode>
    );
  };

  root.render(
    <div className="h-screen w-screen flex items-center justify-center bg-slate-50 font-sans p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3-3.5 3.5" /></svg>
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Clerk Setup Required</h1>
        <p className="text-slate-500 text-sm mb-6">
          To activate authentication, please add your Clerk Key to <code className="bg-slate-100 px-1 rounded text-rose-600">.env.local</code>.
        </p>

        <button
          onClick={handleBypass}
          className="w-full py-3 bg-[#333999] text-white rounded-xl font-bold text-sm shadow-lg hover:bg-[#2a2f80] transition-all mb-4"
        >
          Bypass Authentication (Demo Mode)
        </button>

        <p className="text-[10px] text-slate-200 uppercase tracking-widest font-bold">
          Nexus ERP | Infrastructure Security Layer
        </p>
      </div>
    </div>
  );
} else {
  root.render(
    <React.StrictMode>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </ClerkProvider>
    </React.StrictMode>
  );
}
