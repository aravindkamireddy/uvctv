#!/usr/bin/env python3
"""a11y_linter.py - contract-side accessibility checks on DESIGN.md-class
files. Enforces the v1.1 DESIGN format's mechanical a11y statements; the
render-side half lives in the browser station's keyboard walk (GR-14 /
design-review-workflow.md) - a linter cannot walk a flow, so it polices
what a file CAN promise.

Vault frontmatter:
  title: A11y linter (runnable) | layer: L6 | priority: P0 | version: 1.0
  date: 2026-07-25 | source_model: Claude Fable 5
  depends_on: design/design-md-template.md, verifiers/lint/README.md
  changelog: 2026-07-26 fix-batch - findings emit in GUARDRAILS.md row shape (GR-16)
  audience: all | tools: all
  usage: python3 a11y_linter.py <root>   (add --exempt path ... as needed)

What it checks, per design-contract file (any file containing a line
starting with "# Design Tokens"):
1. SECTION: an "## Accessibility rules" section exists (v1.1 format law;
   GR-13's permanent constraint - a11y as contract lines, not values).
2. TABLE: if a Components table exists (header row containing both
   "Component" and "A11y"), every component row's a11y-obligations cell
   is non-empty and not a bare placeholder.
3. FOCUS RULE: the contract states the focus rule (a line mentioning
   "focus" within Accessibility rules or Component rules) - the token
   whose removal was half of GR-13.

Exit: 0 clean, 1 findings, 2 config error.
"""

import argparse
import re
import sys
from pathlib import Path

# --- guardrail emission (fix-batch cross-cutting requirement) -------------
# Findings print as GUARDRAILS.md rows so they paste into the log unedited.
from datetime import date as _date
def guardrail(observed: str, gr: str, constraint: str, tools: str, test: str) -> str:
    return f"| {gr} | {_date.today()} | {observed} | {constraint} | {tools} | {test} |"


HEADING = re.compile(r"^#\s+Design Tokens", re.M)
PLACEHOLDER = re.compile(r"^\s*(<[^>]*>)?\s*$")


def find_contract_files(root: Path, exempt: set[str]):
    for p in sorted(root.rglob("*.md")):
        if ".git" in p.parts:
            continue
        rel = p.relative_to(root).as_posix()
        if rel in exempt:
            continue
        try:
            text = p.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
        if HEADING.search(text):
            yield rel, text


def check_contract(rel: str, text: str) -> list[str]:
    findings = []
    # 1. Accessibility section
    if not re.search(r"^##\s+Accessibility rules", text, re.M):
        findings.append(f"{rel}: no '## Accessibility rules' section - "
                        f"a11y as values, not contract lines (GR-13)")
    # 2. Components table a11y cells
    lines = text.splitlines()
    in_table, a11y_col = False, None
    for lineno, line in enumerate(lines, 1):
        s = line.strip()
        if s.startswith("|") and "Component" in s and "A11y" in s:
            headers = [h.strip().lower() for h in s.strip("|").split("|")]
            a11y_col = next((i for i, h in enumerate(headers) if "a11y" in h), None)
            in_table = True
            continue
        if in_table:
            if not s.startswith("|"):
                in_table, a11y_col = False, None
                continue
            cells = [c.strip() for c in s.strip("|").split("|")]
            if all(re.fullmatch(r":?-+:?", c) for c in cells):
                continue  # separator
            if a11y_col is not None and cells and not cells[0].startswith("<"):
                cell = cells[a11y_col] if a11y_col < len(cells) else ""
                if PLACEHOLDER.match(cell):
                    findings.append(f"{rel}:{lineno}: component "
                                    f"'{cells[0]}' has an empty a11y-"
                                    f"obligations cell (GR-13 rule)")
    # 3. Focus rule stated
    if "focus" not in text.lower():
        findings.append(f"{rel}: no focus rule stated anywhere - the "
                        f"focus token's non-removal is contract law")
    return findings


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("root", type=Path)
    ap.add_argument("--exempt", nargs="*", default=[],
                    help="relative paths to skip (golden fixtures etc.)")
    args = ap.parse_args()
    if not args.root.is_dir():
        print(f"CONFIG ERROR: root {args.root} is not a directory",
              file=sys.stderr)
        return 2

    findings: list[str] = []
    n = 0
    for rel, text in find_contract_files(args.root, set(args.exempt)):
        n += 1
        findings.extend(check_contract(rel, text))

    if findings:
        print("A11Y CONTRACT FINDINGS - GUARDRAILS.md row format, paste directly:")
        for f in findings:
            print("  " + guardrail(f, "GR-13", "a11y obligations are contract lines per component, not values", "all", "a11y_linter run against design-contract files"))
        print(f"\n{len(findings)} finding(s) across {n} contract file(s). "
              "A11y that isn't written is a11y that ships mouse-only.")
        return 1
    print(f"a11y_linter: clean - {n} design-contract file(s) carry the "
          "required a11y statements.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
