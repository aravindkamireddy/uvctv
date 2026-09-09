---
title: Session handoff - build + audit state
layer: L9
priority: P0
version: 3.1
date: 2026-09-13
changelog: v1.5 - date field corrected (had read 2026-07-24 since the original build; version bumps never touched it - GR-2 in this file's own frontmatter). Adds the 2026-08-04 guide rewrite and the two script bugs it exposed.
source_model: Claude Fable 5
depends_on: [MANIFEST.md]
usage: Session artifact for lossless resume; regenerated each session.
audience: operator + next model instance
tools: all
---

# SESSION-HANDOFF - Universal Vibe-Coding Toolkit vault

## State: 2026-09-13 - two field bugs fixed, 114 files, **UNAUDITED**

Found by the operator's first real `npx update` after v3.0:

1. **hooks/ never reached the npm package.** `package.json`'s `files`
   allowlist did not list it, so `mkdir hooks` ran and nothing was written.
   This is the SECOND time that allowlist has silently truncated the package -
   the first cost the MCP server 43 of its 56 documents. Fixed, plus the CLI
   now says so explicitly instead of leaving an empty folder.
2. **Pre-provenance files were reported as "YOU changed".** A toolkit created
   before hash tracking has no record, and the CLI conservatively treated
   every such file as edited. Six files were listed as the operator's when
   they had never been touched - and worse, they would never have refreshed.
   Now the first tracked update ADOPTS the vault version and records the hash.

Lesson worth keeping: both bugs are the same shape - a mechanism that fails
QUIETLY and reports success. The allowlist truncates without error; the
conservative-keep looked like careful behaviour. Neither had a check.

## State (prior): 2026-09-12 - hooks + harness-audit, 114 files

Nine items adopted after reading ECC (github.com/affaan-m/ECC) - hooks,
instincts, agents, AgentShield and memory read from source, not the README.
What was taken and what was refused:

TAKEN
- **hooks/** - the first mechanism in this vault that ENFORCES rather than
  instructs. `config-protection.js` (GR-22: agents widen a lint rule instead
  of fixing code; the exemption then silently covers every later file) and
  `fact-gate.js` (GR-23: "are you sure?" returns the confidence already held;
  "list the importers" produces evidence). Eight test cases, all verified.
- **Prompt-defense baseline** in all 7 canonical skills and 7 OpenCode ports.
  ECC carries this in 67 of 68 agents; this vault had nothing equivalent, and
  every skill it ships is an instruction file an agent follows. GR-24.
- **harness-audit skill** + port + 13-case suite: the agent's own config as an
  attack surface. The vault audited MCP rows but never the files that grant
  an agent its powers.
- **Optional Conf/Seen columns** on guardrail entries, with >=0.8 promoting to
  mechanical enforcement. GR-22 and GR-23 sit at 0.8, which is why they are
  hooks rather than rules.

REFUSED, deliberately
- ECC's 286 skills (~50 language/framework, 30 ops, 140 misc) - that is a
  catalog product; this is a discipline. 19 of theirs overlap this vault.
- Their 68 agents: ~30 are per-language reviewers. Two archetypes were worth
  noting (build-error-resolver, silent-failure-hunter); neither was built
  without a real need.
- Auto-writing instincts: their loop writes learned rules unreviewed. The
  draft-then-approve gate stays.

Toolkit is now 22 installed files (7 skills + 7 ports + 4 shared + 4 cards +
2 hooks... hooks counted separately as they copy verbatim).

## NEXT
1. Wire the hooks in Claude Code and confirm they fire on a real edit.
2. Trigger-test harness-audit and the five still-untested skills.
3. Verify hook surfaces for the other 7 tools - all `[VERIFY]` today.

## State (prior): 2026-09-08 - FULL CHAIN PROVEN ON A REAL MACHINE, 108 files

**Everything from repo to agent retrieval now has live evidence**, not just
container tests:
- `npx github:aravindkamireddy/uvctv init` installs and links (9 targets).
- `--adopt` moved 26 pre-existing Cursor skills into the toolkit for real.
- `mcp-install` wrote configs for 5 tools incl. the Codex TOML append.
- The doc server returns actual vault narratives: GR-11's three-unrelated-
  tasks incident and GR-8's eleven-days-exposed token, neither of which is in
  any installed file.

**The bug that made MCP look broken was NOT the tool description.**
`package.json`'s `files` allowlist excluded orchestration/, design/, mcp/,
foundation/, verifiers/ and distillation/ from the npm package. Locally the
server saw 56 documents; via npx it saw 13, and `read_vault_doc` correctly
refused paths `search_vault` had just returned. Two tuning passes chased the
description before the packaging was checked. Fixed, plus `--selftest` now
exits non-zero below 40 documents naming the allowlist as the likely cause.

`.gitattributes` added: `.sh`/`.py` pinned to LF. Without it a Windows clone
ships shell scripts that fail on macOS/Linux with `bad interpreter: ^M` - the
vault shipped cross-platform scripts for weeks with no protection for them.

## STILL OUTSTANDING
1. Five skills untested on indirect phrasings (orchestrator confirmed only).
2. Vault UNAUDITED since fix-batch A-F.
3. Cursor showed "13 resources" - now expected to be 56; re-check after the
   packaging fix propagates.

## State (prior): 2026-09-06 - mcp-install covers all 6, 106 files

Codex added to mcp-install. No TOML parser (zero-dep rule): a table is
APPENDED, which is correct for TOML since tables are order-independent and
self-delimiting. Refuses to rewrite an existing uvctv-vault entry - the one
case it cannot verify without parsing - and prints the exact args to set.
Tested: fresh append preserving existing keys, idempotent re-run, conflict
refusal.

## State (prior): 2026-09-05 - mcp-install, 106 files

**npx github: RESOLUTION IS NOW PROVEN.** The operator published to
github:aravindkamireddy/uvctv and ran init successfully from a clean machine -
the last untested link in the distribution chain. Adopt also fired for real,
moving 26 pre-existing Cursor skills into the toolkit.

`uvctv mcp-install` added: detects installed tools, merges the doc-server
entry into each tool's GLOBAL config, backs up before writing, refuses
unparseable configs with a GR-16 row, idempotent on re-run. Verified against
a HOME with an existing server (preserved), a malformed config (refused) and
a repeat run (no-op).

Also corrected: the docs previously gave Claude Code's PROJECT config path
(`.mcp.json`) alongside everyone else's GLOBAL path - an inconsistency the
operator caught.

## State (prior): 2026-09-02 - provenance-aware update, 106 files

**A defect found by testing the operator's actual scenario.** Update only ever
ADDED missing files. An existing toolkit therefore kept its original skills
forever - every vault fix (Standing References wiring, the Cursor correction,
dual-layer paths) would never have arrived, while `done: N kept` reported
success. Stale content behind a green summary: GR-2's shape, in the updater.

FIXED in all three implementations (CLI + both shell twins): the toolkit now
carries `.uvctv-manifest.json`, a hash per file as extracted. On update a file
untouched since extraction is REFRESHED; a file you edited is KEPT and named.
Verified on the exact scenario - 5 skills refreshed, 1 edited skill kept, edit
intact, in both the CLI and setup.sh.

## State (prior): 2026-09-02 - MCP doc server, 106 files

The ~56 reference documents are now reachable by agents on demand:
`cli/lib/mcp-server.js`, launched as `npx -y github:<you>/uvctv mcp`. Zero
dependencies (node builtins, JSON-RPC over stdio). Exposes every doc as a
`vault://` resource plus `search_vault` and `read_vault_doc`.

THE SPLIT, which is the design and not a preference:
- skills stay FILES because tools scan directories at startup and keep
  descriptions ambient - that is what makes them fire without being asked;
- docs go over MCP because pull-on-demand is the only way 56 documents reach
  an agent without recreating GR-9.
Moving skills to MCP would trade triggering for retrieval. Do not.

Because npx keeps the package in a CACHE (only the 20 toolkit files land on
disk), the server ships INSIDE the package and is launched by the client -
there is nothing to install separately and nothing to keep in sync.

Registry row added for uvctv-vault: READ-ONLY, no credentials, no network.
The vault's own no-row-no-connection rule applies to the vault's own server.

## NEXT
1. Connect the server in one tool and ask for a playbook by description
   ("how should I split this work across agents") - verify search_vault is
   chosen without naming it. That is the same trigger question skills face.
2. Remaining five skills + indirect phrasings still untested.
3. Body-token audit before any compression decision.

## State (prior): 2026-09-02 - Cursor correction, 104 files

**Operator evidence overturned a vault claim.** A directory listing of a real
`~/.cursor` showed `skills-cursor/` holding `<name>/SKILL.md` folders. The
vault had said Cursor has NO global skills directory and inherits via
Claude-skill import. Wrong, and wrong in the GR-17 way: it asserted an
ABSENCE, which is harder to verify than a presence, inferred from docs that
simply did not mention one. Corrected across 12 files; Cursor is now a normal
link target in all three installers (9 targets, up from 8).

`~/.cursor/agents/` exists but was empty on the reference install. Left
unwired - wiring a path whose contents are unconfirmed is the same error in a
new place.

## State (prior): 2026-08-21 - reference cards wired, 104 files

**Operator confirmed a skill fires in OpenCode** - the file-based model works.
That unblocked this step and is the first live evidence in the project.

- Four orchestration playbooks now extract as CONDENSED CARDS into
  `~/agent-toolkit/reference/` (plan-build, swarm-launch, context-reset,
  role-design). The full playbooks stay as teaching documents in the vault;
  the cards are the mechanical part only, ~22 lines each.
- The orchestrator skill points at them with an explicit instruction to pull
  ONE, not all four - reading all four is the context flood the cards exist
  to avoid.
- One hop, no further: cards point at nothing. `toolkit_linter` now covers
  `reference/` and enforces it.
- Toolkit is now 20 installed files (6 skills + 6 ports + 4 shared + 4 cards).

## NEXT (in order)
1. Test the OTHER five skills, and test INDIRECT phrasings ("how should we
   split this work") - that is where GR-6 lives. One data point is not a
   verified suite.
2. MCP doc server for the remaining ~50 reference documents, only after 1.
3. Audit the six skill bodies for filler and report token counts before any
   compression decision.

## State (prior): 2026-08-19 - product wiring fixed, 104 files

The operator asked why 95 files exist if only 6 install. Investigating that
found a REAL defect the five linters had passed clean for weeks:

- `verifiers/RUBRIC-ui-design.md` was never extractable - the ui-ux-designer
  skill told agents to self-score against a rubric that did not exist in any
  toolkit. FIXED: it now carries a FILE marker -> `shared/RUBRIC-ui-design.md`.
- Skills referenced `mcp/registry.md` and `design/DESIGN.md` - correct for a
  PROJECT, wrong for a personal toolkit, where those files land as
  `shared/mcp-registry.md` and `shared/DESIGN.md`. FIXED: every reference is
  now dual-layer (project path / personal path).
- NO skill referenced `shared/` at all, so GUARDRAILS.md - described in the
  guides as the highest-value file - was read by nothing. FIXED: all six
  skills open with a Standing References block naming GUARDRAILS.md first,
  with the rule that a guardrail beats anything else in the skill.
- **GR-21 minted** and `toolkit_linter.py` written: extracts to a temp
  toolkit and fails on unresolvable references or dead wiring. Verified to
  catch the original defect; now the 6th check in both fixture runners.

## STILL UNTRUE, say so plainly
The six skill descriptions have never been run against a live model. The
vault's own law says an untested description is assumed to under-trigger.
"Skills fire automatically" is a claim this repo cannot support yet - the
operator has observed they often do not. Running the six trigger suites in a
real tool is the outstanding item, and it is the one that decides whether the
vault works.

## State (prior): 2026-08-16 - Node CLI, 103 files

- **`npx github:<you>/uvctv init` is now the primary install path.**
  `cli/bin/uvctv.js` + root `package.json`, zero dependencies, node builtins
  only. Verbs: init / update / link / unlink / status, with --dry-run/--check,
  --adopt, --all, --force, --restore, --json. Ten scenarios tested.
  One implementation replaces two shell twins; setup.{sh,ps1} stay for
  non-Node users and are declared SECONDARY - if they ever disagree with the
  CLI, the CLI is canonical.
- **This closes the OpenClaw remote-gateway gap.** The same git URL serves
  `npx` on a laptop and `openclaw skills install <git-url> --global` in a
  Railway console. A zip served neither.
- **Field bug fixed (Windows log):** setup.ps1 silently ACCEPTED a stray token
  (`-uninstall [restore]`) because PowerShell bound it positionally to -Vault,
  where uninstall mode ignores it. All params are now named-only and unknown
  args exit 2. setup.sh already rejected them - a twin divergence, which is
  itself the argument for the CLI.

## PUBLISHED
Live at github.com/aravindkamireddy/uvctv. Placeholders replaced.

## State (prior): 2026-08-11 - OpenClaw + Zed + unified setup, 101 files

- **Two new tool columns.** Zed (canonical; `~/.agents/skills` flat layout;
  the strongest MCP permission dialect in the matrix - per-tool
  `mcp:<server>:<tool>` keys, now the reference in permission-translations).
  OpenClaw (a gateway ABOVE the matrix that dispatches Codex/OpenCode/Claude
  Code; three deployment profiles, of which the remote/Railway one CANNOT use
  links - skills travel by git URL to `/data/.openclaw/skills` on the volume).
- **GR-20 minted:** skill-provenance blindness. A skill's effective privilege
  is the agent's privilege; community skills are dependencies, not content.
- **Six personal-layer scripts unified into `setup.{sh,ps1}`.** Detection:
  no toolkit → fresh install; existing → update preserving your edits.
  Verbs: --dry-run/--check, --update, --uninstall (--restore), --adopt, --all,
  --force. Seven scenarios tested end to end on POSIX.
- Companion loopback MCP row added to the harborline registry.
- Propagated: MANIFEST v1.8, parity matrix (9 tools), tree.md v1.6, BOOTSTRAP
  v1.5, glossary (9 columns), permission-translations v1.1, registry v1.1,
  curriculum v1.1, both install guides + PDFs, inventory .md/.docx.

## State (prior): 2026-08-07 - field fixes, 102 files

Latest package: `UVCTV-complete-2026-08-07.zip`. Vault v1.7, 102 files;
reconciliation clean from the extracted copy, all 5 fixtures fail as required.

Three defects found by the OPERATOR running the scripts on real machines -
every linter, fixture and reconciliation pass had reported clean:
- **BLOCKER (Windows):** install.ps1 used `"$Dst:"`, which PowerShell parses as
  a drive-qualified variable. The script failed at PARSE time - it never ran on
  any Windows machine from the guardrail-emission pass until now. Fixed to
  `${Dst}`. Unverifiable in this container (no PowerShell).
- **UX gap (macOS):** a pre-existing real directory at a link target was a
  correct refusal with no way forward. Added `--adopt` / `-Adopt`: moves the
  existing contents INTO the toolkit, then links; never overwrites; conflicts
  reported and left in place. Verified against a reproduction.
- **Missing capability:** added `uninstall.{sh,ps1}` - removes only links it
  made, refuses foreign links AND real directories (both provoked and
  verified), never touches the toolkit. `--restore` copies files back into each
  tool's own folder first.

Propagated: MANIFEST v1.7, personal-layer/tree.md v1.5, BOOTSTRAP v1.4,
README v1.3, ONBOARDING v1.2 (+"Backing out"), AUDIT-REPORT (field findings),
both install guides + PDFs, inventory .md and .docx at 102 rows.

Near-miss worth keeping: one string replacement in this batch targeted a line
with the wrong indentation and failed SILENTLY because that call had no assert -
`--adopt` parsed as an unknown flag and the feature was dead. Caught by testing
the feature, not the patch. Every replacement now asserts.

## State (prior): 2026-08-04 - guides rewritten, 100 files

Latest package: `vibe-toolkit-vault-2026-08-04.zip` (100 files; reconciliation
clean on the extracted copy, all 5 fixtures fail as required from extraction).

Since the fix batch:
- INSTALL-Windows.md and INSTALL-Mac-Linux.md rewritten against verified script
  output (9 stale items: old zip name, 8-folder toolkit, the removed copy step,
  `skip` vs `not detected`, missing Cursor, no fallbacks) and added to the vault
  + MANIFEST as declared auxiliaries. Dark/red PDFs generated outside the vault.
- TWO SCRIPT BUGS found by writing those guides, fixed in both twins:
  (1) bootstrap's closing message still said "copy install.sh in" after item F
  made it automatic; (2) `not detected` printed once per map entry, so .codex
  appeared twice - now deduped per detect-root.
- Inventory delivered as `U V-C T V File Inventory.{md,docx}`, both at 98 rows;
  NOTE they predate the two guides, so they read 98 while the vault is 100.

## State (prior): FIX-BATCH A-F APPLIED 2026-08-03 - **UNAUDITED**
98 files (was 101). Six fixes + a cross-cutting guardrail-emission pass:
- A: Antigravity paths reverted to ~/.gemini/config/ (my v1.1 error from a
  third-party comparison table). GR-17 minted, narrative in glossary.
- E: Command Code .command/ -> .commandcode/, skill.md -> SKILL.md (case is
  validated; lowercase silently never loads). 6 stale refs found beyond scope.
- D: PORT CONSOLIDATION. 18 port files -> 6 canonical skills/<name>/SKILL.md
  + 6 OpenCode ports (the one genuine port). parity_linter rewritten v2.0 to
  check coverage AND flag duplication (it previously REQUIRED it - GR-19).
  Installer shrank: one skills/ dir fans out to 5 tools.
- B: Codex "N/A - no skill unit" was FALSE; skills confirmed. GR-18 minted.
- C: Cursor column added (WRONG at the time: claimed no global rules dir; see 2026-09-02 correction. Then believed to inherit via Claude-skill
  import). Six-tool status table in personal-layer/tree.md.
- F: tool detection (--all/-All override) + bootstrap copies the installer
  (no auto-run, deliberately).
- Cross-cutting: all 5 linters + 4 scripts emit GUARDRAILS.md rows on
  failure/stall/loop; all three classes provoked, not hand-written.
GR registry now GR-1..GR-19.

## KNOWN GAPS (carry forward)
1. This batch ships UNAUDITED - run the audit protocol over it.
2. Anti-duplication pass matches descriptions VERBATIM; paraphrased
   restatement passes clean (found Command Code's 310 lines by reading,
   not linting).
3. Two live [VERIFY] tags: Antigravity `config/skills` subdir, OpenCode
   global `skills/` format. Clear only with primary docs (GR-17).
4. Untested on a real Windows machine since the .ps1 rewrites.
5. Inventory .md and .docx are both at 102 rows, matching the vault.
5b. .ps1 CHANGES ARE UNVERIFIED BY EXECUTION - no PowerShell in the build
   environment. They are verified by review plus operator field reports. Treat
   every .ps1 edit as unproven until run on Windows; the parse-time blocker
   above is what that risk looks like when it lands.
6. reconcile.py's auxiliary class-list has needed widening three times
   (Windows installer, golden runner, setup guide). Change it to accept any
   non-empty class string instead of an allowlist.
7. The two script bugs above were invisible to all five linters - they were
   found by writing documentation. Doc-writing is an unlisted verifier.

## State (prior): COMPLETE + AUDITED incl. B-amendment (2026-07-25)
99 files. B0-B3 shipped the UI/UX discipline (14 new + 7 deepened:
ui-ux-designer + design-system across 3 native ports + command-code
bundle, design-review-workflow owning GR-14, RUBRIC-ui-design, 2
suites, a11y_linter + goldens, design-tasks.jsonl); GR registry now
15 (GR-13/14/15 minted); parity 6x6; SSOT 12 rows; reviewed rules
files placed verbatim + staleness exempt mechanism implemented.
Audit protocol re-run over the amendment: 1 MAJOR + 1 C9 fail fixed,
2 flags disproven, all 18 B-files at 10/10. Prior audit state below.

## State (prior): COMPLETE + AUDITED (Phases 1-4, 2026-07-24)
66 content files + declared auxiliaries (handoff, parity matrix, 10
fixtures, fixture runner, AUDIT-REPORT.md) = 80 files. Six thin files
repaired to 10/10 gate boxes (see MANIFEST audit-outcome table); one
BLOCKER (missing claimed fixtures) fixed and verified. Residual risks:
AUDIT-REPORT.md final section.
Build ran S1-S13 in one extended session, per-layer checkpoints, manifest
v1.0 finalized. All 12 GR narratives landed in owners; parity matrix fully
resolved; JSONL spec amended (approved): 15-25 exemplar-grade lines/family.

## Verified in-session
- ssot_linter, staleness_linter, parity_linter, permission_audit: each
  smoke-tested against planted violations (all caught; exit codes correct).
- install.sh: fresh install / idempotence / --check drift detection /
  drift repair / never-deletes-real-dirs - all passed.
- Vault self-lint (parity): caught 4 real unlabeled-indirect suite cases;
  fixed; now CLEAN.

## To resume in a fresh session
1. Upload the zip; extract to a working dir.
2. Load BOOTSTRAP.md (behavior spec + routing) - it is self-contained.
3. Likely next work: `deepen <file>` passes; re-verify [VERIFY 2026-07]
   blocks (Command Code + Antigravity densest); generate ssot.rules.json
   + staleness.rules.json seeds for adopters (linters exist; adopter rule
   files are Tier-2 localization per ONBOARDING).

## Open items (deliberate, not omissions)
- Rule-file seeds (ssot/staleness .json) ship as documented formats in the
  linters' docstrings, not as filled files - they are adopter-specific by
  design; a harborline-seeded example pair would be a nice deepen.
- All [VERIFY 2026-07] tags start their 120-day clock now.
