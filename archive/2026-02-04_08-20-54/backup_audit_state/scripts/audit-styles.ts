import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');

const STANDARDS = {
  colors: {
    primary: 'var(--color-critical)',
    brandRed: '#c21719',
    obsidian: '#0b0c10',
  },
  typography: {
    sidebarText: 'var(--sidebar-text-size, 0.75rem)',
    h1: 'text-2xl font-black tracking-tight',
    h2: 'text-xl font-bold tracking-tight',
  },
  layout: {
    sidebarWidth: 'w-[200px]',
    sidebarCollapsedWidth: 'w-[64px]',
  }
};

const ALLOWED_HEX = ['#c21719', '#0b0c10', '#15171e', '#1c1f26', '#ffffff', '#000000'];

function auditFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(ROOT_DIR, filePath);
  const issues: string[] = [];

  // 1. Check for hardcoded hex colors not in brand palette
  const hexRegex = /#(?:[0-9a-fA-F]{3}){1,2}/g;
  const matches = content.match(hexRegex);
  if (matches) {
    matches.forEach(hex => {
      if (!ALLOWED_HEX.includes(hex.toLowerCase())) {
        issues.push(`[COLOR] Non-standard hex color found: ${hex}`);
      }
    });
  }

  // 2. Check for inconsistent font sizes (e.g. using text-xs instead of var)
  if (filePath.includes('Sidebar.tsx')) {
    if (!content.includes('--sidebar-text-size')) {
      issues.push(`[TYPO] Sidebar might be missing --sidebar-text-size variable`);
    }
  }

  // 3. Check Header consistency
  if (content.includes('<h1') && !content.includes(STANDARDS.typography.h1)) {
    issues.push(`[TYPO] H1 tag does not match Golden State classes: ${STANDARDS.typography.h1}`);
  }

  // 4. Check for console logs (bad for production stability)
  if (content.includes('console.log')) {
    issues.push(`[CODE] console.log found - should be removed or replaced with a logger`);
  }

  return issues;
}

function walk(dir: string, callback: (filePath: string) => void) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory() && !file.startsWith('.') && file !== 'node_modules' && file !== 'dist') {
      walk(filePath, callback);
    } else if (stats.isFile() && (file.endsWith('.tsx') || file.endsWith('.ts'))) {
      callback(filePath);
    }
  });
}

console.log('--- MCE SYSTEM AUDIT: VISUAL & CODE CONSISTENCY ---');
const allIssues: Record<string, string[]> = {};
let totalIssues = 0;

walk(path.join(ROOT_DIR, 'components'), (filePath) => {
  const issues = auditFile(filePath);
  if (issues.length > 0) {
    const rel = path.relative(ROOT_DIR, filePath);
    allIssues[rel] = issues;
    totalIssues += issues.length;
  }
});

walk(path.join(ROOT_DIR, 'hooks'), (filePath) => {
  const issues = auditFile(filePath);
  if (issues.length > 0) {
    const rel = path.relative(ROOT_DIR, filePath);
    allIssues[rel] = issues;
    totalIssues += issues.length;
  }
});

if (totalIssues === 0) {
  console.log('✅ All components passed the Golden State consistency check!');
} else {
  for (const [file, issues] of Object.entries(allIssues)) {
    console.log(`
📄 ${file}`);
    issues.forEach(issue => console.log(`   - ${issue}`));
  }
  console.log(`
Total Issues Found: ${totalIssues}`);
}
