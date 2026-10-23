# Livre papier

Envie de Claire : réunir les lettres et les photos du blog dans un livre imprimé chez BoD (bod.fr), d'abord en quelques exemplaires pour un usage personnel (option « impression »), puis peut-être le présenter à l'Œuvre d'Orient pour une publication.

## Fabriquer le PDF

```bash
brew install typst                               # une fois
npm run book                                     # → book/build/livre.pdf (livre complet)
npm run book -- --only semaine-12,semaine-46     # échantillon de quelques lettres
npm run book -- --png                            # + une image par page dans book/build/pages/
```

`scripts/book.ts` lit les lettres (`content/letters/`) et les photos (`public/images/`) comme le site, écrit `book/build/book.json`, puis Typst compose `book/book.typ`. `book/build/` n'est pas versionné.

- **Texte** : exactement celui du site (même nettoyage, mêmes en-têtes de jours, citations mises en avant retirées). Seule la typographie d'imprimerie s'ajoute (`bookTypography` dans `scripts/book-data.ts`) : espaces fines insécables, apostrophes et points de suspension typographiques, tiret de dialogue. Aucun mot ne change. Une correction de lettre se fait donc dans `content/letters/` et vaut pour le site et le livre.
- **Introduction** : `book/introduction.md`, texte de Claire.
- **Photos** : la photo d'ouverture (`heroImage`) en tête de lettre, pleine largeur ; les autres en grille après le texte, sans recadrage, avec leurs légendes. Toutes par défaut ; pour en choisir et les ordonner, `book/photos.json` :
  ```json
  { "semaine-12": ["Bain de soleil en attendant le café.jpg", "IMG_1810.JPG"] }
  ```
- **Mise en page** : géométrie (marges, grille, ouverture) dans `scripts/book.ts`, lue par `book/book.typ` ; couleurs et polices du site (Cormorant Garamond pour les titres, EB Garamond pour le texte — Lora, faite pour l'écran, est remplacée à l'impression).

## Réglages BoD choisis par Claire

21 × 21 cm, couverture dure, pelliculage mat, papier photo mat, dos rond, reliure cousue.

Fichier intérieur (« corps de livre avec fond perdu ») : pages de 220 × 220 mm, c'est-à-dire 210 mm plus 5 mm de fond perdu de chaque côté (valeur BoD vérifiée sur blog.bod.fr), sans traits de coupe, polices incorporées, nombre de pages pair (le gabarit ajoute un verso orné si besoin). Texte et photos restent à au moins 22 mm du bord de coupe.

## Reste à faire

- **Choix de Claire** : titre et sous-titre (provisoires : nom du site), sélection des photos, phrase incomplète de l'introduction (« En Éthipagnes… », marquée en gras dans le PDF), mentions légales (relecture, correction ; dépôt légal seulement en cas de publication).
- **Couverture** : un PDF à part (1re, dos, 4e de couverture), dont la largeur dépend du nombre de pages et du papier : dimensions à prendre dans le calculateur de couverture de BoD une fois le nombre de pages connu.
- **À vérifier dans le configurateur BoD** (le site n'a pas pu être consulté depuis le terminal) : nombre de pages maximal en couverture dure sur papier photo, prix selon le nombre de pages, exigences PDF (PDF/X, profil couleur : les photos sont en RVB).
- **Résolution** : les photos du site font au plus 2000 px de large : environ 240 dpi pour une ouverture pleine largeur, 300 dpi ou plus dans les grilles (sauf une vingtaine de petites images). Pour les ouvertures, les originaux (`../Semaine_XX`) seraient plus fins.

## Polices (`book/fonts/`)

Licence SIL Open Font License (fichiers `OFL-*.txt`). Fichiers statiques téléchargés depuis Fontsource (jsDelivr), jeux latin, éthiopien ou emoji : EB Garamond 400, 400 italique, 600 ; Cormorant Garamond 300, 400, 400 italique ; Noto Serif Ethiopic ; Noto Emoji (un émoji dans les lettres) ; Sacramento (signature).
