---
title: The vault doc server - connecting the ~45 reference documents over MCP
layer: L7
priority: P1
version: 1.1
date: 2026-09-02
changelog: v1.1 - added Antigravity, Command Code and OpenClaw config stanzas; v1.0 documented only five of the eight MCP-capable tools and did not say why the others were absent
source_model: Claude Fable 5
depends_on: [cli/bin/uvctv.js, mcp/registry-template.md, verifiers/eval-loop.md]
usage: Read to connect the vault's reference documents to any MCP client. Explains why docs go over MCP while skills stay as files - the distinction is the whole design.
audience: solo, architect, team
tools: all MCP clients
---

# The Vault Doc Server

Two delivery mechanisms, chosen per content type. Getting this split wrong
breaks either triggering or context.

| Content | Delivered as | Why |
|---|---|---|
| 6 skills, 6 ports, 4 shared, 4 cards (20 files) | **files**, linked into 9 tool dirs | tools SCAN those directories at startup and keep every description in front of the model. Ambient. No decision needed to fire. |
| ~55 reference documents | **MCP resources + a search tool** | pull on demand. Loading 55 playbooks into every session is GR-9 by construction. |

Serving skills over MCP would trade the one mechanism that makes them
trigger for one that requires the model to decide to look. Serving docs as
files would flood every session. Neither is a preference; both are forced.

## Connect it

The server ships inside the package and is launched BY the client, so there
is nothing to install and nothing to keep in sync:

**Claude Code** - `.mcp.json`:
```json
{ "mcpServers": { "uvctv-vault": {
    "command": "npx", "args": ["-y", "github:YOUR-USERNAME/uvctv", "mcp"] } } }
```

**OpenCode** - `opencode.json`:
```json
{ "mcp": { "uvctv-vault": {
    "type": "local", "command": ["npx", "-y", "github:YOUR-USERNAME/uvctv", "mcp"] } } }
```
`[VERIFY 2026-09: field shape against current OpenCode schema]`

**Zed** - `settings.json`:
```json
{ "context_servers": { "uvctv-vault": {
    "command": "npx", "args": ["-y", "github:YOUR-USERNAME/uvctv", "mcp"] } } }
```

**Cursor** - `~/.cursor/mcp.json`, same shape as Claude Code.

**Codex** - `~/.codex/config.toml`:
```toml
[mcp_servers.uvctv-vault]
command = "npx"
args = ["-y", "github:YOUR-USERNAME/uvctv", "mcp"]
```

**Antigravity** - `~/.gemini/antigravity/mcp_config.json`:
```json
{ "mcpServers": { "uvctv-vault": {
    "command": "npx", "args": ["-y", "github:YOUR-USERNAME/uvctv", "mcp"] } } }
```
Path verified 2026-07 from Antigravity's own docs; the config's internal shape
is `[VERIFY 2026-09]` - it follows the common `mcpServers` convention, but I
have not confirmed the key names against a live file.

**Command Code** - managed through its `/mcp` command rather than a file you
edit by hand. Run `/mcp` in the CLI and add a server with command `npx` and
args `-y github:YOUR-USERNAME/uvctv mcp`. `[VERIFY 2026-09: exact prompts]` - the
`/mcp` surface is documented, the add-flow is not recorded in this vault.

**OpenClaw** - the gateway holds its own MCP config; for a REMOTE gateway
(Railway et al) `npx` runs on the gateway's container, not your laptop, so the
package is fetched there. Works, but it is the gateway's network egress doing
the fetching - check that before assuming.

**Running from a local clone instead of GitHub?** Replace the command with
`node /path/to/vault/cli/bin/uvctv.js mcp`.

## What it exposes

- **55 resources** - every reference document, addressed `vault://<path>`.
- **`search_vault(query, limit)`** - keyword search returning matching
  passages with their document paths. Handles GR-IDs: `search_vault("GR-11")`
  finds the context-pollution narrative.
- **`read_vault_doc(path)`** - one document in full.

`read_vault_doc`'s description tells the model to prefer reading ONE. Pulling
three playbooks into a session recreates the flood the design avoids - the
tool exists to make retrieval cheap, not unlimited.

## Scope, and why its registry row is trivial

Read-only on markdown inside its own package. It cannot read your code, write
files, run commands, or reach the network. No credentials exist, so none can
leak (GR-8 is structurally inapplicable). That is deliberate: a server this
narrow is approvable in one reading, which is the standard `mcp/registry.md`
sets for everything else.

Its row is in the harborline registry example; copy it into yours before
connecting - the vault's own rule (no row, no connection) governs the vault's
own server.

## Failure modes (reference-only)
Skills moved to MCP "for consistency" -> they stop firing ambiently -> GR-6
at scale (narrative: `verifiers/description-tuning.md`). An agent pulling
several playbooks per task -> GR-9 (narrative: `verifiers/eval-loop.md`).
Connected without a registry row -> GR-12, in the vault's own tooling
(narrative: `orchestration/guardrails-example-harborline.md`).

## Verifier
`node cli/lib/mcp-server.js --selftest` prints the document count, the tool
list and a sample search - run it after any change to the served directories.
`permission_audit.py` checks the row against each client config.
