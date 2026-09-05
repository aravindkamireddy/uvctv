---
title: Curriculum - beginner to running a disciplined swarm on the reference repo
layer: L10
priority: P2
version: 1.1
date: 2026-08-11
changelog: v1.1 - Stage 5 exercise updated for the unified setup script
source_model: Claude Fable 5
depends_on: [MANIFEST.md, distillation/glossary.md, team-layer/new-teammate-checklist.md]
usage: The learning path through the vault. Six stages, each with readings, one exercise ON the reference repo, and a pass condition. Sized for evenings-and-weekends pacing; a focused adopter compresses it to about two weeks.
audience: solo (primary), architect
tools: all
---

# Curriculum - Zero to Disciplined Swarm

Procedures over vibes: every stage ends with something you *did* on
harborline (clone/recreate it from the anchors + team-layer tree - the
assembly itself is Stage 1's exercise) and a pass condition you can
check. Skill range beginner→intermediate; where judgment would be
required, a stage hands you the decision table instead.

## Stage 0 - Vocabulary (one evening)
**Read:** `distillation/glossary.md` Part A; `REFERENCE-ANCHORS.md`.
**Exercise:** for your current tool, fill Part B's column from its
docs yourself before checking the shipped one.
**Pass:** you can say what a skill, a role, a registry, and a guardrail
are without naming any tool.

## Stage 1 - The instruction layer (one weekend)
**Read:** the four L1 foundation files, in manifest order (template →
root fill → nested fill → counterexample).
**Exercise:** assemble harborline's tree per `team-layer/tree.md`; then
write an `AGENTS.md` for a real repo of yours, run the trimming
checklist, and delete at least a third of your first draft.
**Pass:** the new-teammate checklist's step 4 question ("commands, and
what must you never do here?") - asked to your agent in your repo -
answers from the file. If you can't bring yourself to delete the
architecture section, reread GR-10 and try again.

## Stage 2 - First skills + the eval habit (one week, evenings)
**Read:** your tool's L2 port of skill-writer; `verifiers/eval-loop.md`;
`verifiers/description-tuning.md`.
**Exercise:** author ONE skill for a workflow you actually repeat,
starting from three verbatim phrasings you've really used. Write its
suite (≥3 NOT-cases, ≥3 indirect) BEFORE shipping; run two eval rounds
tuning only the description.
**Pass:** suite green two consecutive rounds; the untuned first
description kept as a failing regression fixture (your personal proof
that tuning did something).

## Stage 3 - Roles and permissions (one week, evenings)
**Read:** `orchestration/specialized-subagents.md`; your tool's
security-reviewer port; L3 in manifest order (registry template → fill
→ translations → secrets).
**Exercise:** install the security-reviewer in your repo with real
structural denial (or the branch floor); write your registry with rows
for every server you actually have - including the awkward ones;
run `permission_audit.py` and fix what it finds.
**Pass:** conduct case 11 ("just fix it yourself") fails structurally,
not politely; the auditor exits clean; you found at least one thing
you'd connected row-less (nearly everyone does - that's GR-12 telling
you it was already true of you).

## Stage 4 - Orchestration discipline (one week)
**Read:** L4 in manifest order (guardrails format + fill first, then
the four playbooks).
**Exercise A:** take a real multi-file task through the full plan
artifact - five parts, ≥2 options with reasoned rejection - before any
edit. **Exercise B:** start your personal `shared/GUARDRAILS.md`; the
first P-row is whatever your agents did this week that wasted your
time (the ninety-second rule).
**Pass:** the plan's build phase never re-litigated a decided option;
your P-1 has a constraint a weak model could obey mechanically.

## Stage 5 - The layers + the bridge (one weekend)
**Read:** L7 (tree, install), L8 (tree, mcp-json pattern, checklist),
L5 (template → fill → flow).
**Exercise:** build your `~/agent-toolkit/` with `setup.{sh,ps1} --vault <path>`
and run it twice (the second run detects the existing toolkit, switches to
update mode, and reports `ok` on every link - that is the point); wire a design contract -
the personal fallback at minimum - into one UI project's instruction
layer.
**Pass:** `setup.sh --check` clean on a re-run; a hex literal planted
in that UI project gets caught by your grep/review before merge.

## Stage 6 - The disciplined swarm (capstone, one weekend)
**Read:** `orchestration/swarm-parallelism.md` again, now with scars;
your tool's orchestrator port; the Antigravity audit port's swarm rules
(even if you run worktrees - the multiplicity logic is the lesson).
**Exercise:** on harborline, run the canonical genuinely-parallel pair
(notifications agent + admin-report agent): written ownership map with
mechanically-verified empty intersections, shared/ in no zone,
MCP audited against the swarm roster, merge order set at launch,
zone-conformance review on both branches before their merges.
**Pass:** both branches merge in order with zero cross-zone findings
and zero manual conflict arbitration - the GR-4 law held because the
launch made it impossible to break, which is the entire discipline in
one sentence.

## After the capstone
You are now the person the vault assumes: run the linters in CI
everywhere, graduate P-rows to team guardrails as they prove out, and
when a new tool ships, adapt it in half a day via
`tools/generic-adapter.md` instead of starting over. The vault's
maintenance cadence (README) takes it from here.

## Failure modes (reference-only)
Reading straight through without exercises → the vault as content, not
capability (its stated anti-goal); skipping suite-first in Stage 2 →
GR-6 rehearsed at learning scale; capstone attempted before Stage 4 →
GR-4 rehearsed at learning scale, on purpose, without the map.

## Verifier
Each stage's pass condition; the capstone IS the vault's end-to-end
acceptance test for a human, as the new-teammate checklist is for a
repo.

## TOOL TRANSFER table
Stages are tool-independent; Stage 2/3 read your tool's ports; Codex
adopters substitute operator procedures per the parity notes at Stages
2 and 6 (the capstone runs on worktrees).
