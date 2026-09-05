---
title: GEMINI.md template - Antigravity instruction layer
layer: L2
priority: P0
version: 1.0
date: 2026-07-24
source_model: Claude Fable 5
depends_on: [foundation/agents-md-example-harborline-root.md, REFERENCE-ANCHORS.md]
usage: Antigravity/Gemini CLI read GEMINI.md instead of AGENTS.md. Keep GEMINI.md a pointer-plus-delta file; never a second copy of AGENTS.md. Antigravity syntax rots fast - every claim here is [VERIFY]-dated.
audience: solo, architect, team
tools: antigravity
---

# `GEMINI.md` Template - Antigravity Layer

Antigravity (and Gemini CLI) use `GEMINI.md` as their instruction-file
alias `[VERIFY 2026-07: whether current versions also read AGENTS.md
natively - if they do, ship no GEMINI.md at all]`. This creates the
vault's one unavoidable duplication pressure: a second instruction
filename in the same repo. The rule for defusing it:

**`GEMINI.md` contains a pointer to `AGENTS.md` plus ONLY
Antigravity-specific deltas.** If the tool will not follow a pointer,
generate `GEMINI.md` *from* `AGENTS.md` mechanically (a build step or
pre-commit hook that copies it with a DO-NOT-EDIT header) - never
hand-maintain two copies. Hand-maintained copies are the GR-5 incident
on a timer.

## The template

```markdown
<!-- FILE: <repo>/GEMINI.md -->
# <Project> - Antigravity notes

Authoritative project rules, commands, pins, ask-first and never-do
lists: see AGENTS.md. Nothing below overrides it.
<!-- If pointer-following is unreliable in the current version, replace
     this section with generated AGENTS.md content, marked:
     AUTO-GENERATED FROM AGENTS.md - DO NOT EDIT  [VERIFY 2026-07] -->

## This repo's Antigravity surface
- Skills (<project>/.agents/skills/): <name> - <one-line when-to-use>
- Swarm zones: parallel agents run under Agent Manager with
  @workspace_scope per ownership zone - zones for this repo: <list dirs>
  <!-- @workspace_scope semantics: [VERIFY 2026-07] -->

## Guardrails
Hard stops live in GUARDRAILS.md (first-class file in this tool's
culture); this file references, never restates, its entries.

## MCP
Connections per the tool's MCP config; the permission matrix governing
them lives in mcp/registry.md. Never widen a scope beyond that matrix.
```

## Filled example - `harborline/GEMINI.md`

```markdown
<!-- FILE: harborline/GEMINI.md -->
# Harborline - Antigravity notes

Authoritative project rules, commands, pins, ask-first and never-do
lists: see AGENTS.md. Nothing below overrides it.

## This repo's Antigravity surface
- Skills (.agents/skills/): skill-writer, orchestrator,
  mcp-permission-audit, security-reviewer - when-to-use per each skill's
  own description.
- Swarm zones for parallel work: apps/web | services/api |
  packages/shared. packages/shared is NEVER a swarm zone - shared
  changes go first, alone, merged, then consumers parallelize
  (GUARDRAILS.md GR-4).

## Guardrails
See GUARDRAILS.md. Non-negotiable here as everywhere: deploys/prod
migrations are CI-only; capacity assertions are never weakened.

## MCP
Matrix: mcp/registry.md. Secrets via env vars only
(mcp/secrets-handling.md).
```

## Failure modes (reference-only)
- Hand-maintained GEMINI.md copy of AGENTS.md → copies drift → GR-5
  (narrative: `verifiers/lint/README.md`).
- Stale generated copy (hook not run) → GR-2 (narrative:
  `foundation/agents-md-template.md`).
- Swarm zones declared but overlapping → GR-4 (narrative:
  `orchestration/swarm-parallelism.md`).

## Verifier
`ssot_linter.py` flags GEMINI.md restating AGENTS.md-owned facts unless
the DO-NOT-EDIT generated header is present; `staleness_linter.py`
compares generated-copy freshness against AGENTS.md mtime.

## TOOL TRANSFER table

| Tool | Equivalent | Notes (2026-07) |
|---|---|---|
| Claude Code | `CLAUDE.md` - same pointer-plus-delta law | `tools/claude-code/claude-md-template.md` |
| OpenCode | `opencode.json` + native AGENTS.md read | `tools/opencode/opencode-config.md` |
| Codex CLI | reads AGENTS.md directly - no alias file needed | `tools/codex/config-toml-template.md` |
| Command Code | rules layer | `[VERIFY 2026-07]` |
| Stitch / Claude Design | N/A - no repo instruction surface |
