#!/usr/bin/env node
/**
 * sync-photos-notes.js — Copie photos et vidéos vers public/images/semaine-XX/
 *
 * Sources : "Photos et notes à propos de la lettre/" + racine de Semaine_XX/
 * - Photos : jpg, png, webp ; HEIC converti en JPG
 * - Vidéos : mov, mp4, webm (copiés tels quels)
 *
 * Usage: node scripts/sync-photos-notes.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DRY_RUN = process.argv.includes('--dry-run');
const ROOT = path.join(process.cwd(), '..');
const SITE_BASE = path.join(process.cwd(), 'public', 'images');

function syncFromDir(srcDir, destDir, isVideoOnly = false) {
  if (!fs.existsSync(srcDir)) return [];
  const files = fs.readdirSync(srcDir);
  const synced = [];

  for (const f of files) {
    const src = path.join(srcDir, f);
    if (!fs.statSync(src).isFile()) continue;

    const ext = path.extname(f).toLowerCase();
    const base = f.replace(/\.[^.]+$/, '');

    if (/\.(mov|mp4|webm)$/i.test(f)) {
      const dest = path.join(destDir, f);
      if (!fs.existsSync(dest) || fs.statSync(src).mtime > fs.statSync(dest).mtime) {
        if (!DRY_RUN) fs.copyFileSync(src, dest);
        synced.push(`[vid] ${f}`);
      }
      continue;
    }
    if (isVideoOnly) continue;

    if (/\.(jpg|jpeg|png|webp)$/i.test(f)) {
      const dest = path.join(destDir, f);
      if (!fs.existsSync(dest) || fs.statSync(src).mtime > fs.statSync(dest).mtime) {
        if (!DRY_RUN) fs.copyFileSync(src, dest);
        synced.push(f);
      }
    } else if (/\.(heic)$/i.test(f)) {
      const jpgName = `${base}.jpg`;
      const destPath = path.join(destDir, jpgName);
      const exists = fs.existsSync(destPath);
      const newer = exists && fs.statSync(src).mtime > fs.statSync(destPath).mtime;
      if (!exists || newer) {
        try {
          if (!DRY_RUN) {
            execSync(`sips -s format jpeg -s formatOptions 80 "${src}" --out "${destPath}"`, { stdio: 'pipe' });
          }
          synced.push(jpgName);
        } catch (e) {
          console.warn(`  ⚠ Impossible de convertir HEIC: ${f}`);
        }
      }
    } else if (!ext && f.length > 2) {
      const cleanName = base.replace(/_+$/, '').trim();
      const destPath = path.join(destDir, `${cleanName}.jpg`);
      const exists = fs.existsSync(destPath);
      const newer = exists && fs.statSync(src).mtime > fs.statSync(destPath).mtime;
      if (!exists || newer) {
        try {
          if (!DRY_RUN) {
            execSync(`sips -s format jpeg "${src}" --out "${destPath}"`, { stdio: 'pipe' });
          }
          synced.push(`${cleanName}.jpg`);
        } catch (e) {
          console.warn(`  ⚠ Impossible de convertir: ${f}`);
        }
      }
    }
  }
  return synced;
}

function syncSemaine(pad) {
  const notesDir = path.join(ROOT, `Semaine_${pad}`, 'Photos et notes à propos de la lettre');
  const semaineDir = path.join(ROOT, `Semaine_${pad}`);
  const destDir = path.join(SITE_BASE, `semaine-${pad}`);

  if (!fs.existsSync(semaineDir)) return [];
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  let synced = [];
  if (fs.existsSync(notesDir)) {
    synced = syncFromDir(notesDir, destDir);
  }
  const rootVideos = syncFromDir(semaineDir, destDir, true);
  return [...synced, ...rootVideos];
}

function main() {
  console.log('\n📷 Sync Photos et notes → public/images\n');
  if (DRY_RUN) console.log('  (mode --dry-run)\n');

  for (let i = 0; i <= 18; i++) {
    const pad = String(i).padStart(2, '0');
    const result = syncSemaine(pad);
    if (result.length > 0) {
      console.log(`  semaine-${pad}: ${result.length} fichier(s) → ${result.join(', ')}`);
    }
  }
  console.log('');
}

main();
