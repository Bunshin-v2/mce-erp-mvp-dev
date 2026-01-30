# MCE Command Center 2026 - Enterprise Design System & Governance

**Version:** 2.0
**Status:** Architecture Ready
**Scope:** Foundation for mission-critical ERP
**Authority:** Principal Systems Architect
**Last Updated:** 2026-01-29

---

## EXECUTIVE SUMMARY

This document establishes the non-negotiable design and technical governance rules for MCE Command Center. The goal is **not** to look modern, but to feel **inevitable, calm, and authoritative**—a system that reduces cognitive load and remains credible for a decade.

**Current State (Pre-2026):** Sub-optimal patterns inconsistent with enterprise standards
**Target State (2026):** Exceeds SAP S/4HANA, Oracle Fusion, ServiceNow, Palantir in clarity and governance

---

## PART 1: CRITIQUE OF CURRENT DESIGN PATTERNS

### Critical Issues (Must Fix Immediately)

#### 1. **Typography Chaos**
- ❌ Mixed ALL CAPS, sentence case, and Title Case without rules
- ❌ Aggressive font weights (font-black, font-bold on labels)
- ❌ Inconsistent heading hierarchy across pages
- ❌ Tiny unreadable fonts (text-[9px], text-[10px]) in tables and reports
- ❌ No distinction between interactive and informational text

**2026 Standard:** Headings use sentence case. Labels are medium weight. Body text is readable (minimum 13px on dark backgrounds).

#### 2. **Layout Density & Information Overload**
- ❌ Cramped spacing (space-y-1.5 = 6px) between data rows
- ❌ Full-width borders on every element (visual noise)
- ❌ No progressive disclosure (all information shown at once)
- ❌ Sidebar is 240px wide when 180px would suffice
- ❌ Missing visual breathing room in data-dense pages

**2026 Standard:** 16px minimum vertical spacing between sections. Progressive disclosure for secondary information. Sidebar optimized for density.

#### 3. **Color & Visual Aggression**
- ❌ Hardcoded colors throughout (no token system)
- ❌ Pure black backgrounds (lacks sophistication)
- ❌ Overuse of glass-morphism opacity effects (blurry, unprofessional)
- ❌ Inconsistent critical state colors (rose-500 vs rose-700)
- ❌ No color strategy for hierarchy or wayfinding

**2026 Standard:** Charcoal backgrounds (#0f172a). Strict color tokens. Reserved color meaning (red=critical, amber=warning, green=healthy).

#### 4. **Navigation & Wayfinding**
- ❌ Sidebar lacks clear active state indication
- ❌ No breadcrumb or page context
- ❌ Deep page hierarchies without navigation aids
- ❌ Inconsistent hover states across interactive elements

**2026 Standard:** Clear active state. Breadcrumbs on deep pages. Consistent hover treatment.

#### 5. **Data Presentation**
- ❌ Tables lack proper visual hierarchy
- ❌ Status badges inconsistent styling
- ❌ No clear scanning patterns (users must read every row)
- ❌ Numbers not right-aligned for comparison
- ❌ Report headers look like kindergarten project (as noted by stakeholder)

**2026 Standard:** Monospace numbers. Right-aligned currency. Clear status patterns. Professional report design.

#### 6. **Motion & Animation**
- ❌ Motion used excessively (every button, every hover)
- ❌ No clear purpose for animations (feels slow)
- ❌ Loading states lack clear feedback
- ❌ Transitions not standardized (150ms vs 300ms vs 500ms)

**2026 Standard:** Motion only for state change or navigation. Consistent 200ms standard transition. Loading states feel fast (shimmer effect).

---

## PART 2: 2026 ENTERPRISE DESIGN PRINCIPLES

### Non-Negotiable Rules

#### **TYPOGRAPHY HIERARCHY**

| Element | Font | Size | Weight | Spacing | Case |
|---------|------|------|--------|---------|------|
| Page Title | Inter | 32px | 700 | -0.01em | Sentence case |
| Section Header | Inter | 18px | 600 | -0.01em | Sentence case |
| Subheader | Inter | 14px | 600 | -0.01em | Sentence case |
| Body/Data | Inter | 13px | 400 | normal | Sentence case |
| Label | Inter | 12px | 500 | 0.02em | Sentence case |
| Caption | Inter | 11px | 400 | 0.02em | Sentence case |
| Monospace (Numbers) | JetBrains Mono | 13px | 500 | -0.02em | Numeric |

**Rules:**
- ✅ ALL CAPS forbidden except: status labels (CRITICAL, ACTIVE), technical identifiers
- ✅ Minimum font size: 12px (labels), 13px (body) on dark backgrounds
- ✅ Font weights: 400 (body), 500 (labels), 600 (subheaders), 700 (titles). Never use 800 or 900.
- ✅ Numbers always use monospace font for easy scanning and alignment
- ✅ Sentence case default. Title case only for proper nouns and brand names.

#### **LAYOUT DENSITY & SPACING**

**Spacing Scale (4px base unit):**
```
--space-0.5 = 2px   (micro spacing, rarely used)
--space-1 = 4px     (tight)
--space-2 = 8px     (comfortable)
--space-3 = 12px    (generous)
--space-4 = 16px    (section spacing)
--space-5 = 20px    (major sections)
--space-6 = 24px    (page-level sections)
--space-8 = 32px    (container padding)
--space-10 = 40px   (extreme spacing, use sparingly)
```

**Rules:**
- ✅ Minimum vertical spacing between data rows: 16px (space-4)
- ✅ Minimum horizontal padding in cards/containers: 24px (space-6)
- ✅ Lists and tables use 16px row height minimum
- ✅ Section separators: 24px top/bottom margin
- ✅ Sidebar padding: 16px left/right, 12px top/bottom
- ✅ Grid gaps: 24px for normal layouts, 16px for dense data

**Information Layering:**
- Layer 1 (Primary): Headline + immediate action (top of viewport)
- Layer 2 (Secondary): Essential metrics + primary data table
- Layer 3 (Tertiary): Secondary details, fold-able sections
- Layer 4 (Quaternary): Advanced filters, historical data, audit trails
- ✅ Never show all 4 layers at once without scrolling

#### **COLOR SYSTEM**

**Background Palette:**
```
--bg-base = #0f172a        (primary background, charcoal)
--bg-surface = #1a1f35     (elevated surfaces, cards)
--bg-hover = #252d45       (hover state)
--bg-active = #2d3a52      (active/selected)
--bg-input = #0f1419       (input fields, one shade darker)
```

**Semantic Colors:**
```
--color-critical = #be185d  (deep rose, rose-700)
--color-warning = #b45309   (deep amber, amber-600)
--color-success = #059669   (emerald, emerald-600)
--color-info = #2563eb      (blue, blue-600)
--color-neutral = #71717a   (zinc-500, for secondary text)
```

**Opacity Variants:**
```
--glass-10% = rgba(255,255,255, 0.10)   (hover)
--glass-5% = rgba(255,255,255, 0.05)    (subtle background)
--glass-2% = rgba(255,255,255, 0.02)    (very subtle)
```

**Rules:**
- ✅ IMPORTANT: No hardcoded hex colors. All colors must use CSS variables.
- ✅ Background: Use --bg-* for consistency
- ✅ Status colors: Use --color-* semantic values
- ✅ Never use pure black (#000000) or pure white (#ffffff)
- ✅ Red always means "critical/error". Amber means "warning". Green means "healthy/success".
- ✅ Opacity for text contrast, not for "fading" visual importance

#### **BORDERS & DIVIDERS**

```
--border-subtle = 1px solid #333        (tables, section dividers)
--border-strong = 1px solid #52525b     (input fields, active states)
--border-radius-sm = 6px                (input fields)
--border-radius-md = 8px                (buttons, small components)
--border-radius-lg = 12px               (cards, panels)
```

**Rules:**
- ✅ Tables: Use bottom-border only (1px #333), not full box borders
- ✅ Cards: Use subtle background + 1px border-radius-lg, no drop shadow
- ✅ Buttons: No border. Use background color + hover state.
- ✅ Input fields: 1px border-strong, border-radius-sm
- ✅ Never use border-radius > 12px (looks dated)

#### **MOTION & TRANSITIONS**

```
--transition-fast = 150ms cubic-bezier(0.4, 0, 0.2, 1)      (hover, focus)
--transition-standard = 200ms cubic-bezier(0.4, 0, 0.2, 1)  (state change)
--transition-moderate = 300ms cubic-bezier(0.4, 0, 0.2, 1)  (visibility)
--transition-smooth = 400ms cubic-bezier(0.4, 0, 0.2, 1)    (panels, navigation)
```

**Rules:**
- ✅ Hover states: Use --transition-fast (150ms)
- ✅ Click feedback: Use --transition-standard (200ms)
- ✅ Loading states: Use subtle shimmer (no aggressive pulse)
- ✅ Modal/panel open: Use --transition-smooth (400ms)
- ✅ IMPORTANT: Animation should never exceed 400ms. Feels slow to users.
- ✅ Page transitions: 300ms fade or slide (Framer Motion spring physics acceptable)
- ✅ DO NOT animate on every element. Use motion sparingly for clarity.

---

## PART 3: ENTERPRISE DASHBOARD PHILOSOPHY

### Core Principle: Signal Over Volume

A 2026 enterprise dashboard **reduces cognitive load**, not increases it.

#### **The Five Laws of Executive Dashboards**

**Law 1: Hierarchy > Density**
- One headline metric per screen section (never 4 KPIs in a row without grouping)
- Secondary metrics indented or secondary color
- Tertiary metrics in expandable sections

**Law 2: Scanning Patterns**
- Users scan left-to-right, top-to-bottom (western reading pattern)
- Most critical information: top-left
- Historical/detailed information: bottom-right
- Action buttons: always top-right

**Law 3: Color Means Something**
- Red: Requires immediate action (critical)
- Amber: Requires attention soon (warning)
- Green: Healthy, no action (success)
- Gray: Informational, no action required
- Blue: In progress or system message

**Law 4: Typography as Primary Tool**
- Use size and weight, not color, to create hierarchy
- 32px title > 18px section > 14px label > 13px data
- Color accents only for semantic meaning (status)

**Law 5: Progressive Disclosure**
- Show what matters. Hide what doesn't (unless explicitly requested).
- Expandable sections for advanced filters, historical data, audit trails
- Accordion pattern for related metrics
- Modal or side panel for detail views

#### **Executive Dashboard Template (2026 Standard)**

```
┌─────────────────────────────────────────────────────────────┐
│ Breadcrumb / Page Context                                   │
├─────────────────────────────────────────────────────────────┤
│ Page Title                              [Primary Action]     │
│ Optional subtitle describing context                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  CRITICAL ALERTS (if any)                                  │
│  [Red box with icon + brief message]                       │
│                                                             │
│  PRIMARY METRICS (1-2 key KPIs)                            │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │ 32px Number      │  │ 32px Number      │               │
│  │ 12px Label       │  │ 12px Label       │               │
│  │ Trend indicator  │  │ Trend indicator  │               │
│  └──────────────────┘  └──────────────────┘               │
│                                                             │
│  SECONDARY DATA (Table or chart)                           │
│  ┌─────────────────────────────────────┐                   │
│  │ Header                              │                   │
│  ├─────────────────────────────────────┤                   │
│  │ Row 1 data                          │                   │
│  │ Row 2 data                          │                   │
│  │ [Scroll available for more]         │                   │
│  └─────────────────────────────────────┘                   │
│                                                             │
│  ACTIONS & DETAILED VIEW                                   │
│  [Expandable section or link to detail page]              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### **The Anti-Pattern (What NOT to Do)**

❌ Dashboard with 12+ KPI cards in a grid (overwhelming)
❌ All data shown at once (no progressive disclosure)
❌ Mixed font sizes and weights (visual chaos)
❌ Hardcoded colors throughout (not maintainable)
❌ Animated transitions on every element (distracting)
❌ ALL CAPS labels and aggressive styling (unprofessional)
❌ Small fonts to fit more data (illegible, reduces trust)

---

## PART 4: GOVERNANCE MODEL

### Design Token System (Single Source of Truth)

All design decisions are codified as tokens. No magic numbers. No arbitrary styling.

#### **Token Locations**

**CSS Variables (Foundation):**
```
C:\path\to\styles\tokens\
├── colors.css          (color semantic + palette)
├── typography.css      (font families, scales, weights)
├── spacing.css         (spacing scale 4px-40px)
├── border.css          (border-radius, border styles)
├── motion.css          (transitions, animations)
├── shadows.css         (elevation shadows)
└── zindex.css          (z-index layering)
```

**Tailwind Config:**
```
tailwind.config.ts
├── theme.colors        (maps to --color-* vars)
├── theme.spacing       (maps to --space-* vars)
├── theme.fontSize      (typography scale)
├── theme.fontWeight    (400, 500, 600, 700 only)
└── theme.transitionDuration (150ms, 200ms, 300ms, 400ms)
```

**Figma Design System (Visual Source of Truth):**
```
Figma File: MCE Command Center 2026
├── Colors (Semantic)
├── Typography (Styles)
├── Spacing (Components)
├── Border Styles
├── Motion & Animation
└── Component Library
```

### Primitive Components (Building Blocks)

Every UI is built from 5 foundational primitives. No custom HTML layouts.

```typescript
// 1. Box (spacing, layout container)
<Box padding="4" gap="2">...</Box>

// 2. Text (typography, semantic color)
<Text size="lg" weight="600" color="primary">Headline</Text>

// 3. Input (form controls, consistent styling)
<Input placeholder="..." type="text" />

// 4. Button (actions, consistent states)
<Button variant="primary" size="md">Action</Button>

// 5. Card (containers, elevation)
<Card padding="6">...</Card>
```

**Rule:** No `<div>` with arbitrary `className`. Use primitives.

### Layout Primitives

Spacing and layout follow the grid system exclusively.

```typescript
// Grid: Consistent 24px gutters
<Grid columns={12} gap="6">
  <GridItem colSpan={4}>...</GridItem>
  <GridItem colSpan={8}>...</GridItem>
</Grid>

// Stack: Vertical or horizontal layouts
<Stack direction="vertical" gap="4">...</Stack>
<Stack direction="horizontal" gap="2">...</Stack>

// Flex: Advanced alignment
<Flex align="center" justify="between">...</Flex>
```

### Rules That Block Regression

**Critical Rules (Must Enforce):**

1. ✅ **No Hardcoded Colors**
   - Bad: `className="text-red-500"`
   - Good: `className="text-critical"`
   - Enforcement: Linter rule blocks `text-[any hex]`

2. ✅ **No Arbitrary Font Sizes**
   - Bad: `text-[13px]` or `text-[9px]`
   - Good: `text-sm` (12px), `text-base` (13px), `text-lg` (14px)
   - Enforcement: Only predefined `text-*` sizes allowed

3. ✅ **No Arbitrary Spacing**
   - Bad: `p-7` or `gap-3.5`
   - Good: `p-6` (24px), `gap-4` (16px)
   - Enforcement: Only 4px multiples allowed

4. ✅ **No ALL CAPS (Except Status)**
   - Bad: `<label>TOTAL REVENUE</label>`
   - Good: `<label>Total revenue</label>`
   - Enforcement: Components enforce lowercase, developers manually uppercase for `ACTIVE`, `CRITICAL`

5. ✅ **No Custom Transitions**
   - Bad: `transition-all duration-500`
   - Good: `transition-standard` (200ms)
   - Enforcement: Only 4 transition durations available

6. ✅ **No Flex Without Justify/Align**
   - Bad: `flex` (unclear alignment)
   - Good: `flex items-center justify-between`
   - Enforcement: Linter rule requires both properties

7. ✅ **Tables Must Use Tokens**
   - Bad: Custom border styles, arbitrary cell padding
   - Good: Use `<DataTable>` primitive with predefined styling
   - Enforcement: No custom table HTML allowed

### Figma MCP Integration Rules

When implementing from Figma:

1. ✅ Fetch design context from Figma MCP server
2. ✅ Map all colors to CSS variable tokens
3. ✅ Map all fonts to defined typography scale
4. ✅ Use primitive components (Box, Text, Button, Card)
5. ✅ No hardcoded values ever
6. ✅ Validate against screenshot for 1:1 fidelity
7. ✅ Update Figma if design doesn't match tokens (feedback loop)

---

## PART 5: 2026 READINESS CHECKLIST

**Use this for every new screen/feature/component.**

### Typography Audit
- [ ] All text uses sentence case (not ALL CAPS except status labels)
- [ ] Smallest font size is 12px (labels) or 13px (body)
- [ ] No font weights outside 400, 500, 600, 700
- [ ] Headings follow hierarchy: 32px > 18px > 14px > 13px
- [ ] Numbers use monospace font (JetBrains Mono)
- [ ] Line height is readable (1.4-1.6 for body, 1.2 for headings)

### Color & Visual Audit
- [ ] No hardcoded hex colors (all use CSS variables)
- [ ] Red = critical/error only
- [ ] Amber = warning only
- [ ] Green = success/healthy only
- [ ] Blue = info/in-progress only
- [ ] Gray = neutral/secondary only
- [ ] Background is charcoal (#0f172a), not pure black
- [ ] Contrast ratio meets WCAG AA (4.5:1 minimum)

### Layout & Spacing Audit
- [ ] Vertical spacing between sections: minimum 24px (space-6)
- [ ] Horizontal padding in containers: minimum 24px
- [ ] Row height in tables: minimum 16px vertical padding
- [ ] Grid gap: 24px for normal, 16px for dense
- [ ] Sidebar padding: 16px left/right, 12px top/bottom
- [ ] No arbitrary spacing. All values are 4px multiples.

### Navigation & Wayfinding Audit
- [ ] Active navigation item is clearly indicated
- [ ] Breadcrumb exists on pages deeper than 1 level
- [ ] Page title matches sidebar active item
- [ ] Hover states consistent across all interactive elements
- [ ] Focus state visible for keyboard navigation

### Data Presentation Audit
- [ ] Tables have bottom-borders only (not full box borders)
- [ ] Table headers use font-semibold, 12px, muted color
- [ ] Currency values are right-aligned
- [ ] Numbers are monospace and right-aligned
- [ ] Status badges use semantic colors (not custom)
- [ ] Row height is consistent (16px+ vertical padding)

### Information Architecture Audit
- [ ] Critical information is above the fold
- [ ] Progressive disclosure: tertiary info is expandable
- [ ] No more than 1-2 primary KPIs per screen section
- [ ] Secondary metrics are grouped visually
- [ ] Actions are top-right (standard pattern)

### Motion & Animation Audit
- [ ] Transitions are standard (150ms, 200ms, 300ms, or 400ms)
- [ ] Motion has purpose (state change, navigation, feedback)
- [ ] No animation on every element (restraint)
- [ ] Loading states use shimmer or subtle pulse (not aggressive)
- [ ] Page transitions feel natural (not jarring)

### Code Quality Audit
- [ ] No `<div>` with arbitrary `className`. Uses primitives (Box, Text, Button, Card)
- [ ] No custom CSS files for styling. All Tailwind tokens.
- [ ] Component props are typed (TypeScript)
- [ ] Component has JSDoc with `@example`
- [ ] Accessibility: proper `aria-labels`, `role` attributes

### Governance Audit
- [ ] Changes have been tested against design tokens (no regressions)
- [ ] All new colors added to token system first
- [ ] All new spacing reviewed against spacing scale
- [ ] Design system documentation updated
- [ ] Code review includes design system compliance check

---

## PART 6: IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Week 1-2)
- [x] Define design tokens (colors, typography, spacing, motion)
- [x] Create Figma design system with components
- [x] Set up Tailwind config with token mappings
- [x] Create CSS variable definitions
- [ ] **TODO:** Create primitive components (Box, Text, Button, Card)
- [ ] **TODO:** Document in CLAUDE.md for MCP integration

### Phase 2: Sidebar & Navigation (Week 3)
- [ ] Redesign sidebar (180px optimized, clear active states)
- [ ] Implement breadcrumb component
- [ ] Standardize navigation patterns
- [ ] Test keyboard navigation (accessibility)

### Phase 3: Dashboard & Reports (Week 4)
- [ ] Redesign executive dashboard (apply Law of 5)
- [ ] Redesign Reports page (no kindergarten design)
- [ ] Implement KPI card primitives
- [ ] Implement data table primitive
- [ ] Add shimmer loading states

### Phase 4: Pages & Components (Week 5-6)
- [ ] Audit all pages against 2026 checklist
- [ ] Update Financial Ledger page
- [ ] Update Projects page
- [ ] Update Tenders page
- [ ] Update Risk & Liability page

### Phase 5: Validation & Enforcement (Week 7)
- [ ] Deploy linter rules (no hardcoded colors, fonts, spacing)
- [ ] Set up design system QA process
- [ ] Create runbook for future changes
- [ ] Team training on governance rules

---

## PART 7: DESIGN TOKEN DEFINITIONS

### CSS Variables Template

```css
/* ============================================================================
   MCE COMMAND CENTER 2026 - DESIGN TOKENS
   ============================================================================ */

/* COLORS: SEMANTIC */
:root {
  --color-critical: #be185d;    /* Deep rose - errors, critical alerts */
  --color-warning: #b45309;     /* Deep amber - warnings, requires attention */
  --color-success: #059669;     /* Emerald - healthy, success states */
  --color-info: #2563eb;        /* Blue - informational, in-progress */
  --color-neutral: #71717a;     /* Zinc - secondary text, disabled */

  /* COLORS: BACKGROUND */
  --bg-base: #0f172a;           /* Primary background (charcoal) */
  --bg-surface: #1a1f35;        /* Elevated surfaces (cards, panels) */
  --bg-hover: #252d45;          /* Hover state for surfaces */
  --bg-active: #2d3a52;         /* Active/selected state */
  --bg-input: #0f1419;          /* Input fields (darker variant) */

  /* COLORS: TEXT */
  --text-primary: #f5f5f7;      /* White text on dark background */
  --text-secondary: #a1a1aa;    /* Muted text (labels, captions) */
  --text-tertiary: #71717a;     /* Very muted text */
  --text-disabled: #52525b;     /* Disabled/inactive text */

  /* TYPOGRAPHY */
  --font-sans: 'Inter Variable', 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* SPACING SCALE (4px base) */
  --space-0.5: 2px;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;

  /* BORDER RADIUS */
  --radius-sm: 6px;             /* Input fields */
  --radius-md: 8px;             /* Buttons, small components */
  --radius-lg: 12px;            /* Cards, panels */

  /* BORDERS */
  --border-subtle: 1px solid #333;
  --border-strong: 1px solid #52525b;

  /* TRANSITIONS */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-standard: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-moderate: 300ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-smooth: 400ms cubic-bezier(0.4, 0, 0.2, 1);

  /* SHADOWS (Elevation) */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.15);
  --shadow-xl: 0 20px 40px rgba(0, 0, 0, 0.2);

  /* Z-INDEX LAYERING */
  --z-base: 0;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-modal: 300;
  --z-toast: 400;
}
```

---

## PART 8: GOVERNANCE ENFORCEMENT (FOR DEVS & DESIGNERS)

### ESLint Rules (Prevent Regression)

```javascript
// eslint-config-mce-design-system.js
module.exports = {
  rules: {
    // Prevent hardcoded colors
    'no-hardcoded-colors': {
      level: 'error',
      message: 'Use CSS variable color tokens from --color-* or --bg-*'
    },

    // Prevent arbitrary font sizes
    'no-arbitrary-font-sizes': {
      level: 'error',
      message: 'Use Tailwind typography scale: text-xs, text-sm, text-base, text-lg, text-xl, text-2xl'
    },

    // Prevent arbitrary spacing
    'no-arbitrary-spacing': {
      level: 'error',
      message: 'Use 4px scale: space-1 (4px), space-2 (8px), space-4 (16px), space-6 (24px), etc.'
    },

    // Enforce transitions
    'only-standard-transitions': {
      level: 'warn',
      message: 'Use --transition-fast, --transition-standard, --transition-moderate, or --transition-smooth'
    },

    // Enforce ALL CAPS only for status
    'no-arbitrary-uppercase': {
      level: 'warn',
      message: 'Use sentence case. ALL CAPS reserved for ACTIVE, CRITICAL, AUDIT only.'
    }
  }
};
```

### Design System QA Checklist (For Code Review)

```markdown
## Design System Compliance Checklist

- [ ] All colors use CSS variables (no hex values)
- [ ] All spacing uses 4px scale (4, 8, 12, 16, 20, 24, 32, 40px only)
- [ ] All fonts are 12px or larger
- [ ] Font weights are 400, 500, 600, or 700 only
- [ ] Transitions are standard duration (150, 200, 300, or 400ms)
- [ ] Text uses sentence case (not ALL CAPS)
- [ ] Numbers use monospace font
- [ ] No arbitrary HTML `<div>`. Uses primitives (Box, Text, Button, Card, Stack, Flex, Grid)
- [ ] Component has TypeScript types
- [ ] Component has JSDoc with @example
- [ ] Accessibility: proper aria-labels and role attributes
- [ ] Tested against design tokens (no visual regressions)
```

---

## PART 9: QUICK REFERENCE (What to Do Next)

### Immediate Actions (This Week)

1. **Update CLAUDE.md** with design system rules and token locations
2. **Create `/styles/tokens/` directory** with CSS variable definitions
3. **Create primitive components**: `Box.tsx`, `Text.tsx`, `Button.tsx`, `Card.tsx`, `Stack.tsx`, `Flex.tsx`, `Grid.tsx`
4. **Update Tailwind config** to map tokens to design system values
5. **Create Figma design system file** with components and styles
6. **Audit current codebase** against 2026 checklist (document findings)

### Medium Term (2-4 Weeks)

1. **Redesign sidebar** (180px optimized, clear active states)
2. **Redesign dashboard** (apply Law of 5 principles)
3. **Redesign Reports page** (professional, no kindergarten design)
4. **Update all pages** to use new typography and spacing
5. **Implement design token mapping** in all components

### Long Term (Ongoing)

1. **Maintain governance checklist** (audit every new feature)
2. **Update design tokens** as requirements evolve
3. **Train team** on design system principles
4. **Celebrate** systems that last (not chasing trends)

---

## CONCLUSION

This design system is **not** about being trendy. It's about being **authoritative, calm, and efficient**. A system that reduces cognitive load, respects the user's time, and remains credible for a decade.

Every decision is deliberate. Every color, font, and spacing value has a reason. Every rule exists to prevent visual chaos and maintain governance.

**The goal: A 2026 enterprise ERP that feels inevitable.**

---

**Document Owner:** Principal Systems Architect
**Last Review:** 2026-01-29
**Next Review:** 2026-02-29
**Version Control:** Maintained in git with design token changes tracked
