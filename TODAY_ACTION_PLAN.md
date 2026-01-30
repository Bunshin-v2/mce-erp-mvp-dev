# MCE 2026 - Action Plan (Start Today)

**This is your execution checklist. Complete in order.**

---

## ✅ PHASE 1: SETUP (This Afternoon - 2 hours)

### Task 1.1: Review System Documentation
**Time:** 20 minutes
**Action:**
- [ ] Read QUICK_REFERENCE_2026.md (entire file)
- [ ] Skim ENTERPRISE_DESIGN_SYSTEM_2026.md (skim Part 1: Critique)
- [ ] Skim DESIGN_SYSTEM_README.md

**Result:** You understand the scope and principles.

### Task 1.2: Import Token System
**Time:** 10 minutes
**Action:**
- [ ] Verify `styles/tokens-2026.css` exists
- [ ] Add to `index.css`:
```css
@import './styles/tokens-2026.css';
```
- [ ] Verify no build errors

**Result:** All design tokens are now available globally.

### Task 1.3: Test Token System
**Time:** 15 minutes
**Action:**
- [ ] Open browser DevTools
- [ ] Go to any page
- [ ] In console, type: `getComputedStyle(document.documentElement).getPropertyValue('--color-critical')`
- [ ] Should return: `#be185d` (or similar hex)

**Result:** Tokens are working in the browser.

### Task 1.4: Create Primitive Components (if not exist)
**Time:** 45 minutes
**Action:**

Create `components/primitives/Box.tsx`:
```tsx
import React from 'react';

interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: '2' | '3' | '4' | '5' | '6' | '8' | '10';
  gap?: '2' | '3' | '4' | '5' | '6' | '8';
  children: React.ReactNode;
}

export const Box: React.FC<BoxProps> = ({
  padding,
  gap,
  className = '',
  ...props
}) => {
  const paddingClass = padding ? `p-${padding}` : '';
  const gapClass = gap ? `gap-${gap}` : '';

  return (
    <div className={`${paddingClass} ${gapClass} ${className}`} {...props} />
  );
};
```

Create `components/primitives/Text.tsx`:
```tsx
import React from 'react';

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  size?: 'xs' | 'sm' | 'base' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'tertiary' | 'critical' | 'success' | 'warning';
  children: React.ReactNode;
}

export const Text: React.FC<TextProps> = ({
  size = 'base',
  weight = 'normal',
  color = 'primary',
  className = '',
  ...props
}) => {
  const textClass = `text-${size} font-${weight} text-${color}`;

  return <span className={`${textClass} ${className}`} {...props} />;
};
```

Create `components/primitives/Button.tsx`:
```tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  className = '',
  ...props
}) => {
  const variantClass = {
    primary: 'bg-color-info text-white hover:bg-blue-700 transition-standard',
    secondary: 'bg-white/[0.05] text-white hover:bg-white/[0.1] transition-standard',
    ghost: 'text-white hover:bg-white/[0.05] transition-standard',
  }[variant];

  return (
    <button
      className={`px-4 py-2.5 rounded-md font-medium text-sm ${variantClass} ${className}`}
      {...props}
    />
  );
};
```

Create `components/primitives/Card.tsx`:
```tsx
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ className = '', ...props }) => {
  return (
    <div
      className={`
        bg-white/[0.01] border border-zinc-700 rounded-lg
        p-6 transition-standard shadow-elevation
        hover:shadow-elevated hover:bg-white/[0.02]
        ${className}
      `}
      {...props}
    />
  );
};
```

Create `components/primitives/index.ts`:
```tsx
export { Box } from './Box';
export { Text } from './Text';
export { Button } from './Button';
export { Card } from './Card';
```

**Result:** You have working primitive components.

---

## ✅ PHASE 2: DEPLOY SIDEBAR (Tomorrow - 1 hour)

### Task 2.1: Replace Current Sidebar
**Time:** 45 minutes
**Action:**
- [ ] Backup current `components/Sidebar.tsx` (rename to `Sidebar-old.tsx`)
- [ ] Copy `components/Sidebar-2026.tsx` to `components/Sidebar.tsx`
- [ ] Update imports in main layout file
- [ ] Test navigation
- [ ] Verify active state (blue left border + highlight)
- [ ] Test collapse/expand animation

**Result:** New sidebar is live.

### Task 2.2: Verify Active State
**Time:** 15 minutes
**Action:**
- [ ] Click different nav items
- [ ] Verify blue left border appears on active item
- [ ] Verify background highlight appears
- [ ] Verify text color changes to white
- [ ] Verify animation is smooth (Framer Motion)

**Result:** Navigation active states work correctly.

---

## ✅ PHASE 3: UPDATE CRITICAL PAGES (This Week - 4 hours)

### Task 3.1: Audit Current Pages (1 hour)
**Time:** 60 minutes
**Action:**

For each page (Dashboard, Reports, Financials, Projects):
1. Open page in browser
2. Print QUICK_REFERENCE_2026.md
3. Check each rule:
   - [ ] Typography scale (sizes 11-32px only)
   - [ ] Font weights (400, 500, 600, 700 only)
   - [ ] Case (sentence case, not ALL CAPS)
   - [ ] Colors (semantic use)
   - [ ] Spacing (4px multiples)
   - [ ] Borders (bottom borders on tables)
   - [ ] Transitions (150ms, 200ms, 300ms, 400ms only)

4. Document violations

**Result:** You have a list of violations to fix.

### Task 3.2: Fix Dashboard Page (2 hours)
**Time:** 120 minutes
**Action:**

In `components/pages/Dashboard.tsx`:

1. **Typography cleanup:**
   - [ ] Replace `text-[12px]` → `text-sm`
   - [ ] Replace `text-[13px]` → `text-base`
   - [ ] Replace `font-black` → `font-semibold` or `font-bold`
   - [ ] Replace ALL CAPS labels → Sentence case

2. **Color fixes:**
   - [ ] Replace `text-red-500` → `text-critical`
   - [ ] Replace `text-green-500` → `text-success`
   - [ ] Replace hardcoded hex → `text-neutral`, `text-secondary`, etc.

3. **Spacing fixes:**
   - [ ] Replace `space-y-1.5` → `space-y-4`
   - [ ] Replace `p-7` → `p-6` or `p-8`
   - [ ] Replace `gap-3.5` → `gap-4`

4. **Border fixes:**
   - [ ] Replace `border` → `border-b` on tables
   - [ ] Replace `border-glass` → `border-zinc-700`

5. **Motion fixes:**
   - [ ] Replace `duration-500` → `transition-standard`

6. **Test:**
   - [ ] No build errors
   - [ ] Page renders correctly
   - [ ] Hover states work

**Result:** Dashboard page is 2026-compliant.

### Task 3.3: Fix Reports Page (1 hour)
**Time:** 60 minutes
**Action:**

In `components/pages/ReportsPage.tsx`:

Apply same fixes as Dashboard (copy checklist above).

Special focus:
- [ ] Profile selector cards have gradient backgrounds
- [ ] Table headers use `bg-white/[0.02]`, `border-b border-zinc-700`, `font-semibold`
- [ ] Table rows have proper spacing (16px vertical)
- [ ] Status badges use semantic colors

**Result:** Reports page is professional (not kindergarten).

---

## ✅ PHASE 4: GOVERNANCE ENFORCEMENT (Next Week - 2 hours)

### Task 4.1: Set Up ESLint Rules
**Time:** 60 minutes
**Action:**

Create `eslint-rules-mce-2026.js`:
```javascript
module.exports = {
  rules: {
    'no-hardcoded-colors': {
      level: 'error',
      test: /text-\[#|bg-\[#|text-(red|blue|green|yellow)-\d+/,
      message: 'Use CSS variable tokens (--color-critical, --color-success, etc.)'
    },
    'no-arbitrary-sizes': {
      level: 'error',
      test: /text-\[\d+px\]/,
      message: 'Use typography scale (text-xs, text-sm, text-base, etc.)'
    },
    'no-arbitrary-spacing': {
      level: 'error',
      test: /[pgm]-(7|9|11|13)(?!\d)|gap-([357](?!\d)|2\.5)/,
      message: 'Use 4px scale (space-1=4px, space-2=8px, space-4=16px, space-6=24px)'
    }
  }
};
```

**Result:** Linter blocks violations automatically.

### Task 4.2: Update CLAUDE.md in IDE
**Time:** 15 minutes
**Action:**

Your IDE should:
- [ ] Load CLAUDE.md automatically
- [ ] Show governance rules to Claude
- [ ] Block non-compliant code suggestions
- [ ] Suggest tokens instead of hardcoded values

**Result:** AI assistance respects governance.

### Task 4.3: Create Code Review Checklist
**Time:** 30 minutes
**Action:**

In your git repo or Notion, create:

```markdown
# MCE 2026 Code Review Checklist

Before approving any PR, verify:
- [ ] No hardcoded colors (use tokens)
- [ ] No arbitrary font sizes (use typography scale)
- [ ] No arbitrary spacing (use 4px scale)
- [ ] Uses semantic colors (red=critical, green=success)
- [ ] Uses primitive components (Box, Text, Button, Card)
- [ ] TypeScript types on all props
- [ ] Passes 2026 readiness checklist
- [ ] No violations of governance rules
```

**Result:** Code review enforces standards.

---

## ✅ PHASE 5: TEAM COMMUNICATION (Next Week - 1 hour)

### Task 5.1: Share System with Team
**Time:** 20 minutes
**Action:**
- [ ] Share QUICK_REFERENCE_2026.md (print for each team member)
- [ ] Share DESIGN_SYSTEM_README.md (email summary)
- [ ] Share Sidebar-2026.tsx as reference implementation
- [ ] Schedule 30-minute walkthrough

**Result:** Team is aligned.

### Task 5.2: Walkthrough Meeting
**Time:** 30 minutes
**Action:**

Cover:
1. **Why:** Enterprise governance prevents design drift
2. **What:** 7 immutable rules (no hardcoded values, etc.)
3. **Where:** Token system in styles/tokens-2026.css
4. **How:** Use primitives (Box, Text, Button, Card)
5. **When:** Apply to every new feature
6. **Check:** Run 2026 readiness checklist

**Result:** Team understands expectations.

### Task 5.3: Establish Governance Process
**Time:** 10 minutes
**Action:**
- [ ] New features must pass 2026 checklist before merge
- [ ] Code review checks governance compliance
- [ ] Monthly design system review (audit for drift)
- [ ] Update tokens in single source (styles/tokens-2026.css)

**Result:** Process prevents regression.

---

## 🎯 Success Metrics

**After completing ALL tasks above:**

✅ Sidebar is visually new (180px, clear active state)
✅ Dashboard page is 2026-compliant
✅ Reports page looks professional (not kindergarten)
✅ Token system is in place and working
✅ Primitive components exist
✅ Governance rules are understood
✅ Team is aligned
✅ Code review enforces standards

**What you should see:**
- Cleaner, calmer visual hierarchy
- Consistent typography throughout
- Professional spacing and breathing room
- Clear semantic colors
- No arbitrary design decisions
- Sustainable system for future work

---

## 📋 Checklist (Print This)

**PHASE 1 - SETUP**
- [ ] 1.1 Review documentation
- [ ] 1.2 Import token system
- [ ] 1.3 Test tokens in browser
- [ ] 1.4 Create primitives (Box, Text, Button, Card)

**PHASE 2 - SIDEBAR**
- [ ] 2.1 Deploy new sidebar
- [ ] 2.2 Verify active states

**PHASE 3 - PAGES**
- [ ] 3.1 Audit current pages
- [ ] 3.2 Fix Dashboard page
- [ ] 3.3 Fix Reports page

**PHASE 4 - GOVERNANCE**
- [ ] 4.1 Set up ESLint rules
- [ ] 4.2 Update CLAUDE.md
- [ ] 4.3 Create code review checklist

**PHASE 5 - TEAM**
- [ ] 5.1 Share system docs
- [ ] 5.2 Schedule walkthrough
- [ ] 5.3 Establish process

---

## 🚀 You Are Ready

**The system is complete. The rules are clear. The tools are ready.**

Start with PHASE 1 today. Complete PHASE 2 tomorrow. By next week, your ERP will be visibly transformed.

No guessing. No arbitrary decisions. Just systems that last.

---

**Questions?**
- Reference: QUICK_REFERENCE_2026.md
- Deep dive: ENTERPRISE_DESIGN_SYSTEM_2026.md
- Code: components/Sidebar-2026.tsx
- Tokens: styles/tokens-2026.css

**Go build something inevitable.**
