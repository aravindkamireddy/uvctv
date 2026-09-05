---
title: Personal shared/mcp-registry.md - starter template
layer: L7
priority: P1
version: 1.0
date: 2026-07-24
source_model: Claude Fable 5
depends_on: [mcp/registry-template.md, mcp/secrets-handling.md, personal-layer/tree.md]
usage: Copy to ~/agent-toolkit/shared/mcp-registry.md. Row format identical to the team registry (format SSOT unchanged); scope philosophy differs - broader grants, same paper trail.
audience: solo, architect
tools: all
---

# Personal `shared/mcp-registry.md` - Starter

Same six-column row format as any registry (format SSOT:
`mcp/registry-template.md`); what changes at personal scope is the
*grant philosophy*, not the discipline. Permissive personal credentials
are legitimate - it's your machine, your data, your blast radius. The
non-negotiables survive the trip home: **no row, no connection** and
**env-var references only** (GR-8's private-repos-get-cloned lesson).

## The starter file

```markdown
<!-- FILE: ~/agent-toolkit/shared/mcp-registry.md -->
# MCP Registry - personal (this machine's agents)

| Server | Purpose | Agent roles allowed | Read/write scope | Human-approval triggers | Credential handling |
|---|---|---|---|---|---|
| filesystem-home | Read/write my project dirs | all personal sessions | RW under ~/projects; NEVER ~/.ssh, ~/agent-toolkit/shared credentials-adjacent paths | none | none (path scoping IS the control) |
| github-personal | My repos: read, branch, PR | all personal sessions | READ all my repos; WRITE branch/push/PR on repos I own; no org repos | anything touching an org repo → use that org's team registry instead | `GH_TOKEN_PERSONAL` - fine-grained, self-provisioned, no org grants |
| browser-fetch | Docs/research fetches | all personal sessions | READ public web | none | none |
| postgres-local | Local dev DBs only | all personal sessions | RW on localhost databases only | none locally; this row NEVER covers a remote host | `PG_URL_LOCAL` - localhost connection string via env |

## Exceptions (time-bound widenings)
| Server | Widened field | From → To | Reason | EXPIRES | Owner |
|---|---|---|---|---|---|
| (none active) | | | | | |
```

## Personal conventions (the deltas from team philosophy)

1. **"all personal sessions" is a legitimate role here** - the roles
   column exists to force the question, and at personal scope the
   honest answer is often "everything I run." Writing it keeps the
   column truthful instead of ceremonial; the moment a narrower answer
   is true (a reviewer profile, an unattended job), write that instead.
2. **Boundaries are drawn at blast-radius cliffs, not convenience:**
   localhost vs remote (postgres-local's hard edge), own repos vs org
   repos (github-personal's), project dirs vs credential dirs
   (filesystem-home's). Broad within the cliff, absolute at it.
3. **Work leaks are the threat model.** The org-repo trigger row exists
   because the realistic personal-registry failure is a personal
   session reaching into work resources with personal-grade
   permissiveness - route those to the team registry that governs them.
4. **Unattended personal jobs get team-grade rows.** The moment
   something runs while you sleep (a cron'd agent, a scheduled swarm),
   "I'm watching it" stops being a control - re-row it as if it were a
   teammate.
5. **Audit habit, personal cadence:**
   `python3 permission_audit.py --registry shared/mcp-registry.md ~/agent-toolkit`
   whenever install.sh runs - piggyback the habit on an existing one.

## Failure modes (reference-only)
Unrowed "temporary" personal server → GR-12 as trained habit (seed
entry P-3 in the personal guardrails); realistic-looking values in this
file → GR-8; personal session in org resources → convention 3's leak,
GR-3 at work's expense.

## Verifier
`permission_audit.py` per convention 5; the exceptions table's EXPIRES
discipline unchanged from the format SSOT.

## TOOL TRANSFER table
Per the registry template: rows tool-independent; enforcement per
`mcp/permission-translations.md`, applied to personal-scope configs
(`~/.codex/config.toml`, personal `.mcp.json`, etc.).
