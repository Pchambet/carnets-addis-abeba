# Carnets d'Addis-Abeba

Site des lettres hebdomadaires de Claire depuis Addis-Abeba : Next.js 16 (App Router), TypeScript, Tailwind 4. Lettres en Markdown (`content/letters/semaine-XX.md`), médias dans `public/images/semaine-XX/`, livre d'or Supabase + notification email Resend.

## Déploiement
- `git push` sur `main` → Vercel (projet `carnets-addis-abeba`, équipe `pierre-chambets-projects`, Node 24) déploie en production sur https://carnets-addis-abeba.vercel.app.
- **Vercel n'attend pas la CI** : un push rouge part quand même en prod. Vérifier la définition de fini avant de pousser.
- Repo GitHub **public** (choix assumé) : aucun secret dans le code, `.env.local` n'est jamais commité.

## Définition de fini
```bash
npm run lint && npm test && npm run build
```
CI : `.github/workflows/ci.yml` (mêmes commandes, sans variables d'environnement : le build doit passer sans Supabase).

## Règles
- **Transcription des lettres** : fidélité absolue au `.docx` de Claire, mot pour mot — lire `docs/REGLE_DE_TRANSCRIPTION.md` avant toute modification de `content/letters/`.
- Sources brutes (docx, photos, vidéos) : dossiers voisins `../Semaine_XX`, `../Semaine 41 à 43`, etc. Ne jamais les modifier.
- Ajouter une lettre : `docs/PROCEDURE.md`.
- Plan d'amélioration en cours : `docs/PLAN.md`.
