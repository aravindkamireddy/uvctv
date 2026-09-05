---
title: Trigger-test suite - skill-writer (gold format example)
layer: L6
priority: P0
version: 1.0
date: 2026-07-24
source_model: Claude Fable 5
depends_on: [verifiers/eval-loop.md, verifiers/description-tuning.md, skills/skill-writer/SKILL.md]
usage: Run per eval-loop steps 2-3 against any tool's skill-writer port. This suite is also the gold example of the suite FORMAT - copy its structure for new skills. Tool-agnostic: "fires" reads as description-triggering or agent selection per tool.
audience: solo, architect
tools: all
---

# Trigger Tests - skill-writer

Format (SSOT for suite structure, per eval-loop step 2): each case is
prompt | should-trigger | expected behavior | pass/fail rule. Mandatory
composition: 10-30 cases; ≥3 should-NOT boundary cases; ≥3 indirect
phrasings (per description-tuning - canonical phrasings alone test the
author, not users). Record fire rate and false-fire rate per round.

## Cases

| # | Prompt | Trigger? | Expected behavior | Pass/fail rule |
|---|---|---|---|---|
| 1 | "Make a skill for checking invariant coverage" | YES | Runs workflow from step 1 (asks for/derives trigger phrasings) | Fires AND asks about trigger moments before drafting |
| 2 | "Write me a Claude Code skill that audits our fare-rule tests" | YES | Workflow start; scope question (project vs personal) raised | Fires; step 2 scope decision appears |
| 3 | "Why doesn't my deploy-checklist skill ever trigger?" | YES | Diagnoses via description-tuning table; tunes description only | Fires; proposes description rewrite, not body rewrite |
| 4 | "Improve this skill description: 'Helps with coverage analysis'" | YES | Applies tuning rules 1-5; demands/derives phrasings | Fires; output description contains quoted phrasings + NOT-clause |
| 5 | "Every release I re-explain the migration checks. Can we not?" | YES (indirect) | Recognizes repeated-workflow signal; proposes a skill | Fires without the word "skill" in the prompt |
| 6 | "I keep pasting the same review steps into every session" | YES (indirect) | Same repeated-workflow recognition | Fires; proposes converting to skill/agent |
| 7 | "Turn this runbook into something the agent does automatically" | YES (indirect) | Maps "automatically" to skill authoring; workflow start | Fires; step 1 phrasings collected from the runbook's use |
| 8 | "My skill fires on everything, even typo fixes" | YES | Over-trigger diagnosis; adds negative space (GR-9 path) | Fires; NOT-clauses added; suite NOT-cases proposed |
| 9 | "Add a should-not-trigger section to my skill's tests" | YES | Suite-format guidance per eval-loop step 2 | Fires; 3+ boundary cases produced |
| 10 | "Convert my capacity-audit skill from Claude Code to OpenCode" | YES | Port via transfer table: format translated, workflow verbatim | Fires; body unchanged, container re-expressed |
| 11 | "Run the invariant-coverage skill" | NO (boundary) | Executes/announces the existing skill; no authoring | Does not fire; no authoring workflow appears |
| 12 | "Write a function that checks booking capacity" | NO (boundary) | Normal coding; app code, not a skill | Does not fire |
| 13 | "What skills do we have in this repo?" | NO (boundary) | Lists .claude/skills (or tool equivalent); no authoring | Does not fire |
| 14 | "Why is this booking test failing?" | NO (boundary) | Debugging; nothing to author | Does not fire |
| 15 | "Add a lint rule that bans hardcoded hex values" | NO (boundary) | Tooling config, not a skill unit | Does not fire (nearest-neighbor trap: "reusable automation" ≠ skill) |
| 16 | "Skill issue lol - anyway, fix the flaky test" | NO (boundary) | Colloquial "skill"; task is a test fix | Does not fire on the keyword alone |

## Scoring
- Fire rate = fired/10 on cases 1-10. Ship threshold: 10/10 across two
  consecutive rounds (eval-loop step 5).
- False-fire rate = fired/6 on cases 11-16. Ship threshold: 0/6, two
  consecutive rounds.
- Any case where it fires but the expected-behavior column fails counts
  as a fail even with correct triggering - behavior is half the test.

## Regression fixtures
Keep the pre-tuning description (if any) in the suite file; it must
FAIL cases 5-7 (indirect phrasings) - proving the tuned version's gain
is real, per the GR-6 constraint.

## Failure modes (reference-only)
Suite with zero NOT-cases → GR-9 (narrative: `verifiers/eval-loop.md`);
canonical-only phrasings → GR-6 (narrative:
`verifiers/description-tuning.md`).

## Verifier
This file is the verifier; its own format conformance (≥3 NOT, ≥3
indirect) is checked in review and by suite-format lint within
`parity_linter.py`'s suite pass.

## TOOL TRANSFER table
Cases apply verbatim to Claude Code / Antigravity / Command Code
(description firing) and OpenCode (agent selection); Codex N/A per
`tools/codex/codex-parity-notes.md`.
