#!/usr/bin/env python3
"""permission_audit.py - the mechanical floor of the mcp-permission-audit
skill: config <-> registry conformance, secret-literal detection,
exception expiry.

Vault frontmatter:
  title: Permission auditor (runnable) | layer: L6 | priority: P0 | version: 1.0
  date: 2026-07-24 | source_model: Claude Fable 5
  depends_on: verifiers/lint/README.md, mcp/registry-template.md
  changelog: 2026-07-26 fix-batch - findings emit in GUARDRAILS.md row shape (GR-16)
  audience: all | tools: all
  usage: python3 permission_audit.py --registry mcp/registry.md <root>

What it checks:
1. Every MCP server configured in any recognized config file has a
   registry row (no row, no connection).
2. Credential values in configs are env-var references (${VAR}) - any
   other non-empty value on a credential-ish key is a literal-secret
   finding (GR-8). Never prints the value.
3. Exceptions table: every row has an EXPIRES date; expired rows flagged
   (GR-12).

Recognized configs (parser stanzas - extend per generic-adapter L6 rule):
  .mcp.json          -> keys of "mcpServers" (or top-level object)
  opencode.json      -> keys of "mcp"
  config.toml        -> [mcp_servers.<name>] tables (tomllib)

Registry parsing: first markdown table with a "Server" header column;
exceptions from a table whose header contains "EXPIRES".

Exit: 0 clean, 1 findings, 2 config error.
"""

import argparse
import datetime as dt
import json
import re
import sys
from pathlib import Path

# --- guardrail emission (fix-batch cross-cutting requirement) -------------
# Findings print as GUARDRAILS.md rows so they paste into the log unedited.
from datetime import date as _date
def guardrail(observed: str, gr: str, constraint: str, tools: str, test: str) -> str:
    return f"| {gr} | {_date.today()} | {observed} | {constraint} | {tools} | {test} |"


try:
    import tomllib  # 3.11+
except ModuleNotFoundError:  # pragma: no cover
    tomllib = None

CRED_KEY_RE = re.compile(r"(token|key|secret|password|url|credential)", re.I)
ENV_REF_RE = re.compile(r"^\$\{[A-Z0-9_]+\}$")
DATE_RE = re.compile(r"\d{4}-\d{2}-\d{2}")


def parse_md_tables(text: str) -> list[list[list[str]]]:
    tables, current = [], []
    for line in text.splitlines():
        s = line.strip()
        if s.startswith("|") and s.endswith("|"):
            cells = [c.strip() for c in s.strip("|").split("|")]
            if all(re.fullmatch(r":?-+:?", c) for c in cells):
                continue  # separator row
            current.append(cells)
        elif current:
            tables.append(current)
            current = []
    if current:
        tables.append(current)
    return tables


def load_registry(path: Path):
    text = path.read_text(encoding="utf-8", errors="replace")
    servers, exceptions = {}, []
    for table in parse_md_tables(text):
        header = [h.lower() for h in table[0]]
        if "server" in header and "expires" not in header:
            for row in table[1:]:
                if row and row[0] and not row[0].startswith("("):
                    servers[row[0]] = dict(zip(header, row))
        elif "expires" in header:
            idx = header.index("expires")
            for row in table[1:]:
                if row and row[0] and not row[0].startswith("("):
                    exceptions.append((row[0], row[idx] if idx < len(row) else ""))
    return servers, exceptions


def walk_string_values(obj, path=""):
    if isinstance(obj, dict):
        for k, v in obj.items():
            yield from walk_string_values(v, f"{path}.{k}" if path else k)
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            yield from walk_string_values(v, f"{path}[{i}]")
    elif isinstance(obj, str):
        yield path, obj


def check_credentials(data, rel: str) -> list[str]:
    findings = []
    for keypath, value in walk_string_values(data):
        leaf = keypath.rsplit(".", 1)[-1]
        if CRED_KEY_RE.search(leaf) and value and not ENV_REF_RE.match(value):
            findings.append(
                f"{rel}: '{keypath}' holds a literal value, not an env-var "
                f"reference ${{VAR}} - possible secret (GR-8); value withheld"
            )
    return findings


def collect_configs(root: Path):
    """Yield (rel, server_names, data) per recognized config."""
    for p in sorted(root.rglob("*")):
        if ".git" in p.parts or not p.is_file():
            continue
        rel = p.relative_to(root).as_posix()
        try:
            if p.name == ".mcp.json":
                data = json.loads(p.read_text(encoding="utf-8"))
                servers = list((data.get("mcpServers") or data or {}).keys())
                yield rel, servers, data
            elif p.name == "opencode.json":
                data = json.loads(p.read_text(encoding="utf-8"))
                yield rel, list((data.get("mcp") or {}).keys()), data
            elif p.name == "config.toml" and tomllib:
                data = tomllib.loads(p.read_text(encoding="utf-8"))
                yield rel, list((data.get("mcp_servers") or {}).keys()), data
        except (json.JSONDecodeError, OSError) as e:
            yield rel, [], {"__parse_error__": str(e)}
        except Exception as e:  # tomllib decode errors vary
            yield rel, [], {"__parse_error__": str(e)}


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--registry", required=True, type=Path)
    ap.add_argument("--today", type=str, default=None,
                    help="ISO date override for tests")
    ap.add_argument("root", type=Path)
    args = ap.parse_args()

    if not args.registry.is_file():
        print(f"CONFIG ERROR: registry {args.registry} not found", file=sys.stderr)
        return 2
    if not args.root.is_dir():
        print(f"CONFIG ERROR: root {args.root} is not a directory", file=sys.stderr)
        return 2

    today = dt.date.fromisoformat(args.today) if args.today else dt.date.today()
    servers, exceptions = load_registry(args.registry)
    findings: list[str] = []

    for rel, config_servers, data in collect_configs(args.root):
        if "__parse_error__" in data:
            findings.append(f"{rel}: unparseable config "
                            f"({data['__parse_error__']})")
            continue
        for s in config_servers:
            if s not in servers:
                findings.append(f"{rel}: server '{s}' has NO registry row - "
                                f"no row, no connection (GR-12)")
        findings += check_credentials(data, rel)

    for server, expires in exceptions:
        m = DATE_RE.search(expires or "")
        if not m:
            findings.append(f"registry exceptions: '{server}' widening has no "
                            f"EXPIRES date - undated exceptions forbidden (GR-12)")
        elif dt.date.fromisoformat(m.group()) < today:
            findings.append(f"registry exceptions: '{server}' widening EXPIRED "
                            f"{m.group()} - revert or re-approve (GR-12)")

    if findings:
        print("PERMISSION AUDIT FINDINGS - GUARDRAILS.md row format, paste directly:")
        for f in findings:
            print("  " + guardrail(f, "GR-12", "no row, no connection; credentials are env-var references; exceptions carry expiry dates", "all", "permission_audit run against the registry"))
        print(f"\n{len(findings)} finding(s). The matrix is the deliverable; "
              "an unaudited connection is GR-12 on a timer.")
        return 1
    print(f"permission_audit: clean - {len(servers)} registry row(s), "
          "all configured servers rowed, credentials referenced, "
          "exceptions dated.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
