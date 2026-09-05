---
title: Personal global layer - the ~/agent-toolkit tree (buildable spec)
layer: L7
priority: P1
version: 2.0
date: 2026-09-02
changelog: v1.9 - Cursor row corrected: it HAS a global skills dir; previously recorded as having none
changelog: v1.5 - uninstallers documented; adopt path for pre-existing real directories
changelog: v1.4 fix-batch C/D - per-tool status table (target/evidence/fallback/test) for all six tools; toolkit skeleton collapsed to skills/ + opencode/agents/ + shared/. v1.3 GR-17 fix - Antigravity link target corrected to ~/.gemini/config/
changelog: v1.1 - link targets corrected against OpenCode/Antigravity/Command Code docs
source_model: Claude Fable 5
depends_on: [REFERENCE-ANCHORS.md, skills/skill-writer/SKILL.md, orchestration/guardrails-template.md]
usage: The spec install.sh builds. Read when setting up a new machine or adding a tool to your personal layer. Team-layer counterpart: team-layer/tree.md.
audience: solo, architect
tools: all
---

# Personal Global Layer - `~/agent-toolkit/`

Dotfiles-style: one personal git repo, symlinked machine-wide, carrying
the durable tool-agnostic craft that applies to every project touched.
Same file formats as the team layer, different placement and governance
(self-trust, loose versioning, permissive personal MCP credentials) -
not two systems.

## The tree (fixture per anchors §2)

```
~/agent-toolkit/                          (personal git repo)
├── claude/skills/          → symlinked to ~/.claude/skills/
│   ├── skill-writer/SKILL.md             (the L2 Claude Code files,
│   ├── orchestrator/SKILL.md              installed at personal scope)
│   └── mcp-permission-audit/SKILL.md
├── claude/agents/          → symlinked to ~/.claude/agents/
│   └── security-reviewer.md
├── opencode/agents/        → symlinked to ~/.config/opencode/agents/  (plural, per docs 2026-07)
├── opencode/skills/        → symlinked to ~/.config/opencode/skills/
│   └── (the four L2 OpenCode agent files)
├── antigravity/skills/     → symlinked to ~/.gemini/config/skills/    (Antigravity's global root is ~/.gemini/; workspace skills are .agents/skills/)
│   └── (the four L2 Antigravity skill files)
├── codex/config.toml.global              (copied, not linked - see rule 4)
├── command-code/skills/    → symlinked to ~/.commandcode/skills/     [VERIFY 2026-07: subdir]
├── reference/             ← condensed procedure cards, pulled one at a time
│   ├── plan-build.md      ← when planning is mandatory; the 5-part artifact
│   ├── swarm-launch.md    ← ownership map, merge order
│   ├── context-reset.md   ← reset vs accumulate; what crosses the boundary
│   └── role-design.md     ← allowlist from a role's single output
├── shared/
│   ├── GUARDRAILS.md       ← personal "mistakes my agents keep making" log
│   ├── mcp-registry.md     ← personal MCP servers + credential scope
│   └── DESIGN.md           ← personal default design-token fallback
├── setup.sh                ← ONE script: scaffold, extract, link, update, uninstall
└── setup.ps1               ← Windows twin
```

## Two ways in: the CLI (preferred) or the setup scripts

**`npx github:YOUR-USERNAME/uvctv init`** - one command, no clone, no zip, no platform
twins. This is the preferred path and the only one that works for a REMOTE
OpenClaw gateway, which cannot see your laptop's filesystem: the same git URL
that serves `npx` serves `openclaw skills install <git-url> --global`.

```
npx github:YOUR-USERNAME/uvctv init      # create + link everything detected
npx github:YOUR-USERNAME/uvctv update    # refresh content, keep your edits
npx github:YOUR-USERNAME/uvctv status    # what is linked, what is not, and why
npx github:YOUR-USERNAME/uvctv unlink    # remove only links this toolkit made
```

**`setup.{sh,ps1}`** remain for anyone who would rather not run Node, and are
kept in lockstep with the CLI. Same verbs, same safety rules, same output
shape. If the two ever disagree, the CLI is canonical - it is one
implementation rather than two twins, and every twin divergence in this
vault's history has been a defect.

## Update knows your edits from stale vault content

The toolkit keeps `.uvctv-manifest.json` - a hash of every file as it was
extracted. On update:

- file matches the vault -> nothing to do
- file **untouched** since extraction, vault has moved on -> **refreshed**,
  so vault fixes actually reach you
- file **you edited** -> **kept**, and named in the output so you know which

Before this, update only ADDED missing files. An existing toolkit would keep
its original skills forever while reporting success - stale content behind a
green summary, which is the GR-2 shape. `--force` still takes the vault's
version everywhere, discarding your edits.

## One script, five verbs (setup.{sh,ps1})

`setup.{sh,ps1}` does everything: scaffold, extract, link, update, uninstall.
It **detects** which you need - no toolkit at the target means a fresh install,
an existing one means update - so the common case is one command with no flags
to choose between. Verbs: `--dry-run`/`--check` (preview), `--update`,
`--uninstall` (`--restore`), `--adopt`, `--all`, `--force`.

Previously this was three scripts (bootstrap / install / uninstall) times two
platforms. That split was justified by the one-output-per-role rule, which
governs AGENTS - where capability shape is a safety boundary - not scripts.
Applying it here cost users two commands and two explanations for no safety
gain. Unified 2026-08-11.

Safety is unchanged: never deletes a real directory (GR-16), never overwrites
your edits without `--force`, uninstall removes only links into THIS toolkit,
and failures print as GUARDRAILS.md rows.

**When a real directory already occupies a link target** (you had skills there
before): re-run install with `--adopt` / `-Adopt`. It moves the existing
contents INTO the toolkit, then links - so your files survive and become part
of the toolkit. Name conflicts are reported and left in place, never
overwritten.

## Per-tool status: target, evidence, fallback, test

Every tool gets the same treatment - a stated target, the source that
cleared it, what to do if it does not take, and how to check. A row
without primary-doc evidence keeps its `[VERIFY]` tag until you produce
some (GR-17).

| Tool | Install target | Verification | Fallback if it doesn't take | Test |
|---|---|---|---|---|
| Claude Code | `~/.claude/skills` → `toolkit/skills` | VERIFIED, Anthropic docs | project `.claude/skills/` | ask the agent "what skills do you have available?" |
| Codex | `~/.codex/skills` → `toolkit/skills` | VERIFIED, developers.openai.com/codex/skills | project `.agents/skills/` | same question; `/status` shows config sources |
| Command Code | `~/.commandcode/skills` → `toolkit/skills` | VERIFIED, commandcode.ai/docs/skills | **no symlink needed**: add `"skills": ["~/agent-toolkit/skills"]` to `~/.commandcode/settings.json` | `cmd skills list --debug` - reports every skill that failed to load |
| Antigravity | `~/.gemini/config/skills` → `toolkit/skills` | ROOT verified (`~/.gemini/`); **subdir `[VERIFY 2026-07]`** | 1) retarget to `~/.gemini/config` (parent); 2) per project, link `.agents/skills` → `toolkit/skills` | ask the agent; nothing listed → try fallback 1 first |
| OpenCode | `~/.config/opencode/agents` → `toolkit/opencode/agents` (port) **and** `~/.config/opencode/skills` → `toolkit/skills` | agents VERIFIED (user-supplied docs); **skills format `[VERIFY 2026-07]`** | put standing rules in project `AGENTS.md`, which OpenCode reads natively | ask the agent; check `opencode.json` loaded |
| Cursor | `~/.cursor/skills-cursor` → `toolkit/skills` | VERIFIED 2026-09-02 (directory listing of a real install) | per project: `.cursor/rules/<name>.mdc` with `alwaysApply: false`; also imports from the linked `~/.claude/skills` | ask the agent what skills it has |

Two rows carry live `[VERIFY]` tags (Antigravity subdir, OpenCode skills
format). Both are honest gaps, not oversights: the tools' own docs
confirm the parent locations but not those specifics. Per GR-17 they
are cleared only by that tool's primary documentation or a first-hand
result - not by a third party's comparison table.

## Placement rules

1. **Craft here, facts there.** The personal layer holds skills the
   adopter carries everywhere (the four L2 primitives at personal
   scope) and personal-shared references. Anything referencing a
   specific repo's facts belongs in that repo's team layer - a personal
   skill quoting harborline commands is GR-5 across a layer boundary.
2. **Precedence is the tools' native resolution.** Project files beat
   these personal-global files beat built-in defaults, everywhere, by
   each tool's nearest-wins order. Never encode "unless the project
   says otherwise" in personal files - that IS the resolution order;
   restating it is noise.
3. **shared/ files use the vault's canonical formats** (guardrails
   entry format, registry row format, DESIGN.md format - each format's
   SSOT unchanged) so entries graduate to team files by copy-paste plus
   review, never by rewrite.
4. **Symlink where the tool follows links; copy where it doesn't**,
   and let install.sh own the difference - the repo is the source of
   truth either way, and re-running install.sh reconciles copies.
5. **The repo is private but treated as leakable:** the personal
   registry follows the same env-var-only rule (GR-8's "private repos
   get cloned" lesson); permissive personal credentials means broader
   *scopes*, never committed *values*.

## Governance (the layer's defining looseness)
- No approval workflow - self-trust is sufficient.
- Loose versioning - you know what changed and why; a plain git log is
  the changelog.
- Personal MCP credentials may be broad, but still ROWED in
  shared/mcp-registry.md - the audit habit is the thing being trained;
  scope discipline at work starts as scope awareness at home.

## Failure modes (reference-only)
Repo facts in personal skills → GR-5; unrowed personal servers →
GR-12 (the habit gap that becomes the team incident); realistic
values in the personal registry → GR-8.

## Verifier
`install.sh --check` (link integrity, drift between copies and
sources); the standard linters run on this repo too -
`permission_audit.py --registry shared/mcp-registry.md ~/agent-toolkit`.

## TOOL TRANSFER table
Adding a tool = one dir + one stanza in install.sh (generic-adapter
L7/L8 rule); per-tool link targets above, `[VERIFY]`-dated where the
tool's config path is unconfirmed.
