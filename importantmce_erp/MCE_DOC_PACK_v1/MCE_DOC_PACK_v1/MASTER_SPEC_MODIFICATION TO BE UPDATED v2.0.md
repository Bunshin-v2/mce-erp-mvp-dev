# MASTER_SPEC_MODIFICATION TO BE UPDATED v2.0.md
Date: 2026-01-26
Applies on top of MASTER_SPEC_v1.0

## Why v2.0
The product is near-final and requires tighter **non-breaking change control**, **UI/UX alignment (Morgan v2.0)**, and a clarified **evaluation-gate visibility policy**.

## Changes (Delta List)
### 1) Visibility Policy for Evaluation Gates (NEW, locked)
- Gates remain **internal-only** and must not be shown to end-users.
- Exception: surfaced only in **AI Confidence, Accuracy & Anti-Hallucination Report** (internal/admin artifact).

### 2) Conductor + BMAD Adapter (NEW)
- Add an execution surface for “Gemini CLI Direct-Edit” with:
  - Branch-per-module
  - Preflight inventory
  - BMAD (Draft→Critic→Patch)
  - Validation + rollback requirements
- Output format: Plan→Execute→Critique→Patch→Validate.

### 3) UX Standardization (Morgan Dark Glass 2026) (expanded)
- Shell Layout is required for authenticated pages.
- UI components must use shared tokens (colors/typography/panels).
- Global search + quick actions + notifications badge are MVP.

### 4) Reports Module (NEW)
- Add /reports with criteria selectors and export.
- Must be RLS-safe and RBAC-gated.
- Export safety: prevent CSV formula injection.

### 5) Tender Intake Wizard (expanded)
- Template→TOC generation must be idempotent.
- Evidence coverage must be measurable.
- Regeneration must not duplicate tasks or lose evidence links.

### 6) Anti-Drift Controls (expanded)
- Schema/code drift checks are mandatory in CI.
- Naming divergence must be resolved via canonical schema + adapter views.

### 7) Diagram Registry (NEW)
- Maintain a DIAGRAMS.md containing Mermaid (and optional FigJam exports).
- At minimum: Tender Intake, Reports, RAG pipeline, Notifications, RBAC/RLS.

## Implementation Notes
- Keep MASTER_SPEC ≤1000 lines. v2.0 changes should be captured as a patch overlay (this file) rather than expanding the base spec excessively.
- Any version-sensitive platform details (Clerk↔Supabase integration specifics) require verification against official docs during implementation.

