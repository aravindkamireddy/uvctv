---
title: ONBOARDING.md - adopting the vault and localizing its anchors
layer: L9
priority: P0
version: 1.3
date: 2026-08-07
changelog: v1.1 B3 - Tier-1 re-anchor row for the design system (components/flows/a11y)
source_model: Claude Fable 5
depends_on: [BOOTSTRAP.md, REFERENCE-ANCHORS.md, team-layer/tree.md, distillation/curriculum.md]
usage: The human's entry point after README. Pick your adopter profile, follow its path, then run the localization pass: the vault's fictional anchors become YOUR repo's facts via the tiered re-anchor table, cross-checked by the linters.
audience: solo, architect, team
tools: all
---

# ONBOARDING - Making the Vault Yours

The vault teaches through one fictional world - harborline, dockhand,
GR-1..12 - so every example is concrete while belonging to no one.
Adoption has two motions: **follow your profile's path** (below), then
**re-anchor**: systematically swap the fixtures for your real repo's
facts where localization is required, and deliberately keep them where
they're teaching material. The tiered table is the boundary between
those two, and the linters cross-check the swap.

## Adopter profiles

**Solo vibe coder** (building through agents daily): Start with
`personal-layer/` - build `~/agent-toolkit/`, run `install.sh`, seed
the three shared/ files from their starters. Then Stage 1-2 of the
curriculum on your main project (AGENTS.md + your first suite-tested
skill). Re-anchor Tier 1 only, for that project. Time to value: a
weekend.

**Aspiring systems architect** (orchestrating rather than hand-coding):
The curriculum, in full, capstone included - the vault IS your
syllabus. Re-anchor as Stage exercises demand. Your extra duty: when
your tool isn't in the matrix, the generic-adapter run is your Stage
2.5, and your five-slot table is worth contributing back.

**Small team standardizing agent behavior:** Start at
`team-layer/tree.md` and assemble your repo's committed layer from the
filled examples; wire CI (all four linters + secret scan) before the
first agent task, not after. Re-anchor Tiers 1-2 completely; run the
new-teammate checklist as your acceptance test with a real newcomer.
Governance from day one: guardrails and skills PR-reviewed.

## The localization pass - tiered re-anchor table

Work top to bottom. The linter column is what mechanically confirms
each tier landed; run the named linters after each tier, not once at
the end.

| Tier | What re-anchors | From (fixture) | To (yours) | Cross-check |
|---|---|---|---|---|
| **1 - MUST swap** (the vault misleads until done) | Root + nested `AGENTS.md` contents | harborline commands, zod pin, capacity invariant, CI-only deploys | your real commands (verbatim from your CI), your real pins WITH reasons, your real invariants, your real never-dos | `staleness_linter.py` command-existence check against YOUR package.json; checklist step 4 |
| | `mcp/registry.md` rows | postgres-readonly, github, stitch-design, browser-fetch | your actual servers, roles enumerated from your actual roster | `permission_audit.py` against your configs |
| | Connection files + `.env.example` | `PG_URL_RO`, `GH_TOKEN_AGENT`... | your credential names + real provisioners | `permission_audit.py` reference check; secret scan |
| | `design/DESIGN.md` values | the nautical palette | your tokens (or graduate the personal fallback) | hex/px grep wired to YOUR ui paths; `ssot_linter.py` token class |
| | Design system: components/flows/a11y values | harborline's five components, two flows, a11y baseline | your DESIGN.md's closed set, YOUR defined flows, your a11y rules | `a11y_linter.py` on your contract; design-system suite re-run |
| | Skill gold examples' repo facts | capacity-invariant coverage, `bun test --filter api` | one real repeated workflow of yours per skill, your real filter commands | each skill's suite re-run after the swap (eval rounds restart) |
| **2 - SHOULD adapt** (works as-is; better localized) | `GUARDRAILS.md` rows | GR-1..12 | KEEP all twelve (they're pre-paid lessons) + append your own incidents as GR-13+/your own IDs | `ssot_linter.py` (rows stay owned); six-field format review |
| | Ownership zones / swarm rules | apps/web, services/api, shared-never-a-zone | your package boundaries; identify YOUR shared-package equivalents | orchestrator suite case 9 rewritten with your paths |
| | Linter rule files | `ssot.rules.json` etc. seeded with harborline fact classes | your fact classes (same commit as each owner file lands) | each linter's planted-violation fixture, re-planted with your facts |
| | Trigger-test suites' prompts | harborline-flavored asks | your domain's phrasings (structure and NOT-case ratios unchanged) | `parity_linter.py` suite floor still passes |
| **3 - KEEP as-is** (teaching material; swapping destroys value) | GR narratives in their owner files | the twelve worked incidents | unchanged - they are the shared explanatory spine; your incidents get NEW narratives with NEW IDs | one-narrative rule: never rewrite a shipped narrative to star your repo |
| | The curriculum + its exercises | harborline capstone | unchanged - a neutral practice repo is a feature; your repo has stakes | - |
| | Templates, playbooks, the glossary, this file's structure | - | unchanged; these are the vault's durable layer | `ssot_linter.py` (formats stay with their SSOT owners) |

**The tier boundary in one sentence:** facts about a codebase re-anchor
(Tier 1), facts about your team's judgment adapt (Tier 2), and the
vault's *lessons* stay fictional forever (Tier 3) - because a lesson
anchored to your repo stops being shareable, and shareability is why
the fixtures exist.

## First thing after install

Open `~/agent-toolkit/shared/STANDING.md`. It is the one file that is yours
rather than the vault's - your defaults, read before any skill's own. It ships
opinionated (tests on request only, scoped runs, diffs over full files) so that
it is useful immediately, which also means some of it will be wrong for you.
Delete those lines. An unedited template is not a preference.

## Backing out

Adoption is reversible. `personal-layer/uninstall.{sh,ps1}` removes only the
links the installer created - your toolkit folder, your edits and any files
you adopted into it are untouched. `--restore` copies the toolkit's files back
into each tool's real directory first, so a tool you keep using is not left
empty. Try the vault knowing you can undo it in one command.

## Re-anchor procedure (mechanical)

1. Fork/copy the vault beside your repo (or into `docs/agent-vault/` -
   placement is yours; the team-layer tree stays the committed subset).
2. Tier 1, one row at a time; run each row's cross-check before the
   next. Resist batch-swapping: an unchecked swap is a stale fact with
   your name on it.
3. Tier 2 as your first fortnight's friction reveals what's worth
   adapting.
4. Wire CI (the four linters + secret scan) no later than the end of
   Tier 1 - localization errors are exactly what they catch.
5. Run the new-teammate checklist (or its solo reduction: phases 2-4 on
   your own machine after a fresh clone). Findings file against files.
6. Date it: your vault copy's frontmatter `version` bumps, and your
   `[VERIFY]` clock starts - the staleness cadence is now yours to
   honor.

## Failure modes (reference-only)
Batch-swap without cross-checks → localized staleness (GR-2 with extra
steps); rewriting narratives to star your repo → Tier 3 violation,
shareability lost; skipping Tier 1's suite re-runs → GR-6 imported
into your domain wearing green checkmarks; adopting without CI →
every guardrail demoted back to prose.

## Verifier
The table's cross-check column, tier by tier; the checklist as the
end-to-end acceptance; `staleness_linter.py` owning your `[VERIFY]`
clock thereafter.

## TOOL TRANSFER table
Profile paths and the tier table are tool-independent; "your tool's
port" resolves via the parity matrix; unlisted tools insert a
generic-adapter run between profile choice and Tier 1.
