---
title: RUBRIC-ui-design - scoring UI work, sample at every level
layer: L6
priority: P0
version: 1.0
date: 2026-07-25
source_model: Claude Fable 5
depends_on: [design/design-md-example-harborline.md, design/design-review-workflow.md, skills/ui-ux-designer/SKILL.md]
usage: The instrument for ui-ux-designer step 6 self-scores and the browser station's PR evidence. Four dimensions, 0-2 each, a scored harborline sample at EVERY level - a rubric without samples at every level is a mood, not an instrument.
audience: solo, architect, team
tools: all
---

## The shippable file

```markdown
<!-- FILE: ~/agent-toolkit/shared/RUBRIC-ui-design.md -->
# RUBRIC - UI Design Work (0-2 per dimension, 8 max)

Score against the rendered, walked flow - never against the diff alone
(GR-14). Every score cites what was observed in the walk. Pass bar for
merge: **no dimension below 2 on customer-facing flows**; a 1 anywhere
is a finding with a named fix, not a rounding-up candidate.

All samples below score the same artifact class - a
*Cancel-a-booking* screen for the reference web app - so levels are
directly comparable within each dimension.

## D1 - Flow integrity
Does the walked flow do what its definition says, at every step,
including errors?

- **0 (absent):** The confirm action cancels the booking but the
  screen stays on the confirmation view with the button still active;
  a second click throws. No error path for an already-departed
  sailing - the walk dead-ends. *Why 0: the defined flow's third step
  (capacity release feedback) is unreachable.*
- **1 (thin):** Happy path walks end-to-end: find → confirm →
  feedback renders "2 seats released." But the already-departed race
  shows a blank card (the error message exists in code behind a
  condition the walk never satisfied), and there is no way back from
  the feedback view except browser-back. *Why 1: primary path holds;
  error and return paths incomplete - works until reality arrives.*
- **2 (fully realized):** Every step reachable in order; ONE primary
  action per step (confirm = danger, "keep booking" = ghost); the
  already-departed race triggered in the walk and shows its explicit
  message with a working back path; feedback announces the release
  and offers the next sensible action. *Why 2: the walk exercised the
  definition including both error branches; nothing was inferred from
  code.*

## D2 - Hierarchy & layout discipline
One visual center of gravity, everything on the scales?

- **0:** Sailing name, "Cancel booking" heading, and the confirm
  button all render at display size competing for primacy; paddings
  measured in the walk at 13px and 22px - neither on the spacing
  scale; the card carries a drop shadow the contract's flat-language
  rule forbids. *Why 0: no hierarchy decision was made, and the
  values are off-contract in three places.*
- **1:** One display element (the sailing name) and body scale for
  the rest - the hierarchy reads. But the confirm row uses an ad hoc
  18px gap ("looked cramped at space-3") and the feedback message
  matches the body text exactly, so the outcome is easy to miss.
  *Why 1: the structure is right; two eye-tuned deviations undermine
  it - the classic step-3 "fighting the grid" signal.*
- **2:** One display element; every measured spacing an integer of
  the 4px grid from the space-* scale; the feedback message
  distinguished by weight and the accent-paired icon, not by
  inventing a size; the "cramped" instinct resolved by restructuring
  the row (rule: off-scale needs mean restructure, not new values).
  *Why 2: hierarchy is a decision and every value is contract-
  derivable.*

## D3 - Contract conformance (tokens + closed set)
Built from the vocabulary, or around it?

- **0:** A new `CancelPanel` component invented inline; the danger
  action styled with a hex red sampled from a screenshot; the badge
  reimplemented as a colored dot. *Why 0: three contract violations -
  component invention (GR-15 shape), literal values (GR-7 shape),
  and a parallel implementation of an existing component.*
- **1:** Composed from SailingCard + Button + CapacityBadge as the
  closed set requires, tokens throughout - but the Button's danger
  variant was locally modified (border added) without a DESIGN.md
  entry, so this screen's danger button now differs from every
  other. *Why 1: composition right, one uncontracted mutation - the
  drift seed.*
- **2:** Closed-set composition exactly (the gold example's
  decomposition); zero literals in the rendered styles; the one
  genuine gap (waitlist notice) raised as a design-review escalation
  rather than solved inline. *Why 2: the contract was used AND its
  change-channel was used - both halves of conformance.*

## D4 - Accessibility (walked, not asserted)
The keyboard-only pass and the contract's a11y rules, observed.

- **0:** Keyboard-only walk stalls at the sailing card (div-with-
  onClick, no focus); the capacity state is a bare color change; the
  confirm has no accessible name beyond "button." *Why 0: the GR-13
  incident, reproduced.*
- **1:** Whole flow completable by keyboard and every control
  labeled - but after confirm, focus lands on the page root (the
  walk observed the highlight vanish), and the seat-release
  announcement exists visually with no text alternative for the
  state change. *Why 1: reachable ≠ oriented; transitions and
  announcements are half the contract's rules.*
- **2:** Keyboard-only walk completes with focus observed moving to
  the feedback message on confirm; every state color paired with
  icon + text; labels associated (verified by inspecting the
  accessibility tree during the walk, not by reading the JSX).
  *Why 2: all four contract a11y rules observed in the render.*

## Scoring mechanics
- Score DURING or immediately after the browser-station walk; each
  score line = `Dn: score - observed evidence (one clause)`.
- Self-scores (ui-ux-designer step 6) and reviewer scores use the
  same sheet; a ≥2-point gap on any dimension between them is itself
  a finding (calibration drift).
- Scores travel with the PR (browser-station checklist item 5).

## Failure modes (reference-only)
Scoring from the diff → GR-14; rounding 1→2 "because the fix is easy"
→ the fix is easy, so make it and re-walk; using this rubric on
non-UI work → wrong instrument, see the vault's general gate.

## Verifier
This file IS a verifier; its own quality bar is the every-level-sample
rule (12 samples above, 4 dimensions × 3 levels). Suite conduct cases
reference D-scores as expected-behavior evidence.

## TOOL TRANSFER table
Tool-independent by design - it scores rendered artifacts, not tool
output. Station hosting per `design/design-review-workflow.md`'s
transfer table.
```
