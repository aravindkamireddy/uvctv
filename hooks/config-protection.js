#!/usr/bin/env node
/**
 * config-protection.js - block edits to linter/formatter config files.
 *
 * Vault frontmatter:
 *   title: Config-protection hook | layer: L4 | priority: P1
 *   version: 1.0 | date: 2026-09-12 | source_model: Claude Fable 5
 *   depends_on: hooks/README.md, orchestration/guardrails-template.md
 *   audience: solo, architect, team | tools: any harness with PreToolUse hooks
 *   usage: wired as a PreToolUse hook on Write|Edit|MultiEdit. Exit 2 blocks.
 *
 * WHY (GR-22): an agent facing a failing lint check has two moves - fix the
 * code, or widen the rule. The second is faster, passes the check, and is
 * almost always wrong: the defect ships AND the weakened rule silently exempts
 * every later file. No amount of instruction reliably prevents it, because at
 * the moment of choosing, editing one line of config genuinely looks like the
 * smaller change. A hook removes the choice.
 *
 * DELIBERATELY NARROW:
 *   - Creating a config that does not exist yet is ALLOWED. Setting a project
 *     up is not the failure mode.
 *   - package.json / pyproject.toml are NOT blocked: they carry dependencies
 *     and metadata, so blocking them would stop legitimate work. Their lint
 *     sections are a known gap, accepted knowingly rather than papered over.
 *   - This blocks a TOOL CALL, not a human. You can always edit the file
 *     yourself; the point is that the agent must ask.
 *
 * Exit codes: 0 allow, 2 block (stderr is shown to the agent).
 */

'use strict';
const path = require('path');
const fs = require('fs');

// Exact filenames, matched case-insensitively on the basename only.
const PROTECTED = [
  // JS/TS
  '.eslintrc', '.eslintrc.js', '.eslintrc.cjs', '.eslintrc.mjs', '.eslintrc.json',
  '.eslintrc.yml', '.eslintrc.yaml', 'eslint.config.js', 'eslint.config.mjs',
  'eslint.config.cjs', 'eslint.config.ts',
  '.prettierrc', '.prettierrc.js', '.prettierrc.cjs', '.prettierrc.json',
  '.prettierrc.yml', '.prettierrc.yaml', 'prettier.config.js', 'prettier.config.mjs',
  'biome.json', 'biome.jsonc',
  'tsconfig.json', 'tsconfig.base.json',
  // Python
  'ruff.toml', '.ruff.toml', 'setup.cfg', '.flake8', 'mypy.ini', '.mypy.ini',
  // Go / Rust
  '.golangci.yml', '.golangci.yaml', 'clippy.toml',
  // CI quality gates
  '.pre-commit-config.yaml',
];

function readInput() {
  try { return JSON.parse(fs.readFileSync(0, 'utf8')); } catch { return {}; }
}

function targetPath(input) {
  const i = input.tool_input || input.toolInput || {};
  return i.file_path || i.path || i.filePath || '';
}

function main() {
  const input = readInput();
  const file = targetPath(input);
  if (!file) return 0;

  const base = path.basename(file).toLowerCase();
  if (!PROTECTED.includes(base)) return 0;

  // Creating a config that does not exist is fine - that is project setup.
  if (!fs.existsSync(file)) return 0;

  process.stderr.write(
    `BLOCKED: ${base} is a quality-gate config.\n\n` +
    `Editing it to make a check pass is the GR-22 failure: the defect ships and\n` +
    `the weakened rule exempts every later file too.\n\n` +
    `Do instead:\n` +
    `  1. Fix the code the check is complaining about.\n` +
    `  2. If the rule is genuinely wrong, say so and let the human change it -\n` +
    `     that is a project decision, not an implementation detail.\n` +
    `  3. If you are adding a NEW rule (stricter, not looser), say that\n` +
    `     explicitly and ask.\n`
  );
  return 2;
}

process.exit(main());
