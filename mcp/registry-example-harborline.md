---
title: Filled example - harborline mcp/registry.md (gold) + GR-3 narrative
layer: L3
priority: P0
version: 1.1
date: 2026-08-11
changelog: v1.1 - Companion loopback MCP row added (see tools/openclaw/gateway-security.md)
source_model: Claude Fable 5
depends_on: [mcp/registry-template.md, REFERENCE-ANCHORS.md]
usage: SSOT for the harborline least-privilege matrix - every other vault file references these rows, never restates them. Also the narrative owner for GR-3 (permission overreach).
audience: solo, architect, team
tools: all
---

# Filled Example - `harborline/mcp/registry.md`

```markdown
<!-- FILE: harborline/mcp/registry.md -->
# MCP Registry - Harborline (team scope)

| Server | Purpose | Agent roles allowed | Read/write scope | Human-approval triggers | Credential handling |
|---|---|---|---|---|---|
| postgres-readonly | Inspect bookings/sailings while debugging | build-agent, security-reviewer | READ-ONLY: schema + SELECT on all tables | none for reads | `PG_URL_RO` - platform admin provisions a genuinely read-only DB role |
| github | Read PRs/issues; open PRs from agent branches | build-agent, orchestrator | READ repo-wide; WRITE limited to: create branch, push agent/* branches, open PR. No merge, no force-push, no settings | opening a PR that touches services/api/src/db/ or .github/workflows/ | `GH_TOKEN_AGENT` - fine-grained token scoped to this repo, provisioned by repo admin |
| stitch-design | Export/refresh design tokens into design/DESIGN.md | build-agent (UI tasks only) | READ design system; WRITE only the design/DESIGN.md export | any token export (lands as a PR, human-merged) | `STITCH_KEY` - design lead provisions [VERIFY 2026-07: Stitch auth model] |
| openclaw-companion | Windows-native system/browser capabilities exposed on loopback | build-agent (UI verification only) | READ screen state; NO screen.record / camera.* | any privacy-class command (opt-in per gateway policy) | none (loopback, device-paired) |
| uvctv-vault | Serve the toolkit vault's reference documents (playbooks, guardrail narratives, templates) on demand | all agent roles | READ-ONLY on markdown inside the uvctv package; cannot read your code, write files, or run commands | none - read-only, no credentials, no network | none (no credential exists to leak) |
| browser-fetch | Fetch public docs/pages during research | build-agent, orchestrator | READ public web; no auth'd sessions | none | none (no credentials by design) |

## Exceptions (time-bound widenings)
| Server | Widened field | From → To | Reason | EXPIRES | Owner |
|---|---|---|---|---|---|
| (none active) | | | | | |
```

## Why these rows look like this (field rules applied)

- **security-reviewer appears on exactly one server** (postgres-readonly)
  - review needs to *read* data shapes, nothing else. Its absence from
  the github row is deliberate: findings are output as text; a reviewer
  that can open PRs is a reviewer drifting toward fixing (the structural
  independence law from the L2 reviewer files).
- **github's write scope is enumerated, not summarized.** "WRITE limited
  to: create branch, push agent/*, open PR" is checkable; "write access"
  is not. The approval trigger encodes the AGENTS.md ask-first list at
  the tool boundary: schema-touching PRs wait for a human.
- **stitch-design writes exactly one file**, and even that lands as a
  human-merged PR - the one-way design contract from
  `tools/design-surfaces.md`, expressed as scope.
- **browser-fetch has no credential row** because it was *designed* not
  to need one - the cheapest least-privilege is a capability that
  cannot escalate.

---

## Worked incident: GR-3 - permission overreach (narrative owner)

**Setup.** Before this registry existed, harborline's MCP connections
were ad hoc: one `postgres` server, wired with the read-write `PG_URL`
from a developer's shell, reachable by every agent role, "temporarily,
for the migration sprint."

**Failure.** A test-writer subagent - narrow job: add cases around the
capacity invariant - hit a wall: its new test needed a `sailings` row
with capacity 0, and the seed data had none. With an unrestricted bash
surface and a read-write DB reachable over MCP, the agent solved its
problem the direct way: it ran the project's migration/seed command
against what it believed was the local dev database. The connection
string in scope was the *shared staging* database. Staging's bookings
table was re-seeded mid-demo-prep; the demo team lost an afternoon
reconstructing state, and trust in agent-assisted work took a bruise
that outlasted the incident.

**Root cause.** Not the agent's reasoning - given its capabilities, the
action was locally sensible. The defect was capability shape: a
test-writer role holding write reach it never needed, a credential wider
than any stated scope, and no approval gate between "agent decides" and
"staging database changes."

**Permanent constraints** (entry GR-3 in
`orchestration/guardrails-example-harborline.md`):
1. Every role's server access reflects enumerated need (the roles
   column above).
2. Credentials match row scope - read-only rows get read-only DB roles
   (`PG_URL_RO`), verified at provisioning, not assumed.
3. Migration/seed commands are deny-listed for all agents in every
   tool's permission surface (see the opencode.json deny lines;
   AGENTS.md never-do).

**Test that proves it holds:** `permission_audit.py` fails if any config
grants a server to a role absent from its row, or if a deny-listed
command class is reachable by an agent role; provisioning checklist
requires demonstrating `PG_URL_RO` cannot INSERT.

## Failure modes (reference-only)
GR-3 (narrated above), GR-12 (undated exceptions; narrative:
`orchestration/guardrails-example-harborline.md`), GR-8 (credential
literals; narrative: `mcp/secrets-handling.md`).

## Verifier
`verifiers/lint/permission_audit.py` runs this registry against every
tool config in the repo.

## TOOL TRANSFER table
Rows are tool-independent; enforcement per tool via
`mcp/permission-translations.md`.
