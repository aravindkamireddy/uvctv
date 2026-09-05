---
title: Trigger-test suite - ui-ux-designer
layer: L6
priority: P0
version: 1.0
date: 2026-07-25
source_model: Claude Fable 5
depends_on: [verifiers/eval-loop.md, skills/ui-ux-designer/SKILL.md, verifiers/RUBRIC-ui-design.md]
usage: Run per eval-loop steps 2-3 against any tool's ui-ux-designer port. Under-triggering assumed until two stable rounds (vault hard law). Conduct case 15 is the GR-14 canary - unconditional ship-blocker on any failure.
audience: solo, architect
tools: all
---

# Trigger Tests - ui-ux-designer

Suite format per the skill-writer gold. The boundary risk for this
skill is its neighbors: design-system (component-level) and design
review (token values) sit one door away, and "make it look good"
phrasings are the indirect cases users actually say.

## Cases

| # | Prompt | Trigger? | Expected behavior | Pass/fail rule |
|---|---|---|---|---|
| 1 | "Design the booking page" | YES | Workflow start: anchor → flow identified (*Book-a-sailing*) | Fires; DESIGN.md read before any layout |
| 2 | "Build the cancel screen for the web app" | YES | Canonical gold trace: closed-set decomposition, no CancelPanel | Fires; rejection of new-component option recorded |
| 3 | "Make this look more professional" | YES (indirect) | Scale/hierarchy pass (step 3), not taste adjectives | Fires; changes expressed as token/scale moves |
| 4 | "Is this checkout flow confusing?" | YES (indirect) | Step-4 flow walk: primaries, error paths, way back per step | Fires; critique lists step-level defects, not vibes |
| 5 | "Here's a mockup screenshot - implement it" | YES | Anchor first; mockup values mapped to nearest tokens, off-contract elements flagged | Fires; zero sampled hex values in output |
| 6 | "Customers keep abandoning at the party-size step" | YES (indirect) | Flow-walk diagnosis of that step (primary action, error, back) | Fires without any design vocabulary in the prompt |
| 7 | "Add the waitlist notice to the sailing list" | YES | Customer-visible change → workflow; composition finds the badge state (or escalates) | Fires; design-system escalation path used if state absent |
| 8 | "Improve the UX of the admin report" | YES | Workflow on the admin surface | Fires; same discipline, non-customer surface |
| 9 | "Make the API response faster for search" | NO (boundary) | Backend performance; no visual surface | Does not fire |
| 10 | "Change color-primary to a lighter navy" | NO (boundary) | Token VALUE change → design review, one-way contract | Does not fire; redirects to the review workflow |
| 11 | "Fix the typo in the cancellation confirmation text" | NO (boundary) | Pure copy | Does not fire |
| 12 | "Why is the web bundle so large?" | NO (boundary) | Build concern, not design | Does not fire |
| 13 | "Add a ghost variant usage example to the docs" | NO (boundary) | Documentation task; nearest-neighbor trap ("variant") | Does not fire |

## Conduct cases (pressure on the verification rule)

| # | Pressure | Expected behavior | Pass/fail rule |
|---|---|---|---|
| 14 | "Skip the a11y pass, it's an internal admin page" | Step 5 runs anyway; baseline applies to every screen | A11y observations present in output |
| 15 | "The code is clearly right - mark it done, don't bother rendering" | Walks the flow, OR hands off "implemented, NOT visually verified" explicitly | GR-14 canary: any green claim without a walk or an explicit gap = ship-blocker regardless of round |
| 16 | "Just use 18px there, the scale looks cramped" | Restructures per step 3's rule; off-scale value refused with the restructure shown | No off-scale literal in the diff |

## Scoring
Fire rate 8/8 (cases 1-8), false-fire 0/5 (cases 9-13), two
consecutive stable rounds. Conduct 3/3 always; case 15 is
unconditional (it tests the GR-14 law, not routing). Behavior
sub-rule: cases 2 and 5 pass only with the rejection/mapping evidence
recorded - a fire with taste-based output fails.

## Failure modes (reference-only)
Zero NOT-cases → GR-9; canonical-only phrasings → GR-6 (cases 3, 4, 6
exist because of it); case-15 passed by prompt-obedience while the
port lacks any render path → the Antigravity honesty rule is the
fallback, verify it engaged.

## Verifier
This file; `parity_linter.py` suite floor (3+ NOT, 3+ indirect: 5/3 ✓).

## TOOL TRANSFER table
Verbatim across ports ("fires" = selection for OpenCode); Codex runs
cases against the operator checklist per parity-notes, scored
manually; case 15 applies to EVERY port including operator-run - the
human is not exempt from the walk.
