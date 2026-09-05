---
title: Personal shared/DESIGN.md - default token fallback
layer: L7
priority: P1
version: 1.1
date: 2026-07-25
changelog: v1.1 B2 ripple - starter gains the Accessibility rules baseline per the v1.1 DESIGN format law (caught by a11y_linter's first real-vault run)
source_model: Claude Fable 5
depends_on: [design/design-md-template.md, design/design-to-code-flow.md, personal-layer/tree.md]
usage: Copy to ~/agent-toolkit/shared/DESIGN.md. The fallback contract for personal projects with no design system yet - so even a weekend prototype has one visual language instead of per-session guessing.
audience: solo, architect
tools: all
---

# Personal `shared/DESIGN.md` - Default Fallback

Team projects have `design/DESIGN.md`; personal experiments usually
have nothing - which re-creates GR-7 in miniature every weekend: each
session invents its own grays, its own spacing, its own button. The
fallback contract ends that. Same format as any DESIGN.md (format
SSOT: `design/design-md-template.md`); its distinguishing property is
**precedence, stated in-file**: it applies only when no project
contract exists, and it loses instantly when one appears.

## The starter file

```markdown
<!-- FILE: ~/agent-toolkit/shared/DESIGN.md -->
# Design Tokens - personal default fallback

Source: hand-written, <date>. PRECEDENCE: a project's design/DESIGN.md
always wins; this file applies ONLY where no project contract exists.
Graduating a project? Copy this file in as its starting contract and
diverge there - never edit this fallback to suit one project.

## Typography
| Token | Value | Usage |
|---|---|---|
| font-body | system-ui, 400/600 | all running text |
| font-display | system-ui, 700 | headings |
| text-scale | 13 / 15 / 18 / 24 / 32 px | the ONLY sizes; no ad hoc px |

## Color
| Token | Value | Usage |
|---|---|---|
| color-primary | <pick one, once> | actions, links, emphasis |
| color-accent | <pick one, once> | focus, highlights |
| color-surface | <near-white> | backgrounds |
| color-text | <near-black> | body text |
| color-muted | <mid-gray> | secondary text, borders, disabled |
| color-danger | <one red> | destructive, errors |

## Spacing
| Token | Value |
|---|---|
| space-grid | 4px - all spacing is integer multiples |
| space-1..6 | 4 / 8 / 12 / 16 / 24 / 40 px |

## Component rules
- Buttons: color-primary fill, space-3 x space-2 padding.
- Focus states: 2px color-accent outline - never removed.
- One card style, one border treatment - decide once, here.

## Accessibility rules (baseline - yes, even on weekend projects)
- Every interactive element keyboard-reachable; the focus token is
  never removed or restyled per-component.
- Labels programmatically associated with their controls.
- State is never conveyed by color alone - pair color with icon and/or
  text.

## Consumption rule (verbatim in every copy)
Components consume tokens by name; hex/px literals in UI code are
review findings. Coding agents never edit this file to match their
output.
```

## Personal conventions

1. **Fill the placeholders once, live with them.** The fallback's value
   is *consistency across weekends*, not beauty - a mediocre palette
   applied uniformly beats six good ones applied severally. Changing it
   later restyles only projects still on the fallback; graduated
   projects froze their copy (starter's graduation rule).
2. **Graduation is a copy, not a link.** A project getting serious gets
   its own contract file seeded from this one - divergence happens in
   the project, the fallback stays generic, and the one-way flow rule
   applies in both places.
3. **Wire it like a real contract.** A personal project's AGENTS.md (or
   session preamble) points at whichever contract governs - the GR-7
   lesson was that unwired contracts don't exist; that's as true at
   home.
4. **Structural scales are the load-bearing half.** If the color
   placeholders stay unfilled for a while, fine - the text-scale and
   spacing rows already prevent the worst drift (ad hoc px is the most
   common personal-project incoherence, and it's solved by two closed
   lists).

## Failure modes (reference-only)
Fallback edited per-project → every other personal project restyles as
side effect (convention 1's freeze rule exists for this); unwired
fallback → GR-7 in miniature (narrative:
`design/design-to-code-flow.md`); values restated into personal skills
or preambles → GR-5.

## Verifier
Hex/px grep applies to personal UI code identically; precedence
statement present in-file (convention of the format's rule 4, extended).

## TOOL TRANSFER table
Per the DESIGN template: consumed by reference from whatever
instruction layer the personal project has; produced by hand or by a
design surface export replacing the placeholders.
