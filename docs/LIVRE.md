# Livre papier

Envie de Claire : réunir les lettres et les photos du blog dans un livre imprimé chez BoD (bod.fr), d'abord en quelques exemplaires pour un usage personnel (option « impression »), puis peut-être le présenter à l'Œuvre d'Orient pour une publication.

## Fabriquer le PDF

```bash
brew install typst                                                  # une fois
npm run book -- --only semaine-00,semaine-01,semaine-46 --png       # livre d'essai (≈ 40 pages)
npm run book                                                        # livre complet
```

`--png` écrit en plus une image par page coupée (100 ppi) dans `book/build/pages/`, pour relire sans imprimer. `scripts/book.ts` lit les lettres (`content/letters/`) et les photos comme le site, écrit `book/build/book.json`, puis Typst compose `book/book.typ` en `book/build/livre.pdf`. `book/build/` n'est pas versionné.

- **Texte** : exactement celui du site (même nettoyage, mêmes en-têtes de jours, citations mises en avant retirées). Seule la typographie d'imprimerie s'ajoute (`bookTypography` dans `scripts/book-data.ts`, règles d'affichage dans `book.typ`) : espaces fines insécables, apostrophes et points de suspension typographiques, tiret de dialogue, « 1er » en exposant, « Addis-Abeba » jamais coupé. Aucun mot ne change : une correction de lettre se fait dans `content/letters/` et vaut pour le site et le livre.
- **Introduction** : `book/introduction.md`, texte de Claire.

## Structure

Faux-titre, page de titre, mentions légales, sommaire (2 pages dans le livre complet), introduction, page de partie « Lettres », puis les lettres. Chaque lettre s'ouvre sur une double page : la photo d'ouverture à fond perdu à gauche, le titre, la date et le début du texte à droite. Après le texte viennent ses pages de photos. Une lettre s'ouvre toujours sur une page paire : si la précédente finit sur une page paire, sa photo de réserve (`spare`), ou à défaut un losange, occupe la page intercalaire. Le livre a toujours un nombre pair de pages. Ces intercalaires se décident en deux temps (`pageFillers`) : une première mise en page, sans eux, mesure où finit chaque lettre, puis le livre est composé avec. Typst ne peut pas les décider seul, chacun dépendant du précédent.

Grille : texte en EB Garamond 11,5 pt sur un pas de 15,5 pt, bloc de 110 × 139,5 mm (26 lignes, environ 74 signes par ligne), marges 36 mm au pli et 64 mm à l'extérieur. Titres en Cormorant Garamond Light, signature en Sacramento, couleurs du site (`docs/DIRECTION-ARTISTIQUE.md`).

## Choisir et placer les photos : `book/layout.json`

Une entrée par lettre ; sans entrée, toutes les photos de la lettre sont imprimées, deux par page quand leurs orientations s'accordent (brouillon).

```json
"semaine-00": {
  "hero": "Partage.jpg", "focus": "50% 50%",
  "pages": [
    { "layout": "single", "photos": ["IMG_0929.PNG"] },
    { "layout": "pair", "photos": ["IMG_0936.PNG", "IMG_0934.PNG"] },
    { "layout": "trio", "photos": ["Rencontre avec les sœurs.jpg", "Apprivoisements.jpg", "Libertes.jpg"] }
  ],
  "spare": "IMG_0932.PNG",
  "fit": "loose"
}
```

- `hero` et `focus` : photo d'ouverture, recadrée au carré (position CSS `object-position`). Sans `hero`, celle du site (`heroImage`).
- `layout` : `full` (pleine page à fond perdu, recadrée), `single` (une photo entière ; `"size": "small"` pour un cadre de 112 mm et plus de blanc), `pair`, `trio` (photos entières, arrangées automatiquement au plus grand ; la première d'un trio est la plus grande). Les photos encadrées s'alignent en haut sur la première ligne de texte ; les légendes de Claire s'impriment dessous.
- `spare` : photo imprimée seule, uniquement si la parité l'exige.
- `fit` : `"loose"` ou `"tight"` quand la fin d'une lettre reste seule en haut d'une page (le texte s'étale ou se resserre à peine).

Le build vérifie le plan (photo introuvable, utilisée deux fois, mauvais nombre de photos) et signale :
- une photo imprimée à moins de 220 dpi ;
- une pleine page tombée à gauche au milieu d'une lettre, qui se lit comme une ouverture : changer le nombre ou l'ordre des pages pour qu'elle tombe à droite ;
- une page creuse (fin de lettre de moins de cinq lignes en haut d’une page) : essayer `fit`.

Règles d'édition apprises sur le livre d'essai :
- **Ouverture** : aucun visage à moins de 25 mm du bord côté pli (la reliure cousue en avale 8 à 12 mm), ni à moins de 12 mm du haut ou du bas. Une photo en hauteur ne se recadre au carré que vers le haut ou le bas.
- **Résolution** : un fichier de moins de 1 900 px de grand côté ne va ni en `single` grand format ni en `spare` ; en `small`, paire ou trio seulement.
- **Trio** : jamais trois photos en hauteur (deux vignettes de 50 mm) ; préférer une paire.
- **Doublons** : certaines photos existent dans deux dossiers bruts (le coucher de soleil de la semaine 0 est aussi IMG_0977 de la semaine 1). Les chercher (taille ou empreinte) avant de composer le livre complet.

## Originaux

Les photos du site sont réduites (2000 px au plus). Pour chaque photo imprimée, le script cherche l'original de Claire dans les dossiers bruts voisins (`../Semaine_XX`, `../Retour`…, en lecture seule) : même nom, sans extension ni « _ » final (« Partage_ », un HEIC, est l'original de « Partage.jpg »). Le dossier d'une lettre est celui qui contient le plus de ses photos. L'original n'est retenu que s'il est plus grand et de mêmes proportions (sinon c'est une autre retouche). Il est converti (sips pour le HEIC), redressé et réduit à 300 dpi pour sa taille imprimée, dans `book/build/originals/`.

## Réglages BoD choisis par Claire

21 × 21 cm, couverture dure, pelliculage mat, papier photo mat, dos rond, reliure cousue.

Vérifié sur blog.bod.fr (le site bod.fr refuse les connexions du terminal) :
- **Pages** : de 24 à 900 en couverture souple ou rigide ; le papier photo mat se combine avec toutes les couvertures sauf le livret.
- **Fichier intérieur** : un PDF au nombre de pages pair, sans traits de coupe, avec 5 mm de fond perdu de chaque côté. Le gabarit déclare la zone de coupe (TrimBox, `page(bleed:)` de Typst 0.15) et incorpore les polices.
- **Couleur** : laisser les images en RVB, BoD les convertit en CMJN.
- **Images** : 300 dpi recommandés.
- **Couverture** : un PDF à part (1re, dos, 4e), aux dimensions données par easyCOVER une fois le nombre de pages connu.

## Reste à faire

- **Choix de Claire** : titre et sous-titre (provisoires : nom du site), phrase incomplète de l'introduction (« En Éthipagnes… », marquée en gras), mentions légales (relecture, correction, crédit des photos ; dépôt légal et ISBN seulement en cas de publication).
- **Sélection des photos des autres lettres** dans `book/layout.json`, avec les règles ci-dessus.
- **Couverture**.
- **À vérifier dans le configurateur BoD**, dans le navigateur : nombre de pages maximal en papier photo et couverture rigide, prix, exigence éventuelle d'un PDF/X. Commander un exemplaire d'épreuve avant tout tirage.

## Polices (`book/fonts/`)

Licence SIL Open Font License (fichiers `OFL-*.txt`) :
- EB Garamond complet (Regular, Italic, SemiBold, SemiBoldItalic) depuis github.com/octaviopardo/EBGaramond12, pour les petites capitales, les chiffres elzéviriens et les exposants ;
- Cormorant Garamond complet (Light, LightItalic, Regular, Italic) depuis github.com/CatharsisFonts/Cormorant ;
- depuis Fontsource (jsDelivr) : Noto Serif Ethiopic, Noto Emoji (un émoji dans les lettres) et Sacramento (signature).
