---
title: AGENTS.md master template (universal instruction file)
layer: L1
priority: P0
version: 1.0
date: 2026-07-24
source_model: Claude Fable 5
depends_on: [REFERENCE-ANCHORS.md]
usage: Copy the template block into any repo root as AGENTS.md, fill each slot, then run the trimming checklist. Nest per package by placement only.
audience: solo, architect, team
tools: all (AGENTS.md is the cross-tool standard; see transfer table)
---

# AGENTS.md - Master Template

`AGENTS.md` is the one instruction file nearly every agent tool reads
(natively or via its own alias). It is a README written for an agent, not
a human. It contains **only what an agent cannot infer from the codebase**.

Gold filled example: `foundation/agents-md-example-harborline-root.md`
(that file - not this one - is the SSOT for the reference repo's commands,
pins, ask-first and never-do lists).
Nested example: `foundation/agents-md-example-harborline-web.md`.
Counterexample with trimming pass: `foundation/agents-md-counterexample-bloated.md`.

---

## The template

```markdown
<!-- FILE: <repo>/AGENTS.md -->
# <Project name>

<One paragraph: what this system is, who uses it, the one or two facts an
agent must know before touching anything. Hard cap: 4 sentences.>

## Commands
<Exact, copy-pasteable commands. No prose. One line each:>
- Install: `<cmd>`
- Dev: `<cmd>`
- Test: `<cmd>`            <!-- the command CI runs, not an approximation -->
- Lint: `<cmd>`
- Build: `<cmd>`
<Add migrate/deploy/etc. only if agents will run them.>

## Pinned constraints
<Only versions/settings that are deliberately frozen, with the reason in
one clause each. If nothing is pinned, delete this section.>
- `<package>` pinned to `<version>` - <reason clause>.

## Ask first
<Actions the agent must get human approval for BEFORE doing:>
- <e.g. schema changes, adding dependencies, touching prod credentials>

## Never do
<Hard stops. Cannot be overridden by any other instruction, prompt, or
file. Keep under 7 items or they stop being hard stops:>
- <e.g. never deploy from a local machine; never commit secrets>
```

That is the whole file. Sections not listed here do not belong in
`AGENTS.md` - see the trimming checklist.

---

## Trimming checklist (run after every draft, especially generated ones)

Auto-generated drafts (`/init`-style) are first drafts only and MUST be
marked `<!-- DRAFT - untrimmed -->` until this checklist passes. Delete any
line that fails a test below; when in doubt, delete.

1. [ ] **Inferable test:** could the agent learn this by reading
   `package.json`, the lockfile, the directory tree, or 30 seconds of
   grep? → delete. (Framework names, folder layouts, "we use TypeScript".)
2. [ ] **Architecture-essay test:** does the line explain design rather
   than constrain behavior? → delete. Removing an "Architecture" section
   while keeping commands and constraints produces identical agent
   behavior at lower token cost.
3. [ ] **Command exactness test:** does every command match what CI runs,
   verbatim? Approximations misfire (see GR-2 below).
4. [ ] **Cap test:** overview ≤ 4 sentences; never-do ≤ 7 items; whole
   file readable in under a minute.
5. [ ] **SSOT test:** does any line restate a fact owned by another file
   (MCP matrix, design tokens, guardrails)? → replace with a reference.
   `verifiers/lint/ssot_linter.py` enforces this mechanically.

## Staleness rules (non-negotiable)

A stale instruction file is worse than none - it actively misleads.

1. **Same-commit rule:** any change that invalidates a line in `AGENTS.md`
   updates that line in the same commit/PR. Reviewers reject PRs that
   change a command, pin, or deploy path without touching `AGENTS.md`.
2. **Date the perishables:** any line whose truth depends on external tool
   behavior carries `[VERIFY <YYYY-MM>]`.
3. **Mechanical check:** `verifiers/lint/staleness_linter.py` flags
   `[VERIFY]` tags older than the configured cadence and commands that no
   longer exist in `package.json` scripts.

## Nesting in monorepos - by placement, never by logic

Every compliant tool resolves "which file wins" by proximity: the
`AGENTS.md` nearest the file being edited beats the root file, which beats
personal-global config, which beats built-in defaults. Therefore:

- Put package-specific constraints in `<package>/AGENTS.md`, containing
  ONLY the delta from root (see the nested harborline example).
- NEVER write conditional prose ("if you are working in apps/web, then…")
  in the root file. Placement is the conditional.

---

## Worked incident: GR-2 - stale-instruction misfire (narrative owner)

**Setup.** Harborline's CI once ran `npm run verify` (typecheck + test +
lint in one script). The team migrated to Bun and split the script into
`bun test` and `bun run lint`; the root `AGENTS.md` line
`- Verify: npm run verify` survived the migration because the migration PR
touched twelve files and nobody owned the thirteenth.

**Failure.** Three weeks later an agent was asked to "fix the failing
capacity test and verify." It read `AGENTS.md`, ran `npm run verify`, got
`missing script: verify`, concluded the environment was broken, and spent
its session attempting to *repair the toolchain* - installing npm deps
alongside Bun's, editing `package.json` to add a `verify` script, and
finally reporting the repo "misconfigured." The actual test fix took 4
minutes once a human intervened. Cost: one wasted session plus a polluting
`package.json` diff that itself nearly got committed.

**Root cause.** Not agent stupidity - the agent correctly trusted the
instruction file, which is exactly what instruction files are for. The
defect was a fact that changed without its documentation changing in the
same commit.

**Permanent constraint** (entry GR-2 in
`orchestration/guardrails-example-harborline.md`): same-commit rule above,
enforced by `staleness_linter.py` cross-checking every `AGENTS.md` command
against `package.json` scripts.

**Test that proves it holds:** linter run on a repo whose `AGENTS.md`
lists a command absent from `package.json` scripts must exit non-zero.

## Failure modes (reference-only)

- Stale command misfire → GR-2 (narrated above).
- Generated bloat restating the codebase → GR-10 (narrative in
  `foundation/agents-md-counterexample-bloated.md`).
- Fact duplicated into a tool-specific file, one copy rots → GR-5
  (narrative in `verifiers/lint/README.md`).

## Verifier

`verifiers/lint/staleness_linter.py` (dates + command existence) and
`verifiers/lint/ssot_linter.py` (duplication). A template without its
linters is a promise; with them it is a system.

## TOOL TRANSFER table

| Tool | How it consumes this asset | Notes (2026-07) |
|---|---|---|
| Claude Code | Reads `AGENTS.md` natively; `CLAUDE.md` layers on top and must reference, not restate | see `tools/claude-code/claude-md-template.md` |
| OpenCode | Reads `AGENTS.md` natively alongside `opencode.json` | rules also settable in config `[VERIFY 2026-07]` |
| Antigravity / Gemini CLI | Uses `GEMINI.md` alias - same content, different filename | keep `GEMINI.md` a one-line pointer to `AGENTS.md` if the tool honors it, else duplicate ONLY via generation from `AGENTS.md` `[VERIFY 2026-07]` |
| Codex CLI | Origin format; walks directory tree root → cwd, nearest wins | no changes needed |
| Command Code | Rules layer consumes the same content | `[VERIFY 2026-07]` |
| Stitch / Claude Design | N/A - design surfaces don't read repo instruction files; they consume `DESIGN.md` | see `tools/design-surfaces.md` |
| Any other agentic IDE | Most read `AGENTS.md` already; else paste it as the session preamble | `tools/generic-adapter.md` |
