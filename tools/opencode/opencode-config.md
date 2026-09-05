---
title: OpenCode configuration - opencode.json + AGENTS.md wiring
layer: L2
priority: P0
version: 1.0
date: 2026-07-24
source_model: Claude Fable 5
depends_on: [foundation/agents-md-example-harborline-root.md, mcp/permission-translations.md, REFERENCE-ANCHORS.md]
usage: The OpenCode analogue of the CLAUDE.md layering pattern. Copy the config block into a repo as opencode.json; keep every project fact in AGENTS.md.
audience: solo, architect, team
tools: opencode
---

# OpenCode Configuration Layer

OpenCode reads `AGENTS.md` natively and layers `opencode.json` on top for
tool-specific config: agent definitions, permission blocks, MCP wiring.
Same layering law as every tool: **config references project facts, never
restates them.** All syntax in this file dated 2026-07 and `[VERIFY]` -
OpenCode's config schema moves fast; re-check against current docs before
shipping.

## Division of responsibility

| Content | Lives in |
|---|---|
| Commands, pins, ask-first, never-do | `AGENTS.md` (SSOT: see filled harborline root) |
| Agent roster + permission blocks | `opencode.json` + `.opencode/agent/*.md` |
| MCP connections | `opencode.json` MCP section - scopes governed by `mcp/registry.md` |
| Primary-agent split | Built in: `Build` (edits) / `Plan` (research, no edits) - this native split IS the plan/build separation pattern; do not rebuild it |

## The template - `harborline/opencode.json` (filled)

```jsonc
// FILE: harborline/opencode.json   [VERIFY 2026-07: field names against current OpenCode schema]
{
  "$schema": "https://opencode.ai/config.json",
  // Project facts intentionally absent - AGENTS.md is authoritative.
  "permission": {
    // Repo-wide defaults for the Build agent; per-agent overrides live in
    // .opencode/agent/*.md frontmatter.
    "edit": "allow",
    "bash": {
      "*": "ask",
      "bun test*": "allow",
      "bun run lint": "allow",
      "bun run build": "allow",
      "git diff*": "allow",
      "git log*": "allow",
      "bun run deploy": "deny",      // never-do: deploys are CI-only (AGENTS.md)
      "bun run db:migrate": "deny"   // never-do vs prod; local dev DB via ask (AGENTS.md)
    }
  },
  "mcp": {
    // Connections only; the least-privilege matrix is mcp/registry.md.
    // Secrets via env vars per mcp/secrets-handling.md - never literals.
  }
}
```

Note the deny lines encode the two harborline never-do items as *machine
enforcement*, not prose - the config is where AGENTS.md's never-do list
grows teeth in this tool. The allow-list of exact commands comes from
AGENTS.md by reference; if a command changes there, this file changes in
the same commit (same-commit rule, GR-2).

## Custom agents

The four core primitives install as markdown files under
`.opencode/agent/` (project) or `~/.config/opencode/agent/` (personal):
`skill-writer.md`, `orchestrator.md`, `mcp-permission-audit.md`,
`security-reviewer.md` - each in this vault's `tools/opencode/agent/`.
Built-in subagents (`General`, `Explore`, `Scout`) remain for generic
delegation; the custom four add the vault's disciplined roles.

## Failure modes (reference-only)
- Commands restated into config comments/prose → GR-5.
- Permission block widened ad hoc without a registry row → GR-12.
- Deny lines drifting from AGENTS.md never-do list → GR-2.

## Verifier
`verifiers/lint/permission_audit.py` diffs the `permission` block and MCP
section against `mcp/registry.md`; `staleness_linter.py` checks the
`[VERIFY]` date.

## TOOL TRANSFER table

| Tool | Equivalent | Notes (2026-07) |
|---|---|---|
| Claude Code | `CLAUDE.md` + `.mcp.json` + skill/agent frontmatter allowlists | `tools/claude-code/claude-md-template.md` |
| Antigravity | `GEMINI.md` + Agent Manager config | `tools/antigravity/gemini-md-template.md` `[VERIFY 2026-07]` |
| Codex CLI | `config.toml` | `tools/codex/config-toml-template.md` |
| Command Code | rules layer + `/mcp`, `/commands` | `[VERIFY 2026-07]` |
| Stitch / Claude Design | N/A - no repo config surface |
