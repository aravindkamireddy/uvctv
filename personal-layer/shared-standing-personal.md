---
title: STANDING.md - always-on operator preferences (personal layer)
layer: L7
priority: P1
version: 1.0
date: 2026-09-15
source_model: Claude Fable 5
depends_on: [personal-layer/tree.md, skills/orchestrator/SKILL.md]
usage: The shippable file below extracts to ~/agent-toolkit/shared/STANDING.md. It is the one place to set defaults you would otherwise repeat every session - and the one file every skill checks first.
audience: solo, architect
tools: all
---

# STANDING.md - stop repeating yourself

Skills carry procedure. Guardrails carry constraints earned from failures.
Neither is the right home for **"I prefer it this way"** - a preference is not
a rule, it has no incident behind it, and burying it in a skill makes it
everyone's default rather than yours.

STANDING.md is that home. It is short, it is yours, and every skill in this
vault is instructed to read it first and let it win.

**Why it exists (the honest version):** operators kept re-typing the same
corrections - "don't write tests for that", "stop running the whole suite",
"just show me the diff". Each correction worked for one session and evaporated.
A preference you have to repeat is a preference the system failed to record.

## Rules for the file itself

- **Short.** If it grows past a screen it stops being read, which is GR-9's
  shape applied to your own preferences.
- **Preferences, not constraints.** Anything with an incident behind it belongs
  in GUARDRAILS.md, where it gets a date and a test.
- **Defaults, not laws.** A skill's explicit instruction for the current task
  beats a standing default. You asking for something beats both.
- **It is not a config file.** No tool parses it. It works because skills read
  it, which means a tool with no skills installed will ignore it entirely.

## The shippable file

```markdown
<!-- FILE: ~/agent-toolkit/shared/STANDING.md -->
# Standing preferences

Read this FIRST, before any skill's own defaults. These win over a skill's
suggested behaviour. They lose to an explicit instruction in the current task,
and to anything in GUARDRAILS.md.

Delete what you disagree with. An unedited template is not a preference.

## Verification
- tests: **on request only** - do not write tests unless I ask, the plan named
  them, or behaviour actually changed
- test runs: **scoped** - run the tests covering what was touched; the full
  suite runs once before merge, not after every edit
- cosmetic changes (copy, colour, spacing, one component's styling): no test
  run, no new tests - render it and look

## Output
- lead with the answer; put reasoning after it, not before
- show diffs, not whole rewritten files, unless the file is new
- no summary of what you just did if I can see the diff

## Working style
- ask before: schema changes, dependency changes, anything touching auth,
  money, or deletion
- do not "improve" adjacent code you were not asked to touch
- if you are about to do something for the third time, stop and say so

## Project defaults
- package manager: <bun | pnpm | npm | uv>
- test command: <e.g. bun test>
- (delete this section if it varies by project - project AGENTS.md is the
  better home for anything repo-specific)
```

## Precedence, stated once

```
explicit instruction in the current task
  > GUARDRAILS.md (constraints with incidents behind them)
    > STANDING.md (your defaults)
      > the skill's own default behaviour
```

A skill that ignores STANDING.md is a bug in that skill. A STANDING.md that
contradicts a guardrail is a preference trying to overrule a lesson - the
guardrail wins, and the contradiction is worth a second look.

## Failure modes (reference-only)
File grows into a second rulebook nobody reads → GR-9 (narrative:
`verifiers/eval-loop.md`). Constraints with incidents behind them filed here
instead of GUARDRAILS.md → they lose their date, their test, and their
narrative. Repo-specific settings filed here instead of the project's
AGENTS.md → they follow you to the wrong project.

## Verifier
No linter - this file is yours and unlinted by design. The check is behavioural:
if you catch yourself repeating a correction, it belongs here and is not here
yet.
