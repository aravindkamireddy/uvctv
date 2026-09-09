#!/usr/bin/env node
/**
 * fact-gate.js - demand facts before an edit or a destructive command.
 *
 * Vault frontmatter:
 *   title: Fact-forcing gate hook | layer: L4 | priority: P1
 *   version: 1.0 | date: 2026-09-12 | source_model: Claude Fable 5
 *   depends_on: hooks/README.md, skills/orchestrator/SKILL.md
 *   audience: solo, architect, team | tools: any harness with PreToolUse hooks
 *   usage: wired as a PreToolUse hook on Write|Edit|MultiEdit|Bash. Exit 2 blocks.
 *
 * WHY (GR-23): "are you sure?" is not a control. A model asked to confirm will
 * confirm - self-evaluation reports the confidence it already had, which is the
 * thing in question. Asking for FACTS is different: listing the importers of a
 * file it is about to change forces the model to actually go and look, and
 * looking is what changes the plan. The investigation is the mechanism; the
 * gate is only what makes it happen.
 *
 * It fires ONCE per (session, target) so it is a speed bump, not a toll booth:
 * a second attempt on the same file passes. Re-blocking every edit would train
 * the operator to disable it, which is worse than not shipping it (GR-9's
 * shape: a control that costs more attention than it saves gets turned off).
 *
 * Exit codes: 0 allow, 2 block with the questions on stderr.
 */

'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

const STATE = path.join(os.tmpdir(), 'uvctv-fact-gate.json');
const TTL_MS = 30 * 60 * 1000;   // a session's worth; state is disposable

// Commands whose blast radius is not recoverable by re-running them.
const DESTRUCTIVE = [
  /\brm\s+-[a-z]*[rf]/, /\bgit\s+(reset\s+--hard|clean\s+-[a-z]*f|push\s+--force)/,
  /\bdrop\s+(table|database|schema)\b/i, /\btruncate\s+table\b/i, /\bdelete\s+from\b/i,
  /\bdb:migrate\b/, /\bprisma\s+migrate\s+(reset|deploy)/, /\bdd\s+if=/,
  /\bkubectl\s+delete\b/, /\bterraform\s+(destroy|apply)/, /\bshutdown\b/, /\bmkfs\b/,
];

function loadState() {
  try {
    const s = JSON.parse(fs.readFileSync(STATE, 'utf8'));
    if (Date.now() - (s.t || 0) > TTL_MS) return { t: Date.now(), seen: {} };
    return s;
  } catch { return { t: Date.now(), seen: {} }; }
}
function saveState(s) { try { fs.writeFileSync(STATE, JSON.stringify(s)); } catch {} }

function readInput() {
  try { return JSON.parse(fs.readFileSync(0, 'utf8')); } catch { return {}; }
}

function main() {
  const input = readInput();
  const tool = input.tool_name || input.toolName || '';
  const ti = input.tool_input || input.toolInput || {};
  const state = loadState();

  let key = null, message = null;

  if (/^(Write|Edit|MultiEdit)$/.test(tool)) {
    const file = ti.file_path || ti.path || '';
    if (!file) return 0;
    // Only gate source files - not docs, not the toolkit's own notes.
    if (!/\.(js|jsx|ts|tsx|py|go|rs|java|kt|rb|php|swift|c|cc|cpp|h|sql)$/i.test(file)) return 0;
    key = 'edit:' + crypto.createHash('sha1').update(file).digest('hex').slice(0, 12);
    message =
      `Before editing ${path.basename(file)}, state these as facts you have CHECKED,\n` +
      `not assumptions:\n\n` +
      `  1. Who imports or calls this? (grep it - name the files)\n` +
      `  2. What public API or exported behaviour does this change?\n` +
      `  3. What data shape does it read or write, and is that shape defined elsewhere?\n\n` +
      `Then make the edit. Answering "are you sure" was never the question -\n` +
      `looking is (GR-23). If any answer is "I don't know", find out first.\n`;
  } else if (/^(Bash|PowerShell)$/.test(tool)) {
    const cmd = ti.command || ti.script || '';
    if (!cmd || !DESTRUCTIVE.some(re => re.test(cmd))) return 0;
    key = 'cmd:' + crypto.createHash('sha1').update(cmd).digest('hex').slice(0, 12);
    message =
      `That command is not cleanly reversible. Before running it, state:\n\n` +
      `  1. Exactly what it will affect - which files, rows, or resources.\n` +
      `  2. Which environment this is, and how you verified that.\n` +
      `  3. The rollback: what restores the previous state if this is wrong?\n\n` +
      `If the answer to 3 is "nothing", it needs a human, not a confirmation.\n`;
  } else {
    return 0;
  }

  if (state.seen[key]) return 0;              // already gated this target
  state.seen[key] = 1; state.t = Date.now(); saveState(state);
  process.stderr.write(message);
  return 2;
}

process.exit(main());
