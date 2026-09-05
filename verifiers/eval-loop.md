---
title: The eval loop - 5-step procedure for trusting any skill or agent
layer: L6
priority: P0
version: 1.0
date: 2026-07-24
source_model: Claude Fable 5
depends_on: [REFERENCE-ANCHORS.md, verifiers/description-tuning.md]
usage: SSOT for the eval procedure every vault skill/agent runs through before being trusted. Referenced by all skill-writer ports (their step 7) and all trigger-test suites. Owns the GR-9 narrative.
audience: solo, architect, team
tools: all
---

# The Eval Loop - Before Trusting Any Skill or Agent

A strong verifier plus a weak generator approximates a strong system;
a strong generator with no verifier approximates luck. This loop is the
verifier for L2-class assets. It is deliberately boring: five steps, run
until stable, no judgment calls a beginner can't make.

## The procedure

1. **Draft** the skill/agent definition (per the skill-writer workflow
   in your tool's port).
2. **Write test prompts substantive enough to actually require it.**
   Trivial one-step queries won't trigger a skill regardless of
   description quality - a test suite of "check coverage" one-liners
   tests nothing. Each case: prompt | should-trigger yes/no | expected
   behavior | pass/fail rule. 10-30 cases, including at least 3
   should-NOT cases at the boundary (near-miss phrasings that a greedy
   description would wrongly catch). Format SSOT:
   `verifiers/trigger-tests/` suites are the gold examples.
3. **Run and evaluate** - qualitatively (did the behavior match the
   expected column, not just "did something happen") and quantitatively
   (fire rate on should-trigger cases, false-fire rate on should-NOT
   cases; record both numbers per round).
4. **Iterate on the description/frontmatter specifically.** Triggering
   is description-driven; under-triggering is the common failure mode
   (GR-6), and the fix is almost never in the body. Make descriptions
   explicit and slightly "pushy" - enumerate phrasings, name the
   negative space. Full tuning method: `verifiers/description-tuning.md`
   (SSOT for that half).
5. **Repeat until stable** - two consecutive rounds with all
   should-trigger cases firing and all should-NOT cases quiet - then
   package for distribution (commit to the team layer or personal tree;
   version it; a changed description restarts at step 3).

## Reading the two numbers

| Fire rate | False-fire rate | Diagnosis | Move |
|---|---|---|---|
| low | low | under-triggering (GR-6) | add phrasings, pushier verbs - step 4 |
| high | high | over-triggering (GR-9) | add "NOT for…" negative space; narrow nouns |
| low | high | description matches the wrong task | rewrite the description from the trigger moment up |
| high | low | stable | one confirming round, then ship |

---

## Worked incident: GR-9 - the over-triggering skill (narrative owner)

**Setup.** After the security-reviewer subagent proved its worth,
someone proposed making review ambient: a `review-everything` skill
whose description read "Use whenever code has been changed, to review
the change." It shipped after informal testing - three test prompts,
all should-trigger, all fired. Looked perfect.

**Failure.** In use, "whenever code has been changed" is *every turn of
every session*. The skill fired on a one-line copy fix in the web app,
on each intermediate step of a refactor (reviewing half-finished states
it then flagged as broken), and - the expensive case - on every file an
agent touched during the cancellation feature, injecting the full review
procedure into context a dozen times. Sessions slowed, context filled
with recursive review-of-review chatter, and agents began truncating
*task-relevant* context to make room. Net effect measured over a week:
task completion got worse with the review skill than without it - a
safety asset that reduced safety by displacing attention.

**Root cause.** A test suite with zero should-NOT cases. Every case
confirmed firing; nothing measured *restraint*. Step 2's boundary cases
exist precisely because a description can only be falsified by prompts
it should ignore.

**Permanent constraints** (entry GR-9 in
`orchestration/guardrails-example-harborline.md`): every suite carries
3+ should-NOT boundary cases (step 2, enforced by the suite format);
heavyweight procedures ship as deliberately-invoked subagents, not
ambient skills - the L2 reviewer's design is the standing pattern.

**Test that proves it holds:** the security-reviewer suite's should-NOT
cases ("fix this typo", "rename this variable") must stay quiet; a suite
submitted with zero should-NOT cases fails format review.

## Failure modes (reference-only)
GR-9 (narrated above), GR-6 (narrative:
`verifiers/description-tuning.md`), untested-description-assumed-to-
under-trigger is vault hard law (Hard Constraints).

## Verifier
This file IS a verifier spec; its own enforcement is the suite format
(3+ NOT-cases mandatory) checked in review, plus the four gold suites
under `verifiers/trigger-tests/`.

## TOOL TRANSFER table
Tool-independent procedure. "Trigger" reads as: description-firing
(Claude Code, Antigravity, Command Code), agent selection (OpenCode);
Codex N/A per `tools/codex/codex-parity-notes.md` (nothing triggers -
the loop's steps 2-5 still apply to any operator-procedure checklist
you want to trust).
