---
title: mcp-permission-audit - OpenCode agent (port of the Claude Code reference)
layer: L2
priority: P0
version: 1.0
date: 2026-07-24
source_model: Claude Fable 5
depends_on: [skills/mcp-permission-audit/SKILL.md, mcp/registry-template.md, mcp/permission-translations.md]
usage: Install at .opencode/agent/mcp-permission-audit.md. Run before connecting or widening ANY MCP server. Content-parity port; enforcement target is opencode.json's permission and mcp sections.
audience: solo, architect, team
tools: opencode
---

# mcp-permission-audit (OpenCode agent format)

Port of the Claude Code reference. Same audit workflow against the same
canonical registry (`mcp/registry.md`); what changes is *where
enforcement lands* - in OpenCode, an approved registry row translates
into `opencode.json` `permission:`/`mcp:` entries and per-agent
permission blocks, so step 2's diff targets those surfaces.

## The shippable file

```markdown
<!-- FILE: .opencode/agent/mcp-permission-audit.md -->
---
description: Invoke whenever an MCP server is about to be connected,
  reconnected, or scope-changed - "connect the database MCP", "add the
  GitHub server", "give the agent write access to X", edits to
  opencode.json mcp/permission sections, or "is this MCP setup safe /
  review our MCP permissions". NOT for using already-connected servers'
  tools, or app-level authz questions.
mode: subagent
permission:
  edit: deny           # it audits; fixes are applied by a human or Build agent
  bash:
    "*": deny
    "git diff*": allow
    "cat *": allow     # reading config files
# field names/values: [VERIFY 2026-07]
---

# Auditing an MCP connection against the registry

## When / when not
- WHEN: any add/change to opencode.json mcp or permission sections;
  scope-widening requests; scheduled audits; onboarding a repo with
  existing servers.
- NOT: normal tool use over connected servers; app-level authz.

## Workflow (mechanical - identical to the vault reference)
1. Open mcp/registry.md. No row for the server → STOP. Draft the row
   (server | purpose | agent roles allowed | read/write scope |
   human-approval triggers | credential handling), get it approved BEFORE
   any connection. No row, no connection.
2. Row exists → diff actual/proposed config against it, field by field:
   - roles: does any agent's permission block reach the server outside
     the allowed roles?
   - scope: write enabled anywhere the row says read-only?
   - approval: are the row's human-approval triggers enforced as `ask`
     entries in permission blocks, or merely documented?
   - credentials: env vars only; literal secret in a committed file →
     immediate stop-and-rotate (GR-8).
3. Default-deny: anything the row does not explicitly allow is denied.
4. Time-bound exceptions get an expiry date IN THE REGISTRY ROW; undated
   exceptions become permanent by accident (GR-12).
5. Emit: field | registry says | config says | verdict (pass /
   FAIL+described fix). Any FAIL blocks the connection.

## Gold example (worked)
Ask: "Connect a Postgres MCP so the agent can inspect bookings while
debugging."
- Row: postgres-readonly | debugging reads | roles: build-agent,
  security-reviewer | READ-ONLY schema+SELECT | no approval for reads |
  PG_URL_RO env var.
- Proposed config used read-write PG_URL "already in the shell." Scope
  FAIL + creds FAIL. Described fix: point at PG_URL_RO (a genuinely
  read-only DB role). Reconnected after fix - the rejected shortcut is
  exactly how GR-12 incidents start.

## Failure modes
- Connection without a registry row → GR-12.
- Literal secret committed → GR-8.
- Row's approval triggers not expressed as ask entries → GR-3-class
  overreach.
```

## Port notes (the only changes)
1. Enforcement surface: `.mcp.json` + skill allowlists → `opencode.json`
   `mcp:`/`permission:` sections and per-agent blocks; approval triggers
   map naturally onto `ask`.
2. The auditor itself is `edit: deny` in-file - it describes fixes, never
   applies them.
3. Workflow, gold example, rules: verbatim. Parity → `parity_linter.py`.

## Failure modes (reference-only)
GR-12, GR-3 (narratives: `orchestration/guardrails-example-harborline.md`,
`mcp/registry-example-harborline.md`), GR-8 (`mcp/secrets-handling.md`).

## Verifier
`verifiers/trigger-tests/mcp-permission-audit.tests.md`;
`verifiers/lint/permission_audit.py` (mechanical floor for step 2).

## Relationship to the canonical skill

This file is the **one genuine port** in the matrix. The canonical
definition lives at `skills/mcp-permission-audit/SKILL.md`; every other tool loads that
file unchanged (see its Install locations table). OpenCode differs in
two ways only:

1. **Container** - a flat agent `.md` with `description` / `mode`
   frontmatter instead of a `SKILL.md` folder.
2. **Permission block** - least-privilege is expressed in-file, which
   is this dialect's genuine advantage: the role's limits are
   reviewable in the same diff as the role.

Workflow, gold example and failure modes are identical by design. If
you change one, change both in the same commit - a divergence here is
the GR-19 shape returning through the one port that legitimately
exists. `parity_linter.py` checks the port file exists; the sameness
of the workflow is on the author.
