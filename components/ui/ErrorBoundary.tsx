'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { GlassButton } from './GlassButton';
import { logger } from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('UNCAUGHT_UI_EXCEPTION', { error: error.message, errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-gov-bg border border-glass rounded-xl">
          <div className="w-16 h-16 mb-6 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-center text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
            <AlertTriangle size={32} />
          </div>
          
          <h2 className="text-xl font-bold italic text-white tracking-tight mb-2">
            Neural Path Interrupted
          </h2>
          <p className="text-[10px] font-mono text-zinc-500 tracking-widest mb-8 max-w-md text-center">
            A critical UI exception has occurred. The system has isolated the fault to prevent global instability.
          </p>
          
          <GlassButton onClick={this.handleReset} className="px-6 py-2 text-[9px]">
            <RefreshCw size={14} className="mr-2" />
            Re-Initialize Interface
          </GlassButton>

          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 p-4 bg-black/40 border border-glass rounded-lg w-full overflow-auto max-h-40">
              <pre className="text-[9px] font-mono text-rose-400">
                {this.state.error?.stack}
              </pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

