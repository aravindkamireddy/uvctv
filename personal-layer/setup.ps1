# setup.ps1 - ONE script for the personal layer: scaffold, extract, link, update,
# uninstall. Replaces the former bootstrap-toolkit.ps1 + install.ps1 +
# uninstall.ps1 trio. Lockstep twin of setup.sh.
#
# Vault frontmatter:
#   title: Personal layer setup (Windows) | layer: L7 | priority: P1
#   version: 3.4 | date: 2026-09-02 (provenance: update refreshes untouched
#     vault files and keeps yours) (+ Cursor global skills dir) (field fix: stray tokens bound silently to
#     -Vault; all params now named-only and unknown args exit 2) | source_model: Claude Fable 5
#   changelog: v3.0 - three scripts unified with fresh/update detection.
#   depends_on: personal-layer/tree.md, personal-layer/setup.sh
#   audience: solo, architect | tools: all
#
#   usage:
#     .\setup.ps1 -Vault <path>              fresh install, or update if one exists
#     .\setup.ps1 -Vault <path> -DryRun      show every action, change nothing
#     .\setup.ps1                            re-link only (run from inside the toolkit)
#     .\setup.ps1 -Check                     report what a re-link would do
#     .\setup.ps1 -Update -Vault <path>      force content refresh from the vault
#     .\setup.ps1 -Uninstall [-Restore]      remove links this script created
#     .\setup.ps1 -Adopt                     move an existing real dir's contents in
#     .\setup.ps1 -All                       link even for tools not detected
#     .\setup.ps1 -Force                     overwrite toolkit files during extract
#
# Safety mirrors setup.sh: never deletes a real directory (GR-16); never
# overwrites your edits without -Force; uninstall removes only links into THIS
# toolkit; failures print as GUARDRAILS.md rows.
#
# Uses NTFS junctions - no admin rights or Developer Mode needed.

param(
    # All params are named-only: a stray token like "[restore]" must ERROR, not
    # bind silently to -Vault. (Field report 2026-08-11: it did, and vanished.)
    [Parameter(Mandatory=$false)][string]$Vault,
    [Parameter(Mandatory=$false)][string]$Toolkit,
    [switch]$DryRun,
    [switch]$Check,
    [switch]$Update,
    [switch]$Uninstall,
    [switch]$Restore,
    [switch]$Adopt,
    [switch]$All,
    [switch]$Force,
    [Parameter(ValueFromRemainingArguments=$true)][string[]]$Rest
)

if ($Rest) {
    Write-Host ("unknown argument(s): {0}   (try -? for usage)" -f ($Rest -join " "))
    exit 2
}

$ErrorActionPreference = "Stop"
if ($Check) { $DryRun = $true }
$Status = 0
$Seen   = @{}

$SelfDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $Toolkit) {
    if (Test-Path (Join-Path $SelfDir "skills")) { $Toolkit = $SelfDir }
    else { $Toolkit = "$HOME\agent-toolkit" }
}

function Say([string]$m) { Write-Host $m }
function Guardrail([string]$observed, [string]$gr, [string]$constraint, [string]$tools, [string]$test) {
    Write-Host ("| {0} | {1} | {2} | {3} | {4} | {5} |" -f $gr, (Get-Date -Format "yyyy-MM-dd"), $observed, $constraint, $tools, $test)
    $script:Status = 1
}

# --- detection -------------------------------------------------------------
$Existing = Test-Path (Join-Path $Toolkit "skills")
$Mode = if ($Uninstall) { "uninstall" } elseif ($Update) { "update" } elseif ($Existing) { "update" } else { "install" }
if ($Mode -ne "uninstall" -and -not $Existing -and -not $Vault) {
    Write-Host "No toolkit at $Toolkit and no -Vault given."
    Write-Host "First run:  .\setup.ps1 -Vault <path-to-vault>"
    exit 2
}

$suffix = ""
if ($DryRun)   { $suffix += ", dry-run" }
if ($Existing) { $suffix += ", existing toolkit detected" } else { $suffix += ", fresh" }
Say "agent-toolkit setup  (toolkit: $Toolkit)"
Say "                     (mode: $Mode$suffix)"
Say ""

# ===========================================================================
# PART 1 - content
# ===========================================================================
$Skeleton = @("skills", "opencode\agents", "shared", "reference", "hooks")

function Resolve-Target($marker) {
    if ($marker -like ".claude/agents/*") {
        $leaf = [System.IO.Path]::GetFileNameWithoutExtension($marker)
        return "skills\$leaf\SKILL.md"
    }
    $map = @(
        @{ From = ".claude/skills/";         To = "skills\" }
        @{ From = ".opencode/agent/";        To = "opencode\agents\" }
        @{ From = "~/agent-toolkit/shared/"; To = "shared\" }
        @{ From = "~/agent-toolkit/reference/"; To = "reference\" }
        @{ From = "~/agent-toolkit/hooks/"; To = "hooks\" }
    )
    foreach ($m in $map) {
        if ($marker.StartsWith($m.From)) { return $m.To + $marker.Substring($m.From.Length).Replace("/", "\") }
    }
    return $null
}

$dirs = 0; $wrote = 0; $kept = 0; $refreshed = 0
# Provenance: a hash per extracted file lets update tell YOUR edits from stale
# vault content. Untouched files refresh; edited ones are kept and named.
$ManifestPath = Join-Path $Toolkit ".uvctv-manifest.json"
$Manifest = @{}
if (Test-Path $ManifestPath) {
    try { (Get-Content $ManifestPath -Raw | ConvertFrom-Json).PSObject.Properties | ForEach-Object { $Manifest[$_.Name] = $_.Value } } catch {}
}
$NewManifest = @{}
$Yours = @()
function Get-Sha([string]$s) {
    $h = [System.Security.Cryptography.SHA256]::Create()
    ($h.ComputeHash([Text.Encoding]::UTF8.GetBytes($s)) | ForEach-Object { $_.ToString("x2") }) -join "" -replace "^(.{16}).*", '$1'
}
if ($Mode -ne "uninstall" -and $Vault) {
    if (-not (Test-Path $Vault)) { Write-Host "vault not found: $Vault"; exit 2 }
    $VaultFull = (Resolve-Path $Vault).Path
    Say "-- content (vault: $VaultFull)"
    foreach ($d in $Skeleton) {
        $p = Join-Path $Toolkit $d
        if (Test-Path $p) { continue }
        if ($DryRun) { Say "would mkdir  $d" } else { New-Item -ItemType Directory -Path $p -Force | Out-Null; Say "mkdir  $d" }
        $dirs++
    }
    foreach ($file in Get-ChildItem -Path $VaultFull -Filter *.md -Recurse) {
        $lines = Get-Content -LiteralPath $file.FullName
        $i = 0
        while ($i -lt $lines.Count) {
            if ($lines[$i] -match '^\s*<!--\s*FILE:\s*(\S+)') {
                $target = Resolve-Target $Matches[1]
                if ($target) {
                    $body = @(); $j = $i + 1
                    while ($j -lt $lines.Count -and $lines[$j] -notmatch '^\s*(```|~~~)\s*$') { $body += $lines[$j]; $j++ }
                    $dest = Join-Path $Toolkit $target
                    $content = ($body -join "`r`n") + "`r`n"
                    $newHash = Get-Sha $content
                    if ((Test-Path $dest) -and -not $Force) {
                        $curHash = Get-Sha (Get-Content -LiteralPath $dest -Raw)
                        $recHash = $Manifest[$target]
                        if ($curHash -eq $newHash) { $kept++ }
                        elseif ($recHash -and $recHash -eq $curHash) {
                            if ($DryRun) { Say "would refresh  $target  (vault updated, you never edited it)" }
                            else { Set-Content -LiteralPath $dest -Value $content -NoNewline -Encoding UTF8; Say "refresh $target  (vault updated, your copy was untouched)" }
                            $refreshed++
                        }
                        else { $Yours += $target; $kept++ }
                        $NewManifest[$target] = $newHash
                    }
                    elseif ($DryRun) { Say "would write  $target  ($($body.Count) lines)"; $wrote++; $NewManifest[$target] = $newHash }
                    else {
                        New-Item -ItemType Directory -Path (Split-Path $dest) -Force | Out-Null
                        Set-Content -LiteralPath $dest -Value $content -NoNewline -Encoding UTF8
                        Say "write  $target  ($($body.Count) lines)"; $wrote++; $NewManifest[$target] = $newHash
                    }
                    $i = $j
                }
            }
            $i++
        }
    }
    # hooks are runnable .js, copied verbatim rather than extracted
    $hookSrc = Join-Path $VaultFull "hooks"
    if (Test-Path $hookSrc) {
        foreach ($hf in Get-ChildItem -Path $hookSrc -Filter *.js) {
            $hd = Join-Path $Toolkit "hooks\$($hf.Name)"
            if ((Test-Path $hd) -and -not $Force) { $kept++ }
            elseif ($DryRun) { Say "would write  hooks/$($hf.Name)"; $wrote++ }
            else {
                New-Item -ItemType Directory -Path (Split-Path $hd) -Force | Out-Null
                Copy-Item $hf.FullName $hd -Force; Say "write  hooks/$($hf.Name)"; $wrote++
            }
        }
    }
    if (-not $DryRun -and $NewManifest.Count -gt 0) {
        $NewManifest | ConvertTo-Json | Set-Content -LiteralPath $ManifestPath -Encoding UTF8
    }
    if ($Yours.Count -gt 0) {
        Say ""
        Say "kept   $($Yours.Count) file(s) YOU changed - the vault version differs but yours wins:"
        foreach ($y in $Yours) { Say "         $y" }
        Say "       (-Force takes the vault's version and discards yours)"
    }
    if (-not $DryRun -and $SelfDir -ne $Toolkit) {
        Copy-Item $MyInvocation.MyCommand.Path $Toolkit -Force; Say "copy   setup.ps1"
    }
    Say ""
}

# ===========================================================================
# PART 2 - wiring
# ===========================================================================
$Map = @(
    @{ Src = "skills";          Dst = "$HOME\.claude\skills";           Detect = "$HOME\.claude" }
    @{ Src = "skills";          Dst = "$HOME\.codex\skills";            Detect = "$HOME\.codex" }
    @{ Src = "skills";          Dst = "$HOME\.commandcode\skills";      Detect = "$HOME\.commandcode" }
    @{ Src = "skills";          Dst = "$HOME\.agents\skills";           Detect = "$HOME\AppData\Roaming\Zed" }
    @{ Src = "skills";          Dst = "$HOME\.cursor\skills-cursor";    Detect = "$HOME\.cursor" }  # verified 2026-09-02
    @{ Src = "skills";          Dst = "$HOME\.gemini\config\skills";    Detect = "$HOME\.gemini" }
    @{ Src = "skills";          Dst = "$HOME\.config\opencode\skills";  Detect = "$HOME\.config\opencode" }
    @{ Src = "skills";          Dst = "$HOME\.openclaw\skills";         Detect = "$HOME\.openclaw" }
    @{ Src = "opencode\agents"; Dst = "$HOME\.config\opencode\agents";  Detect = "$HOME\.config\opencode" }
)

$linked = 0; $removed = 0; $left = 0
Say "-- wiring"
foreach ($e in $Map) {
    $src = Join-Path $Toolkit $e.Src
    $dst = $e.Dst
    $item = Get-Item $dst -Force -ErrorAction SilentlyContinue

    if ($Mode -eq "uninstall") {
        if ($item -and $item.LinkType) {
            $target = ($item.Target | Select-Object -First 1)
            if ($target -ne $src) {
                Guardrail "uninstall left ${dst} alone: it links to $target, not to this toolkit" `
                    "GR-16" "only remove links this toolkit created" "all" "setup.ps1 -Uninstall -Check on a foreign link exits 1"
            } elseif ($DryRun) { Say "would remove  $dst" }
            else {
                $item.Delete(); $removed++; Say "removed  $dst"
                if ($Restore -and (Test-Path $src)) {
                    New-Item -ItemType Directory -Path $dst -Force | Out-Null
                    Copy-Item -Path (Join-Path $src "*") -Destination $dst -Recurse -Force
                    Say "restored $dst  (copied from the toolkit)"
                }
            }
        } elseif ($item) {
            Guardrail "uninstall left ${dst} alone: a real directory, not a link this toolkit made" `
                "GR-16" "never delete a real directory during uninstall" "all" "setup.ps1 -Uninstall -Check on a real dir exits 1"
            $left++
        }
        continue
    }

    if (-not (Test-Path $src)) { continue }
    if ($e.Detect -and -not (Test-Path $e.Detect) -and -not $All) {
        if (-not $Seen.ContainsKey($e.Detect)) {
            Say ("not detected  {0}  (no {1} - skipping; -All links anyway)" -f (Split-Path $e.Detect -Leaf), $e.Detect)
            $Seen[$e.Detect] = $true
        }
        continue
    }

    if ($item -and $item.LinkType) {
        if (($item.Target | Select-Object -First 1) -eq $src) { Say "ok     $dst" }
        elseif ($DryRun) { Say "would relink  $dst" }
        else { $item.Delete(); New-Item -ItemType Junction -Path $dst -Target $src | Out-Null; $linked++; Say "relink $dst -> $src" }
    }
    elseif ($item) {
        if ($Adopt -and (Test-Path $dst -PathType Container) -and -not $DryRun) {
            $moved = 0; $conflict = $false
            foreach ($child in Get-ChildItem -LiteralPath $dst -Force) {
                $t = Join-Path $src $child.Name
                if (Test-Path $t) { Say "      conflict: $($child.Name) already in the toolkit - left in $dst"; $conflict = $true }
                else { Move-Item -LiteralPath $child.FullName -Destination $src; $moved++ }
            }
            if (-not $conflict -and -not (Get-ChildItem -LiteralPath $dst -Force)) {
                Remove-Item -LiteralPath $dst -Force
                New-Item -ItemType Junction -Path $dst -Target $src | Out-Null
                $linked++; Say "adopt  $dst -> $src  ($moved item(s) moved in, then linked)"
            } else {
                Guardrail "adopt incomplete for ${dst}: $moved moved, conflicts remain" `
                    "GR-16" "resolve name conflicts by hand, then re-run with -Adopt" "all" "setup.ps1 -Adopt with conflicts exits 1"
            }
        } else {
            Guardrail "setup refused to replace ${dst}: a real directory occupies a link target" `
                "GR-16" "never delete a real directory to place a link; re-run with -Adopt to move its contents into the toolkit" `
                "all" "setup.ps1 -Check on a HOME with a real dir at a link target exits 1"
            $left++
        }
    }
    else {
        if ($DryRun) { Say "would link  $dst -> $src" }
        else {
            New-Item -ItemType Directory -Path (Split-Path $dst) -Force | Out-Null
            New-Item -ItemType Junction -Path $dst -Target $src | Out-Null
            $linked++; Say "link   $dst -> $src"
        }
    }
}

if ($Mode -ne "uninstall") {
    foreach ($f in "GUARDRAILS.md", "mcp-registry.md", "DESIGN.md") {
        if (-not (Test-Path (Join-Path $Toolkit "shared\$f"))) { Say "note   shared/$f missing - re-run with -Vault to extract it" }
    }
}

Say ""
switch ($Mode) {
    "uninstall" { Say "done: $removed link(s) removed, $left path(s) left alone. Toolkit untouched at $Toolkit." }
    "update"    { Say "done: $wrote new, $refreshed refreshed, $kept kept, $linked link(s) (re)made." }
    "install"   {
        Say "done: $dirs dir(s), $wrote new, $refreshed refreshed, $kept kept, $linked link(s)."
        Say ""
        Say "Next: ask your AI tool `"what skills do you have available?`""
        Say "      shared/ files start as templates - fill them in as you go."
    }
}
if ($DryRun) { Say "(dry run - nothing was changed)" }
exit $Status
