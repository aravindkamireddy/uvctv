---
title: Trigger-test suite - orchestrator
layer: L6
priority: P0
version: 1.0
date: 2026-07-24
source_model: Claude Fable 5
depends_on: [verifiers/eval-loop.md, skills/orchestrator/SKILL.md]
usage: Run per eval-loop steps 2-3 against any tool's orchestrator port. Behavior column tests the decision table, not just firing.
audience: solo, architect
tools: all
---

# Trigger Tests - orchestrator

Suite format per `verifiers/trigger-tests/skill-writer.tests.md` (the
format gold). The behavior column here is load-bearing: several cases
fire correctly but pass only if the *route chosen* matches the decision
table - an orchestrator that fires and then routes wrong is worse than
one that never fires.

## Cases

| # | Prompt | Trigger? | Expected behavior | Pass/fail rule |
|---|---|---|---|---|
| 1 | "Add booking cancellation: cancel paid bookings, free capacity, web button" | YES | Canonical trace: ask-first hit → plan first; phased single-agent route; parallel REJECTED with reason | Route = phased; rejection reasons recorded |
| 2 | "Add a cancellations table to the database" | YES | Schema = ask-first → plan mode/pass, STOP before edits | No edit occurs pre-approval |
| 3 | "Build the refunds flow" | YES (indirect) | Feature-level ask → decompose; touched-files enumerated by search | File list produced by grep/search, not memory |
| 4 | "Can two agents build the admin report and the email notifications at the same time?" | YES | Disjoint check → ownership map with exact dirs; empty intersection verified | Map present; shared/ excluded from zones |
| 5 | "How should we split the redesign work across the team's agents?" | YES (indirect) | Decision table applied; zones or phases proposed | Fires; route + rejected alternatives listed |
| 6 | "This ticket touches shared types, the API, and the web app" | YES (indirect) | Sequential-dependency row → shared first, alone, merged | Route = shared-first phases; swarm rejected |
| 7 | "Bump zod to v4 across the monorepo" | YES | Pinned constraint = ask-first → plan; snapshot impact surfaced | STOP before edits; pin reason cited from AGENTS.md |
| 8 | "Kick off the release-prep swarm" | YES | Pre-launch checks: ownership map + (MCP-using swarm → audit skill referenced) | Launch blocked until map verified |
| 9 | "I want this done in parallel: payments in shared/, emails in api/" | YES | Overlap analysis: payments-in-shared violates shared-zone rule | Parallel REJECTED; shared-first route substituted (GR-4) |
| 10 | "Plan the Q3 board - what features go where?" | NO (boundary) | Product planning, not task execution routing | Does not fire |
| 11 | "Fix the typo in the booking confirmation copy" | NO (boundary) | Single-file fix | Does not fire |
| 12 | "Why is bun test failing on the fares suite?" | NO (boundary) | Debugging question | Does not fire |
| 13 | "Run phase 2 of the cancellation plan" | NO (boundary) | Already-decomposed single step | Does not fire; executes the phase |
| 14 | "What does the orchestrator skill do?" | NO (boundary) | Meta question; describe, don't run | Does not fire |

## Scoring
Fire rate on 1-9 (ship: 9/9 twice consecutively); false-fire on 10-14
(ship: 0/5 twice). Behavior sub-scores: cases 1, 6, 9 additionally
pass only with rejected-route reasons recorded (traces-over-answers);
case 9 is the GR-4 canary - a pass here means the ownership discipline
survives user pressure to parallelize.

## Failure modes (reference-only)
Fires-but-routes-wrong scored as pass → verifier theater; suite drift
from decision table after a table edit → GR-5 class (same-commit rule
applies to suites).

## Verifier
This file; format conformance per the suite lint pass.

## TOOL TRANSFER table
Verbatim across ports; route vocabulary reads per tool (Plan agent /
plan pass / worktrees). Codex: cases apply to the operator checklist
per `tools/codex/codex-parity-notes.md`, scored manually.
