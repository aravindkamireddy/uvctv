# UVCTV Command Reference

Every command, what it does, and when you'd reach for it — with examples for
Windows (CMD and PowerShell), macOS, and Linux.

**Package:** `github:aravindkamireddy/uvctv` · **CLI version:** 1.5.0
**Requires:** Node 18+ (`node --version` to check)

Wherever you see `github:aravindkamireddy/uvctv`, substitute your own fork if
you have one.

---

## Contents

- [The two commands most people need](#the-two-commands-most-people-need)
- [Command reference](#command-reference)
- [Flag reference](#flag-reference)
- [Platform notes](#platform-notes)
- [Use cases](#use-cases-by-situation)
- [Reading the output](#reading-the-output)
- [Troubleshooting](#troubleshooting)

---

## The two commands most people need

```
npx github:aravindkamireddy/uvctv init
npx github:aravindkamireddy/uvctv mcp-install
```

The first creates `~/agent-toolkit` and links it into every AI tool on the
machine. The second connects the reference-document server so agents can search
the vault's playbooks on demand. Restart your tools after the second one.

Everything below is for when you need something more specific.

---

## Command reference

### `init`

Creates the toolkit and links it into every detected tool. If a toolkit already
exists it switches to `update` automatically, so it is safe to re-run.

**Does:** creates `~/agent-toolkit` with `skills/`, `opencode/agents/`,
`shared/`, `reference/`, `hooks/` · extracts ~25 files · links into up to 9
tool locations · writes `.uvctv-manifest.json` for change tracking.

**Use when:** setting up a new machine, or installing for the first time.

```bash
# macOS / Linux / PowerShell / CMD - identical
npx github:aravindkamireddy/uvctv init
```

```bash
# preview first, change nothing
npx github:aravindkamireddy/uvctv init --dry-run
```

```bash
# link every tool location even for tools not installed yet
npx github:aravindkamireddy/uvctv init --all
```

---

### `update`

Refreshes vault content while protecting your edits.

**Does, per file:** identical to the vault → skip · you never touched it and
the vault changed → **refresh** · you edited it → **keep**, and print the path ·
no provenance record yet (toolkit predates tracking) → **adopt** the vault
version once and start tracking.

**Use when:** you have pushed changes to the repo, or you want the latest
version of skills and hooks.

```bash
npx github:aravindkamireddy/uvctv update
```

```bash
# see what would change before committing to it
npx github:aravindkamireddy/uvctv update --dry-run
```

```bash
# take the vault's version of everything, discarding YOUR edits
npx github:aravindkamireddy/uvctv update --force
```

> `--force` is destructive to your customisations. Run `--dry-run` first if you
> have edited anything in `shared/`.

---

### `status`

Reports what is linked and what is not. Changes nothing.

**Use when:** something isn't working and you want to see the actual state, or
as a safe first command to check the package resolves at all.

```bash
npx github:aravindkamireddy/uvctv status
```

```bash
# machine-readable, for scripts
npx github:aravindkamireddy/uvctv status --json
```

**States you'll see:** `linked` · `linked elsewhere` (points at a different
toolkit) · `REAL DIR (use --adopt)` · `tool not detected` · `not linked`.

---

### `link`

Re-links only. Never touches file content.

**Use when:** links broke (you moved the toolkit, or a tool reinstalled and
recreated its folder), or you just installed a new AI tool and want it wired
without re-extracting anything.

```bash
npx github:aravindkamireddy/uvctv link
```

```bash
# a real directory is in the way? move its contents into the toolkit, then link
npx github:aravindkamireddy/uvctv link --adopt
```

```bash
npx github:aravindkamireddy/uvctv link --check     # preview
```

---

### `unlink`

Removes only the links this toolkit created. Your toolkit folder and its
contents are never touched.

**Refuses to remove:** a real directory, or a link pointing at something other
than this toolkit. Both are reported as `GR-16` findings rather than deleted.

**Use when:** uninstalling, or temporarily disconnecting to test another system.

```bash
npx github:aravindkamireddy/uvctv unlink --check    # preview
npx github:aravindkamireddy/uvctv unlink
```

```bash
# also copy the toolkit's files back into each tool's own folder,
# so tools you keep using are not left with no skills
npx github:aravindkamireddy/uvctv unlink --restore
```

---

### `mcp-install`

Writes the doc-server config into every tool it finds.

**Does:** detects installed tools · merges the `uvctv-vault` entry into each
tool's **global** config · backs up each file as `.uvctv-bak` before writing ·
refuses configs it cannot parse · appends a TOML table for Codex · idempotent.

**Covers:** Claude Code (`~/.claude.json`), Cursor (`~/.cursor/mcp.json`), Zed
(`settings.json`), Antigravity (`~/.gemini/antigravity/mcp_config.json`),
OpenCode (`~/.config/opencode/opencode.json`), Codex (`~/.codex/config.toml`).

**Use when:** after `init`, or after adding a new AI tool.

```bash
npx github:aravindkamireddy/uvctv mcp-install --dry-run
npx github:aravindkamireddy/uvctv mcp-install
```

```bash
# if the package spec still shows a placeholder, name it explicitly
npx github:aravindkamireddy/uvctv mcp-install --package github:aravindkamireddy/uvctv
```

**Restart every tool afterwards** — MCP servers load at startup.

---

### `mcp`

Runs the documentation server. **MCP clients launch this; you don't.** It
speaks JSON-RPC over stdin/stdout, so running it by hand just appears to hang.

**Use when:** never directly, except for the selftest below.

```bash
npx -y github:aravindkamireddy/uvctv mcp --selftest
```

Prints the document count and a sample search. Exits non-zero below 40
documents, which catches the package being truncated.

---

### `help` and `version`

```bash
npx github:aravindkamireddy/uvctv help
npx github:aravindkamireddy/uvctv version
```

---


## Pin the version you run

`github:aravindkamireddy/uvctv` resolves to whatever `main` points at **today**.
That is convenient and it is also a supply-chain surface: the command you
approved once is not necessarily the code that runs next week. `harness-audit`
flags unpinned specs for exactly this reason (GR-20).

To pin, tag a release in the repo and add `#tag` to every spec:

```
npx github:aravindkamireddy/uvctv#v3.0 init
```

```json
{ "mcpServers": { "uvctv-vault": {
    "command": "npx",
    "args": ["-y", "github:aravindkamireddy/uvctv#v3.0", "mcp"] } } }
```

A commit SHA works too and is stricter: `#a1b2c3d`. Update deliberately by
bumping the tag, which is the point - you decide when new code runs.

Unpinned is a defensible choice for a repo you own and push to yourself. It is
not defensible for a repo someone else controls.

---

## Flag reference

| Flag | Applies to | Effect |
|---|---|---|
| `--dry-run` | all | Show every action, change nothing |
| `--check` | all | Same as `--dry-run` |
| `--adopt` | `init`, `link` | A real directory is at a link target: move its contents into the toolkit, then link. Name collisions are reported and left in place |
| `--all` | `init`, `link` | Link even for tools not installed on this machine |
| `--force` | `init`, `update` | Overwrite toolkit files with the vault's version, **discarding your edits** |
| `--restore` | `unlink` | Copy files back into each tool's own folder after unlinking |
| `--json` | `status` | Machine-readable output |
| `--toolkit <path>` | all | Toolkit location (default `~/agent-toolkit`) |
| `--vault <path>` | `init`, `update` | Source vault (default: the package this CLI ships in) |
| `--package <spec>` | `mcp-install` | Package spec to write into MCP configs |

Unknown flags exit with code 2 rather than being silently ignored.

---

## Platform notes

**All four shells run the same commands.** `npx` handles the differences.

### Windows PowerShell

```powershell
npx github:aravindkamireddy/uvctv init
```

Chain commands with `;`:

```powershell
npx github:aravindkamireddy/uvctv status ; npx github:aravindkamireddy/uvctv init
```

Uses **NTFS junctions** — no admin rights or Developer Mode needed.
Toolkit lands at `C:\Users\<you>\agent-toolkit`.

### Windows CMD

```cmd
npx github:aravindkamireddy/uvctv init
```

Chain with `&&`. Use `%USERPROFILE%` for paths:

```cmd
npx github:aravindkamireddy/uvctv init --toolkit %USERPROFILE%\my-toolkit
```

### macOS

```bash
npx github:aravindkamireddy/uvctv init
```

Toolkit lands at `/Users/<you>/agent-toolkit`. If Node came from Homebrew and
`npx` isn't found, `brew install node`.

### Linux

```bash
npx github:aravindkamireddy/uvctv init
```

Toolkit at `/home/<you>/agent-toolkit`. Distro Node packages are often old —
check `node --version` is 18+, and prefer nodesource or nvm if not.

---

## Use cases by situation

**Brand new machine**
```bash
npx github:aravindkamireddy/uvctv init
npx github:aravindkamireddy/uvctv mcp-install
```
Then restart your tools and ask one: *"what skills do you have available?"*

**You pushed changes to the repo and want them locally**
```bash
npx github:aravindkamireddy/uvctv update
```

**You edited a skill locally and don't want to lose it**
Nothing special — `update` keeps edited files and prints their paths. To check
first: `update --dry-run`.

**You already had skills in a tool's folder**
```bash
npx github:aravindkamireddy/uvctv link --adopt
```
Your existing files move into the toolkit and become shared across all tools.
Prefer to keep them tool-specific? Skip the adopt; the other links still work.

**A tool can't see the skills**
```bash
npx github:aravindkamireddy/uvctv status
```
`tool not detected` means its config folder doesn't exist — launch it once, then
`link`. `REAL DIR` means use `--adopt`.

**You installed a new AI tool**
```bash
npx github:aravindkamireddy/uvctv link
npx github:aravindkamireddy/uvctv mcp-install
```

**Trying a different toolkit system, want yours out of the way**
```bash
npx github:aravindkamireddy/uvctv unlink --restore
```
`--restore` leaves each tool with a real copy of the skills, so nothing breaks.
Re-run `init` to come back.

**Testing on a throwaway path**
```bash
npx github:aravindkamireddy/uvctv init --toolkit /tmp/test-toolkit --dry-run
```

**Verifying the doc server is intact**
```bash
npx -y github:aravindkamireddy/uvctv mcp --selftest
```

---

## After install: set your defaults

`init` writes `~/agent-toolkit/shared/STANDING.md` - your standing preferences,
read first by every skill. Worth opening once:

```bash
# macOS / Linux
open ~/agent-toolkit/shared/STANDING.md
```

```powershell
# Windows
notepad $HOME\agent-toolkit\shared\STANDING.md
```

It ships with `tests: on request only` and scoped test runs, which stops agents
running the full suite after every edit. Delete anything you disagree with.

`update` treats it as yours the moment you edit it - the vault's version will
never overwrite your copy without `--force`.

## Reading the output

| Line | Meaning |
|---|---|
| `write` | New file created |
| `refresh` | Vault updated a file you never edited; you got the new version |
| `adopt` (content) | No provenance record yet — vault version taken, tracking starts now |
| `adopt` (wiring) | A real directory's contents moved into the toolkit, then linked |
| `kept ... YOU changed` | You edited it; your version wins. Paths are listed |
| `link` / `relink` / `ok` | Link created / repointed / already correct |
| `not detected` | That tool isn't installed here. Normal. `--all` links anyway |
| `\| GR-16 \| ...` | A refusal, in guardrail format: something real was in the way and was left alone |

The final line is always a summary: `done: N dir(s), N new, N refreshed, N kept
(N yours), N link(s).`

---

## Troubleshooting

**`404` or `Could not resolve`** — the repo is private, or the username is
wrong. Open `https://github.com/aravindkamireddy/uvctv` in a private window; if
it 404s there, it's private.

**`npx: command not found`** — Node isn't installed or isn't on PATH.

**`Ok to proceed? (y)`** — normal on first run and after each push; npx is
fetching the package. Type `y`.

**Everything says `not detected`** — no AI tool config folders exist yet. Launch
one tool once so it creates its folder, then `link`. Or force with `--all`.

**`GR-16 ... refused to replace`** — a real directory sits at a link target.
Re-run with `--adopt`, or move the folder yourself.

**MCP server not appearing in a tool** — restart the tool; MCP loads at startup.
Then check its MCP panel. If it's connected but never used, that's a routing
issue, not a connection one.

**`hooks/` is empty** — you're on an old package version. `update` again; the
CLI now says explicitly when the hooks directory is missing from the package.

**Changes not appearing after a push** — npx caches. It re-fetches on the next
invocation, so simply run the command again.
