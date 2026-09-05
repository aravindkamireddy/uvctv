---
title: OpenClaw gateway security - permissions, pairing, skill provenance (+ GR-20)
layer: L2
priority: P0
version: 1.0
date: 2026-08-11
source_model: Claude Fable 5
depends_on: [tools/openclaw/openclaw-notes.md, mcp/registry-template.md, mcp/secrets-handling.md, skills/security-reviewer/SKILL.md]
usage: Read BEFORE exposing a gateway or installing any third-party skill. Owns the GR-20 narrative. This is the vault's registry and reviewer discipline mapped onto a system that already has native enforcement - unusually, the tool is stricter than our documentation.
audience: solo, architect, team
tools: openclaw
---

# OpenClaw Gateway Security

An OpenClaw gateway is an agent with shell access, browser control and the
ability to act on your behalf, running on a loop, reachable from a chat app.
Every permission question the vault asks about MCP servers applies here with a
larger blast radius - and unlike most tools in the matrix, OpenClaw ships real
enforcement surfaces to map onto rather than prose to hope about.

## The four controls (native, verified 2026-08)

1. **Node command policy.** Node commands must be declared by the node and
   allowed by gateway policy before they run. Privacy-sensitive commands -
   `screen.record`, `camera.snap`, `camera.clip` - require explicit
   `gateway.nodes.commands.allow` opt-in `[VERIFY 2026-08]`. This is the
   registry's roles-and-scope columns, enforced by the runtime.
2. **Device pairing.** New browsers and devices need one-time approval
   (`openclaw devices approve`); loopback connections are auto-approved while
   remote ones require explicit approval `[VERIFY 2026-08]`. This is the
   registry's human-approval-triggers column, enforced.
3. **Skill trust envelope.** Registry skill pages expose the latest security
   scan state before install, and the verify command exits non-zero when
   verification fails `[VERIFY 2026-08]`. A non-zero verify is a blocking
   finding, not a warning to click past.
4. **Network exposure.** Public deployment templates commonly expose the
   gateway to the public internet, and the templates themselves recommend
   removing the public endpoint once setup is done if you only use chat
   channels. Combined with the project's CVE history - a documented critical
   flaw allowing token theft and RCE via a single link, with tens of thousands
   of instances found publicly exposed - **the default posture is: no public
   endpoint unless you need the dashboard, and never over plain HTTP.**

## Mapping to the vault

| Vault concept | OpenClaw surface |
|---|---|
| Registry row: roles allowed | node command allow-list per node |
| Registry row: read/write scope | which commands are declared and allowed |
| Registry row: approval triggers | device pairing + privacy-command opt-in |
| Registry row: credential handling | gateway state dir; env vars, never in skills |
| security-reviewer's structural read-only | **inapplicable** - the gateway agent is not edit-denied by design. Compensate with node policy: deny the command classes a reviewing run must not use |
| No row, no connection | no allowed command without a registry row for it |

Practical instruction: **add a `mcp/registry.md` row per gateway node** with
the same six fields, listing the exact commands allowed. Treat "the node can
do it" as the scope column and "the gateway allows it" as the enforcement.

---

## Worked incident: GR-20 - skill-provenance blindness (narrative owner)

**Setup.** A gateway was running with a broad set of node commands allowed -
shell, browser, file access - because it was doing real work and each grant
had been individually reasonable. The operator wanted a summarisation
workflow, found a community skill that did roughly that, and installed it with
a single command from a public registry.

**Failure.** The skill was not malicious, which is what makes the incident
instructive rather than dramatic. But nobody read it. It ran with **every
permission the agent already had** - a skill is instructions the agent
follows, so its effective privilege is the agent's privilege, not some
sandboxed subset. When it later produced a surprising side effect (fetching a
URL its description never mentioned), the review had to reconstruct what it
had been able to reach: everything. The audit cost dwarfed the skill's value,
and the honest conclusion was that the operator had been one unlucky package
away from a much worse story - which is precisely the story the project's own
CVE tells, at protocol level rather than skill level.

**Root cause.** Skills were treated as content rather than as code. Every
other executable the vault touches goes through provenance discipline - MCP
servers get registry rows, credentials get env vars, dependencies get pins -
but a `SKILL.md` from a stranger was installed on a description alone. The
category error is thinking "it's just markdown". It is markdown that steers an
agent holding your shell.

**Permanent constraint** (GUARDRAILS entry GR-20): treat community skills like
dependencies from unknown authors. Before install: read the SKILL.md end to
end, check the registry's scan state, and run the verify command - a non-zero
exit blocks. After install: the skill's effective scope is the agent's scope,
so a new skill is a trigger to re-read the node command allow-list, not an
independent decision. Prefer skills you or your team authored; the six in this
vault are auditable because you have their source.

**Test that proves it holds:** a skill installed without a recorded read and
verify exit code is a review finding; `permission_audit.py` fails a gateway
whose allowed commands exceed its registry rows.

## Failure modes (reference-only)
GR-20 (narrated above); public endpoint left exposed after setup → the CVE
class above; credentials pasted into skill bodies → GR-8 (narrative:
`mcp/secrets-handling.md`); allowed commands never rowed → GR-12 (narrative:
`orchestration/guardrails-example-harborline.md`).

## Verifier
`verifiers/lint/permission_audit.py` (registry rows vs allowed commands);
`openclaw devices` review at the same cadence as the quarterly MCP audit; the
registry's own verify command before every third-party install.

## TOOL TRANSFER table
The four controls are OpenClaw-native. The DISCIPLINE is universal: any tool
that installs third-party agent instructions inherits GR-20. Command Code and
Zed both load community skills; Cursor imports Claude skills; the same
read-before-install rule applies, minus the scan tooling. See each tool's
notes.
