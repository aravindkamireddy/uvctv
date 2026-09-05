---
title: Secrets handling - env-var patterns for agent tooling
layer: L3
priority: P0
version: 1.0
date: 2026-07-24
source_model: Claude Fable 5
depends_on: [mcp/registry-template.md, mcp/registry-example-harborline.md]
usage: The vault's rules for credentials anywhere agents touch config. Owns the GR-8 narrative. Applies to every committed example in this vault - a violation here is a violation of the vault itself.
audience: solo, architect, team
tools: all
---

# Secrets Handling - Env-Var Patterns Only

Agent tooling multiplies the classic secrets problem three ways: agents
*write config files* (and will helpfully inline a value they saw in the
environment), agents *read broadly* (a committed secret enters every
future context window), and vault-style repos are *cloned and shared*
(one leaked example key ships to every adopter). The rules:

## The five rules (absolute - no UNENFORCED tier exists for these)

1. **Committed files carry references, never values.** Every credential
   in any config - `.mcp.json`, `opencode.json`, `config.toml`,
   `foundry.yaml`, anything - is an env-var reference:
   `${GH_TOKEN_AGENT}`, `env = { PG_URL = "${PG_URL_RO}" }`. The
   registry's credential column names the variable and its provisioner;
   the value exists only in the runtime environment or a secret manager.
2. **Examples use obviously-fake placeholders.** Docs and vault examples
   write `GH_TOKEN_AGENT=<provisioned-by-repo-admin>` - never
   realistic-looking strings, which train humans and agents alike to
   accept real-looking keys in diffs.
3. **Credential privilege equals row scope.** A read-only registry row
   backed by a read-write credential is a scope in name only (the GR-3
   lesson at the credential layer). Provisioning includes a negative
   test: demonstrate the read-only credential *cannot* write.
4. **Agents never echo secrets into artifacts.** Standing instruction in
   the instruction-file layer: values from the environment do not get
   written into code, config, logs, or commit messages. An agent asked
   to "just hardcode it to unblock" declines and cites this file.
5. **Leak response is mechanical, not deliberative:** rotate first, then
   scrub history, then audit reach (what could this credential touch per
   its registry row - that row is now your blast-radius map), then add
   the detector that would have caught it. Rotation is never deferred
   because "the repo is private" - private repos get cloned, forked, and
   fed to agents.

## Placement map (where secrets machinery lives)

| Concern | Location |
|---|---|
| Variable name + provisioner + privilege | registry row, credential column (SSOT) |
| Runtime values | environment / secret manager - never the repo |
| Local dev convenience | `.env` (gitignored) + committed `.env.example` with placeholders per rule 2 |
| CI values | CI secret store, mapped to the same variable names |
| Detection | secret-scanning in CI + pre-commit; `permission_audit.py` flags any config value that isn't a `${VAR}` reference |

---

## Worked incident: GR-8 - secret leakage (narrative owner)

**Setup.** While wiring the github MCP server, a teammate pasted a
working config into the repo's setup docs as an example - directly from
their machine, where `.mcp.json` held a real fine-grained token inline
("temporary, would move it to env later").

**Failure.** The example - real token included - merged in a docs PR
that reviewers skimmed precisely *because* it was docs. Discovery came
eleven days later, not from scanning (none was wired yet) but from an
agent: asked to "set up MCP like the docs show," it reproduced the
config verbatim, token and all, into a second file - at which point a
human finally *read* the string. Eleven days of exposure in a repo three
contractors had cloned; the token could open PRs and push agent
branches. Rotation was immediate; history scrubbing took an evening;
auditing what the token *could have* touched took longer than both,
because pre-registry there was no row stating its scope - the
blast-radius map had to be reconstructed from GitHub's token settings.

**Root cause.** Three stacked absences: no placeholder discipline in
docs (rule 2), no scanner (placement map), and no registry row to bound
the damage assessment (rule 3's paper trail). The agent didn't leak the
secret - it faithfully amplified a leak humans had already shipped.

**Permanent constraints** (entry GR-8 in
`orchestration/guardrails-example-harborline.md`): rules 1, 2, and 5
above; secret-scanning in CI and pre-commit; every credential has a
registry row before first use so leak response starts with a
blast-radius map instead of archaeology.

**Test that proves it holds:** CI secret-scan fails on a planted
realistic token in a docs file; `permission_audit.py` fails on any
non-reference credential value in config.

## Failure modes (reference-only)
GR-8 (narrated above); credential wider than row → GR-3 (narrative:
`mcp/registry-example-harborline.md`); "temporary" inline value with no
expiry → GR-12 pattern.

## Verifier
CI secret-scanning + pre-commit hooks; `permission_audit.py` reference
check; `ssot_linter.py` confirms credential names appear canonically in
registry rows only.

## TOOL TRANSFER table
Rules 1-5 are tool-independent by construction. Per-tool reference
syntax appears in each config template (`.mcp.json`, `opencode.json`,
`config.toml` - see their files); unlisted tools inherit rule 1 via
`tools/generic-adapter.md` step 3.
