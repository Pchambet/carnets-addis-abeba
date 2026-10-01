# Plan d'amélioration — Carnets d'Addis-Abeba

> Diagnostic du 2026-10-01. Chaque constat ci-dessous a été vérifié (commande, prod, ou lecture du code) sauf mention contraire.

## Avancement (2026-10-01)

Décisions de Pierre : pas de YouTube (le « cassé » était la CI) ; Supabase gratuit conservé ; **repo public conservé** (donc pas de vrai mot de passe serveur : le code d'accès reste un simple filtre) ; historique git conservé tel quel (rien perdu).

| Phase | État |
|---|---|
| 0 — CI au vert | ✅ lint corrigé, Node 24, actions v7, `CLAUDE.md` |
| 1 — Livre d'or | ✅ Supabase restauré, migration 004 appliquée, webhook corrigé, cron keep-alive. ⏳ Reste à vérifier : réception réelle de l'email par Claire (secret et expéditeur Resend non vérifiables sans envoyer un vrai message) |
| 2 — Vie privée | ✅ réduit au choix « repo public » : `noindex`, sitemap supprimé, email de Claire retiré de `.env.example`, `.docx` retiré de `public/` |
| 3 — Simplifier | ✅ 7 dépendances, Cusdis, scripts et fichiers morts, 3 branches fusionnées supprimés |
| 4 — Ajout d'une lettre | ✅ `npm run add-letter` / `npm run media` (`scripts/media.mjs`) + tests de cohérence du contenu |
| 5 — Contenu | ✅ 4 lieux ajoutés à la carte ; thèmes du Jardin pour 22 → 44 (validés par Pierre) ; parcours initiatique étendu à toutes les lettres (27 questions), vérifié par les tests |
| 6 — Performance | ✅ 136 miniatures manquantes, 17 affiches vidéo, 1 MP4 rendu lisible en streaming. Galerie mesurée : déjà chargée à la demande (10 images au premier affichage) → inchangée |
| 7 — Historique git | ⏭️ conservé (option C) ; il ne grossit plus inutilement (plus de recompression en boucle) |
| 8 — Documentation | ✅ README, `PROCEDURE.md`, `SUPABASE-LIVRE-OR.md` |
| 9 — Design (revue UI/UX) | ✅ menu mobile (débordait), grille commune (en-tête, titres, pied de page), accueil avec photo et semaine en amharique par lettre, lettre précédente/suivante, carte cadrée sur tous les lieux, sommaire de la galerie, contrastes et noms accessibles (axe en prod, mobile : 0 violation sur les 8 écrans), typographie française dans le Jardin |

## Ce qu'est le projet

Site Next.js 16 (App Router, Tailwind 4) qui publie les lettres hebdomadaires de Claire depuis Addis-Abeba : 37 lettres Markdown (`content/letters/`), ~800 photos et 17 vidéos (`public/images/semaine-XX/`), galerie, carte (Leaflet), « Jardin » thématique, livre d'or (Supabase + email Resend).

**Chaîne de mise en ligne** : `git push` sur `main` → GitHub (`Pchambet/carnets-addis-abeba`) → Vercel (projet `carnets-addis-abeba`, équipe `pierre-chambets-projects`) build et déploie automatiquement sur `carnets-addis-abeba.vercel.app`. En parallèle, GitHub Actions (`.github/workflows/ci.yml`) lance lint → tests → build. **Vercel ne dépend pas de la CI** : il déploie même quand la CI échoue.

Sources : les dossiers `../Semaine_XX`, `../Semaine 41 à 43`, etc. (docx + photos/vidéos brutes).

## Ce qui est cassé (constaté)

| # | Problème | Preuve | Cause |
|---|----------|--------|-------|
| 1 | **CI GitHub rouge depuis le 21 juillet** (23 pushs d'affilée) | `gh run list` : dernier vert `35de69a` | `9cc3985` (blur-up) introduit un `as any` (`src/lib/letters.ts:94`) ; puis `LightboxGallery.tsx` (6 `any`) et `InteractiveJourney.tsx:53` (apostrophes). 12 erreurs ESLint → la CI s'arrête au lint, tests et build ne tournent plus. Invisible car Vercel déploie quand même. |
| 2 | **Livre d'or hors service en prod** | Console : `ERR_NAME_NOT_RESOLVED` sur `vizvhqnjvynjinoxwqry.supabase.co` ; Supabase : projet `INACTIVE` | Projet Supabase gratuit mis en pause pour inactivité. Les commentaires ne s'affichent plus et ne peuvent plus être postés. |
| 3 | **Notifications email à Claire probablement jamais envoyées** | `POST /api/comment-notify` → `308` vers `/api/comment-notify/` | `trailingSlash: true` + le trigger SQL appelle l'URL sans slash ; pg_net ne suit pas la redirection. Expéditeur par défaut `onboarding@resend.dev` (ne livre qu'au propriétaire du compte Resend). |
| 4 | **Vie privée : rien n'est réellement protégé** | Repo GitHub **PUBLIC** (2,2 Go, toutes les photos) ; texte des lettres présent dans le HTML sans code (`curl …/letters/semaine-31/`) ; `/images/**` en accès libre ; code d'accès `NEXT_PUBLIC_` dans le bundle JS, contournable via `sessionStorage` | Le `PasswordGate` est purement côté client. Sitemap public, pas de `robots`/`noindex`, balises OpenGraph avec extraits. Email de Claire dans `.env.example` (commité). Un `.docx` traîne dans `public/images/semaine-27/`. |
| 5 | **Livre d'or : failles de la base** | Lecture de `supabase/migrations/001_comments.sql` (règles en prod non vérifiées : projet en pause) | Insertion `WITH CHECK (true)` : n'importe qui peut poster en tant que Claire (`is_claire: true`). Lecture de toutes les colonnes → emails des commentateurs lisibles avec la clé anon. Aucun anti-spam, pas de limite de longueur, secret du webhook optionnel. |
| 6 | **Contenu non relié** | Lecture de `content/*.json`, `src/lib/map-locations.ts` | Lettres 22 → 44 absentes du Jardin (`letter-themes.json`) ; parcours initiatique s'arrête à 18 ; 4 lieux inconnus de la carte (Arba-Minch, Hawassa & Miki, Mont Hambaricho, Addis-Abeba & Shishinda) → lettres 37-38 à 44 absentes de la carte, silencieusement. |

**YouTube** : aucune intégration YouTube n'existe ni n'a jamais existé dans le repo (`git log --all -S youtube` vide). Les 17 vidéos sont des MP4 H.264 servis par Vercel ; testées en prod (semaine 24 : 3/3 lisibles). Le « cassé » le plus probable est l'**intégration continue sur GitHub** (#1). À confirmer.

## Plan d'implémentation

Ordre = urgence × simplicité. Chaque phase se termine par la définition de fini : `npm run lint && npm test && npm run build` vert + vérification en prod.

### Phase 0 — Remettre la CI au vert (≈ 30 min)
1. Typer proprement `letters.ts:94` et `LightboxGallery.tsx` (types `react-photo-album` / `yet-another-react-lightbox`), échapper les apostrophes de `InteractiveJourney.tsx`, retirer les imports morts (warnings).
2. CI : Node 20 → 22, `actions/checkout@v5` / `setup-node@v5` (Node 20 déprécié sur les runners).
3. Vérifier que `npm run build` passe sans variables Supabase (`createClient(undefined!)` dans `src/lib/supabase.ts`) — sinon garde-fou.
4. Créer le `CLAUDE.md` du projet (absent) : stack, chaîne de déploiement, définition de fini, règle de transcription (`.cursorrules`).

### Phase 1 — Réparer le livre d'or (≈ 1 h, décision : garder Supabase)
1. **Restaurer** le projet Supabase (Dashboard ou MCP) — *action sur un service externe, à valider*. Le palier gratuit ne garde un projet en pause restaurable qu'un temps limité : à faire vite.
2. **Empêcher la remise en pause** : cron Vercel quotidien (`vercel.json`) qui fait une lecture légère.
3. **Sécuriser les règles** (nouvelle migration `004_…sql`) : insertion forcée `is_claire = false`, `approved` non modifiable, longueur max auteur/texte, `letter_id` validé ; lecture sans la colonne `email` (vue ou `GRANT` par colonne) ; réponses de Claire via la clé service côté serveur uniquement.
4. **Notifications** : URL du trigger avec slash final (ou exclure `/api` du `trailingSlash`), secret webhook obligatoire, expéditeur Resend sur un domaine vérifié (ou `RESEND_FROM`), route allégée (ne plus importer `letters.ts` → `sharp`/`remark` dans la fonction serverless).
5. Preuve : poster un commentaire test en prod, le voir affiché, recevoir l'email, puis le supprimer.

### Phase 2 — Vie privée réelle (≈ 2 h, décisions requises)
1. **Repo GitHub en privé** (Vercel Hobby le supporte) — *à valider*.
2. **Vrai mot de passe côté serveur** : `src/proxy.ts` (middleware Next 16) qui vérifie un cookie `HttpOnly` signé, avec un matcher couvrant les pages **et** `/images/**` ; mot de passe dans une variable serveur (`SITE_PASSWORD`, plus de `NEXT_PUBLIC_`) ; page `/acces` qui pose le cookie. Supprime le `PasswordGate` client (et son écran « Chargement… » qui retarde l'affichage).
3. `robots: { index: false }` global, suppression de `sitemap.ts`, métadonnées OG neutres (pas d'extrait de lettre).
4. Retirer l'email de Claire de `.env.example`, le `.docx` de `public/`.
5. Preuve : `curl` d'une lettre et d'une image sans cookie → redirection ; avec cookie → 200.

### Phase 3 — Simplifier (≈ 2 h)
1. **Dépendances mortes** : `lucide-react`, `@tabler/icons-react`, `framer-motion`, `clsx`, `tailwind-merge`, `react-leaflet`, `react-cusdis` (+ son `overrides`), `date-fns` (→ `Intl.RelativeTimeFormat`) ; `@types/leaflet` en dev ; `sharp` en dépendance (utilisé par `blur.ts`).
2. **Code mort** : `Comments.tsx` (Cusdis), types `Photo`/`Video` dupliqués, double logique de chargement dans `CommentSection.tsx`, SVG par défaut de Next.
3. **Fichiers parasites** : `temp_gallery.html`, `scripts/*.txt`, scripts ponctuels (`sync-docx`, `compare-docx`, `debug-diff`, `restore-pq`, `audit-content`), `optimize-images.js` (doublon de `optimize-photos.sh`), dossier local `out/` (240 Mo), branches mergées `dev-pro`, `feat/content-robust`, `feat/lightbox-gallery`.
4. Bugs mineurs : `letters.ts` (le frontmatter écrase les champs calculés ; deux calculs différents du temps de lecture), `dynamicParams = false` sur `/letters/[id]`, liens internes sans slash final (redirections inutiles).

### Phase 4 — Un seul outil pour ajouter une lettre (≈ 3 h)
Aujourd'hui `npm run photos` ne connaît que les semaines 0 → 21 ; tout ce qui suit est fait à la main, et chaque passage recompresse **toutes** les images (668 fichiers réécrits au dernier commit → historique gonflé).
1. `npm run add-letter -- "<dossier source>" semaine-XX` : copie, HEIC → JPEG, redimensionnement 2000 px, miniature 600 px, `.MOV` → MP4 H.264 720p + affiche (ffmpeg), légendes — **uniquement sur les nouveaux fichiers**, noms avec espaces gérés (bug `eval` de `optimize-photos.sh` : 115 photos sans miniature).
2. Squelette `content/letters/semaine-XX.md` (la transcription reste manuelle et fidèle, cf. `docs/REGLE_DE_TRANSCRIPTION.md`).
3. **Test de cohérence en CI** (étendre `audit-media.js` en test Vitest) : chaque lettre a un thème du Jardin, un lieu connu de la carte, une image hero existante, des médias tous référencés. Fini les oublis silencieux (#6).

### Phase 5 — Compléter le contenu (avec Claire)
1. Thèmes du Jardin pour les lettres 22 → 44, suite du parcours initiatique — *choix éditorial de Claire*.
2. Coordonnées des 4 lieux manquants dans `map-locations.ts` (doublon « Addis-Abeba » / « Addis-Abéba » à normaliser).

### Phase 6 — Performance (≈ 2 h, à mesurer avant/après avec `/perf-audit`)
1. Miniatures manquantes (~138 photos), hero redimensionnés (jusqu'à 1 Mo aujourd'hui), variantes `home-hero-640/1024` réellement utilisées.
2. `/galerie` : ~800 photos et 800 placeholders base64 sur une seule page (≈ 1 Mo de HTML + données) → regroupement par lettre avec chargement à la demande.
3. Vidéos : recompression des 8 fichiers > 5 Mo (jusqu'à 20 Mo), attribut `poster`.

### Phase 7 — Optionnel : alléger l'historique git (décision)
`.git` = 2,1 Go, dont ~1,7 Go de versions recompressées d'images et 236 Mo de `.MOV` supprimés. Option A : `git filter-repo` + push forcé sur `main` (bloqué par le garde : décision et opération manuelles). Option B : repartir d'un repo neuf privé à partir de l'état actuel et rebrancher Vercel. Option C : ne rien faire (seul coût : clones lents).

### Phase 8 — Documentation
README et `docs/PROCEDURE.md` réécrits sur la réalité : Supabase (plus Cusdis), `add-letter`, fichiers à compléter, chaîne GitHub → Vercel, variables d'environnement par environnement.

## Décisions à prendre
1. YouTube : confirmer qu'il s'agit bien de l'intégration continue GitHub (sinon préciser ce qui ne marche plus).
2. Restaurer le projet Supabase maintenant ? (recommandé)
3. Passer le repo GitHub en privé ? (recommandé)
4. Historique git : A, B ou C (recommandé : B ou C).
5. Accès Vercel : le connecteur Vercel de Claude n'a pas accès à l'équipe `pierre-chambets-projects` (403) → le ré-autoriser pour vérifier variables d'environnement, logs et déploiements.
