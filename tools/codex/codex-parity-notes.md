---
title: Codex CLI - capability notes (skills confirmed 2026-07) + GR-18 narrative
layer: L2
priority: P0
version: 2.0
date: 2026-07-26
source_model: Claude Fable 5
changelog: v2.0 fix-batch B - v1.0 asserted "no native skill unit" and landed every capability in operator procedure. That claim is now FALSE: Codex ships user- and project-level skills as SKILL.md folders. Four N/A cells retired; this file owns the GR-18 narrative about how the stale N/A survived.
depends_on: [skills/skill-writer/SKILL.md, tools/codex/config-toml-template.md, distillation/glossary.md]
usage: Read when adopting the vault with Codex. Records what Codex natively supports, what it still lacks, and how a wrong N/A survived here for months.
audience: solo, architect, team
tools: codex
---

# Codex CLI - Capability Notes

**Status change (2026-07): Codex has skills.** The canonical skills in
`skills/` load unchanged - Codex reads `SKILL.md` folders with YAML
frontmatter, the same Agent Skills shape this vault authors in.

## What Codex natively supports

| Slot | Codex | Notes |
|---|---|---|
| Instruction file | `AGENTS.md`, read before any work; concatenated root → cwd | Codex originated the format; the vault's L1 files ship unmodified |
| Skill unit | `~/.codex/skills/<name>/SKILL.md` (user), `.agents/skills/<name>/` (project) | canonical files load as authored |
| Invocation control | `allow_implicit_invocation` in `agents/openai.yaml`; `$skill` explicit invocation | the description-tuning law (GR-6) applies to implicit invocation exactly as elsewhere |
| Permission surface | `approval_policy` + `sandbox_mode` in `config.toml` | still the whole least-privilege surface - no per-agent allowlists |
| MCP | `[mcp_servers]` in `config.toml` | audited by `permission_audit.py` like any other |
| Multi-surface | CLI, VS Code extension and desktop app read the same `~/.codex/config.toml`, AGENTS.md and skills | one config, three surfaces |

## What Codex still lacks (the honest remainder)

- **No per-agent tool allowlist.** The security-reviewer role's
  read-only property cannot be expressed per agent. Enforce it
  structurally instead: review from a checkout the session cannot push
  (the branch-floor rule in the canonical skill's swarm addendum).
- **No native subagent/swarm primitive.** The orchestrator's parallel
  rows map to separate sessions in separate worktrees, with the written
  ownership map as the only thing preventing GR-4.
- Both gaps are *permission and orchestration* gaps, not skill gaps -
  which is exactly why the old blanket "N/A" was wrong: it collapsed
  three different questions into one answer.

## Install

User-level: `~/.codex/skills/<name>/SKILL.md` - what
`install.{sh,ps1}` links. Project-level: `.agents/skills/<name>/`,
committed. Restart Codex after changing `~/.codex/config.toml`.

---

## Worked incident: GR-18 - the stale capability claim (narrative owner)

**Setup.** When the tool matrix was built, Codex genuinely had no skill
unit. The parity matrix recorded four `N/A - no native skill unit`
cells, each with a reasoned landing page explaining where the
capability went instead. That was correct, well-documented, and passed
every linter - the parity linter's whole job was checking that N/A
cells carried a reason and a landing file, which these did.

**Failure.** Codex shipped skills. Nothing in the vault noticed. The
N/A cells kept passing the linter *because they were well-formed*, and
well-formed is not the same as true. For months the vault told every
Codex adopter that a capability they had did not exist - and told them
so in a file specifically written to be authoritative about that
question. The cost is asymmetric and quiet: an adopter doesn't discover
the vault was wrong, they simply never try the thing it said was
impossible. The error surfaced only because a human asked "did you
actually check all six tools?" and the honest answer was no - three of
six had been verified, and Codex was one of the unchecked.

**Root cause.** Not the original N/A, which was true when written. The
defect is that a claim about an EXTERNAL tool's capabilities was given
the same permanence as a claim about our own repo, with no re-check
trigger. Own-repo facts rot on your commit schedule and the same-commit
rule catches them (GR-2). External-tool facts rot on somebody else's
release schedule, where you have no commit to hook onto.

**Permanent constraint** (GUARDRAILS entry GR-18): every parity cell
whose value is `N/A` carries a `[VERIFY <YYYY-MM>]` date like any other
perishable claim, and the staleness linter treats an aged N/A exactly
as it treats an aged `[VERIFY]` tag. An N/A is a dated observation, not
a permanent property. Re-verification uses that tool's OWN primary
docs (GR-17).

**Test that proves it holds:** `staleness_linter.py` flags a
`[VERIFY]`-dated N/A older than the cadence; a matrix N/A cell with no
date fails review.

## Failure modes (reference-only)
GR-18 (narrated above); path claims edited from secondary sources →
GR-17 (narrative: `distillation/glossary.md`); permission gaps papered
over as if solved → GR-3.

## Verifier
`verifiers/lint/parity_linter.py` (Codex declared `canonical`);
`staleness_linter.py` (the dated-N/A rule);
`verifiers/lint/permission_audit.py` on `config.toml` `[mcp_servers]`.
