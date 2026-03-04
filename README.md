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
```

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
