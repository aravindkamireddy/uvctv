#!/usr/bin/env python3
"""ssot_linter.py - enforce the One Hard Rule: each fact lives in exactly
one file; every other file references it, never restates it.

Vault frontmatter (JSON-comment style header for linter self-description):
  title: SSOT linter (runnable)  | layer: L6 | priority: P0 | version: 1.0
  date: 2026-07-24 | source_model: Claude Fable 5
  depends_on: verifiers/lint/README.md | audience: all | tools: all
  usage: python3 ssot_linter.py --rules ssot.rules.json <root>

Rule file format (ssot.rules.json):
{
  "fact_classes": [
    {
      "name": "harborline-commands",
      "owner": "foundation/agents-md-example-harborline-root.md",
      "patterns": ["bun run db:migrate", "bun run deploy"],
      "allowed_reference_regex": "see AGENTS\\.md|AGENTS\\.md is authoritative",
      "exempt": ["REFERENCE-ANCHORS.md"]
    }
  ],
  "scan_extensions": [".md", ".json", ".toml", ".yaml", ".yml"]
}

Semantics:
- A file other than the owner containing any pattern is a VIOLATION,
  unless (a) it is listed in "exempt", or (b) every matching line also
  matches allowed_reference_regex (a pointer, not a restatement), or
  (c) the line is inside a fenced block marked  <!-- FILE: ... -->  that
  IS the owner's shipped artifact being displayed by the owner itself.
- Exit 0 clean; exit 1 violations; exit 2 usage/config error.
"""

import argparse
import json
import re
import sys
from pathlib import Path

# --- guardrail emission (fix-batch cross-cutting requirement) -------------
# Findings print as GUARDRAILS.md rows so they paste into the log unedited.
from datetime import date as _date
def guardrail(observed: str, gr: str, constraint: str, tools: str, test: str) -> str:
    return f"| {gr} | {_date.today()} | {observed} | {constraint} | {tools} | {test} |"


FENCE_RE = re.compile(r"^(```|~~~)")


def load_rules(path: Path) -> dict:
    try:
        rules = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as e:
        print(f"CONFIG ERROR: cannot read rules {path}: {e}", file=sys.stderr)
        sys.exit(2)
    if "fact_classes" not in rules:
        print("CONFIG ERROR: rules missing 'fact_classes'", file=sys.stderr)
        sys.exit(2)
    return rules


def iter_files(root: Path, extensions: list[str]):
    for p in sorted(root.rglob("*")):
        if p.is_file() and p.suffix in extensions and ".git" not in p.parts:
            yield p


def check_file(path: Path, rel: str, rules: dict) -> list[str]:
    violations = []
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except OSError as e:
        return [f"{rel}: unreadable ({e})"]
    lines = text.splitlines()

    for fc in rules["fact_classes"]:
        owner = fc["owner"]
        if rel == owner or rel in fc.get("exempt", []):
            continue
        ref_re = re.compile(fc.get("allowed_reference_regex", r"$^"))
        in_fence = False
        for lineno, line in enumerate(lines, 1):
            if FENCE_RE.match(line.strip()):
                in_fence = not in_fence
                continue
            for pat in fc["patterns"]:
                if pat in line:
                    if ref_re.search(line):
                        continue  # pointer form - allowed
                    where = " (in fenced block)" if in_fence else ""
                    violations.append(
                        f"{rel}:{lineno}: restates '{pat}' "
                        f"[class {fc['name']}, owner {owner}]{where}"
                    )
    return violations


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--rules", required=True, type=Path)
    ap.add_argument("root", type=Path)
    args = ap.parse_args()

    if not args.root.is_dir():
        print(f"CONFIG ERROR: root {args.root} is not a directory", file=sys.stderr)
        return 2

    rules = load_rules(args.rules)
    exts = rules.get("scan_extensions", [".md"])

    all_violations: list[str] = []
    for f in iter_files(args.root, exts):
        rel = f.relative_to(args.root).as_posix()
        all_violations.extend(check_file(f, rel, rules))

    if all_violations:
        print("SSOT VIOLATIONS (One Hard Rule) - GUARDRAILS.md row format, paste directly:")
        for v in all_violations:
            print("  " + guardrail(v, "GR-5", "each fact lives in exactly one file; every other file references it", "all", "ssot_linter run against the vault root"))
        print(f"\n{len(all_violations)} violation(s). "
              "Replace restatements with references to the owner file.")
        return 1

    print("ssot_linter: clean - every fact class lives only in its owner.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
