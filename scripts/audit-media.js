#!/usr/bin/env node
/**
 * audit-media.js — Vérifie la cohérence photos/vidéos
 *
 * Pour chaque lettre : compare ce que le site affiche vs ce qui existe sur disque.
 * Usage: node scripts/audit-media.js
 */

const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(process.cwd(), 'public', 'images');
const LETTERS_DIR = path.join(process.cwd(), 'content', 'letters');

function getPhotoCaptions(letterId) {
  const file = path.join(IMAGES_DIR, letterId, 'captions.json');
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function getPhotosForLetter(id) {
  const dir = path.join(IMAGES_DIR, id);
  if (!fs.existsSync(dir)) return [];
  const captions = getPhotoCaptions(id);
  const files = fs.readdirSync(dir)
    .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  return files.map((f) => {
    const meta = captions[f] || captions[f.toLowerCase()];
    return {
      src: `/images/${id}/${f}`,
      name: meta?.caption ?? f.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
      caption: meta?.caption,
    };
  });
}

function getVideosForLetter(id) {
  const dir = path.join(IMAGES_DIR, id);
  if (!fs.existsSync(dir)) return [];
  const captions = getPhotoCaptions(id);
  const files = fs.readdirSync(dir)
    .filter((f) => /\.(mov|mp4|webm)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  return files.map((f) => {
    const meta = captions[f] || captions[f.toLowerCase()];
    return {
      src: `/images/${id}/${f}`,
      name: meta?.caption ?? f.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
      caption: meta?.caption,
    };
  });
}

function main() {
  console.log('\n📋 Audit médias — photos & vidéos\n');

  const letterFiles = fs.readdirSync(LETTERS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''))
    .sort();

  let totalPhotos = 0;
  let totalVideos = 0;
  const issues = [];

  for (const id of letterFiles) {
    const photos = getPhotosForLetter(id);
    const videos = getVideosForLetter(id);

    totalPhotos += photos.length;
    totalVideos += videos.length;

    for (const p of photos) {
      const filePath = path.join(process.cwd(), 'public', p.src);
      if (!fs.existsSync(filePath)) {
        issues.push(`❌ ${id}: fichier manquant ${p.src}`);
      }
    }
    for (const v of videos) {
      const filePath = path.join(process.cwd(), 'public', v.src);
      if (!fs.existsSync(filePath)) {
        issues.push(`❌ ${id}: fichier manquant ${v.src}`);
      }
    }

    const mediaCount = photos.length + videos.length;
    const label = mediaCount > 0
      ? `${photos.length} photo(s), ${videos.length} vidéo(s)`
      : '—';
    console.log(`  ${id}: ${label}`);
  }

  console.log('\n  ─────────────────');
  console.log(`  Total: ${totalPhotos} photos, ${totalVideos} vidéos\n`);

  if (issues.length > 0) {
    console.log('⚠️  Problèmes détectés:\n');
    issues.forEach((i) => console.log(`  ${i}`));
    console.log('');
    process.exit(1);
  }

  console.log('✓ Tous les chemins sont valides.\n');
}

main();
