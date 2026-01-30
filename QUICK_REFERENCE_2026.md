# MCE 2026 Design System - Quick Reference Card

**Print this. Keep it visible. Use it every day.**

---

## Typography Scale (Font Sizes)

```
11px   → text-xs   (captions)
12px   → text-sm   (labels)
13px   → text-base (body text, data) ← most common
14px   → text-md   (subheadings)
16px   → text-lg   (section headings)
18px   → text-xl   (major sections)
20px   → text-2xl  (page titles)
28px   → text-3xl  (large titles)
32px   → text-4xl  (hero/rare)
```

**Rule:** Never use arbitrary sizes like `text-[13px]` or `text-[9px]`

---

## Font Weights (Only 4)

```
400 → font-normal    (body text)
500 → font-medium    (labels, secondary)
600 → font-semibold  (subheadings)
700 → font-bold      (titles, headlines)
```

**Rule:** Never use 800 or 900. Never use `font-black`.

---

## Text Case

```
✅ Sentence case:     "Total revenue"
✅ Sentence case:     "Projects by location"
✅ Proper noun:       "Morgan Corp"

❌ ALL CAPS:          "TOTAL REVENUE" (except status)
❌ Title Case:        "Total Revenue"
❌ camelCase:         "totalRevenue"

EXCEPTION: Status labels only
CRITICAL, ACTIVE, AUDIT, WARNING
```

---

## Colors (Semantic Meaning)

```
--color-critical = #be185d   → Red (ERROR only)
--color-warning = #b45309    → Amber (NEEDS ATTENTION)
--color-success = #059669    → Green (HEALTHY)
--color-info = #2563eb       → Blue (INFO/IN-PROGRESS)
--color-neutral = #71717a    → Gray (SECONDARY)
```

**Usage:**
- Red text = critical/error
- Amber text = warning
- Green text = success/healthy
- Blue text = info/link
- Gray text = secondary/disabled

**Rule:** Color has meaning. Violating meaning breaks trust.

---

## Spacing Scale (4px Base)

```
4px   → space-1
8px   → space-2
12px  → space-3
16px  → space-4  (most common)
20px  → space-5
24px  → space-6  (section spacing)
32px  → space-8  (container padding)
40px  → space-10 (extreme spacing)
```

**Rules:**
- Never `space-3.5`, `space-7`, `gap-3.5`
- Vertical spacing between rows: minimum `space-4`
- Section padding: `space-6` or `space-8`
- Grid gaps: `space-6` (normal), `space-4` (dense)

---

## Border Radius (Only 3)

```
6px  → rounded-sm   (inputs)
8px  → rounded-md   (buttons)
12px → rounded-lg   (cards, panels)
```

**Rule:** Never use `rounded-2xl` (16px) or larger.

---

## Transitions (Only 4)

```
150ms → transition-fast      (hover, focus)
200ms → transition-standard  (state change) ← default
300ms → transition-moderate  (visibility)
400ms → transition-smooth    (modals, navigation)
```

**Rule:** Never use `duration-500`, `duration-1000`, etc.

---

## Table Styling

```
Header Row:
┌────────────────────────────┐
│ bg-white/[0.02]            │
│ border-b border-zinc-700   │
│ py-4 (16px)                │
│ font-semibold, text-sm     │
└────────────────────────────┘

Data Row:
┌────────────────────────────┐
│ border-b border-zinc-700   │
│ py-4 (16px)                │
│ hover:bg-white/[0.02]      │
│ text-base (13px)           │
└────────────────────────────┘

Rules:
✅ Border BOTTOM only (not full box)
✅ Monospace numbers, right-aligned
✅ Semantic status colors
✅ Minimum row height: 56px (24px padding)
```

---

## Component Primitives (Use These)

```
<Box>           ← spacing, layout container
<Text>          ← typography, semantic color
<Button>        ← actions
<Card>          ← containers
<Stack>         ← vertical/horizontal layouts
<Flex>          ← alignment (items-center, justify-between)
<Grid>          ← grid layouts
<Input>         ← form controls
<DataTable>     ← tables (never custom HTML)
```

**Rule:** No raw `<div>` with arbitrary `className`.

---

## Critical "Do Not" List

❌ **Hardcoded colors:**
```tsx
<div className="text-red-500">  ← WRONG
<div className="text-critical"> ← RIGHT
```

❌ **Arbitrary font sizes:**
```tsx
<p className="text-[13px]">     ← WRONG
<p className="text-base">       ← RIGHT
```

❌ **Arbitrary spacing:**
```tsx
<div className="p-7 gap-3.5">   ← WRONG
<div className="p-6 gap-4">     ← RIGHT
```

❌ **ALL CAPS labels:**
```tsx
<label>TOTAL REVENUE</label>    ← WRONG
<label>Total revenue</label>    ← RIGHT
```

❌ **Custom transitions:**
```tsx
<div className="transition-all duration-500">  ← WRONG
<div className="transition-standard">          ← RIGHT
```

---

## Sidebar Quick Reference

```
Sidebar Width:        180px (collapsed: 64px)
Active State:         left border-l-2 border-blue-500 + bg-white/[0.08]
Item Padding:         px-3 py-2.5
Label Size:           text-sm, font-medium
Icon Size:            18px
Section Header:       text-xs font-semibold text-zinc-600 uppercase
Gap Between Items:    space-1 (4px)
```

---

## Navigation Active State Pattern

```tsx
className={`
  flex items-center gap-3 px-3 py-2.5 rounded-md
  transition-colors
  ${isActive
    ? 'bg-white/[0.08] text-white border-l-2 border-blue-500'
    : 'text-zinc-400 hover:text-zinc-300 border-l-2 border-transparent'
  }
`}
```

---

## Before Starting Any New Component

✅ **Checklist:**
- [ ] Uses only predefined font sizes (no arbitrary text-[Xpx])
- [ ] Uses semantic colors (--color-critical, not #ff5500)
- [ ] Uses spacing from 4px scale (p-4, p-6, gap-4)
- [ ] Font weights are 400, 500, 600, or 700 only
- [ ] Transitions are one of 4 standard durations
- [ ] Uses primitives (Box, Text, Button, Card, not raw <div>)
- [ ] TypeScript types on all props
- [ ] JSDoc with @example
- [ ] Passes 2026 readiness checklist

---

## Common Mistakes & Fixes

| Mistake | Fix |
|---------|-----|
| `text-[13px]` | Use `text-base` |
| `p-7` | Use `p-6` or `p-8` |
| `gap-3.5` | Use `gap-2`, `gap-3`, `gap-4` |
| `text-red-500` | Use `text-critical` |
| `duration-500` | Use `transition-standard` |
| `rounded-2xl` | Use `rounded-lg` |
| `TOTAL REVENUE` | Use `Total revenue` |
| `<div>` with className | Use `<Box>` or `<Card>` |
| Custom border colors | Use `border-subtle` or `border-strong` |
| `#000000` background | Use `bg-base` (#0f172a) |

---

## Token Locations

```
All tokens are in:  styles/tokens-2026.css

Key tokens:
- Colors:      --color-critical, --color-success, etc.
- Fonts:       --font-size-base, --font-weight-medium, etc.
- Spacing:     --space-4, --space-6, etc.
- Transitions: --transition-fast, --transition-standard, etc.
- Border:      --radius-sm, --radius-md, --radius-lg
```

---

## When in Doubt

1. **Check tokens:** styles/tokens-2026.css
2. **Check rules:** CLAUDE.md (governance section)
3. **Check reference:** components/Sidebar-2026.tsx
4. **Check spec:** ENTERPRISE_DESIGN_SYSTEM_2026.md
5. **Run checklist:** 2026 readiness checklist

---

## The Golden Rule

**Every design decision must be explainable, auditable, and governed.**

If you can't explain why you chose a specific color, size, or spacing value, it's not governed—it's arbitrary.

Use tokens. Follow rules. Build systems that last.

---

**Print this. Reference daily. Question decisions that violate it.**
