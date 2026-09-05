---
title: Filled example - harborline GUARDRAILS.md (gold) + GR-1, GR-12 narratives
layer: L4
priority: P1
version: 1.0
date: 2026-07-24
source_model: Claude Fable 5
depends_on: [orchestration/guardrails-template.md, REFERENCE-ANCHORS.md]
usage: SSOT for the compact constraint entries of all 12 GR-IDs - every other file references entries here, never restates them. Narrative owner for GR-1 (context-drift loop) and GR-12 (MCP write-scope surprise); the other ten narratives live with their owners per the anchors registry.
audience: solo, architect, team
tools: all
---

# Filled Example - `harborline/GUARDRAILS.md`

```markdown
<!-- FILE: harborline/GUARDRAILS.md -->
# Guardrails - Harborline (team scope; PR-reviewed like code)

Entries are permanent. Removing one requires the same review rigor as
removing a test - and the same suspicion.

| GR-ID | Date | The exact loop/failure observed | The permanent constraint | Tools | Test that proves it holds |
|---|---|---|---|---|---|
| GR-1 | 2026-02-11 | Agent re-applied the same failing capacity-check fix to services/api for 40+ min; each retry re-read its own prior broken diff as context | Two consecutive failed attempts at the same fix → STOP, write a failure note, reset context, re-approach from the note - never from the polluted transcript | all | Session logs sampled in retro: no fix attempted >2x in one context |
| GR-2 | 2026-01-30 | AGENTS.md listed retired `npm run verify`; agent spent a session "repairing" the toolchain | Same-commit rule: a change invalidating an instruction line updates it in that commit; commands cross-checked against package.json scripts | all | staleness_linter fails on any AGENTS.md command absent from scripts |
| GR-3 | 2026-03-04 | Test-writer subagent with unrestricted bash + rw DB credential re-seeded shared staging | Roles get enumerated need only; credentials match row scope; migrate/seed deny-listed for all agents in every tool config | all | permission_audit fails on role-outside-row; PG_URL_RO INSERT test fails at provisioning |
| GR-4 | 2026-03-19 | Two parallel agents both edited packages/shared types; 3-way merge destroyed a fare rule | packages/shared is never a swarm zone; parallel launches require a written ownership map with empty intersections | all | Orchestrator suite case 9; swarm-branch review flags out-of-zone files |
| GR-5 | 2026-02-25 | Commands copied into CLAUDE.md; rename updated AGENTS.md only; intermittent dead-command sessions for a month | One Hard Rule: tool-layer files are reference-only for AGENTS.md-owned facts | all | ssot_linter fails on planted command string in CLAUDE.md |
| GR-6 | 2026-04-02 | Deploy-checklist skill described as "deployment checklist helper"; zero fires in six weeks; release shipped without its checks | Descriptions written FROM collected user phrasings and carry them verbatim; untested description assumed to under-trigger | skill-bearing tools | Suite fires on "prep the release" / "ready to ship"; original description kept as failing regression fixture |
| GR-7 | 2026-04-15 | Agent hardcoded three near-identical blues in apps/web instead of reading DESIGN.md | Token values live only in design/DESIGN.md; components consume tokens; hex/px literals in UI diffs are findings | all | Lint/review: hex-literal grep on apps/web diffs; ssot_linter token class |
| GR-8 | 2026-03-27 | Real token pasted into setup docs; agent faithfully reproduced it into a second file; 11 days exposed | Committed files carry env-var references only; placeholders obviously fake; leak response = rotate first | all | CI secret-scan fails planted realistic token; permission_audit reference check |
| GR-9 | 2026-04-21 | Ambient "review-everything" skill fired every turn; context flooded; task success dropped below no-skill baseline | Heavyweight procedures ship as deliberately-invoked subagents; every suite carries ≥3 should-NOT boundary cases | skill-bearing tools | parity_linter suite floor; reviewer suite cases 8-10 stay quiet |
| GR-10 | 2026-01-22 | Generated AGENTS.md restated the codebase, omitted the zod pin; misled a route implementation AND allowed a v4 bump | Generated instruction files are drafts, marked, and may not merge until the trimming checklist passes | all | staleness_linter fails on committed draft marker |
| GR-11 | 2026-05-06 | One session accumulated three unrelated tasks; quality decayed until forced reset | One concern per session for migrations/dep-updates; reset context between unrelated tasks; two-strikes rule feeds GR-1 | all | Retro sampling: no session spans >2 unrelated concerns |
| GR-12 | 2026-05-20 | DB MCP server connected read-write "temporarily" discovered months later by audit, still write-enabled | No row, no connection; every widening is an exceptions-table row with EXPIRES + owner | all | permission_audit fails unrowed servers, undated and expired exceptions |
```

Note what the table is NOT: no stories. Twelve scannable rows load into
every session; the twelve narratives live one-each with their owner
files (anchors registry §3 is the map). Two of those owners are this
file - below.

---

## Worked incident: GR-1 - context-drift edit loop (narrative owner)

**Setup.** A routine task: "the capacity check double-counts held
bookings that were cancelled in the same request - fix it." The agent's
first fix adjusted the SQL sum's WHERE clause. Tests failed - one
unrelated-looking fares snapshot plus the target test.

**Failure.** The agent read the failure, "refined" the WHERE clause,
re-ran, failed again, refined again - eleven attempts over ~40 minutes,
each a small mutation of the same wrong idea. The mechanism is the
insidious part: with every retry, the context window filled further with
its own broken diffs, error output, and self-commentary, so each new
attempt reasoned *from an increasingly polluted picture of the file* -
by attempt seven it was editing to reconcile with its own hallucinated
version of the function, and the diffs began *reverting each other*.
The actual bug was one abstraction level up: the recount ran before the
same-request cancellation was committed - no WHERE clause could fix an
ordering bug. A human spotted it in four minutes *from a clean read of
the code*, which is precisely what the agent no longer had.

**Root cause.** Not the wrong first hypothesis - wrong first hypotheses
are normal. The defect was the absence of a stopping rule: nothing
distinguished "iterating" from "looping," and accumulation made each
iteration worse while feeling like progress.

**Permanent constraint** (row GR-1 above): two consecutive failures of
the *same* fix idea → STOP, write a three-line failure note (what was
tried, what failed, current hypothesis), reset context, re-approach
from the note and clean files - never from the transcript. The note is
the bridge; the reset is the cure (the fuller reset discipline is
GR-11's subject, in `orchestration/context-reset-discipline.md`).

**Test that proves it holds:** retro sampling of session logs - any fix
idea attempted more than twice within one context is a process failure
regardless of eventual outcome.

## Worked incident: GR-12 - the MCP write-scope surprise (narrative owner)

**Setup.** During an early data-model sprint - before the registry
existed - a Postgres MCP server went in read-write "for the sprint, so
the agent can fix seed data directly." The sprint ended; the connection
didn't. There was nowhere the widening was *written*, so there was
nothing to expire, revisit, or even remember.

**Failure.** Five months later, the first pass of the new
mcp-permission-audit skill inventoried live connections and found it:
a write-enabled database server reachable by every agent role, in daily
use for reads, its write capability intact and unexercised the whole
time - probably. "Probably" was the actual cost: proving nothing had
written required trawling five months of DB audit logs, and the review
consumed more engineering time than the original sprint convenience had
saved, multiplied severally. Nothing bad had happened; the team had
simply been unable to *know* that, for five months, at write-blast
radius.

**Root cause.** Not the widening - sprints legitimately need scope.
The defect was that the exception lived in a shell environment and a
teammate's memory instead of a dated row. Undocumented exceptions don't
expire; they fossilize.

**Permanent constraint** (row GR-12 above): no row, no connection;
every widening is an exceptions-table row with EXPIRES and an owner;
the auditor flags expiry mechanically so reverting is a calendar event,
not an act of remembering.

**Test that proves it holds:** `permission_audit.py` fixture run -
unrowed server, undated exception, and expired exception each produce a
finding (verified in the vault's linter smoke tests).

## Failure modes (reference-only)
Rows restated into other files → GR-5; narratives copied into the
table → one-narrative violation; constraints edited without re-running
their tests → template anti-pattern 3.

## Verifier
`ssot_linter.py` (this file owns rows); each row's own test column;
`permission_audit.py` and `staleness_linter.py` cover six of the twelve
mechanically.

## TOOL TRANSFER table
Per the template: format universal; loading per tool's instruction
layer; Antigravity native `[VERIFY 2026-07]`.
