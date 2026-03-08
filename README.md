# Carnets d'Addis-Abeba

> *Nouvelles hebdomadaires depuis la nouvelle fleur.* — Lettres de Claire depuis Addis-Abeba.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **TypeScript** 
- **Tailwind CSS v4** + `@tailwindcss/typography`
- **Markdown** (gray-matter + remark) — letters as `.md` files with YAML frontmatter
- Hosted on **Vercel**

## 3 Design Pillars

| Pilier | Intention |
|--------|-----------|
| 🕊️ Spirituel | Lenteur, typographie aérée (Cormorant + Lora), espaces blancs |
| 🌍 Culturel | Couleurs éthiopiennes, motifs Tibeb, invite contemplative |
| 🤝 Solidaire | Galerie photo, carte des enfants, "Écrire à Claire" |

## Structure

```
content/letters/   → Lettres en Markdown (frontmatter YAML)
public/images/     → Photos organisées par semaine
src/app/           → Pages Next.js (App Router)
src/components/    → Layout/, Reading/, UI/
src/lib/           → Markdown parser
```

## Développement local

```bash
npm install
npm run dev      # → http://localhost:3000
npm run lint    # → ESLint
```

## Configuration optionnelle

Créer `.env.local` si besoin (ex. autre domaine) :
```
NEXT_PUBLIC_SITE_URL=https://carnets-addis-abeba.vercel.app
```
Voir `.env.example`.

## Ajouter une lettre

1. Créer `content/letters/semaine-XX.md` avec le frontmatter suivant :
```yaml
---
title: "Titre de la lettre"
date: "YYYY-MM-DD"
location: "Addis-Abeba"
excerpt: "Une phrase d'accroche courte."
---
```
2. Ajouter les photos dans `public/images/semaine-XX/`
3. `git push` → déploiement automatique sur Vercel

## Scripts (dans `scripts/`)

À exécuter depuis la racine du projet (`carnets-addis-abeba/`). Les DOCX doivent être dans le dossier parent (`Claire&Pierre/Semaine_XX/`).

- `node scripts/sync-docx.js` — Restaure le contenu MD depuis les DOCX (fidélité stricte)
- `node scripts/compare-docx.js` — Compare nombre de mots DOCX vs MD
- `node scripts/debug-diff.js` — Exporte txt pour debug (semaine-00, 01, 12)
