---
title: DESIGN.md - token format template
layer: L5
priority: P1
version: 1.1
date: 2026-07-25
changelog: v1.1 B2 amendment - template gains Components and Accessibility sections (format SSOT for both); owns GR-13 narrative
source_model: Claude Fable 5
depends_on: [tools/design-surfaces.md, REFERENCE-ANCHORS.md]
usage: Format SSOT for design-token files in both layers (team design/DESIGN.md, personal shared/DESIGN.md fallback). Copy the template; the filled harborline example is the gold reference.
audience: solo, architect, team
tools: all
---

# `DESIGN.md` - Token Format

One file carries the visual language every coding agent implements
against - typography, color tokens, spacing, component rules. Its
purpose is singular: **five agents consulting one contract instead of
five agents guessing at spacing independently.** Exportable from a
design surface (Stitch-class, extractable from a live URL) or
hand-written; either way, this format.

## The template

```markdown
<!-- FILE: <repo>/design/DESIGN.md -->
# Design Tokens - <project>

Source: <hand-written | exported from <surface>, <date>>. Regeneration
lands as a PR (one-way contract - see rules below).

## Typography
| Token | Value | Usage |
|---|---|---|
| font-body | <family, weights> | all running text |
| font-display | <family, weights> | headings, hero |
| text-scale | <sizes as a list, smallest→largest> | the ONLY sizes; no ad hoc px |

## Color
| Token | Value | Usage |
|---|---|---|
| color-primary | <value> | <where> |
| color-accent | <value> | <where> |
| color-surface / -text / -muted / -danger | ... | ... |
<Every color a component may use has a row. A color without a row does
not exist.>

## Spacing
| Token | Value |
|---|---|
| space-grid | <base unit> - all spacing is integer multiples |
| space-1..n | <the scale> |

## Components (the CLOSED set)
<One entry per component. The set is closed: composition happens from
this list; additions/changes happen only by editing this file via
design review (the design-system skill's escalation path).>
| Component | Variants (closed) | Purpose | A11y obligations |
|---|---|---|---|
| <Name> | <variant list> | <one line> | <keyboard path, label rule, state signals> |

## Component rules
<Short imperatives an agent can obey mechanically:>
- <e.g. Buttons: color-primary fill, space-2 padding, text-scale step 2.>
- <e.g. Focus states: 2px color-accent outline, never removed.>

## Accessibility rules (baseline - every component, every screen)
<Mechanical, checkable statements; the a11y linter and the rubric read
this section:>
- Every interactive element keyboard-reachable; the focus token is
  never removed or restyled per-component.
- Labels programmatically associated with their controls.
- State is never conveyed by color alone - pair color with icon and/or
  text.
- <Project-specific additions, each phrased as a checkable rule.>

## Consumption rule (verbatim in every copy)
Components consume tokens by name; hex/px literals in UI code are
review findings. This file changes only via <export-PR | design review>;
coding agents never edit it to match their output.
```

## Format rules (mechanical)

1. **Tokens are exhaustive, small, and named for role, not value.**
   `color-primary`, never `color-navy` - renaming a value must not
   rename the token. A palette an agent can hold entirely in context is
   a palette that gets used; forty tokens is a system, four hundred is
   a search problem.
2. **Every value has a usage column.** A token without stated usage
   gets used everywhere, which is the guessing this file exists to end.
3. **The scale IS the constraint.** Text sizes and spacing are closed
   lists; "just 13px here" is the drift seed (GR-7's mechanism in
   miniature).
4. **One-way flow, stated in-file.** The consumption rule travels with
   every copy so an agent reading only this file still knows the
   contract direction (design-surfaces integration rule 3).
5. **Source and date in the header** - an exported file's staleness is
   checkable; `[VERIFY]`-class reasoning applies to design truth too.

## Worked incident: GR-13 - the inaccessible component (narrative owner)

**Setup.** SailingCard's first implementation predated the a11y section
of the contract. The agent built what the mockup showed: a clickable
card - literally a `div` with an onClick - selecting a sailing. It
looked exactly right, worked perfectly with a mouse, passed visual
review twice (both reviewers used mice), and shipped.

**Failure.** A beta customer using a screen reader found the booking
flow simply ENDED at the sailing list: the cards announced as plain
text, took no focus, offered no action. Keyboard-only users hit the
same wall silently. The gap had survived implementation, review, and
weeks of use because everyone in the loop shared the same input
methods - the defect was invisible to its makers by construction,
which is precisely why a11y cannot be a reviewer's-eye property. The
fix was small (button semantics, focus handling, labels); the finding
that hurt was that a customer had to be the test.

**Root cause.** A11y existed as a value, not as contract lines. Nothing
mechanical asked "keyboard path?" at any station - not the component's
definition, not review, not verification. Values without checkable
statements lose to mockups every time, because mockups are concrete
and values are ambient.

**Permanent constraints** (GUARDRAILS entry GR-13): the Accessibility
section above is mandatory in every DESIGN.md (format law); every
component row carries its a11y obligations column; the ui-ux-designer
workflow's step 5 and the browser station's keyboard-only pass make the
check mechanical at build and verify time; `a11y_linter.py` enforces
the contract-side statements.

**Test that proves it holds:** the browser station's checklist item 3
(complete the whole flow keyboard-only) fails on the original
SailingCard and passes on the fix; `a11y_linter.py` flags a component
row with an empty a11y-obligations cell.

## Failure modes (reference-only)
Hardcoded literals despite the file → GR-7 (narrative:
`design/design-to-code-flow.md`); token values copied into instruction
files or components docs → GR-5; agent "fixing" the contract to match
its output → one-way violation, review finding; components without
a11y obligations → GR-13 (narrated above); inline variant additions →
GR-15 (narrative: the design-system reference skill).

## Verifier
`ssot_linter.py` token fact-class (values live here only); hex/px
literal grep on UI diffs (GR-7 constraint row); export-PR review for
regenerations.

## TOOL TRANSFER table
Universally consumed by reference from each tool's instruction layer
(the nested harborline `apps/web/AGENTS.md` shows the wiring); produced
by Stitch-class surfaces per `tools/design-surfaces.md`; unlisted
surfaces adopt by exporting to this format.
