---
title: Team project layer - the committed harborline tree (buildable spec)
layer: L8
priority: P1
version: 1.1
date: 2026-07-26
changelog: v1.1 fix-batch D - committed layer now ships canonical skills once
source_model: Claude Fable 5
depends_on: [personal-layer/tree.md, foundation/agents-md-example-harborline-root.md, orchestration/guardrails-example-harborline.md, mcp/registry-example-harborline.md, design/design-md-example-harborline.md]
usage: The spec for everything the vault commits INSIDE a repository. Assembly guide: every file listed exists as a filled example elsewhere in the vault - this file is the map, not a restatement.
audience: team
tools: all
---

# Team Project Layer - `harborline/` Committed Tree

Everything agent-related that lives *in the repo*, PR-reviewed like
code - because it is code: a bad skill or guardrail here steers every
teammate's agent, not one person's. Same file formats as the personal
layer; the differences are placement and governance, nothing else.

## The tree (assembly map - each file's content lives with its vault owner)

```
harborline/
├── AGENTS.md                 ← foundation/agents-md-example-harborline-root.md
├── apps/web/AGENTS.md        ← foundation/agents-md-example-harborline-web.md (nested delta)
├── CLAUDE.md                 ← tools/claude-code/claude-md-template.md (filled block)
├── GEMINI.md                 ← tools/antigravity/gemini-md-template.md (filled block)
├── opencode.json             ← tools/opencode/opencode-config.md (filled block)
├── .agents/skills/           ← canonical skills (read by Codex, Antigravity, Command Code)
├── .claude/skills/           ← same canonical files (Claude Code)
├── .cursor/rules/            ← per-project Cursor fallback if the global link is unused
├── .opencode/agent/          ← the 6 OpenCode ports (the one genuine port)
├── mcp/registry.md           ← mcp/registry-example-harborline.md (filled block)
├── GUARDRAILS.md             ← orchestration/guardrails-example-harborline.md (filled block)
├── design/DESIGN.md          ← design/design-md-example-harborline.md (filled block)
├── .mcp.json                 ← team-layer/mcp-json-pattern.md
└── verifiers/                ← lint scripts + rule files, run in CI
```

No Codex-specific file appears - by design (`tools/codex/
codex-parity-notes.md`: Codex's team layer IS the AGENTS.md files).
No Command Code dirs until its `[VERIFY]` block clears.

## Governance rules (the layer's defining strictness)

1. **PR-reviewed like code** - skills, guardrails, registry rows,
   design tokens all travel through review, because each steers every
   teammate's agents. Guardrail removal gets the removing-a-test level
   of suspicion (template rule).
2. **Shared MCP service accounts make the matrix non-optional.**
   Personal scope tolerates "all personal sessions"; here every row's
   roles column is enumerated and `permission_audit.py` runs in CI -
   the L3 discipline at its intended strength.
3. **Versioned deliberately.** Breaking a shared skill breaks everyone's
   agent mid-task - skill changes note behavior deltas in the PR, and
   description changes re-run the suite (eval-loop step 5's restart
   rule, enforced socially).
4. **Zero manual setup for a new teammate** - clone the repo, any
   supported tool's agent has full context immediately. This property
   is TESTED, not assumed: `team-layer/new-teammate-checklist.md` is
   the acceptance procedure, run by an actual newcomer (or a clean
   machine) per onboarding.
5. **Monorepo nesting by placement** - the `apps/web` delta file is the
   pattern; packages with no real deltas get no file (L1's
   empty-nested-file rule).
6. **CI is the enforcement floor:** all four linters + secret scan on
   every PR. The tree ships its own verifiers dir so the floor travels
   with the repo, not with any teammate's setup.

## What deliberately does NOT live here
- Personal craft (the personal layer's job - a teammate's P-rows,
  their fallback DESIGN.md).
- Secrets (env-var references only, everywhere - GR-8).
- Restated facts: every tool-layer file in the tree references
  AGENTS.md-owned facts; `ssot_linter.py` in CI is rule, not request.

## Failure modes (reference-only)
Skill merged without suite re-run → GR-6/GR-9 shipped team-wide;
teammate-specific paths or names in committed files → the universality
the layer exists for breaks; convenience copies during assembly →
GR-5 (the linter catches assembly-time violations too - run it before
the first commit, not just after).

## Verifier
CI per rule 6; `team-layer/new-teammate-checklist.md` as the layer's
acceptance test; `parity_linter.py` confirms the tree's L2 population
matches the matrix.

## TOOL TRANSFER table
Adding a tool to the tree = its instruction/config file (referencing,
never restating) + its skill dir if it has a unit + a parser stanza in
`permission_audit.py` - the generic-adapter L7/L8 rule at team scope.
