#!/usr/bin/env bash
# setup.sh - ONE script for the personal layer: scaffold, extract, link, update,
# uninstall. Replaces the former bootstrap-toolkit.sh + install.sh +
# uninstall.sh trio.
#
# Vault frontmatter:
#   title: Personal layer setup (POSIX) | layer: L7 | priority: P1
#   version: 3.3 | date: 2026-09-02 (provenance: update refreshes untouched
#     vault files and keeps yours - previously update only ADDED files) (+ Cursor global skills dir) | source_model: Claude Fable 5
#   changelog: v3.0 - bootstrap/install/uninstall unified into one entry point
#     with detection: a fresh toolkit is created and linked, an existing one is
#     updated in place. Replaces three scripts and three sets of instructions.
#   depends_on: personal-layer/tree.md
#   audience: solo, architect | tools: all
#
#   usage:
#     ./setup.sh --vault <path>            fresh install, or update if one exists
#     ./setup.sh --vault <path> --dry-run  show every action, change nothing
#     ./setup.sh                           re-link only (run from inside the toolkit)
#     ./setup.sh --check                   report what a re-link would do
#     ./setup.sh --update --vault <path>   force content refresh from the vault
#     ./setup.sh --uninstall               remove links this script created
#     ./setup.sh --uninstall --restore     ...and copy files back into each tool dir
#     ./setup.sh --adopt                   a real dir at a link target? move its
#                                          contents into the toolkit, then link
#     ./setup.sh --all                     link even for tools not detected
#     ./setup.sh --force                   overwrite toolkit files during extract
#
# Safety, in priority order:
#   1. Never deletes a real directory to make room for a link (GR-16). Use
#      --adopt to move its contents in instead.
#   2. Never overwrites your edits during update unless --force.
#   3. Uninstall removes only links pointing into THIS toolkit.
#   4. Failures print as GUARDRAILS.md rows, pasteable with no reformatting.

set -euo pipefail

VAULT=""; TOOLKIT=""; DRY=0; CHECK=0; ALL=0; ADOPT=0; FORCE=0
MODE=""            # install | update | uninstall (resolved by detection)
RESTORE=0; STATUS=0; SEEN=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --vault)     VAULT="$2"; shift 2 ;;
    --toolkit)   TOOLKIT="$2"; shift 2 ;;
    --dry-run)   DRY=1; shift ;;
    --check)     CHECK=1; DRY=1; shift ;;
    --update)    MODE="update"; shift ;;
    --uninstall) MODE="uninstall"; shift ;;
    --restore)   RESTORE=1; shift ;;
    --adopt)     ADOPT=1; shift ;;
    --all)       ALL=1; shift ;;
    --force)     FORCE=1; shift ;;
    -h|--help)   sed -n '1,40p' "$0"; exit 0 ;;
    *) echo "unknown argument: $1  (try --help)" >&2; exit 2 ;;
  esac
done

# --- where is the toolkit? -------------------------------------------------
SELF_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ -z "$TOOLKIT" ]]; then
  if [[ -d "$SELF_DIR/skills" ]]; then TOOLKIT="$SELF_DIR"   # running from inside one
  else TOOLKIT="$HOME/agent-toolkit"; fi
fi

say()  { printf '%s\n' "$*"; }
guardrail() { # observed | gr | constraint | tools | test
  printf '| %s | %s | %s | %s | %s | %s |\n' "$2" "$(date +%F)" "$1" "$3" "$4" "$5"
  STATUS=1
}

# --- detection: fresh, existing, or explicit ------------------------------
EXISTING=0
[[ -d "$TOOLKIT/skills" ]] && EXISTING=1
if [[ -z "$MODE" ]]; then
  if [[ $EXISTING -eq 1 ]]; then MODE="update"; else MODE="install"; fi
fi
if [[ "$MODE" != "uninstall" && $EXISTING -eq 0 && -z "$VAULT" ]]; then
  echo "No toolkit at $TOOLKIT and no --vault given." >&2
  echo "First run:  ./setup.sh --vault <path-to-vault>" >&2
  exit 2
fi

say "agent-toolkit setup  (toolkit: $TOOLKIT)"
say "                     (mode: $MODE$([[ $DRY -eq 1 ]] && echo ", dry-run" || true)$([[ $EXISTING -eq 1 ]] && echo ", existing toolkit detected" || echo ", fresh"))"
say ""

# ===========================================================================
# PART 1 - content: scaffold + extract (skipped for uninstall)
# ===========================================================================
SKELETON=(skills opencode/agents shared reference)

map_target() {
  case "$1" in
    .claude/skills/*)           echo "skills/${1#.claude/skills/}" ;;
    .claude/agents/*)           n="${1#.claude/agents/}"; echo "skills/${n%.md}/SKILL.md" ;;
    .opencode/agent/*)          echo "opencode/agents/${1#.opencode/agent/}" ;;
    '~/agent-toolkit/shared/'*) echo "shared/${1#\~/agent-toolkit/shared/}" ;;
    '~/agent-toolkit/reference/'*) echo "reference/${1#\~/agent-toolkit/reference/}" ;;
    *) echo "" ;;
  esac
}

dirs=0; wrote=0; kept=0; refreshed=0
MANIFEST="$TOOLKIT/.uvctv-manifest.json"
YOURS=""
# Provenance: a hash per extracted file lets update tell YOUR edits from stale
# vault content. Untouched files refresh; edited ones are kept and named.
hash_of() { if command -v sha256sum >/dev/null 2>&1; then sha256sum | cut -c1-16; else shasum -a 256 | cut -c1-16; fi; }
recorded_hash() { grep -o "\"$1\": *\"[a-f0-9]*\"" "$MANIFEST" 2>/dev/null | grep -o '[a-f0-9]\{16\}' | tail -1; }
if [[ "$MODE" != "uninstall" && -n "$VAULT" ]]; then
  [[ -d "$VAULT" ]] || { echo "vault not found: $VAULT" >&2; exit 2; }
  VAULT="$(cd "$VAULT" && pwd)"
  NEWMAN=""
  say "-- content (vault: $VAULT)"
  for d in "${SKELETON[@]}"; do
    [[ -d "$TOOLKIT/$d" ]] && continue
    if [[ $DRY -eq 1 ]]; then say "would mkdir  $d"; else mkdir -p "$TOOLKIT/$d"; say "mkdir  $d"; fi
    dirs=$((dirs+1))
  done
  while IFS= read -r src; do
    while IFS=$'\t' read -r marker start; do
      target="$(map_target "$marker")"; [[ -z "$target" ]] && continue
      body="$(awk -v s="$start" 'NR>s { if ($0 ~ /^[[:space:]]*(```|~~~)[[:space:]]*$/) exit; print }' "$src")"
      n=$(printf '%s\n' "$body" | wc -l | tr -d ' ')
      dest="$TOOLKIT/$target"
      if [[ -e "$dest" && $FORCE -eq 0 ]]; then
        new_h="$(printf '%s\n' "$body" | hash_of)"
        cur_h="$(hash_of < "$dest")"
        rec_h="$(recorded_hash "$target")"
        if [[ "$cur_h" == "$new_h" ]]; then
          kept=$((kept+1))
        elif [[ -n "$rec_h" && "$rec_h" == "$cur_h" ]]; then
          if [[ $DRY -eq 1 ]]; then say "would refresh  $target  (vault updated, you never edited it)"
          else printf '%s\n' "$body" > "$dest"; say "refresh $target  (vault updated, your copy was untouched)"; fi
          refreshed=$((refreshed+1))
        else
          YOURS="$YOURS$target
"; kept=$((kept+1))
        fi
        NEWMAN="$NEWMAN  \"$target\": \"$new_h\",
"
      elif [[ $DRY -eq 1 ]]; then
        say "would write  $target  ($n lines)"; wrote=$((wrote+1))
        NEWMAN="$NEWMAN  \"$target\": \"$(printf '%s\n' "$body" | hash_of)\",
"
      else
        mkdir -p "$(dirname "$dest")"; printf '%s\n' "$body" > "$dest"
        say "write  $target  ($n lines)"; wrote=$((wrote+1))
        NEWMAN="$NEWMAN  \"$target\": \"$(hash_of < "$dest")\",
"
      fi
    done < <(grep -n '<!--[[:space:]]*FILE:' "$src" 2>/dev/null \
             | sed -E 's/^([0-9]+):.*FILE:[[:space:]]*([^ ]+).*/\2\t\1/')
  done < <(find "$VAULT" -name '*.md' -type f | sort)
  if [[ $DRY -eq 0 && -n "$NEWMAN" ]]; then
    printf '{\n%s\n}\n' "$(printf '%s' "$NEWMAN" | sed '$ s/,$//')" > "$MANIFEST"
  fi
  if [[ -n "$YOURS" ]]; then
    say ""
    say "kept   file(s) YOU changed - the vault version differs but yours wins:"
    printf '%s' "$YOURS" | while IFS= read -r y; do [[ -n "$y" ]] && say "         $y"; done
    say "       (--force takes the vault's version and discards yours)"
  fi
  # keep a copy of this script in the toolkit so it can be re-run from there
  if [[ $DRY -eq 0 && "$SELF_DIR" != "$TOOLKIT" ]]; then
    cp "${BASH_SOURCE[0]}" "$TOOLKIT/" && say "copy   setup.sh"
  fi
  say ""
fi

# ===========================================================================
# PART 2 - wiring: link / update / remove
# ===========================================================================
# src | dst | mode | detect-root
MAP=(
  "skills|$HOME/.claude/skills|link|$HOME/.claude"
  "skills|$HOME/.codex/skills|link|$HOME/.codex"
  "skills|$HOME/.commandcode/skills|link|$HOME/.commandcode"
  "skills|$HOME/.agents/skills|link|$HOME/.config/zed"
  "skills|$HOME/.cursor/skills-cursor|link|$HOME/.cursor"        # verified 2026-09-02
  "skills|$HOME/.gemini/config/skills|link|$HOME/.gemini"
  "skills|$HOME/.config/opencode/skills|link|$HOME/.config/opencode"
  "skills|$HOME/.openclaw/skills|link|$HOME/.openclaw"
  "opencode/agents|$HOME/.config/opencode/agents|link|$HOME/.config/opencode"
)

linked=0; removed=0; left=0
say "-- wiring"
for entry in "${MAP[@]}"; do
  IFS='|' read -r rel dst lmode detect <<< "$entry"
  src="$TOOLKIT/$rel"

  if [[ "$MODE" == "uninstall" ]]; then
    if [[ -L "$dst" ]]; then
      target="$(readlink "$dst")"
      if [[ "$target" != "$src" ]]; then
        guardrail "uninstall left $dst alone: it links to $target, not to this toolkit" \
          "GR-16" "only remove links this toolkit created" "all" "setup.sh --uninstall --check on a foreign link exits 1"
      elif [[ $DRY -eq 1 ]]; then say "would remove  $dst"
      else
        rm "$dst"; removed=$((removed+1)); say "removed  $dst"
        if [[ $RESTORE -eq 1 && -d "$src" ]]; then
          mkdir -p "$dst"; cp -R "$src/." "$dst/"; say "restored $dst  (copied from the toolkit)"
        fi
      fi
    elif [[ -e "$dst" ]]; then
      guardrail "uninstall left $dst alone: a real directory, not a link this toolkit made" \
        "GR-16" "never delete a real directory during uninstall" "all" "setup.sh --uninstall --check on a real dir exits 1"
      left=$((left+1))
    fi
    continue
  fi

  # install / update
  if [[ ! -e "$src" ]]; then continue; fi
  if [[ -n "${detect:-}" && ! -e "$detect" && $ALL -eq 0 ]]; then
    case "$SEEN" in *"[$detect]"*) : ;; *)
      say "not detected  $(basename "$detect")  (no $detect - skipping; --all links anyway)"
      SEEN="$SEEN[$detect]" ;;
    esac
    continue
  fi

  if [[ -L "$dst" ]]; then
    if [[ "$(readlink "$dst")" == "$src" ]]; then say "ok     $dst"
    elif [[ $DRY -eq 1 ]]; then say "would relink  $dst"
    else rm "$dst"; ln -s "$src" "$dst"; linked=$((linked+1)); say "relink $dst -> $src"; fi
  elif [[ -e "$dst" ]]; then
    if [[ $ADOPT -eq 1 && -d "$dst" && $DRY -eq 0 ]]; then
      moved=0; conflict=0
      shopt -s dotglob nullglob
      for item in "$dst"/*; do
        base="$(basename "$item")"
        if [[ -e "$src/$base" ]]; then say "      conflict: $base already in the toolkit - left in $dst"; conflict=1
        else mv "$item" "$src/" && moved=$((moved+1)); fi
      done
      shopt -u dotglob nullglob
      if [[ $conflict -eq 0 ]] && rmdir "$dst" 2>/dev/null; then
        ln -s "$src" "$dst"; linked=$((linked+1))
        say "adopt  $dst -> $src  ($moved item(s) moved in, then linked)"
      else
        guardrail "adopt incomplete for $dst: $moved moved, conflicts remain" \
          "GR-16" "resolve name conflicts by hand, then re-run with --adopt" "all" "setup.sh --adopt with conflicts exits 1"
      fi
    else
      guardrail "setup refused to replace $dst: a real directory occupies a link target" \
        "GR-16" "never delete a real directory to place a link; re-run with --adopt to move its contents into the toolkit" \
        "all" "setup.sh --check on a HOME with a real dir at a link target exits 1"
      left=$((left+1))
    fi
  else
    if [[ $DRY -eq 1 ]]; then say "would link  $dst -> $src"
    else mkdir -p "$(dirname "$dst")"; ln -s "$src" "$dst"; linked=$((linked+1)); say "link   $dst -> $src"; fi
  fi
done

# shared/ presence check (install/update only)
if [[ "$MODE" != "uninstall" ]]; then
  for f in GUARDRAILS.md mcp-registry.md DESIGN.md; do
    [[ -f "$TOOLKIT/shared/$f" ]] || say "note   shared/$f missing - re-run with --vault to extract it"
  done
fi

say ""
case "$MODE" in
  uninstall) say "done: $removed link(s) removed, $left path(s) left alone. Toolkit untouched at $TOOLKIT." ;;
  update)    say "done: $wrote new, $refreshed refreshed, $kept kept, $linked link(s) (re)made." ;;
  install)   say "done: $dirs dir(s), $wrote new, $refreshed refreshed, $kept kept, $linked link(s)."
             say ""
             say "Next: ask your AI tool \"what skills do you have available?\""
             say "      shared/ files start as templates - fill them in as you go." ;;
esac
[[ $DRY -eq 1 ]] && say "(dry run - nothing was changed)"
exit $STATUS
