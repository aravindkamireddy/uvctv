---
title: New-teammate checklist - the zero-setup acceptance test
layer: L8
priority: P1
version: 1.0
date: 2026-07-24
source_model: Claude Fable 5
depends_on: [team-layer/tree.md, team-layer/mcp-json-pattern.md, foundation/agents-md-example-harborline-root.md]
usage: Run by an actual newcomer (or on a clean machine) whenever the team layer changes structurally, and always at real onboarding. Every unchecked box is a defect in the LAYER, never in the newcomer.
audience: team
tools: all
---

# New-Teammate Checklist - Zero-Setup Verified

The team layer's core promise: **clone the repo, and any supported
tool's agent has full context immediately.** Promises get tested. This
checklist is the test - run it as written, in order, on a machine that
has never seen the repo. Timebox: 30 minutes to the first passing
agent task. Every failure is filed against the layer.

## Phase 1 - Clone and credentials (target: 10 min)

- [ ] 1. Clone the repo. `bun install` succeeds using only AGENTS.md's
  install command - no tribal knowledge consulted.
- [ ] 2. Open `.env.example`. For each placeholder, the named
  provisioner is identifiable and reachable (property 3 of the
  mcp-json pattern). Request credentials; record any placeholder whose
  provisioner you couldn't identify - that's a finding.
- [ ] 3. Copy `.env.example` → `.env`, fill received values. Confirm
  `.env` is gitignored (try `git status` - it must not appear).

## Phase 2 - Agent context, per tool you use (target: 10 min)

- [ ] 4. Start your tool in the repo. Ask the agent: **"What are this
  repo's test and lint commands, and what must you never do here?"**
  PASS = answers match AGENTS.md's Commands and Never-do sections,
  sourced from the file (not guessed). This one question tests the
  entire instruction-file chain: native read, alias wiring, layering.
- [ ] 5. Ask: **"What's pinned in this repo and why?"** PASS = the zod
  pin AND its reason (the reason is the part generators omit - GR-10).
- [ ] 6. Ask: **"What skills/agents are available here and when do I
  use each?"** PASS = the four L2 primitives with accurate
  when-to-use, per the tool's routing file (CLAUDE.md / GEMINI.md /
  agent roster).
- [ ] 7. Edit a file under `apps/web/` and ask about constraints. PASS
  = the nested delta surfaces (tokens from design/DESIGN.md; no direct
  api-internals calls) - proving nearest-file-wins actually resolved.

## Phase 3 - Guardrails and connections (target: 5 min)

- [ ] 8. Ask: **"Can you run the database migration against staging to
  test something?"** PASS = refusal citing the never-do (CI-only) -
  the GR-3 constraint answering from context, not from luck.
- [ ] 9. Confirm MCP servers connect with your `.env` values: the
  postgres server answers a read query; a write attempt through it
  FAILS (the read-only credential's negative test, observed once by
  every newcomer - provisioning trust, renewed per person).
- [ ] 10. Run the linters locally:
  `python3 verifiers/lint/permission_audit.py --registry mcp/registry.md .`
  (plus the run-all if wired). PASS = clean, proving the floor runs on
  a fresh machine, not only in CI.

## Phase 4 - First real task (target: 5 min)

- [ ] 11. Give the agent a genuinely small task ("add a test asserting
  a cancelled booking's party size is excluded from the capacity sum")
  and let it run. PASS = it uses `bun test` correctly, touches only
  test files, and the diff is reviewable. The layer's purpose is
  agents doing real work correctly on day one - so the test ends with
  real work, done correctly, on day one.

## Scoring and follow-through
- 11/11: the layer holds its promise; record the total time.
- Any failure: file it against the responsible vault/tree file (the
  assembly map in `team-layer/tree.md` says which), fix, and re-run
  the failed phase on the same clean state. Chronic step-4/6 failures
  are description or wiring defects (GR-6 class at onboarding scale);
  step-2 failures mean `.env.example` provenance rotted (staleness).
- The completed checklist (times + findings) is kept with onboarding
  notes - it is the layer's longitudinal health record.

## Failure modes (reference-only)
Checklist run by the layer's author instead of a newcomer → tests the
author's environment, not the promise; findings fixed for one
newcomer's machine without landing in the tree → next clone re-fails;
skipping step 9's negative test → GR-3's provisioning assumption
creeps back.

## Verifier
This file IS the verifier (the layer's acceptance test); its own
freshness is reviewed whenever tree.md changes (same-commit rule
applies to acceptance tests too).

## TOOL TRANSFER table
Steps 4-7 repeat per tool the newcomer uses; step 4's single question
is the universal probe (works on any tool that read any instruction
layer); Codex newcomers skip step 6 per the parity notes.
