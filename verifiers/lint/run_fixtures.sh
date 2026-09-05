#!/usr/bin/env bash
# run_fixtures.sh - each linter MUST fail (exit 1) on its planted-violation
# fixture, or the suite itself is broken. CI: red run if any PASS-on-bad.
# Vault frontmatter: title: Fixture runner | layer: L6 | priority: P0
#   version: 1.1 (2026-07-25: + a11y fixture check) | date: 2026-07-24 | source_model: Claude Fable 5
#   depends_on: verifiers/lint/README.md | audience: all | tools: all
#   usage: bash verifiers/lint/run_fixtures.sh
set -u
cd "$(dirname "${BASH_SOURCE[0]}")"
fail=0
check() { # name expected_exit cmd...
  local name="$1" want="$2"; shift 2
  "$@" > /tmp/fx.out 2>&1; local got=$?
  if [[ $got -eq $want ]]; then echo "OK    $name (exit $got as required)";
  else
    printf '| GR-16 | %s | linter %s PASSED on its planted-violation fixture (exit %s, wanted %s) - the check no longer catches what it exists to catch | a linter that passes on bad input is worse than none; fix the linter before trusting any clean run | all | run_fixtures: every linter must exit 1 on its fixture |\n' \
      "$(date +%F)" "$name" "$got" "$want"
    sed 's/^/      /' /tmp/fx.out | head -6; fail=1
  fi
}
check ssot        1 python3 ssot_linter.py --rules fixtures/ssot/rules.json fixtures/ssot
check staleness   1 python3 staleness_linter.py --rules fixtures/staleness/rules.json fixtures/staleness
check parity      1 python3 parity_linter.py --matrix fixtures/parity/matrix.json fixtures/parity
check permission  1 python3 permission_audit.py --registry fixtures/permission/registry.md --today 2026-07-24 fixtures/permission
check a11y        1 python3 a11y_linter.py fixtures/a11y
# toolkit_linter has no fixture: it lints the REAL vault (there is only one
# product). Exit 0 is required, unlike the others.
check toolkit     0 python3 toolkit_linter.py ../..
exit $fail
