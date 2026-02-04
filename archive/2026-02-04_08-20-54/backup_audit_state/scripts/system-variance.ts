import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');

const colorMap: Record<string, string[]> = {};
const fontSizeMap: Record<string, string[]> = {};
const fontSmoothingMap: Record<string, string[]> = {};

function analyzeFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(ROOT_DIR, filePath);

  // Detect Hex Colors
  const hexMatches = content.match(/#(?:[0-9a-fA-F]{3}){1,2}/g);
  if (hexMatches) {
    hexMatches.forEach(hex => {
      const h = hex.toLowerCase();
      if (!colorMap[h]) colorMap[h] = [];
      if (!colorMap[h].includes(relativePath)) colorMap[h].push(relativePath);
    });
  }

  // Detect Tailwind Font Sizes
  const sizeMatches = content.match(/text-(xs|sm|base|lg|xl|[2-9]xl|[\[.*?\]])/g);
  if (sizeMatches) {
    sizeMatches.forEach(size => {
      if (!fontSizeMap[size]) fontSizeMap[size] = [];
      if (!fontSizeMap[size].includes(relativePath)) fontSizeMap[size].push(relativePath);
    });
  }

  // Detect Font Smoothing (Antialiasing)
  if (content.includes('antialiased')) {
    if (!fontSmoothingMap['antialiased']) fontSmoothingMap['antialiased'] = [];
    fontSmoothingMap['antialiased'].push(relativePath);
  }
}

function walk(dir: string) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (!['node_modules', 'dist', '.git'].includes(file)) walk(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
      analyzeFile(filePath);
    }
  });
}

walk(path.join(ROOT_DIR, 'components'));
walk(path.join(ROOT_DIR, 'hooks'));

console.log('\n--- SYSTEM UI VARIANCE REPORT ---');

console.log('\n🎨 COLOR DIVERSITY (Total unique colors: ' + Object.keys(colorMap).length + ')');
Object.entries(colorMap)
  .sort((a, b) => b[1].length - a[1].length)
  .forEach(([color, files]) => {
    console.log(`${color}: used in ${files.length} files`);
    if (files.length < 3) console.log(`   └─ Minor use in: ${files.join(', ')}`);
  });

console.log('\n📏 TYPOGRAPHY DIVERSITY (Font size classes)');
Object.entries(fontSizeMap)
  .sort((a, b) => b[1].length - a[1].length)
  .forEach(([size, files]) => {
    console.log(`${size}: used in ${files.length} files`);
  });
