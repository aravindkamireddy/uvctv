---
title: Filled example - harborline design/DESIGN.md (gold)
layer: L5
priority: P1
version: 1.1
date: 2026-07-25
changelog: v1.1 B2 amendment - filled Components table (closed set of five), Accessibility rules, and flow references per the v1.1 template; SSOT for component conventions and a11y values
source_model: Claude Fable 5
depends_on: [design/design-md-template.md, REFERENCE-ANCHORS.md]
usage: SSOT for harborline token values - every other vault file references tokens by name and points here; values appear nowhere else (the anchors define the palette's character; this file owns its numbers).
audience: solo, architect, team
tools: all
---

# Filled Example - `harborline/design/DESIGN.md`

Deliberately small (anchors §4): a two-color nautical palette, one type
family, a 4px grid - sized so token-drift examples stay legible and so
the whole contract fits in any agent's working context.

```markdown
<!-- FILE: harborline/design/DESIGN.md -->
# Design Tokens - Harborline

Source: hand-written, 2026-07-24. Regeneration lands as a PR (one-way
contract - see consumption rule).

## Typography
| Token | Value | Usage |
|---|---|---|
| font-body | Inter, 400/600 | all running text, labels, table cells |
| font-display | Inter, 700 | headings, sailing-card titles |
| text-scale | 13 / 15 / 18 / 24 / 32 px | the ONLY sizes; no ad hoc px |

## Color
| Token | Value | Usage |
|---|---|---|
| color-primary | #14324F (deep navy) | buttons, links, header, selected states |
| color-accent | #F4762A (signal orange) | CTAs, focus outlines, capacity warnings |
| color-surface | #F7F9FB | page + card backgrounds |
| color-text | #1B2530 | body text |
| color-muted | #5C6B7A | secondary text, disabled states, borders |
| color-danger | #B3261E | destructive actions, validation errors |

## Spacing
| Token | Value |
|---|---|
| space-grid | 4px - all spacing is integer multiples |
| space-1..6 | 4 / 8 / 12 / 16 / 24 / 40 px |

## Components (the CLOSED set - additions only via design review)
| Component | Variants (closed) | Purpose | A11y obligations |
|---|---|---|---|
| Button | primary / danger / ghost | actions | real button semantics; focus token; label = visible text |
| Input | (single) | text entry with label + error slot | label programmatically associated; error announced, not color-only |
| SailingCard | (single) | present one sailing as a selectable unit | button semantics for selection; focus token; name + departure as accessible label |
| CapacityBadge | states: under-80 / 80-99 / full | capacity state at a glance | icon + text pair every color; state change announced as text |
| BookingStepper | (single) | book-a-sailing flow shell: search → select → confirm | steps keyboard-traversable in order; current step announced; focus moves to each step's heading on advance |

Flows these serve (definitions: REFERENCE-ANCHORS.md §4):
*Book-a-sailing* and *Cancel-a-booking* - every screen in the web app
belongs to one of these or triggers the no-defined-flow ASK.

## Component rules
- Buttons: color-primary fill, color-surface text, space-3 x space-2
  padding, text-scale step 15. Destructive variant: color-danger fill.
- Focus states: 2px color-accent outline, offset space-1 - never
  removed, never restyled per-component.
- Sailing capacity indicator: color-muted below 80% full, color-accent
  80-99%, color-danger at capacity - these three states only.
- Cards: color-surface, space-4 padding, 1px color-muted border - no
  shadows (flat nautical language).

## Accessibility rules (baseline - every component, every screen)
- Every interactive element keyboard-reachable; the focus token is
  never removed or restyled per-component.
- Labels programmatically associated with their controls.
- State is never conveyed by color alone - the three capacity colors
  are always paired with icon + text.
- Flow transitions move focus deliberately (to the new step's heading
  or the outcome message), never leave it on the page root.

## Consumption rule (verbatim in every copy)
Components consume tokens by name; hex/px literals in UI code are
review findings. This file changes only via design review; coding
agents never edit it to match their output.
```

## Why it looks like this (format rules applied)

- **Role names survived a rebrand thought-experiment:** swap navy for
  forest green and only two *values* change; every component reference
  (`color-primary`) is untouched - rule 1 demonstrated.
- **The capacity indicator rule** is the file earning its keep: three
  agents implementing capacity UI in three sessions produce the same
  three states, because the mapping is written - the exact class of
  decision that, unguided, yields GR-7's three near-identical blues.
- **`13` appears in text-scale and nowhere else** as a bare number in
  the vault; any other 13px in `apps/web` is, by construction, a
  finding the grep can catch.
- **No shadows** is a rule *about absence* - contracts must also pin
  what agents tend to add unprompted.

## Failure modes (reference-only)
GR-7 (narrative: `design/design-to-code-flow.md`); values restated
anywhere → GR-5; a fourth capacity state invented mid-task → component
rule violation, review finding.

## Verifier
`ssot_linter.py` token class (these values, this file only); hex/px
grep on apps/web diffs per the GR-7 constraint row.

## TOOL TRANSFER table
Per the template: consumed by reference from every tool's instruction
layer; the nested `apps/web/AGENTS.md` carries the pointer.
