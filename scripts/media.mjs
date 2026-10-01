#!/usr/bin/env node
/**
 * media.mjs — médias des lettres (remplace sync-photos-notes / optimize-photos / extract-captions).
 *
 *   npm run add-letter -- "<dossier source>" <semaine-XX>
 *       Importe photos et vidéos du dossier source (sous-dossiers compris) dans
 *       public/images/<semaine-XX>/, écrit les légendes et, si la lettre n'existe pas,
 *       crée content/letters/<semaine-XX>.md avec le texte brut du .docx à relire.
 *
 *   npm run media [-- --dry-run]
 *       Pour toutes les lettres, crée ce qui manque : miniatures 600 px, affiches vidéo,
 *       MP4 rendus lisibles en streaming (faststart).
 *
 * Idempotent : un fichier déjà présent n'est jamais réécrit (pas de recompression en boucle).
 * Dépendances système : sips (macOS, HEIC) et ffmpeg (vidéos).
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';
import mammoth from 'mammoth';

const ROOT = process.cwd();
const IMAGES_DIR = path.join(ROOT, 'public', 'images');
const LETTERS_DIR = path.join(ROOT, 'content', 'letters');

const MAX_SIZE = 2000;
const THUMB_WIDTH = 600;
const POSTER_SIZE = 960;
const IMAGE = /\.(jpe?g|png|webp|heic)$/i;
const VIDEO = /\.(mov|mp4|m4v)$/i;
const DERIVED = /-(thumb|poster)\.[^.]+$/i;
// Noms d'appareil (pas des légendes de Claire)
const TECHNICAL_NAME = /^(IMG[-_]?\d+|DSCF?\d+|motion_photo_\d+|IMG-\d{8}-WA\d+|VID[-_]|IMG_\d{8}_\d+|PXL_|\d+$)/i;

const dryRun = process.argv.includes('--dry-run');
const log = (msg) => console.log(dryRun ? `[dry-run] ${msg}` : msg);

function run(cmd, args) {
  execFileSync(cmd, args, { stdio: ['ignore', 'ignore', 'pipe'] });
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.name.startsWith('.')) return [];
    return e.isDirectory() ? walk(p) : [p];
  });
}

function captionFrom(base) {
  if (TECHNICAL_NAME.test(base)) return null;
  const caption = base.replace(/[_\s]+$/, '').replace(/\s+/g, ' ').trim();
  return caption.length > 1 ? caption : null;
}

function encoder(file) {
  const ext = path.extname(file).toLowerCase();
  if (ext === '.png') return (img) => img.png({ compressionLevel: 9 });
  if (ext === '.webp') return (img) => img.webp({ quality: 80 });
  return (img) => img.jpeg({ quality: 80, mozjpeg: true });
}

/** Fichier temporaire à côté de la cible (même volume : le renommage final est atomique). */
function tmpPath(target, tag) {
  return path.join(path.dirname(target), `.tmp-${process.pid}-${tag}-${path.basename(target)}`);
}

/** Écrit via un fichier temporaire puis renomme : jamais de fichier à moitié écrit. */
async function writeImage(input, output, resize) {
  const tmp = tmpPath(output, 'out');
  await encoder(output)(sharp(input).rotate().resize(resize)).toFile(tmp);
  fs.renameSync(tmp, output);
}

function transcodeVideo(input, output) {
  run('ffmpeg', [
    '-y', '-loglevel', 'error', '-i', input,
    // Côté le plus long ≤ 1920 px, dimensions paires (exigées par yuv420p)
    '-vf', "scale='if(gt(iw,ih),trunc(min(1920,iw)/2)*2,-2)':'if(gt(iw,ih),-2,trunc(min(1920,ih)/2)*2)'",
    '-c:v', 'libx264', '-crf', '23', '-preset', 'slow', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', output,
  ]);
}

/** true si l'atome moov est après mdat : le navigateur doit tout télécharger avant de lire. */
function needsFaststart(file) {
  const fd = fs.openSync(file, 'r');
  try {
    const header = Buffer.alloc(16);
    let pos = 0;
    const size = fs.fstatSync(fd).size;
    while (pos < size) {
      fs.readSync(fd, header, 0, 16, pos);
      let atomSize = header.readUInt32BE(0);
      const type = header.toString('latin1', 4, 8);
      if (type === 'moov') return false;
      if (type === 'mdat') return true;
      if (atomSize === 1) atomSize = Number(header.readBigUInt64BE(8));
      if (atomSize < 8) return false;
      pos += atomSize;
    }
    return false;
  } finally {
    fs.closeSync(fd);
  }
}

/** Crée ce qui manque pour une lettre. */
async function deriveLetter(id) {
  const dir = path.join(IMAGES_DIR, id);
  const files = fs.readdirSync(dir).filter((f) => !DERIVED.test(f));

  for (const f of files.filter((f) => IMAGE.test(f))) {
    const file = path.join(dir, f);
    const ext = path.extname(f);
    const base = path.basename(f, ext);
    // Anciennes miniatures : même extension que l'original ; nouvelles : toujours JPEG
    if (fs.existsSync(path.join(dir, `${base}-thumb${ext}`))) continue;
    const thumb = path.join(dir, `${base}-thumb.jpg`);
    if (!fs.existsSync(thumb)) {
      log(`thumb   ${id}/${path.basename(thumb)}`);
      if (!dryRun) await writeImage(file, thumb, { width: THUMB_WIDTH, withoutEnlargement: true });
    }
  }

  for (const f of files.filter((f) => VIDEO.test(f))) {
    const file = path.join(dir, f);
    if (needsFaststart(file)) {
      log(`faststart ${id}/${f}`);
      if (!dryRun) {
        const tmp = tmpPath(file, 'faststart');
        run('ffmpeg', ['-y', '-loglevel', 'error', '-i', file, '-c', 'copy', '-movflags', '+faststart', tmp]);
        fs.renameSync(tmp, file);
      }
    }
    const poster = path.join(dir, `${path.basename(f, path.extname(f))}-poster.jpg`);
    if (!fs.existsSync(poster)) {
      log(`poster  ${id}/${path.basename(poster)}`);
      if (!dryRun) {
        const frame = tmpPath(`${poster}.png`, 'frame');
        run('ffmpeg', ['-y', '-loglevel', 'error', '-ss', '0.5', '-i', file, '-frames:v', '1', frame]);
        await writeImage(frame, poster, { width: POSTER_SIZE, height: POSTER_SIZE, fit: 'inside', withoutEnlargement: true });
        fs.rmSync(frame, { force: true });
      }
    }
  }
}

async function importLetter(sourceArg, id) {
  if (!/^semaine-\d{2}(-\d{2})?$/.test(id ?? '')) {
    throw new Error('Identifiant attendu : semaine-XX ou semaine-XX-YY');
  }
  const source = path.resolve(ROOT, '..', sourceArg ?? '');
  if (!sourceArg || !fs.existsSync(source)) throw new Error(`Dossier source introuvable : ${source}`);

  const dest = path.join(IMAGES_DIR, id);
  if (!dryRun) fs.mkdirSync(dest, { recursive: true });
  const captionsFile = path.join(dest, 'captions.json');
  const captions = fs.existsSync(captionsFile) ? JSON.parse(fs.readFileSync(captionsFile, 'utf8')) : {};
  const sources = walk(source);
  const claimed = new Map();

  for (const file of sources.filter((f) => IMAGE.test(f) || VIDEO.test(f))) {
    const ext = path.extname(file);
    const base = path.basename(file, ext);
    const isVideo = VIDEO.test(file);
    const target = `${base}${isVideo ? '.mp4' : /heic/i.test(ext) ? '.jpg' : ext}`;
    if (claimed.has(target)) {
      console.warn(`⚠ ignoré : ${path.relative(source, file)} (même nom que ${path.relative(source, claimed.get(target))}) — renommer l'un des deux`);
      continue;
    }
    claimed.set(target, file);
    const caption = captionFrom(base);
    if (caption && !captions[target]) captions[target] = { caption };

    const out = path.join(dest, target);
    if (fs.existsSync(out)) continue;
    log(`import  ${id}/${target}`);
    if (dryRun) continue;
    if (isVideo) {
      const tmp = tmpPath(out, 'video');
      transcodeVideo(file, tmp);
      fs.renameSync(tmp, out);
    } else if (/heic/i.test(ext)) {
      const tmp = tmpPath(out, 'heic');
      try {
        run('sips', ['-s', 'format', 'jpeg', file, '--out', tmp]);
        await writeImage(tmp, out, { width: MAX_SIZE, height: MAX_SIZE, fit: 'inside', withoutEnlargement: true });
      } finally {
        fs.rmSync(tmp, { force: true });
      }
    } else {
      await writeImage(file, out, { width: MAX_SIZE, height: MAX_SIZE, fit: 'inside', withoutEnlargement: true });
    }
  }
  if (!dryRun && Object.keys(captions).length) {
    fs.writeFileSync(captionsFile, `${JSON.stringify(captions, null, 2)}\n`);
  }

  const letter = path.join(LETTERS_DIR, `${id}.md`);
  const docx = sources.find((f) => /\.docx$/i.test(f) && !path.basename(f).startsWith('~$'));
  if (!fs.existsSync(letter) && docx) {
    log(`letter  content/letters/${id}.md (depuis ${path.basename(docx)})`);
    if (!dryRun) {
      const { value } = await mammoth.extractRawText({ path: docx });
      const title = path.basename(docx, '.docx').replace(/[_\s]+$/, '');
      fs.writeFileSync(letter, [
        '---',
        `title: ${JSON.stringify(title)}`,
        `date: "${new Date().toISOString().slice(0, 10)}"`,
        'location: "Addis-Abeba"',
        'excerpt: ""',
        '---',
        '',
        '<!-- Texte brut extrait du .docx : remettre gras/italiques à l\'identique (docs/REGLE_DE_TRANSCRIPTION.md) -->',
        '',
        value.replace(/\n{3,}/g, '\n\n').trim(),
        '',
      ].join('\n'));
    }
  }

  if (fs.existsSync(dest)) await deriveLetter(id);
}

const [command, ...args] = process.argv.slice(2).filter((a) => a !== '--dry-run');
try {
  if (command === 'add') {
    await importLetter(args[0], args[1]);
  } else if (command === 'derive') {
    const ids = fs.readdirSync(IMAGES_DIR, { withFileTypes: true })
      .filter((e) => e.isDirectory()).map((e) => e.name).sort();
    for (const id of ids) await deriveLetter(id);
  } else {
    throw new Error('Usage : node scripts/media.mjs add "<dossier source>" <semaine-XX> | derive [--dry-run]');
  }
} catch (error) {
  console.error(`✖ ${error.message}`);
  process.exit(1);
}
