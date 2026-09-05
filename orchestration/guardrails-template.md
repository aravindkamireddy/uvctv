---
title: GUARDRAILS.md - entry format specification
layer: L4
priority: P1
version: 1.0
date: 2026-07-24
source_model: Claude Fable 5
depends_on: [REFERENCE-ANCHORS.md]
usage: Format SSOT for guardrails files in both layers (team GUARDRAILS.md, personal shared/GUARDRAILS.md). Copy the template block; the filled harborline example is the gold reference.
audience: solo, architect, team
tools: all
---

# GUARDRAILS.md - Entry Format

A guardrails file is where failure patterns become permanent constraints
instead of re-litigated prose. Its governing idea: **the agent got stuck
in this exact loop once; it never gets to do that again** - not because
anyone remembers, but because the constraint is written, tested, and
loaded into every session.

## Entry format (the six fields, all mandatory)

```markdown
<!-- FILE: <repo>/GUARDRAILS.md -->
# Guardrails - <scope>

Entries are permanent. Removing one requires the same review rigor as
removing a test - and the same suspicion.

| GR-ID | Date | The exact loop/failure observed | The permanent constraint | Tools it applies to | Test that proves the constraint holds |
|---|---|---|---|---|---|
```

## Field rules (mechanical)

1. **GR-ID:** minted in the anchors registry first, never here - the
   registry owns definitions and narrative assignment (one-narrative
   rule); this table owns the *constraint* form. New incident → new ID
   at the source, then the row lands here.
2. **Date:** when observed, not when written up - decay analysis needs
   the real timeline.
3. **The exact loop/failure:** one or two sentences, concrete and
   specific ("agent re-applied the same failing fix to X for 40
   minutes"), never a category name ("agent got confused"). If you
   can't state the exact loop, you haven't understood the incident
   enough to constrain it.
4. **The permanent constraint:** imperative, checkable, and phrased so
   a weak model can obey it mechanically ("never run db:migrate;
   deny-listed in every tool config"), never aspirational ("be careful
   with migrations").
5. **Tools it applies to:** explicit list or `all`. A constraint that
   only bites in one tool's primitive says so - porting guardrails
   blindly creates noise that erodes trust in the file.
6. **Test that proves it holds:** the row's teeth - a linter rule, a
   suite case, a CI check, or a structural fact ("reviewer has no push
   access") that would FAIL if the constraint were violated. A row
   without a test is a wish; it gets `TEST-PENDING` and a standing
   review flag, never silence.

## Governance (differs by layer - the only thing that does)
- **Team:** PR-reviewed like code. A bad guardrail steers every
  teammate's agent; a removed one un-learns a paid-for lesson.
- **Personal:** self-trust suffices; loose versioning. Its character is
  a "mistakes my agents keep making" log - lower ceremony, same format,
  so entries can graduate to team files without rewriting.

## Anti-patterns
- Narratives in the table. The table is compact constraint entries; each
  GR-ID's single worked narrative lives in its owner file per the
  anchors registry. A table that tells stories stops being scannable at
  session-load time.
- Duplicate near-miss entries. A recurrence of an existing GR pattern
  updates that row's date/test, or mints a NEW id if the loop is
  genuinely distinct - never both-ish.
- Constraint drift: editing a constraint without re-running its test.

## Failure modes (reference-only)
Recurring failure re-litigated in chat instead of landed here → the
file's founding disease; entries without tests → enforcement theater
(GR-5-class trust rot); narratives duplicated into the table →
one-narrative rule violation.

## Verifier
`ssot_linter.py` (this file owns the format; filled files own rows;
narratives stay with their owners); row-test existence checked in
review via field rule 6.

## TOOL TRANSFER table
Format is tool-independent. Loading differs: Claude Code/OpenCode/Codex
load via instruction-file reference; Antigravity treats GUARDRAILS.md
as first-class natively `[VERIFY 2026-07]`; unlisted tools per
`tools/generic-adapter.md` (instruction layer or session preamble).
