import React from 'react';
import { SignIn } from '@clerk/clerk-react';

export const InputZero: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--surface-base)] text-[var(--text-primary)]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-12 md:flex-row md:items-stretch">
        <div className="flex flex-1 flex-col justify-between rounded-3xl border border-[var(--surface-border)] bg-[var(--overlay-1)] p-8 backdrop-blur md:p-10">
          <div className="space-y-10">
            <div className="space-y-3">
              <div className="text-[56px] font-black italic leading-none tracking-tight md:text-[78px]">
                <span className="text-[var(--color-critical)]">Morgan</span>
                <span className="text-[var(--text-primary)]">.</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-px w-10 bg-[var(--surface-border-strong)]" />
                <div className="text-[12px] font-bold italic uppercase tracking-[0.22em] text-[var(--text-secondary)]">
                  Designing Excellence
                </div>
              </div>

              <div className="max-w-lg text-sm leading-relaxed text-[var(--text-secondary)]">
                Sign in to access projects, tenders, documents, tasks, and the unified calendar — in one operational workspace.
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {[
                { label: 'Projects', detail: 'Delivery status, milestones, drift.' },
                { label: 'Tenders', detail: 'Pipeline, probability, next actions.' },
                { label: 'Documents', detail: 'Review, extract, compliance gates.' },
                { label: 'AI', detail: 'RAG-assisted answers via gateway.' },
              ].map(item => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-[var(--surface-border)] bg-[var(--overlay-2)] p-4"
                >
                  <div className="text-[10px] font-bold italic uppercase tracking-widest text-[var(--text-tertiary)]">
                    {item.label}
                  </div>
                  <div className="mt-2 text-xs font-semibold text-[var(--text-primary)]">{item.detail}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-10">
            <div className="text-[10px] font-bold italic uppercase tracking-widest text-[var(--text-tertiary)]">
              Secure access • Role-based governance • Audit-ready workflows
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col justify-center md:w-[420px]">
          <div className="rounded-3xl border border-[var(--surface-border-strong)] bg-[var(--overlay-1)] p-2 backdrop-blur">
            <div className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-layer)] p-6">
              <div className="mb-6">
                <div className="text-[10px] font-bold italic uppercase tracking-widest text-[var(--text-tertiary)]">
                  Morgan ERP
                </div>
                <div className="mt-2 text-xl font-black italic tracking-tight">Sign In</div>
              </div>

              <SignIn
                appearance={{
                  layout: {
                    socialButtonsPlacement: 'bottom',
                    socialButtonsVariant: 'iconButton',
                  },
                  elements: {
                    rootBox: 'w-full',
                    card: 'bg-transparent shadow-none p-0 w-full',
                    headerTitle: 'hidden',
                    headerSubtitle: 'hidden',
                    formButtonPrimary:
                      'bg-[var(--text-primary)] hover:opacity-90 text-[var(--surface-base)] font-bold italic py-3 rounded-xl normal-case',
                    formFieldInput:
                      'bg-[var(--bg-input)] border-[var(--surface-border)] text-[var(--text-primary)] focus:border-[var(--surface-border-strong)] rounded-xl',
                    formFieldLabel:
                      'text-[var(--text-tertiary)] text-xs font-bold italic uppercase tracking-widest',
                    footerAction: 'hidden',
                    dividerLine: 'bg-[var(--surface-border)]',
                    dividerText:
                      'text-[var(--text-tertiary)] text-[10px] font-bold italic uppercase tracking-widest bg-[var(--surface-layer)]',
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
