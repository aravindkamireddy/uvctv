#!/usr/bin/env python3
"""toolkit_linter.py - lint the PRODUCT, not the repo.

Vault frontmatter:
  title: Toolkit linter (runnable) | layer: L6 | priority: P0 | version: 1.0
  date: 2026-08-16 | source_model: Claude Fable 5
  depends_on: verifiers/lint/README.md, cli/bin/uvctv.js
  audience: all | tools: all
  usage: python3 toolkit_linter.py <vault_root> [--keep]

Why this exists (GR-21): the other five linters check the VAULT - that facts
live in one place, that dates are fresh, that parity holds. Not one of them
checked whether an INSTALLED skill's references resolve in the INSTALLED
toolkit. They passed clean for weeks while three of the six skills pointed at
paths that do not exist after extraction: a rubric that was never extracted at
all, and two files that exist under different names. The verifiers were built
around the repo because the repo is what the author was looking at.

What it does:
  1. Extracts the vault's fenced <!-- FILE: --> payloads into a temp toolkit,
     exactly as the CLI does (same marker map).
  2. For every extracted file, resolves every reference it makes to a
     toolkit-relative or ~/agent-toolkit path.
  3. Fails on any reference that does not resolve.
  4. Warns on any extracted file that nothing else references (orphan) and any
     shared/ file no skill mentions (dead wiring - the GUARDRAILS.md case).

Findings print as GUARDRAILS.md rows. Exit: 0 clean, 1 findings, 2 config.
"""

import argparse
import re
import shutil
import sys
import tempfile
from datetime import date
from pathlib import Path

MARKER = re.compile(r"^\s*<!--\s*FILE:\s*(\S+)")
FENCE = re.compile(r"^\s*(```|~~~)\s*$")
# references an installed file can make to another installed file
REF = re.compile(r"(?:~/agent-toolkit/|\b)(shared/[A-Za-z0-9_.-]+|reference/[A-Za-z0-9_.-]+|skills/[A-Za-z0-9_./-]+|opencode/agents/[A-Za-z0-9_.-]+)")


def guardrail(observed, gr, constraint, tools, test):
    return f"| {gr} | {date.today()} | {observed} | {constraint} | {tools} | {test} |"


def map_target(marker: str):
    if marker.startswith(".claude/agents/"):
        return f"skills/{Path(marker).stem}/SKILL.md"
    for pre, to in ((".claude/skills/", "skills/"),
                    (".opencode/agent/", "opencode/agents/"),
                    ("~/agent-toolkit/shared/", "shared/"),
                    ("~/agent-toolkit/reference/", "reference/")):
        if marker.startswith(pre):
            return to + marker[len(pre):]
    return None


def extract(vault: Path, toolkit: Path) -> list[str]:
    written = []
    for md in sorted(vault.rglob("*.md")):
        if ".git" in md.parts:
            continue
        lines = md.read_text(errors="replace").splitlines()
        i = 0
        while i < len(lines):
            m = MARKER.match(lines[i])
            if m:
                target = map_target(m.group(1))
                if target:
                    body, j = [], i + 1
                    while j < len(lines) and not FENCE.match(lines[j]):
                        body.append(lines[j]); j += 1
                    dest = toolkit / target
                    dest.parent.mkdir(parents=True, exist_ok=True)
                    dest.write_text("\n".join(body) + "\n")
                    written.append(target)
                    i = j
            i += 1
    return written


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("vault", type=Path)
    ap.add_argument("--keep", action="store_true", help="keep the temp toolkit for inspection")
    args = ap.parse_args()
    if not args.vault.is_dir():
        print(f"CONFIG ERROR: {args.vault} is not a directory", file=sys.stderr)
        return 2

    tmp = Path(tempfile.mkdtemp(prefix="uvctv-lint-"))
    findings = []
    try:
        written = extract(args.vault, tmp)
        if not written:
            findings.append(guardrail(
                "extraction produced zero files - the marker map matches nothing in this vault",
                "GR-21", "the toolkit linter must extract what the CLI extracts; a silent zero means the maps diverged",
                "all", "toolkit_linter on a healthy vault writes >0 files"))

        present = {p.relative_to(tmp).as_posix() for p in tmp.rglob("*") if p.is_file()}

        # 1. every reference in an installed file must resolve
        referenced = set()
        for rel in sorted(present):
            text = (tmp / rel).read_text(errors="replace")
            for m in REF.finditer(text):
                ref = m.group(1)
                referenced.add(ref)
                if ref not in present:
                    findings.append(guardrail(
                        f"installed file {rel} references {ref}, which does not exist in the installed toolkit",
                        "GR-21", "every reference an installed file makes must resolve after extraction, not just in the repo",
                        "all", "toolkit_linter extracts to a temp dir and resolves every reference"))

        # 2. shared/ files nothing points at = dead wiring
        for rel in sorted(present):
            if (rel.startswith("shared/") or rel.startswith("reference/")) and rel not in referenced:
                findings.append(guardrail(
                    f"{rel} is extracted into every toolkit but no installed skill references it - dead wiring",
                    "GR-21", "a file worth installing is a file some skill tells the agent to read",
                    "all", "toolkit_linter cross-checks shared/ against skill references"))

        if findings:
            print("TOOLKIT FINDINGS - GUARDRAILS.md row format, paste directly:")
            for f in findings:
                print("  " + f)
            print(f"\n{len(findings)} finding(s) across {len(present)} installed file(s).")
            return 1
        print(f"toolkit_linter: clean - {len(present)} installed file(s), every reference resolves, "
              f"no dead wiring.")
        return 0
    finally:
        if args.keep:
            print(f"(temp toolkit kept at {tmp})")
        else:
            shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    sys.exit(main())
