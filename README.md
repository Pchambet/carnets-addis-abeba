# Carnets d'Addis-Abeba

> *Nouvelles hebdomadaires depuis la Nouvelle Fleur.* — Un carnet de voyage à Addis-Abéba.

## Stack

- **Next.js 16** (App Router, Turbopack, export statique)
- **TypeScript**
- **Tailwind CSS v4** + `@tailwindcss/typography`
- **Markdown** (gray-matter + remark) — lettres en `.md` avec frontmatter YAML
- **Cusdis** — livre d'or / commentaires
- **Hébergement** — Vercel

## Développement local

```bash
npm install
cp .env.example .env.local   # Optionnel : pour personnaliser SITE_URL
npm run dev                   # → http://localhost:3000
```

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build statique (output → `out/`) |
| `npm run start` | Servir le build localement |
| `npm run lint` | ESLint |
| `npm run test` | Tests unitaires (Vitest) |
| `npm run photos` | Pipeline complet : sync photos/vidéos → conversion HEIC → compression → légendes |
| `npm run audit-media` | Vérifie cohérence photos/vidéos (chemins, indexation) |

## Structure du projet

```
content/letters/       → Lettres en Markdown (frontmatter YAML)
public/images/         → Photos par semaine (semaine-00/, semaine-01/, …)
  home-hero.jpg        → Image hero page d'accueil (variantes 640w, 1024w générées)
src/app/               → Pages Next.js (App Router)
src/components/       → Layout, Reading, UI, Home, Map
src/lib/               → letters, photos, themes, jardin, remarkDayHeaders
scripts/               → sync-photos-notes, optimize-photos, extract-captions
```

## Configuration

Copier `.env.example` vers `.env.local` et adapter :

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | URL publique (Vercel la définit en prod) |
| `NEXT_PUBLIC_CUSDIS_APP_ID` | ID app Cusdis (livre d'or) |

## Ajouter une nouvelle lettre

1. **Créer** `content/letters/semaine-XX.md` avec le frontmatter :
   ```yaml
   ---
   title: "Titre de la lettre"
   date: "YYYY-MM-DD"
   location: "Addis-Abeba"
   excerpt: "Une phrase d'accroche."
   heroImage: "/images/semaine-XX/photo.jpg"  # Optionnel
   ---
   ```

2. **Photos** : placer les images dans `public/images/semaine-XX/`

3. **Légendes** : exécuter `npm run photos` pour :
   - Copier les photos depuis `Semaine_XX/Photos et notes à propos de la lettre/`
   - Convertir HEIC → JPEG, optimiser (resize, compression)
   - Extraire les légendes des photos → `captions.json`

4. **Push** → déploiement automatique sur Vercel (CI : lint, test, build)

→ Détails dans `docs/PROCEDURE.md`.

## Pipeline photos (détail)

- `sync-photos-notes.js` — Copie depuis `../Semaine_XX/Photos et notes.../` vers `public/images/semaine-XX/`
- `optimize-photos.sh` — HEIC→JPEG, resize (max 2000px), compression (qualité 80), variantes hero responsive
- `extract-captions.js` — Légendes depuis les noms de fichiers des photos source

## Tests

```bash
npm run test        # Exécution une fois
npm run test:watch  # Mode watch
```

Tests unitaires : `letters.ts` (cleanMarkdown, extractPullQuote, getLetterData), `remarkDayHeaders`.

## Déploiement

- **Vercel** : connecter le repo GitHub → déploiement automatique sur push
- **CI** : `.github/workflows/ci.yml` — lint, test, build sur chaque PR/push

## Docs

- `docs/PROCEDURE.md` — ajouter une lettre
- `docs/DIRECTION-ARTISTIQUE.md` — palette, ton, piliers visuels
