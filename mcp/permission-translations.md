---
title: Permission translations - one matrix into each tool's native syntax
layer: L3
priority: P0
version: 1.1
date: 2026-08-11
changelog: v1.1 - Zed stanza added as the strongest dialect; OpenClaw node policy noted
source_model: Claude Fable 5
depends_on: [mcp/registry-example-harborline.md, tools/opencode/opencode-config.md, tools/codex/config-toml-template.md]
usage: SSOT for per-tool permission syntax translation patterns. When a registry row changes, this file's patterns tell you what to edit in each tool - in the same commit. Every syntax stanza is [VERIFY]-dated; the translation PRINCIPLES above the stanzas are durable.
audience: solo, architect, team
tools: all
---

# Permission Translations - Matrix → Native Syntax

One least-privilege matrix (`mcp/registry.md`), N enforcement dialects.
This file separates what lasts from what rots:

**Durable (the translation principles):**
1. Every registry field maps to a mechanism or to `UNENFORCED-<tool>` in
   the row - silent gaps are how audits lie.
2. Roles translate to *which agent definition carries which config* -
   a role absent from a server's row must have no path to it.
3. Approval triggers translate to the tool's ask/gate mechanism; where
   no such mechanism exists, to disconnection for unattended runs.
4. Deny beats allow everywhere; wildcards appear only under `ask`/`deny`,
   never under `allow`.

**Perishable (the stanzas below):** exact field names per tool - all
`[VERIFY 2026-07]`, re-checked on tool updates per the staleness cadence.

Worked example throughout: the harborline `github` row - roles:
build-agent, orchestrator | WRITE limited to branch/push agent/* /open
PR | approval: PRs touching db paths or workflows.

---

## Claude Code `[VERIFY 2026-07]`

Mechanisms: `.mcp.json` (connections), skill/agent frontmatter
allowlists (`tools:` / `disallowed-tools:`), hooks (gates), managed
settings.

- Roles: only build-agent-facing skills list the github server's tools;
  `agents/security-reviewer.md` omits them - its allowlist is the role
  boundary.
- Scope: where per-tool granularity is thinner than the row, the
  credential carries the scope (fine-grained `GH_TOKEN_AGENT` with no
  merge permission) - credential-as-scope is the universal fallback.
- Approval: a pre-PR hook matching `services/api/src/db/|.github/
  workflows/` prompts for human confirmation; else `UNENFORCED-claude-code`
  goes in the row.

## Zed `[VERIFY 2026-08]` - STRONGEST DIALECT

Mechanisms: `context_servers` in `settings.json` (connections);
`agent.tool_permissions` with per-tool keys `mcp:<server>:<tool_name>`.

```jsonc
"agent": { "tool_permissions": { "default": "confirm", "rules": [
  { "tool": "mcp:postgres-readonly:query", "permission": "allow" }
]}}
```

A registry row's enumerated read/write scope maps to an allow-list of exactly
those tool names, with `confirm` as the floor - the closest any tool in the
matrix comes to expressing the matrix itself. Displaces OpenCode as the
reference dialect.

## OpenCode `[VERIFY 2026-07]`

Mechanisms: `opencode.json` `mcp:` + `permission:`; per-agent
`permission:` blocks (finest-grained dialect in the matrix).

```jsonc
// per-agent frontmatter, build-agent-class only:
"permission": { "bash": { "git push origin agent/*": "allow",
                          "git push*": "deny" } }
// approval trigger as ask:
//   "gh pr create*": "ask"   when diff touches gated paths - else UNENFORCED note
```
- Roles: the reviewer agent's block simply lacks github reach; the
  orchestrator is `edit: deny` + read-only bash regardless.

## Antigravity `[VERIFY 2026-07]`

Mechanisms: MCP config; `@workspace_scope` (domain isolation, not
tool denial); GUARDRAILS.md as cultural hard stop.
- Roles: thinnest dialect - if per-agent MCP scoping is absent in the
  current release, a server reachable by one swarmed agent is reachable
  by all → the row's roles column must cover the whole swarm roster or
  the server is disconnected for that launch (the swarm rule from the
  L2 audit skill).
- Approval: async swarms cannot ask → any row with approval triggers ⇒
  disconnected for unattended runs. Always. This is principle 3 with no
  softening.

## Codex CLI `[VERIFY 2026-07]`

Mechanisms: `config.toml` `[mcp_servers.*]`; `approval_policy`;
`sandbox_mode`.
- Roles: no per-agent surface - roles collapse to "what this operator's
  sessions may reach"; team role separation is achieved by separate
  config profiles per duty (a review profile with no github server).
- Approval: `approval_policy = "on-request"` gates privileged actions
  globally; path-specific triggers are `UNENFORCED-codex` in the row and
  carried by AGENTS.md ask-first + operator discipline.

## Command Code `[VERIFY 2026-07]`

Mechanisms: `/mcp` (connections), rules layer; per-skill restriction
unknown.
- Translate as Codex-class (global posture + credential-as-scope) until
  verified richer; mark row fields `UNENFORCED-command-code` where no
  mechanism is confirmed. Honest gaps over imagined enforcement.

## Generic (unlisted tools)

Apply principles 1-4 through the five-slot mapping of
`tools/generic-adapter.md` step 1; anything unexpressible →
`UNENFORCED-<tool>` in the row + structural fallback (credential scope,
disconnection, branch isolation).

---

## The one table to keep in your head

| Registry field | Strongest dialect | Universal fallback |
|---|---|---|
| Roles | Zed per-tool keys > OpenCode per-agent blocks | separate config/profile per role |
| Read/write scope | enumerated bash/tool allowlists | credential provisioned at exactly row scope |
| Approval triggers | ask entries / hooks | disconnect for unattended runs |
| Credentials | env vars everywhere | (no fallback - this one is absolute) |

## Failure modes (reference-only)
- Gap papered over instead of marked UNENFORCED → audits report safety
  that isn't there → GR-12 class.
- Translation done once, never updated with the row → GR-2/GR-5 class.
- Wildcard under allow "to reduce prompts" → GR-3 (narrative:
  `mcp/registry-example-harborline.md`).

## Verifier
`verifiers/lint/permission_audit.py` implements the mechanical half of
these translations (config parsers per tool + row diff);
`staleness_linter.py` polices the stanza dates.

## TOOL TRANSFER table
This file IS the transfer table for permission enforcement - per-tool
stanzas above; unlisted tools via the Generic section.
