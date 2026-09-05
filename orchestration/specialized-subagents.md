---
title: Specialized subagents - narrow allowlists, full traces
layer: L4
priority: P1
version: 1.0
date: 2026-07-24
source_model: Claude Fable 5
depends_on: [skills/security-reviewer/SKILL.md, mcp/registry-example-harborline.md, orchestration/plan-build-separation.md]
usage: The pattern behind every role-shaped agent in this vault: capability shape defines the role; the prompt merely describes it. Use when designing any new subagent.
audience: solo, architect, team
tools: all
---

# Specialized Subagents - Narrow Allowlists

A specialized subagent is a role made structural: reviewer, tester,
docs-writer, migrator - each with a tool allowlist cut to its need and
an isolated context cut to its task. The founding claim, proven by GR-3:
**agents act within their capability shape, so shape the capability, not
just the prompt.** A "reviewer" that can edit is a fixer with a
reviewer's system prompt; the prompt loses to the capability every time
it matters.

## The design procedure (mechanical)
1. **Name the role's output.** Findings? Tests? Docs? A migration file?
   One output type per role - a role with two outputs is two roles.
2. **Derive the allowlist from the output**, not from convenience:
   - produces findings → read-only everywhere (reviewer pattern)
   - produces tests → edit scoped to test dirs; run scoped to the test
     command; never touches src (the GR-3 test-writer, redesigned)
   - produces docs → edit scoped to docs paths
   - produces migrations → edit scoped to the migrations dir; NEVER the
     run permission (apply is CI's job per the never-do list)
3. **Express the allowlist in the strongest dialect the tool has**
   (frontmatter lists / `permission:` blocks / scope + branch floor -
   the translation table in `mcp/permission-translations.md`), with the
   generic fallback: deny the destination if you can't deny the act.
4. **Give it an isolated context** containing: the brief slice, its
   zone, pointers to AGENTS.md/registry - never pasted copies (GR-5)
   and never the parent session's accumulated transcript (GR-11).
5. **Write its suite** - invocation cases AND conduct-under-pressure
   cases (the reviewer suite's Class B is the gold pattern: conduct
   failures are unconditional ship-blockers).

## The reference roster (harborline)

| Role | Output | Allowlist essence | Conduct rule under pressure |
|---|---|---|---|
| security-reviewer | findings | read-only + read-effect bash | describes fixes, never applies; fresh pass after any fix (L2 files, all ports) |
| test-writer | tests | edit: tests dirs only; bash: `bun test*`; NO db reach beyond postgres-readonly per its registry role | needs seed data → ASKS; never migrates/seeds (the GR-3 constraint as a role property) |
| docs-writer | docs | edit: docs/ + *.md outside instruction files; instruction files stay human-curated (GR-10) | proposes AGENTS.md changes as findings, never edits them |
| migrator | migration files | edit: src/db/migrations/ only; apply DENIED everywhere | writes the migration; CI applies it; asked to "just run it locally against staging" → declines, cites AGENTS.md never-do |

## Worked trace: designing test-writer (the GR-3 redesign)

1. Output: test cases for the capacity invariant and fare rules.
2. Allowlist derivation - options considered:
   - (a) general build-agent permissions "since tests sometimes need
     fixtures" - REJECTED: this is verbatim the pre-incident shape;
     "sometimes needs" is convenience, and convenience is how GR-3
     happened.
   - (b) read-only like the reviewer - REJECTED: it must write test
     files; a role that can't produce its output isn't narrow, it's
     broken.
   - (c) edit scoped to `**/​*.test.ts` + test fixture dirs; bash scoped
     to `bun test*`; DB access via postgres-readonly per its registry
     row - CHOSEN.
3. The seed-data gap (the exact GR-3 trigger) becomes a *designed
   seam*: needing a capacity-0 sailing, the agent cannot self-serve; it
   emits an ASK ("need fixture: sailing at capacity 0 - add to seed or
   provide factory?"). The human adds a test factory in 5 minutes. The
   incident's 40-minute blast radius becomes a 5-minute conversation -
   that trade is the whole pattern.
4. Suite: invocation (asked for invariant tests → fires), conduct
   ("just seed it yourself, the connection's right there" → declines,
   emits the ASK; structural ports make this unfailable).

## Anti-patterns
- **Role inflation:** "reviewer-and-fixer", "tester-with-migrations" -
  each hyphen reintroduces the risk the split existed to remove.
- **Allowlist by subtraction from full** ("everything except deploy") -
  derive from output (rule 2); subtraction lists rot as tools grow.
- **Shared context across roles** - roles exist partly so contexts stay
  small and single-purpose; piping the parent transcript in re-creates
  GR-11 with extra steps.


## Reference card (extracted into every toolkit)

The full playbook above is a teaching document. What an agent needs
mid-task is the procedure, so this condensed card is what installs -
one hop from the skill that points at it, no narrative.

```markdown
<!-- FILE: ~/agent-toolkit/reference/role-design.md -->
# Designing a role-shaped agent

Agents act within their capability shape. Shape the capability, not just
the prompt - a reviewer that CAN edit is a fixer with a reviewer's prompt.

## Procedure
1. Name the role's ONE output. Findings? Tests? Docs? A migration file?
   Two outputs means two roles.
2. Derive the allowlist FROM the output, never from convenience:
   - produces findings -> read-only everywhere
   - produces tests -> edit scoped to test dirs; never touches src
   - produces docs -> edit scoped to docs paths
   - produces migrations -> edit the migrations dir; NEVER the run
     permission (applying is CI's job)
3. Express it in the strongest dialect the tool has. Generic fallback:
   if you cannot deny the act, deny the destination (review from a
   checkout that cannot push).
4. Isolated context: brief slice + zone + POINTERS. Never the parent
   transcript.
5. Write its suite: invocation cases AND conduct-under-pressure cases.

## The designed seam
When a narrow role hits a wall (a test-writer needing fixture data), it
ASKS. That ask is the design working, not a gap. A 40-minute incident
becomes a 5-minute conversation.

## Anti-patterns
Role inflation ("reviewer-and-fixer"); allowlists derived by subtraction
from full; shared context across roles.
```

## Failure modes (reference-only)
GR-3 (narrative: `mcp/registry-example-harborline.md`); GR-11 via
shared context (narrative: `orchestration/context-reset-discipline.md`);
GR-9 if roles are made ambient rather than routed (narrative:
`verifiers/eval-loop.md`).

## Verifier
Per-role suites (reviewer's is shipped; the roster table's conduct
column is each new suite's Class B seed); `permission_audit.py` checks
every role's DB/MCP reach against its registry row.

## TOOL TRANSFER table
Design procedure is tool-independent; allowlist expression per
`mcp/permission-translations.md`; roles as: subagents (Claude Code),
agent files (OpenCode), scoped skills + branch floor (Antigravity),
config profiles + operator discipline (Codex, per parity notes).
