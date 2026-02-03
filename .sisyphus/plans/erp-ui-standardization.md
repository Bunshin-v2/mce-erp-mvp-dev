# ERP UI Standardization + Light Mode (Final Plan)

## TL;DR

> Quick Summary: Implement token-driven Light Mode that matches the provided screenshot, add a theme toggle next to the Executive button, standardize typography to Inter, and verify via Playwright E2E. Dark Mode must remain unchanged.

**Deliverables**:
- Light-mode token overrides in `styles/tokens-2026.css`
- Theme persistence + toggle UI placed next to Executive button in `components/Header.tsx`
- Global font standardization to Inter via `app/layout.tsx` + Tailwind mapping
- Page shell enforcement via `components/layout/AppShell.tsx`
- Command Palette + Chat Assistant token fixes
- Playwright tests covering theme toggle, persistence, and visual checks

Estimated Effort: Large
Parallel Execution: YES — 3 waves
Critical Path: Tokens (Light) → Theme Provider/toggle → Header placement → Font standardization → Page shell enforcement → Command fixes → Playwright verification

---

## Context

### Original Request
- Standardize ERP UI, add Light Mode matching the screenshot, place toggle near Executive button, standardize font to Inter, leave Dark Mode unchanged.

### Interview Summary
- Scope: All ERP pages
- Font: Inter
- Theme toggle: system default + persisted override
- Testing: Playwright E2E only

### Research Findings
- Canonical tokens: `styles/tokens-2026.css`
- Tailwind config maps fonts/colors
- No theme provider exists; `app/providers.tsx` contains other providers
- Header exists at `components/Header.tsx`
- Playwright configured: `playwright.config.ts`, tests under `tests/`

### Metis Review (key points applied)
- Ask about token exceptions and confirm persistence mechanism
- Lock down scope: no extra themes, no component redesign
- Ensure Playwright tests are fully automated and include accessibility/contrast checks

---

## Work Objectives

### Core Objective
Create a token-driven Light Mode for the ERP (toggleable & persisted), standardize typography to Inter, and ensure visual consistency across all pages while preserving Dark Mode.

### Definition of Done
- [ ] Theme toggle UI next to Executive button and persisted
- [ ] On first load: follows OS preference; if user toggles, persists
- [ ] Dark Mode visuals unchanged
- [ ] All ERP views use Inter and tokenized colors
- [ ] Command Palette + Chat Assistant stable in both themes
- [ ] Playwright tests pass (including screenshots/evidence)

### Must NOT Have (Guardrails)
- Do NOT alter baseline dark mode token values in `:root`
- Do NOT introduce hardcoded hex colors except in token definitions
- Do NOT add new themes or redesign information architecture
- Do NOT require manual QA steps; all verification automated via Playwright

---

## Verification Strategy

### Test Decision
- Infrastructure exists: YES (Playwright)
- User wants tests: Playwright-only

### Standard Verification Commands
```bash
npx playwright test
npx playwright test tests/system-audit.spec.ts
```

### Evidence Requirements
- Playwright screenshots for Light + Dark on key pages saved to `.sisyphus/evidence/`

---

## Execution Strategy

### Waves

Wave 1 (Foundation — start immediately):
- Task 1: Implement lightweight ThemeController that sets `html[data-theme]`, reads/writes `mce-theme-preference` in localStorage, listens to `prefers-color-scheme`.
- Task 2: Add Light Mode token overrides in `styles/tokens-2026.css` (already added in draft but verify naming & coverage).
- Task 3: Switch base font loading to Inter in `app/layout.tsx` and update Tailwind mapping.

Wave 2 (Integration — after Wave 1):
- Task 4: Add theme toggle UI next to Executive button in `components/Header.tsx`.
- Task 5: Enforce AppShell usage across ERP pages and replace per-page font overrides.

Wave 3 (Hardening & Verification — after Wave 2):
- Task 6: Fix Command Palette tokenization and remove hardcoded dark styles.
- Task 7: Fix Chat Assistant token usage and verify error handling.
- Task 8: Extend Playwright tests: toggle persistence, screenshots, navigation crawl.

---

## TODOs (Single Plan - all tasks)

- [x] 1. Add theme state wiring (system default + persisted override) via `data-theme`
- [x] 2. Implement Light Mode token overrides in `styles/tokens-2026.css`
- [x] 3. Standardize typography to Inter across ERP (fonts + token mapping)
- [ ] 4. Add toggle UI next to the Executive button in `components/Header.tsx`
- [ ] 5. Enforce page-shell consistency and token usage across ALL ERP views
- [ ] 6. Fix Command Palette: tokenize visuals + stabilize command handling
- [ ] 7. Fix Chat Assistant: token compatibility + command stability
- [ ] 8. Playwright regression: Light/Dark toggle + persistence + basic nav crawl

Each task contains recommended agent profile, references, and fully automated acceptance criteria in the draft and supporting materials.

---

## Self-Review (Gaps Classification)

Critical (requires user input):
- Confirm whether specific semantic tokens (e.g., `--color-critical`) must be locked across themes (Metis recommended confirming). Placeholders included in the plan: [DECISION NEEDED].

Minor (auto-resolved):
- Light tokens added to `styles/tokens-2026.css` using screenshot palette. These were applied as plausible defaults.

Ambiguous (defaults applied):
- Font fallback stack: defaulted to `Inter, -apple-system, system-ui, 'Segoe UI', Roboto, 'Helvetica Neue', Arial`.

---

## Auto-Resolved & Defaults Applied
- Light tokens: added per screenshot palette (auto-resolved). See `styles/tokens-2026.css`.
- Default font fallbacks: applied to `--font-sans` in draft tasks.

## Decisions Needed
- [DECISION NEEDED] Confirm that `--color-critical` and other semantic tokens may be overridden in Light Mode, or if they must remain identical to Dark Mode.

---

## Plan saved to: `.sisyphus/plans/erp-ui-standardization.md`

**Next steps:**
1. Do you want a high-accuracy Momus review? (recommended for production-critical UI changes)
2. If not, run `/start-work` to begin execution.

