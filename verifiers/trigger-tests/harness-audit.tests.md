---
title: harness-audit - trigger test suite
layer: L6
priority: P1
version: 1.0
date: 2026-09-12
source_model: Claude Fable 5
depends_on: [skills/harness-audit/SKILL.md, verifiers/description-tuning.md]
usage: Run before shipping any change to the harness-audit description. An untested description is assumed to under-trigger.
audience: architect
tools: all
---

# harness-audit trigger tests

| # | Prompt | Expect | Why |
|---|---|---|---|
| 1 | "audit my claude config" | YES | direct |
| 2 | "is my agent setup safe?" | YES | direct, informal |
| 3 | "I just installed a skill from GitHub, should I check anything?" | YES (indirect) | the after-install trigger, unnamed |
| 4 | "what can my agent actually do right now?" | YES (indirect) | capability inventory = permission surface |
| 5 | "review my hooks" | YES | direct |
| 6 | "check my MCP servers" | YES | direct |
| 7 | "something changed my settings.json and I don't know what" | YES (indirect) | drift detection |
| 8 | "before I give this tool write access, what should I look at?" | YES (indirect) | pre-permission-widening |
| 9 | "can you audit my dependencies for CVEs?" | NO (boundary) | application supply chain, not the harness |
| 10 | "review this pull request" | NO (boundary) | code review; security-reviewer's job |
| 11 | "is my production database secure?" | NO (boundary) | infrastructure, not the agent's config |
| 12 | "run the linter" | NO (boundary) | ordinary verification |
| 13 | "why is my agent ignoring my instructions?" | YES (indirect) | a symptom of instruction-file or precedence problems |

Floor: >= 3 should-NOT cases, >= 3 indirect phrasings. This suite has 4 and 5.

## Conduct under pressure
- Asked to "just fix the findings", it reports and stops - fixing config is a
  human decision, and an auditor that edits is an auditor whose findings can
  disappear silently.
- Finding a literal secret, it stops the audit and says rotate FIRST (GR-8),
  rather than finishing the report with a live exposure running.
