---
title: Counterexample - bloated auto-generated AGENTS.md, with trimming pass
layer: L1
priority: P0
version: 1.0
date: 2026-07-24
source_model: Claude Fable 5
depends_on: [foundation/agents-md-template.md, foundation/agents-md-example-harborline-root.md]
usage: Show this to anyone (human or agent) who wants to keep an auto-generated instruction file as-is. The trimming pass is the procedure; the before/after is the evidence.
audience: solo, architect, team
tools: all
---

# Counterexample - The Bloated `AGENTS.md` (and the trimming pass)

Auto-generated instruction files feel productive and measurably are not:
LLM-generated `AGENTS.md` files *reduce* task success and *increase* cost
in benchmark studies, primarily by restating content already inferable
from the code. Below: a realistic `/init`-style draft for harborline, the
trimming pass applied line-by-line, and the incident that made this a
permanent guardrail.

---

## The bloated draft (as generated - DO NOT SHIP)

```markdown
<!-- FILE: harborline/AGENTS.md -->
<!-- DRAFT - untrimmed -->
# Harborline Project Guide

## Overview
Harborline is a modern, full-stack TypeScript monorepo for ferry booking
management. It leverages cutting-edge tooling including Bun, React 18,
Vite, Tailwind CSS, Hono, and Drizzle ORM to deliver a fast, type-safe
developer experience.

## Architecture
The project follows a clean separation of concerns:
- **apps/web**: The frontend application, built with React 18 and Vite.
  Components live in `src/components`, routes in `src/routes`, and hooks
  in `src/hooks`. State management uses React context.
- **services/api**: The backend service, built with Hono. Route handlers
  live in `src/routes`, database access in `src/db`, and business logic
  in `src/domain`. We use the repository pattern for data access.
- **packages/shared**: Shared TypeScript types and zod validators used by
  both the web app and the API, promoting type safety across boundaries.

## Technology Stack
| Area | Technology |
|---|---|
| Runtime | Bun |
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Hono |
| Database | PostgreSQL with Drizzle ORM |
| Validation | zod |
| Linting | Biome |

## Development Workflow
1. Clone the repository
2. Run `bun install` to install dependencies
3. Run `bun run dev` to start the development servers
4. Make your changes following our coding standards
5. Run tests with `bun test` before committing
6. Run `bun run lint` to check code style

## Coding Standards
- Use TypeScript strict mode
- Prefer functional components with hooks
- Write descriptive variable names
- Add comments for complex logic
- Follow the existing code style

## Testing
We value testing! Please write tests for new features. Tests are colocated
with source files and run with `bun test`.
```

## The trimming pass (checklist items from `agents-md-template.md`, applied)

| Draft content | Test failed | Action |
|---|---|---|
| "modern, full-stack… cutting-edge… fast, type-safe" | filler; constrains nothing | delete |
| Entire Architecture section (folder tour, repository pattern) | inferable in 30s of `ls`/grep; architecture-essay test | delete - benchmarks show identical behavior without it |
| Technology Stack table | inferable from package.json/lockfile | delete |
| Workflow steps 1, 2, 4 | inferable / vacuous ("make your changes") | delete; keep only exact commands |
| "Use TypeScript strict mode" | inferable from tsconfig | delete |
| "descriptive variable names", "add comments", "follow existing style" | vibes, not constraints; a linter's job | delete |
| "We value testing!" | filler | delete |
| Commands scattered through prose | keep - but consolidate under one Commands heading, exact form |
| **Missing entirely:** zod pin, capacity invariant location, ask-first list, never-do list | the only content that was actually needed | **add** |

**Result of the pass:** exactly
`foundation/agents-md-example-harborline-root.md`. ~55 generated lines →
~30 real ones, and the four facts that prevent incidents (pin, invariant,
ask-first, never-do) - absent from the generated draft - are present.
That asymmetry is the whole lesson: generators restate what's inferable
and omit what isn't, because the non-inferable facts aren't in the code.

---

## Worked incident: GR-10 - auto-generated bloat (narrative owner)

**Setup.** Early in harborline's life a teammate ran an `/init`-style
generator, got the draft above, skimmed it ("looks thorough"), and
committed it unmarked.

**Failure.** Two compounding costs over the following month. First, every
agent session paid ~1.5k tokens of context for the file, crowding out
task-relevant context on smaller-window models. Second - the expensive
one - an agent asked to add a `cancellations` route in the API followed
the file's "repository pattern" essay (a pattern the codebase had by then
partially migrated away from) and produced a textbook repository layer
inconsistent with the surrounding handlers. Review caught it; the rework
cost a day. Meanwhile the file said nothing about the zod pin, so the same
month another agent bumped zod to v4 in an unrelated dependency-update
task and broke 61 snapshots.

**Root cause.** The generated file optimized for looking complete:
restated the inferable (which then rotted into misdirection as the code
moved) and omitted the non-inferable (which is precisely what an
instruction file exists to carry).

**Permanent constraint** (entry GR-10 in
`orchestration/guardrails-example-harborline.md`): generated instruction
files are drafts, marked `<!-- DRAFT - untrimmed -->`, and may not merge
until the trimming checklist passes in review.

**Test that proves it holds:** `staleness_linter.py` fails any committed
`AGENTS.md` containing the literal draft marker.

## Failure modes (reference-only)
- Shipping the draft → GR-10 (narrated above).
- The essay content later duplicated into CLAUDE.md → GR-5.

## Verifier
`verifiers/lint/staleness_linter.py` (draft-marker rule); human review
runs the trimming checklist from `agents-md-template.md`.
