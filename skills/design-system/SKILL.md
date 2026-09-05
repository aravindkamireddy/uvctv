---
title: design-system - canonical skill (Agent Skills standard)
layer: L2
priority: P0
version: 2.0
date: 2026-07-26
changelog: v2.0 fix-batch D - promoted to the single canonical copy; per-tool ports collapsed (GR-19). Tool-specific swarm deltas absorbed as a universal addendum; install paths verified against each tool's primary docs 2026-07
source_model: Claude Fable 5
depends_on: [REFERENCE-ANCHORS.md, design/design-md-example-harborline.md, design/design-review-workflow.md]
usage: THE canonical definition of this skill. Install the fenced payload at your tool's path (table below). Edit here and nowhere else.
audience: solo, architect, team
tools: all (loads unchanged in Claude Code, Codex, Command Code, Antigravity, Cursor; OpenCode via its agent port)
---

# design-system (Claude Code native format)

The component set is CLOSED - that is what makes it a system. This
skill fires when component-level work happens and enforces one law:
**compose from the set, or escalate to change the set; never invent
inline.** The ui-ux-designer skill designs screens; this one guards the
vocabulary those screens are written in.

## The shippable file

```markdown
<!-- FILE: .claude/skills/design-system/SKILL.md -->
---
name: design-system
description: Use this skill whenever creating, modifying, or reviewing
  UI components - "add a button/input/card", "we need a component for
  X", "tweak the SailingCard", "add a variant", "why do we have two
  different cards" - and whenever a diff under the web app's component
  dirs is being written or reviewed. Also use when someone proposes a
  new component or variant. Do NOT use for page-level flow/layout work
  (ui-ux-designer's job) or for changing token VALUES.
---

# Working inside the component contract

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
- WHEN: component create/modify/review; variant proposals; component
  dedup questions; any diff in component dirs.
- NOT: page composition (ui-ux-designer), token values (design review).

## The law (mechanical)
1. **The set is what DESIGN.md says it is.** Before any component work,
   read the component section. Current set and variants are the closed
   vocabulary; anything else does not exist yet.
2. **Need not covered → ESCALATE, never invent.** Write the proposal as
   a finding: what's needed, why no existing component/variant covers
   it (show the nearest one and the gap), what the addition would be.
   It lands as a design-review PR on DESIGN.md. Only after that merges
   does the component exist to build.
3. **Modification = contract change too.** Changing a component's
   behavior/variants edits its DESIGN.md entry in the same PR as the
   code (same-commit rule, applied to the design contract).
4. **Every component ships its a11y obligations** from the contract's
   baseline: keyboard path, focus token, associated labels,
   state-not-by-color-alone. A component missing these is incomplete,
   not "pending polish" (GR-13).
5. **Dedup on sight.** Two components doing one job is a finding even
   if both work - name the survivor, migrate, delete.

## Gold example (worked, full trace)
Task: "The waitlist join needs a small inline notice - add a
subtle-warning Button variant for it."
1. Set check: Button variants are primary / danger / ghost. CLOSED.
2. Options: (a) add subtle-warning inline "it's tiny": REJECTED - this
   is verbatim the GR-15 opening move; tiny is how seven variants
   happen. (b) is a Button even the right element? The need is a
   NOTICE (informational state), not an action - REJECTED as a Button
   problem entirely. (c) CapacityBadge already renders informational
   state with the three-state icon+text pattern; the waitlist notice is
   a fourth INFORMATIONAL state, not a fourth Button: CHOSEN direction.
3. Escalation written (rule 2): proposal = extend CapacityBadge with a
   'waitlisted' state (icon + text, color-muted), DESIGN.md entry
   drafted, nearest-component gap shown. Design review merged it; THEN
   the build task proceeded against the amended contract.
4. Outcome: zero new components, one reviewed state addition, Button
   still has three variants - and the notice is accessible by
   construction because the badge pattern already carries icon+text.

## Failure modes
- Inline variant invention → GR-15.
- Component change without its DESIGN.md entry → contract drift
  (GR-5-class at the design layer).
- "Pending polish" a11y → GR-13.
```

---

## Worked incident: GR-15 - variant proliferation (narrative owner)

**Setup.** Pre-contract-discipline, a task needed a softer emphasis
than the danger Button for a non-destructive-but-important action. The
agent, reasonably, added a `subtle-warning` variant inline - eight
lines, shipped, worked.

**Failure.** The variant's existence was its own advertisement. The
next agent, seeing four variants, inferred the set was open and added
`success` for a confirmation state; a third added `subtle-success` to
match the earlier softness precedent; a fourth, unable to tell
`subtle-warning` from `ghost`-with-orange-text in an existing screen,
added `outline-warning` to be safe. Three tasks, seven variants, and
the actual damage was epistemic: **nobody - human or agent - could
answer "which Button do I use here" from the contract anymore**,
because the contract no longer described reality. Screens diverged in
emphasis semantics; the eventual consolidation audit took a day and a
half and had to make judgment calls about live screens' intent that
the original eight-line diff had silently pre-empted.

**Root cause.** Not the first variant's design - it was arguably
right. The defect was the *channel*: a contract change made as an
implementation detail, invisible to review, teaching every subsequent
reader that the set was open. Closed sets stay closed only if the
opening move is expensive enough to be deliberate.

**Permanent constraints** (this skill's rules 1-3; GUARDRAILS entry
GR-15): components and variants exist only via DESIGN.md; needs the
set doesn't cover escalate as findings; component diffs without
matching contract entries are review blocks.

**Test that proves it holds:** design-system suite case - the gold
example's ask ("add a subtle-warning variant") must produce an
escalation, not a variant; a planted component diff with no DESIGN.md
change in the same PR must be flagged in review.

## Unattended / swarm addendum (applies to any tool that runs agents unattended)

Contract changes are never swarm-zone work. A mid-swarm DESIGN.md edit
invalidates every parallel agent's anchor simultaneously (GR-4's shape
at the design layer). Escalations raised during a swarm queue in the
handoff; the swarm completes against the CURRENT contract; design
review runs after the merge order finishes.

## Failure modes (reference-only)
GR-15 (narrated above), GR-13 (narrative:
`design/design-md-template.md`), GR-7, GR-5 pattern at the design
layer.

## Verifier
`verifiers/trigger-tests/design-system.tests.md`;
`verifiers/lint/a11y_linter.py` (rule 4's mechanical floor on contract
files); review rule from constraint 3.

## Install locations & deltas

This file is CANONICAL: one workflow, one place. Every tool below loads
the fenced payload unchanged unless the Delta column says otherwise.

| Tool | Install path | Delta |
|---|---|---|
| Claude Code | `~/.claude/skills/design-system/SKILL.md` (personal) or `.claude/skills/` (project) | none |
| Codex | `~/.codex/skills/design-system/SKILL.md` (user) or `.agents/skills/design-system/` (project) | none |
| Command Code | `~/.commandcode/skills/design-system/SKILL.md` or `.agents/skills/` | none - implements the Agent Skills standard and honors `${{CLAUDE_SKILL_DIR}}`-class aliases, so this file loads as authored |
| Antigravity | `.agents/skills/design-system/` (workspace), `~/.gemini/config/` (global) | none - the unattended/swarm addendum above applies wherever swarms run |
| Cursor | `~/.cursor/skills-cursor/{n}/SKILL.md` | none - verified 2026-09-02; also importable from `~/.claude/skills` |
| OpenCode | `tools/opencode/agent/design-system.md` | **PORT** - different container (agent `.md`) plus an in-file `permission:` block; workflow identical |
| Others | `tools/generic-adapter.md` | five-slot mapping |

Why one file instead of six: the workflow below is the fact, and a fact
lives in exactly one place (the One Hard Rule). The previous six-port
layout restated it per tool and the parity linter *required* all six -
see GR-19.
