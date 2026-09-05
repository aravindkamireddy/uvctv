---
title: mcp-permission-audit - canonical skill (Agent Skills standard)
layer: L2
priority: P0
version: 2.0
date: 2026-07-26
changelog: v2.0 fix-batch D - promoted to the single canonical copy; per-tool ports collapsed (GR-19). Tool-specific swarm deltas absorbed as a universal addendum; install paths verified against each tool's primary docs 2026-07
source_model: Claude Fable 5
depends_on: [mcp/registry-template.md, mcp/registry-example-harborline.md, REFERENCE-ANCHORS.md]
usage: THE canonical definition of this skill. Install the fenced payload at your tool's path (table below). Edit here and nowhere else.
audience: solo, architect, team
tools: all (loads unchanged in Claude Code, Codex, Command Code, Antigravity, Cursor; OpenCode via its agent port)
---

# mcp-permission-audit (Claude Code native format)

Checks any MCP connection - proposed or existing - against the canonical
least-privilege matrix in the MCP registry (project: `mcp/registry.md` (project) / `~/agent-toolkit/shared/mcp-registry.md` (personal); personal: `~/agent-toolkit/shared/mcp-registry.md`) before it goes (or stays)
live. The matrix is the artifact; "the server is connected" is not.

## The shippable file

```markdown
<!-- FILE: .claude/skills/mcp-permission-audit/SKILL.md -->
---
name: mcp-permission-audit
description: Use this skill whenever an MCP server is about to be
  connected, reconnected, or have its scope changed - including "connect
  the database MCP", "add the GitHub server", "give the agent write
  access to X", editing .mcp.json, or the user asking "is this MCP setup
  safe / what can my agents touch". Also use for periodic audits ("review
  our MCP permissions"). Do NOT use for using an already-connected
  server's tools in a task, or for non-MCP permission questions.
---

# Auditing an MCP connection against the registry

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
- WHEN: any add/change to .mcp.json or equivalent; scope-widening
  requests; scheduled audits; onboarding a repo with existing servers.
- NOT: normal tool use over connected servers; app-level authz questions.

## Workflow (mechanical)
1. Open the MCP registry (project: `mcp/registry.md` (project) / `~/agent-toolkit/shared/mcp-registry.md` (personal); personal: `~/agent-toolkit/shared/mcp-registry.md`). If the server has NO row: STOP. Draft the row
   (server | purpose | agent roles allowed | read/write scope |
   human-approval triggers | credential handling) and get it approved
   BEFORE any connection. No row, no connection.
2. If a row exists, diff the actual/proposed config against it, field by
   field:
   - roles: is any agent outside the allowed roles able to reach it?
   - scope: is write enabled anywhere the row says read-only?
   - approval: are the row's human-approval triggers actually enforced
     (tool allow/deny lists, hooks), or merely documented?
   - credentials: env vars only; any literal secret in a committed file
     is an immediate stop-and-rotate (GR-8).
3. Apply the default-deny rule: anything the row does not explicitly
   allow is denied. "It's convenient" is not a field.
4. Time-bound exceptions: a temporary widening gets an expiry date IN THE
   REGISTRY ROW and a linter-visible marker; undated exceptions become
   permanent by accident (GR-12).
5. Emit the audit result as a table: field | registry says | config says |
   verdict (pass / FAIL+fix). Any FAIL blocks the connection.

## Gold example (worked on this repo)
Ask: "Connect a Postgres MCP server so the agent can inspect bookings
while debugging."
1. Registry row exists: postgres-readonly | debugging/read queries |
   roles: build-agent, security-reviewer | READ-ONLY, schema+SELECT |
   approval: none needed for reads | creds: PG_URL_RO env var.
2. Proposed .mcp.json used the read-write PG_URL "because it was already
   in the shell." Diff: scope FAIL (write where row says read-only),
   creds FAIL (wrong var).
3. Fix: point at PG_URL_RO (a genuinely read-only DB role), reconnect.
4. Verdict table emitted; connection allowed after fix. The rejected
   shortcut is exactly how GR-12 incidents start.

## Failure modes
- Connection without a registry row → unauditable scope → GR-12.
- Literal secret in .mcp.json example or commit → GR-8.
- Row exists but approval triggers unenforced → GR-3-class overreach.
```

## Notes for the vault adopter
Registry row format is owned by `mcp/registry-template.md`; the filled
harborline matrix by `mcp/registry-example-harborline.md`. The mechanical
version of step 2's diff is `verifiers/lint/permission_audit.py` - this
skill is the judgment wrapper, the script is the enforcement floor.

## Unattended / swarm addendum (applies to any tool that runs agents unattended)

Every parallel agent inherits the environment's MCP connections unless
per-agent scoping is verified. Two standing rules follow: (1) if the
registry row's roles are narrower than the swarm roster, that is a
FAIL, not a footnote - split the launch or scope per agent; (2) any row
carrying human-approval triggers means that server is DISCONNECTED for
unattended runs, because a swarm cannot ask.

## Failure modes (reference-only)
GR-12 + GR-3 pattern entries (narratives:
`orchestration/guardrails-example-harborline.md`,
`mcp/registry-example-harborline.md`), GR-8 (narrative:
`mcp/secrets-handling.md`).

## Verifier
`verifiers/trigger-tests/mcp-permission-audit.tests.md`;
`verifiers/lint/permission_audit.py`.

## Install locations & deltas

This file is CANONICAL: one workflow, one place. Every tool below loads
the fenced payload unchanged unless the Delta column says otherwise.

| Tool | Install path | Delta |
|---|---|---|
| Claude Code | `~/.claude/skills/mcp-permission-audit/SKILL.md` (personal) or `.claude/skills/` (project) | none |
| Codex | `~/.codex/skills/mcp-permission-audit/SKILL.md` (user) or `.agents/skills/mcp-permission-audit/` (project) | none |
| Command Code | `~/.commandcode/skills/mcp-permission-audit/SKILL.md` or `.agents/skills/` | none - implements the Agent Skills standard and honors `${{CLAUDE_SKILL_DIR}}`-class aliases, so this file loads as authored |
| Antigravity | `.agents/skills/mcp-permission-audit/` (workspace), `~/.gemini/config/` (global) | none - the unattended/swarm addendum above applies wherever swarms run |
| Cursor | `~/.cursor/skills-cursor/{n}/SKILL.md` | none - verified 2026-09-02; also importable from `~/.claude/skills` |
| OpenCode | `tools/opencode/agent/mcp-permission-audit.md` | **PORT** - different container (agent `.md`) plus an in-file `permission:` block; workflow identical |
| Others | `tools/generic-adapter.md` | five-slot mapping |

Why one file instead of six: the workflow below is the fact, and a fact
lives in exactly one place (the One Hard Rule). The previous six-port
layout restated it per tool and the parity linter *required* all six -
see GR-19.
