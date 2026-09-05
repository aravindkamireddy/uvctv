---
title: Design-to-code flow - surface → tokens → every agent (+ GR-7 narrative)
layer: L5
priority: P1
version: 1.0
date: 2026-07-24
source_model: Claude Fable 5
depends_on: [tools/design-surfaces.md, design/design-md-template.md, design/design-md-example-harborline.md]
usage: The end-to-end bridge: how visual language travels from a design surface into every coding agent's output. Owns the GR-7 narrative (design-token drift).
audience: solo, architect, team
tools: all
---

# The Design-to-Code Flow

One visual language across tools instead of five agents each guessing
at spacing independently. The flow has four stations and one direction:

```
[Design surface]        Stitch-class: tokens authored/extracted (from a
      │                 live URL where supported) - or hand-written
      ▼
[design/DESIGN.md]      the contract, in the template format; lands and
      │                 changes via PR only (one-way rule)
      ▼
[Instruction wiring]    nested AGENTS.md points at it ("tokens come from
      │                 design/DESIGN.md - never hardcode"); tool layers
      ▼                 reference, never restate
[Every coding agent]    components consume tokens by name; diffs with
                        hex/px literals are findings
```

## Station rules

1. **Surface → contract:** exports land as PRs (registry row
   `stitch-design` scopes the write to exactly this file, human-merged).
   Hand-written contracts follow the same PR path - the gate is about
   the contract changing deliberately, not about who typed it.
2. **Contract → wiring:** the pointer lives in the *nearest* instruction
   file for UI code (harborline: `apps/web/AGENTS.md`), so proximity
   resolution puts the rule in front of exactly the agents editing UI.
   No token values in any instruction file, ever (GR-5).
3. **Wiring → agents:** consumption is by token name. Where the stack
   supports it, wire tokens once into the theme layer (CSS variables /
   Tailwind config generated FROM DESIGN.md) so component code cannot
   express a raw value without visibly bypassing the system - make the
   right thing the path of least resistance.
4. **Backflow is a decision, not a drift:** when an agent's output
   disagrees with the contract ("the accent fails contrast on
   color-surface"), the mismatch is a *finding*; a human decides which
   side moves, and if it's the contract, that's a design-review PR.
   Agents never edit DESIGN.md to match their output.

## Multi-surface reality
Prototypes made in Claude-Design-class surfaces reference the same
tokens (paste the contract into the design brief); a prototype using
off-contract values is fine as *exploration* but its graduation to a
build task includes token reconciliation - explicitly, at the
plan stage.

---

## Worked incident: GR-7 - design-token drift (narrative owner)

**Setup.** The capacity indicator work predated the wiring station:
`DESIGN.md` existed (the anchors palette, including the three-state
capacity rule) but no instruction file pointed at it. Three UI tasks
ran across two weeks and two different tools: the sailing-card
indicator, the booking-page availability badge, and the admin
dashboard's fill meter.

**Failure.** Each agent, unguided, made locally reasonable color
choices. The card indicator got `#F4762A` - correct, coincidentally,
scraped from an existing button. The badge got `#E8722C` - the agent
sampled a JPEG mockup attached to the ticket, and JPEG compression had
shifted the orange. The fill meter got `#F57C33` - the agent asked its
own aesthetic judgment for "a warning orange matching the brand."
Three oranges, pairwise indistinguishable in isolation, visibly
mismatched the first time a screen showed two of them - which was the
admin dashboard beside a card, in a stakeholder demo. Worse than the
optics: the badge's drifted orange had been *copied twice more* by a
later agent treating existing code as the style source, so the fix
wasn't three lines - it was an archaeology pass over every color
literal in `apps/web`, deciding for each whether it was drift, an
undocumented real decision, or noise. Two days, for three shades of
one color.

**Root cause.** The contract existed but wasn't *wired*. Agents don't
consult files nothing points them at - proximity is the delivery
mechanism, and the delivery mechanism wasn't built. Each agent then
did what unguided agents do: derived visual truth from whatever was
nearest (existing code, a lossy image, taste).

**Permanent constraints** (row GR-7 in
`orchestration/guardrails-example-harborline.md`): token values live
only in `design/DESIGN.md`; the nested-AGENTS.md pointer is mandatory
wiring for any repo with UI (station 2); hex/px literals in UI diffs
are findings (station 3's grep); where possible the theme layer is
generated from the contract so bypass is visible.

**Test that proves it holds:** hex-literal grep over `apps/web` diffs
in CI flags any value not sourced from the generated theme; planting
`#E8722C` in a component must fail; `ssot_linter.py`'s token class
fails values restated outside the contract.

## Failure modes (reference-only)
GR-7 (narrated above); values restated in wiring → GR-5; agent-edited
contract → station 4 violation; exploration prototypes merged without
token reconciliation → drift with a design surface's signature on it.

## Verifier
Hex/px grep (CI); `ssot_linter.py` token class; export-PR review at
station 1; reconciliation check at prototype graduation.

## TOOL TRANSFER table
Stations 1-4 are tool-independent; per-tool touchpoints:
surface export (`tools/design-surfaces.md`), wiring via each tool's
instruction layer (nested AGENTS.md / GEMINI.md pointer), findings via
each tool's reviewer port. Unlisted tools inherit the flow unchanged -
it never depended on any tool primitive, which is why it transfers
whole.
