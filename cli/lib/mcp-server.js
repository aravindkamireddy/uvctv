#!/usr/bin/env node
/**
 * mcp-server.js - serves the vault's reference documents to any MCP client.
 *
 * Vault frontmatter:
 *   title: Vault MCP doc server | layer: L7 | priority: P1
 *   version: 1.0 | date: 2026-09-02 | source_model: Claude Fable 5
 *   depends_on: cli/bin/uvctv.js, mcp/registry-template.md
 *   audience: solo, architect, team | tools: all MCP clients
 *   usage: launched by an MCP client, not by hand:
 *     "command": "npx", "args": ["-y", "github:YOUR-USERNAME/uvctv", "mcp"]
 *
 * WHY this exists, and why it is NOT how skills are delivered:
 *   Skills fire because a tool SCANS a directory at startup and keeps every
 *   description in front of the model - ambient, no decision required. MCP is
 *   pull: the model must choose to fetch. Serving skills over MCP would trade
 *   the one mechanism that makes them trigger for one that does not.
 *   Reference documents are the opposite case: you want them on demand, never
 *   ambient, because loading 45 playbooks into every session is GR-9 exactly.
 *
 * SCOPE - read-only, deliberately:
 *   Exposes the vault's own documentation and nothing else. It cannot read
 *   your code, write files, or run commands. That keeps its registry row
 *   trivial to approve (see mcp/registry-template.md): purpose = vault docs,
 *   scope = READ-ONLY on files inside this package, credentials = none.
 *
 * PROTOCOL: JSON-RPC 2.0 over stdio, MCP methods initialize / resources.list /
 * resources.read / tools.list / tools.call. Zero dependencies - node builtins
 * only, so the audit surface is this file.
 */

'use strict';
const fs = require('fs');
const path = require('path');

const PKG = path.join(__dirname, '..', '..');   // package root = the vault
const PROTOCOL_VERSION = '2024-11-05';

// Directories worth serving. Skills and ports are deliberately absent: those
// are delivered as FILES so tools can scan them (see the header note).
const SERVE = ['orchestration', 'design', 'mcp', 'foundation', 'verifiers',
               'distillation', 'tools', 'team-layer', 'personal-layer'];
const SKIP_DIRS = new Set(['fixtures', 'trigger-tests', 'node_modules', '.git']);

function collect() {
  const out = [];
  const walk = (dir, rel) => {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (SKIP_DIRS.has(e.name)) continue;
      const abs = path.join(dir, e.name);
      const r = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) walk(abs, r);
      else if (e.name.endsWith('.md')) out.push({ abs, rel: r });
    }
  };
  for (const d of SERVE) walk(path.join(PKG, d), d);
  for (const f of ['README.md', 'BOOTSTRAP.md', 'ONBOARDING.md', 'MANIFEST.md',
                   'REFERENCE-ANCHORS.md', 'AUDIT-REPORT.md']) {
    const abs = path.join(PKG, f);
    if (fs.existsSync(abs)) out.push({ abs, rel: f });
  }
  return out;
}

const DOCS = collect();

/** First frontmatter description, else first heading, else the path. */
function describe(abs, rel) {
  let text = '';
  try { text = fs.readFileSync(abs, 'utf8').slice(0, 4000); } catch { return rel; }
  const fm = text.match(/^---\n([\s\S]*?)\n---/);
  if (fm) {
    const d = fm[1].match(/^usage:\s*(.+)$/m) || fm[1].match(/^title:\s*(.+)$/m);
    if (d) return d[1].trim().slice(0, 220);
  }
  const h = text.match(/^#\s+(.+)$/m);
  return h ? h[1].trim() : rel;
}

const RESOURCES = DOCS.map(d => ({
  uri: `vault://${d.rel}`,
  name: d.rel,
  description: describe(d.abs, d.rel),
  mimeType: 'text/markdown',
}));

// ------------------------------------------------------------------ tools
const TOOLS = [
  {
    name: 'search_vault',
    description:
      'Search the Universal Vibe-Coding Toolkit Vault for guidance on agent ' +
      'orchestration, instruction files, MCP permissions, design contracts, ' +
      'guardrails and verification. Use when you need the procedure behind a ' +
      'practice - e.g. "how do I split work across parallel agents", "when is ' +
      'planning mandatory", "what makes a skill description trigger", "GR-4". ' +
      'Returns matching passages with their document paths. Do NOT use for ' +
      'the user\'s own code or project files.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Keywords, a question, or a GR-ID like GR-11.' },
        limit: { type: 'number', description: 'Max documents to return (default 3).' },
      },
      required: ['query'],
    },
  },
  {
    name: 'read_vault_doc',
    description:
      'Read one vault document in full by its path (e.g. ' +
      '"orchestration/swarm-parallelism.md"). Use after search_vault has ' +
      'identified the right document. Prefer reading ONE - pulling several ' +
      'playbooks into one session is the context flood the vault warns about.',
    inputSchema: {
      type: 'object',
      properties: { path: { type: 'string', description: 'Vault-relative path.' } },
      required: ['path'],
    },
  },
];

function searchVault(query, limit = 3) {
  const terms = String(query).toLowerCase().split(/\s+/).filter(t => t.length > 2);
  if (!terms.length) return 'No searchable terms in the query.';
  const scored = [];
  for (const d of DOCS) {
    let text;
    try { text = fs.readFileSync(d.abs, 'utf8'); } catch { continue; }
    const low = text.toLowerCase();
    let score = 0;
    for (const t of terms) {
      const hits = low.split(t).length - 1;
      score += hits;
      if (d.rel.toLowerCase().includes(t)) score += 25;   // path match is strong signal
      if (low.slice(0, 600).includes(t)) score += 5;      // frontmatter/title match
    }
    if (score > 0) scored.push({ d, score, text });
  }
  if (!scored.length) return `No vault document matches "${query}".`;
  scored.sort((a, b) => b.score - a.score);
  const out = [];
  for (const { d, text } of scored.slice(0, Math.max(1, Math.min(limit, 5)))) {
    const lines = text.split('\n');
    const idx = lines.findIndex(l => terms.some(t => l.toLowerCase().includes(t)));
    const from = Math.max(0, idx - 3);
    out.push(`## ${d.rel}\n\n${lines.slice(from, from + 28).join('\n')}\n\n` +
             `(read_vault_doc path="${d.rel}" for the full document)`);
  }
  return out.join('\n\n---\n\n');
}

function readDoc(rel) {
  const safe = path.normalize(rel).replace(/^(\.\.[/\\])+/, '');
  const hit = DOCS.find(d => d.rel === safe);
  if (!hit) return `Not a served vault document: ${rel}\n\nUse search_vault to find one.`;
  return fs.readFileSync(hit.abs, 'utf8');
}

// ------------------------------------------------------------ JSON-RPC loop
function reply(id, result) { send({ jsonrpc: '2.0', id, result }); }
function fail(id, code, message) { send({ jsonrpc: '2.0', id, error: { code, message } }); }
function send(obj) { process.stdout.write(JSON.stringify(obj) + '\n'); }

function handle(msg) {
  const { id, method, params } = msg;
  switch (method) {
    case 'initialize':
      return reply(id, {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { resources: {}, tools: {} },
        serverInfo: { name: 'uvctv-vault', version: '1.0.0' },
      });
    case 'notifications/initialized':
      return;                                   // notification: no reply
    case 'resources/list':
      return reply(id, { resources: RESOURCES });
    case 'resources/read': {
      const uri = params && params.uri ? String(params.uri) : '';
      const rel = uri.replace(/^vault:\/\//, '');
      const text = readDoc(rel);
      return reply(id, { contents: [{ uri, mimeType: 'text/markdown', text }] });
    }
    case 'tools/list':
      return reply(id, { tools: TOOLS });
    case 'tools/call': {
      const name = params && params.name;
      const a = (params && params.arguments) || {};
      let text;
      if (name === 'search_vault') text = searchVault(a.query, a.limit);
      else if (name === 'read_vault_doc') text = readDoc(a.path || '');
      else return fail(id, -32601, `Unknown tool: ${name}`);
      return reply(id, { content: [{ type: 'text', text }] });
    }
    case 'ping':
      return reply(id, {});
    default:
      if (id !== undefined) fail(id, -32601, `Unknown method: ${method}`);
  }
}

let buf = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  buf += chunk;
  let nl;
  while ((nl = buf.indexOf('\n')) !== -1) {
    const line = buf.slice(0, nl).trim();
    buf = buf.slice(nl + 1);
    if (!line) continue;
    try { handle(JSON.parse(line)); }
    catch (e) { fail(null, -32700, `Parse error: ${e.message}`); }
  }
});
process.stdin.on('end', () => process.exit(0));

if (process.argv.includes('--selftest')) {
  console.log(`uvctv-vault MCP server`);
  console.log(`package root: ${PKG}`);
  console.log(`documents served: ${DOCS.length}`);
  console.log(`tools: ${TOOLS.map(t => t.name).join(', ')}`);
  console.log(`\nsample search "parallel agents ownership":`);
  console.log(searchVault('parallel agents ownership', 1).split('\n').slice(0, 6).join('\n'));
  process.exit(0);
}
