---
title: Swarm parallelism - file-ownership isolation (+ GR-4 narrative)
layer: L4
priority: P1
version: 1.0
date: 2026-07-24
source_model: Claude Fable 5
depends_on: [skills/orchestrator/SKILL.md, orchestration/specialized-subagents.md, REFERENCE-ANCHORS.md]
usage: The pattern behind every parallel row in the orchestrator's decision table. Read before any multi-agent launch in any tool. Owns the GR-4 narrative.
audience: architect, team
tools: all
---

# Swarm Parallelism - Ownership Isolation

Parallel agents are a merge-conflict generator unless file ownership is
disjoint *by architecture*. The pattern's one law: **you are not
manually arbitrating merge conflicts between agents** - if a launch
plan could require that, the launch plan is wrong, not the merge.

## The launch procedure (mechanical - no step optional)

1. **Decompose along ownership, not along effort.** "One agent per
   feature branch" works because features like auth / payments / admin
   dashboard naturally own disjoint dirs. If the decomposition's pieces
   share files, it isn't a parallel decomposition - re-cut it or run
   phases.
2. **Write the ownership map before launch:** agent → exact dirs. Verify
   intersections are empty *mechanically* (list and diff the globs, not
   vibes). The map is a launch artifact, kept with the task.
3. **Shared packages are never zones.** Anything consumed by two zones
   (in harborline: `packages/shared`) changes FIRST, alone, merged -
   then consumers parallelize against the settled contract. This row
   exists in every orchestrator port because it is the single most
   violated rule.
4. **Pin ownership in the strongest available mechanism:**
   `@workspace_scope` (Antigravity), worktrees/branches per session
   (OpenCode, Codex, generic), subagent briefs + review (Claude Code).
   Where the mechanism is documentation-only, review enforces it: the
   swarm-branch reviewer flags out-of-zone files as findings even when
   the code is correct (reviewer suite case 5).
5. **Define the merge order at launch,** not at merge time - order by
   dependency, and each merge gets its review pass before the next
   lands.
6. **Context per agent:** brief slice + zone + pointers (the
   specialized-subagents rule 4; a swarm is N specialized agents, and
   every rule about one applies to each).

## Sizing honesty
Parallelism pays when workstreams are genuinely independent and each is
substantial. Two 20-minute tasks swarm-launched cost more in mapping,
merging, and review than they save - the orchestrator's decision table
already encodes this (single-agent rows exist for a reason). The win
case is the auth/payments/admin shape: multi-day streams, zero shared
files, one merge order.

---

## Worked incident: GR-4 - the swarm merge collision (narrative owner)

**Setup.** Two features, one sprint, obvious parallelism: agent A adds
group-booking discounts; agent B adds operator-configurable fare
categories. Zones assigned by *feature*: A owns "the discount work,"
B owns "the fare-category work." Nobody wrote a file-level map - the
features felt disjoint, and feeling was the process.

**Failure.** Both features, it turned out, needed to touch the fare-rule
types in `packages/shared`: A added a `groupDiscount` field to the fare
schema; B restructured the same schema into category-keyed rules. Each
agent, in its own context, updated the zod validators and regenerated
the dependent snapshots - coherently, *locally*. A's branch merged
first, cleanly. B's merge produced a three-way conflict in the fare
schema that the merging human resolved by taking B's restructure
(it looked like the more complete change) - silently dropping A's
`groupDiscount` field. The type system didn't catch it: A's discount
*logic* in `services/api` compiled against the regenerated types by
falling through to the no-discount path. Group bookings priced at full
fare in production for nine days until a customer complained. The
destructive step wasn't either agent's - it was a reasonable human
resolving a conflict that should never have existed.

**Root cause.** Ownership mapped at feature granularity instead of file
granularity, and a shared package inside two zones. The collision was
structurally guaranteed the moment both briefs said "fare"; everything
after was just when.

**Permanent constraints** (row GR-4 in
`orchestration/guardrails-example-harborline.md`): `packages/shared` is
never a swarm zone (procedure step 3); launches require the written
file-level map with mechanically-verified empty intersections (step 2);
swarm-branch review includes zone-conformance (step 4's enforcement
tail).

**Test that proves it holds:** orchestrator suite case 9 (parallel ask
with shared/ inside a zone → REJECTED with the shared-first substitute);
reviewer suite case 5 (planted out-of-zone edit → finding).


## Reference card (extracted into every toolkit)

The full playbook above is a teaching document. What an agent needs
mid-task is the procedure, so this condensed card is what installs -
one hop from the skill that points at it, no narrative.

```markdown
<!-- FILE: ~/agent-toolkit/reference/swarm-launch.md -->
# Parallel launch procedure

You are not manually arbitrating merge conflicts between agents. If a plan
could require that, the plan is wrong.

## Steps - none optional
1. Decompose along FILE OWNERSHIP, not effort. If the pieces share files it
   is not a parallel decomposition - re-cut it or run phases.
2. Write the ownership map BEFORE launch: agent -> exact dirs. Verify
   intersections are empty mechanically (list and diff the globs).
3. Shared packages are NEVER zones. Anything two zones consume changes
   first, alone, merged - then consumers parallelize.
4. Pin ownership in the strongest mechanism the tool has (scope
   declaration, worktree, branch). Where it is documentation-only, review
   enforces it: out-of-zone files are findings even when the code is right.
5. Define merge ORDER at launch, not at merge time. Each merge gets its
   review before the next lands.
6. Each agent gets: brief slice, zone, POINTER to AGENTS.md - never a
   pasted copy.

## Sizing
Two 20-minute tasks cost more in mapping and merging than they save. The
win case is multi-day streams with zero shared files.
```

## Failure modes (reference-only)
GR-4 (narrated above); swarm agents sharing accumulated context →
GR-11 (narrative: `orchestration/context-reset-discipline.md`);
swarm-wide MCP inheritance unaudited → GR-3/GR-12 at multiplicity
(the Antigravity audit port's standing rule).

## Verifier
Orchestrator suite cases 4, 8, 9; reviewer suite case 5;
launch-artifact review (map present, intersections shown empty, merge
order stated).

## TOOL TRANSFER table
Procedure tool-independent. Pinning mechanism per step 4's table;
Antigravity is the native-swarm reference
(`skills/orchestrator/SKILL.md`); Codex/generic run the
worktree form (`tools/codex/codex-parity-notes.md`,
`tools/generic-adapter.md`).
