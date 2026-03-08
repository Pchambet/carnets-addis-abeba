# Ajouter une nouvelle lettre

Un petit guide pour publier une lettre sur le site.

## Ce qu'il faut

- Le dossier `Semaine_XX/` (à côté du projet) avec :
  - Le texte de la lettre (DOCX ou Markdown)
  - `Photos et notes à propos de la lettre/` — photos et vidéos (mov, mp4) avec leurs noms / légendes

## Les étapes

1. **Le Markdown**
   - `content/letters/semaine-XX.md`
   - Frontmatter : title, date, location, excerpt
   - Optionnel : `heroImage` pour l'image de partage

2. **Photos et vidéos**
   ```bash
   npm run photos
   ```
   - Copie photos + vidéos (mov, mp4), convertit HEIC → JPEG, optimise, récupère les légendes

3. **Vérifier**
   ```bash
   npm run dev
   ```
   - Ouvrir `/letters/semaine-XX/` et vérifier que tout rend bien

4. **Déployer**
   ```bash
   npm run build
   git add .
   git commit -m "feat: ajout semaine-XX"
   git push
   ```

## Structurer par jour

Pour une lettre qui suit les jours de la semaine :

```markdown
**Lundi**

Contenu du lundi...

**Mardi 28 octobre ~ Description de la journée**

Contenu du mardi...
```

Ça donne des blocs visuels avec en-tête de jour.

## Citation en tête de lettre

En début de contenu :

```markdown
> PQ: Ma citation mise en avant.
```
