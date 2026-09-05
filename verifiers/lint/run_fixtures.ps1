# run_fixtures.ps1 - Windows equivalent of run_fixtures.sh. Each linter MUST
# fail (exit 1) on its planted-violation fixture, or the suite itself is
# broken. CI: red run if any linter PASSES on bad input.
#
# Vault frontmatter:
#   title: Fixture runner (Windows) | layer: L6 | priority: P0
#   version: 1.1 | date: 2026-07-25 (+ a11y fixture check) | source_model: Claude Fable 5
#   depends_on: verifiers/lint/README.md, verifiers/lint/run_fixtures.sh
#   audience: all | tools: all
#   usage: pwsh verifiers\lint\run_fixtures.ps1   (or:  .\run_fixtures.ps1)
#
# Notes vs the bash original:
#   - The linters are Python and cross-platform; this script only replaces
#     the bash loop, not the linters. Same fixtures, same pass condition.
#   - Uses $PythonExe = 'python' (the usual Windows launcher). If your setup
#     uses 'py' or 'python3', change the one variable below.

$ErrorActionPreference = "Stop"
$Here      = Split-Path -Parent $MyInvocation.MyCommand.Path
$PythonExe = "python"   # change to "py" or "python3" if that's your launcher
$Fail      = 0

function Check {
    param(
        [string]$Name,
        [int]$WantExit,
        [string[]]$CmdArgs
    )
    $out = & $PythonExe @CmdArgs 2>&1
    $got = $LASTEXITCODE
    if ($got -eq $WantExit) {
        Write-Host "OK    $Name (exit $got as required)"
    }
    else {
        Write-Host ("| GR-16 | {0} | linter {1} PASSED on its planted-violation fixture (exit {2}, wanted {3}) - the check no longer catches what it exists to catch | a linter that passes on bad input is worse than none; fix the linter before trusting any clean run | all | run_fixtures: every linter must exit 1 on its fixture |" -f (Get-Date -Format "yyyy-MM-dd"), $Name, $got, $WantExit)
        $out | Select-Object -First 6 | ForEach-Object { Write-Host "      $_" }
        $script:Fail = 1
    }
}

Push-Location $Here
try {
    Check "ssot"       1 @("ssot_linter.py",       "--rules", "fixtures\ssot\rules.json",           "fixtures\ssot")
    Check "staleness"  1 @("staleness_linter.py",  "--rules", "fixtures\staleness\rules.json",      "fixtures\staleness")
    Check "parity"     1 @("parity_linter.py",     "--matrix", "fixtures\parity\matrix.json",       "fixtures\parity")
    Check "permission" 1 @("permission_audit.py",  "--registry", "fixtures\permission\registry.md", "--today", "2026-07-24", "fixtures\permission")
    Check "a11y"       1 @("a11y_linter.py",       "fixtures\a11y")
    # toolkit_linter lints the REAL vault; exit 0 required.
    Check "toolkit"    0 @("toolkit_linter.py",    "..\..")
}
finally {
    Pop-Location
}

exit $Fail
