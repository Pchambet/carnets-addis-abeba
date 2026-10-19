import fs from 'fs';
import path from 'path';
import { getImageData, getImageSize } from './blur';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images');

const PHOTO = /\.(jpe?g|png|webp)$/i;
const VIDEO = /\.(mov|mp4|webm)$/i;
/** Dérivés générés par scripts/media.mjs : miniatures et affiches vidéo */
const DERIVED = /-(thumb|poster)\.[^.]+$/i;

export interface Photo {
    src: string;
    thumbSrc?: string;
    caption?: string;
    blurDataURL?: string;
    width?: number;
    height?: number;
}

export interface Video {
    src: string;
    poster?: string;
    caption?: string;
}

/** Légendes écrites par scripts/media.mjs (clés NFC). Un fichier illisible fait échouer le build. */
function getCaptions(letterId: string): Record<string, { caption?: string }> {
    const file = path.join(IMAGES_DIR, letterId, 'captions.json');
    return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
}

/**
 * Fichiers d'un dossier, indexés par nom normalisé (NFC). La comparaison reste exacte
 * (casse comprise) comme sur le serveur, et indépendante de la normalisation Unicode du Mac.
 */
export function listFiles(dir: string): Map<string, string> {
    if (!fs.existsSync(dir)) return new Map();
    return new Map(fs.readdirSync(dir).map((f) => [f.normalize('NFC'), f]));
}

/** Médias d'une lettre (hors dérivés), dans l'ordre d'affichage : alphabétique */
export function listMedia(files: Map<string, string>, kind: RegExp = PHOTO): string[] {
    return [...files.values()]
        .filter((f) => kind.test(f) && !DERIVED.test(f))
        .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

/** Miniature générée par scripts/media.mjs : même extension que l'original, ou .jpg */
export function findThumb(files: Map<string, string>, filename: string): string | undefined {
    const ext = path.extname(filename);
    const base = ext ? filename.slice(0, -ext.length) : filename;
    return [`${base}-thumb${ext}`, `${base}-thumb.jpg`]
        .map((t) => files.get(t.normalize('NFC')))
        .find(Boolean);
}

export function getVideosForLetter(id: string): Video[] {
    const names = listFiles(path.join(IMAGES_DIR, id));
    const captions = getCaptions(id);
    return listMedia(names, VIDEO).map((f) => {
        const poster = names.get(`${f.replace(/\.[^.]+$/, '')}-poster.jpg`.normalize('NFC'));
        return {
            src: `/images/${id}/${f}`,
            poster: poster ? `/images/${id}/${poster}` : undefined,
            caption: captions[f.normalize('NFC')]?.caption,
        };
    });
}

/** blur: false pour les longues listes (galerie) : dimensions seules, sans aperçu flou */
export async function getPhotosForLetter(id: string, { blur = true } = {}): Promise<Photo[]> {
    const names = listFiles(path.join(IMAGES_DIR, id));
    const captions = getCaptions(id);
    return Promise.all(listMedia(names).map(async (f) => {
        const src = `/images/${id}/${f}`;
        const thumb = findThumb(names, f);
        return {
            src,
            thumbSrc: thumb ? `/images/${id}/${thumb}` : undefined,
            caption: captions[f.normalize('NFC')]?.caption,
            ...(await (blur ? getImageData(src) : getImageSize(src))),
        };
    }));
}

/**
 * Vignette d'une lettre pour les listes : miniature de l'image hero, sinon de la première photo.
 */
export function getLetterCover(id: string, heroImage?: string): string | undefined {
    const src = heroImage ?? listMedia(listFiles(path.join(IMAGES_DIR, id))).map((f) => `/images/${id}/${f}`)[0];
    if (!src) return undefined;

    const dir = path.dirname(src);
    const thumb = findThumb(listFiles(path.join(PUBLIC_DIR, dir)), path.basename(src));
    return thumb ? `${dir}/${thumb}` : src;
}
