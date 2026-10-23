// Livre papier des lettres de Claire — 21 × 21 cm, couverture rigide, papier photo mat (BoD).
// Données : build/book.json, écrit par `npm run book` (scripts/book.ts). Mesures en mm depuis la coupe.

#let data = json("build/book.json")
#let g = data.geometry
#let mm(x) = x * 1mm

// À choisir avec Claire : titre, sous-titre, mentions
#let title = "La Parenthèse du dimanche soir"
#let subtitle = "Lettres d’Addis-Abeba"
#let author = "Claire Stellio"
#let year = "2026"

#let ink = rgb("#2C2218")
#let ink-light = rgb("#5A5048")
#let ochre = rgb("#8F5229")
#let gold = rgb("#C9A84C")
#let display = "Cormorant Garamond"

#let margins(m) = (
  inside: mm(g.bleed + m.inside),
  outside: mm(g.bleed + m.outside),
  top: mm(g.bleed + m.top),
  bottom: mm(g.bleed + m.bottom),
)

// Folio (numéro de page) : compté dès la première page, affiché à partir de l'introduction
#let folio = state("folio", false)

#set document(title: title, author: author)
#set page(
  width: mm(g.trim + 2 * g.bleed),
  height: mm(g.trim + 2 * g.bleed),
  margin: margins(g.text),
  binding: left,
  footer: context if folio.get() {
    let n = here().page()
    set text(font: display, size: 10pt, fill: ink-light, number-type: "lining")
    align(if calc.odd(n) { right } else { left }, str(n))
  },
)
#set text(
  font: ("EB Garamond", "Noto Serif Ethiopic", "Noto Emoji"),
  size: 11.5pt,
  fill: ink,
  lang: "fr",
  region: "FR",
  hyphenate: true,
  number-type: "old-style",
  costs: (widow: 100%, orphan: 100%),
)
#set par(justify: true, leading: 0.7em, spacing: 0.7em, first-line-indent: (amount: 1.3em, all: false))
#set strong(delta: 200)

// Losange du motif tibeb (comme l'icône du site)
#let diamond(size: 6pt) = box(height: size * 1.42, align(horizon, rotate(45deg, rect(
  width: size, height: size, fill: ochre, inset: 0pt,
  align(center + horizon, rect(width: size * 0.38, height: size * 0.38, fill: gold)),
))))

#let inl(nodes) = for n in nodes {
  if n.t == "text" { n.v } else if n.t == "em" { emph(inl(n.c)) } else if n.t == "strong" { strong(inl(n.c)) }
}

#let day(b) = block(above: 1.9em, below: 0.8em, sticky: true, {
  text(fill: ochre, tracking: 0.05em, smallcaps(b.name))
  if "date" in b { h(0.5em); text(style: "italic", fill: ink-light, b.date) }
  if "desc" in b { linebreak(); text(style: "italic", fill: ink-light, b.desc) }
})

#let body(blocks) = for b in blocks {
  if b.t == "p" { par(inl(b.c)) }
  else if b.t == "day" { day(b) }
  else if b.t == "break" { block(above: 1.6em, below: 1.6em, width: 100%, align(center, diamond())) }
  else if b.t == "sign" { block(above: 1em, align(right, text(font: "Sacramento", size: 24pt, fill: ink-light, b.v))) }
}

// Photo d'ouverture : pleine largeur, du haut de la page (fond perdu compris) à g.hero.height
#let hero(h) = context {
  let left-margin = if calc.odd(here().page()) { g.text.inside } else { g.text.outside }
  place(top + left, dx: -mm(g.bleed + left-margin), dy: -mm(g.bleed + g.text.top), box(
    width: mm(g.trim + 2 * g.bleed),
    height: mm(g.hero.height + g.bleed),
    clip: true,
    // Hauteur explicite : sinon Typst ramène l'image à la hauteur du cadre avant le décalage
    move(dx: mm(h.dx), dy: mm(h.dy), image(h.src, format: h.format, width: mm(h.w), height: mm(h.h))),
  ))
}

#let chapter-title(kicker, name, meta) = {
  text(font: display, size: 10.5pt, fill: ochre, tracking: 0.12em, kicker)
  v(2.5mm)
  name
  if meta != none { text(size: 9.5pt, style: "italic", fill: ink-light, meta) }
  v(9mm)
}

#show heading.where(level: 1): it => block(below: 3.5mm, text(
  font: display, size: 25pt, weight: 400, fill: ink, hyphenate: false, it.body,
))

#let photo-row(r) = block(breakable: false, width: 100%, align(center, stack(
  dir: ltr,
  spacing: mm(g.grid.gap),
  ..r.items.map(it => box(width: mm(it.w), {
    image(it.src, format: it.format, width: 100%, height: mm(r.h), fit: "cover")
    if "caption" in it {
      block(above: 1.5mm, par(justify: false, text(size: 7.5pt, style: "italic", fill: ink-light, hyphenate: false, it.caption)))
    }
  })),
)))

// BoD imprime un nombre pair de pages : si la dernière page de contenu (repère <book-end>) est
// un recto, un verso orné clôt le livre.
#let book-end = [#metadata(none) <book-end>]
#let closing = context if calc.odd(locate(<book-end>).page()) {
  pagebreak(weak: true)
  folio.update(false)
  align(center + horizon, diamond(size: 7pt))
}

#let letter(l, last: false) = {
  pagebreak(weak: true)
  let h = l.at("hero", default: none)
  if h != none { hero(h); v(mm(g.hero.height - g.text.top + 10)) } else { v(28mm) }
  chapter-title(
    [#text(font: "Noto Serif Ethiopic", size: 9pt)[ሳምንት] #l.week],
    [#heading(level: 1, l.title)#label(l.id)],
    [#l.dateLabel#if "location" in l [ · #l.location]],
  )
  body(l.blocks)
  if last and l.photoPages.len() == 0 { book-end }
  // Pages de photos : rangées réparties par scripts/book.ts, centrées verticalement
  if l.photoPages.len() > 0 {
    set page(margin: margins(g.photos))
    for (i, rows) in l.photoPages.enumerate() {
      if i > 0 { pagebreak() }
      block(width: 100%, height: 100%, {
        align(horizon, stack(spacing: mm(g.grid.rowGap), ..rows.map(photo-row)))
        if last and i == l.photoPages.len() - 1 { book-end }
      })
    }
  }
}

// ——— Pages liminaires (comptées, sans folio) ———

#let centered(content) = page(align(center + horizon, content))

#centered(text(font: display, size: 22pt, weight: 300, title))
#page[]
#centered({
  text(font: display, size: 30pt, weight: 300, title)
  v(4mm)
  text(font: display, size: 14pt, style: "italic", fill: ink-light, subtitle)
  v(14mm)
  diamond(size: 7pt)
  v(14mm)
  text(font: display, size: 13pt, tracking: 0.08em, author)
})
#page({
  set text(size: 8.5pt, fill: ink-light, number-type: "lining")
  set par(justify: false, first-line-indent: 0pt, spacing: 1.1em)
  align(bottom)[
    En application de l’art. L.137-2.-I. du code de la propriété intellectuelle, toute reproduction et/ou divulgation de parties de l’œuvre dépassant le volume prévu par la loi est expressément interdite.

    © #year, #author

    Édition : BoD · Books on Demand, 31 avenue Saint-Rémy, 57600 Forbach, bod\@bod.fr \
    Impression : Libri Plureos GmbH, Friedensallee 273, 22763 Hambourg (Allemagne)
  ]
})

// Sommaire
#page({
  v(18mm)
  text(font: display, size: 20pt, weight: 300)[Sommaire]
  v(8mm)
  set text(size: 10.5pt, number-type: "lining")
  context for l in data.letters {
    let loc = locate(label(l.id))
    block(above: 0.5em, below: 0.5em, grid(
      columns: (12mm, 1fr, auto),
      column-gutter: 2mm,
      text(font: display, fill: ochre, l.week),
      link(loc, l.title),
      str(loc.page()),
    ))
  }
})

// ——— Corps ———

#pagebreak(to: "odd")
#folio.update(true)
#v(28mm)
#chapter-title(diamond(), text(font: display, size: 25pt, weight: 400)[Introduction], none)
#body(data.intro)

#for (i, l) in data.letters.enumerate() { letter(l, last: i == data.letters.len() - 1) }
#closing
