# Light Mode Dashboard Standardization (Whole-App) + Theme Toggle

## TL;DR

> **Quick Summary**: Standardize the ERP’s visual language across *all routes* by making **Light Mode** match the provided dashboard-style screenshot (typography/spacing/surfaces), while **keeping Dark Mode unchanged**, and adding a **top-right theme toggle**.
>
> **Deliverables**:
> - Global theme system using existing token mechanism (`[data-theme="light"]` overrides in `styles/tokens-2026.css`)
> - Header toggle (top-right) to switch themes (persisted)
> - Removal of remaining hardcoded colors (esp. in `app/layout.tsx`) in favor of tokens
> - Playwright screenshot-based verification for a representative set of routes in Light + Dark
>
> **Estimated Effort**: Large
> **Parallel Execution**: YES (waves, but cap concurrency to avoid queue refusal)
> **Critical Path**: Theme mechanism → Toggle UI → Global token compliance → Playwright visual verification

---

## Context

### Original Request
- “make my erp system consistence right now each page looks like form a different dashboard”
- Use provided screenshot as the **Light Mode** target.
- “keep the dark mode as is and add a toggle”
- Toggle location: “toggle top right”
- Scope: “entire app make it adapt to the dashboard”

### Interview Summary
- Primary inconsistency pain: typography (font sizes, etc.) + general UI consistency.
- Executor sometimes refuses multi-task prompts; plan must be **micro-task friendly** (one file/one change/one verification per task where possible).
- Verification preference: **Playwright screenshot-based checks**.

### Screenshot Interpretation (Light Mode target)
From screenshot (2026-02-03 095548):
- Soft off-white base background; elevated cards/surfaces with a teal-tinted accent feel
- Clear type hierarchy; consistent spacing/padding; rounded corners
- Darker header/sidebar surfaces contrasted against light content surfaces
- Semantic status colors (critical/warning/success/info)

### Metis Review (gaps addressed in plan)
- Explicitly define toggle persistence + default theme behavior
- Guardrails to ensure Dark Mode isn’t changed
- Avoid scope creep (no extra themes; no layout/nav redesign unless necessary)
- Acceptance criteria must be automated (Playwright + build/lint)

---

## Work Objectives

### Core Objective
Make the UI visually consistent across the entire app by implementing screenshot-matching **Light Mode**, preserving existing **Dark Mode**, and providing a global theme toggle.

### Concrete Deliverables
- A reliable theme mechanism based on `[data-theme]` and token overrides (already present in `styles/tokens-2026.css`).
- A top-right theme toggle in the global header area.
- Eliminate remaining hardcoded surface/text colors so all pages respond to tokens.
- Playwright visual evidence (screenshots) for a defined set of routes in both themes.

### Definition of Done
- [ ] Theme toggle changes theme without reload and persists after refresh.
- [ ] No Dark Mode regressions (screenshots in dark match current baseline approach; no token removals).
- [ ] `npm run build` succeeds.
- [ ] `npm run lint` (tsc --noEmit) succeeds.
- [ ] Playwright runs complete and produce screenshots in `.sisyphus/evidence/` for chosen routes in both themes.

### Must Have
- Light Mode matches the screenshot’s overall surface/typography feel (implemented via tokens, not hardcoded colors).
- Dark Mode stays functionally and stylistically the same.
- Toggle is top-right and accessible.

### Must NOT Have (Guardrails)
- No hardcoded hex colors added anywhere (use tokens / CSS variables).
- No redesign of IA/navigation structure as part of this task (visual-only standardization).
- No third theme beyond Light/Dark.
- No manual verification steps in acceptance criteria.

---

## Verification Strategy (Automated)

### Test/QA Decision
- **Test infrastructure exists**: YES (`@playwright/test` present)
- **User wants tests**: Automated visual verification via Playwright screenshots
- **Framework**: Playwright

### Automated Verification Requirements
Each relevant TODO includes:
- A deterministic command to run (`npm run build`, `npm run lint`, Playwright command)
- Screenshot evidence saved to `.sisyphus/evidence/`

**Evidence convention**:
- `.sisyphus/evidence/light/<route-slug>.png`
- `.sisyphus/evidence/dark/<route-slug>.png`

**Route set policy** (to avoid infinite scope):
- Visual verification uses a representative set (dashboard + 4–7 key screens), not literally every route.

---

## Execution Strategy

### Concurrency Guardrail (to avoid queue refusal)
- Run **at most 1 executor task at a time** unless explicitly marked safe.
- Use parallel waves only for *research/discovery* (explore) tasks; implementation tasks are micro-scoped.

---

## TODOs

> IMPORTANT: Many executors in this environment refuse multi-task prompts. Each TODO is intentionally **micro-scoped**: one file-focused change + one verification.

### Wave 1 — Establish theme mechanism + remove global hardcoding (critical path)

- [ ] 1. Audit and document current theme mechanism + where header is rendered

  **What to do**:
  - Identify where `[data-theme]` is set today (likely `app/providers` or a theme provider).
  - Identify the global header component / layout shell used across routes.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: repo exploration + light analysis.
  - **Skills**: none required

  **Parallelization**:
  - Can Run In Parallel: YES (with Task 2)

  **References**:
  - `app/layout.tsx` - Root html/body element and current hardcoded colors.
  - `styles/tokens-2026.css` - Existing `[data-theme="light"]` override section indicates intended theme mechanism.

  **Acceptance Criteria (automated)**:
  - [ ] Produce a short note in plan execution log: where theme attribute is set and which component owns the header.

- [ ] 2. Remove hardcoded background/text colors in `app/layout.tsx` and replace with token-driven styling

  **What to do**:
  - Replace `style={{ backgroundColor: '#050505' }}` and body inline styles with CSS classes / token usage so both themes can apply.
  - Ensure default remains visually identical to current Dark Mode.

  **Must NOT do**:
  - Don’t change token values for dark mode.

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: single file, localized change.
  - **Skills**: none

  **Parallelization**:
  - Can Run In Parallel: NO (safe to do alone)

  **References**:
  - `app/layout.tsx:41-50` - Inline hex styles causing theme to be locked.
  - `styles/tokens-2026.css:31-76` - `--bg-base`, `--text-primary` etc.

  **Acceptance Criteria (automated)**:
  - [ ] `npm run build` succeeds.
  - [ ] `npm run lint` succeeds.

- [ ] 3. Define default theme + persistence strategy

  **What to do**:
  - Select and implement a single persistence method (cookie or localStorage) so toggle survives refresh.
  - Default theme: **Dark** (safe assumption to preserve current behavior) unless code indicates otherwise.

  **Defaults Applied**:
  - Default = Dark mode to match “keep dark mode as is”.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: may touch providers + root layout wiring.
  - **Skills**: none

  **References**:
  - `styles/tokens-2026.css:340-394` - `[data-theme="light"]` is already the intended override mechanism.
  - `app/layout.tsx` + `app/providers` (needs discovery) - where to place theme attribute.

  **Acceptance Criteria (automated)**:
  - [ ] Automated check: start dev server and confirm theme selection persists across reload in Playwright script (see Task 7).

### Wave 2 — Theme toggle UI (top-right)

- [ ] 4. Implement top-right theme toggle in the global header

  **What to do**:
  - Add a toggle control (icon button or switch) in the top-right of the header.
  - Must be keyboard navigable + have an accessible label.
  - Must reflect current theme state.

  **Must NOT do**:
  - Don’t add a settings page flow just for this.

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI placement + styling within design system constraints.
  - **Skills**: `frontend-ui-ux`

  **References**:
  - Header component path discovered in Task 1.
  - `styles/tokens-2026.css` utilities for typography/spacing and tokenized colors.

  **Acceptance Criteria (automated)**:
  - [ ] `npm run build` succeeds.
  - [ ] Playwright script can click the toggle and observe theme attribute change (Task 7).

### Wave 3 — Light mode token tuning to match screenshot (without harming dark)

- [ ] 5. Tune Light Mode token overrides in `styles/tokens-2026.css` to better match screenshot target

  **What to do**:
  - Adjust only the `[data-theme="light"]` section to shift:
    - base background (off-white)
    - surface/layer backgrounds
    - text colors
    - brand accent teal
  - Keep semantic status tokens meaningful.

  **Must NOT do**:
  - Do not change `:root` dark values.

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: design/token tuning.
  - **Skills**: `frontend-ui-ux`

  **References**:
  - `styles/tokens-2026.css:340-394` - Light mode override block.

  **Acceptance Criteria (automated)**:
  - [ ] `npm run build` succeeds.
  - [ ] `npm run lint` succeeds.

### Wave 4 — Visual verification infrastructure

- [ ] 6. Add Playwright “theme screenshot” test that captures key routes in Light and Dark

  **What to do**:
  - Create Playwright test(s) that:
    - run the app
    - visit a fixed list of routes
    - set theme to light and capture screenshots
    - set theme to dark and capture screenshots
  - Store screenshots in `.sisyphus/evidence/`.

  **Route shortlist (default)**:
  - `/` (or dashboard landing)
  - `/dashboard` (if exists)
  - plus 3–5 other primary ERP screens discovered by route scan

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: test wiring can touch config and route assumptions.
  - **Skills**: `playwright`

  **References**:
  - `package.json` - Playwright dependency exists.
  - App start scripts: `npm run dev`.

  **Acceptance Criteria (automated)**:
  - [ ] Playwright test command executes successfully.
  - [ ] Screenshots exist under `.sisyphus/evidence/light/` and `.sisyphus/evidence/dark/` for each route.

### Wave 5 — App-wide consistency passes (micro-tasks)

- [ ] 7. Run style audit to identify remaining hardcoded colors and prioritize fixes

  **What to do**:
  - Use existing script to find violations.
  - Produce a prioritized list of the top offending files/components.

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: none

  **References**:
  - `package.json:scripts.audit:styles` - `npx tsx scripts/audit-styles.ts`.

  **Acceptance Criteria (automated)**:
  - [ ] `npm run audit:styles` runs and outputs findings.
  - [ ] Top 10 offenders summarized in execution notes.

- [ ] 8. Perform iterative micro-task fixes: replace hardcoded styles with tokens on highest-impact components/pages

  **What to do**:
  - For each offender file: one file, one change set (e.g., replace hardcoded background/text values with token-based classes/variables).
  - Re-run build/lint and (periodically) Playwright screenshots.

  **Guardrails**:
  - Do not change dark mode tokens.
  - No refactors beyond what’s needed for consistent visuals.

  **Recommended Agent Profile**:
  - **Category**: `quick` (per micro-fix)
  - **Skills**: none

  **References**:
  - Offender list produced by Task 7.

  **Acceptance Criteria (automated)**:
  - [ ] After each micro-fix: `npm run build` and `npm run lint` succeed.
  - [ ] After each batch of ~5 micro-fixes: Playwright screenshot test passes.

---

## Commit Strategy
- Prefer small commits aligned with micro-tasks.
- Commit after:
  - layout hardcode removal
  - theme persistence
  - toggle UI
  - Playwright test addition
  - each grouped batch of offender fixes (5–10 files)

---

## Success Criteria

### Verification Commands
```bash
npm run lint
npm run build
npm run audit:styles
# plus Playwright test command used in Task 6
```

### Final Checklist
- [ ] Light mode visually matches screenshot’s intent across representative routes.
- [ ] Dark mode appears unchanged (verified via dark screenshots).
- [ ] Toggle exists top-right, accessible, persisted.
- [ ] No new hardcoded hex values introduced.
