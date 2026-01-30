import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');

const COLOR_MAPPINGS: Record<string, string> = {
  '#00dc82': 'var(--color-success)',
  '#10b981': 'var(--color-success)',
  '#33cccc': 'var(--color-info)',
  '#00ffff': 'var(--color-info)',
  '#c21719': 'var(--color-critical)',
  '#a01214': 'var(--color-critical)',
  '#ef4444': 'var(--color-critical)',
  '#f59e0b': 'var(--color-warning)',
  '#ffd700': 'var(--color-warning)',
  '#0a0a0c': 'var(--surface-base)',
  '#09090b': 'var(--surface-base)',
  '#0f0f11': 'var(--surface-base)',
  '#16161a': 'var(--surface-layer)',
  '#0a0a0c': 'var(--surface-base)',
};

function alignFile(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;

  // 1. Align Colors
  Object.entries(COLOR_MAPPINGS).forEach(([hex, variable]) => {
    const regex = new RegExp(hex, 'gi');
    if (regex.test(content)) {
      content = content.replace(regex, variable);
      changed = true;
    }
  });

  // 2. Align Headers (h1)
  const h1Regex = /<h1([^>]*?)className=(['"])(.*?)\2/g;
  if (h1Regex.test(content)) {
    content = content.replace(h1Regex, (match, p1, quote, classes) => {
      if (!classes.includes('text-2xl font-black tracking-tight')) {
        changed = true;
        // Keep existing classes but ensure the standard ones are there
        return `<h1${p1}className=${quote}text-2xl font-black tracking-tight text-white ${classes.replace(/text-(xs|sm|base|lg|xl|[2-9]xl)/g, '').trim()}${quote}`;
      }
      return match;
    });
  }

  // 3. Remove console.logs
  if (content.includes('console.log')) {
    content = content.replace(/console\.log\(.*?\);?/g, '');
    changed = true;
  }

  // 4. Align Sidebar text sizes in Sidebar.tsx specifically
  if (filePath.includes('Sidebar.tsx')) {
    if (content.includes('0.7rem')) {
      content = content.replace(/0\.7rem/g, 'var(--sidebar-text-size, 0.75rem)');
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  }
  return false;
}

function walk(dir: string) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (!['node_modules', 'dist', '.git'].includes(file)) walk(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      alignFile(filePath);
    }
  });
}

console.log('--- STARTING SYSTEM ALIGNMENT MIGRATION ---');
walk(path.join(ROOT_DIR, 'components'));
walk(path.join(ROOT_DIR, 'hooks'));
console.log('✅ Alignment complete. Visual and code consistency enforced.');
