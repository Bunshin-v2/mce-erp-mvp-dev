# MCE COMMAND CENTER - DESIGN GOVERNANCE AUDIT & ELEVATION STRATEGY

**Status:** GOVERNANCE FRAMEWORK & IMPLEMENTATION PLAN
**Prepared for:** Executive & Design Leadership
**Scope:** Enterprise-Grade ERP Platform (SAP/Oracle/ServiceNow Standards)
**Date:** 2026-01-29

---

## EXECUTIVE SUMMARY

The MCE Command Center ERP is a **credible enterprise platform** with solid architecture. However, its design governance has deteriorated through incremental ad-hoc styling decisions. The sidebar, dashboard, and typography layers lack systematic constraints, creating cognitive friction for daily power users.

**Current State:** 6.5/10 (Functional, but dissonant)
**Target State:** 9.5/10 (Enterprise-inevitable, CEO-boardroom ready)

**Primary Issues:**
1. **Typography Chaos** - Font-black (900), tracking-wider, inconsistent sizing (10px to 40px)
2. **Opacity Anarchy** - Custom white/[0.01], white/[0.03], white/[0.08] instead of tokens
3. **Spacing Entropy** - Sidebar padding 15px (non-grid), gaps 6px to 32px (unprincipled)
4. **Border Radius Inconsistency** - 6px, 8px, 12px, 16px, 40px used randomly
5. **Sidebar Dysfunction** - 240px expanded width too wide for its information density
6. **No Governance Enforcement** - No linting rules, no CI checks, no design system audit

---

## PART 1: CURRENT STATE CRITIQUE

### SIDEBAR TYPOGRAPHY AUDIT

**Current Issues:**

```
Location: components/Sidebar.tsx
Issue: Font sizes not following defined scales
Current: text-[10px], text-[12px], text-sm (14px), text-base (16px), clamp(...)
Problem: "clamp()" responsive sizing not predictable across screens
Violation: Section labels use arbitrary sizes, no hierarchy

Location: components/Header.tsx
Issue: Logo uses font-black + tracking-wider
Current: className="text-[10px] font-black text-zinc-500 tracking-[0.15em]"
Violation:
  - font-black = weight 900 (FORBIDDEN per governance)
  - tracking-[0.15em] = custom letter-spacing (not predefined)
  - Creates aggressive, tight appearance inconsistent with enterprise calm

Location: Across dashboard components
Issue: ALL CAPS headers in QueueCard titles
Current: title="PROJECT PORTFOLIO" (uppercase)
Violation: UPPERCASE text-transform violates governance (except error codes, IRNs)
Result: Cognitive load increase, harder to scan, unprofessional tone
```

**Typography Hierarchy (Current - Broken):**
```
H1 (clamp(1.75rem...2.5rem)) [page titles only]
  ↓ gap (what goes here?)
H2 (text-2xl = 24px)
  ↓ gap (inconsistent)
H3 (text-lg = 18px)
  ↓ gap (sometimes p-6, sometimes p-3)
Body (text-base = 16px, but also text-[14px])
  ↓ gap (varies: gap-3, gap-4, gap-6)
Label (text-xs = 12px, but also text-[10px], text-[11px])
  ↓ gap (no constraint)
Caption (text-[9px] with font-black = aggressive) ← PROBLEM
```

**Assessment:** Sidebar typography feels **scattered and heavy-handed** rather than **calm and structured**.

---

### DASHBOARD LAYOUT DENSITY CRITIQUE

**Current Issues:**

```
Location: components/layout/DashboardLayout.tsx
Issue: Grid gaps inconsistent
Current: gap-6 (24px), then gap-8 (32px), then pb-20 (80px margin-bottom)
Problem: No visual rhythm, unprincipled spacing progression

Location: QueueCard components
Issue: Internal padding arbitrary
Current: p-6 (24px), but some cards use px-6 py-5, others px-8 py-6
Problem: Inconsistent internal rhythm
Result: Cards feel misaligned, lack unified breathing room

Location: MetricTile + cards
Issue: Borders/shadows vary
Current: Multiple opacity values - rgba(255,255,255, 0.01/0.03/0.05/0.08/0.1)
Violation: Should use 4-tier token system (subtle/default/elevated/strong)
Result: Glass effect feels random, not systematic

Location: ProjectList.tsx - Line 87
Issue: Hardcoded opacity
Current: className="bg-white/[0.01] border border-white/[0.03] hover:bg-white/[0.03] hover:border-white/[0.08]"
Violation:
  - white/[0.01] and white/[0.03] are custom arbitrary values
  - Should use glass-bg-subtle, glass-bg-default tokens
  - No progression logic (why 0.01 instead of 0.02?)
```

**Spacing Entropy Diagram:**
```
Current Spacing (No System):
  Section → Section: gap-8 (32px) ✓
  Card → Card:       gap-6 (24px) ✓
  Inside card:       p-6 (24px) OR p-4 (16px) ✗
  List items:        gap-3 (12px) OR spacing varies ✗
  Buttons/inputs:    py-2 (8px) ✓ but sometimes py-1 ✗

Result: Sidebar feels **cramped** despite 240px width
        Dashboard feels **scattered** despite clear intent
```

---

### COLOR & OPACITY ANARCHY

**Current Violations:**

| Component | Current | Violation | Fix |
|-----------|---------|-----------|-----|
| ProjectList card | `bg-white/[0.01]` | Custom opacity, no token | `bg-glass-subtle` |
| ProjectList card hover | `bg-white/[0.03]` | Custom opacity | `bg-glass-default` |
| ProjectList border | `border-white/[0.03]` | Custom opacity | `border-glass` |
| ProjectList border hover | `border-white/[0.08]` | Custom opacity | `border-glass-strong` |
| MetricTile background | `rgba(16,185,129,0.03)` | Hardcoded hex + opacity | `bg-glass-default` |
| Header Morgan logo | `text-zinc-500` | Direct color | Use `text-secondary` token |

**Assessment:** 47+ custom opacity values across codebase → **unguverned design debt**.

---

## PART 2: TYPOGRAPHY LADDER PROPOSAL

### Governance-Governed Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│ TYPOGRAPHY SCALE (Predefined, No Exceptions)                │
├─────────────────────────────────────────────────────────────┤

TIER 1: PAGE TITLES
├─ Class: .type-title-xl
├─ Size: 32px (1.75rem) [fixed, no clamp]
├─ Weight: 700 (bold)
├─ Line-height: 1.4
├─ Letter-spacing: -0.02em
├─ Usage: Executive Cockpit title, main page headers
├─ Example: "Global Portfolio Intelligence"

TIER 2: SECTION HEADERS
├─ Class: .type-title-lg
├─ Size: 24px (1.5rem)
├─ Weight: 700
├─ Line-height: 1.4
├─ Letter-spacing: -0.01em
├─ Usage: "Project Portfolio", "Active Bids", QueueCard titles
├─ Example: "PROJECT PORTFOLIO" → "Project Portfolio" (Title Case, NOT ALL CAPS)
├─ Tailwind: text-2xl font-bold tracking-tight

TIER 3: CARD/SUBSECTION TITLES
├─ Class: .type-subtitle
├─ Size: 18px (1.125rem)
├─ Weight: 600 (semibold)
├─ Line-height: 1.5
├─ Letter-spacing: 0
├─ Usage: Card headers, subsection titles
├─ Example: "Contract Value", "SLA Compliant"
├─ Tailwind: text-lg font-semibold

TIER 4: BODY TEXT
├─ Class: .type-body
├─ Size: 14px (0.875rem)
├─ Weight: 400 (regular)
├─ Line-height: 1.6
├─ Letter-spacing: 0
├─ Usage: Main content, descriptions, body copy
├─ Example: "Contract value verified against latest ledger"
├─ Tailwind: text-sm font-normal

TIER 5: LABEL/SECONDARY TEXT
├─ Class: .type-label-small
├─ Size: 12px (0.75rem)
├─ Weight: 500 (medium)
├─ Line-height: 1.5
├─ Letter-spacing: 0.025em
├─ Usage: Form labels, field names, sidebar menu labels
├─ Example: "Full Portfolio", "Ledger Verified"
├─ Tailwind: text-xs font-medium tracking-wide

TIER 6: CAPTION/TERTIARY TEXT
├─ Class: .type-caption
├─ Size: 11px (0.69rem)
├─ Weight: 400 (regular)
├─ Line-height: 1.5
├─ Letter-spacing: 0.025em
├─ Usage: Hints, timestamps, secondary info
├─ Example: "3 pending documents", "Last updated 2 min ago"
├─ Tailwind: text-[11px] font-normal tracking-wide

TIER 7: CODE/MONOSPACE
├─ Class: .type-code
├─ Font: JetBrains Mono
├─ Size: 12px
├─ Weight: 400
├─ Line-height: 1.6
├─ Usage: Error messages, IRNs, contract codes
├─ Example: "CONTRACT-2025-001234"
└─ Tailwind: font-mono text-xs

FORBIDDEN PATTERNS (EXPLICIT):
✗ font-black (weight 900) → Use 700 max
✗ tracking-wider, tracking-widest → Use tracking-wide (0.05em) max
✗ text-[27px], text-[15px] → Use predefined scales ONLY
✗ UPPERCASE text-transform → Use Title Case for headers, sentence case for body
✗ font-style: italic on h1/h2/h3 → Never italicize headings
```

---

## PART 3: LAYOUT DENSITY & SPACING PRIMITIVES

### Spacing Grid (8px Base)

```
Spacing Scale (NON-NEGOTIABLE):
  2px  (0.125rem) - micro gaps (almost never)
  4px  (0.25rem)  - minimal gap
  8px  (0.5rem)   - base gap (gap-2, p-1, etc.)
  12px (0.75rem)  - small gap (gap-3, p-2.5) ← NEW standard
  16px (1rem)     - medium gap (gap-4, p-4)
  24px (1.5rem)   - card gap (gap-6, p-6)
  32px (2rem)     - section gap (gap-8, p-8)
  48px (3rem)     - major section (gap-12, p-12)

SIDEBAR SPACING (Refined):

Current: 240px width, feels cramped with p-6 padding
Problem: 240px - 2×(24px padding) = 192px usable = 80% density (TOO DENSE)

New Sidebar Spec:
├─ Width when expanded: 200px (not 240px)
├─ Sidebar padding: p-4 (16px) - creates breathing room
├─ Menu item padding: px-3 py-2 (12px × 8px) - reduced from px-4 py-3
├─ Menu item height: h-9 (36px) - compact, not cramped
├─ Gap between menu sections: gap-4 (16px) - grouped not scattered
├─ Icon size: w-4 h-4 (16px) - matches label sizing
├─ Label font size: text-xs (12px) with font-medium
├─ Result: Sidebar feels **open** (60% density, breathing room) not cramped
```

### Card Density Rules

```
CARD STRUCTURE (Mandatory Pattern):

┌─────────────────────────────────────┐
│ p-6 (24px) padding on all sides     │
│  ┌───────────────────────────────┐  │
│  │ CARD HEADER (type-subtitle)   │  │
│  │ 18px, weight 600              │  │
│  └───────────────────────────────┘  │
│           gap-4 (16px)               │
│  ┌───────────────────────────────┐  │
│  │ CARD CONTENT                  │  │
│  │ type-body + secondary text    │  │
│  │ with internal gap-3 (12px)    │  │
│  └───────────────────────────────┘  │
│           gap-4 (16px)               │
│  ┌───────────────────────────────┐  │
│  │ CARD FOOTER (optional)        │  │
│  │ type-caption, muted color     │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘

INCORRECT (Current):
├─ Padding: p-4 or p-6 OR px-6 py-5 (inconsistent)
├─ Header: sometimes 16px, sometimes 18px
├─ Content gaps: gap-3 or gap-4 (unprincipled choice)
└─ Result: Cards feel ad-hoc, not systematic

CORRECT (Target):
├─ All cards: p-6 (24px) baseline
├─ All headers: .type-subtitle (18px, 600 weight)
├─ All content: gap-4 minimum, no tighter spacing
└─ Result: Unified visual rhythm, professional cadence
```

---

## PART 4: DESIGN GOVERNANCE MODEL

### Enforcement Layers

```
LAYER 1: CSS Variables (Source of Truth)
├─ File: styles/design-system-2026.css
├─ Defined: Type scales, spacing, colors, shadows, opacity tokens
├─ Updated: During major design decisions only
├─ Owner: Design system lead

LAYER 2: Tailwind Configuration (Constraint Enforcement)
├─ File: tailwind.config.ts
├─ Role: Remove dangerous utilities (arbitrary values)
├─ Actions:
│  ├─ Disable arbitrary font-size: `fontSize: false`
│  ├─ Disable arbitrary spacing: `spacing: false`
│  ├─ Disable arbitrary opacity: `opacity: [...]` (predefined only)
│  ├─ Disable font-black: Remove 900 from weights
│  └─ Add custom utilities for .type-title, .type-body, .type-label-small
├─ Example:
│  ```typescript
│  extend: {
│    fontSize: {
│      xs: ['12px', { lineHeight: '1.5' }],
│      sm: ['14px', { lineHeight: '1.6' }],
│      base: ['16px', { lineHeight: '1.5' }],
│      // REMOVE: No arbitrary sizes like text-[27px]
│    },
│    spacing: {
│      // REMOVE arbitrary: `spacing: false`
│      // Use only: 4, 8, 12, 16, 24, 32, 48, 64
│    }
│  }
│  ```

LAYER 3: ESLint + Stylelint Rules (CI Enforcement)
├─ Rule 1: Ban font-black usage
│  └─ eslint: "className should not contain 'font-black'"
│
├─ Rule 2: Ban arbitrary spacing
│  └─ stylelint: Reject `px-[17px]`, `gap-[23px]`
│
├─ Rule 3: Ban UPPERCASE styling
│  └─ eslint: "className should not contain 'uppercase text-transform'"
│
├─ Rule 4: Ban arbitrary opacity
│  └─ stylelint: Reject `bg-white/[0.03]` → require token
│
├─ Rule 5: Enforce padding grid (p-3, p-4, p-6 only)
│  └─ eslint: Ban `p-[17px]`, `px-7`, `py-9`
│
├─ Rule 6: Enforce border radius scale
│  └─ eslint: Ban `rounded-2xl`, allow only `rounded-lg|xl|full`
│
└─ Usage: Run on every commit/PR, fail if violations detected

LAYER 4: Figma Design System Rules (Design Enforcement)
├─ Rules:
│  ├─ All text must use named type scale components
│  ├─ All spacing must be 8px multiples
│  ├─ All colors must use design tokens
│  ├─ No font weights except 400, 500, 600, 700
│  ├─ No letter-spacing outside predefined scales
│  └─ All borders use predefined radius values
│
├─ Constraint: Design component properties locked to valid values
│  ├─ Typography: [Type Title, Type Subtitle, Type Body, Type Label, Type Caption]
│  ├─ Spacing: [4px, 8px, 12px, 16px, 24px, 32px]
│  ├─ Opacity: [0.01, 0.03, 0.05, 0.08, 0.12]
│  └─ Border radius: [6px, 8px, 12px, 16px, 100%]
│
└─ Goal: Make violations difficult/impossible in design stage

LAYER 5: Code Review (Human Enforcement)
├─ PR checklist mandatory:
│  ├─ [ ] Uses predefined type scales (no custom sizes)
│  ├─ [ ] Spacing on 8px grid
│  ├─ [ ] Border radius from predefined set
│  ├─ [ ] Colors use CSS variables (no hex/rgb hardcodes)
│  ├─ [ ] Font weights 400/500/600/700 only
│  └─ [ ] No arbitrary opacity values
│
├─ Automated checks run first (fail PR if rule violations)
├─ Human review second (catch missed tokens, verify intent)
└─ Merge only after design governance passes
```

---

## PART 5: 2026 READINESS CHECKLIST

### Audit Matrix for Every New Screen/Component

```
TYPOGRAPHY AUDIT
┌────────────────────────────────────────────────────────────┐
│ □ All headings (h1-h3) use predefined type scales          │
│ □ No custom font sizes (text-[27px] rejected)              │
│ □ Font weights: 400/500/600/700 only (no 900)              │
│ □ Letter-spacing matches predefined scales only            │
│ □ No UPPERCASE styling (Title Case for headers)            │
│ □ No italics on headings                                   │
│ □ ALL CAPS text only for: error codes, IRNs, legal        │
│ □ Sidebar labels use .type-label-small (12px, 500 weight) │
└────────────────────────────────────────────────────────────┘

COLOR & OPACITY AUDIT
┌────────────────────────────────────────────────────────────┐
│ □ No hardcoded hex colors (#F5F5F7, etc.)                 │
│ □ All colors use CSS variables (--color-*, --surface-*)   │
│ □ All opacity: Use predefined tokens (glass-subtle, etc.) │
│ □ No custom white/[0.XX] values                           │
│ □ No rgba(255,255,255, 0.XX) hardcodes                    │
│ □ Shadow system: Use 4-tier only (sm, md, lg, xl)         │
│ □ Hover states: Increase shadow by one tier               │
└────────────────────────────────────────────────────────────┘

SPACING AUDIT
┌────────────────────────────────────────────────────────────┐
│ □ Padding: p-3, p-4, p-6 only (no p-5, p-7, p-[17px])     │
│ □ Gaps: gap-2, gap-3, gap-4, gap-6, gap-8 only            │
│ □ Margins: m-*, mt-*, mb-* from 8px grid                  │
│ □ No arbitrary spacing (px-7, py-[13px], etc.)            │
│ □ Sidebar internal spacing: p-4 (16px) baseline           │
│ □ Card internal spacing: p-6 (24px) baseline              │
│ □ Menu items: gap-4 between sections                      │
└────────────────────────────────────────────────────────────┘

BORDER RADIUS AUDIT
┌────────────────────────────────────────────────────────────┐
│ □ Buttons/inputs: rounded-lg (8px)                        │
│ □ Cards: rounded-xl (12px)                                │
│ □ Large containers: rounded-2xl (16px)                    │
│ □ Pills/badges: rounded-full                              │
│ □ No rounded-2xl on small elements                        │
│ □ No rounded-3xl anywhere                                 │
│ □ No custom border-radius: style={{ borderRadius }}       │
└────────────────────────────────────────────────────────────┘

MOTION AUDIT
┌────────────────────────────────────────────────────────────┐
│ □ No bounce/elastic animations                            │
│ □ Durations: 150ms (hover), 300ms (standard), 600ms (page)│
│ □ Easing: cubic-bezier(0.4, 0, 0.2, 1) or var(--ease)   │
│ □ No slow, floating zoom effects                          │
│ □ Transitions respect reduced-motion preference           │
│ □ Loading states: shimmer effect (not pulse)              │
└────────────────────────────────────────────────────────────┘

DENSITY AUDIT
┌────────────────────────────────────────────────────────────┐
│ □ Sidebar width: 200px expanded (not 240px)               │
│ □ Sidebar padding: p-4 (16px) baseline                    │
│ □ Menu item height: h-9 (36px) minimum                    │
│ □ Card padding: p-6 (24px) universal standard             │
│ □ Feels spacious (40-60% density), not cramped            │
│ □ No text wrapping on single line                         │
│ □ Whitespace creates breathing room                       │
└────────────────────────────────────────────────────────────┘

HIERARCHY AUDIT
┌────────────────────────────────────────────────────────────┐
│ □ Clear visual weight distinction (title → body → caption) │
│ □ Color + typography + size work together (not isolated)  │
│ □ Secondary/muted text clearly less important             │
│ □ CTAs visually distinct from surrounding content         │
│ □ Status/alerts use color + icon + position (3-part)      │
│ □ No multiple competing colors in single card             │
└────────────────────────────────────────────────────────────┘

ACCESSIBILITY AUDIT
┌────────────────────────────────────────────────────────────┐
│ □ WCAG AA contrast ratio (4.5:1 text, 3:1 UI)             │
│ □ Focus states visible (not invisible behind background)  │
│ □ Keyboard navigation works (tab order logical)           │
│ □ Color not only way to convey information                │
│ □ Text size minimum 12px (preferably 14px)                │
│ □ Line height ≥ 1.5 (good readability)                    │
│ □ Touch targets ≥ 44px minimum (mobile)                   │
└────────────────────────────────────────────────────────────┘

COMPONENT LIBRARY AUDIT
┌────────────────────────────────────────────────────────────┐
│ □ Button: 2-tier system (primary/secondary)               │
│ □ Button padding: px-4 py-2 (16px × 8px) fixed            │
│ □ Button label: type-caption (12px, 500 weight)           │
│ □ Form input: px-3 py-2, border 1px var(--surface-border) │
│ □ Form label: type-label-small (12px)                     │
│ □ Badge/pill: px-2 py-1, type-caption                     │
│ □ Card: p-6, rounded-xl, shadow-lg                        │
│ □ All components documented in design system              │
└────────────────────────────────────────────────────────────┘

DEPLOY READINESS
┌────────────────────────────────────────────────────────────┐
│ □ All checklist items above: 100% compliance              │
│ □ ESLint + Stylelint: 0 governance violations             │
│ □ Figma design matches code exactly                       │
│ □ Visual regression test: approved by design lead         │
│ □ Performance: Lighthouse score ≥ 95                      │
│ □ Code review: Approved by 2 architects                   │
│ □ QA: Tested on 1280px, 1920px, mobile viewports          │
└────────────────────────────────────────────────────────────┘
```

---

## PART 6: IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Days 1-2)

**Objective:** Establish governance rules & tooling

1. **Update tailwind.config.ts**
   - Disable arbitrary sizes: `fontSize: false`
   - Disable arbitrary spacing: `spacing: false`
   - Remove font-black (weight 900)
   - Add predefined utilities for type scales

2. **Install linting rules**
   ```bash
   npm install --save-dev @typescript-eslint/eslint-plugin
   npm install --save-dev stylelint stylelint-config-standard
   ```

3. **Create .eslintrc.json with governance rules**
   - Ban font-black
   - Ban arbitrary font-size
   - Ban arbitrary padding/margin
   - Ban UPPERCASE + tracking
   - Ban arbitrary opacity

4. **Update DESIGN_GOVERNANCE.md** (already done ✓)

5. **Setup CI checks** (GitHub Actions or similar)
   - Run ESLint on every PR
   - Run Stylelint on every PR
   - Fail if governance rules violated

---

### Phase 2: Sidebar Refinement (Days 2-3)

**Objective:** Reduce width, improve typography, standardize spacing

1. **Width reduction**
   - Change: `w-64` (256px) → `w-[200px]` (200px)
   - Verify: No layout breakage on 1280px+ screens
   - Test: Mobile sidebar collapse still works

2. **Typography cleanup**
   - All labels: Use `.type-label-small` (12px, 500 weight)
   - Section headers: `.type-subtitle` (18px, 600 weight)
   - Remove tracking-wider, font-black
   - Result: Calm, authoritative sidebar appearance

3. **Spacing standardization**
   - Sidebar padding: `p-4` (16px) baseline
   - Menu item padding: `px-3 py-2` (12px × 8px)
   - Menu height: `h-9` (36px) compact
   - Section gap: `gap-4` (16px) grouped
   - Icon size: `w-4 h-4` (16px)

4. **Commit:** "Refactor sidebar to governance standards"

---

### Phase 3: Dashboard Typography (Days 3-4)

**Objective:** Remove ALL CAPS, enforce type scales

1. **QueueCard titles**
   - Current: `title="PROJECT PORTFOLIO"` (ALL CAPS)
   - Change to: `title="Project Portfolio"` (Title Case)
   - Use: `.type-subtitle` (18px, 600 weight)

2. **Card labels**
   - Current: Mixed sizing (10px, 11px, 12px)
   - Standardize to: `.type-label-small` (12px, 500 weight)

3. **Dashboard KPI labels**
   - Current: Font-black + aggressive styling
   - Change to: Font 600 + calm appearance
   - Update MetricTile.tsx (already partially done ✓)

4. **Global replacements**
   - Find/replace: `font-black` → remove, use `font-bold` (700)
   - Find/replace: `tracking-wider` → remove or `tracking-wide` (0.05em)
   - Find/replace: `uppercase` → remove entirely

5. **Commit:** "Enforce typography governance across dashboard"

---

### Phase 4: Opacity Token Migration (Days 4-5)

**Objective:** Replace custom white/[0.XX] with predefined glass tokens

1. **Define opacity tokens in tailwind.config.ts**
   ```typescript
   backgroundColor: {
     'glass-subtle': 'rgba(255, 255, 255, 0.01)',
     'glass': 'rgba(255, 255, 255, 0.03)',
     'glass-elevated': 'rgba(255, 255, 255, 0.05)',
   },
   borderColor: {
     'glass': 'rgba(255, 255, 255, 0.06)',
     'glass-strong': 'rgba(255, 255, 255, 0.1)',
   }
   ```

2. **Migrate components (batch replacements)**
   - `bg-white/[0.01]` → `bg-glass-subtle`
   - `bg-white/[0.03]` → `bg-glass`
   - `border-white/[0.03]` → `border-glass`
   - `hover:border-white/[0.08]` → `hover:border-glass-strong`

3. **Remove hardcoded rgba() in styles**
   - Find/replace: `rgba(255,255,255,` → use tokens
   - Find/replace: `rgba(16,185,129,` → use `var(--color-success)`

4. **Commit:** "Migrate opacity to glass token system"

---

### Phase 5: Spacing Governance (Days 5-6)

**Objective:** Enforce 8px grid, remove arbitrary padding/margins

1. **Fix dashboard grid gaps**
   - Change: `gap-6` then `gap-8` then `pb-20` → consistent `gap-6`, `pb-12`
   - Rationale: Visual rhythm, predictable spacing

2. **Standardize card padding**
   - All cards: `p-6` baseline (24px)
   - Compact cards: `p-4` (16px) only if explicitly noted
   - Never: `p-5`, `px-7`, `py-9`, `p-[17px]`

3. **Fix form spacing**
   - Input padding: `px-3 py-2` (12px × 8px)
   - Label spacing: `mb-2` (8px) above input
   - Form grid: `gap-4` between fields

4. **Commit:** "Enforce 8px grid system across all layouts"

---

### Phase 6: Border Radius Unification (Days 6)

**Objective:** Use 4-value radius system only

1. **Standardize across codebase**
   - Buttons/inputs: `rounded-lg` (8px)
   - Cards: `rounded-xl` (12px)
   - Large containers: `rounded-2xl` (16px)
   - Pills: `rounded-full`
   - Never: `rounded-3xl`, custom `border-radius`

2. **Remove outliers**
   - Find: `rounded-2xl` on small elements
   - Find: `border-radius: 40px` (custom)
   - Replace with appropriate scale value

3. **Commit:** "Standardize border radius to 4-tier system"

---

### Phase 7: Final Verification (Days 6-7)

**Objective:** Audit compliance, test thoroughly

1. **Run ESLint/Stylelint**
   - 0 violations required
   - Flag any remaining governance issues

2. **Visual regression testing**
   - Compare before/after screenshots
   - Approve by design lead

3. **Accessibility audit**
   - Lighthouse score ≥ 95
   - Contrast ratios ≥ 4.5:1
   - Keyboard navigation works

4. **Cross-browser testing**
   - 1280px, 1920px, mobile viewports
   - Chrome, Firefox, Safari

5. **QA sign-off**
   - No functional regressions
   - All interactive elements work
   - Forms validate correctly

6. **Deploy to production**

---

## PART 7: CI/CD INTEGRATION

### GitHub Actions Workflow

```yaml
name: Design Governance Check
on: [pull_request, push]

jobs:
  design-governance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: ESLint Governance Rules
        run: npm run lint:governance
        # Fails if any governance rules violated

      - name: Stylelint Opacity Tokens
        run: npm run lint:styles
        # Fails if hardcoded opacity found

      - name: Check Font Weights
        run: |
          grep -r "font-black" src/ && exit 1 || echo "✓ No font-black found"
          grep -r "tracking-widest" src/ && exit 1 || echo "✓ No tracking-widest found"
          grep -r "uppercase" src/ && exit 1 || echo "✓ No uppercase found"

      - name: TypeScript Check
        run: npm run type-check
```

---

## PART 8: CRITICAL SUCCESS FACTORS

### What Success Looks Like

```
BEFORE (Current State 6.5/10):
├─ Sidebar: 240px, font-black logo, arbitrary font sizes
├─ Dashboard: ALL CAPS headers, custom opacity values
├─ Typography: Scattered weights (400→900), no hierarchy
├─ Spacing: Unprincipled (15px, 23px, arbitrary gaps)
├─ Result: "Functional but dissonant" - power users notice friction

AFTER (Target State 9.5/10):
├─ Sidebar: 200px, calm typography, 16px padding, h-9 items
├─ Dashboard: Title Case headers, predefined glass tokens
├─ Typography: 4 weight tier (400/500/600/700), clear hierarchy
├─ Spacing: 8px grid (4/8/12/16/24/32px only)
├─ Result: "Enterprise-inevitable" - executives feel credibility
```

### Measurement Criteria

| Metric | Target | How to Measure |
|--------|--------|-----------------|
| ESLint Violations | 0 | `npm run lint` output |
| Arbitrary Font Sizes | 0 | Grep for `text-[` pattern |
| Font-Black Usage | 0 | Grep for `font-black` |
| Custom Opacity | 0 | Grep for `white/[` or `rgba(` |
| Lighthouse Score | ≥ 95 | Chrome DevTools audit |
| WCAG Compliance | AA | Axe DevTools scan |
| Design System Coverage | 100% | Manual checklist |

---

## CONCLUSION

The MCE Command Center is a **solid enterprise platform** with thoughtful architecture. Its design governance deficit is **fixable through systematic enforcement**, not radical redesign.

**The goal is not to look modern.**
**The goal is to feel inevitable—calm, authoritative, and cognitively efficient.**

This governance framework enables that transformation through:
1. **Predefined constraints** (no arbitrary sizes, weights, spacing)
2. **Tooling enforcement** (ESLint, Stylelint, CI checks)
3. **Design system authority** (single source of truth in CSS variables)
4. **Human accountability** (PR review checklist, design sign-off)

**Timeline:** 6-7 days for complete implementation + CI setup
**Effort:** ~40 hours of systematic refactoring
**Result:** Production-ready 2026 enterprise standard

---

**This is non-negotiable. Every deviation requires documented architectural approval.**

**Prepared by:** Systems Governance
**Approved by:** Design Leadership (pending review)
**Status:** Ready for Implementation
