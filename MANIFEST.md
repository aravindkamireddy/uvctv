---
title: Vault Manifest - planned tree, generation order, pre-approval audit
layer: L9
priority: P0
version: 3.0 (2026-09-12 - hooks (the first mechanism here that ENFORCES rather than instructs), harness-audit skill, prompt-defense baseline in all 7 skills + 7 ports, optional confidence scoring on guardrails; GR-22/23/24 minted. Prior 2.6 2026-09-08 - .gitattributes + .gitignore added; MCP doc server proven end to end on a real machine. Prior 2.5 2026-09-06 - mcp-install now covers Codex via TOML table append with conflict refusal. Prior 2.4 2026-09-05 - mcp-install command: merges the doc-server entry into every tool's global MCP config, with backups and parse-refusal. Prior 2.3 2026-09-02 - MCP doc server added: 56 reference documents served on demand, skills stay as files. Prior: Cursor correction: it HAS a global skills directory; now a normal link target in all three installers. Prior 2.1 2026-08-21 - four orchestration playbooks now extract as condensed reference cards into the toolkit; orchestrator points at them (one hop, linted). Prior 2.0 2026-08-19 - toolkit_linter added after three installed skills were found referencing paths that do not exist post-extraction; skills now wire shared/ explicitly; GR-21 minted. Prior 1.9 2026-08-16 - Node CLI added (`npx github:<you>/uvctv`); setup.ps1 v3.1 unknown-arg guard. Prior 1.8 2026-08-11 - OpenClaw + Zed columns; six personal-layer scripts unified into setup.{sh,ps1}; GR-20 minted. Prior 1.7 2026-08-07 - uninstallers added; install gains --adopt/-Adopt; PowerShell ${Dst} blocker fixed. Prior 1.6 2026-07-26 - fix-batch A-F: canonical skills, Codex skills, Cursor column, guardrail emission, tool detection. Prior 1.5 2026-07-25 - toolkit bootstrappers added (bootstrap-toolkit.sh/.ps1); installer link targets corrected against OpenCode/Antigravity/Command Code docs. Prior 1.4 B2/B3: UI/UX discipline - 14 new files (2 skills x 3 native ports + workflow + rubric + 2 suites + a11y linter/goldens + JSONL), 7 deepens, GR-13/14/15; parity 6x6; SSOT +2 rows. Prior: 1.3 B0: reviewed rules files ssot.rules.json + staleness.rules.json placed; staleness_linter v1.1 exempt mechanism + exemption negative-test golden; opencode-config line-51 reference fix. Prior: 1.2 2026-07-24 added Windows script twins install.ps1 + run_fixtures.ps1; audited Phase 1-4 complete; JSONL spec amended per approval 2026-07-24 to 15-25 exemplar-grade lines per task family)
date: 2026-07-24
source_model: Claude Fable 5
depends_on: [REFERENCE-ANCHORS.md]
usage: The approved build plan. Generation follows this order exactly; deviations require editing this file first.
audience: all
tools: all
---

# MANIFEST.md - Vault Manifest (115 files - fix-batch A-F applied 2026-07-26, UNAUDITED)

**Status 2026-07-24: generation finished.** Every file in the tree below
exists. Priority tags now describe maintenance weight, not build order.
The session plan below is preserved as the build record; actual build ran
S1-S13 compressed into one extended session with per-layer checkpoints.
GR-ID accounting: all 12 narratives landed in their owners (audit §1
discharged in full). Parity matrix: all cells resolve to shipped files or
reasoned N/A landing pages. Linters shipped AND smoke-tested against
planted violations; install.sh lifecycle-tested.

Legend: priority / layer / audience (S=solo, A=architect, T=team) / tools.
`[VERIFY]`-density flags files whose tool syntax rots fastest.

## File tree

```
vibe-toolkit-vault/
├── REFERENCE-ANCHORS.md                          P0  anchors  SAT  all      ✅
├── MANIFEST.md                                   P0  L9       SAT  all      ✅ (this file, final)
├── README.md                                     P0  L9       SAT  all      ✅
├── BOOTSTRAP.md                                  P0  L9       SAT  all      ✅
├── COMMANDS.md                                   P1  L9  SA   all          (every npx command, flags, per-platform examples, troubleshooting)
├── ONBOARDING.md                                 P0  L9       SAT  all      ✅
│
├── foundation/                                       L1 - Universal foundation
│   ├── agents-md-template.md                     P0  L1  SAT  all          (+staleness rules; owns GR-2 narrative)
│   ├── agents-md-example-harborline-root.md      P0  L1  SAT  all          (SSOT: commands, pins, ask-first, never-do)
│   ├── agents-md-example-harborline-web.md       P0  L1  SAT  all          (monorepo nesting-by-placement)
│   └── agents-md-counterexample-bloated.md       P0  L1  SAT  all          (bad example + trimming pass; owns GR-10)
│
├── .gitattributes                                P0  L9  SAT  all          (LF for .sh/.py: a CRLF checkout ships shell scripts broken on macOS/Linux)
├── .gitignore                                    P1  L9  SAT  all          (node_modules, caches, installer backups)
├── package.json                                  P0  L7  SAT  all          (npm manifest: enables `npx github:<you>/uvctv`; zero dependencies)
├── cli/bin/uvctv.js                              P0  L7  SAT  all          (the CLI: init/update/link/unlink/status/mcp/mcp-install; one implementation, all platforms)
├── cli/lib/mcp-server.js                         P1  L7  SAT  all MCP      (doc server: 56 reference docs as resources + search_vault; read-only, zero deps)
│
├── hooks/                                            L4 - Deterministic enforcement
│   ├── README.md                                 P1  L4  SAT  hook-capable (wiring + per-tool support; owns GR-22, GR-23)
│   ├── config-protection.js                      P1  L4  SAT  hook-capable (blocks edits to existing linter configs)
│   └── fact-gate.js                              P1  L4  SAT  hook-capable (demands facts, not confirmation, before edits/destructive cmds)
│
├── skills/                                           CANONICAL - one file per skill, all tools
│   ├── skill-writer/SKILL.md                     P0  L2  SA   all          (meta-skill: authoring + description tuning)
│   ├── orchestrator/SKILL.md                     P0  L2  SA   all          (task routing decision table)
│   ├── mcp-permission-audit/SKILL.md             P0  L2  SAT  all          (no row, no connection)
│   ├── security-reviewer/SKILL.md                P0  L2  SAT  all          (read-only review; structural independence)
│   ├── ui-ux-designer/SKILL.md                   P0  L2  SAT  all          (screen/flow discipline + browser verification)
│   ├── design-system/SKILL.md                    P0  L2  SAT  all          (closed component set; owns GR-15)
│   └── harness-audit/SKILL.md                    P0  L2  SAT  all          (audits the agent's OWN config: skills, hooks, MCP, permissions)
│
├── tools/                                            L2 - Tool-native primitives
│   ├── claude-code/
│   │   └── claude-md-template.md                 P0  L2  SAT  claude-code  (CLAUDE.md references-not-restates pattern)
│   ├── opencode/
│   │   ├── opencode-config.md                    P0  L2  SAT  opencode     (opencode.json + AGENTS.md wiring) [VERIFY-dense]
│   │   ├── agent/skill-writer.md                 P0  L2  SA   opencode
│   │   ├── agent/harness-audit.md                P0  L2  SAT  opencode     (port; edit: deny keeps the auditor honest)
│   │   ├── agent/orchestrator.md                 P0  L2  SA   opencode
│   │   ├── agent/mcp-permission-audit.md         P0  L2  SAT  opencode
│   │   ├── agent/ui-ux-designer.md               P0  L2  SAT  opencode     (B2 port; UI edit-scope)
│   │   ├── agent/design-system.md                P0  L2  SAT  opencode     (B2 port; contract outside edit scope)
│   │   └── agent/security-reviewer.md            P0  L2  SAT  opencode     (permission: edit deny)
│   ├── antigravity/
│   │   └── gemini-md-template.md                 P0  L2  SAT  antigravity  (GEMINI.md pointer-plus-delta) [VERIFY-dense]
│   ├── codex/
│   │   ├── config-toml-template.md               P0  L2  SAT  codex        (root→cwd tree walk notes)
│   │   └── codex-parity-notes.md                 P0  L2  SAT  codex        (why skills = N/A; capabilities → AGENTS.md prose)
│   ├── command-code/
│   │   └── command-code-skills.md                P0  L2  SA   command-code (install notes only - Command Code loads the canonical skills unchanged)
│   ├── mcp-doc-server.md                         P1  L7  SAT  all MCP      (how to connect the doc server; why docs go over MCP and skills stay files)
│   ├── cursor/cursor-notes.md                    P0  L2  SAT  cursor       (install notes: ~/.cursor/skills-cursor global dir, verified 2026-09-02)
│   ├── openclaw/openclaw-notes.md                P0  L2  SAT  openclaw     (gateway above the matrix; Railway/local/Companion profiles)
│   ├── openclaw/gateway-security.md              P0  L2  SAT  openclaw     (node policy, pairing, skill provenance; owns GR-20)
│   ├── zed/zed-notes.md                          P0  L2  SAT  zed          (skills, AGENTS.md, context_servers, finest permission dialect)
│   ├── design-surfaces.md                        P0  L2  SAT  stitch,claude-design (bridge role; parity N/A reasons)
│   └── generic-adapter.md                        P0  L2  SAT  any          (porting guide for unlisted agentic IDEs)
│
├── mcp/                                              L3 - MCP inventory & permission scoping
│   ├── registry-template.md                      P0  L3  SAT  all          (canonical registry format)
│   ├── registry-example-harborline.md            P0  L3  SAT  all          (SSOT: least-privilege matrix; owns GR-3)
│   ├── permission-translations.md                P0  L3  SAT  all          (matrix → each tool's syntax) [VERIFY-dense]
│   └── secrets-handling.md                       P0  L3  SAT  all          (env-var patterns; owns GR-8)
│
├── verifiers/                                        L6 - Eval loop & verifiers
│   ├── eval-loop.md                              P0  L6  SAT  all          (5-step procedure; owns GR-9)
│   ├── RUBRIC-ui-design.md                       P0  L6  SAT  all          (B2: 4 dims x 3 levels, scored sample at every level)
│   ├── description-tuning.md                     P0  L6  SA   all          (under-triggering; pushy descriptions; owns GR-6)
│   ├── trigger-tests/skill-writer.tests.md       P0  L6  SA   all          (10-30 cases, pass/fail rules)
│   ├── trigger-tests/orchestrator.tests.md       P0  L6  SA   all
│   ├── trigger-tests/security-reviewer.tests.md  P0  L6  SAT  all
│   ├── trigger-tests/mcp-permission-audit.tests.md P0 L6  SAT all
│   ├── trigger-tests/ui-ux-designer.tests.md    P0  L6  SA   all          (B2; GR-14 canary case 15)
│   ├── trigger-tests/design-system.tests.md     P0  L6  SA   all          (B2; laundering canary case 14)
│   ├── trigger-tests/harness-audit.tests.md     P0  L6  SA   all          (B2; laundering canary case 14)
│   ├── lint/README.md                            P0  L6  SAT  all          (what each linter enforces; owns GR-5)
│   ├── lint/ssot_linter.py                       P0  L6  SAT  all          (runnable: One Hard Rule)
│   ├── lint/staleness_linter.py                  P0  L6  SAT  all          (runnable: [VERIFY] date cadence + same-commit rule)
│   ├── lint/parity_linter.py                     P0  L6  SAT  all          (runnable: L2 × tool matrix, N/A honored)
│   ├── lint/permission_audit.py                  P0  L6  SAT  all          (runnable: config vs registry matrix)
│   ├── lint/toolkit_linter.py                    P0  L6  SAT  all          (lints the PRODUCT: extracts to temp, resolves every installed reference; owns GR-21)
│   ├── lint/a11y_linter.py                       P0  L6  SAT  all          (B2 runnable: contract-side a11y checks)
│   ├── lint/run_fixtures.sh                      P0  L6  SAT  all          (golden runner: asserts each linter exits 1 on its fixture)
│   ├── lint/run_fixtures.ps1                     P0  L6  SAT  all          (Windows twin of run_fixtures.sh)
│   ├── lint/parity.matrix.json                   P0  L6  SAT  all          (machine-readable parity matrix; parity_linter input)
│   ├── lint/ssot.rules.json                      P0  L6  SAT  all          (reviewed ruleset v1.0: harborline-commands fact class; distribution-checked patterns, exempt lists)
│   ├── lint/staleness.rules.json                 P0  L6  SAT  all          (reviewed ruleset v1.1: 120d cadence, marker/verify exempt lists per audit FPs)
│   └── lint/fixtures/                            P0  L6  SAT  all          (13 planted-violation goldens incl. exemption + a11y negative tests: ssot/ staleness/ parity/ permission/ a11y/)
│
├── orchestration/                                    L4 - Orchestration patterns
│   ├── plan-build-separation.md                  P1  L4  SA   all          (worked walkthrough on harborline)
│   ├── specialized-subagents.md                  P1  L4  SAT  all          (narrow allowlists; full traces)
│   ├── swarm-parallelism.md                      P1  L4  AT   all          (file-ownership isolation; owns GR-4)
│   ├── context-reset-discipline.md               P1  L4  SA   all          (reset vs accumulate; owns GR-11)
│   ├── guardrails-template.md                    P1  L4  SAT  all          (entry format spec)
│   └── guardrails-example-harborline.md          P1  L4  SAT  all          (SSOT: all 12 compact entries; owns GR-1, GR-12)
│
├── design/                                           L5 - Design-to-code bridge
│   ├── design-md-template.md                     P1  L5  SAT  stitch+coding tools
│   ├── design-md-example-harborline.md           P1  L5  SAT  all          (SSOT: harborline tokens)
│   ├── design-review-workflow.md                 P1  L5  SAT  all          (B2: 4-station pipeline, browser-in-the-loop; owns GR-14; hosts both real Stitch/Claude-Design parity cells)
│   └── design-to-code-flow.md                    P1  L5  SAT  all          (surface → tokens → agents; owns GR-7)
│
├── personal-layer/                                   L7 - Personal global layer
│   ├── tree.md                                   P1  L7  SA   all          (~/agent-toolkit spec, buildable)
│   ├── setup.sh                                  P1  L7  SA   all          (ONE script: scaffold+extract+link+update+uninstall; --dry-run/--check)
│   ├── setup.ps1                                 P1  L7  SA   all          (Windows twin of setup.sh)
│   ├── shared-guardrails-personal.md             P1  L7  SA   all          (personal log template, references format SSOT)
│   ├── shared-mcp-registry-personal.md           P1  L7  SA   all          (references registry format SSOT)
│   └── shared-design-personal.md                 P1  L7  SA   all          (fallback tokens, references DESIGN format SSOT)
│
├── team-layer/                                       L8 - Team project layer
│   ├── tree.md                                   P1  L8  T    all          (harborline committed tree, buildable)
│   ├── mcp-json-pattern.md                       P1  L8  T    claude-code+ (env-var secrets pattern)
│   └── new-teammate-checklist.md                 P1  L8  T    all          (zero-setup verification)
│
└── distillation/                                     L10 - Distillation & knowledge
    ├── task-briefs.jsonl                         P2  L10 SA   all          (15-25 exemplar-grade: vague ask → proper brief)
    ├── skill-descriptions.pairs.jsonl            P2  L10 SA   all          (15-25 exemplar-grade: bad → tuned, preference pairs)
    ├── permission-configs.pairs.jsonl            P2  L10 SAT  all          (15-25 exemplar-grade: unsafe → least-privilege pairs)
    ├── design-tasks.jsonl                        P2  L10 SA   all          (B2: 16 exemplar-grade design briefs)
    ├── glossary.md                               P2  L10 SAT  all          (ontology across the tool matrix)
    └── curriculum.md                             P2  L10 S    all          (beginner → disciplined swarm on harborline)
```

**Total: 113 tree entries + 2 auxiliary artifacts = 115 files on disk.**
(fix-batch A-F: -12 collapsed ports, +6 canonical skills, +1 cursor notes, +2 parity fixtures; the rest unchanged. In-tree
runnables, rules files and goldens; auxiliaries = SESSION-HANDOFF.md,
AUDIT-REPORT.md. Verified by reconciliation on the extracted zip.)

## Generation order (strict P0 → P1 → P2; Claude Code proven first within L2)

| Session | Files | Contents |
|---------|-------|----------|
| S1 (this) | 2  | Anchors + manifest ✅ |
| S2 | 4  | L1 foundation (template → root fill → nested fill → counterexample) |
| S3 | 5  | L2 Claude Code (prove the pattern here first) |
| S4 | 5  | L2 OpenCode (port, translate syntax only) |
| S5 | 5  | L2 Antigravity (port) |
| S6 | 5  | L2 Codex + Command Code + design-surfaces + generic-adapter |
| S7 | 4  | L3 MCP (template → harborline fill → translations → secrets) |
| S8 | 6  | L6 verifiers part 1 (eval-loop, description-tuning, 4 trigger-test suites) |
| S9 | 5  | L6 verifiers part 2 (lint README + 4 runnable linters) |
| S10 | 6 | L4 orchestration (guardrails format+fill first, then 4 playbooks) |
| S11 | 8 | L5 design (3) + L7 personal layer (5) |
| S12 | 8 | L8 team layer (3) + L10 distillation (5) |
| S13 | 4 | Phase 3 root docs: BOOTSTRAP → ONBOARDING → MANIFEST (finalize) → README |

Every session ends with a verified zip + `SESSION-HANDOFF.md` (environment
resets between sessions; the zip is the carry-forward). Each response emits
1-3 complete files with the standard footer.

---

## Pre-approval audit

### 1. GR-ID accounting (demand vs supply)

Supply: 12 GR-IDs defined in `REFERENCE-ANCHORS.md`. Demand - every worked
narrative any planned file promises, mapped:

| Narrative owner file | Owns |
|---|---|
| foundation/agents-md-template.md | GR-2 |
| foundation/agents-md-counterexample-bloated.md | GR-10 |
| mcp/registry-example-harborline.md | GR-3 |
| mcp/secrets-handling.md | GR-8 |
| verifiers/eval-loop.md | GR-9 |
| verifiers/description-tuning.md | GR-6 |
| verifiers/lint/README.md | GR-5 |
| orchestration/swarm-parallelism.md | GR-4 |
| orchestration/context-reset-discipline.md | GR-11 |
| orchestration/guardrails-example-harborline.md | GR-1, GR-12 (+ SSOT for all 12 compact entries) |
| design/design-to-code-flow.md | GR-7 |

Reconciliation: 12 owned, 12 supplied, **zero unallocated worked-incident
promises**. All other files (every L2 skill, L7/L8 tree, checklists,
JSONL) reference GR-IDs only - their failure-mode sections cite IDs from
this table and never narrate. Any file discovered mid-generation to need a
fresh incident triggers minting GR-13+ in anchors before that file is
emitted.

### 2. Parity matrix (v2 - coverage semantics, fix-batch D)

Cells are no longer one-file-per-tool. Each tool declares a MODE; the
canonical file is the deliverable.

| Tool | Mode | Resolves to | Notes |
|---|---|---|---|
| Claude Code | canonical | `skills/<name>/SKILL.md` | installs at `~/.claude/skills/` |
| Codex | canonical | same | `~/.codex/skills/` - skills confirmed 2026-07 (was wrongly N/A; GR-18) |
| Command Code | canonical | same | `~/.commandcode/skills/`; also `settings.json` skills array |
| Antigravity | canonical | same | `~/.gemini/config/` global, `.agents/skills/` workspace |
| Cursor | canonical | same | `~/.cursor/skills-cursor/` global (verified 2026-09-02); `.cursor/rules/*.mdc` per-project fallback |
| Zed | canonical | same | `~/.agents/skills/` flat layout; strongest MCP permission dialect |
| OpenClaw | canonical | same | gateway layer ABOVE the matrix; remote profile installs by git URL |
| OpenCode | **port** | `tools/opencode/agent/<name>.md` | the one genuine port: different container + `permission:` block |
| Design surfaces | **N/A** | `tools/design-surfaces.md` | contract producers, not skill hosts |

Machine-readable: `verifiers/lint/parity.matrix.json`. The linter now
checks coverage AND flags duplication (previously it required it - GR-19).

### 3. SSOT ownership table

| Fact class | Single owning file | Reference-only touchers |
|---|---|---|
| Harborline commands, pinned versions, ask-first, never-do | foundation/agents-md-example-harborline-root.md | anchors (fixture def), claude-md-template, all L2 configs, L8 tree, curriculum |
| GR-ID one-line definitions + ownership map | REFERENCE-ANCHORS.md | every file with a failure-modes section |
| GR compact constraint entries (all 12) | orchestration/guardrails-example-harborline.md | guardrails-template (format only), personal/team guardrails templates |
| MCP least-privilege matrix (harborline) | mcp/registry-example-harborline.md | permission-translations, permission_audit.py, L7/L8 registries, all mcp-permission-audit skills |
| Per-tool permission syntax translations | mcp/permission-translations.md | L2 tool configs (link, never restate) |
| Design tokens (harborline) | design/design-md-example-harborline.md | design-to-code-flow, apps/web examples, shared-design-personal |
| Vault frontmatter schema | MANIFEST.md (this file, §below) | every vault file (instantiates, never redefines) |
| Eval loop procedure (5 steps) | verifiers/eval-loop.md | all trigger-test suites, curriculum, BOOTSTRAP |
| GUARDRAILS entry format | orchestration/guardrails-template.md | both filled guardrails files |
| Registry format spec | mcp/registry-template.md | both filled registries |
| Skill workflows (all 6) | `skills/<name>/SKILL.md` (canonical) | OpenCode ports (container only), all install-notes files, suites, curriculum |
| Tool install paths | personal-layer/tree.md (nine-tool status table) | cli/bin/uvctv.js, setup.{sh,ps1}, install guides |
| Accessibility rules (format / harborline values) | design-md-template.md / design-md-example-harborline.md | review workflow, a11y_linter, both skills, rubric |
| Component conventions (closed set + variants) | design/design-md-example-harborline.md | design-system skills (enforce), anchors (names only), suites |

**Frontmatter schema (SSOT, defined once here):** every markdown vault
file carries YAML frontmatter with exactly: `title, layer, priority,
version, date, source_model, depends_on, usage, audience, tools`.
Scripts (.py/.sh/.ps1) carry the same fields as a documented comment block
("Vault frontmatter:"). **Documented exemption (audit 2026-07-24):**
data files (.jsonl, .json) cannot carry frontmatter without breaking
their parsers; their provenance fields live in this manifest's tree row
and the audit report instead. **Second documented exemption (audit
2026-07-25):** linter fixture goldens under verifiers/lint/fixtures/
carry no frontmatter and are deliberately minimal/truncated - they are
planted test DATA whose exact content IS the assertion; adding
frontmatter would change what the linters parse. Provenance: this
manifest's fixtures/ tree row plus run_fixtures.{sh,ps1}.

---

## Audit outcome (2026-07-24, hostile self-audit per the audit protocol)

Grading instrument: the vault's ten-box gate, now embedded in
BOOTSTRAP.md §"The authoring gate". Bar: any failed box queues the file.

| File | Boxes before → after | Repaired (v1.1) |
|---|---|---|
| tools/command-code/command-code-skills.md | 7/10 → 10/10 | §§2-4 honest verbatim; four full-trace golds |
| BOOTSTRAP.md | 9/10 → 10/10 | ten-box gate embedded inline |
| skills/skill-writer/SKILL.md | 9/10 → 10/10 | gold → full options/rejection trace |
| tools/opencode/agent/skill-writer.md | 9/10 → 10/10 | same, + permission-block options |
| skills/skill-writer/SKILL.md | 9/10 → 10/10 | same, + swarm-visibility reasoning |
| REFERENCE-ANCHORS.md | 9/10 → 10/10 | SSOT exemption explicit + exempt-rule named |

All other files: 10/10 applicable boxes at first grading (evidence in
AUDIT-REPORT.md). Genre exemptions: MANIFEST/README N/A on C4/C8
(index/meta genre - this file IS the parity table); data files exempt
from frontmatter per the documented schema exemption above.

## Auxiliary assets (non-tree artifacts; regenerated or session-scoped)

Everything runnable now lives in the canonical tree above (each `.sh` beside
its `.ps1` twin, plus `lint/fixtures/` and `lint/parity.matrix.json`). This
table lists only artifacts that are NOT part of the numbered tree because they
are session-scoped or regenerated:

| Path | Class | Why it exists |
|---|---|---|
| SESSION-HANDOFF.md | session artifact | mandated by the session protocol ("never leave a session without one"); regenerated per session |
| INSTALL-Windows.md | setup guide | beginner install walkthrough, Windows; rewritten 2026-08-03 against verified script output |
| INSTALL-Mac-Linux.md | setup guide | beginner install walkthrough, macOS/Linux; rewritten 2026-08-03 |
| AUDIT-REPORT.md | audit artifact | baseline, findings, fixes, disproven flags with evidence, residual risks |

**Cross-platform note:** every shell script ships as a `.sh`/`.ps1` pair
(`personal-layer/install.{sh,ps1}`, `verifiers/lint/run_fixtures.{sh,ps1}`);
the four linters are Python and run unchanged on any OS. The vault requires
no bash on Windows.
