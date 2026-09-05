---
title: Codex CLI config.toml template + AGENTS.md tree-walk notes
layer: L2
priority: P0
version: 1.1
date: 2026-07-26
changelog: v1.1 fix-batch B - skills section added; Codex is no longer skill-less
source_model: Claude Fable 5
depends_on: [foundation/agents-md-template.md, foundation/agents-md-example-harborline-root.md]
usage: Codex CLI is the AGENTS.md origin tool - it needs the least tool-specific scaffolding in the matrix. Copy the config block to ~/.codex/config.toml; ship nothing extra in the repo.
audience: solo, architect, team
tools: codex
---

# Codex CLI Configuration - `config.toml` + Tree Walk

Codex CLI originated the `AGENTS.md` format and reads it natively,
walking the directory tree **root → cwd** so the file nearest the working
directory wins - the same nesting-by-placement law as everywhere else in
this vault, and the reason the L1 files need zero adaptation here. The
only tool-specific surface is `config.toml` `[VERIFY 2026-07: all field
names below against current Codex CLI docs - this file rots]`.

## Division of responsibility

| Content | Lives in |
|---|---|
| Commands, pins, ask-first, never-do | `AGENTS.md` (unmodified vault L1 files) |
| Approval/sandbox posture, model, MCP servers | `~/.codex/config.toml` (personal) |
| Per-repo overrides | none needed for harborline - the repo ships only `AGENTS.md` |

That middle row is the whole point: for Codex, the vault's team layer is
*just the L1 files*. No alias file, no skill dirs, no per-repo config.

## The template - `~/.codex/config.toml` (personal layer, filled)

```toml
# FILE: ~/agent-toolkit/codex/config.toml.global   [VERIFY 2026-07: field names]
# Symlinked/copied to ~/.codex/config.toml by install.sh.

# Approval + sandbox posture: the least-privilege default.
# Escalate per-session when a task genuinely needs it - never here.
approval_policy = "on-request"      # agent asks before privileged actions
sandbox_mode    = "workspace-write" # writes confined to the working tree

# MCP servers - connections only; the governing matrix is mcp/registry.md.
# Secrets via env vars per mcp/secrets-handling.md - never literals here.
# [mcp_servers.postgres-readonly]
# command = "..."                    # [VERIFY 2026-07]
# env = { PG_URL = "${PG_URL_RO}" }  # read-only credential per registry row
```

Two postures encode vault law: `approval_policy` is the ask-first list's
enforcement point (Codex has no per-agent allowlists, so approval gating
is where least-privilege lives), and `workspace-write` sandboxing is the
structural floor under the never-do list - a deploy or prod migration
attempted from a session simply has no reach `[VERIFY 2026-07: sandbox
semantics]`.

## Skills (added 2026-07 - see codex-parity-notes.md)

Codex reads `SKILL.md` folders; the vault's canonical skills install
unchanged:

```
~/.codex/skills/<name>/SKILL.md      # user-level, all projects
<project>/.agents/skills/<name>/     # project-level, committed
```

Restart Codex after editing `~/.codex/config.toml`. Implicit invocation
is on by default; `allow_implicit_invocation: false` in a skill's
`agents/openai.yaml` makes it explicit-only (`$skill`) - the right
setting for destructive workflows, mirroring Command Code's
`disable-model-invocation`.

## Tree-walk notes (what to rely on, what not to)

- RELY ON: nearest-file-wins for nested `AGENTS.md` - the harborline
  `apps/web/AGENTS.md` delta applies automatically when working there.
- DO NOT: write conditional prose in root to compensate for anything;
  placement is the conditional (L1 law, unchanged).
- DO NOT: create a Codex-specific instruction file; there is no alias
  filename and no need for one.

## Failure modes (reference-only)
- Approval policy loosened globally "because prompts are annoying" →
  every session runs privileged → GR-3 pattern (narrative:
  `mcp/registry-example-harborline.md`).
- MCP server added to config.toml without a registry row → GR-12.
- config.toml carrying repo commands "for convenience" → GR-5.

## Verifier
`verifiers/lint/permission_audit.py` diffs `[mcp_servers.*]` entries
against `mcp/registry.md`; `staleness_linter.py` checks the `[VERIFY]`
dates.

## TOOL TRANSFER table

| Tool | Equivalent | Notes (2026-07) |
|---|---|---|
| Claude Code | `.mcp.json` + managed settings; approval role played by skill/agent allowlists | `tools/claude-code/claude-md-template.md` |
| OpenCode | `opencode.json` permission block (finer-grained: per-command) | `tools/opencode/opencode-config.md` |
| Antigravity | MCP config + scope isolation | `[VERIFY 2026-07]` |
| Command Code | `/mcp`, `/commands` | `[VERIFY 2026-07]` |
| Stitch / Claude Design | N/A - no repo/CLI config surface |
