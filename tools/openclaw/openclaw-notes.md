---
title: OpenClaw - gateway above the matrix; install profiles (Railway, local/WSL, Companion)
layer: L2
priority: P0
version: 1.1
date: 2026-08-16
source_model: Claude Fable 5
depends_on: [skills/skill-writer/SKILL.md, tools/openclaw/gateway-security.md, mcp/registry-example-harborline.md]
usage: Read when adopting the vault with OpenClaw. OpenClaw is not a seventh coding tool - it is a layer ABOVE the matrix that dispatches the others. Pick your deployment profile below; they differ fundamentally in how skills reach the agent.
audience: solo, architect, team
tools: openclaw
---

# OpenClaw - The Layer Above the Matrix

OpenClaw is a self-hosted **gateway** that connects chat channels (Telegram,
Discord, Slack, Signal, WhatsApp) to AI coding agents. Its coding-agent skill
spawns Codex, OpenCode and Claude Code as background workers. So it does not
replace anything in the tool matrix - it **dispatches** it.

Architecturally that makes OpenClaw the vault's orchestration and swarm
playbooks running for real, unattended, triggered from a phone. Every rule in
`orchestration/` applies here with the volume turned up: nobody is watching,
so the honesty rules (GR-14) and the ownership-map rules (GR-4) stop being
good practice and become the only thing between you and a silent mess.

**Vocabulary** (needed before the profiles make sense):
- **Gateway** - the brain. Holds config, state, skills, and the agent loop.
- **Node** - a capability provider that registers with a Gateway (e.g. the
  Windows Companion app, which offers system and browser capabilities).
- **Channel** - a chat app the Gateway listens on.

## Skills load unchanged

`openclaw skills install` places skills in the active workspace `skills/`
directory; `--global` installs into the shared `~/.openclaw/skills` directory,
visible to all local agents. Git and local installs expect `SKILL.md` at the
source root, and the slug comes from the `SKILL.md` frontmatter `name`
`[VERIFY 2026-08]`.

That is the Agent Skills shape this vault already authors, so the six
canonical skills in `skills/` install **as authored** - OpenClaw is a
canonical-mode column, no port.

---

## Profile A - Remote gateway (Railway, Fly, any container host)

**This profile breaks the symlink model completely, and that is the point to
internalise.** Your gateway runs on someone else's machine. `~/agent-toolkit`
on your laptop is not reachable from it. No installer this vault ships can
help you here; the toolkit must travel over the network.

Using the common Railway template as the reference `[VERIFY 2026-08]`:

- State lives at `OPENCLAW_STATE_DIR=/data/.openclaw`, workspace at
  `OPENCLAW_WORKSPACE_DIR=/data/workspace`, both on a persistent volume so
  config, credentials and memory survive redeploys.
- Therefore skills land at **`/data/.openclaw/skills`** and **persist across
  redeploys** - you install once, not on every deploy.
- The host provides an in-browser console (a shell inside the running
  container). That is where you run the install.

**Install procedure:**

```bash
# in the host's container console, once
openclaw skills install <git-url-of-your-toolkit> --global
```

Where `<git-url-of-your-toolkit>` is a repository containing your
`skills/` directory. This is why the vault's distribution story matters more
than its installer: for a remote gateway, **a git URL is the only delivery
mechanism**, and a zip on your laptop is useless.

**Update procedure:** re-run the same command after pushing to the repo. No
redeploy needed; the volume keeps it.

**Why the vault ships a Node CLI:** this profile is the reason. `npx
github:YOUR-USERNAME/uvctv init` and `openclaw skills install <git-url> --global`
consume the SAME repository - one distribution mechanism for the laptop and
the remote gateway. A zip serves neither.

**Open question for your deployment, not answered by docs:** whether the
gateway can reach a *private* repository. If your toolkit repo is private,
either make the skills subset public, bake them into the image, or paste them
via the console. Test before relying on it.

## Profile B - Local or WSL gateway

The gateway runs on your machine, so the toolkit is on the same filesystem and
the normal vault mechanics work:

```
~/agent-toolkit/skills   →   ~/.openclaw/skills      (link, per setup script)
```

On Windows this is usually a WSL gateway (the Companion app can provision an
app-owned WSL distro and install the gateway inside it `[VERIFY 2026-08]`). If
so, the gateway's `$HOME` is **inside WSL**, not `C:\Users\YOUR-USERNAME` - link from
the WSL side, or keep the toolkit in the WSL filesystem. A Windows-side
junction into WSL is not a supported path.

## Profile C - Companion as a node

Companion is not a separate product: it is a **node** that registers with a
Gateway and offers Windows-native capabilities (system access, browser
control) `[VERIFY 2026-08]`. Skills live on the Gateway, not the node, so
Companion needs no skill installation of its own - it needs *permissions*,
which is `tools/openclaw/gateway-security.md`'s subject.

Companion can also expose its capability registry as a **local MCP server on
loopback** for clients such as Claude Desktop, Claude Code and Cursor
`[VERIFY 2026-08]`. When it does, it is an MCP server your matrix tools
connect to - which makes it a **row in `mcp/registry.md`**, audited like any
other, not merely a host.

---

## Which profile am I in?

| Question | Answer → profile |
|---|---|
| Is the gateway URL something like `*.up.railway.app` or a remote host? | **A** - git-URL distribution, no links |
| Does `openclaw` run on this machine, or in WSL on this machine? | **B** - links work, mind the WSL `$HOME` |
| Are you running the Windows Companion app against a gateway elsewhere? | **A or B for skills** (wherever the gateway is) **+ C for permissions** |

Mixed setups are normal: a Railway gateway (A) with a Companion node (C) is a
common shape and means skills go over git while permissions are configured on
the gateway.

## Failure modes (reference-only)
Third-party skills installed without review into an agent holding shell and
browser access → GR-20 (narrative: `tools/openclaw/gateway-security.md`).
Unattended agents claiming completion they never verified → GR-14 (narrative:
`design/design-review-workflow.md`). Parallel dispatch without an ownership
map → GR-4 (narrative: `orchestration/swarm-parallelism.md`).

## Verifier
`verifiers/lint/permission_audit.py` against the gateway's MCP config and the
Companion loopback row; `openclaw doctor` for gateway health `[VERIFY 2026-08]`.

## TOOL TRANSFER table

| Tool | Relationship | Notes |
|---|---|---|
| Claude Code / Codex / OpenCode | dispatched BY OpenClaw as background workers | their own vault columns still apply |
| Companion | a node of the gateway, and possibly an MCP server row | profile C above |
| Zed / Cursor / Command Code / Antigravity | unrelated to the gateway; they consume the same canonical skills locally | see their own notes |
| Skills | canonical, unchanged | `skills/<name>/SKILL.md` |
