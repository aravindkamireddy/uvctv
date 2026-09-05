---
title: Cursor - config template, install notes and parity rationale
layer: L2
priority: P0
version: 1.0
date: 2026-07-26
source_model: Claude Fable 5
depends_on: [skills/skill-writer/SKILL.md, tools/generic-adapter.md]
usage: SCOPE NOTE (fix-batch C): triage planned two files (cursor-config-template.md + cursor-parity-notes.md); Cursor exposes too thin a config surface to fill two without padding, so both land here as sections. Read when adopting the vault with Cursor. Cursor has no global rules DIRECTORY, so its treatment differs from the other five - the inheritance path below is the primary route.
audience: solo, architect, team
tools: cursor
---

# Cursor - Install Notes

Cursor has a **global skills directory on disk**:
`~/.cursor/skills-cursor/`, holding one folder per skill with `SKILL.md`
inside - the same canonical shape as every other tool in the matrix. It is
therefore a normal link target, not a special case.

**Correction (2026-09-02):** this file previously stated Cursor had no
global directory and inherited skills via Claude-skill import. That was
wrong. The claim asserted an ABSENCE, which is exactly the kind of thing
GR-17 says to verify against the tool's own evidence rather than infer -
an absence is harder to prove than a presence, and I inferred it. Corrected
from a directory listing of a real `~/.cursor` install. `agents/` also
exists there but was empty; it is left unwired until its contents confirm
what it holds.

## Capability mapping (verified 2026-07)

| Slot | Cursor | Status |
|---|---|---|
| Instruction file | `AGENTS.md` in project root - an alternative to `.cursor/rules` for straightforward cases | verified |
| Skill unit | `.cursor/rules/*.mdc`, frontmatter decides activation: Always Apply / Auto Attached (globs) / **Agent Requested** (description-based) / Manual | verified |
| Global skills dir | `~/.cursor/skills-cursor/<name>/SKILL.md` | VERIFIED 2026-09-02 (operator directory listing) - **the primary route** |
| Global agents dir | `~/.cursor/agents/` | exists, empty on the reference install - unwired pending evidence |
| Claude-skill import | Cursor also loads Claude-format skills as agent-decided rules | verified - now a FALLBACK, not the mechanism |
| MCP | `~/.cursor/mcp.json` (global), `.cursor/mcp.json` (project; project wins) | verified |
| Permission surface | thin; roughly 40 active tools across all servers before the agent silently loses access to some | verified - treat as a budget, audit accordingly |
| Legacy | `.cursorrules` still supported but deprecated; migrate to rules or AGENTS.md | verified |

## How the vault's skills reach Cursor

**Primary:** the setup script and CLI link `~/.cursor/skills-cursor` to
your toolkit's `skills/` directory, exactly as they do for Claude Code,
Codex, Command Code, Antigravity and Zed. The canonical `description:`
field becomes the routing text - the mechanism the GR-6 description-tuning
law addresses.

**Secondary (automatic, no setup):** Cursor also imports Claude-format
skills, and `~/.claude/skills` is linked too, so skills may appear twice.
Harmless - same files, same content - but if Cursor reports duplicates,
unlink one of the two.

**Fallback (per project, if import is off or unavailable):** re-express
a skill as a rule -

```
.cursor/rules/orchestrator.mdc
---
description: <copy the canonical skill's description verbatim>
alwaysApply: false
---
<body: the canonical workflow>
```

`alwaysApply: false` + a description is Agent Requested mode - the
model decides relevance from the description, so under-triggering
(GR-6) and over-triggering (GR-9) behave identically to every other
tool. `alwaysApply: true` is the GR-9 trap: it loads on every session.

**Not recommended:** copying skill bodies into `.cursor/rules/` at
user scope. That re-creates the duplication D removed (GR-19).

## Failure modes (reference-only)
`alwaysApply: true` on a heavyweight skill → context flood → GR-9
(narrative: `verifiers/eval-loop.md`). Rule bodies copied instead of
imported → GR-19 (narrative: `verifiers/lint/README.md`). MCP tool
budget exceeded → tools silently unavailable → GR-3-adjacent surprise;
audit against `mcp/registry.md` as usual.

## Verifier
`verifiers/lint/parity_linter.py` (Cursor declared `canonical` via
import); `permission_audit.py` on `.cursor/mcp.json`.
