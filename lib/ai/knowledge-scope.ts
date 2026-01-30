export interface KnowledgeScope {
  docs: string[];
  pages: string[];
  apis: string[];
  keywords: string[];
  summary: string;
}

const MAX_DOCS = 4;
const MAX_PAGES = 5;
const MAX_APIS = 5;

const DEFAULT_DOCS = [
  'Design System',
  'Deployment Checklist',
  'Supabase Setup',
  'Systems Governance',
];

const DEFAULT_PAGES = [
  'Dashboard',
  'Projects',
  'Tenders',
  'Documents',
  'Calendar',
];

const DEFAULT_APIS = [
  '/api/ai/chat',
  '/api/ai/retrieve',
  '/api/projects',
  '/api/documents',
  '/api/tenders',
];

function buildKeywords(docs: string[], pages: string[], apis: string[]): string[] {
  const keywords = new Set<string>();
  const maxKeywords = 8;

  if (pages.length && docs.length) {
    keywords.add(`${pages[0]} + ${docs[0]}`);
  }
  if (pages.length > 1 && docs.length > 1) {
    keywords.add(`${pages[1]} + ${docs[1]}`);
  }
  if (apis.length) {
    keywords.add(`AI Gateway (${apis[0] || '/api/ai/chat'})`);
  }

  keywords.add('Tender intake + documentation');
  keywords.add('Project portfolio visibility');
  keywords.add('Document workflow compliance');
  keywords.add('Executive Cockpit KPIs');
  keywords.add('Agent console + automation');

  return Array.from(keywords).slice(0, maxKeywords);
}

export function buildKnowledgeScope(): KnowledgeScope {
  // Avoid filesystem scanning during builds (keeps Turbopack bundles lean).
  // If you want richer scope discovery, wire it via your external AI Gateway.
  const docs = DEFAULT_DOCS.slice(0, MAX_DOCS);
  const pages = DEFAULT_PAGES.slice(0, MAX_PAGES);
  const apis = DEFAULT_APIS.slice(0, MAX_APIS);
  const keywords = buildKeywords(docs, pages, apis);

  const summaryParts = [
    docs.length ? `Docs: ${docs.join(', ')}` : null,
    pages.length ? `Pages: ${pages.join(', ')}` : null,
    apis.length ? `APIs: ${apis.join(', ')}` : null,
  ].filter((p): p is string => Boolean(p));

  const summary =
    summaryParts.length > 0 ? summaryParts.join(' | ') : 'Scope: Projects, Tenders, Documents, AI.';

  return {
    docs,
    pages,
    apis,
    keywords,
    summary,
  };
}
