---
title: Personal shared/GUARDRAILS.md - starter template
layer: L7
priority: P1
version: 1.0
date: 2026-07-24
source_model: Claude Fable 5
depends_on: [orchestration/guardrails-template.md, orchestration/guardrails-example-harborline.md, personal-layer/tree.md]
usage: Copy to ~/agent-toolkit/shared/GUARDRAILS.md. Format identical to the team file (format SSOT unchanged); governance loose; entries graduate to team files by copy + review.
audience: solo, architect
tools: all
---

# Personal `shared/GUARDRAILS.md` - Starter

The personal guardrails file is a "mistakes my agents keep making" log:
same six-field entry format as the team layer (the format SSOT is
`orchestration/guardrails-template.md` - nothing here redefines it),
but self-governed, low-ceremony, and biased toward *capture speed* -
the entry you write in ninety seconds tonight beats the perfect one you
never write.

## The starter file

```markdown
<!-- FILE: ~/agent-toolkit/shared/GUARDRAILS.md -->
# Guardrails - personal (loaded into every session on this machine)

Entries are permanent until deliberately retired (git log is the
changelog). Test column may be TEST-PENDING here - but pending, not
absent.

| GR-ID | Date | The exact loop/failure observed | The permanent constraint | Tools | Test that proves it holds |
|---|---|---|---|---|---|
| P-1 | <date> | <the exact loop - "agent did X, then Y, for Z minutes"> | <imperative, mechanical> | all | <or TEST-PENDING> |
```

## Personal conventions (the deltas from team governance)

1. **ID namespace `P-n`** - personal entries never collide with a
   project's GR-IDs; graduation to a team file mints a fresh team ID
   (via that repo's anchors/registry process) and retires the P-row
   with a pointer.
2. **Ninety-second capture rule.** When an agent wastes your time, the
   entry goes in *that day*: date, exact loop, constraint. Test column
   may say TEST-PENDING - the weekly pass (below) turns pendings into
   tests or admits the entry was a mood.
3. **Weekly pass, three questions:** Which TEST-PENDING rows can get a
   real test now? Which entries fired this week (constraint earning
   its context cost)? Which entry is actually a *team* problem wearing
   personal clothes - and should graduate?
4. **Cross-project patterns only.** "Never let the agent bump pinned
   deps unprompted" is personal craft; "never bump zod in harborline"
   is that repo's row. The placement rule from tree.md, applied to
   lessons.
5. **Entries about YOUR habits count.** Half of agent discipline is
   operator discipline - "I keep accepting the first plan option
   without reading the rejected ones" is a legitimate P-row, and its
   constraint ("plans without ≥2 options bounce back") is enforceable
   by you.

## Seed entries worth stealing (generic, pre-tested by the vault)

| GR-ID | Date | Loop observed | Constraint | Tools | Test |
|---|---|---|---|---|---|
| P-1 | (adopt) | Same fix retried past failure two+ times in one context | Two strikes → stop, failure note, reset (the GR-1 rule as personal habit) | all | session retro: no idea attempted >2x |
| P-2 | (adopt) | Session accumulated unrelated tasks; quality sagged invisibly | One concern per session for anything blast-radius; reset with artifact bridge | all | retro: ≤2 unrelated concerns/session |
| P-3 | (adopt) | Connected an MCP server "temporarily" outside any registry | Personal registry row first, even at home - no row, no connection | all | permission_audit on ~/agent-toolkit |

## Failure modes (reference-only)
Log becomes a diary (narratives in rows) → template anti-pattern 1;
entries never graduating → team repeats what you already paid for;
TEST-PENDING as a permanent state → enforcement theater.

## Verifier
Weekly pass (convention 3); `ssot_linter.py` confirms the format SSOT
stays with the template; graduation leaves pointers, not copies.

## TOOL TRANSFER table
Per the guardrails template: format universal, loading per tool's
instruction layer; personal scope loads machine-wide via the
symlinked/configured personal layer.
