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
JPEG_QUALITY=80

converted=0
resized=0
compressed=0
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
  run sips -s format jpeg -s formatOptions "$JPEG_QUALITY" "$heic" --out "$jpg" --resampleWidth "$MAX_WIDTH" 2>/dev/null
  run rm -f "$heic"
  ((converted++)) || true
done

echo ""
echo "▶ Étape 2 : Redimensionnement (max ${MAX_WIDTH}px de large)"
# ── Étape 2 : Redimensionner les JPEG/PNG trop grands ──────
find "$IMAGES_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) | while read -r img; do
  img_width=$(sips -g pixelWidth "$img" 2>/dev/null | awk '/pixelWidth/{print $2}' || echo "0")
  if [[ -z "$img_width" ]] || [[ ! "$img_width" =~ ^[0-9]+$ ]] || [[ "$img_width" -le "$MAX_WIDTH" ]]; then
    ((skipped++)) || true
    continue
  fi
  log "↘ resize ${img_width}→${MAX_WIDTH}px : $(basename "$img")"
  if [[ "$img" =~ \.(jpg|jpeg|JPG|JPEG)$ ]]; then
    run sips -s format jpeg -s formatOptions "$JPEG_QUALITY" --resampleWidth "$MAX_WIDTH" "$img" --out "$img" 2>/dev/null
  else
    run sips --resampleWidth "$MAX_WIDTH" "$img" 2>/dev/null
  fi
  ((resized++)) || true
done

echo ""
echo "▶ Étape 3 : Hero responsive (640w, 1024w)"
# ── Étape 3 : Variants du hero page d'accueil ─────────────────
HERO_SRC="$IMAGES_DIR/home-hero.jpg"
if [[ -f "$HERO_SRC" ]]; then
  for w in 640 1024; do
    dst="$IMAGES_DIR/home-hero-${w}.jpg"
    log "✓ hero ${w}w : home-hero-${w}.jpg"
    run sips -s format jpeg -s formatOptions "$JPEG_QUALITY" --resampleWidth "$w" "$HERO_SRC" --out "$dst" 2>/dev/null
  done
else
  log "→ home-hero.jpg absent, ignoré"
fi

echo ""
echo "▶ Étape 4 : Compression JPEG (qualité ${JPEG_QUALITY})"
# ── Étape 4 : Recompresser les JPEG pour réduire la taille ───
while read -r img; do
  tmp="${img}.tmp.$$"
  run sips -s format jpeg -s formatOptions "$JPEG_QUALITY" "$img" --out "$tmp" 2>/dev/null
  if [[ -f "$tmp" ]]; then
    run mv "$tmp" "$img"
    ((compressed++)) || true
  fi
done < <(find "$IMAGES_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" \))

echo ""
echo "╔══════════════════════════════════════════╗"
printf "║  Convertis : %-4s  Redimensionnés : %-4s ║\n" "$converted" "$resized"
printf "║  Compressés: %-4s                       ║\n" "$compressed"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "Poids final du dossier images :"
du -sh "$IMAGES_DIR"
