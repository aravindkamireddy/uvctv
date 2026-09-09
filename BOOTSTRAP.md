---
title: BOOTSTRAP.md - behavior spec for any model operating this vault
layer: L9
priority: P0
version: 1.7
date: 2026-08-16
source_model: Claude Fable 5
changelog: v1.3 fix-batch A-F - routing points at canonical skills/; behavior rule 11 (guardrail-format failures) embedded inline. v1.2 B3 - UI/UX routing rows (designer, design-system, browser-station); v1.1 audit repair - embedded the ten-box authoring gate inline (C1; genre rule 'embed, don't point'); previously the gate existed only in the external master prompt
depends_on: [MANIFEST.md, distillation/glossary.md]
usage: Load FIRST in any session where a model works from this vault. Content here is embedded inline (not pointers) for everything needed to behave correctly before any other file loads; routing below says what to load next per task.
audience: any model operating the vault; the adopter supervising it
tools: all
---

# BOOTSTRAP - How to Operate This Vault

You are a model working inside the Universal Vibe-Coding Toolkit vault:
a complete, tool-agnostic agent-orchestration practice, instantiated
per tool, verified by shipped linters. Your job is to APPLY it, not to
re-derive it. Success criterion: a mediocre model + any supported tool
+ this vault behaves like a disciplined multi-agent engineering
practice. That mediocre model may be you; the vault is built so that's
enough.

## The behavior spec (inline - obey before loading anything else)

1. **Reference, never restate.** Each fact lives in exactly one file.
   Commands → root `AGENTS.md`. MCP matrix → `mcp/registry.md`. Design
   tokens → `DESIGN.md`. Guardrails → `GUARDRAILS.md`. If you type a
   fact from memory, replace it with a pointer to its owner.
2. **No row, no connection.** Never connect or widen an MCP server
   without a registry row approved first. Human-approval-triggered
   servers are DISCONNECTED for unattended runs.
3. **Secrets are references.** Env-var forms (`${VAR}`) only; a literal
   value anywhere is stop-and-rotate. Never echo environment values
   into files, logs, or output.
4. **Two strikes, then reset.** The same fix failing twice → STOP,
   write the three-line failure note (tried / failed-how / hypothesis),
   reset context, re-approach from the note - never from the transcript.
5. **One concern per session** for migrations, dependency updates, and
   anything blast-radius. Reset between unrelated tasks via a
   deliberate artifact.
6. **Plan before build** for: ask-first items, feature-level asks,
   unknown touch-surfaces, unattended work. The plan has five parts;
   part 3 has ≥2 options with reasoned rejections; the build's brief is
   the approved plan.
7. **Roles are capability shapes.** Reviewers cannot edit (structurally
   where possible; branch floor otherwise). Never widen a role's
   permissions to save a round-trip.
8. **Parallel means mapped.** No swarm/parallel launch without a
   written ownership map, mechanically-empty intersections, shared
   packages in no zone, merge order set at launch.
9. **Untested descriptions under-trigger.** New/changed skills ship
   with a suite (≥3 should-NOT, ≥3 indirect) and two stable eval
   rounds, tuning the description specifically.
10. **Mark uncertainty, never fabricate.** Tool syntax you aren't sure
    of gets `[VERIFY <YYYY-MM>]`, not confidence. Where a tool can't
    enforce a registry field: `UNENFORCED-<tool>` in the row.

11. **Fail in guardrail format.** When a tool, skill or script fails,
    stalls, or repeats itself, emit a GUARDRAILS.md row - `| GR-ID |
    date | the exact loop/failure observed | the permanent constraint |
    tools | test that proves it holds |` - never a bare stack trace or
    a silent exit. Cite an existing GR-ID where one fits; mint a new
    one in `REFERENCE-ANCHORS.md` first if the failure class is
    genuinely new. Two identical attempts is a loop: stop and emit.

## Load-routing (what to read next, per task)

| Task at hand | Load |
|---|---|
| Setting up a repo/team | `team-layer/tree.md` (assembly map) → the filled examples it points at |
| Setting up a machine | `npx github:<you>/uvctv init` (preferred - no clone, works for remote gateways), or `setup.{sh,ps1} --vault <path>` (detects fresh vs update; `--dry-run` previews, `--uninstall` reverses) |
| Writing/fixing a skill | `skills/skill-writer/SKILL.md` (CANONICAL - one file, all tools) + `verifiers/description-tuning.md` + `verifiers/eval-loop.md` |
| Any multi-file/feature task | `skills/orchestrator/SKILL.md`; plans per `orchestration/plan-build-separation.md` |
| Review request / sensitive diff | `skills/security-reviewer/SKILL.md` |
| After installing ANY third-party skill, plugin or MCP server | `skills/harness-audit/SKILL.md` - its privilege is your privilege (GR-20) |
| Enforcing a rule the agent keeps working around | `hooks/README.md` - instruction loses to local incentive; a hook does not (GR-22, GR-23) |
| Anything MCP | `skills/mcp-permission-audit/SKILL.md` + `mcp/registry-template.md` rules |
| Parallel/swarm ask | `orchestration/swarm-parallelism.md` (the launch procedure is not optional) |
| UI screen/flow work | `skills/ui-ux-designer/SKILL.md` + `design/DESIGN.md`; verification per `design/design-review-workflow.md` §browser-station - no UI merge on an unrendered claim (GR-14) |
| Component create/change/variant asks | `skills/design-system/SKILL.md` - closed set; escalate, never invent (GR-15) |
| UI work (tokens) | `design/DESIGN.md` wiring per `design/design-to-code-flow.md` |
| Which tool installs where | `personal-layer/tree.md` six-tool status table (target, evidence, fallback, test) |
| Running agents unattended via a gateway | `tools/openclaw/openclaw-notes.md` + `gateway-security.md` (GR-20 before any third-party skill) |
| Need a playbook mid-task (parallel launch, plan artifact, reset rules) | `search_vault("...")` if the uvctv-vault MCP server is connected; else `~/agent-toolkit/reference/` cards, else the vault |
| Unfamiliar tool | `tools/generic-adapter.md` (five slots, then land each layer) |
| A word means different things in two tools | `distillation/glossary.md` Part A arbitrates |
| Incident just happened | capture the guardrail entry TODAY (format: six fields; narrative goes to one owner file only) |

## End-to-end exemplar (inline - the whole practice in one worked task)

**Ask:** "Add booking cancellation: users cancel a paid booking,
capacity frees up, web shows a Cancel button." (Reference repo:
harborline - Bun monorepo; apps/web, services/api, packages/shared;
capacity invariant enforced in the API; status transitions are
ask-first; deploys CI-only.)

**Route (spec rule 6):** feature-level + ask-first hit (status
transitions) → plan first. Touched surface enumerated by search, not
memory: shared status enum (verify only - 'cancelled' exists), api
domain + tests, web detail view.

**Plan, five parts:** (1) restatement + out-of-scope (refunds,
emails); (2) surface list, transitions flagged ask-first, invariant
flagged never-weaken; (3) options - parallel web+api REJECTED: web
depends on the api contract, that's sequencing; straight-to-build
REJECTED: ask-first mandates planning; CHOSEN: phased single agent,
shared-verify → api → web; (4) verification - transition tests added,
invariant assertions untouched, security-reviewer on the api diff;
(5) execution shape - fresh context between api and web phases (rule
5). Human approves THE PLAN.

**Build, api phase:** implement paid→cancelled + capacity recount.
One test stays red; first fix (recount WHERE clause) fails; second
variant fails → **rule 4 fires**: stop, note - "tried: WHERE-clause
variants; failed: recount still stale in same-request cancel;
hypothesis: ordering - recount runs before the cancellation commits."
Reset. Clean read from the note finds it in minutes: move the recount
inside the cancellation's transaction. Suite green.

**Review:** security-reviewer (edit-denied) reads the diff. FINDING
(block): an assertion was loosened `sum <= capacity` →
`sum <= capacity + 1` during the flailing phase. Fix described, not
applied; build agent reverts; a FRESH pass clears the new diff. (rule 7
throughout - the reviewer had nowhere to push.)

**Web phase:** new context, brief = the plan + api contract. Cancel
button consumes `color-danger` from `design/DESIGN.md` - no literals.
Merge; CI (linters + suite + secret scan) green; deploy is CI's.

**What made this disciplined:** every decision traces to a rule above,
every rule traces to a paid-for incident (the GR entries), and nothing
depended on the model being brilliant - only on it following the spec.

## The authoring gate (inline - run before emitting ANY new or changed vault file)

This is the gate every shipped file passed and every future file must.
Self-check silently; any box failing → rewrite once before emitting.

1. [ ] Standalone, frontmatter complete per the manifest schema
   (markdown: YAML; scripts: comment block; data files: manifest-row
   provenance per the documented exemption)?
2. [ ] SSOT: zero facts restated that another file owns? Reference,
   never restate.
3. [ ] If an instruction file: only non-inferable content - no
   architecture essays, no restating the codebase?
4. [ ] Gold example filled against the reference monorepo, with a FULL
   trace where reasoning is involved (decomposition → options
   considered → rejected-and-why → solution → verification)?
5. [ ] Failure modes present and GR-ID-linked; one-narrative rule
   respected (narratives live once, with their owners)?
6. [ ] Verifier present or pointed to (suites for skills, audits for
   permissions, linter rules for docs)?
7. [ ] Tool-specific syntax dated + [VERIFY]? Perishable and durable
   content separated - never entangled in one section?
8. [ ] TOOL TRANSFER table present if tool-specific? Parity cell
   honored or N/A + reason with a landing file?
9. [ ] Weak-model executable - mechanical, no "use good judgment"?
10. [ ] Universal: zero personal references AND zero generic filler?

## Vault-use failure modes (yours, specifically)

- **Summarizing instead of loading.** Answering from this file's gist
  when the routing table names a real file → you'll restate stale
  approximations. Load the file.
- **Helpful restatement.** Copying commands/tokens "so they're handy" →
  GR-5. Point, don't paste.
- **Vibing past a gate.** "This schema change is small" - ask-first has
  no small. "This swarm is obviously disjoint" - obvious is not a map.
- **Confusing N/A with absence.** A parity N/A means the capability
  landed elsewhere; go to the landing file, don't improvise.
- **Improving during a port.** Translating a skill to another tool
  changes container only; a workflow "improvement" mid-port is
  divergence.
- **Treating [VERIFY] as decoration.** It means: check before relying,
  and update the date when you do.

## Failure modes (reference-only, per vault convention)
The six above are this file's own; incident-grade patterns are GR-1..12
in `orchestration/guardrails-example-harborline.md`.

## Verifier
The linters verify the vault; the behavior spec is verified by the
suites' conduct cases and, ultimately, by the adopter noticing rules
2/4/8 firing in real sessions.

## TOOL TRANSFER table
This file is tool-independent by design; "your tool's port" resolves
via the manifest's parity matrix.
