---
title: Filled example - harborline root AGENTS.md (gold)
layer: L1
priority: P0
version: 1.0
date: 2026-07-24
source_model: Claude Fable 5
depends_on: [REFERENCE-ANCHORS.md, foundation/agents-md-template.md]
usage: The canonical filled instruction file for the reference monorepo. SSOT for harborline commands, pinned versions, ask-first and never-do lists - every other vault file references these facts here, never restates them.
audience: solo, architect, team
tools: all
---

# Filled Example - `harborline/AGENTS.md` (root)

This is the gold example of the L1 template filled against the reference
monorepo. Note what is *absent*: no framework tour, no directory map, no
architecture prose - all inferable, all deleted by the trimming checklist.

```markdown
<!-- FILE: harborline/AGENTS.md -->
# Harborline

Booking system for small ferry operators: customers reserve seats on
scheduled sailings. Bun-workspaces monorepo - `apps/web` (booking UI),
`services/api` (schedules, bookings, fare rules), `packages/shared`
(types + validators). The core business invariant - sum of non-cancelled
party sizes never exceeds sailing capacity - is enforced in the API
service, not the database.

## Commands
- Install: `bun install`
- Dev: `bun run dev`
- Test: `bun test`
- Lint: `bun run lint`
- Build: `bun run build`
- Migrate: `bun run db:migrate`

## Pinned constraints
- `zod` pinned to `3.23.8` in `packages/shared` - v4 changed the
  error-issue API and every fare-rule validation snapshot depends on the
  v3 shape. Bumping requires regenerating all snapshots (ask first).

## Ask first
- Any schema change under `services/api/src/db/` (sailings, bookings)
- Adding or removing any dependency in any workspace
- Bumping the `zod` pin
- Anything touching payment status transitions (`held → paid → cancelled`)

## Never do
- Never run `bun run deploy` or `bun run db:migrate` against production
  from a local machine - deploys and prod migrations run from CI on
  `main` only.
- Never weaken or bypass the capacity invariant "to make a test pass."
- Never commit secrets; `.mcp.json` and `.env` values come from env vars
  (see mcp/registry.md for the connection matrix).
- Never edit generated snapshot files by hand.
```

---

## Why each line survived the trimming checklist

| Line | Why it's non-inferable |
|---|---|
| Overview's invariant location | An agent reading the schema would reasonably assume a DB constraint exists; it doesn't. This single sentence prevents a class of "fix": adding one. |
| `bun test` (not `bun run test`) | Bun treats `test` as a builtin; agents habituated to npm write `run test`. Exactness per checklist item 3. |
| zod pin + reason | The lockfile shows the version but not the *why*; without the reason clause an agent "helpfully" bumps it (the exact GR-2-class trap). |
| CI-only deploy | Nothing in the codebase says this; it's an operational rule (fixture's canonical never-do, per anchors). |
| Capacity-invariant never-do | Guards the known agent failure of gutting an assertion to green a test. |

Lines that were drafted and then deleted: a directory tree (inferable),
"we use TypeScript strict mode" (inferable from tsconfig), a paragraph on
Drizzle patterns (architecture essay), Tailwind conventions (owned by
`design/design-md-example-harborline.md` - SSOT test).

## Failure modes (reference-only)
- If any command line here drifts from `package.json` → GR-2 (narrative in
  `foundation/agents-md-template.md`).
- If a tool-specific file copies these commands instead of referencing →
  GR-5 (narrative in `verifiers/lint/README.md`).

## Verifier
`verifiers/lint/staleness_linter.py` checks these commands against the
reference repo's `package.json` scripts; `ssot_linter.py` flags any vault
file restating them.
