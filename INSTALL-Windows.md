# Setting Up Your Agent Toolkit — Windows

**Reading time: 5 minutes. Setup time: about 8 minutes.**
*Written for vault 1.8 (2026-08-11). Every command and output below was verified against the actual scripts.*

---

## What you are about to do (plain English)

AI coding tools — Claude Code, OpenCode, Codex, Cursor and others — read
instruction files from hidden folders on your computer. Right now those folders
are empty, so every time you use the tool you have to re-explain how you like
things done.

This setup does two things:

1. **Creates your toolkit** — a normal folder called `agent-toolkit` in your user
   directory, holding one copy of each ready-made skill, taken out of the vault.
2. **Connects it to your tools** — every AI tool you have installed is pointed at
   that one folder.

After this, you edit a skill in one place and every tool, in every project, sees
the change immediately. No copying, no syncing.

**Nothing here can damage your computer.** The scripts create folders and links.
They will never delete a real folder — if one is in the way they stop and tell
you. To undo everything, delete the `agent-toolkit` folder.

---

## Before you start — three checks

### 1. Do you have an AI coding tool installed?

This setup *configures* tools; it does not install them. You need at least one of:
**Claude Code, OpenCode, Codex, Command Code, Antigravity, or Cursor.** If you
have none, install one first, then come back.

### 2. Can you open PowerShell?

Press the `Windows` key, type `powershell`, press `Enter`. A window opens with a
prompt like `PS C:\Users\YourName>`. Leave it open.

### 3. Do you know where the vault is?

You should have unzipped `vibe-toolkit-vault-2026-08-03.zip` somewhere. Open that
folder in File Explorer — you should see `README.md`, `MANIFEST.md`, and folders
named `skills`, `tools`, `verifiers`, `personal-layer`.

**Copy its path:** click once in the address bar at the top of File Explorer. The
path becomes selectable text. Copy it. It looks like:

```
C:\Users\YourName\Downloads\vibe-toolkit-vault-2026-08-03\vibe-toolkit-vault
```

Keep it handy — the next step needs it.

---

## The one-command way (try this first)

If you have Node 18+ installed (`node --version` to check):

```powershell
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

```powershell
cd C:\Users\YourName\Downloads\vibe-toolkit-vault\personal-layer
```

**Worked if:** listing the folder shows `setup.ps1`, `tree.md` and the three
`shared-*.md` templates.

---

## Step 2 — Preview (changes nothing)

```powershell
powershell -ExecutionPolicy Bypass -File setup.ps1 -vault .. -DryRun
```

**You should see** `would mkdir` / `would write` / `would link` lines, ending
with a `done:` summary and `(dry run - nothing was changed)`.

The script tells you which mode it picked on the second line: **fresh** if you
have no toolkit yet, **existing toolkit detected** if you are updating.

---

## Step 3 — Do it for real

```powershell
powershell -ExecutionPolicy Bypass -File setup.ps1 -vault ..
```

One command does everything: creates `C:\Users\YourName\agent-toolkit`,
extracts the skills into it, copies itself in, and links every AI tool it
detects on this machine.

**Success looks like this** (yours lists whichever tools you have):

```
link   ~/.claude/skills -> ~/agent-toolkit/skills
not detected  .codex  (no ~/.codex - skipping; -all links anyway)
link   ~/.agents/skills -> ~/agent-toolkit/skills
done: 3 dir(s), 15 file(s), 2 link(s).
```

- **`link`** — connected. **`not detected`** — that tool is not installed here.
- Add `-all` to link anyway.

**If you see a `| GR-16 | ... refused to replace ... |` line:** you already had
skills in that folder. Re-run with `-Adopt` — it moves your existing files *into*
the toolkit, then links. Nothing is overwritten.

---

## Re-running it later

It tells the difference between your edits and stale vault content, using a
hash recorded when each file was written:

- **refreshed** - the vault updated a file you never touched, so you get the fix
- **kept** - you edited it; yours wins, and the path is printed so you know

That means updates actually reach you without overwriting your work.

Same command. The script detects your existing toolkit and switches to
**update**. Add `-force` only if you want vault content to
overwrite your edits.

---

## Changed your mind? Undoing it

```
powershell -ExecutionPolicy Bypass -File setup.ps1 -uninstall -Check   (preview)
powershell -ExecutionPolicy Bypass -File setup.ps1 -uninstall
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

## What happens next

**Your toolkit is yours now.** Edit any file inside
`C:\Users\YourName\agent-toolkit` and every tool sees it instantly. You do not
re-run anything.

**Re-run `setup.ps1`** only when you set up a new computer or start using a new
AI tool.

**Re-run `setup.ps1`** only when you get an updated vault. It never
overwrites your edits unless you add `-Force`.

### Three files worth filling in over time

Inside `agent-toolkit\shared\`:

- **`GUARDRAILS.md`** — every time an AI tool wastes your time, write one line:
  what happened, and what rule would prevent it. This is the highest-value file
  in the whole setup, and it starts empty because only you can write it.
- **`mcp-registry.md`** — every external service (database, GitHub…) a tool can
  reach, and what it may do there.
- **`DESIGN.md`** — your default colours and spacing, if you build interfaces.

### Going deeper

The vault has a six-stage learning path at `distillation\curriculum.md`. Start at
Stage 0 whenever you are curious.
