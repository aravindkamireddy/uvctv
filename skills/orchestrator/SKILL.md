---
title: orchestrator - canonical skill (Agent Skills standard)
layer: L2
priority: P0
version: 2.0
date: 2026-07-26
changelog: v2.0 fix-batch D - promoted to the single canonical copy; per-tool ports collapsed (GR-19). Tool-specific swarm deltas absorbed as a universal addendum; install paths verified against each tool's primary docs 2026-07
source_model: Claude Fable 5
depends_on: [orchestration/specialized-subagents.md, orchestration/plan-build-separation.md, REFERENCE-ANCHORS.md]
usage: THE canonical definition of this skill. Install the fenced payload at your tool's path (table below). Edit here and nowhere else.
audience: solo, architect
tools: all (loads unchanged in Claude Code, Codex, Command Code, Antigravity, Cursor; OpenCode via its agent port)
---

# orchestrator (Claude Code native format)

Routes a substantial task to the right execution shape - direct edit,
plan mode, specialized subagent, or parallel swarm - instead of defaulting
to "one agent, one context, everything at once."

## The shippable file

```markdown
<!-- FILE: .claude/skills/orchestrator/SKILL.md -->
---
name: orchestrator
description: Use this skill BEFORE starting any task that spans multiple
  workspaces or packages, touches 3+ files, mixes planning with editing,
  involves a schema/dependency/deploy change, or is phrased as a feature
  ("add cancellations", "build the refunds flow") rather than a fix. Also
  use when the user asks "how should we split this work", "can agents do
  this in parallel", or hands over a multi-step brief. Do NOT use for
  single-file fixes, questions, or tasks already decomposed into one
  concrete step.
---

# Routing a task to the right execution shape

## Standing references (read these before you start)

An installed skill can only reach files that exist beside it. In a personal
toolkit that is `~/agent-toolkit/shared/`; in a project it is the repo's own
copies. Consult, in this order:

1. `~/agent-toolkit/shared/GUARDRAILS.md` - permanent constraints earned from
   past failures. If a rule there contradicts anything below, the rule wins.
2. The project's `AGENTS.md` - commands, pins, ask-first, never-do.
3. `~/agent-toolkit/shared/mcp-registry.md` (or the project's
   `mcp/registry.md` (project) / `~/agent-toolkit/shared/mcp-registry.md` (personal)) before touching any external service.
4. `~/agent-toolkit/shared/DESIGN.md` (or the project's `design/DESIGN.md` (project) / `~/agent-toolkit/shared/DESIGN.md` (personal))
   for any user-facing work.

A missing file is not permission to improvise - say it is missing.

## When / when not
- WHEN: multi-workspace or 3+ file tasks; feature-level asks; anything on
  the AGENTS.md ask-first list; requests to parallelize.
- NOT: one-file bugfixes, lookups, tasks that are already a single step.

## Decision table (mechanical)
| Task property | Route to |
|---|---|
| Touches ask-first items (schema, deps, pins) | Plan mode FIRST; present plan; wait for approval |
| Review/audit of sensitive code, no edits needed | security-reviewer subagent (read-only) |
| 3+ files, one workspace, one concern | Single agent, plan mode → build |
| Spans workspaces but changes are sequential (shared types → api → web) | Single agent, ordered phases, context reset between phases if unrelated concerns accumulate (GR-11) |
| Independent workstreams with disjoint file ownership | Parallel subagents, one per ownership zone - verify zero file overlap BEFORE launching (GR-4) |
| Any workstream needs shared-package edits | Do shared-package changes FIRST, alone, merge, THEN parallelize consumers |

## Workflow
1. Restate the task in one sentence; list every file/dir it plausibly
   touches (grep, don't guess).
2. Check the list against AGENTS.md ask-first / never-do. Any hit →
   plan mode, stop before editing.
3. Apply the decision table. Write down the route AND the routes you
   rejected, each with a one-clause reason - the trace is the deliverable
   for future readers.
4. If parallelizing: write the ownership map (agent → exact dirs) and
   confirm intersections are empty. Shared files get a single owner or a
   sequential phase.
5. Each subagent gets: its slice of the brief, its ownership zone, and a
   pointer to AGENTS.md - never a pasted copy of it.
6. Define done per route: which tests must pass, who reviews.

## Gold example (worked, full trace)
Task: "Add booking cancellation: users cancel a paid booking, capacity
frees up, web shows a Cancel button."
1. Touches: packages/shared (status type already has 'cancelled' - verify
   only), services/api (transition paid→cancelled + capacity recount),
   apps/web (button + confirm dialog).
2. Ask-first check: status transitions are ask-first per AGENTS.md → plan
   mode; plan approved with constraint "no schema change, reuse status
   enum."
3. Route considered - parallel web + api agents: REJECTED, web depends on
   the api contract not yet built (sequencing, not true parallelism).
   Route considered - single agent straight to build: REJECTED, spans an
   ask-first item, plan mode mandatory. CHOSEN: single agent, phased
   shared-verify → api → web, reset between api and web phases.
4. Ownership: n/a (single agent, phased).
5. Done: bun test green incl. new transition tests; capacity invariant
   tests untouched (never weaken - AGENTS.md); security-reviewer subagent
   reads the api diff before merge (status transitions = sensitive).

## Reference cards (one hop, read only the one you need)
- `~/agent-toolkit/reference/plan-build.md` - when planning is mandatory and
  the five-part plan artifact.
- `~/agent-toolkit/reference/swarm-launch.md` - the parallel launch
  procedure, ownership map, merge order.
- `~/agent-toolkit/reference/context-reset.md` - reset vs accumulate, and
  what crosses the boundary.
- `~/agent-toolkit/reference/role-design.md` - deriving an allowlist from a
  role's single output.

Pull ONE when the decision table sends you there. Reading all four is the
context flood these cards exist to avoid.

## Failure modes
- Parallel agents with overlapping ownership → GR-4.
- Skipping plan mode on ask-first items → GR-3-adjacent overreach.
- One endless session accumulating all three phases + side quests → GR-11.
```

## Notes for the vault adopter
Deeper pattern treatments this skill routes into:
`orchestration/plan-build-separation.md`,
`orchestration/specialized-subagents.md`,
`orchestration/swarm-parallelism.md`,
`orchestration/context-reset-discipline.md`.

## Unattended / swarm addendum (applies to any tool that runs agents unattended)

Where the tool offers a native parallel primitive (Agent Manager
swarms, worktrees, sessions), the decision table's parallel rows map
onto it - and the ownership map becomes MORE mandatory, not less,
because launching an overlapping swarm is one click. Express each
agent's zone in the strongest mechanism the tool has (scope
declaration, worktree, branch); where none exists, the written map is
the only thing standing between you and GR-4.

## Failure modes (reference-only)
GR-4 (narrative: `orchestration/swarm-parallelism.md`), GR-11 (narrative:
`orchestration/context-reset-discipline.md`), GR-3 (narrative:
`mcp/registry-example-harborline.md`).

## Verifier
`verifiers/trigger-tests/orchestrator.tests.md`.

## Install locations & deltas

This file is CANONICAL: one workflow, one place. Every tool below loads
the fenced payload unchanged unless the Delta column says otherwise.

| Tool | Install path | Delta |
|---|---|---|
| Claude Code | `~/.claude/skills/orchestrator/SKILL.md` (personal) or `.claude/skills/` (project) | none |
| Codex | `~/.codex/skills/orchestrator/SKILL.md` (user) or `.agents/skills/orchestrator/` (project) | none |
| Command Code | `~/.commandcode/skills/orchestrator/SKILL.md` or `.agents/skills/` | none - implements the Agent Skills standard and honors `${{CLAUDE_SKILL_DIR}}`-class aliases, so this file loads as authored |
| Antigravity | `.agents/skills/orchestrator/` (workspace), `~/.gemini/config/` (global) | none - the unattended/swarm addendum above applies wherever swarms run |
| Cursor | `~/.cursor/skills-cursor/{n}/SKILL.md` | none - verified 2026-09-02; also importable from `~/.claude/skills` |
| OpenCode | `tools/opencode/agent/orchestrator.md` | **PORT** - different container (agent `.md`) plus an in-file `permission:` block; workflow identical |
| Others | `tools/generic-adapter.md` | five-slot mapping |

Why one file instead of six: the workflow below is the fact, and a fact
lives in exactly one place (the One Hard Rule). The previous six-port
layout restated it per tool and the parity linter *required* all six -
see GR-19.
