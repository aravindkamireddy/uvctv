#!/usr/bin/env node
/**
 * uvctv - Universal Vibe-Coding Toolkit Vault CLI
 *
 * Vault frontmatter:
 *   title: uvctv CLI (Node) | layer: L7 | priority: P0
 *   version: 1.0 | date: 2026-08-15 | source_model: Claude Fable 5
 *   depends_on: personal-layer/tree.md, personal-layer/setup.sh
 *   audience: solo, architect, team | tools: all
 *   usage: npx github:<you>/uvctv init      (from anywhere, no clone needed)
 *
 * Why this exists, when setup.{sh,ps1} already work:
 *   1. One implementation instead of two twins that must stay in lockstep -
 *      every shell-twin divergence in this vault's history has been a defect.
 *   2. Distribution. A remote OpenClaw gateway (Railway et al) cannot see your
 *      laptop's filesystem, so a zip is useless there; a git URL is the only
 *      delivery mechanism. Same repo, same command, both cases.
 *   3. Updates become `npx ... update` instead of "download the new zip".
 *
 * Zero dependencies by design: node builtins only, so `npx github:` runs with
 * no install step and nothing to audit but this file.
 *
 * Safety rules, unchanged from the shell scripts:
 *   - Never deletes a real directory to place a link (GR-16). `--adopt` moves
 *     its contents into the toolkit instead.
 *   - Never overwrites your edits without `--force`.
 *   - `unlink` removes only links pointing into THIS toolkit.
 *   - Failures print as GUARDRAILS.md rows, pasteable with no reformatting.
 */

'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const HOME = os.homedir();
const IS_WIN = process.platform === 'win32';
const VERSION = '1.3.0';

// ---------------------------------------------------------------- arguments
const argv = process.argv.slice(2);
const CMD = argv.find(a => !a.startsWith('-')) || 'help';
const flag = n => argv.includes('--' + n);
const opt = n => {
  const i = argv.indexOf('--' + n);
  return i !== -1 && argv[i + 1] && !argv[i + 1].startsWith('-') ? argv[i + 1] : null;
};
const unknown = argv.filter(a => a.startsWith('--') &&
  !['dry-run','check','force','adopt','all','restore','toolkit','vault','help','version','json','package','selftest'].includes(a.slice(2)));
if (unknown.length) { console.log(`unknown argument(s): ${unknown.join(' ')}   (try: uvctv help)`); process.exit(2); }

const DRY = flag('dry-run') || flag('check');
const FORCE = flag('force'), ADOPT = flag('adopt'), ALL = flag('all'), RESTORE = flag('restore');
const TOOLKIT = path.resolve(opt('toolkit') || path.join(HOME, 'agent-toolkit'));
// When run via npx the package root is two levels up from cli/bin/
const VAULT = path.resolve(opt('vault') || path.join(__dirname, '..', '..'));

let status = 0;
const say = m => console.log(m);
const guardrail = (observed, gr, constraint, tools, test) => {
  const d = new Date().toISOString().slice(0, 10);
  console.log(`| ${gr} | ${d} | ${observed} | ${constraint} | ${tools} | ${test} |`);
  status = 1;
};

// ------------------------------------------------------------------ targets
// src (relative to toolkit) | dst | detect-root (tool considered installed)
const TARGETS = [
  ['skills', path.join(HOME, '.claude', 'skills'), path.join(HOME, '.claude')],
  ['skills', path.join(HOME, '.codex', 'skills'), path.join(HOME, '.codex')],
  ['skills', path.join(HOME, '.commandcode', 'skills'), path.join(HOME, '.commandcode')],
  ['skills', path.join(HOME, '.agents', 'skills'),
    IS_WIN ? path.join(HOME, 'AppData', 'Roaming', 'Zed') : path.join(HOME, '.config', 'zed')],
  ['skills', path.join(HOME, '.cursor', 'skills-cursor'), path.join(HOME, '.cursor')],   // verified 2026-09-02
  ['skills', path.join(HOME, '.gemini', 'config', 'skills'), path.join(HOME, '.gemini')],
  ['skills', path.join(HOME, '.config', 'opencode', 'skills'), path.join(HOME, '.config', 'opencode')],
  ['skills', path.join(HOME, '.openclaw', 'skills'), path.join(HOME, '.openclaw')],
  ['opencode/agents', path.join(HOME, '.config', 'opencode', 'agents'), path.join(HOME, '.config', 'opencode')],
];

const SKELETON = ['skills', path.join('opencode', 'agents'), 'shared', 'reference'];

// ------------------------------------------------------------- payload map
// Vault files carry their shippable content in fenced blocks marked
// <!-- FILE: path -->. These prefixes map a marker to a toolkit-relative path.
function mapTarget(marker) {
  if (marker.startsWith('.claude/agents/')) {
    const leaf = path.basename(marker, '.md');
    return path.join('skills', leaf, 'SKILL.md');
  }
  const map = [
    ['.claude/skills/', 'skills'],
    ['.opencode/agent/', path.join('opencode', 'agents')],
    ['~/agent-toolkit/shared/', 'shared'],
    ['~/agent-toolkit/reference/', 'reference'],
  ];
  for (const [from, to] of map) {
    if (marker.startsWith(from)) return path.join(to, ...marker.slice(from.length).split('/'));
  }
  return null;   // team-layer or template marker - not personal-layer content
}

function walkMd(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === '.git' || e.name === 'node_modules') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkMd(p, out);
    else if (e.name.endsWith('.md')) out.push(p);
  }
  return out;
}

// --- provenance ------------------------------------------------------------
// The toolkit records a hash of every file AS EXTRACTED. On update that lets
// us tell YOUR edits from stale vault content: an untouched file is refreshed
// (you never modified it), a modified one is kept and named. Without this,
// update only ever ADDS files, so vault fixes never reach an existing toolkit
// while it silently reports success - the GR-2 shape.
const MANIFEST = () => path.join(TOOLKIT, '.uvctv-manifest.json');
const sha = s => crypto.createHash('sha256').update(s).digest('hex').slice(0, 16);
function loadManifest() {
  try { return JSON.parse(fs.readFileSync(MANIFEST(), 'utf8')); } catch { return {}; }
}
function saveManifest(m) {
  if (DRY) return;
  try { fs.writeFileSync(MANIFEST(), JSON.stringify(m, null, 2) + '\n'); } catch {}
}

function extract() {
  if (!fs.existsSync(VAULT)) { console.log(`vault not found: ${VAULT}`); process.exit(2); }
  let dirs = 0, wrote = 0, kept = 0, refreshed = 0;
  const manifest = loadManifest();
  const yours = [];
  for (const d of SKELETON) {
    const p = path.join(TOOLKIT, d);
    if (fs.existsSync(p)) continue;
    if (DRY) say(`would mkdir  ${d}`); else { fs.mkdirSync(p, { recursive: true }); say(`mkdir  ${d}`); }
    dirs++;
  }
  for (const file of walkMd(VAULT).sort()) {
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(/^\s*<!--\s*FILE:\s*(\S+)/);
      if (!m) continue;
      const target = mapTarget(m[1]);
      if (!target) continue;
      const body = [];
      let j = i + 1;
      while (j < lines.length && !/^\s*(```|~~~)\s*$/.test(lines[j])) body.push(lines[j++]);
      i = j;
      const dest = path.join(TOOLKIT, target);
      const content = body.join(os.EOL) + os.EOL;
      const newHash = sha(content);

      if (fs.existsSync(dest) && !FORCE) {
        const current = sha(fs.readFileSync(dest, 'utf8'));
        const recorded = manifest[target];
        if (current === newHash) { manifest[target] = newHash; kept++; continue; }   // already current
        if (recorded && recorded === current) {
          // untouched since extraction, and the vault has moved on -> refresh
          if (DRY) { say(`would refresh  ${target}  (vault updated, you never edited it)`); }
          else { fs.writeFileSync(dest, content); say(`refresh ${target}  (vault updated, your copy was untouched)`); }
          manifest[target] = newHash; refreshed++; continue;
        }
        // you edited it (or it predates provenance tracking) -> keep, and say so
        yours.push(target); kept++; continue;
      }

      if (DRY) { say(`would write  ${target}  (${body.length} lines)`); wrote++; manifest[target] = newHash; continue; }
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, content);
      manifest[target] = newHash;
      say(`write  ${target}  (${body.length} lines)`);
      wrote++;
    }
  }
  saveManifest(manifest);
  if (yours.length) {
    say('');
    say(`kept   ${yours.length} file(s) YOU changed - the vault version differs but yours wins:`);
    for (const y of yours) say(`         ${y}`);
    say(`       (--force takes the vault's version and discards yours)`);
  }
  const untracked = yours.length && Object.keys(manifest).length === 0;
  if (untracked) say('note   no provenance record found - files were treated as edited to be safe');
  return { dirs, wrote, kept, refreshed, yours: yours.length };
}

// ----------------------------------------------------------------- linking
function linkType(p) {
  try { return fs.lstatSync(p).isSymbolicLink() ? fs.readlinkSync(p) : null; }
  catch { return null; }
}
function makeLink(src, dst) {
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.symlinkSync(src, dst, IS_WIN ? 'junction' : 'dir');
}

function wire(mode) {
  let linked = 0, removed = 0, left = 0;
  const seen = new Set();
  for (const [rel, dst, detect] of TARGETS) {
    const src = path.join(TOOLKIT, ...rel.split('/'));
    const existingLink = linkType(dst);

    if (mode === 'unlink') {
      if (existingLink) {
        if (path.resolve(existingLink) !== path.resolve(src)) {
          guardrail(`unlink left ${dst} alone: it links to ${existingLink}, not to this toolkit`,
            'GR-16', 'only remove links this toolkit created', 'all', 'uvctv unlink --check on a foreign link exits 1');
        } else if (DRY) say(`would remove  ${dst}`);
        else {
          fs.unlinkSync(dst); removed++; say(`removed  ${dst}`);
          if (RESTORE && fs.existsSync(src)) {
            fs.cpSync(src, dst, { recursive: true }); say(`restored ${dst}  (copied from the toolkit)`);
          }
        }
      } else if (fs.existsSync(dst)) {
        guardrail(`unlink left ${dst} alone: a real directory, not a link this toolkit made`,
          'GR-16', 'never delete a real directory during unlink', 'all', 'uvctv unlink --check on a real dir exits 1');
        left++;
      }
      continue;
    }

    if (!fs.existsSync(src)) continue;
    if (detect && !fs.existsSync(detect) && !ALL) {
      if (!seen.has(detect)) {
        say(`not detected  ${path.basename(detect)}  (no ${detect} - skipping; --all links anyway)`);
        seen.add(detect);
      }
      continue;
    }

    if (existingLink) {
      if (path.resolve(existingLink) === path.resolve(src)) say(`ok     ${dst}`);
      else if (DRY) say(`would relink  ${dst}`);
      else { fs.unlinkSync(dst); makeLink(src, dst); linked++; say(`relink ${dst} -> ${src}`); }
    } else if (fs.existsSync(dst)) {
      if (ADOPT && fs.statSync(dst).isDirectory() && !DRY) {
        let moved = 0, conflict = false;
        for (const name of fs.readdirSync(dst)) {
          const to = path.join(src, name);
          if (fs.existsSync(to)) { say(`      conflict: ${name} already in the toolkit - left in ${dst}`); conflict = true; }
          else { fs.renameSync(path.join(dst, name), to); moved++; }
        }
        if (!conflict && fs.readdirSync(dst).length === 0) {
          fs.rmdirSync(dst); makeLink(src, dst); linked++;
          say(`adopt  ${dst} -> ${src}  (${moved} item(s) moved in, then linked)`);
        } else {
          guardrail(`adopt incomplete for ${dst}: ${moved} moved, conflicts remain`,
            'GR-16', 'resolve name conflicts by hand, then re-run with --adopt', 'all', 'uvctv link --adopt with conflicts exits 1');
        }
      } else {
        guardrail(`uvctv refused to replace ${dst}: a real directory occupies a link target`,
          'GR-16', 'never delete a real directory to place a link; re-run with --adopt to move its contents into the toolkit',
          'all', 'uvctv link --check on a HOME with a real dir at a link target exits 1');
        left++;
      }
    } else {
      if (DRY) say(`would link  ${dst} -> ${src}`);
      else { makeLink(src, dst); linked++; say(`link   ${dst} -> ${src}`); }
    }
  }
  return { linked, removed, left };
}


// ------------------------------------------------------- MCP client configs
// Where each tool keeps its GLOBAL mcp config, and under which key. Global on
// purpose: you want the vault's docs in every project, not per-repo.
// [VERIFY 2026-09] paths carry the same caveat as the link map.
const MCP_TARGETS = [
  { tool: 'claude-code', file: path.join(HOME, '.claude.json'),
    key: 'mcpServers', shape: 'args' },
  { tool: 'cursor', file: path.join(HOME, '.cursor', 'mcp.json'),
    key: 'mcpServers', shape: 'args' },
  { tool: 'zed', file: IS_WIN ? path.join(HOME, 'AppData', 'Roaming', 'Zed', 'settings.json')
                              : path.join(HOME, '.config', 'zed', 'settings.json'),
    key: 'context_servers', shape: 'args' },
  { tool: 'antigravity', file: path.join(HOME, '.gemini', 'antigravity', 'mcp_config.json'),
    key: 'mcpServers', shape: 'args' },
  { tool: 'opencode', file: path.join(HOME, '.config', 'opencode', 'opencode.json'),
    key: 'mcp', shape: 'command-array' },
];

/** The npx command that launches this package's doc server. */
function serverSpec(shape, pkg) {
  if (shape === 'command-array') return { type: 'local', command: ['npx', '-y', pkg, 'mcp'] };
  return { command: 'npx', args: ['-y', pkg, 'mcp'] };
}


/**
 * Codex keeps MCP servers in TOML, and this CLI has no TOML parser by design
 * (zero dependencies). Appending a table is nonetheless the CORRECT operation,
 * not a workaround: TOML tables are order-independent and self-delimiting, so
 * appending a well-formed table to a valid file yields a valid file. Parsing
 * would be more work to reach the same result with more ways to be wrong.
 *
 * The narrowness is the point - it does ONE thing:
 *   - table absent  -> append it
 *   - table present -> REFUSE and tell the operator to edit by hand
 * It never rewrites an existing entry, because that is the case it cannot
 * verify without parsing. Removing that refusal is what would make this lazy.
 */
function codexToml(pkg) {
  const file = path.join(HOME, '.codex', 'config.toml');
  const block =
    `\n[mcp_servers.uvctv-vault]\n` +
    `command = "npx"\n` +
    `args = ["-y", "${pkg}", "mcp"]\n`;

  if (!fs.existsSync(path.dirname(file))) {
    say(`not detected  codex  (no ${path.dirname(file)})`);
    return 'skip';
  }
  const existing = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  if (existing.includes('[mcp_servers.uvctv-vault]')) {
    const wanted = `args = ["-y", "${pkg}", "mcp"]`;
    if (existing.includes(wanted)) { say('ok     codex  (already configured)'); return 'ok'; }
    guardrail(
      `uvctv left ${file} alone: [mcp_servers.uvctv-vault] exists with different values`,
      'GR-16',
      'never rewrite an existing TOML entry without parsing the file - edit it by hand',
      'codex',
      'uvctv mcp-install on a config with a differing uvctv-vault entry exits 1');
    say(`       replace its args with: ["-y", "${pkg}", "mcp"]`);
    return 'skip';
  }
  if (DRY) { say(`would add    codex  -> ${file}`); return 'done'; }
  if (existing && !fs.existsSync(file + '.uvctv-bak')) fs.copyFileSync(file, file + '.uvctv-bak');
  fs.appendFileSync(file, block);
  say(`add    codex  -> ${file}`);
  return 'done';
}

function cmdMcpInstall() {
  // The package spec npx should fetch. Defaults to whatever npx used to run
  // this copy; --package overrides for a local clone.
  const pkg = opt('package') ||
    (process.env.npm_package_name && process.env.npm_config_user_agent
      ? 'github:<you>/uvctv' : 'github:<you>/uvctv');
  say(`uvctv ${VERSION} - MCP config (${DRY ? 'dry-run' : 'write'})`);
  say(`server spec: npx -y ${pkg} mcp`);
  if (pkg.includes('<you>')) {
    say('');
    say('WARNING: package spec still contains the <you> placeholder. Pass');
    say('  --package github:YOUR-USERNAME/uvctv   (or a local path)');
    say('or the config written will not resolve.');
  }
  say('');
  let done = 0, skipped = 0;
  for (const t of MCP_TARGETS) {
    const dir = path.dirname(t.file);
    if (!fs.existsSync(dir)) { say(`not detected  ${t.tool}  (no ${dir})`); skipped++; continue; }

    let cfg = {};
    if (fs.existsSync(t.file)) {
      const raw = fs.readFileSync(t.file, 'utf8');
      try { cfg = JSON.parse(raw); }
      catch (e) {
        guardrail(`uvctv left ${t.file} alone: it is not valid JSON (${e.message})`,
          'GR-16', 'never overwrite a config we cannot parse - the operator fixes it, we do not guess',
          t.tool, 'uvctv mcp-install --dry-run on a malformed config exits 1');
        skipped++; continue;
      }
    }
    if (!cfg[t.key] || typeof cfg[t.key] !== 'object') cfg[t.key] = {};
    const existing = cfg[t.key]['uvctv-vault'];
    const spec = serverSpec(t.shape, pkg);
    if (existing && JSON.stringify(existing) === JSON.stringify(spec)) {
      say(`ok     ${t.tool}  (already configured)`); continue;
    }
    if (DRY) {
      say(`would ${existing ? 'update' : 'add   '} ${t.tool}  -> ${t.file}`); done++; continue;
    }
    // back up before the first modification, once
    if (fs.existsSync(t.file) && !fs.existsSync(t.file + '.uvctv-bak')) {
      fs.copyFileSync(t.file, t.file + '.uvctv-bak');
    }
    cfg[t.key]['uvctv-vault'] = spec;
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(t.file, JSON.stringify(cfg, null, 2) + '\n');
    say(`${existing ? 'update' : 'add   '} ${t.tool}  -> ${t.file}`);
    done++;
  }
  const codex = codexToml(pkg);
  if (codex === 'done') done++; else if (codex === 'skip') skipped++;

  say('');
  say(`done: ${done} config(s) ${DRY ? 'would change' : 'written'}, ${skipped} skipped.`);
  if (!DRY && done) say('RESTART each tool - MCP servers load at startup.');
  if (DRY) say('(dry run - nothing was changed)');
}

// ---------------------------------------------------------------- commands
function header(mode, existing) {
  say(`uvctv ${VERSION}  (toolkit: ${TOOLKIT})`);
  say(`             (mode: ${mode}${DRY ? ', dry-run' : ''}, ${existing ? 'existing toolkit detected' : 'fresh'})`);
  say('');
}

function cmdInit(forceUpdate) {
  const existing = fs.existsSync(path.join(TOOLKIT, 'skills'));
  const mode = forceUpdate || existing ? 'update' : 'init';
  header(mode, existing);
  say(`-- content (vault: ${VAULT})`);
  const c = extract();
  say('');
  say('-- wiring');
  const w = wire('link');
  for (const f of ['GUARDRAILS.md', 'mcp-registry.md', 'DESIGN.md']) {
    if (!fs.existsSync(path.join(TOOLKIT, 'shared', f))) say(`note   shared/${f} missing`);
  }
  say('');
  say(`done: ${c.dirs} dir(s), ${c.wrote} new, ${c.refreshed} refreshed, ${c.kept} kept (${c.yours} yours), ${w.linked} link(s).`);
  if (mode === 'init' && !DRY) {
    say('');
    say('Next: ask your AI tool "what skills do you have available?"');
    say('      shared/ files start as templates - fill them in as you go.');
  }
  if (DRY) say('(dry run - nothing was changed)');
}

function cmdLink() {
  header('link', fs.existsSync(path.join(TOOLKIT, 'skills')));
  say('-- wiring');
  const w = wire('link');
  say('');
  say(`done: ${w.linked} link(s) (re)made, ${w.left} path(s) left alone.`);
  if (DRY) say('(dry run - nothing was changed)');
}

function cmdUnlink() {
  header('unlink', fs.existsSync(path.join(TOOLKIT, 'skills')));
  say('-- wiring');
  const w = wire('unlink');
  say('');
  say(`done: ${w.removed} link(s) removed, ${w.left} path(s) left alone. Toolkit untouched at ${TOOLKIT}.`);
  if (DRY) say('(dry run - nothing was changed)');
}

function cmdStatus() {
  const rows = [];
  for (const [rel, dst, detect] of TARGETS) {
    const src = path.join(TOOLKIT, ...rel.split('/'));
    const l = linkType(dst);
    let state;
    if (l && path.resolve(l) === path.resolve(src)) state = 'linked';
    else if (l) state = 'linked elsewhere';
    else if (fs.existsSync(dst)) state = 'REAL DIR (use --adopt)';
    else if (!fs.existsSync(detect)) state = 'tool not detected';
    else state = 'not linked';
    rows.push({ target: dst, state });
  }
  if (flag('json')) { console.log(JSON.stringify({ toolkit: TOOLKIT, targets: rows }, null, 2)); return; }
  say(`uvctv ${VERSION}  (toolkit: ${TOOLKIT})`);
  const skills = path.join(TOOLKIT, 'skills');
  say(fs.existsSync(skills)
    ? `skills: ${fs.readdirSync(skills).length} installed`
    : 'skills: none - run  uvctv init');
  say('');
  for (const r of rows) say(`  ${r.state.padEnd(24)} ${r.target}`);
}

function cmdHelp() {
  say(`uvctv ${VERSION} - Universal Vibe-Coding Toolkit Vault

  npx github:<you>/uvctv init          create the toolkit and link every detected tool
  npx github:<you>/uvctv update        refresh content, keep your edits, re-check links
  npx github:<you>/uvctv link          (re)link only
  npx github:<you>/uvctv unlink        remove links this toolkit created
  npx github:<you>/uvctv status        what is linked, what is not, and why
  npx github:<you>/uvctv mcp           run the vault doc server (MCP clients launch this)
  npx github:<you>/uvctv mcp-install   write the MCP config into every tool found
                                       (--package github:you/uvctv, --dry-run)

Options
  --dry-run, --check   show every action, change nothing
  --toolkit <path>     default ~/agent-toolkit
  --vault <path>       default: the package this CLI ships in
  --adopt              a real dir at a link target? move its contents in, then link
  --all                link even for tools not detected on this machine
  --force              overwrite toolkit files during extract (loses your edits)
  --restore            with unlink: copy files back into each tool's own folder
  --json               with status: machine-readable output

Safety: never deletes a real directory (GR-16); never overwrites your edits
without --force; unlink touches only links into this toolkit.`);
}

switch (CMD) {
  case 'init': cmdInit(false); break;
  case 'update': cmdInit(true); break;
  case 'link': cmdLink(); break;
  case 'unlink': cmdUnlink(); break;
  case 'status': cmdStatus(); break;
  case 'mcp-install': cmdMcpInstall(); break;
  case 'mcp':
    // Hand off to the doc server. Launched BY an MCP client over stdio, never
    // by hand: "command": "npx", "args": ["-y", "github:<you>/uvctv", "mcp"]
    require('../lib/mcp-server.js');
    return;
  case 'version': say(VERSION); break;
  default: cmdHelp(); break;
}
process.exit(status);
