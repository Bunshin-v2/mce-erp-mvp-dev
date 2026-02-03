# Screenshot-Matched Color Palette 🎨

## Exact Colors from Design Screenshot

### Background Colors
```css
--bg-base: #f4ede8          /* Warm beige/cream - main background */
--bg-surface: #8abfc1        /* Muted teal - card backgrounds */
--bg-layer: #6eb5b7          /* Medium teal - layered elements */
--bg-hover: #9ec9ca          /* Light teal - hover states */
--bg-active: #7ab8ba         /* Active teal */
--bg-input: #ffffff          /* White - input fields */
```

### Text Colors (on teal backgrounds)
```css
--text-primary: #2d3e50      /* Dark blue-grey - main text */
--text-secondary: #5a6c7d    /* Medium grey - secondary text */
--text-tertiary: #8595a3     /* Light grey - tertiary text */
--text-disabled: #aab5be     /* Muted - disabled state */
```

### Accent Colors
```css
/* Teal System */
light:   #d4e8e9   /* Very light - subtle backgrounds */
DEFAULT: #8abfc1   /* Main teal - cards, primary accent */
dark:    #6eb5b7   /* Medium - borders, depth */
darker:  #4a9598   /* Dark - text on light backgrounds */

/* Salmon System */
light:   #f5d5d3   /* Light salmon - backgrounds */
DEFAULT: #d6635f   /* Main salmon - critical/alert items */
dark:    #b85450   /* Dark salmon - emphasis */
```

### Sidebar (Dark in Light Mode)
```css
--sidebar-bg: #3d4b56           /* Dark charcoal/slate */
--sidebar-text: #e8ebed         /* Light text */
--sidebar-text-muted: #98a2ac   /* Muted text */
--sidebar-hover: rgba(255, 255, 255, 0.07)
```

## Color Usage Guide

### Card Design
- **Background:** `#8abfc1` (muted teal)
- **Border:** Subtle rgba with `#2d3e50` at 8% opacity
- **Text on cards:** `#2d3e50` (dark blue-grey)
- **Icons on cards:** Same as text or slightly lighter

### Critical/Alert Items
- **Background (pills):** `#d6635f` (salmon)
- **Text on salmon:** `#ffffff` (white) or `#2d3e50` (dark)
- **Large values (AED amounts):** `#d6635f` bold

### Status Indicators
- **Critical:** `#d6635f` (salmon)
- **Warning:** `#ffa94d` (warm orange)  
- **Success:** `#51cf66` (green)
- **Info:** `#6eb5b7` (teal)

### Interactive Elements
- **Hover:** Lighten by 5-10% or use `#9ec9ca`
- **Active/Selected:** Use `#7ab8ba`
- **Focus rings:** `#6eb5b7` at 40% opacity

## Comparison Table

| Element | Previous | Current (Screenshot Match) |
|---------|----------|---------------------------|
| Base BG | `#f5f3f0` | `#f4ede8` (warmer) |
| Card/Surface | `#4f9a9c` | `#8abfc1` (lighter/muted) |
| Critical | `#e86a63` | `#d6635f` (more muted) |
| Text Primary | `#1a1d4d` | `#2d3e50` (blue-grey) |
| Teal (main) | `#4f9a9c` | `#8abfc1` (softer) |

## Key Design Principles

### 1. Muted Sophistication
The teal is intentionally desaturated (#8abfc1 vs bright teal) for a professional, calm appearance.

### 2. Warm Base
The beige background (#f4ede8) has warm undertones that complement the cool teal.

### 3. Readable Contrast
- Teal cards (#8abfc1) provide sufficient contrast against beige base
- Dark blue-grey text (#2d3e50) is highly readable on teal
- White text works well on salmon accents

### 4. Consistent Saturation
All colors share similar saturation levels for visual harmony:
- Teal: Muted/desaturated
- Salmon: Muted coral (not bright red)
- Base: Warm neutral (not stark white)

## Usage in Components

### MetricCard (Teal Cards)
```tsx
<div className="bg-[var(--bg-surface)] rounded-lg p-6 border border-[var(--surface-border)]">
  <h3 className="text-[var(--text-secondary)] text-sm">Active Projects</h3>
  <p className="text-[var(--text-primary)] text-4xl font-bold">38</p>
</div>
```

### Critical Alert (Salmon Pills)
```tsx
<div className="bg-[var(--color-critical)] rounded-full px-4 py-2">
  <span className="text-white text-sm font-medium">MAJALIS PHASE 3</span>
</div>
```

### Table Headers (Salmon Background)
```tsx
<thead className="bg-[var(--color-critical)] text-white">
  <tr>
    <th className="px-4 py-2 text-left font-semibold">PROJECT FOCUS</th>
  </tr>
</thead>
```

## CSS Variable Reference

All colors are available as CSS variables in both Tailwind (`bg-accent-teal`) and direct CSS (`var(--bg-surface)`):

```css
/* Tailwind Usage */
className="bg-accent-teal text-light-text-primary"

/* CSS Variable Usage */
background-color: var(--bg-surface);
color: var(--text-primary);
```

## Testing Checklist

- [x] Cards display in muted teal (#8abfc1)
- [x] Base background is warm beige (#f4ede8)
- [x] Critical items show salmon (#d6635f)
- [x] Text is readable dark blue-grey (#2d3e50)
- [x] Sidebar remains dark charcoal (#3d4b56)
- [x] Borders are subtle and don't overpower
- [x] Hover states provide clear feedback

---

**Color Extraction Method:** Visual analysis + color picker from screenshot
**Last Updated:** 2026-02-03
**Status:** Screenshot-matched ✅
