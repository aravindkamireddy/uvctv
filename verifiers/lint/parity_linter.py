#!/usr/bin/env python3
"""parity_linter.py - every skill x tool cell resolves, and no skill's
workflow is restated outside its canonical file and declared ports.

Vault frontmatter:
  title: Parity linter (runnable) | layer: L6 | priority: P0 | version: 2.0
  date: 2026-07-26 | source_model: Claude Fable 5
  changelog: v2.0 GR-19 fix - was written to REQUIRE one file per tool, which
    enforced the duplication it should have flagged. Now checks COVERAGE
    (canonical | port | N/A+reason) and adds an anti-duplication pass.
  depends_on: verifiers/lint/README.md, MANIFEST.md | audience: all | tools: all
  usage: python3 parity_linter.py --matrix parity.matrix.json <root>

Cell modes per tool:
  {"mode": "canonical"}                     -> loads skills/<skill>/SKILL.md unchanged
  {"mode": "port", "path_template": "..."}  -> file per skill must exist
  {"mode": "na", "reason": "...", "landing": "..."} -> reason + existing landing file

Also enforced:
  - suite format floor (>=N should-NOT, >=M indirect cases)
  - ANTI-DUPLICATION: a skill's canonical description line may appear only in
    its canonical file and its declared port files (GR-19)

Failures print in GUARDRAILS.md row shape so they paste straight into the
log. Exit: 0 clean, 1 violations, 2 config error.
"""

import argparse, json, re, sys
from pathlib import Path
from datetime import date

def guardrail(observed, constraint, tools, test, gr="GR-19"):
    return f"| {gr} | {date.today()} | {observed} | {constraint} | {tools} | {test} |"

def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--matrix", required=True, type=Path)
    ap.add_argument("root", type=Path)
    args = ap.parse_args()
    try:
        m = json.loads(args.matrix.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as e:
        print(f"CONFIG ERROR: cannot read matrix: {e}", file=sys.stderr); return 2
    if not args.root.is_dir():
        print(f"CONFIG ERROR: root {args.root} is not a directory", file=sys.stderr); return 2

    v = []
    skills = m.get("skills", [])
    cdir = m.get("canonical_dir", "skills")

    # 1. canonical files exist
    for s in skills:
        p = args.root / cdir / s / "SKILL.md"
        if not p.is_file():
            v.append(guardrail(f"canonical skill file missing: {cdir}/{s}/SKILL.md",
                               "every declared skill has exactly one canonical file",
                               "all", "parity_linter canonical pass", "GR-19"))

    # 2. every tool cell resolves
    for tool, cell in m.get("tools", {}).items():
        mode = cell.get("mode")
        if mode == "canonical":
            continue                      # covered by pass 1
        elif mode == "port":
            for s in skills:
                p = args.root / cell["path_template"].format(skill=s)
                if not p.is_file():
                    v.append(guardrail(f"[{tool} x {s}] declared port file absent: {p}",
                                       "a declared port exists as a file or the cell is N/A+reason",
                                       tool, "parity_linter port pass", "GR-19"))
        elif mode == "na":
            if not str(cell.get("reason", "")).strip():
                v.append(guardrail(f"[{tool}] N/A without a reason", "N/A cells carry a reason and a landing file", tool, "parity_linter na pass", "GR-18"))
            land = cell.get("landing")
            if not land or not (args.root / land).is_file():
                v.append(guardrail(f"[{tool}] N/A landing file missing: {land}",
                                   "N/A cells point at a landing file that says where the capability went",
                                   tool, "parity_linter na pass", "GR-18"))
        else:
            v.append(guardrail(f"[{tool}] unknown cell mode: {mode!r}",
                               "each tool declares mode canonical|port|na", tool, "parity_linter mode pass", "GR-19"))

    # 3. ANTI-DUPLICATION (the GR-19 inversion)
    allowed = set()
    for s in skills:
        allowed.add(f"{cdir}/{s}/SKILL.md")
        for tool, cell in m.get("tools", {}).items():
            if cell.get("mode") == "port":
                allowed.add(cell["path_template"].format(skill=s))
    for s in skills:
        can = args.root / cdir / s / "SKILL.md"
        if not can.is_file():
            continue
        mm = re.search(r"^description:\s*(.{40,80})", can.read_text(errors="replace"), re.M)
        if not mm:
            continue
        needle = mm.group(1).strip()
        for f in args.root.rglob("*.md"):
            rel = f.relative_to(args.root).as_posix()
            if rel in allowed or ".git" in f.parts:
                continue
            if needle in f.read_text(errors="replace"):
                v.append(guardrail(
                    f"skill '{s}' description restated in {rel} (outside canonical + declared ports)",
                    "a skill's workflow lives in its canonical file and declared ports only; everything else references it",
                    "all", "parity_linter anti-duplication pass", "GR-19"))

    # 4. suite floor
    sd = args.root / m.get("suites_dir", "verifiers/trigger-tests")
    mn, mi = int(m.get("suite_min_not_cases", 3)), int(m.get("suite_min_indirect", 3))
    if sd.is_dir():
        for suite in sorted(sd.glob("*.tests.md")):
            txt = suite.read_text(errors="replace"); rel = suite.relative_to(args.root).as_posix()
            if txt.count("NO (boundary)") < mn:
                v.append(guardrail(f"{rel} has fewer than {mn} should-NOT boundary cases",
                                   "every suite carries >=3 should-NOT cases", "all", "parity_linter suite floor", "GR-9"))
            if txt.count("(indirect)") < mi:
                v.append(guardrail(f"{rel} has fewer than {mi} indirect-phrasing cases",
                                   "every suite carries >=3 indirect phrasings", "all", "parity_linter suite floor", "GR-6"))
    else:
        v.append(guardrail(f"suites dir missing: {sd}", "trigger-test suites ship with the vault", "all", "parity_linter suite floor", "GR-9"))

    if v:
        print("PARITY VIOLATIONS (GUARDRAILS.md row format - paste directly):")
        for line in v: print("  " + line)
        print(f"\n{len(v)} violation(s).")
        return 1
    print("parity_linter: clean - all cells resolve, zero cross-port duplication, suites meet the floor.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
