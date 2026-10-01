# Ajouter une nouvelle lettre

## Ce qu'il faut

Un dossier source à côté du projet (`../`), quel que soit son nom (`Semaine_12`, `Semaine 41 à 43`, `Avant dernière lettre `…), contenant :
- le `.docx` de la lettre ;
- les photos (JPG, PNG, HEIC) et vidéos (MOV, MP4), éventuellement dans des sous-dossiers. **Le nom de fichier donné par Claire devient la légende** (les noms d'appareil comme `IMG_1234` n'en donnent pas).

## Les étapes

1. **Importer**
   ```bash
   npm run add-letter -- "Semaine 45" semaine-45
   ```
   - Photos : HEIC → JPEG, 2000 px max, miniature 600 px ; vidéos : MP4 H.264 (1920 px max) + affiche ; légendes dans `captions.json`.
   - Crée `content/letters/semaine-45.md` avec le texte **brut** du docx si la lettre n'existe pas encore.
   - Relançable sans risque : ce qui existe déjà n'est jamais réécrit.

2. **La lettre** — `content/letters/semaine-45.md`
   - **⚠️ RÈGLE D'OR :** fidélité ABSOLUE au docx (voir `docs/REGLE_DE_TRANSCRIPTION.md`). Le texte brut a perdu gras et italiques : les remettre à l'identique, puis supprimer le commentaire `<!-- … -->`.
   - Frontmatter : `title`, `date` (AAAA-MM-JJ), `location`, `excerpt`, et optionnellement `heroImage` (`/images/semaine-45/…`) et `heroPosition` (`top`, `center 30%`…).
   - `location` : un ou plusieurs lieux séparés par `&` (ex. `Hawassa & Miki`), chacun présent dans `src/lib/map-locations.ts`.

3. **Le Jardin** — ajouter la lettre dans `content/letter-themes.json` (1 à 3 thèmes de `src/lib/themes.ts`).

4. **Vérifier**
   ```bash
   npm test          # contrôle : frontmatter, lieux de la carte, image hero, thèmes, fichiers parasites
   npm run dev       # ouvrir http://localhost:3000/letters/semaine-45/
   ```

5. **Publier**
   ```bash
   npm run lint && npm test && npm run build
   git add -A && git commit -m "Ajout de la semaine 45" && git push
   ```
   Vercel déploie automatiquement (il n'attend pas la CI : vérifier avant de pousser).

## Médias existants

`npm run media` crée ce qui manque pour toutes les lettres (miniatures, affiches vidéo, MP4 en streaming). À lancer après avoir déposé des fichiers à la main dans `public/images/`.

## Structurer par jour

```markdown
**Lundi**

Contenu du lundi...

**Mardi 28 octobre ~ Description de la journée**

Contenu du mardi...
```

Ça donne des blocs visuels avec en-tête de jour.

## Citation en tête de lettre

```markdown
> PQ: Ma citation mise en avant.
```
