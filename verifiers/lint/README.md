---
title: Lint suite - what each linter enforces (+ GR-5 narrative)
layer: L6
priority: P0
version: 1.0
date: 2026-07-24
source_model: Claude Fable 5
depends_on: [MANIFEST.md, mcp/registry-template.md, foundation/agents-md-template.md]
usage: Read before running or extending the four linters. Owns the GR-5 narrative (duplicated-fact staleness) - the incident that justifies the whole lint layer.
audience: solo, architect, team
tools: all
---

# Lint Suite - The Enforcement Floor

The vault's operating principles are enforced by shipped linters, not by
promises. Four scripts, all stdlib Python 3.10+, all exit non-zero on
violation (CI-ready), all driven by small JSON rule files kept next to
the content they police (so rules change in the same commit as the facts
they guard).

| Script | Enforces | Rule input | Run |
|---|---|---|---|
| `ssot_linter.py` | The One Hard Rule: each fact lives in exactly one file | `ssot.rules.json` - fact classes: owner path + detection patterns + allowed reference forms | `python3 ssot_linter.py --rules ssot.rules.json <root>` |
| `staleness_linter.py` | `[VERIFY]` date cadence; AGENTS.md commands exist in package.json scripts; draft markers never merge; generated-copy freshness | `staleness.rules.json` - cadence days, command-file pairs, marker strings | `python3 staleness_linter.py --rules staleness.rules.json <root>` |
| `parity_linter.py` | Every L2 core-skill × tool cell = existing file or N/A+reason pointing at a landing file; suite format (≥3 NOT-cases, ≥3 indirect) | `parity.matrix.json` - the manifest's matrix, machine-readable | `python3 parity_linter.py --matrix parity.matrix.json <root>` |
| `toolkit_linter.py` | **The product, not the repo.** Extracts the vault's payloads to a temp toolkit and fails if any installed file references a path that does not exist there, or if a `shared/` file no skill mentions (dead wiring) | the vault itself | `python3 toolkit_linter.py <vault>` |
| `permission_audit.py` | Config ↔ registry conformance: every configured server has a row; roles/scope/credentials match; no literal secrets; no expired exceptions | registry markdown + per-tool config parsers | `python3 permission_audit.py --registry mcp/registry.md <root>` |

Note the asymmetry: five linters must FAIL their planted fixtures; `toolkit_linter` must PASS the real vault, because there is only one product and no synthetic version of it worth testing.

Composition: `run-all` = all four in sequence; first failure is not
fatal to the run (report everything, then exit worst status) - a linter
that stops at the first finding trains people to fix one thing and
retry forever.

## Extending the suite
New fact class → add an `ssot.rules.json` entry (owner + patterns) in
the same commit that creates the owner file. New tool → add a parser
stanza to `permission_audit.py` and a matrix column entry (the
generic-adapter's L6 rule). Never encode a rule in prose only - if it
matters enough to write, it matters enough to detect.

---

## Worked incident: GR-5 - duplicated-fact staleness (narrative owner)

**Setup.** Harborline's early `CLAUDE.md` was written before the
reference-not-restate rule existed. Someone copied the Commands block
from `AGENTS.md` into it - "so Claude sees them without another file
read." Both copies said `bun run test:api` for the API suite.

**Failure.** A test-infra PR later renamed the script to
`bun test --filter api` and dutifully updated `AGENTS.md` in the same
commit (the same-commit rule worked!) - but nobody remembered the copy
in `CLAUDE.md`, because nobody remembers copies; that is what makes
them copies. For the next month, sessions that happened to weight
`CLAUDE.md` ran the dead command, got `Script not found`, and improvised:
some ran the full suite (slow, masked the filter's purpose), one
"helpfully" re-added a `test:api` alias to `package.json` - re-creating
the retired script as a wrapper, which then drifted from the real
invocation's flags. The wrongness was intermittent - sessions reading
`AGENTS.md` behaved perfectly - which made it maddening to diagnose:
intermittent staleness looks like model flakiness, and the team burned
days blaming the wrong layer.

**Root cause.** Not the rename, which followed the rules. The copy. A
fact in two files has two update sites and one update habit; divergence
is a *when*, not an *if*. Prose rules ("keep them in sync!") don't fix
this because sync failures are silent precisely where attention isn't.

**Permanent constraints** (entry GR-5 in
`orchestration/guardrails-example-harborline.md`): the One Hard Rule
with mechanical enforcement - `ssot_linter.py` in CI treats every
tool-layer file as reference-only for AGENTS.md-owned fact classes;
`CLAUDE.md`-class files carry pointers, period.

**Test that proves it holds:** planting `bun test` (a root-owned
command string) as an instruction line in `CLAUDE.md` must fail the
linter; the pointer form ("commands: see AGENTS.md") must pass.

## Failure modes (reference-only)
GR-5 (narrated above); rules maintained in prose but absent from rule
files → enforcement theater; linter rule added without owner file in
same commit → the linter itself violates same-commit.

## Verifier
The suite verifies the vault; the suite's own fixtures (planted
violations in `verifiers/lint/fixtures/`, one per linter) verify the
suite - each linter must fail its fixture in CI, or the run is red.

## TOOL TRANSFER table
Linters run on files and are tool-independent; `permission_audit.py`'s
parser stanzas are the per-tool surface (add stanzas per
`tools/generic-adapter.md` L6 rule).
