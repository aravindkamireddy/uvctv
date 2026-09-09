---
title: Audit report - 2026-07-24 hostile self-audit
layer: L9
priority: P0
version: 1.1
date: 2026-07-24
source_model: Claude Fable 5
depends_on: [MANIFEST.md, BOOTSTRAP.md]
usage: Record of the vault's post-build audit; read alongside MANIFEST's audit-outcome table. Residual risks at the end are the maintenance backlog.
audience: operator, adopters
tools: all
---

# Audit Report - 2026-07-24

## Baseline used
N_manifest 66 (1:1 entry→file). Frontmatter: the ten-field schema
(markdown YAML / script comment block / data-file manifest-row, exemption
documented during this audit). Runnables: 4 linters + install.sh +
(post-fix) run_fixtures.sh. Gate: the ten-box gate from the build's
master prompt - found embedded NOWHERE in the vault at audit start
(itself a finding; fixed by embedding in BOOTSTRAP).

## Findings and fixes
- BLOCKER: verifiers/lint/fixtures/ claimed at lint/README.md:86, absent
  on disk - the vault violated its own "never name a deliverable without
  producing it." FIXED: 10 fixture files + run_fixtures.sh; all four
  linters verified to exit 1 on their planted violations.
- MAJOR: 2 disk orphans undeclared (SESSION-HANDOFF.md,
  parity.matrix.json). FIXED: auxiliary-assets section in MANIFEST.
- MAJOR: frontmatter schema claimed "every vault file"; 4 data files
  cannot comply. FIXED: documented three-tier exemption in the schema
  SSOT.
- MINOR: MANIFEST carried a stale plan-era closing line; SESSION-HANDOFF
  lacked frontmatter; an in-audit fixture miscount (9 vs 10) was
  corrected in the same response it occurred (count-drift rule).
- QUALITY (Phase 3, 6 files thin against the gate): see MANIFEST's
  audit-outcome table; all repaired to 10/10 with version bumps and
  changelog lines.

## Disproven flags (kept per protocol; evidence that killed each)
- 66 "unresolved internal links": all were harborline FIXTURE paths
  (mcp/registry.md, design/DESIGN.md) - the fictional repo's dirs share
  names with vault dirs; every hit sits in/beside a
  `<!-- FILE: harborline/... -->` context. Zero real broken links.
- `sk_live_9f3ab...` (permission-configs.pairs.jsonl line 7): the
  REJECTED member of a preference pair whose chosen member states the
  env-var rule - deliberate trap content, truncated and fake. KNOWN
  SCAN HIT: adopters running secret scanners on the vault itself will
  flag this line; allowlist it or accept the noise.
- CRED_KEY_RE in permission_audit.py: the detector's own pattern.
- TEST-PENDING (7 hits): documented convention
  (guardrails-template.md:58).
- Phase-3 claim that the anchors' SSOT disclaimer "failed to grep": the
  disclaimer EXISTED - the grep pattern spanned a line wrap. The v1.1
  repair still stands (it names the exempt-rule mechanism, which was
  genuinely absent), but the original flag overstated the defect.
- install.sh "exit=0" in the Phase-2 re-run: pipeline artifact (tail
  swallowed the code); the full lifecycle test earlier in the session
  showed correct exits at every stage.

## Operator skips
None - every queued file was repaired.

## Residual risks (the honest backlog)
1. Every [VERIFY 2026-07] tag is unverified against live tool docs;
   Command Code and Antigravity files are the densest. 120-day clock
   running.
2. ssot.rules.json / staleness.rules.json ship as documented formats in
   linter docstrings, not as filled adopter files (Tier-2 localization
   by design; a harborline-seeded example pair remains a worthwhile
   deepen).
3. The known secret-scan hit above.
4. Suite "runs" are specification-grade (cases + pass rules), not yet
   executed against a live model in any tool - first adopter eval rounds
   are the real test of the fire-rate numbers used in golds.

---

# Audit Report - 2026-07-25 (B-amendment: UI/UX discipline)

Scope: the 14 new + 4 deepened files of the UI/UX amendment (B0-B3),
plus the two reviewed rules files. Baseline: N=99, gate = BOOTSTRAP's
ten boxes, runnables = 5 linters + 2 runners + 2 installers.

## Findings and fixes
- MAJOR: linter fixture goldens carry no frontmatter and are
  deliberately truncated; no exemption covered them (the .jsonl/.json
  exemption did not extend to .md test data). FIXED: second documented
  exemption in the schema SSOT.
- C9 FAIL (Phase 3): distillation/design-tasks.jsonl lines 8 and 15
  lacked the mechanical `Done:` criteria every sibling record carries.
  FIXED: both repaired; 16/16 now carry done-criteria.
- Verifier bug found during B3 (self-reported): reconcile.py's leaf-dir
  expansion made ALL directory entries absorb their disk contents,
  producing a vacuous CLEAN MATCH that hid 13 undeclared files. FIXED
  (expand only true leaf dirs); the fixed verifier then immediately
  caught a real indentation error in two MANIFEST rows I had just
  written.
- a11y_linter's first real-vault run caught personal-layer/
  shared-design-personal.md missing the v1.1 format's Accessibility
  section. FIXED as a versioned ripple (v1.1), not an exemption.

## Disproven flags (evidence)
- "Truncated" fixtures/ssot/owner.md and fixtures/staleness/
  exempted.md: planted test data whose exact content IS the assertion.
- PLACEHOLDER hit in a11y_linter.py line 35: the detector's own
  variable name (same class as CRED_KEY_RE in the prior audit).

## Scores
All 18 B-files at 10/10 applicable gate boxes after the single repair.
Evidence: 6/6 new L2 skills carry full options/rejection traces and
TOOL TRANSFER tables with REAL Stitch/Claude Design cells (mandate
met, zero N/A there); RUBRIC-ui-design carries 12 scored samples
(4 dims x 3 levels) each with a why-clause; both suites exceed the
NOT/indirect floor with unconditional conduct canaries.

## Residual risks (added to the standing backlog)
5. ssot.rules.json has no coverage for the two new fact classes
   (accessibility rules, component conventions) - deferred per the
   distribution-check-before-patterning rule; measure grep noise
   first.
6. a11y_linter covers the CONTRACT side only; the render-side half
   (keyboard walk, focus observation) remains human/browser work by
   design - a linter cannot walk a flow.
7. The design suites, like all others, are specification-grade until
   run against a live model.

---

# Field findings - 2026-08-07 (real-machine runs, Windows + macOS)

Three defects that every linter, fixture and reconciliation pass reported clean.
All were found by the operator running the scripts on real machines.

- **BLOCKER (Windows):** `install.ps1` used `"$Dst:"` inside a double-quoted
  string. PowerShell parses `$Dst:` as a drive-qualified variable, so the script
  failed at PARSE time - it never ran at all, on any Windows machine, since the
  guardrail-emission pass introduced that line. Fixed: `${Dst}`. No test in this
  container could have caught it (no PowerShell available); the only honest
  mitigation is that .ps1 changes are unverified until run on Windows, which the
  handoff now states.
- **UX gap (macOS):** a pre-existing real directory at a link target produced a
  correct refusal with no way forward. Added `--adopt` / `-Adopt`: moves the
  existing contents into the toolkit, then links, never overwriting a toolkit
  file. Verified against a reproduction of the operator's exact situation.
- **Missing capability:** no uninstaller existed. Added `uninstall.{sh,ps1}`,
  which removes only links it made and refuses foreign links and real
  directories - both refusals provoked and verified.

Process note: a fourth defect nearly shipped inside this fix. One string
replacement targeted a line with the wrong indentation and failed silently
because that call had no assert; the `--adopt` flag parsed as unknown and the
feature was dead. Caught by testing the feature rather than trusting the patch.
Every replacement in this batch now asserts.

---

# Change note - 2026-08-11 (OpenClaw, Zed, script unification)

Not an audit - a record of scope added since the last one, all UNAUDITED.

- Two tool columns added after primary-doc research (Zed, OpenClaw). Both are
  canonical-mode: the six skills load unchanged. Zed's per-tool MCP permission
  keys are now documented as the matrix's strongest dialect, displacing
  OpenCode.
- GR-20 minted and narrated in tools/openclaw/gateway-security.md.
- The six personal-layer scripts became two. The previous three-way split was
  justified by the one-output-per-role rule, which governs AGENTS - where
  capability shape is a safety boundary - not scripts. Applying it there cost
  two commands and two explanations for no safety gain. The operator called
  this out; the correction is theirs.
- Standing risk unchanged and now larger: setup.ps1 is a full rewrite that has
  never executed. The last PowerShell rewrite shipped a parse-time blocker
  (GR-16 class). Scan for `"$var:"` traps was run and is clean, brace/paren/
  quote balance checked - but neither is execution.

---

# Change note - 2026-08-16 (Node CLI)

- `cli/bin/uvctv.js` + root `package.json` added; `npx github:<you>/uvctv init`
  becomes the primary install path. Zero dependencies (node builtins only), so
  the audit surface is one file.
- Rationale beyond convenience: two shell twins have produced a defect at every
  divergence (doubled separators, flattened skill dir, silent arg binding).
  One implementation removes the class. The shell scripts remain, explicitly
  secondary.
- Field defect fixed: setup.ps1 accepted unknown arguments silently because
  PowerShell bound them positionally to -Vault. Found by reading the operator's
  Windows log, not by any check in this repo - the CLI's arg validation was
  written from that lesson.
- UNVERIFIED: `npx github:` resolution itself cannot be tested here (no GitHub
  repo). The CLI was tested by direct invocation, including the npx-style
  default vault path (package root). Publishing steps are in SESSION-HANDOFF.

---

# Field note - 2026-09-08 (MCP doc server, real-machine)

The doc server appeared not to fire. Two passes tuned the tool description on
the assumption it was a routing failure (GR-6's shape). It was not: the npm
package's `files` allowlist excluded every reference directory, so the server
launched via npx served 13 documents instead of 56, and `read_vault_doc`
refused paths `search_vault` had returned moments earlier.

The lesson is about diagnosis order. The symptom - a tool not being used -
matched a failure mode the vault has a narrative for, and that made the wrong
hypothesis attractive. The operator's agent actually named the real cause in
its own reasoning ("orchestration playbooks may be excluded") before I checked
it. Nothing in the repo could have caught this: the linters test the vault, and
the vault was fine. What was broken was the PACKAGE, which no check existed
for - the same gap class as GR-21, one layer further out.

Mitigation: `--selftest` exits non-zero below 40 documents and names the
allowlist. That is a floor, not a fix for the diagnosis habit.

---

# Change note - 2026-09-12 (ECC adoption)

Nine items added after reading ECC from source. Method matters here: hooks,
instincts, agents and AgentShield were read as files; the 286 skills were
surveyed by NAME ONLY and are reported as such. A full comparison was declined
because it could not have been done honestly within context - the same class of
error as the two earlier README-based claims that turned out wrong.

New: hooks/ (2 hooks + README owning GR-22, GR-23), skills/harness-audit +
OpenCode port + suite, prompt-defense baseline in 14 files, optional Conf/Seen
guardrail columns. GR-22, GR-23, GR-24 minted.

The toolkit linter caught three unresolvable references in the new files
before they shipped - "skills/agents dirs" read as a path, and a reference to
hooks/README.md which is vault documentation rather than installed content.
That is the linter doing exactly the job GR-21 created it for.

UNAUDITED: all of the above.
