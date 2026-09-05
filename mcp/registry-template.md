---
title: mcp/registry.md - canonical format specification
layer: L3
priority: P0
version: 1.0
date: 2026-07-24
source_model: Claude Fable 5
depends_on: [REFERENCE-ANCHORS.md]
usage: The format SSOT for every MCP registry in personal and team layers. Copy the template block to <repo>/mcp/registry.md or ~/agent-toolkit/shared/mcp-registry.md and fill rows. The filled harborline example is the gold reference.
audience: solo, architect, team
tools: all
---

# MCP Registry - Canonical Format

One registry per governance scope (one in each repo, one in the personal
layer). It answers, for every MCP server, the only questions that matter:
what is it for, who may call it, how far can it reach, when must a human
approve, and where do its credentials live. **The matrix is the
deliverable; "the servers are connected" is not** - a connection you
cannot answer those five questions about is GR-12 waiting to be
discovered.

## Row format (the six fields, all mandatory)

```markdown
<!-- FILE: <repo>/mcp/registry.md -->
# MCP Registry - <scope name>

| Server | Purpose | Agent roles allowed | Read/write scope | Human-approval triggers | Credential handling |
|---|---|---|---|---|---|
| <id> | <one line: why this exists> | <explicit role list - never "all"> | <READ-ONLY or the exact write surface> | <actions needing a human, or "none for reads"> | <ENV_VAR name + who provisions it> |

## Exceptions (time-bound widenings)
| Server | Widened field | From → To | Reason | EXPIRES | Owner |
|---|---|---|---|---|---|
```

## Field rules (mechanical)

1. **Server:** a stable id used identically in every tool's config -
   the join key for `permission_audit.py`.
2. **Purpose:** one line. If purpose needs a paragraph, it's two servers
   or an unclear need - split or clarify before connecting.
3. **Agent roles allowed:** named roles from this vault's vocabulary
   (build-agent, security-reviewer, orchestrator, …) or team-defined
   ones. `all` is not a role; writing it means the roles question was
   dodged. Roles reflect NEED, not convenience.
4. **Read/write scope:** default READ-ONLY. A write scope names the
   exact surface ("INSERT into notifications table", "create GitHub
   issues in repo X") - "write access" unqualified fails review.
5. **Human-approval triggers:** the actions that must not fire
   unattended. Must be *enforceable* in each connected tool (ask
   entries, allowlists, disconnection for unattended runs) - a trigger
   that is documented but unenforceable is marked `UNENFORCED-<tool>`
   in the row and treated as a standing finding.
6. **Credential handling:** env-var name only, never a value; note who
   provisions it and at what privilege (a read-only scope backed by a
   read-write credential is a scope in name only - the credential must
   match the row).

## Exceptions table rules
Every widening is a row with an EXPIRES date and an owner. The staleness
linter flags expired rows; an exception without an expiry is rejected at
review (undated exceptions become permanent by accident - GR-12).

## Lifecycle
- New server: row drafted and approved BEFORE first connection (the
  mcp-permission-audit skill's step 1 - no row, no connection).
- Change: row and config change in the same commit (same-commit rule).
- Audit cadence: `permission_audit.py` in CI; human pass quarterly and
  before any unattended-swarm adoption.

## Failure modes (reference-only)
- Connection precedes row → unauditable scope → GR-12 (narrative:
  `orchestration/guardrails-example-harborline.md`).
- Role granted by convenience → GR-3 (narrative:
  `mcp/registry-example-harborline.md`).
- Credential wider than row scope → GR-3/GR-8 boundary (narratives per
  owners).

## Verifier
`verifiers/lint/permission_audit.py` (config ↔ registry diff, exception
expiry); format conformance via `ssot_linter.py` (this file owns the
format; filled registries own their rows; nothing else restates either).

## TOOL TRANSFER table
The registry itself is tool-independent (that is its point). Per-tool
enforcement syntax: `mcp/permission-translations.md`.
