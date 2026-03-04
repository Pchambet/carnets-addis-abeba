#!/usr/bin/env node
// =============================================================
// audit-content.js — Rapport d'intégrité du contenu
// Usage: node scripts/audit-content.js
// =============================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const LETTERS_DIR = path.join(ROOT, 'content', 'letters');
const IMAGES_DIR = path.join(ROOT, 'public', 'images');
const MIN_LINES = 25;  // Seuil : lettre courte si < 25 lignes de contenu

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const DAY_RE = new RegExp(`\\*\\*(${DAYS.join('|')})`, 'g');

const SUPPORTED_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const WEB_UNSAFE = new Set(['.heic', '.HEIC']);

const green = s => `\x1b[32m${s}\x1b[0m`;
const yellow = s => `\x1b[33m${s}\x1b[0m`;
const red = s => `\x1b[31m${s}\x1b[0m`;
const bold = s => `\x1b[1m${s}\x1b[0m`;

function getPhotos(id) {
    const dir = path.join(IMAGES_DIR, id);
    if (!fs.existsSync(dir)) return { all: [], unsafe: [], total: 0 };
    const files = fs.readdirSync(dir)
        .filter(f => !f.startsWith('.'))
        .map(f => ({ name: f, ext: path.extname(f).toLowerCase() }));
    return {
        all: files,
        unsafe: files.filter(f => WEB_UNSAFE.has(f.ext)),
        webSafe: files.filter(f => SUPPORTED_EXTS.has(f.ext)),
        total: files.length,
    };
}

function auditLetter(id) {
    const mdPath = path.join(LETTERS_DIR, `${id}.md`);
    if (!fs.existsSync(mdPath)) return null;

    const raw = fs.readFileSync(mdPath, 'utf8');
    // Split frontmatter
    const parts = raw.split('---');
    const body = parts.slice(2).join('---').trim();
    const lines = body.split('\n').filter(l => l.trim().length > 0);
    const wordCount = body.split(/\s+/).filter(Boolean).length;
    const readTime = Math.max(1, Math.round(wordCount / 200));

    // Days found
    const dayMatches = [...body.matchAll(DAY_RE)].map(m => m[1]);
    const hasPQ = body.includes('> PQ:');

    const photos = getPhotos(id);

    const issues = [];
    if (lines.length < MIN_LINES) issues.push(`texte court (${lines.length} lignes)`);
    if (photos.total === 0) issues.push('aucune photo');
    if (photos.unsafe.length > 0) issues.push(`${photos.unsafe.length} fichier(s) HEIC à convertir`);

    return {
        id, lines: lines.length, wordCount, readTime,
        days: dayMatches, hasPQ,
        photos, issues,
        status: issues.some(i => i.includes('court') || i.includes('aucune')) ? 'warning'
            : issues.length > 0 ? 'info' : 'ok',
    };
}

// ── Main ──────────────────────────────────────────────────────
const ids = fs.readdirSync(LETTERS_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace('.md', ''))
    .sort();

console.log('\n' + bold('═'.repeat(65)));
console.log(bold('  Claire — Content Audit Report'));
console.log(bold('═'.repeat(65)));

let totalIssues = 0;
let totalPhotos = 0;
let totalHEIC = 0;

for (const id of ids) {
    const r = auditLetter(id);
    if (!r) continue;

    totalPhotos += r.photos.total;
    totalHEIC += r.photos.unsafe.length;

    const icon = r.status === 'ok' ? green('✓') : r.status === 'warning' ? yellow('⚠') : red('✗');
    const daysStr = r.days.length > 0 ? `[${r.days.join(', ')}]` : '[pas de jours]';
    const pqStr = r.hasPQ ? '📌 PQ' : '';

    console.log(
        `\n${icon}  ${bold(id.padEnd(14))}` +
        `  ${String(r.lines).padStart(3)} lignes  ` +
        `${String(r.photos.total).padStart(3)} photos  ` +
        `${String(r.readTime).padStart(2)} min  ` +
        `${pqStr}`
    );
    console.log(`     Jours : ${daysStr}`);
    if (r.issues.length > 0) {
        r.issues.forEach(issue => {
            console.log(`     ${yellow('→')} ${issue}`);
            totalIssues++;
        });
    }
    if (r.photos.unsafe.length > 0) {
        console.log(`     ${yellow('→')} HEIC : ${r.photos.unsafe.map(f => f.name).join(', ')}`);
    }
}

console.log('\n' + bold('═'.repeat(65)));
console.log(`  Total : ${ids.length} lettres · ${totalPhotos} photos · ${totalHEIC} HEIC à convertir`);
console.log(`  Problèmes détectés : ${totalIssues > 0 ? red(totalIssues) : green(0)}`);
console.log(bold('═'.repeat(65)) + '\n');
