---
title: CLAUDE.md template - Claude Code layering over AGENTS.md
layer: L2
priority: P0
version: 1.0
date: 2026-07-24
source_model: Claude Fable 5
depends_on: [foundation/agents-md-example-harborline-root.md, REFERENCE-ANCHORS.md]
usage: Copy the template block into a repo as CLAUDE.md only when there is genuinely Claude-specific content; otherwise ship no CLAUDE.md at all and let Claude Code read AGENTS.md natively.
audience: solo, architect, team
tools: claude-code
---

# `CLAUDE.md` Template - Claude Code Layer

Claude Code reads `AGENTS.md` natively `[VERIFY 2026-07]`. Therefore the
first question is not "what goes in CLAUDE.md" but **"do we need one at
all?"** Ship `CLAUDE.md` only for content that is (a) Claude-specific and
(b) non-inferable. Everything project-general belongs in `AGENTS.md`; a
`CLAUDE.md` that restates it is a second copy waiting to rot (GR-5).

What legitimately lives here:
- Pointers to this repo's Claude Code surface: which skills exist under
  `.claude/skills/`, which subagents under `.claude/agents/`, when to use
  which.
- Claude-specific operating preferences (plan-mode usage, context-reset
  habits) that other tools can't consume anyway.
- MCP notes specific to Claude Code's `.mcp.json` - as a reference to
  `mcp/registry.md`, never a restated matrix.

## The template

```markdown
<!-- FILE: <repo>/CLAUDE.md -->
# Claude Code notes - <project>

Project rules, commands, pins, ask-first and never-do lists: see
AGENTS.md. It is authoritative; nothing below overrides it.

## This repo's Claude surface
- Skills (.claude/skills/): <name> - <one-line when-to-use> per skill
- Subagents (.claude/agents/): <name> - <one-line role + allowlist summary>

## Operating preferences
- <e.g. Use plan mode before any task touching more than one workspace.>
- <e.g. Reset context between unrelated tasks - see GUARDRAILS.md GR-11.>

## MCP
Connections are defined in .mcp.json; the permission matrix governing them
lives in mcp/registry.md. Never widen a scope beyond that matrix.
```

## Filled example - `harborline/CLAUDE.md`

```markdown
<!-- FILE: harborline/CLAUDE.md -->
# Claude Code notes - Harborline

Project rules, commands, pins, ask-first and never-do lists: see
AGENTS.md. It is authoritative; nothing below overrides it.

## This repo's Claude surface
- Skills (.claude/skills/):
  - skill-writer - authoring a NEW skill for this repo; fires on "make a
    skill/automate this workflow", not on using existing skills.
  - orchestrator - decomposing multi-workspace tasks and routing to
    subagents; fires on tasks spanning web + api or 3+ files.
  - mcp-permission-audit - run BEFORE connecting or widening any MCP
    server; checks .mcp.json against mcp/registry.md.
- Subagents (.claude/agents/):
  - security-reviewer - read-only review of diffs touching bookings,
    payments status transitions, or the capacity invariant. Never edits.

## Operating preferences
- Plan mode first for anything touching services/api/src/db/ (schema is
  ask-first per AGENTS.md).
- One task per session for migrations and dependency updates; reset
  context after (GR-11).

## MCP
Connections are defined in .mcp.json; the permission matrix governing them
lives in mcp/registry.md. Never widen a scope beyond that matrix.
```

Note the fill contains **zero** commands, zero pins, zero token values -
every project fact is a pointer. The only original content is the routing
map of this repo's Claude-specific assets.

## Failure modes (reference-only)
- Commands copied in "for convenience" → GR-5 (narrative:
  `verifiers/lint/README.md`).
- Restating architecture → GR-10 (narrative:
  `foundation/agents-md-counterexample-bloated.md`).

## Verifier
`ssot_linter.py` treats `CLAUDE.md` as a reference-only toucher of every
`AGENTS.md`-owned fact class.

## TOOL TRANSFER table

| Tool | Equivalent asset | Notes (2026-07) |
|---|---|---|
| OpenCode | `opencode.json` + `AGENTS.md` carry the same layering; agent routing map lives in `.opencode/agent/` frontmatter | `tools/opencode/opencode-config.md` |
| Antigravity | `GEMINI.md` plays this role | `tools/antigravity/gemini-md-template.md` `[VERIFY 2026-07]` |
| Codex CLI | N/A - no tool-specific layer file; anything Claude-specific here simply has no Codex analogue, and shared content is already in `AGENTS.md` | `tools/codex/codex-parity-notes.md` |
| Command Code | rules layer `[VERIFY 2026-07]` | `tools/command-code/command-code-skills.md` |
| Stitch / Claude Design | N/A - do not read repo instruction files | `tools/design-surfaces.md` |
