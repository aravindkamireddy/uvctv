---
title: Glossary - ontology across the tool matrix
layer: L10
priority: P2
version: 1.5
changelog: v1.5 - Hooks row added to Part B; only Claude Code's surface is verified
date: 2026-09-02
changelog: v1.4 - Cursor skill cell corrected: it HAS a global skills dir (GR-17 class error - an absence was asserted, not verified)
changelog: v1.2 fix-batch C - Cursor column added to Part B (all rows widened to 7); Codex skill cell corrected. v1.1 GR-17 fix - Antigravity Part B row corrected to primary-doc paths; owns the GR-17 narrative
source_model: Claude Fable 5
depends_on: [MANIFEST.md, tools/generic-adapter.md]
usage: The vault's controlled vocabulary. Two parts: cross-tool concept definitions (durable), and the concept-to-tool-term mapping (perishable, [VERIFY]-dated). When vault files disagree with a tool's marketing vocabulary, this file arbitrates.
audience: solo, architect, team
tools: all
---

# Glossary - One Ontology, Many Dialects

Tools name the same five things differently, and half of cross-tool
confusion is vocabulary. Part A defines each concept once, in vault
terms; Part B maps concepts to each tool's native word. Vault files use
Part A's terms; the mapping is how you read any tool's docs back into
the architecture.

## Part A - Concepts (durable)

**Instruction file.** The per-repo document carrying only what an agent
cannot infer from the codebase: overview, exact commands, pins,
ask-first, never-do. Cross-tool standard: `AGENTS.md`. Law: reference,
never restate (One Hard Rule).

**Skill.** A lightweight, file-based, description-triggered task
definition - the *brains* telling an agent how and when to act.
Iterated continuously; triggering is description-driven.

**Subagent / role.** An agent instance with an isolated context and a
capability shape (allowlist) cut to one output type. The role IS the
shape; the prompt merely describes it.

**Swarm.** Multiple agents in parallel with file-ownership isolation -
disjoint zones, written map, defined merge order. Not a speed setting;
an architecture with preconditions.

**MCP (server).** The stateful client-server protocol giving an agent
*hands* - external tools, databases, services. Built once per
environment; governed by the registry.

**Registry (MCP).** The least-privilege matrix: server | purpose |
roles | read/write scope | approval triggers | credential handling.
The matrix is the deliverable; "connected" is not.

**Guardrail.** A failure pattern converted to a permanent, tested
constraint (six-field entry). Narratives live once each with owner
files; tables stay compact.

**Plan/build separation.** Research-and-decide as a mode that cannot
edit, producing the five-part plan artifact; the build's brief is the
approved plan.

**Context reset.** Deliberate boundary between concerns, crossed via a
purpose-written artifact (failure note, plan, handoff) - never via the
transcript.

**Design contract.** `DESIGN.md`: tokens by role-name, closed scales,
one-way flow from design surface to every coding agent.

**Verifier.** The mechanical floor under any promise: trigger-test
suites, the four linters, acceptance checklists. Strong verifier + weak
generator ≈ strong system.

**Trigger test / suite.** 10-30 cases (prompt | should-trigger |
expected behavior | pass/fail), ≥3 should-NOT boundary cases, ≥3
indirect phrasings; conduct cases where the asset makes structural
claims.

**Personal layer / team layer.** Same formats; different placement and
governance. Personal: `~/agent-toolkit/`, self-trust, `P-n` guardrail
namespace. Team: in-repo, PR-reviewed, enumerated roles, CI floor.

**Ownership map.** Launch artifact for any parallelism: agent → exact
dirs, intersections mechanically verified empty, shared packages in no
zone.

**UNENFORCED-\<tool\>.** The honesty marker: a registry field with no
mechanism in a given tool - a standing finding, never a silent gap.

**N/A + reason.** A parity cell where no native container exists,
pointing at a landing file that says where the capability lives
instead. Never "capability lost."

## Part B - Concept → tool term (perishable, all `[VERIFY 2026-07]`)

| Concept | Claude Code | OpenCode | Antigravity | Codex CLI | Command Code | Cursor | Zed | OpenClaw |
|---|---|---|---|---|---|
| Instruction file | `AGENTS.md` native + `CLAUDE.md` layer | `AGENTS.md` native + `opencode.json` | `GEMINI.md` alias | `AGENTS.md` (origin) | settings.json | `AGENTS.md` or `.cursor/rules` | `~/.config/zed/AGENTS.md` + project | gateway config |
| Skill | `SKILL.md` under `.claude/skills/` | agent `.md` port (+ global `skills/`) | `.agents/skills/` (workspace), `~/.gemini/config/` (global) | `~/.codex/skills/` (user), `.agents/skills/` (project) | `.commandcode/skills/` (+ `.agents/skills/`) via `/skills` | `~/.cursor/skills-cursor/` (global), `.cursor/rules/*.mdc` (project) | `~/.agents/skills/` flat | `~/.openclaw/skills` or `--global` |
| Subagent | subagents, `.claude/agents/`; Agent Teams | `mode: subagent` agents; built-ins General/Explore/Scout; primaries Build/Plan | swarmed agents under Agent Manager | - (profiles + operator) | plugins | thin/absent | External Agents (ACP) | dispatched coding agents |
| Swarm isolation | briefs + review | sessions/worktrees | `@workspace_scope` | worktrees (operator) | - `[VERIFY]` | per-project rules | per-project | gateway sessions |
| Permission surface | frontmatter allow/deny lists, hooks, managed settings | per-agent `permission:` blocks | scope + guardrails culture (thin per-agent denial) | `approval_policy` + `sandbox_mode` | - `[VERIFY]` | ~40-tool budget across servers | `agent.tool_permissions` per-tool keys | node command allow-list + device pairing |
| MCP config | `.mcp.json` | `opencode.json` `mcp:` | tool MCP config | `config.toml` `[mcp_servers.*]` | `/mcp` | `~/.cursor/mcp.json`, `.cursor/mcp.json` | `context_servers` in settings.json | gateway MCP config |
| Hooks | `hooks.json` PreToolUse/PostToolUse | plugin events `[VERIFY]` | `[VERIFY]` | native, explicit trust `[VERIFY]` | `[VERIFY]` | third-party adapter `[VERIFY]` | `[VERIFY]` | gateway policy |
| Plan mode | plan mode | `Plan` primary agent | plan pass pre-launch | read-only first session (operator) | - `[VERIFY]` | - `[VERIFY]` | - `[VERIFY]` | - `[VERIFY]` |

Row-level gaps are Part A concepts landing via the generic-adapter
method (AGENTS.md quality → operator procedure → structural enforcement
→ linters).

## Worked incident: GR-17 - secondary-source path drift (narrative owner)

**Setup.** Part B of this glossary maps concepts to each tool's native
term and path. Every row is `[VERIFY]`-dated precisely because those
facts rot. During a July update, an adopter supplied a configuration
document for tool A (OpenCode) that happened to contain a comparison
table listing *other* tools' config directories - including
`~/.antigravity/` for Antigravity.

**Failure.** That table was treated as authoritative and used to
"correct" a `[VERIFY]`-tagged row that had been right. The wrong path
propagated into both installers, both bootstrappers, and this file's
Part B, and shipped in a packaged release. Anyone running the installer
would have had a junction created into a directory Antigravity never
reads - and the failure mode is silent: links appear, `converged`
prints, zero skills load. Primary-source research a day later showed
Antigravity's global root is `~/.gemini/`, exactly what the
pre-"correction" row had said.

**Root cause.** Not the tag - the tag was doing its job. The defect was
accepting tool A's *summary of tool B* as primary evidence. Vendor
comparison tables are marketing artifacts maintained on nobody's
release schedule; they are the least reliable source for the fact they
appear to settle.

**Permanent constraint** (GUARDRAILS entry GR-17): a `[VERIFY]` row may
only be changed against that tool's OWN primary documentation. A
third-party mention, comparison table, or blog summary is grounds for
re-checking the primary source, never for editing the row directly.
Each Part B row records which source cleared it.

**Test that proves it holds:** every Part B change carries the primary
doc URL in its commit message; a change citing another tool's docs for
the row's tool fails review.

## Failure modes (reference-only)
Vault files adopting a tool's dialect instead of Part A → cross-tool
files stop porting cleanly (GR-5-adjacent vocabulary drift); Part B
treated as durable → syntax rot presented as truth (staleness law).

## Verifier
`staleness_linter.py` on Part B's date; review rule: new vault files
use Part A terms (spot-checked; the ontology is small enough to hold).

## TOOL TRANSFER table
Part B IS the transfer table for vocabulary; unlisted tools get a new
column via the generic-adapter's five-slot mapping (slot answers are
exactly a Part B column).
