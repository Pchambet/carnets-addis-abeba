// Livre papier des lettres de Claire — 21 × 21 cm, couverture rigide, papier photo mat (BoD).
// Données : build/book.json, écrit par `npm run book` (scripts/book.ts). Mesures en mm depuis la coupe ;
// le fond perdu (`bleed`) déborde de 5 mm tout autour et le PDF déclare la zone de coupe (TrimBox).
//
// Chaque lettre s'ouvre sur une double page : la photo d'ouverture à fond perdu à gauche, le titre
// et le début du texte à droite. Après le texte, les pages de photos choisies (book/layout.json).

#let data = json("build/book.json")
#let g = data.geometry
#let mm(x) = x * 1mm
#let trim = mm(g.trim)
#let full = mm(g.trim + 2 * g.bleed)

// À choisir avec Claire : titre (en lignes coupées selon le sens), sous-titre, mentions
#let title-lines = ("La Parenthèse", "du dimanche soir")
#let title = title-lines.join(" ")
#let subtitle = "Lettres d’Addis-Abeba"
#let author = "Claire Stellio"
#let year = "2026"

#let ink = rgb("#2C2218")
#let ink-light = rgb("#5A5048")
#let ochre = rgb("#8F5229")
#let gold = rgb("#C9A84C")
#let display = "Cormorant Garamond"

#let margins(m) = (inside: mm(m.inside), outside: mm(m.outside), top: mm(m.top), bottom: mm(m.bottom))

// Folio (numéro de page) : sur les pages de texte à partir de l'introduction, sauf les pages de
// titre (repère <no-folio>). Les pages de photos n'en ont pas.
#let folio = state("folio", false)

#set document(title: title, author: author)
#set page(
  width: trim,
  height: trim,
  bleed: mm(g.bleed),
  margin: margins(g.text),
  binding: left,
  footer-descent: 8.5mm,
  footer: context {
    let n = here().page()
    // Page blanche ajoutée entre l'introduction et la page de partie : sans folio non plus
    let blank = query(<intro-end>).any(m => m.location().page() < n) and query(<part>).any(m => n < m.location().page())
    if folio.get() and not blank and query(<no-folio>).all(m => m.location().page() != n) {
      set text(size: 9pt, fill: ink-light)
      align(if calc.odd(n) { right } else { left }, str(n))
    }
  },
)
// Grille : corps 11,5 pt sur un pas de 15,5 pt. Typst compte l'interligne de la hauteur des capitales
// (0,65 em chez EB Garamond) jusqu'à la ligne suivante : tous les blancs sont des lignes entières.
#let size = 11.5pt
#let pitch = 15.5pt
#let cap = 0.65 * size
#let lead = pitch - cap
#let blank = lead + pitch

#set text(
  font: ("EB Garamond", "Noto Serif Ethiopic", "Noto Emoji"),
  size: size,
  fill: ink,
  lang: "fr",
  region: "FR",
  hyphenate: true,
  number-type: "old-style",
  // Chiffres proportionnels : en tabulaire, le « 1 » étroit laisse un trou (« 11 » se lit « II »)
  number-width: "proportional",
  costs: (widow: 100%, orphan: 100%, hyphenation: 40%, runt: 300%),
)
#set par(
  justify: true,
  leading: lead,
  spacing: lead,
  // Usage français : alinéa à tous les paragraphes, le premier compris
  first-line-indent: (amount: 1.2em, all: true),
  justification-limits: (spacing: (min: 85%, max: 120%), tracking: (min: -0.012em, max: 0.012em)),
)
#set strong(delta: 200)
// Sans changer un mot : « 1er » en exposant, « Addis-Abeba » jamais coupé à son trait d'union
#show regex("\b1er\b"): [1#super[er]]
#show "Addis-Abeba": "Addis\u{2011}Abeba"

// Texte sans alinéa : titres, dates, légendes, pages composées
#let flush(body) = { set par(first-line-indent: 0pt); body }

// Losange du motif tibeb (comme l'icône du site)
#let diamond(size: 6pt) = box(height: size * 1.42, align(horizon, rotate(45deg, rect(
  width: size, height: size, fill: ochre, inset: 0pt,
  align(center + horizon, rect(width: size * 0.38, height: size * 0.38, fill: gold)),
))))

#let inl(nodes) = for n in nodes {
  if n.t == "text" { n.v } else if n.t == "em" { emph(inl(n.c)) } else if n.t == "strong" { strong(inl(n.c)) }
}

#let day(b) = block(above: blank, below: lead, sticky: true, flush({
  text(fill: ochre, tracking: 0.06em, smallcaps(all: true, b.name))
  if "date" in b { h(0.5em); text(style: "italic", fill: ink-light, b.date) }
  if "desc" in b { linebreak(); text(style: "italic", fill: ink-light, b.desc) }
}))

#let signature(b) = block(above: blank, width: 100%, align(right, text(font: "Sacramento", size: 26pt, fill: ink, b.v)))

#let body(blocks) = for (i, b) in blocks.enumerate() {
  let next = blocks.at(i + 1, default: none)
  if b.t == "p" and next != none and next.t == "sign" {
    // La signature ne part jamais seule : la fin de la formule qui la précède reste avec elle
    block(sticky: true, par(inl(b.c)))
    signature(next)
  }
  else if b.t == "p" { par(inl(b.c)) }
  else if b.t == "day" { day(b) }
  else if b.t == "break" { block(above: blank, below: blank, width: 100%, align(center, box(height: cap, align(horizon, diamond())))) }
  else if b.t == "sign" and (i == 0 or blocks.at(i - 1).t != "p") { signature(b) }
}

#let title-style(body) = text(font: display, size: 30pt, weight: 300, fill: ink, hyphenate: false, body)
#show heading.where(level: 1): it => block(below: 0pt, flush({
  set par(justify: false, leading: 0.35em)
  title-style(it.body)
}))

// Titre trop long pour une ligne : coupé entre les mots là où les deux lignes sont le plus égales
#let balanced(title) = context {
  let width = mm(g.trim - g.text.inside - g.text.outside)
  let words = title.split(" ")
  if measure(title-style(title)).width <= width or words.len() < 2 { return title }
  let cut = range(1, words.len()).sorted(key: i => calc.max(
    measure(title-style(words.slice(0, i).join(" "))).width,
    measure(title-style(words.slice(i).join(" "))).width,
  ).pt()).first()
  [#words.slice(0, cut).join(" ")#linebreak()#words.slice(cut).join(" ")]
}

// ——— Pages de photos (positions calculées par scripts/book.ts) ———

// Une photo à fond perdu, recadrée sur toute la page, fond perdu compris. `letter` : pleine page
// d'une section de photos (pas une ouverture), repérée pour vérifier qu'elle tombe à droite.
#let bleed-page(p, marker: none, letter: none) = page(margin: 0pt, footer: none, {
  place(top + left, dx: -mm(g.bleed), dy: -mm(g.bleed), box(width: full, height: full, clip: true,
    move(dx: mm(p.dx), dy: mm(p.dy), image(p.src, format: p.format, width: mm(p.w), height: mm(p.h)))))
  if letter != none { context [#metadata((letter: letter, page: here().page())) <full-page>] }
  marker
})

// Photos entières sur fond blanc, légende sous chaque image
#let framed-page(p, marker: none) = page(margin: 0pt, footer: none, flush({
  for c in p.cells {
    place(top + left, dx: mm(c.x), dy: mm(c.y),
      image(c.src, format: c.format, width: mm(c.w), height: mm(c.h)))
    if "caption" in c {
      place(top + left, dx: mm(c.x), dy: mm(c.y + c.h + g.caption.gap), block(width: mm(c.w),
        par(justify: false, leading: 0.45em,
          text(size: 7.5pt, style: "italic", fill: ink-light, hyphenate: false, c.caption))))
    }
  }
  marker
}))

#let photo-page(p, marker: none, letter: none) = if p.t == "full" {
  bleed-page(p, marker: marker, letter: letter)
} else { framed-page(p, marker: marker) }

#let ornament-page(marker: none) = page(footer: none, { align(center + horizon, diamond(size: 7pt)); marker })

// Page intercalaire, quand la parité l'exige (scripts/book.ts : pageFillers) : la photo de réserve
// de la lettre précédente, ou à défaut un losange
#let interleaf(previous) = if previous != none and "spare" in previous { photo-page(previous.spare) } else { ornament-page() }

// ——— Lettres ———

// Repère et titre calés en bas d'un bloc fixe : la date tombe toujours sur la ligne g.opener.line
// de la grille et le texte deux lignes plus bas, quelle que soit la longueur du titre.
#let opener(kicker, name, dateline, line: g.opener.line) = {
  [#metadata(none) <no-folio>]
  block(height: cap + (line - 2) * pitch, below: 0pt, width: 100%, align(bottom, flush({
    kicker
    v(3mm)
    name
    v(2.5mm)
  })))
  block(above: lead, below: blank, height: cap, width: 100%, flush(
    align(right, text(style: "italic", fill: ink-light, dateline)),
  ))
}

#let letter(l) = {
  if "hero" in l { bleed-page(l.hero) } else { pagebreak(weak: true) }
  opener(
    [#text(font: "Noto Serif Ethiopic", size: 8.5pt, fill: ochre)[ሳምንት]#h(2mm)#text(font: display, size: 14pt, fill: ochre, number-type: "lining", l.week)],
    [#heading(level: 1, balanced(l.title))#label(l.id)],
    l.dateline,
  )
  {
    // « fit » (book/layout.json) : texte un rien plus serré (« tight ») pour remonter une fin de lettre
    // restée seule en haut d'une page, ou plus lâche (« loose ») pour lui donner quelques lignes de plus
    let fit = l.at("fit", default: none)
    set text(tracking: -0.006em) if fit == "tight"
    set text(tracking: 0.006em) if fit == "loose"
    body(l.blocks)
  }
  // Cul-de-lampe : une lettre sans signature finit sur le losange
  if l.blocks.len() > 0 and l.blocks.last().t != "sign" { block(above: blank + pitch, width: 100%, align(center, diamond())) }
  // Fin du texte, pour repérer une page de fin presque vide (scripts/book.ts)
  context [#metadata((letter: l.id, page: here().page(), y: here().position().y / 1mm, opener: locate(label(l.id)).page())) <text-end>]
  let end = [#metadata(l.id) <letter-end>]
  if l.pages.len() == 0 { end }
  for (i, p) in l.pages.enumerate() { photo-page(p, marker: if i == l.pages.len() - 1 { end }, letter: l.id) }
}

// ——— Pages liminaires (comptées, sans folio) ———

// Centré sur la page (marges égales), pas sur le bloc de texte
#let centered(content) = page(footer: none, margin: mm(30), align(center + horizon, flush(content)))

#centered(text(font: display, size: 18pt, weight: 300, title))
#page(footer: none)[]
#centered({
  text(font: display, size: 30pt, weight: 300, par(justify: false, leading: 0.35em, title-lines.join(linebreak())))
  v(5mm)
  text(font: display, size: 15pt, style: "italic", fill: ink-light, subtitle)
  v(16mm)
  diamond(size: 7pt)
  v(16mm)
  text(size: 10.5pt, tracking: 0.12em, smallcaps(all: true, author))
})
#page(footer: none, flush({
  set text(size: 7.5pt, fill: ink-light, hyphenate: false)
  set par(justify: false, leading: 0.5em, spacing: 1.2em)
  align(bottom, block(width: 100%)[
    En application de l’art. L.137-2.-I. du code de la propriété intellectuelle, toute reproduction et/ou divulgation de parties de l’œuvre dépassant le volume prévu par la loi est expressément interdite.

    © #year, #author

    Édition : BoD · Books on Demand, 31 avenue Saint-Rémy, 57600 Forbach, bod\@bod.fr \
    Impression : Libri Plureos GmbH, Friedensallee 273, 22763 Hambourg (Allemagne)
  ])
}))

// Sommaire (pages 5 et 6 dans le livre complet) : numéros reliés aux titres par des points de conduite
#page(footer: none, flush({
  block(height: cap + 3 * pitch, below: blank, width: 100%, align(bottom, text(font: display, size: 30pt, weight: 300)[Sommaire]))
  set par(justify: false)
  let entry(kicker, name, target) = context {
    let at = locate(target)
    block(above: lead, below: lead, grid(
      columns: (10mm, 1fr, 8mm),
      align: (left + bottom, left + bottom, right + bottom),
      kicker,
      [#link(at, name)#h(2mm)#box(width: 1fr, text(fill: ink-light, repeat(gap: 1.2mm)[.]))],
      text(fill: ink-light, str(at.page())),
    ))
  }
  entry(box(height: cap, align(horizon, diamond(size: 5pt))), [Introduction], <intro>)
  for l in data.letters {
    entry(text(font: display, size: 12pt, fill: ochre, number-type: "lining", l.week), l.title, label(l.id))
  }
}))

// ——— Introduction ———

#pagebreak(to: "odd")
#folio.update(true)
#opener(diamond(), [#heading(level: 1, outlined: false)[Introduction]<intro>], none, line: g.opener.intro)
#body(data.intro)
#metadata(none) <intro-end>

// ——— Corps ———

// Page de partie, toujours à droite : la première lettre s'ouvre donc sur la page paire suivante
#pagebreak(to: "odd", weak: true)
#metadata(none) <no-folio>
#metadata(none) <part>
#place(center + horizon, dx: mm((g.text.outside - g.text.inside) / 2), flush(align(center, {
  diamond(size: 7pt)
  v(9mm)
  text(font: display, size: 30pt, weight: 300)[Lettres]
  v(4mm)
  text(font: display, size: 13pt, style: "italic", fill: ink-light, data.span)
})))

#for (i, l) in data.letters.enumerate() {
  if l.at("filler", default: false) { interleaf(if i > 0 { data.letters.at(i - 1) }) }
  letter(l)
}

// BoD imprime un nombre pair de pages : si la dernière lettre finit sur une page de droite, sa
// photo de réserve, ou une page blanche (le cul-de-lampe a déjà fermé le texte), clôt le livre.
#if data.at("closing", default: false) {
  let last = data.letters.at(-1)
  if "spare" in last { photo-page(last.spare) } else { page(footer: none)[] }
}
