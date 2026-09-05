---
title: Description tuning - fixing under-triggering (the named failure mode)
layer: L6
priority: P0
version: 1.0
date: 2026-07-24
source_model: Claude Fable 5
depends_on: [verifiers/eval-loop.md, REFERENCE-ANCHORS.md]
usage: SSOT for the description-tuning half of the eval loop (its step 4). Owns the GR-6 narrative. Apply whenever a skill/agent exists but doesn't fire, or before shipping any new description.
audience: solo, architect
tools: all
---

# Description Tuning - Against Under-Triggering

The description is not documentation; it is the *routing function*. A
model deciding whether to invoke a skill sees the description, not the
body - a perfect workflow behind a vague description is a perfect
workflow that never runs. Under-triggering is the common failure mode
(not over-triggering, which at least gets noticed - see GR-9), because
vague descriptions fail *silently*: the agent just... does the task some
other way, and nobody learns the skill existed.

## The tuning method (mechanical)

1. **Start from trigger phrasings, not from what the skill does.**
   Collect 3+ verbatim things a user actually says when they want this
   ("check invariant coverage", "capacity test audit"). If you can't
   list them, you don't know the trigger moment yet - go get them
   before writing a word of description.
2. **Put the phrasings IN the description**, quoted. Models match
   surface forms far more reliably than abstractions: "audit test
   coverage of the booking capacity invariant - e.g. 'check invariant
   coverage', 'capacity test audit'" beats "helps with coverage
   analysis" every round, every tool.
3. **Be pushy.** Open with "Use this whenever…" / "ALWAYS use before…"
   and enumerate the situations, including indirect ones ("or when the
   user describes a repetitive multi-step task they wish were one
   command"). Politeness under-fires; the description's job is to win
   the routing decision whenever it should.
4. **Name the negative space.** "Do NOT use for running the full test
   suite / writing new features." Every should-NOT test case that
   false-fires in eval becomes a NOT-clause here - that is the entire
   feedback loop between step 3 and step 4 of the eval procedure.
5. **Ban the vague nouns.** "workflows", "helps with", "assists",
   "management", "handling" - each one is a place where routing goes to
   die. Replace with the concrete noun the user would say.
6. **Re-run the suite; tune ONLY the description between rounds.** If
   you change body and description together, you can't attribute the
   delta - and the delta is almost always the description.

## Diagnostic table

| Symptom | Likely cause | Fix (rule) |
|---|---|---|
| Never fires, even on exact phrasings | description describes the OUTPUT not the ASK | rewrite from phrasings (1, 2) |
| Fires on direct asks, misses indirect ones | no situational triggers | add "or when the user…" clauses (3) |
| Fires in interactive use, silent in swarms/background | pushiness calibrated to attended use | escalate verbs; swarm agents have no human backstop (Antigravity port note) |
| False-fires on neighbors ("run the tests") | no negative space | NOT-clauses from the failing cases (4) |
| Fires for the wrong skill when several exist | overlapping descriptions | give each skill mutually exclusive nouns; the phrasing sets must not intersect |

---

## Worked incident: GR-6 - the under-triggering skill (narrative owner)

**Setup.** Harborline's deploy ritual had a human checklist: verify
migrations applied on staging, confirm no held bookings mid-transition,
check the capacity dashboards post-deploy. It was made into a skill so
agents preparing releases would run it. The description: "Deployment
checklist helper. Helps ensure deployments go smoothly." Informal test:
someone typed "run the deployment checklist" - it fired. Shipped.

**Failure.** Nobody ever types "run the deployment checklist" when it
matters. They say "prep the release", "get this ready to ship",
"deploy when green". Over six weeks the skill fired zero times in real
use; agents prepped releases from general knowledge, and one release
went out with a staging migration unverified - exactly the step the
checklist existed to force. The gap surfaced only in the incident
review, where someone asked "don't we have a skill for this?" We did.
It had never fired. The silence was the failure: an over-triggering
skill announces itself every session (GR-9's incident took a week to
notice); an under-triggering one is indistinguishable from not existing
until the day it was needed.

**Root cause.** The description named the artifact ("deployment
checklist") instead of the trigger moments ("prep the release", "ready
to ship", "deploy"). Rule 1 violated at authoring; the one-prompt
informal test tested the author's phrasing, not users'.

**Permanent constraints** (entry GR-6 in
`orchestration/guardrails-example-harborline.md`): descriptions are
written from collected user phrasings (rule 1) and carry them verbatim
(rule 2); an untested description is assumed to under-trigger (vault
hard law); suites must include indirect phrasings, not just canonical
ones.

**Test that proves it holds:** the tuned description fires on "prep the
release" and "get this ready to ship" in its suite; the original
description, kept as a regression fixture, does not.

## Failure modes (reference-only)
GR-6 (narrated above); over-correction into catch-all descriptions →
GR-9 (narrative: `verifiers/eval-loop.md`).

## Verifier
The four suites under `verifiers/trigger-tests/` (each includes
indirect-phrasing cases per this file); eval-loop step 3's fire-rate
numbers make silence visible.

## TOOL TRANSFER table
Tool-independent. Applies to Claude Code/Antigravity/Command Code skill
descriptions and OpenCode agent descriptions identically; Codex N/A
(`tools/codex/codex-parity-notes.md`). For any tool: whatever text the
router reads IS the description; tune that.
