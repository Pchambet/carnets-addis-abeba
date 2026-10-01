# Carnets d'Addis-Abeba

> *Nouvelles hebdomadaires depuis la Nouvelle Fleur.* — Les lettres de Claire depuis Addis-Abéba.

https://carnets-addis-abeba.vercel.app

## Stack

- **Next.js 16** (App Router, pages générées au build), **TypeScript**, **Tailwind CSS 4**
- **Markdown** (gray-matter + remark) — une lettre = `content/letters/semaine-XX.md`
- **Supabase** — livre d'or ; **Resend** — email à Claire pour chaque message
- **Vercel** — hébergement, déployé à chaque push sur `main`

## Développement

```bash
npm install
cp .env.example .env.local   # puis renseigner les valeurs
npm run dev                  # http://localhost:3000
```

| Commande | Rôle |
|---|---|
| `npm run dev` / `build` / `start` | Next.js |
| `npm run lint`, `npm test` | ESLint, Vitest (code + cohérence du contenu) |
| `npm run add-letter -- "<dossier source>" semaine-XX` | Importe photos, vidéos et texte d'une lettre |
| `npm run media` | Crée miniatures et affiches manquantes |

Définition de fini : `npm run lint && npm test && npm run build` (c'est aussi la CI GitHub).

## Structure

```
content/letters/          lettres Markdown (frontmatter YAML)
content/letter-themes.json        lettre → thèmes du Jardin
content/parcours-initiatique.json questions du Jardin par thème
public/images/semaine-XX/ photos (+ -thumb), vidéos (+ -poster), captions.json
src/app/                  pages : accueil, lettres, galerie, jardin, carte, à propos ; api/comment-notify, api/keep-alive
src/lib/                  lettres, photos, jardin, thèmes, lieux de la carte
scripts/media.mjs         import et dérivés des médias
supabase/migrations/      schéma et règles du livre d'or
```

## Déploiement

`git push` sur `main` → Vercel (projet `carnets-addis-abeba`) build et met en ligne. La CI (`.github/workflows/ci.yml`) vérifie en parallèle mais ne bloque pas Vercel.

Variables d'environnement : voir `.env.example` et `docs/SUPABASE-LIVRE-OR.md`.

## Docs

- `docs/PROCEDURE.md` — ajouter une lettre
- `docs/REGLE_DE_TRANSCRIPTION.md` — fidélité au texte de Claire
- `docs/SUPABASE-LIVRE-OR.md` — livre d'or et notifications
- `docs/DIRECTION-ARTISTIQUE.md` — palette, ton, piliers visuels
- `docs/PLAN.md` — plan d'amélioration (octobre 2026)
