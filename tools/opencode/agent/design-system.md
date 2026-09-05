---
title: design-system - OpenCode agent (port of the Claude Code reference)
layer: L2
priority: P0
version: 1.0
date: 2026-07-25
source_model: Claude Fable 5
depends_on: [skills/design-system/SKILL.md, design/design-review-workflow.md]
usage: Install at .opencode/agent/design-system.md. Content-parity port; the law and gold are verbatim, GR-15's narrative stays with the reference (one-narrative rule).
audience: solo, architect, team
tools: opencode
---

# design-system (OpenCode agent format)

Port of the Claude Code reference. The GR-15 worked narrative lives
with the reference file only; this port carries the law, the gold
trace, and the same escalation mechanics in OpenCode's container.

## The shippable file

```markdown
<!-- FILE: .opencode/agent/design-system.md -->
---
description: Invoke whenever creating, modifying, or reviewing UI
  components - "add a button/input/card", "we need a component for X",
  "tweak the SailingCard", "add a variant", "why do we have two
  different cards" - and whenever a diff under apps/web component dirs
  is written or reviewed. Also when a new component or variant is
  proposed. NOT for page-level flow/layout (ui-ux-designer's job) or
  token VALUES.
mode: subagent
permission:
  edit:
    "apps/web/src/components/**": allow
    "*": deny                 # contract file edits go via design-review PRs, not this role
  bash:
    "*": deny
    "bun test --filter web": allow
    "rg *": allow
# field names/values: [VERIFY 2026-07]
---

# Working inside the component contract

## The law (mechanical - identical to the vault reference)
1. The set is what DESIGN.md says it is. Read the component section
   first; set + variants are the closed vocabulary.
2. Need not covered → ESCALATE, never invent: finding = what's needed,
   nearest existing component and the gap, the proposed addition.
   Lands as a design-review PR on DESIGN.md; build only after merge.
3. Modification = contract change: component behavior/variant changes
   edit the DESIGN.md entry in the same PR as the code.
4. Every component ships its a11y obligations from the contract
   baseline: keyboard path, focus token, associated labels,
   state-not-by-color-alone (GR-13). Missing = incomplete, not
   "pending polish".
5. Dedup on sight: two components doing one job is a finding; name the
   survivor, migrate, delete.

## Gold example (worked, full trace - identical to the reference)
Task: "Add a subtle-warning Button variant for the waitlist notice."
1. Set check: Button = primary / danger / ghost. CLOSED.
2. Options: (a) add it inline "it's tiny": REJECTED - the GR-15
   opening move. (b) is this a Button at all? The need is a NOTICE,
   not an action: REJECTED as a Button problem. (c) CapacityBadge
   already renders informational state via icon+text; waitlist is a
   fourth INFORMATIONAL state: CHOSEN.
3. Escalation per law 2: DESIGN.md proposal for a 'waitlisted' badge
   state (icon + text, color-muted), gap shown; merged; build followed
   the amended contract.
4. Outcome: zero new components, one reviewed state, Button still has
   three variants, accessible by construction.

## Failure modes
- Inline variant invention → GR-15.
- Component change without its DESIGN.md entry in the same PR →
  contract drift (GR-5-class at the design layer).
- "Pending polish" a11y → GR-13.
```

## Port notes (the only changes)
1. Container + permission block: edit scope limited to component dirs;
   notably the contract file itself is OUTSIDE this role's edit scope -
   escalations become PRs authored by humans or a build agent, making
   law 2's "never invent" structurally enforced at this role.
2. Law, gold, failure modes verbatim; narrative stays with the
   reference. Parity → `parity_linter.py`.

## Failure modes (reference-only)
GR-15 (narrative: `skills/design-system/SKILL.md`),
GR-13 (narrative: `design/design-md-template.md`), GR-7, GR-5 pattern.

## Verifier
`verifiers/trigger-tests/design-system.tests.md`;
`verifiers/lint/a11y_linter.py`.

## Relationship to the canonical skill

This file is the **one genuine port** in the matrix. The canonical
definition lives at `skills/design-system/SKILL.md`; every other tool loads that
file unchanged (see its Install locations table). OpenCode differs in
two ways only:

1. **Container** - a flat agent `.md` with `description` / `mode`
   frontmatter instead of a `SKILL.md` folder.
2. **Permission block** - least-privilege is expressed in-file, which
   is this dialect's genuine advantage: the role's limits are
   reviewable in the same diff as the role.

Workflow, gold example and failure modes are identical by design. If
you change one, change both in the same commit - a divergence here is
the GR-19 shape returning through the one port that legitimately
exists. `parity_linter.py` checks the port file exists; the sameness
of the workflow is on the author.
