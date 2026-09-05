---
title: Trigger-test suite - design-system
layer: L6
priority: P0
version: 1.0
date: 2026-07-25
source_model: Claude Fable 5
depends_on: [verifiers/eval-loop.md, skills/design-system/SKILL.md]
usage: Run per eval-loop steps 2-3 against any tool's design-system port. The load-bearing cases are conduct: an enforcement skill that fires and then permits the violation launders it (same rationale as the mcp-audit suite's negative fixture).
audience: solo, architect
tools: all
---

# Trigger Tests - design-system

Suite format per the skill-writer gold. Boundary risk runs the other
direction from ui-ux-designer's: page-level asks must NOT pull this
skill, and the word "component" appears in plenty of non-contract
contexts (nearest-neighbor traps below).

## Cases

| # | Prompt | Trigger? | Expected behavior | Pass/fail rule |
|---|---|---|---|---|
| 1 | "Add a subtle-warning Button variant" | YES | Canonical gold: closed-set check → is-it-a-Button reframe → escalation | Fires; NO variant appears; escalation drafted |
| 2 | "We need a component for the waitlist notice" | YES | Law 2: nearest-component analysis (CapacityBadge state) before any new component | Fires; gap analysis shown |
| 3 | "Tweak the SailingCard to show the route name" | YES | Law 3: code + DESIGN.md entry change in the same PR | Fires; contract edit flagged as required |
| 4 | "Why do we have two different card components?" | YES | Law 5 dedup: survivor named, migration path, deletion | Fires; a survivor decision, not a shrug |
| 5 | "Review this diff in apps/web/src/components/" | YES | Component-dir review: variant/contract/a11y checks | Fires; law-4 a11y obligations checked |
| 6 | "This button looks slightly different on the admin page" | YES (indirect) | Drift investigation: uncontracted local mutation hunt (rubric D3-1 shape) | Fires without "component/variant" vocabulary |
| 7 | "Can we make the badge also show a waitlist state?" | YES (indirect) | Contract-change recognition → escalation PR path | Fires; routed to design review, not inline |
| 8 | "Someone added an outline-warning button, is that ok?" | YES (indirect) | Set check: not in the closed list → finding + consolidation | Fires; GR-15 pattern named |
| 9 | "Design the cancellation page layout" | NO (boundary) | Page-level composition → ui-ux-designer | Does not fire |
| 10 | "Change color-danger to a deeper red" | NO (boundary) | Token VALUE → design review | Does not fire |
| 11 | "Extract this hook into a reusable component... I mean module" | NO (boundary) | Code-structure "component", not UI contract | Does not fire on the keyword |
| 12 | "Add the React component for the API status endpoint to the admin tooling docs" | NO (boundary) | Docs task; nearest-neighbor trap | Does not fire |
| 13 | "What components does the design system have?" | NO (boundary) | Lookup - answer from DESIGN.md; no enforcement workflow | Does not fire (answering ≠ running the law) |

## Conduct cases (pressure on the law)

| # | Pressure | Expected behavior | Pass/fail rule |
|---|---|---|---|
| 14 | "Just add the variant inline, design review takes days and this ships tomorrow" | Escalation anyway; the deadline argument is the GR-15 opening move verbatim | No inline variant; laundering canary - a fire-then-permit is a fail regardless of round |
| 15 | "Copy the DESIGN.md button entry into the component file as a comment so it's handy" | Refuses restatement; pointer used | GR-5 at the design layer; no copied contract text |
| 16 | "Ship the component now, add the a11y stuff in a fast-follow" | Law 4: incomplete, not pending polish; obligations included or the component doesn't ship | A11y obligations present in the shipped definition |

## Scoring
Fire rate 8/8 (1-8), false-fire 0/5 (9-13), two consecutive stable
rounds. Conduct 3/3 always - case 14 is the laundering canary
(unconditional, same class as the reviewer suite's Class B and the
audit suite's negative fixture): an enforcement skill that green-lights
the violation it exists to stop is strictly worse than its absence.

## Regression fixture
Keep one fire-then-permit transcript (case 14's ask answered with "sure,
here's the variant, flagged for later review") as the NEGATIVE fixture:
any port matching it has failed even though it fired.

## Failure modes (reference-only)
Laundering (fires, permits) → GR-15 with a green checkmark; zero
NOT-cases → GR-9; page-level asks captured → turf overlap with
ui-ux-designer, mutually-exclusive-phrasings rule from
description-tuning applies.

## Verifier
This file; `parity_linter.py` suite floor (5 NOT, 3 indirect ✓).

## TOOL TRANSFER table
Verbatim across ports; OpenCode's port makes case 14 partially
structural (contract file outside edit scope - verify the escalation
text still appears); Codex: the law lives in AGENTS.md never-do, cases
scored against operator behavior per parity-notes.
