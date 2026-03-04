#!/usr/bin/env bash
# =============================================================
# optimize-photos.sh — Photo pipeline pour claire-addis
# -------------------------------------------------------------
# 1. Convertit HEIC → JPEG (via sips, outil natif macOS)
# 2. Redimensionne toutes les photos > 2000px de large
# 3. Ré-encode en JPEG qualité 85 pour le web
# 4. Supprime les HEIC originaux après conversion
#
# Usage: bash scripts/optimize-photos.sh [--dry-run]
# =============================================================

set -euo pipefail

DRY_RUN=false
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=true

IMAGES_DIR="public/images"
MAX_WIDTH=2000
JPEG_QUALITY=85

converted=0
resized=0
skipped=0

log() { echo "  $1"; }
run() { $DRY_RUN && echo "  [dry] $*" || eval "$@"; }

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  Claire — Photo Optimization Pipeline    ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ── Étape 1 : Convertir les HEIC → JPEG ────────────────────
echo "▶ Étape 1 : Conversion HEIC → JPEG"
find "$IMAGES_DIR" -type f \( -name "*.HEIC" -o -name "*.heic" \) | while read -r heic; do
  jpg="${heic%.*}.jpg"
  if [[ -f "$jpg" ]]; then
    log "→ déjà converti : $(basename "$heic")"
    ((skipped++)) || true
    continue
  fi
  log "✓ HEIC→JPEG : $(basename "$heic")"
  run sips -s format jpeg -s formatOptions "$JPEG_QUALITY" "\"$heic\"" --out "\"$jpg\"" --resampleWidth "$MAX_WIDTH" 2>/dev/null
  run rm -f "\"$heic\""
  ((converted++)) || true
done

echo ""
echo "▶ Étape 2 : Redimensionnement (max ${MAX_WIDTH}px de large)"
# ── Étape 2 : Redimensionner les JPEG/PNG trop grands ──────
find "$IMAGES_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) | while read -r img; do
  width=$(sips -g pixelWidth "$img" 2>/dev/null | awk '/pixelWidth/{print $2}')
  if [[ -z "$width" ]] || [[ "$width" -le "$MAX_WIDTH" ]]; then
    ((skipped++)) || true
    continue
  fi
  log "↘ resize $width→${MAX_WIDTH}px : $(basename "$img")"
  run sips --resampleWidth "$MAX_WIDTH" "\"$img\"" 2>/dev/null
  ((resized++)) || true
done

echo ""
echo "╔══════════════════════════════════════════╗"
printf "║  Convertis : %-4s  Redimensionnés : %-4s ║\n" "$converted" "$resized"
printf "║  Ignorés   : %-4s                       ║\n" "$skipped"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "Poids final du dossier images :"
du -sh "$IMAGES_DIR"
