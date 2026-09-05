---
title: Plan/build separation - playbook with worked walkthrough
layer: L4
priority: P1
version: 1.0
date: 2026-07-24
source_model: Claude Fable 5
depends_on: [skills/orchestrator/SKILL.md, foundation/agents-md-example-harborline-root.md]
usage: The pattern behind the orchestrator's plan-first rows: research and decide before an agent starts editing. Use each tool's native split; never rebuild it.
audience: solo, architect
tools: all
---

# Plan/Build Separation

The cheapest bug is the one designed out before an edit exists. Plan/
build separation is the discipline of running *research-and-decide* as
a distinct mode from *edit-and-verify* - distinct enough that the
planning pass literally cannot change files. Every serious tool ships a
native split; the pattern is to USE it, not rebuild it:

| Tool | Native split | Notes (2026-07) |
|---|---|---|
| Claude Code | plan mode | `[VERIFY 2026-07]` |
| OpenCode | `Plan` / `Build` primary agents | the cleanest expression - a mode switch is an agent switch |
| Antigravity | plan pass before Agent Manager launch | `[VERIFY 2026-07]` |
| Codex CLI | none - operator runs a read-only session first | `tools/codex/codex-parity-notes.md` |
| Others | read-only first session per `tools/generic-adapter.md` | |

## When planning is mandatory (not judgment - a list)
1. Anything on the AGENTS.md **ask-first** list (schema, deps, pins,
   payment transitions in the reference repo).
2. Feature-level asks (the orchestrator's routing rows send these here).
3. Tasks whose file-touch list is unknown until researched.
4. Anything the agent will do *unattended* after approval - the plan is
   the leash.

Skip planning for: single-file fixes, already-decomposed steps, pure
questions. Mandatory planning on trivia is ceremony, and ceremony gets
skipped exactly when it matters (the GR-9 lesson generalized).

## What a plan IS (the artifact, five parts)
1. **Restatement** - the task in one sentence, plus what is explicitly
   out of scope.
2. **Touched-surface list** - files/dirs enumerated by search, each
   tagged against ask-first/never-do.
3. **Options considered, with rejections reasoned** - minimum two
   options; a plan with one option is a decision wearing a plan's
   clothes (traces-over-answers made structural).
4. **The decision** + its verification: which tests prove it worked,
   which review it needs.
5. **Execution shape** - the orchestrator route (phases, agents, zones)
   the build will follow.

Approval gates on the artifact: a human (or, for personal-layer work,
the operator's deliberate "go") approves THE PLAN, and the build's
brief is the approved plan - not the original vague ask.

## Worked walkthrough (harborline, full trace)

**Ask:** "Support waitlists: when a sailing is full, customers can join
a waitlist and get promoted when someone cancels."

**Plan pass (no edits possible):**
1. Restatement: add waitlist join + automatic promotion on
   cancellation. Out of scope: notifications (separate task), payments
   for promoted bookings (promoted = 'held', existing flow takes over).
2. Touched surface (by search): `services/api/src/db/` - NEW table
   needed → **ask-first hit**. `src/domain/bookings.ts` cancellation
   path (promotion hook). `packages/shared` types. `apps/web` join
   button + status display. Capacity invariant adjacency: promotion
   must re-check capacity atomically - never-do "weaken the invariant"
   is in play.
3. Options:
   - (a) `waitlist` as a new table - REJECTED first draft, revisited:
     see (c).
   - (b) overload `bookings.status` with a `'waitlisted'` value -
     REJECTED: waitlisted entries would pollute every capacity sum;
     each existing SUM query becomes a bug site; the invariant's blast
     radius is exactly why AGENTS.md gates status transitions.
   - (c) = (a) refined: separate `waitlist(id, sailing_id, party_size,
     position, created_at)` table; promotion creates a normal 'held'
     booking inside the same transaction as the cancellation recount -
     CHOSEN: invariant untouched, existing flows unmodified, one new
     ask-first-reviewed migration.
4. Verification: transition tests extended (cancel-with-waitlist
   promotes atomically; promotion respects capacity when party sizes
   differ); invariant tests untouched; security-reviewer on the api
   diff (sensitive path).
5. Execution shape: phased single agent - migration (post-approval) →
   shared types → api domain → web - fresh context between api and web
   phases (GR-11).

**Approval:** human approves plan incl. the migration. **Build:** the
brief is the plan; phase 1 begins. The build agent never re-decides (b)
vs (c) - that decision is spent, which is the entire point.


## Reference card (extracted into every toolkit)

The full playbook above is a teaching document. What an agent needs
mid-task is the procedure, so this condensed card is what installs -
one hop from the skill that points at it, no narrative.

```markdown
<!-- FILE: ~/agent-toolkit/reference/plan-build.md -->
# Plan before build

## When planning is MANDATORY (not judgment)
1. Anything on AGENTS.md's ask-first list (schema, deps, pins).
2. Feature-level asks ("add cancellations"), not fixes.
3. Tasks whose touched-file list is unknown until researched.
4. Anything the agent will do unattended after approval.

Skip for: single-file fixes, already-decomposed steps, questions.

## The plan artifact - five parts, all required
1. Restatement in one sentence + what is explicitly OUT of scope.
2. Touched surface: files/dirs found by SEARCH, each tagged against
   ask-first / never-do.
3. Options considered - MINIMUM TWO - each rejected one with a one-clause
   reason. A plan with one option is a decision wearing a plan's clothes.
4. Verification: which tests prove it worked, which review it needs.
5. Execution shape: phases, agents, zones.

## The rule that makes it worth doing
The build's brief is the APPROVED PLAN, not the original vague ask. The
build agent never re-decides a spent decision.
```

## Failure modes (reference-only)
- Plan skipped on ask-first items → GR-3-adjacent overreach
  (narrative: `mcp/registry-example-harborline.md`).
- "Planning" in the same context that then builds, accumulating both →
  GR-11 (narrative: `orchestration/context-reset-discipline.md`).
- One-option plans → rubber-stamp artifact; rejected-option field
  empty is a review flag.

## Verifier
Orchestrator suite cases 1, 2, 7 (plan-first routing);
review checklist: plans carry all five parts, part 3 has ≥2 options.

## TOOL TRANSFER table
Covered by the native-split table above; the five-part plan artifact
is tool-independent.
