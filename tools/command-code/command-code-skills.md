---
title: Command Code - install notes (consumes the canonical skills unchanged)
layer: L2
priority: P0
version: 2.0
date: 2026-07-26
source_model: Claude Fable 5
changelog: v2.0 fix-batch D - was a 6-section bundle restating every canonical workflow in paraphrase (GR-19). Command Code implements the Agent Skills standard and honors CLAUDE_* aliases, so the canonical files load as authored; this file is now install notes only. Paths verified against commandcode.ai/docs/skills 2026-07.
depends_on: [skills/skill-writer/SKILL.md, verifiers/lint/README.md]
usage: Read when installing the vault's skills into Command Code. Contains zero skill content by design - the skills live in skills/<name>/SKILL.md.
audience: solo, architect, team
tools: command-code
---

# Command Code - Install Notes

Command Code fully implements the [Agent Skills open standard] and
honors `${CLAUDE_SKILL_DIR}` / `${CLAUDE_PROJECT_DIR}`-class aliases, so
**every canonical skill in `skills/` loads unchanged** - no port, no
translation, no second copy. This file exists to record where they go
and which Command Code specifics matter.

## Install locations (verified 2026-07)

| Scope | Path | Notes |
|---|---|---|
| User (all projects) | `~/.commandcode/skills/<name>/SKILL.md` | what `install.{sh,ps1}` links |
| Project | `.commandcode/skills/<name>/SKILL.md` | committed, team-visible |
| Cross-tool | `.agents/skills/` (project), `~/.agents/skills/` (user) | also discovered; shows a `[.agents]` badge |
| Anywhere | `skills: [...]` array in `settings.json` | point Command Code straight at `~/agent-toolkit` - **no symlink needed at all** |

Precedence: `.commandcode/` (project) > `.agents/` (project) >
`~/.commandcode/` (user) > `~/.agents/` (user) > extra locations >
bundled. Shadowed copies are reported, never silently dropped.

## Command Code specifics worth knowing

- **Filename case is validated:** `SKILL.md`, not `skill.md`. Lowercase
  loads nothing, silently - the GR-6 shape (see fix-batch E).
- **Directory name must match the `name` field**, or the skill is
  skipped with a categorized warning.
- **Optional frontmatter this vault can use:** `when_to_use` (extra
  trigger phrasings appended to the model-facing catalog - a direct
  lever for the GR-6 description-tuning law), `disable-model-invocation`
  (explicit-only; the right setting for destructive workflows),
  `allowed-tools` / `disallowed-tools` (the least-privilege surface for
  the security-reviewer role).
- **`cmd skills list --debug`** reports every skill that failed to load,
  grouped by error - run it after install rather than assuming.

## Failure modes (reference-only)
Lowercase filename or mismatched directory name → skill silently absent
→ GR-6 (narrative: `verifiers/description-tuning.md`). Re-restating a
canonical workflow here "for convenience" → GR-19 (narrative:
`verifiers/lint/README.md`).

## Verifier
`verifiers/lint/parity_linter.py` (Command Code declared `canonical`
mode - the canonical files are the check); `cmd skills list --debug`
after install.
