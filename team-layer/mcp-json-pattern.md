---
title: .mcp.json pattern - committed connections, env-var secrets
layer: L8
priority: P1
version: 1.0
date: 2026-07-24
source_model: Claude Fable 5
depends_on: [mcp/registry-example-harborline.md, mcp/secrets-handling.md, team-layer/tree.md]
usage: The committed-connection-file pattern for the team tree. Copy the block, adjust servers to match your registry rows exactly. The same pattern governs opencode.json's mcp section and config.toml's [mcp_servers.*].
audience: team
tools: claude-code, all (pattern generalizes)
---

# `.mcp.json` Pattern - Committed, Secret-Free

The connection file is committed so a fresh clone connects identically
for every teammate (the zero-setup property); it stays committable
because it contains **references, never values** (secrets rule 1). It
is downstream of the registry: every server here has a row; the row
came first.

## The pattern - `harborline/.mcp.json` (filled)

```jsonc
// FILE: harborline/.mcp.json   [VERIFY 2026-07: field names vs current Claude Code schema]
// Governing matrix: mcp/registry.md - every server below has a row there.
// Secrets: env-var references ONLY (mcp/secrets rules). Values come from
// each teammate's environment / CI secret store under these exact names.
{
  "mcpServers": {
    "postgres-readonly": {
      "command": "postgres-mcp",                     // [VERIFY 2026-07]
      "env": { "PG_URL": "${PG_URL_RO}" }            // read-only credential per row
    },
    "github": {
      "command": "github-mcp",                       // [VERIFY 2026-07]
      "env": { "GITHUB_TOKEN": "${GH_TOKEN_AGENT}" } // fine-grained, no merge/settings
    },
    "stitch-design": {
      "command": "stitch-mcp",                       // [VERIFY 2026-07]
      "env": { "STITCH_KEY": "${STITCH_KEY}" }
    },
    "browser-fetch": {
      "command": "fetch-mcp"                         // no credentials by design
    }
  }
}
```

Alongside it, committed:

```bash
# FILE: harborline/.env.example   (values are OBVIOUSLY fake - secrets rule 2)
PG_URL_RO=<provisioned-by-platform-admin: read-only role, INSERT-test verified>
GH_TOKEN_AGENT=<provisioned-by-repo-admin: fine-grained, this repo only>
STITCH_KEY=<provisioned-by-design-lead>
```

And gitignored: `.env` (each teammate's real values, local only).

## The four properties this pattern maintains

1. **Registry-downstream:** server set here ⊆ registry rows, checked by
   `permission_audit.py` in CI - adding a server here without a row
   fails the build (no row, no connection, mechanically).
2. **Name discipline:** env-var names match the registry's credential
   column exactly - the name IS the join key between row, config,
   `.env.example`, and CI secret store. Renaming happens in all four in
   one commit (same-commit rule).
3. **Provisioning provenance in `.env.example`:** each placeholder says
   who provisions it and at what verified privilege - the file doubles
   as the onboarding request list (new-teammate checklist consumes it).
4. **No optional-server sprawl:** a server someone "sometimes uses"
   still needs its row and its entry, or it isn't connected in this
   repo - personal experiments belong in the personal registry, not as
   uncommitted local additions that make clones behave differently
   (the zero-setup property dies by a thousand local deltas).

## Generalization
`opencode.json`'s `mcp:` section and `config.toml`'s `[mcp_servers.*]`
follow the identical four properties - one registry, N connection
files, all downstream, all reference-only. Where a team runs multiple
tools, ALL connection files ship in the tree and CI audits each
(the parser stanzas in `permission_audit.py` exist for exactly this).

## Failure modes (reference-only)
Literal value "just locally, briefly" → GR-8 (narrative:
`mcp/secrets-handling.md` - "briefly" was eleven days); server added
sans row → GR-12; env-var name drift between row and config → audit
false-negatives, GR-5-class silent divergence.

## Verifier
`permission_audit.py` (properties 1-2 mechanically; literal detection);
secret scan (planted-token test per GR-8's constraint row); checklist
step consuming `.env.example` (property 3).

## TOOL TRANSFER table
Pattern identical across connection-file dialects (section above);
per-tool field names `[VERIFY]`-dated in each tool's config template.
