#!/usr/bin/env python3
"""staleness_linter.py - staleness is worse than absence.

Vault frontmatter:
  title: Staleness linter (runnable) | layer: L6 | priority: P0 | version: 1.0
  date: 2026-07-24 | source_model: Claude Fable 5
  depends_on: verifiers/lint/README.md | audience: all | tools: all
  usage: python3 staleness_linter.py --rules staleness.rules.json <root>
  changelog: v1.1 (2026-07-25) - per-file exempt lists for check_verify_tags
    (verify_exempt) and check_markers (marker_exempt), matching ssot_linter's
    fact_classes[].exempt pattern; lists live in the rules file, never here

Checks (all rule-file driven):
1. [VERIFY YYYY-MM] tags older than cadence_days -> stale claim.
2. Command existence: every listed command in an instruction file must
   appear in the paired package.json "scripts" (or be a listed builtin).
3. Forbidden markers (e.g. "<!-- DRAFT - untrimmed -->") in committed files.
4. Generated-copy freshness: generated file must be newer than its source.

Rule file (staleness.rules.json):
{
  "cadence_days": 120,
  "today": null,                          // ISO date override for tests; null = now
  "command_pairs": [
    {"instruction_file": "AGENTS.md",
     "package_json": "package.json",
     "builtins": ["bun install", "bun test"],
     "command_line_regex": "^- [A-Z][a-z]+: `(?P<cmd>[^`]+)`"}
  ],
  "forbidden_markers": ["<!-- DRAFT - untrimmed -->"],
  "generated_pairs": [{"source": "AGENTS.md", "generated": "GEMINI.md",
                       "required_header": "AUTO-GENERATED FROM AGENTS.md"}]
}

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


VERIFY_RE = re.compile(r"\[VERIFY[ :]?(?P<ym>\d{4}-\d{2})\]")


def fail_cfg(msg: str) -> "sys.NoReturn":
    print(f"CONFIG ERROR: {msg}", file=sys.stderr)
    sys.exit(2)


def check_verify_tags(root: Path, cadence_days: int, today: dt.date,
                      exempt: list[str] | None = None) -> list[str]:
    findings = []
    exempt = set(exempt or [])
    for p in sorted(root.rglob("*.md")):
        if ".git" in p.parts:
            continue
        if p.relative_to(root).as_posix() in exempt:
            continue
        for lineno, line in enumerate(
            p.read_text(encoding="utf-8", errors="replace").splitlines(), 1
        ):
            for m in VERIFY_RE.finditer(line):
                tag_date = dt.date.fromisoformat(m.group("ym") + "-01")
                age = (today - tag_date).days
                if age > cadence_days:
                    rel = p.relative_to(root).as_posix()
                    findings.append(
                        f"{rel}:{lineno}: [VERIFY {m.group('ym')}] is {age}d old "
                        f"(cadence {cadence_days}d) - re-verify this claim"
                    )
    return findings


def check_commands(root: Path, pairs: list[dict]) -> list[str]:
    findings = []
    for pair in pairs:
        instr = root / pair["instruction_file"]
        pkg = root / pair["package_json"]
        if not instr.exists():
            continue  # nothing to lint; absence of the pair target is fine
        if not pkg.exists():
            findings.append(f"{pair['instruction_file']}: paired "
                            f"{pair['package_json']} missing - cannot verify commands")
            continue
        try:
            scripts = json.loads(pkg.read_text(encoding="utf-8")).get("scripts", {})
        except json.JSONDecodeError as e:
            findings.append(f"{pair['package_json']}: unparseable ({e})")
            continue
        known = set(pair.get("builtins", []))
        known |= {f"bun run {name}" for name in scripts}
        known |= {f"npm run {name}" for name in scripts}
        line_re = re.compile(pair["command_line_regex"])
        for lineno, line in enumerate(
            instr.read_text(encoding="utf-8", errors="replace").splitlines(), 1
        ):
            m = line_re.match(line.strip())
            if m and m.group("cmd") not in known:
                findings.append(
                    f"{pair['instruction_file']}:{lineno}: command "
                    f"'{m.group('cmd')}' not in {pair['package_json']} scripts "
                    f"or builtins - stale instruction (GR-2 class)"
                )
    return findings


def check_markers(root: Path, markers: list[str],
                  exempt: list[str] | None = None) -> list[str]:
    findings = []
    exempt = set(exempt or [])
    for p in sorted(root.rglob("*.md")):
        if ".git" in p.parts:
            continue
        if p.relative_to(root).as_posix() in exempt:
            continue
        text = p.read_text(encoding="utf-8", errors="replace")
        for marker in markers:
            if marker in text:
                rel = p.relative_to(root).as_posix()
                findings.append(f"{rel}: forbidden marker present: '{marker}' "
                                f"(drafts do not merge - GR-10 rule)")
    return findings


def check_generated(root: Path, pairs: list[dict]) -> list[str]:
    findings = []
    for pair in pairs:
        src, gen = root / pair["source"], root / pair["generated"]
        if not gen.exists():
            continue
        header = pair.get("required_header")
        if header and header not in gen.read_text(encoding="utf-8", errors="replace"):
            findings.append(f"{pair['generated']}: missing required header "
                            f"'{header}' - hand-maintained copy suspected (GR-5)")
        if src.exists() and src.stat().st_mtime > gen.stat().st_mtime:
            findings.append(f"{pair['generated']}: older than {pair['source']} - "
                            f"regenerate (stale copy, GR-2/GR-5)")
    return findings


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--rules", required=True, type=Path)
    ap.add_argument("root", type=Path)
    args = ap.parse_args()
    if not args.root.is_dir():
        fail_cfg(f"root {args.root} is not a directory")
    try:
        rules = json.loads(args.rules.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as e:
        fail_cfg(f"cannot read rules: {e}")

    today = (dt.date.fromisoformat(rules["today"])
             if rules.get("today") else dt.date.today())

    findings: list[str] = []
    findings += check_verify_tags(args.root, rules.get("cadence_days", 120), today,
                                  rules.get("verify_exempt", []))
    findings += check_commands(args.root, rules.get("command_pairs", []))
    findings += check_markers(args.root, rules.get("forbidden_markers", []),
                              rules.get("marker_exempt", []))
    findings += check_generated(args.root, rules.get("generated_pairs", []))

    if findings:
        print("STALENESS FINDINGS - GUARDRAILS.md row format, paste directly:")
        for f in findings:
            print("  " + guardrail(f, "GR-2", "a fact and its documentation change in the same commit; dated claims are re-verified on cadence", "all", "staleness_linter run against the vault root"))
        print(f"\n{len(findings)} finding(s). "
              "A stale instruction file is worse than none.")
        return 1
    print("staleness_linter: clean.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
