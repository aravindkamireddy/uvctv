---
title: Generic adapter - porting the vault to any unlisted agentic IDE
layer: L2
priority: P0
version: 1.0
date: 2026-07-24
source_model: Claude Fable 5
depends_on: [foundation/agents-md-template.md, tools/codex/codex-parity-notes.md, MANIFEST.md]
usage: Follow this procedure when adopting the vault with any agent-based tool not in the matrix. The tool matrix will always be incomplete; this file is why that's fine.
audience: solo, architect, team
tools: any
---

# Generic Adapter - Any Agent-Based IDE

New agentic tools ship monthly; this vault's matrix is a snapshot. The
durable claim is that every tool in this category is built from the same
five primitive slots - so adapting the vault to an unlisted tool is a
mechanical mapping exercise, not a redesign.

## Step 1 - Map the five primitive slots

Fill this table for the new tool (30-60 minutes with its docs):

| Slot | Question to answer | Matrix examples |
|---|---|---|
| Instruction file | Does it read `AGENTS.md`? An alias? Nothing? | AGENTS.md native (Claude Code, OpenCode, Codex) / alias GEMINI.md (Antigravity) |
| Skill/task unit | Is there a reusable, description-triggered task container? | SKILL.md dirs / agent .md files / .commandcode/skills / .agents/skills (cross-tool) |
| Multi-agent unit | Subagents? Swarms? Sessions only? | subagents+teams / Build-Plan+subagents / Agent Manager swarms / none |
| Permission surface | Per-agent allowlists? Config-level? Sandbox/approval only? | frontmatter allowlists / permission: blocks / approval+sandbox |
| MCP config | Where do connections live? | .mcp.json / opencode.json / config.toml |

Date every answer and mark `[VERIFY]` - this table rots at the same rate
as everything tool-specific.

## Step 2 - Land each vault layer on the mapped slots

| Vault layer | Adaptation rule |
|---|---|
| L1 AGENTS.md | Native read → ship the L1 files unchanged. Alias filename → pointer-plus-delta file, or mechanical generation with a DO-NOT-EDIT header (GEMINI.md pattern; hand-maintained copies are GR-5 on a timer). No instruction file at all → paste `AGENTS.md` as the standing session preamble. |
| L2 core skills | Skill unit exists → port the four reference implementations: keep description/workflow/gold-example/failure-modes VERBATIM; re-express only frontmatter and the trigger mechanism. No skill unit → apply the capability-landing method from `tools/codex/codex-parity-notes.md`: (1) AGENTS.md quality, (2) operator procedure, (3) structural enforcement, (4) linters - in that order. |
| L3 MCP | The registry is tool-independent; translate the matrix into the tool's permission surface per the patterns in `mcp/permission-translations.md`. No expressible permission surface → human-approval triggers become "that server is not connected for unattended runs." |
| L4 orchestration | Map decision-table targets: "plan mode" → the tool's research/no-edit mode, else a read-only first session. "Subagent" → native unit, else a fresh scoped session. "Swarm" → native parallel unit with its isolation mechanism, else worktrees/branches with a written ownership map (GR-4 enforcement falls entirely on the map when no scope primitive exists). |
| L5 design | Universal already: the tool consumes `design/DESIGN.md` by reference from its instruction layer. No adaptation exists or should. |
| L6 verifiers | The linters run on files, not tools - unchanged. `permission_audit.py` needs one addition: a parser stanza for the new tool's config format. Trigger-test suites apply wherever a skill unit was mapped. |
| L7/L8 | Add one symlink dir (or copy step) for the tool in `~/agent-toolkit/` + `install.sh`; team layer gains at most one config file, referencing not restating. |

## Step 3 - The three non-negotiables (tool-independent law)

If the new tool cannot express these, enforce them structurally anyway:

1. **Read-only review is structural.** No per-agent edit-denial → review
   from a checkout the session cannot push. Never prompt-only.
2. **No registry row, no MCP connection.** The audit workflow runs even
   where no skill container prompts it - calendar it if necessary.
3. **SSOT survives the port.** The new tool's config carries zero repo
   facts; every fact class keeps its single owner. Run `ssot_linter.py`
   after wiring - the first violation is usually a "convenience" copy
   made during adaptation itself.

## Worked micro-example

Adopting a hypothetical "Foundry IDE" (reads AGENTS.md; has "macros" ≈
skills with a `when:` trigger field; sessions only; folder-level write
permissions; MCP via `foundry.yaml`): L1 unchanged → four macros ported
with descriptions verbatim into `when:` → orchestrator's subagent rows
map to scoped sessions → reviewer runs in a no-push worktree with write
permissions off → registry translated into folder-permission stanzas →
`permission_audit.py` gains a foundry.yaml parser → one `foundry/` dir
in the personal layer. Half a day, zero redesign.

## Failure modes (reference-only)
- "Improving" workflows during a port → divergence from the reference,
  parity break (GR-5-adjacent).
- Skipping step 1 and adapting by vibes → mismapped primitives, usually
  a review role that can edit → GR-3 pattern.
- Written ownership map skipped where no scope primitive exists → GR-4.

## Verifier
`parity_linter.py` accepts adapter-based tools via a declared mapping
file (tool name → per-skill file path or N/A+reason), holding new tools
to the same parity standard as matrix members.

## TOOL TRANSFER table
This file is the transfer table's closure - the row for "everything
else." Matrix members: see each asset's own table.
