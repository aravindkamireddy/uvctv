---
title: Design surfaces - Stitch & Claude Design bridge role
layer: L2
priority: P0
version: 1.0
date: 2026-07-24
source_model: Claude Fable 5
depends_on: [design/design-md-template.md, design/design-to-code-flow.md, mcp/registry-template.md]
usage: The landing file for every design-surface N/A cell in the parity matrix, and the L2 statement of what these tools ARE in the architecture: token producers, not coding agents.
audience: solo, architect, team
tools: stitch, claude-design
---

# Design Surfaces - Stitch & Claude Design

Stitch and Claude-Design-class surfaces occupy a different position in
the architecture than every other column of the tool matrix: they are
**producers of the design contract**, not consumers of repo instruction
files and not hosts for the four core skills. The parity matrix marks
all four cells N/A for them - this file records why, and what these
tools contribute instead.

## What they are in this architecture

| Surface | Role | Key artifact |
|---|---|---|
| Stitch | Design-system source: captures typography, color tokens, spacing, component rules - extractable from a live URL - and exports `DESIGN.md`. Bridges into coding tools via Stitch Skills and its MCP server + SDK `[VERIFY 2026-07: skill bridge targets and SDK surface]` | `DESIGN.md` (format SSOT: `design/design-md-template.md`; harborline values SSOT: `design/design-md-example-harborline.md`) |
| Claude Design / open design surfaces | Prototype/mockup/landing-page/slide production via MCP-connected surfaces - a place where visual intent becomes reviewable artifacts before coding agents implement | prototypes referencing, never redefining, `DESIGN.md` tokens |

The one-sentence version: **coding agents implement against one visual
language because these surfaces write it down once.** Five agents each
guessing at spacing independently is the disease; `DESIGN.md` is the
cure; these surfaces are where the cure is produced and maintained. The
full flow (surface → tokens → every coding agent) is L5's subject -
`design/design-to-code-flow.md`, which also owns the GR-7 narrative.

## Why every core-skill cell is N/A

- **skill-writer:** these surfaces are not skill-authoring hosts; Stitch
  Skills bridge *outward* into coding tools rather than hosting a
  user-authored skill library `[VERIFY 2026-07]`.
- **orchestrator:** design surfaces are routed TO (the decision table
  can emit "produce/update the design contract first"), never routers.
- **security-reviewer:** no code-edit capability exists to restrict; the
  review discipline that touches design work is token-conformance
  review, which belongs to coding-tool reviewers checking diffs against
  `DESIGN.md` (GR-7 class), not to the surface.
- **mcp-permission-audit:** not an auditor host - but the Stitch MCP
  server IS an auditee: it gets a row in `mcp/registry.md` like any
  other server (purpose: token export; scope: read design system;
  roles: build agents implementing UI) and passes the standard audit
  before connection.

## Integration rules (the bridge, stated once)

1. `DESIGN.md` produced here is committed at `design/DESIGN.md` in the
   team layer and referenced by nested `AGENTS.md` files ("tokens come
   from design/DESIGN.md - never hardcode") - see the harborline
   `apps/web` nested example.
2. Regeneration/re-export is an update to the SSOT: same-commit rule
   applies (a token change and the components using it land together,
   or the export is staged behind a PR).
3. Coding agents never edit `DESIGN.md` to match their output; the
   contract flows one way. A mismatch is a finding, and the fix happens
   on whichever side a human decides - explicitly.

## Failure modes (reference-only)
- Tokens hardcoded because the bridge wasn't wired → GR-7 (narrative:
  `design/design-to-code-flow.md`).
- Token values copied into instruction files "for convenience" → GR-5.
- Stitch MCP server connected without a registry row → GR-12.

## Verifier
`ssot_linter.py` flags token restatement outside the DESIGN.md SSOT;
`parity_linter.py` maps the four design-surface N/A cells to this file;
`permission_audit.py` covers the Stitch MCP row.

## TOOL TRANSFER table
N/A-inverse (like the Codex notes): these surfaces transfer INTO every
coding tool via one artifact. Per tool: Claude Code / OpenCode /
Antigravity / Codex / Command Code all consume `design/DESIGN.md` by
reference from their instruction layer - no per-tool port of the design
contract exists or should. Unlisted design surfaces: adopt by exporting
to the same `DESIGN.md` format per `design/design-md-template.md`.
