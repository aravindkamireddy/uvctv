---
title: Zed - install notes, context_servers, and the matrix's finest permission dialect
layer: L2
priority: P0
version: 1.0
date: 2026-08-11
source_model: Claude Fable 5
depends_on: [skills/skill-writer/SKILL.md, mcp/permission-translations.md, foundation/agents-md-template.md]
usage: Read when adopting the vault with Zed. Zed is a canonical-mode column - the six skills load unchanged - and its per-tool MCP permission syntax is the most expressive in the matrix, so it is worth reading even if you use a different editor.
audience: solo, architect, team
tools: zed
---

# Zed - Install Notes

Zed (v1.4.2+, May 2026) retired its Rules library and replaced it with a
**skills** system built on `SKILL.md` folders; always-on rules moved to
Instructions, including a personal `AGENTS.md` and project instruction files.
Both halves of this vault therefore load natively.

## Capability mapping (verified 2026-08)

| Slot | Zed | Status |
|---|---|---|
| Skill unit | folder containing `SKILL.md`; folder name = skill id; supports `scripts/`, `references/`, `assets/` | canonical, no port |
| Global skills | `~/.agents/skills/` - **flat layout only**; nested folders like `~/.agents/skills/group/my-skill/` are NOT discovered | verified |
| Project skills | `.agents/skills/` in the repo | verified |
| Instructions | `~/.config/zed/AGENTS.md` (personal) + project `AGENTS.md` | verified |
| MCP | `context_servers` in `settings.json` - **not** `mcpServers`; `command` is a string with a separate `args` array | verified |
| Permissions | `agent.tool_permissions.default`: `confirm` (default) or `allow`, plus per-tool rules keyed `mcp:<server>:<tool_name>` | verified |
| Legacy | `.rules` files - superseded by the above | verified |

**Windows settings path:** `%APPDATA%\Zed\settings.json`; `context_servers`
works identically `[VERIFY 2026-08]`.

## Two things Zed does better than the rest of the matrix

**1. Per-tool MCP permissions.** Zed can express exactly the read/write split
`mcp/registry-template.md` demands and most tools cannot:

```jsonc
// settings.json
{
  "agent": {
    "tool_permissions": {
      "default": "confirm",
      "rules": [
        { "tool": "mcp:postgres-readonly:query",  "permission": "allow" },
        { "tool": "mcp:github:list_pull_requests","permission": "allow" }
        // everything else falls through to confirm
      ]
    }
  }
}
```

A registry row saying "READ-ONLY: schema + SELECT" becomes an allow-list of
exactly those tool names, with `confirm` as the floor. This is the strongest
dialect in the matrix - stronger than OpenCode's - and
`mcp/permission-translations.md` records it as such.

**2. Skills cannot be self-modified.** The agent cannot edit `SKILL.md` files
or their bundled resources without explicit authorization, even in a trusted
project, specifically so a compromised conversation cannot modify the skills
that govern future conversations. That is the vault's draft-don't-append gate
(the guardrail-writer design) enforced by the editor. Any future
guardrail-writer skill should integrate with this rather than fight it.

## Constraints that shape installation

- **Flat layout.** Our canonical `skills/<name>/SKILL.md` is already flat -
  one directory per skill, directly under the root. Do not nest.
- **50KB catalog budget** across all skill names and descriptions; skills that
  do not fit are dropped with a warning. Six skills is nowhere near it, but it
  is another reason descriptions stay tight (GR-6's tuning discipline pays
  twice here).
- **No remote registry.** Zed does not load skills from remote locations at
  runtime, and custom search paths are not supported. So the link into
  `~/.agents/skills` is the mechanism - there is no config pointer
  alternative, unlike Command Code.

## Install

`~/.agents/skills` ← linked to `<toolkit>/skills` by the setup script. Note
this is the **same cross-tool path Command Code reads**, so one link serves
both. Project-scoped alternative: commit `.agents/skills/` in the repo, which
is also what makes team standardisation work without config sync.

## Failure modes (reference-only)
Nested skill folders → silently undiscovered → GR-6 shape (narrative:
`verifiers/description-tuning.md`). `tool_permissions.default: "allow"` set
globally to stop prompts → every MCP tool auto-approved → GR-3 (narrative:
`mcp/registry-example-harborline.md`). Community skills installed unread →
GR-20 (narrative: `tools/openclaw/gateway-security.md`).

## Verifier
`verifiers/lint/permission_audit.py` against `settings.json`'s
`context_servers` (add a parser stanza per the generic-adapter L6 rule);
`parity_linter.py` (Zed declared canonical).

## TOOL TRANSFER table

| Tool | Relationship | Notes |
|---|---|---|
| Command Code | shares `~/.agents/skills` | one link serves both |
| Codex, Antigravity | also read `.agents/skills/` at project scope | the emerging cross-tool convention |
| Claude Code | `~/.claude/skills` | separate link |
| Cursor | `~/.cursor/skills-cursor` | separate link; also imports from `~/.claude/skills` |
| OpenCode | the one genuine port | `tools/opencode/agent/` |
| OpenClaw | unrelated locally; the gateway holds its own skills | `tools/openclaw/openclaw-notes.md` |
