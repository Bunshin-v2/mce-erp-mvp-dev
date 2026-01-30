# MCE COMMAND CENTER - DESIGN GOVERNANCE 2026
## Enterprise-Grade ERP Design System

**Status:** PRODUCTION - Non-Negotiable Standards
**Last Updated:** 2026-01-29
**Owner:** Systems Architecture

---

## HIERARCHY OF AUTHORITY

1. **Design Tokens** (CSS Variables) - Source of truth
2. **Type Scales** (Predefined combinations)
3. **Component Specs** (Constrained implementations)
4. **Utility Classes** (Fallback only, no magic numbers)

**RULE**: No hardcoded values. All styling must trace back to a token.

---

## TYPOGRAPHY GOVERNANCE

### Font Stack (Fixed - No Alternatives)
```
Primary UI: Inter Variable
Monospace: JetBrains Mono
Heading: Inter Variable (same as UI)
```

**NO Space Grotesk, NO font-black, NO uppercase tracking**

### Type Scale (Fixed Sizes)
| Use Case | Size | Weight | Line Height | Letter Spacing | CSS Class |
|----------|------|--------|-------------|----------------|-----------|
| Page Title | 24px | 600 | 1.5 | -0.025em | `.type-title` |
| Section Header | 18px | 600 | 1.5 | normal | `.type-subtitle` |
| Card Title | 16px | 600 | 1.5 | normal | `.type-body-strong` |
| Body Text | 16px | 400 | 1.5 | normal | `.type-body` |
| Caption/Label | 14px | 400 | 1.5 | 0.025em | `.type-caption` |
| Small Label | 12px | 500 | 1.5 | normal | `.type-label-small` |
| Code/Mono | 14px | 400 | 1.5 | normal | `.type-code` |

**RULE**: Every element must use ONE of these scales. No custom sizes.

### Weight Scale (Fixed Values)
- **400**: Body text, captions
- **500**: Labels, secondary emphasis
- **600**: Headers, card titles, strong emphasis
- **700**: Major titles (h1, h2)
- **900**: FORBIDDEN - Delete everywhere

**RULE**: No font-weight outside 400, 500, 600, 700.

### Text Case (Fixed Rules)
- **Page/Section Headers**: Title Case (First Letter Capitalized)
- **Card Labels**: Sentence case
- **Status badges**: Title Case
- **Buttons**: Sentence case
- **UPPERCASE**: Forbidden except system errors (error codes, IRNs)

**RULE**: No `text-transform: uppercase`. No `tracking-widest`.

### Spacing Inside Text
```
Letter Spacing: Use only --letter-spacing-normal or --letter-spacing-tight
Line Height: Never below 1.5 (no compressed spacing)
```

---

## LAYOUT DENSITY GOVERNANCE

### Grid System (8px Base)
```
Spacing increments: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px
(1, 2, 3, 4, 6, 8, 12, 16 multiples of 8px)
```

### Card Padding (Fixed)
- Normal cards: `p-6` (24px)
- Compact cards: `p-4` (16px)
- Dense lists: `p-3` (12px)

**RULE**: No arbitrary padding values.

### Gap Between Elements (Fixed)
- Section to section: `gap-8` (32px)
- Card to card: `gap-6` (24px)
- List items: `gap-3` (12px)
- Inline elements: `gap-2` (8px)

### Border Radius (Fixed)
```
Buttons/Inputs: 8px (--radius-md)
Cards/Panels: 12px (--radius-lg)
Large containers: 16px (--radius-xl)
Pills: 9999px (--radius-full)
```

**RULE**: Only use predefined radius values. No custom border-radius.

---

## COLOR & CONTRAST GOVERNANCE

### Color Palette (Mandatory)
```
Text:
  Primary: #f5f5f7 (--color-white)
  Secondary: #86868b (--color-gray-400)
  Tertiary: #636366 (--color-gray-500)

Backgrounds:
  Base: #0a0a0a (--surface-base)
  Elevated: #1a1a1c (--surface-elevated)

Status (Never hardcoded):
  Success: #30d158 (--color-green)
  Warning: #ff9f0a (--color-orange)
  Critical: #ff453a (--color-red)
  Info: #0071e3 (--color-blue)
```

**RULE**: Use CSS variables. Never hardcode hex values.

### Glass Components (Fixed Opacity)
```
Subtle: rgba(255,255,255, 0.01)
Default: rgba(255,255,255, 0.03)
Elevated: rgba(255,255,255, 0.05)
Borders: rgba(255,255,255, 0.06)
```

**RULE**: Use glass tokens. No custom opacity values.

---

## SHADOW SYSTEM (Fixed 4-Tier)
```
Small (subtle hover):  0 2px 4px rgba(0,0,0, 0.04)
Medium (cards):        0 4px 12px rgba(0,0,0, 0.08)
Large (elevated):      0 8px 24px rgba(0,0,0, 0.12)
Extra Large (modals):  0 16px 48px rgba(0,0,0, 0.16)
```

**RULE**: Use CSS variables. Increase shadow on hover (sm → md → lg).

---

## NAVIGATION & INFORMATION ARCHITECTURE

### Progressive Disclosure Rule
**Never show all data at once. Use:**
1. Summary view (KPIs, status)
2. Detail view (drill-down tables)
3. Modal/sidebar (detailed form)

**Forbidden:** Massive tables with 20+ columns visible at once.

### Status Signaling Hierarchy
1. **Color + Icon** (traffic light system)
   - Green = On track, no action
   - Orange = Warning, monitor
   - Red = Critical, action required
2. **Typography** (weight increase for urgency)
   - Normal = Baseline
   - Semibold = Attention needed
   - Bold = Critical
3. **Position** (risks at top)
   - Critical alerts: Sticky at top
   - Warnings: In data rows
   - Info: Below fold

**Forbidden:** Multiple competing colors, neon accents, glow effects.

---

## COMPONENT CONSTRAINTS

### Buttons
- Padding: `px-4 py-2` (16px x 8px) fixed
- Font: `text-sm` (14px) semibold
- Radius: `rounded-md` (8px)
- States: default → hover (shadow increase) → active (scale 0.98)

### Forms & Inputs
- Font: `text-base` (16px) regular
- Padding: `px-3 py-2` (12px x 8px) fixed
- Border: 1px solid rgba(255,255,255, 0.06)
- Focus: 2px solid --color-blue, outline-offset 2px
- Radius: `rounded-md` (8px)

### Data Tables
- Row height: 44px minimum
- Font: `text-sm` (14px) for content
- Header: `text-xs` (12px) semibold, uppercase labels forbidden
- Padding: 12px per cell minimum
- Hover: subtle bg-white/3%, no row highlighting

### Badges/Status Indicators
- Font: `text-xs` (12px)
- Padding: `px-2 py-1` (8px x 4px)
- Border: 1px solid matching color at 50% opacity
- Radius: `rounded-md` (8px)

---

## MOTION GOVERNANCE

### Animation Rules (Restraint)
1. **Load animations**: fade-in + slide-up (300ms ease-out)
2. **Hover states**: shadow increase + 2px lift (150ms)
3. **Transitions**: color changes (300ms)
4. **Forbidden**: Bounce effects, elastic easing, slow zooms

### Easing Functions (Fixed)
```
ease-smooth: cubic-bezier(0.4, 0, 0.2, 1)
ease-out-cubic: cubic-bezier(0.215, 0.61, 0.355, 1)
```

**NO**: bounce, elastic, custom easing functions

### Duration (Fixed)
- Fast: 150ms (hover feedback)
- Normal: 300ms (standard transitions)
- Slow: 600ms (page transitions only)

---

## 2026 READINESS CHECKLIST

Every new screen/component must pass:

- [ ] **Typography**: Uses only defined type scales, no custom sizes
- [ ] **Colors**: All colors trace to CSS variables, no hex codes
- [ ] **Spacing**: Uses 8px grid increments only
- [ ] **Borders**: Uses predefined radius values
- [ ] **Shadows**: Uses 4-tier system
- [ ] **Motion**: No bounce/elastic effects, uses fixed durations
- [ ] **Status**: Uses color + icon hierarchy, no text-only status
- [ ] **Density**: Respects card padding, gap rules
- [ ] **Navigation**: Progressive disclosure, no 20-column tables
- [ ] **Accessibility**: WCAG AA contrast, keyboard nav, focus states
- [ ] **No magic numbers**: Every value must reference a token
- [ ] **Responsive**: Adjusts only at defined breakpoints
- [ ] **Audit ready**: Design decisions explainable in governance terms

---

## AUDIT FAILURE EXAMPLES

❌ **These violate governance:**
```tsx
// NO: Hardcoded color
<div style={{ color: '#FF00FF' }}>
// YES: Use token
<div className="text-green-500">

// NO: Custom font size
<h1 className="text-[27px]">
// YES: Use type scale
<h1 className="type-title">

// NO: Arbitrary padding
<div className="p-[17px]">
// YES: Use grid
<div className="p-4">

// NO: ALL CAPS with tracking
<label className="uppercase tracking-widest">
// YES: Use type scale
<label className="type-caption">

// NO: Bounce animation
animation: bounce 0.5s ease-in-out
// YES: Use system
animation: fade-in 300ms var(--ease-smooth)
```

---

## IMPLEMENTATION CHECKLIST FOR CODEBASE

- [ ] Remove all font-black (weight 900)
- [ ] Remove all Space Grotesk usage
- [ ] Remove all tracking-widest, tracking-wide
- [ ] Remove all uppercase text-transform
- [ ] Replace all custom colors with tokens
- [ ] Replace all custom sizes with type scales
- [ ] Replace all custom padding/margin with grid values
- [ ] Replace all custom border-radius with predefined values
- [ ] Add type-title, type-subtitle classes to all headers
- [ ] Add .type-caption to all labels
- [ ] Audit Executive Cockpit for data volume
- [ ] Audit Financials page for graph clarity
- [ ] Deploy after checklist 100% complete

---

**This is non-negotiable. Every deviation requires documented architectural approval.**
