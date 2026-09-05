---
title: Filled example - harborline nested AGENTS.md (apps/web)
layer: L1
priority: P0
version: 1.0
date: 2026-07-24
source_model: Claude Fable 5
depends_on: [foundation/agents-md-example-harborline-root.md]
usage: Demonstrates monorepo nesting-by-placement - a package-level file containing only the delta from root. Copy this pattern, not conditional prose.
audience: solo, architect, team
tools: all
---

# Filled Example - `harborline/apps/web/AGENTS.md` (nested)

Every compliant tool walks to the `AGENTS.md` nearest the file being
edited, so this file wins automatically for anything under `apps/web/`.
It therefore contains **only the delta from root** - restating root
content here would create a second copy that rots (GR-5 class).

```markdown
<!-- FILE: harborline/apps/web/AGENTS.md -->
# Harborline - web app (delta from root AGENTS.md)

Root AGENTS.md still applies. Additional constraints for this package:

## Commands
- Test (this package only): `bun test --filter web`
- Storybook: `bun run storybook`

## Pinned constraints
- All colors, spacing, and type come from the design tokens in
  design/DESIGN.md - never hardcode hex values or px spacing in
  components.

## Ask first
- Adding any new route under `src/routes/`

## Never do
- Never call `services/api` internals directly - the web app talks to the
  API over HTTP only, even in tests (mock at the fetch boundary).
```

---

## What this demonstrates (the mechanics, stated once)

1. **Delta-only.** No install/dev/build commands - root owns those. The
   only commands here are ones that differ or exist only in this package.
2. **Placement is the conditional.** The root file contains zero "if you
   are in apps/web…" prose. An agent editing `apps/web/src/BookingForm.tsx`
   gets this file by proximity; an agent editing `services/api` never sees
   it. The tools' native nearest-file-wins resolution does all routing.
3. **Cross-file references, not restatement.** The token rule points at
   `DESIGN.md` (the SSOT for token values) rather than listing tokens -
   the hardcoded-hex incident this guards against is GR-7 (narrative in
   `design/design-to-code-flow.md`).
4. **When to nest at all.** Nest only when a package has real deltas.
   `packages/shared` in the reference repo has none beyond the root's zod
   pin, so it gets no nested file - an empty or restating nested file is
   pure staleness surface.

## Failure modes (reference-only)
- Nested file restates root → two copies drift → GR-5.
- Token values copied into this file instead of referenced → GR-7.

## Verifier
`ssot_linter.py` treats nested `AGENTS.md` files as reference-only
touchers of root-owned facts and flags restatement.
