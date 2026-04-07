#!/usr/bin/env node
/**
 * extract-captions.js — Récupère les légendes de Claire depuis les dossiers source
 *
 * Parcourt Semaine_XX (et Photos et notes à propos de la lettre) pour extraire
 * les noms/remarques que Claire a donnés aux photos, et génère captions.json
 * dans public/images/semaine-XX/.
 *
 * Sources des captions:
 * - Nom de fichier quand c'est un nom personnalisé (pas IMG_1234, DSCF1234, etc.)
 * - Fichiers dans "Photos et notes à propos de la lettre"
 *
 * Usage: node scripts/extract-captions.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');
const ROOT = path.join(process.cwd(), '..'); // Claire&Pierre/
const SITE_BASE = path.join(process.cwd(), 'public', 'images');

// Pattern pour noms "techniques" (caméra, WhatsApp, etc.) — pas des légendes
const TECHNICAL_NAME = /^(IMG[-_]?\d+|DSCF\d+|motion_photo_\d+|IMG-\d{8}-WA\d+|VID-|IMG_\d{8}_\d+)/i;

/** Nettoie un nom de fichier pour en faire une légende lisible */
function cleanCaption(name) {
  return name
    .replace(/_+$/, '')           // trailing underscores
    .replace(/^[-_\s]+|[-_\s]+$/g, '')  // trim
    .replace(/\s+/g, ' ')
    .trim();
}

/** Vérifie si le nom est une légende personnalisée (pas technique) */
function isCustomName(basename) {
  if (TECHNICAL_NAME.test(basename)) return false;
  // Contient des espaces, apostrophes, accents → probablement personnalisé
  if (/[\s'’]|[àâäéèêëïîôùûüç]|\.\.\./i.test(basename)) return true;
  // Plus de 15 car, pas que des chiffres
  if (basename.length > 15 && !/^\d+$/.test(basename)) return true;
  return false;
}

/** Extrait le basename (sans extension) */
function getBasename(f) {
  return f.replace(/\.[^.]+$/, '');
}

function extractFromSource(semaineNum) {
  const pad = String(semaineNum).padStart(2, '0');
  const baseName = pad === '19' ? 'Semaine 19' : (pad === '20' || pad === '21') ? 'Semaine 20 et 21' : `Semaine_${pad}`;
  const dir = path.join(ROOT, baseName);
  const notesDir = path.join(dir, 'Photos et notes à propos de la lettre');
  const result = new Map(); // baseNameLower → { caption, sourceFile }

  if (!fs.existsSync(dir)) return result;

  const scan = (d) => {
    if (!fs.existsSync(d)) return;
    const files = fs.readdirSync(d);
    for (const f of files) {
      const ext = path.extname(f);
      const base = getBasename(f);
      if (/\.(jpg|jpeg|png|heic|webp|mov|mp4|webm)$/i.test(f)) {
        if (isCustomName(base)) {
          const caption = cleanCaption(base);
          if (caption) result.set(base.toLowerCase(), { caption, sourceFile: f });
        }
      } else if (!ext && /[a-zA-ZÀ-ÿ]/.test(f) && f.length > 3) {
        const caption = cleanCaption(f);
        if (caption) {
          result.set(f.toLowerCase(), { caption, sourceFile: f });
          result.set(caption.toLowerCase(), { caption, sourceFile: f }); // pour matcher "Apprivoisements.jpg"
        }
      }
    }
  };

  scan(dir);
  scan(notesDir);

  return result;
}

function getSiteFiles(semaineNum) {
  const pad = String(semaineNum).padStart(2, '0');
  const dir = path.join(SITE_BASE, `semaine-${pad}`);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => /\.(jpg|jpeg|png|webp|mov|mp4|webm)$/i.test(f));
}

/** Mapping manuel pour cas où le nom sur le site diffère de la source */
const MANUAL_MAPPINGS = {
  'semaine-10': { 'kere-soleil.jpg': 'Kere, soleil de mes chagrins' },
  'semaine-00': { 'Libertes.jpg': 'Libertés' },
};

function buildCaptions(semaineNum) {
  const pad = String(semaineNum).padStart(2, '0');
  const id = `semaine-${pad}`;
  const siteFiles = getSiteFiles(semaineNum);
  const sourceCaptions = extractFromSource(semaineNum);
  const manual = MANUAL_MAPPINGS[id] || {};
  const captions = {};

  for (const siteFile of siteFiles) {
    const base = getBasename(siteFile);
    let caption = null;

    if (manual[siteFile]) {
      caption = manual[siteFile];
    } else if (manual[siteFile.toLowerCase()]) {
      caption = manual[siteFile.toLowerCase()];
    } else if (isCustomName(base)) {
      caption = cleanCaption(base);
    } else {
      const fromSource = sourceCaptions.get(base.toLowerCase())
        || sourceCaptions.get(siteFile.toLowerCase());
      if (fromSource) caption = fromSource.caption;
    }

    if (caption) {
      captions[siteFile] = { caption };
    }
  }

  return captions;
}

function main() {
  console.log('\n📷 Extract Captions — récupération des légendes Claire\n');
  if (DRY_RUN) console.log('  (mode --dry-run, aucun fichier écrit)\n');

  let total = 0;
  for (let i = 0; i <= 21; i++) {
    const pad = String(i).padStart(2, '0');
    const id = `semaine-${pad}`;
    const captions = buildCaptions(i);

    if (Object.keys(captions).length === 0) continue;

    const outPath = path.join(SITE_BASE, id, 'captions.json');
    const json = JSON.stringify(captions, null, 2);

    console.log(`  ${id}: ${Object.keys(captions).length} légende(s)`);
    Object.entries(captions).forEach(([file, meta]) => {
      console.log(`    → ${file}: "${meta.caption}"`);
    });

    if (!DRY_RUN && Object.keys(captions).length > 0) {
      fs.writeFileSync(outPath, json + '\n', 'utf8');
      total += Object.keys(captions).length;
    }
  }

  console.log(`\n  Total: ${total} légende(s) écrites`);
  if (DRY_RUN && total === 0) {
    console.log('  (relancer sans --dry-run pour écrire les fichiers)');
  }
  console.log('');
}

main();
