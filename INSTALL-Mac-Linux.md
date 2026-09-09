# Setting Up Your Agent Toolkit — Mac & Linux

**Reading time: 5 minutes. Setup time: about 8 minutes.**
*Written for vault 1.8 (2026-08-11). Every command and output below was verified against the actual scripts.*

---

## What you are about to do (plain English)

AI coding tools — Claude Code, OpenCode, Codex, Cursor and others — read
instruction files from hidden folders on your computer. Right now those folders
are empty, so every time you use the tool you have to re-explain how you like
things done.

This setup does two things:

1. **Creates your toolkit** — a normal folder called `agent-toolkit` in your home
   directory, holding one copy of each ready-made skill, taken out of the vault.
2. **Connects it to your tools** — every AI tool you have installed is pointed at
   that one folder.

After this, you edit a skill in one place and every tool, in every project, sees
the change immediately. No copying, no syncing.

**Nothing here can damage your computer.** The scripts create folders and
symlinks. They will never delete a real folder — if one is in the way they stop
and tell you. To undo everything, delete the `agent-toolkit` folder.

---

## Before you start — three checks

### 1. Do you have an AI coding tool installed?

This setup *configures* tools; it does not install them. You need at least one of:
**Claude Code, OpenCode, Codex, Command Code, Antigravity, or Cursor.** If you
have none, install one first, then come back.

### 2. Can you open Terminal?

- **Mac:** press `Cmd + Space`, type `terminal`, press `Enter`.
- **Linux:** press `Ctrl + Alt + T`, or search "Terminal" in your applications.

A window opens with a prompt ending in `$` or `%`. Leave it open.

### 3. Do you know where the vault is?

You should have unzipped `vibe-toolkit-vault-2026-08-03.zip` somewhere. It
contains `README.md`, `MANIFEST.md`, and folders named `skills`, `tools`,
`verifiers`, `personal-layer`.

**Shortcut for the path:** in Terminal type `cd ` (with a space), then drag the
vault folder from Finder or your file manager onto the Terminal window. The path
appears automatically. Press Enter.

Typical paths:

```
/Users/yourname/Downloads/vibe-toolkit-vault-2026-08-03/vibe-toolkit-vault   (Mac)
/home/yourname/Downloads/vibe-toolkit-vault-2026-08-03/vibe-toolkit-vault    (Linux)
```

---

## The one-command way (try this first)

If you have Node 18+ installed (`node --version` to check):

```bash
npx github:<you>/uvctv init
```

That is the whole setup. It creates the toolkit, extracts the skills, and
links every AI tool it finds on this machine. Other verbs: `update` (refresh,
keeping your edits), `status` (what is linked), `unlink` (undo).

Add `--dry-run` to any of them to preview without changing anything.

**No Node, or you prefer a script you can read first?** The steps below do
exactly the same work.

---

## Step 1 — Go to the personal-layer folder

```bash
cd ~/Downloads/vibe-toolkit-vault/personal-layer
```

**Worked if:** listing the folder shows `setup.sh`, `tree.md` and the three
`shared-*.md` templates.

First time only, mark it runnable:

```bash
chmod +x setup.sh
```


---

## Step 2 — Preview (changes nothing)

```bash
./setup.sh --vault .. --dry-run
```

**You should see** `would mkdir` / `would write` / `would link` lines, ending
with a `done:` summary and `(dry run - nothing was changed)`.

The script tells you which mode it picked on the second line: **fresh** if you
have no toolkit yet, **existing toolkit detected** if you are updating.

---

## Step 3 — Do it for real

```bash
./setup.sh --vault ..
```

One command does everything: creates `~/agent-toolkit`,
extracts the skills into it, copies itself in, and links every AI tool it
detects on this machine.

**Success looks like this** (yours lists whichever tools you have):

```
link   ~/.claude/skills -> ~/agent-toolkit/skills
not detected  .codex  (no ~/.codex - skipping; --all links anyway)
link   ~/.agents/skills -> ~/agent-toolkit/skills
done: 3 dir(s), 15 file(s), 2 link(s).
```

- **`link`** — connected. **`not detected`** — that tool is not installed here.
- Add `--all` to link anyway.

**If you see a `| GR-16 | ... refused to replace ... |` line:** you already had
skills in that folder. Re-run with `--adopt` — it moves your existing files *into*
the toolkit, then links. Nothing is overwritten.

---

## Re-running it later

It tells the difference between your edits and stale vault content, using a
hash recorded when each file was written:

- **refreshed** - the vault updated a file you never touched, so you get the fix
- **kept** - you edited it; yours wins, and the path is printed so you know

That means updates actually reach you without overwriting your work.

Same command. The script detects your existing toolkit and switches to
**update**. Add `--force` only if you want vault content to
overwrite your edits.

---

## Changed your mind? Undoing it

```
./setup.sh --uninstall --check   (preview)
./setup.sh --uninstall
```

It removes only the links it created. Your toolkit folder, your edits, and
anything you adopted into it are untouched — re-run the installer to reconnect.
It refuses to touch a real directory or a link something else made.

Add `--restore` (`-Restore`) to copy the toolkit's files back into each tool's
own folder first, so a tool you keep using is not left with no skills.

## Connect the reference library

```
npx github:<you>/uvctv mcp-install --dry-run
npx github:<you>/uvctv mcp-install
```

Writes the MCP config into every tool it finds, backs each file up first, and
skips anything it cannot parse. Restart your tools afterwards. Then ask:
"How should I split work across parallel agents?" - the agent should call
`search_vault` on its own.

## Optional: turn on the hooks

Two hooks install to `~/agent-toolkit/hooks/`. They block an agent from editing
your linter config to make a check pass, and make it state facts before editing
source or running something irreversible. Wiring is in `hooks/README.md` inside
the vault - currently verified for Claude Code only.

Every command, flag and troubleshooting case is in `COMMANDS.md` in the vault.

## What happens next

**Your toolkit is yours now.** Edit any file inside `~/agent-toolkit` and every
tool sees it instantly. You do not re-run anything.

**Re-run `setup.sh`** only when you set up a new computer or start using a new
AI tool.

**Re-run `setup.sh`** only when you get an updated vault. It never
overwrites your edits unless you add `--force`.

### Three files worth filling in over time

Inside `~/agent-toolkit/shared/`:

- **`GUARDRAILS.md`** — every time an AI tool wastes your time, write one line:
  what happened, and what rule would prevent it. This is the highest-value file
  in the whole setup, and it starts empty because only you can write it.
- **`mcp-registry.md`** — every external service (database, GitHub…) a tool can
  reach, and what it may do there.
- **`DESIGN.md`** — your default colours and spacing, if you build interfaces.

### Optional: make it a git repo

The toolkit is a normal folder, so this works and is worth doing:

```bash
cd ~/agent-toolkit
git init && git add . && git commit -m "initial toolkit"
```

Your setup is now versioned, and moving to a new machine becomes: clone it, run
`./setup.sh`, done.

### Going deeper

The vault has a six-stage learning path at `distillation/curriculum.md`. Start at
Stage 0 whenever you are curious.
