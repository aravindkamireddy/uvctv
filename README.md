---
title: README - the Universal Vibe-Coding Toolkit vault
layer: L9
priority: P0
version: 1.5
date: 2026-08-16
changelog: v1.2 fix-batch A-F - canonical skills, six-tool coverage, guardrail-format failures
changelog: v1.1 B3 - UI/UX discipline noted; GR registry now 15
source_model: Claude Fable 5
depends_on: [MANIFEST.md, BOOTSTRAP.md, ONBOARDING.md]
usage: Start here. Then: models load BOOTSTRAP.md; humans read ONBOARDING.md.
audience: everyone
tools: all
---

# Universal Vibe-Coding Toolkit

A complete, shareable **agent-orchestration toolkit vault**: the
six-layer Cross-Tool Agent Orchestration Architecture, *built* - real
instruction files, real skills in each tool's native format, real
permission matrices, real guardrails, real runnable linters - arranged
into a personal layer (`~/agent-toolkit/`) and a team layer (committed
in-repo), for Claude Code, OpenCode, Antigravity, Codex CLI, Command
Code, design surfaces, and (via the generic adapter) any agentic IDE.

**The success criterion it was built against:** a mediocre model + any
supported tool + this vault ≈ a disciplined multi-agent engineering
practice. A newcomer clones it, runs the installer, opens any supported
tool, and their agents behave like they were configured by someone
senior.

## Install in one command

```
npx github:<you>/uvctv init
```

No clone, no zip, no platform-specific script. `update`, `status` and `unlink`
are the other verbs. Prefer shell? `personal-layer/setup.{sh,ps1}` do the same
work; see `personal-layer/tree.md`.

## Connect the reference library (optional)

```json
{ "mcpServers": { "uvctv-vault": {
    "command": "npx", "args": ["-y", "github:<you>/uvctv", "mcp"] } } }
```

Serves the vault's ~56 reference documents on demand - the agent searches
them when it needs a procedure, instead of you loading them. Read-only, zero
dependencies. Full instructions and per-tool config: `tools/mcp-doc-server.md`.

## Optional: hooks that enforce

Two hooks ship in `hooks/`. They are the only thing here that ENFORCES rather
than instructs - everything else is text an agent may or may not follow.
`config-protection` blocks edits to existing linter configs (GR-22);
`fact-gate` demands facts, not confirmation, before source edits and
non-reversible commands (GR-23). Wiring and per-tool support:
`hooks/README.md`. Only the Claude Code surface is verified.

## Start here

| You are | Read |
|---|---|
| A model operating this vault | `BOOTSTRAP.md` - behavior spec + load routing, self-contained |
| A human adopting it | `ONBOARDING.md` - pick your profile, run the re-anchor pass |
| Learning the practice | `distillation/curriculum.md` - six stages to the swarm capstone |
| Just browsing | `MANIFEST.md` - the full annotated tree |

Everything is anchored to shared fictional fixtures (`harborline`, a
ferry-booking monorepo; `dockhand`, a workstation; incidents GR-1..12)
defined in `REFERENCE-ANCHORS.md` - concrete everywhere, personal to no
one. `distillation/glossary.md` is the vocabulary arbiter.

## Usage modes

1. **Full adoption** - team layer in your repo, personal layer on your
   machines, CI running the linters. ONBOARDING's profile paths +
   Tier 1-2 re-anchoring. This is what the vault is for.
2. **Cafeteria** - lift a single asset (the AGENTS.md discipline, the
   registry format, the reviewer role, one linter). Every file is
   standalone by construction; take what earns its keep. The One Hard
   Rule still applies to whatever you take.
3. **Reference** - read the playbooks and GR narratives as case
   literature. Tier 3 of the re-anchor table exists because this mode
   matters: the lessons stay fictional so they stay shareable.
4. **Curriculum** - the six-stage path, exercises on the reference
   repo, capstone swarm as the human acceptance test.

## Maintenance cadence (the vault rots where marked; tend it)

- **Every `[VERIFY YYYY-MM]` tag** carries the re-check contract;
  `verifiers/lint/staleness_linter.py` flags tags older than your
  cadence (shipped default: 120 days). Tool config syntax is the
  fastest-rotting content here - the Command Code and Antigravity
  files are the densest, by design and by honesty.
- **Same-commit rule everywhere:** a fact and its documentation change
  together, enforced by the linters, verified by their planted-violation
  fixtures.
- **Quarterly:** human permission-audit pass; retro sampling for the
  GR-1/GR-11 process tests; prune TEST-PENDING rows in personal
  guardrails.
- **On any new tool release you use:** re-verify its Part B glossary
  column and its config stanzas; on any new tool you adopt:
  `tools/generic-adapter.md`, half a day, no redesign.

## Redistribution

Share it whole or in part. The fixtures are fictional and the content
is deliberately universal - zero references to any person, company, or
real codebase. If you redistribute a modified copy: keep the
frontmatter honest (bump `version`, add yourself to provenance, keep
`source_model`), keep the GR narratives intact under the one-narrative
rule (append your own with new IDs rather than rewriting shipped ones),
and keep the linters with the content - a copy of the rules without
their enforcement is the exact failure mode this vault exists to end.

## The one-paragraph theory of the thing

Instruction files carry only what agents can't infer; every fact lives
in exactly one place; permissions are matrices before they are
connections; failures become tested constraints instead of re-litigated
prose; descriptions are tuned like the routing functions they are;
parallelism is an ownership map or it doesn't launch; and every one of
those sentences is enforced by something runnable, because a strong
verifier plus a weak generator approximates a strong system - which is
the bet the whole vault makes on your behalf.

## Verifier
`verifiers/lint/` - run all four + secret scan in CI. The vault lints
itself with the same tools it ships.

## TOOL TRANSFER table
The vault's whole point; see any asset's own table, the parity matrix
in `MANIFEST.md`, and `tools/generic-adapter.md` for everything else.
